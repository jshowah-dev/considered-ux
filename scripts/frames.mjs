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
  // Compositor-run animations (transform, opacity) keep their own clock, so a seek wouldn't reach the pixels: run them on the main thread.
  const browser = await chromium.launch({ args: ['--disable-threaded-animation'] });
  try {
    const page = await browser.newPage({ viewport, reducedMotion: reducedMotion ? 'reduce' : 'no-preference' });
    await page.clock.install();
    await page.goto(url);
    await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
    if (click || hover) await page.locator(click ?? hover).scrollIntoViewIfNeeded({ timeout: 5000 });
    // Animations already on the page (a filled entrance, an ambient pulse) aren't the action's: freeze them and leave them out.
    await page.evaluate(() => {
      window.__frames = { before: new Set(document.getAnimations()), seen: new Map() };
      window.__frames.before.forEach(a => a.pause());
    });
    // Measured once, before the action, so a clip on the moving element shows it move.
    const clipBox = clip ? await page.locator(clip).boundingBox() : undefined;
    if (clip && !clipBox) throw new Error(`clip element not visible: ${clip}`);

    let clockAt = 0;
    // Pauses each animation the action started and records the clock time it first appeared.
    const collect = () => page.evaluate(at => {
      const { before, seen } = window.__frames;
      for (const a of document.getAnimations()) {
        if (!before.has(a) && !seen.has(a)) { a.pause(); seen.set(a, at); }
      }
      const ends = [...seen].map(([a, start]) => start + a.effect.getComputedTiming().endTime);
      return {
        count: seen.size,
        infinite: ends.some(e => !Number.isFinite(e)),
        longest: Math.max(0, ...ends.filter(Number.isFinite)),
      };
    }, clockAt);
    // Steps the fake clock a frame at a time, so motion started a frame or two late is caught as it starts.
    const advance = async to => {
      while (clockAt < to) {
        const step = Math.min(16, to - clockAt);
        await page.clock.runFor(step);
        clockAt += step;
        await collect();
      }
    };
    // Seeks each tracked animation to its own time at t, then forces style.
    const seek = t => page.evaluate(ms => {
      for (const [a, start] of window.__frames.seen) {
        a.currentTime = Math.min(Math.max(0, ms - start), a.effect.getComputedTiming().endTime);
      }
      document.documentElement.getBoundingClientRect();
    }, t);

    const shots = [];
    const shoot = async t => {
      const name = t === null ? 'frame-00-before.png' : `frame-${String(shots.length).padStart(2, '0')}-${t}ms.png`;
      const file = join(outDir, name);
      await page.screenshot(clipBox ? { path: file, clip: clipBox } : { path: file });
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
    let found = await collect();
    if (found.count === 0 && duration === undefined) {
      await advance(100);
      found = await collect();
    }
    const wanted = found.infinite ? Infinity : Math.max(found.longest, duration ?? 0);
    const span = Math.min(wanted, maxMs);
    let note;
    if (span < 16) {
      // Nothing moved, or the motion is shorter than a frame (a reduced-motion .01ms reset): show where it lands.
      await advance(100);
      await seek(100);
      await shoot(100);
      note = found.count === 0
        ? 'no animations started within 100 ms of the action'
        : `motion shorter than a frame (${found.longest} ms) shown as instant`;
    } else {
      for (let i = 0; i < frames; i++) {
        const t = Math.round((span * i) / (frames - 1));
        await advance(t);
        await seek(t);
        await shoot(t);
      }
    }
    const strip = await composeStrip(
      shots.map(s => ({ file: s.file, label: s.t === null ? 'before' : `${s.t} ms` })),
      join(outDir, 'strip.png'),
      { title },
    );
    return {
      frames: shots, strip, animations: found.count, endMs: span < 16 ? 0 : span, capped: wanted > maxMs, note,
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
  const locator = page.locator(target);
  const box = await locator.boundingBox();
  if (!box) throw new Error(`element not visible: ${target}`);
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const onTop = await locator.evaluate((el, [px, py]) => {
    const hit = document.elementFromPoint(px, py);
    if (hit && (hit === el || el.contains(hit))) return null;
    return hit ? `${hit.tagName.toLowerCase()}${hit.id ? `#${hit.id}` : ''}` : 'nothing';
  }, [x, y]);
  if (onTop) throw new Error(`${target} isn't under the pointer (${onTop} is on top of it)`);
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
