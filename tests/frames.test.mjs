import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { captureFrames } from '../scripts/frames.mjs';
import { stripFromDir } from '../scripts/strip.mjs';

const url = pathToFileURL(resolve('tests/fixtures/motion.html')).href;
const busy = pathToFileURL(resolve('tests/fixtures/busy.html')).href;
const outDir = () => mkdtempSync(join(tmpdir(), 'cx frames '));

async function pixel(file, x, y) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(file).href);
    return await page.evaluate(([px, py]) => {
      const img = document.querySelector('img');
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0);
      return [...g.getImageData(px, py, 1, 1).data];
    }, [x, y]);
  } finally {
    await browser.close();
  }
}

test('steps a CSS transition evenly from start to end', async () => {
  const r = await captureFrames({ url, click: '#go', frames: 5, probe: '#box', outDir: outDir() });
  assert.equal(r.animations, 1);
  assert.equal(r.endMs, 400);
  assert.equal(r.capped, false);
  assert.deepEqual(r.frames.map(f => f.t), [null, 0, 100, 200, 300, 400]);
  assert.deepEqual(r.frames.map(f => Math.round(f.probe.x)), [0, 0, 50, 100, 150, 200]);
  assert.ok(existsSync(r.strip));
  const again = await stripFromDir(dirname(r.strip), join(dirname(r.strip), 'again.png'));
  assert.ok(existsSync(again));
});

test('steps JS (requestAnimationFrame) motion with the fake clock', async () => {
  const r = await captureFrames({ url, click: '#js', duration: 400, frames: 5, probe: '#bar', outDir: outDir() });
  const widths = r.frames.slice(1).map(f => f.probe.width);
  [0, 50, 100, 150, 200].forEach((want, i) =>
    assert.ok(Math.abs(widths[i] - want) <= 8, `frame ${i}: width ${widths[i]}, want about ${want}`));
});

test('an instant change still gets a before and a 100 ms frame', async () => {
  const r = await captureFrames({ url, click: '#noop', outDir: outDir() });
  assert.equal(r.animations, 0);
  assert.deepEqual(r.frames.map(f => f.t), [null, 100]);
  assert.match(r.note, /no animations/);
});

test('an infinite animation is capped', async () => {
  const r = await captureFrames({ url, click: '#spinner', maxMs: 500, frames: 3, outDir: outDir() });
  assert.equal(r.capped, true);
  assert.equal(r.endMs, 500);
});

test('reduced motion is emulated', async () => {
  const r = await captureFrames({ url, click: '#go', probe: '#box', reducedMotion: true, outDir: outDir() });
  assert.equal(r.animations, 0);
  assert.equal(Math.round(r.frames.at(-1).probe.x), 200);
});

test('needs exactly one trigger', async () => {
  await assert.rejects(captureFrames({ url, outDir: outDir() }), /exactly one of click, hover or evaluate/);
});

test('animations already on the page are not the action', async () => {
  const r = await captureFrames({ url: busy, click: '#noop', outDir: outDir() });
  assert.equal(r.animations, 0);
  assert.deepEqual(r.frames.map(f => f.t), [null, 100]);
  assert.match(r.note, /no animations/);
});

test('an ambient infinite animation does not cap the real transition', async () => {
  const r = await captureFrames({ url: busy, click: '#sync', frames: 5, probe: '#b-sync', outDir: outDir() });
  assert.equal(r.animations, 1);
  assert.equal(r.capped, false);
  assert.equal(r.endMs, 400);
  assert.equal(Math.round(r.frames.at(-1).probe.x), 200);
});

for (const [how, trigger, box] of [['requestAnimationFrame', '#raf', '#b-raf'], ['setTimeout(0)', '#timeout', '#b-timeout']]) {
  test(`a transition started in ${how} is found and stepped`, async () => {
    const r = await captureFrames({ url: busy, click: trigger, frames: 5, probe: box, outDir: outDir() });
    assert.equal(r.animations, 1);
    const xs = r.frames.slice(1).map(f => f.probe.x);
    assert.ok(xs.every((x, i) => i === 0 || x >= xs[i - 1]), `moves forward: ${xs}`);
    assert.ok(xs[2] > 60 && xs[2] < 140, `about halfway at the middle frame: ${xs}`);
    assert.ok(Math.abs(xs.at(-1) - 200) <= 1, `ends at 200: ${xs}`);
  });
}

test('a target below the fold is scrolled into view first', async () => {
  const r = await captureFrames({ url: busy, click: '#far', frames: 3, probe: '#b-far', outDir: outDir() });
  assert.equal(r.animations, 1);
  assert.equal(Math.round(r.frames.at(-1).probe.x), 200);
});

test('a covered target is an error, not a silent miss', async () => {
  await assert.rejects(captureFrames({ url: busy, click: '#covered', outDir: outDir() }), /isn't under the pointer/);
});

test('motion shorter than a frame (a reduced-motion .01ms reset) is treated as instant', async () => {
  const r = await captureFrames({ url: busy, click: '#quick-go', probe: '#quick', reducedMotion: true, outDir: outDir() });
  assert.deepEqual(r.frames.map(f => f.t), [null, 100]);
  assert.equal(Math.round(r.frames.at(-1).probe.x), 200);
  assert.match(r.note, /shorter than a frame|no animations/); // a 10 µs transition can finish before it's collected
});

test('each frame shows the seeked state, not the state before the seek', async () => {
  for (let run = 0; run < 3; run++) {
    const r = await captureFrames({ url, click: '#go', frames: 2, probe: '#box', outDir: outDir() });
    const zero = r.frames[1];
    const y = Math.round(zero.probe.y + zero.probe.height / 2);
    const [, green] = await pixel(zero.file, 45, y);
    assert.ok(green > 200, `run ${run}: pixel just right of the start box is box-coloured (green ${green}), so the 0 ms frame shows motion`);
  }
});

test('a clip on a moving element is measured once, so the motion shows', async () => {
  const r = await captureFrames({ url, click: '#go', frames: 3, clip: '#box', outDir: outDir() });
  assert.ok(!readFileSync(r.frames[1].file).equals(readFileSync(r.frames.at(-1).file)), 'first and last crops differ');
});
