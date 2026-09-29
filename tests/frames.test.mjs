import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { captureFrames } from '../scripts/frames.mjs';
import { stripFromDir } from '../scripts/strip.mjs';

const url = pathToFileURL(resolve('tests/fixtures/motion.html')).href;
const outDir = () => mkdtempSync(join(tmpdir(), 'cx frames '));

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
