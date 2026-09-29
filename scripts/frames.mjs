#!/usr/bin/env node
// Captures one interaction as a frame strip: a "before" frame, then evenly spaced frames across its motion.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { composeStrip } from './strip.mjs';

const USAGE = 'usage: frames.mjs --url <url> (--click <sel> | --hover <sel> | --eval <js>) [--frames 6] [--duration <ms>] '
  + '[--max 2000] [--clip <sel>] [--probe <sel>] [--reduced-motion] [--out <dir>] [--title <text>]';

export async function captureFrames({
  url, click, hover, evaluate, frames = 6, duration, maxMs = 2000, clip, probe,
  reducedMotion = false, outDir = join(tmpdir(), 'motion-frames', String(Date.now())),
  viewport = { width: 900, height: 600 }, title = '',
} = {}) {
  if (!url) throw new Error('url is required');
  if ([click, hover, evaluate].filter(Boolean).length !== 1) throw new Error('give exactly one of click, hover or evaluate');
  if (!Number.isInteger(frames) || frames < 2) throw new Error('frames must be a whole number, at least 2');
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
    await page.clock.install();
    await page.goto(url);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);

    const shots = [];
    const shoot = async t => {
      const name = t === null ? 'frame-00-before.png' : `frame-${String(shots.length).padStart(2, '0')}-${t}ms.png`;
      const file = join(outDir, name);
      const options = { path: file };
      if (clip) {
        options.clip = await page.locator(clip).boundingBox();
        if (!options.clip) throw new Error(`clip element not visible: ${clip}`);
      }
      await page.screenshot(options);
      const box = probe
        ? await page.locator(probe).evaluate(el => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height, opacity: Number(getComputedStyle(el).opacity) };
        })
        : undefined;
      shots.push({ file, t, probe: box });
    };

    await shoot(null);
    await trigger(page, { click, hover, evaluate });
    const found = await page.evaluate(() => {
      const anims = document.getAnimations();
      anims.forEach(a => a.pause());
      const ends = anims.map(a => a.effect.getComputedTiming().endTime);
      return {
        count: anims.length,
        infinite: ends.some(e => !Number.isFinite(e)),
        longest: Math.max(0, ...ends.filter(Number.isFinite)),
      };
    });
    const wanted = found.infinite ? Infinity : Math.max(found.longest, duration ?? 0);
    const span = Math.min(wanted, maxMs);
    if (span === 0) {
      await page.clock.runFor(100);
      await shoot(100);
    } else {
      let clockAt = 0;
      for (let i = 0; i < frames; i++) {
        const t = Math.round((span * i) / (frames - 1));
        await page.evaluate(ms => document.getAnimations().forEach(a => { if (a.playState === 'paused') a.currentTime = ms; }), t);
        if (t > clockAt) { await page.clock.runFor(t - clockAt); clockAt = t; }
        await shoot(t);
      }
    }
    const strip = await composeStrip(
      shots.map(s => ({ file: s.file, label: s.t === null ? 'before' : `${s.t} ms` })),
      join(outDir, 'strip.png'),
      { title },
    );
    return {
      frames: shots, strip, animations: found.count, endMs: span, capped: wanted > maxMs,
      note: span === 0 ? 'no animations found after the action' : undefined,
    };
  } finally {
    await browser.close();
  }
}

async function trigger(page, { click, hover, evaluate }) {
  if (evaluate) {
    await page.evaluate(code => { (0, eval)(code); }, evaluate);
    return;
  }
  const target = click ?? hover;
  const box = await page.locator(target).boundingBox();
  if (!box) throw new Error(`element not visible: ${target}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  if (hover) await page.mouse.move(x, y);
  else await page.mouse.click(x, y);
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--reduced-motion') a.reducedMotion = true;
    else if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[++i];
  }
  return a;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  const num = v => (v === undefined ? undefined : Number(v));
  captureFrames({
    url: a.url, click: a.click, hover: a.hover, evaluate: a.eval,
    frames: num(a.frames), duration: num(a.duration), maxMs: num(a.max),
    clip: a.clip, probe: a.probe, reducedMotion: a.reducedMotion, outDir: a.out, title: a.title,
  })
    .then(r => console.log(JSON.stringify({
      strip: r.strip, frames: r.frames.map(f => f.file), animations: r.animations, endMs: r.endMs, capped: r.capped, note: r.note,
    }, null, 2)))
    .catch(e => { console.error(`${e.message}\n${USAGE}`); process.exit(1); });
}
