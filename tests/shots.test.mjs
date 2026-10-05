import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { captureShots, shotName } from '../scripts/shots.mjs';
import { captureFrames } from '../scripts/frames.mjs';
import { parseViewport } from '../scripts/strip.mjs';
import { chromium } from 'playwright';

const url = pathToFileURL(resolve('tests/fixtures/motion.html')).href;
const outDir = () => mkdtempSync(join(tmpdir(), 'cx shots '));

async function size(file) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(file).href);
    return await page.evaluate(() => { const i = document.querySelector('img'); return [i.naturalWidth, i.naturalHeight]; });
  } finally { await browser.close(); }
}

test('parseViewport reads WxH and rejects anything else', () => {
  assert.deepEqual(parseViewport('1280x800'), { width: 1280, height: 800 });
  assert.equal(parseViewport(undefined), undefined);
  assert.throws(() => parseViewport('wide'), /WIDTHxHEIGHT/);
});

test('shotName: one readable file name per page and scheme', () => {
  assert.equal(shotName('http://localhost:4748/#/week', 'light'), 'localhost-4748-week-light.png');
  assert.equal(shotName('http://localhost:4748/#/', 'dark'), 'localhost-4748-dark.png');
  assert.equal(shotName('file:///C:/a/b/motion.html', 'light'), 'motion-light.png');
});

test('captureShots writes one PNG per page and colour scheme at the asked viewport', async () => {
  const dir = outDir();
  const r = await captureShots({ urls: [url], outDir: dir, schemes: ['light', 'dark'], viewport: { width: 640, height: 400 }, settleMs: 50 });
  assert.equal(r.length, 2);
  for (const s of r) assert.ok(existsSync(s.file));
  assert.deepEqual(await size(r[0].file), [640, 400]);
});

test('captureShots needs a page to shoot', async () => {
  await assert.rejects(captureShots({ urls: [] }), /urls/);
});

test('frames take a viewport', async () => {
  const r = await captureFrames({ url, click: '#noop', outDir: outDir(), viewport: { width: 700, height: 500 } });
  assert.ok(existsSync(r.strip));
});
