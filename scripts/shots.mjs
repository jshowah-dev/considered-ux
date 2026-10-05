#!/usr/bin/env node
// Captures a still of each page, per colour scheme: what the frame strips can't show (layout, copy, hierarchy).
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { launchChromium, parseViewport } from './strip.mjs';

const USAGE = 'usage: shots.mjs --urls <url,url,...> [--viewport 1280x800] [--schemes light,dark] [--wait 800] [--full] [--out <dir>]';

// One readable file name per page and scheme: host, port and the route, e.g. localhost-4748-week-light.png.
export function shotName(url, scheme) {
  const u = new URL(url);
  const route = (u.protocol === 'file:' ? u.pathname.split('/').pop().replace(/\.[a-z]+$/i, '') : `${u.host}${u.pathname}${u.hash}`)
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${route}-${scheme}.png`;
}

export async function captureShots({
  urls, outDir = join(tmpdir(), 'ux-shots', String(Date.now())), viewport = { width: 1280, height: 800 },
  schemes = ['light'], settleMs = 800, fullPage = false,
} = {}) {
  if (!Array.isArray(urls) || !urls.length) throw new Error('urls is required');
  mkdirSync(outDir, { recursive: true });
  const browser = await launchChromium({});
  const shots = [];
  try {
    for (const scheme of schemes) {
      const page = await (await browser.newContext({ viewport, colorScheme: scheme })).newPage();
      for (const url of urls) {
        await page.goto(url);
        await page.waitForLoadState('networkidle').catch(() => {});
        await page.waitForTimeout(settleMs);
        const file = join(outDir, shotName(url, scheme));
        await page.screenshot({ path: file, fullPage });
        shots.push({ url, scheme, file });
      }
    }
  } finally {
    await browser.close();
  }
  return shots;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--full') a.full = true;
    else if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[++i];
  }
  return a;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  captureShots({
    urls: a.urls?.split(','), outDir: a.out, viewport: parseViewport(a.viewport),
    schemes: a.schemes?.split(','), settleMs: a.wait === undefined ? undefined : Number(a.wait), fullPage: a.full,
  })
    .then(r => console.log(JSON.stringify(r.map(s => s.file), null, 2)))
    .catch(e => { console.error(`${e.message}\n${USAGE}`); process.exit(1); });
}
