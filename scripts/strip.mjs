#!/usr/bin/env node
// Lays frames side by side in one PNG so a whole interaction reads at a glance.
import { chromium } from 'playwright';
import { readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function explainLaunchError(e) {
  if (!/Executable doesn't exist/.test(e.message)) return e;
  // Run the skill's own Playwright so the browser matches the pinned version.
  const cli = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'node_modules', 'playwright', 'cli.js');
  return new Error(`Chromium isn't installed. Install it once (about 150 MB) with: node "${cli}" install chromium`);
}

// "1280x800" -> { width, height }; undefined stays undefined so callers keep their default.
export function parseViewport(v) {
  if (v === undefined) return undefined;
  const m = /^(\d{2,5})x(\d{2,5})$/.exec(String(v));
  if (!m) throw new Error('viewport must be WIDTHxHEIGHT, e.g. 1280x800');
  return { width: Number(m[1]), height: Number(m[2]) };
}

export async function launchChromium(options) {
  try { return await chromium.launch(options); } catch (e) { throw explainLaunchError(e); }
}

export async function composeStrip(frames, outFile, { title = '' } = {}) {
  if (!frames.length) throw new Error('no frames to compose');
  const out = resolve(outFile);
  mkdirSync(dirname(out), { recursive: true });
  const cells = frames
    .map(f => `<figure><img src="${pathToFileURL(f.file).href}"><figcaption>${esc(f.label)}</figcaption></figure>`)
    .join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:12px;font:12px system-ui;background:#fff;color:#111}
h1{font-size:13px;margin:0 0 8px}.row{display:flex;gap:8px;align-items:flex-start}
figure{margin:0}img{display:block;max-width:320px;border:1px solid #ccc}figcaption{margin-top:4px;text-align:center}
</style>${title ? `<h1>${esc(title)}</h1>` : ''}<div class="row">${cells}</div>`;
  const htmlFile = `${out.replace(/\.png$/i, '')}.html`;
  writeFileSync(htmlFile, html);
  const browser = await launchChromium();
  try {
    const page = await browser.newPage({ viewport: { width: Math.min(frames.length * 330 + 24, 4000), height: 200 } });
    await page.goto(pathToFileURL(htmlFile).href);
    await page.screenshot({ path: out, fullPage: true });
  } finally {
    await browser.close();
  }
  return out;
}

export async function stripFromDir(dir, outFile, options = {}) {
  const out = resolve(outFile);
  const files = readdirSync(dir)
    .filter(f => /\.png$/i.test(f) && f !== 'strip.png')
    .map(f => resolve(dir, f))
    .filter(f => f !== out)
    .sort();
  if (!files.length) throw new Error(`no .png frames in ${dir}`);
  return composeStrip(files.map(f => ({ file: f, label: basename(f, '.png') })), out, options);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const get = k => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const dir = get('dir');
  const out = get('out');
  if (!dir || !out) {
    console.error('usage: strip.mjs --dir <frames dir> --out <strip.png> [--title <text>]');
    process.exit(1);
  }
  stripFromDir(dir, out, { title: get('title') ?? '' })
    .then(p => console.log(p))
    .catch(e => { console.error(e.message); process.exit(1); });
}
