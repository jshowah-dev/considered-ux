#!/usr/bin/env node
// Emits motion tokens (kits/<family>.tokens.json) as plain code for a repo.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HEADER_MARK = 'Generated from the design kit';
const HEADER = `${HEADER_MARK}; edit the kit, not this file.`;
const GROUPS = ['duration', 'easing', 'distance', 'scale', 'focus'];
const NAME = /^[a-z][a-zA-Z0-9]*$/;

export function validateTokens(t) {
  if (t === null || typeof t !== 'object' || Array.isArray(t)) return ['tokens must be a JSON object'];
  const errors = [];
  for (const group of Object.keys(t)) {
    if (!GROUPS.includes(group)) errors.push(`unknown group "${group}" (allowed: ${GROUPS.join(', ')})`);
  }
  for (const group of GROUPS) {
    const g = t[group];
    if (g === undefined) continue;
    if (g === null || typeof g !== 'object' || Array.isArray(g)) { errors.push(`${group} must be an object`); continue; }
    for (const [name, v] of Object.entries(g)) {
      const at = `${group}.${name}`;
      if (!NAME.test(name)) errors.push(`${at}: names are camelCase letters and digits`);
      if (group === 'easing') {
        const ok = Array.isArray(v) && v.length === 4 && v.every(Number.isFinite)
          && v[0] >= 0 && v[0] <= 1 && v[2] >= 0 && v[2] <= 1;
        if (!ok) errors.push(`${at}: easing is [x1, y1, x2, y2] with x1 and x2 between 0 and 1`);
      } else if (group === 'duration') {
        if (!Number.isInteger(v) || v <= 0) errors.push(`${at}: duration is a positive whole number of milliseconds`);
      } else if (group === 'focus') {
        if (!Number.isFinite(v) || v < 0) errors.push(`${at}: focus values are pixels, 0 or more`);
      } else if (!Number.isFinite(v) || v <= 0) {
        errors.push(`${at}: must be a positive number`);
      }
    }
  }
  return errors;
}

const kebab = s => s.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`);
const upper = s => s.replace(/[A-Z]/g, c => `_${c}`).toUpperCase();
const bezier = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
const f32 = n => (Number.isInteger(n) ? `${n}.0` : `${n}`);
const varName = (group, name) => (group === 'focus' ? `focus-${kebab(name)}` : `motion-${group}-${kebab(name)}`);

function cssValue(group, v) {
  if (group === 'duration') return `${v}ms`;
  if (group === 'easing') return bezier(v);
  if (group === 'distance' || group === 'focus') return `${v}px`;
  return `${v}`;
}

const entries = t => GROUPS.flatMap(group => Object.entries(t[group] ?? {}).map(([name, v]) => ({ group, name, v })));

export function emit(tokens, target) {
  const errors = validateTokens(tokens);
  if (errors.length) throw new Error(`Invalid tokens:\n- ${errors.join('\n- ')}`);
  const list = entries(tokens);
  switch (target) {
    case 'css':
      return `/* ${HEADER} */\n:root {\n${list.map(e => `  --${varName(e.group, e.name)}: ${cssValue(e.group, e.v)};`).join('\n')}\n}\n`;
    case 'scss':
      return `// ${HEADER}\n${list.map(e => `$${varName(e.group, e.name)}: ${cssValue(e.group, e.v)};`).join('\n')}\n`;
    case 'ts': {
      const block = (group, fmt) => (tokens[group]
        ? `  ${group}: { ${Object.entries(tokens[group]).map(([n, v]) => `${n}: ${fmt(v)}`).join(', ')} },\n`
        : '');
      const motion = block('duration', v => v) + block('easing', v => `'${bezier(v)}'`) + block('distance', v => v) + block('scale', v => v);
      const focus = tokens.focus
        ? `export const focus = { ${Object.entries(tokens.focus).map(([n, v]) => `${n}: ${v}`).join(', ')} } as const;\n`
        : '';
      return `// ${HEADER}\nexport const motion = {\n${motion}} as const;\n${focus}`;
    }
    case 'rust': {
      const mod = (group, line) => (tokens[group]
        ? `pub mod ${group} {\n${Object.entries(tokens[group]).map(([n, v]) => line(upper(n), v)).join('\n')}\n}\n`
        : '');
      return `//! ${HEADER}\n`
        + mod('duration', (n, v) => `    pub const ${n}: std::time::Duration = std::time::Duration::from_millis(${v});`)
        + mod('easing', (n, v) => `    pub const ${n}: [f32; 4] = [${v.map(f32).join(', ')}];`)
        + mod('distance', (n, v) => `    pub const ${n}_PX: f32 = ${f32(v)};`)
        + mod('scale', (n, v) => `    pub const ${n}: f32 = ${f32(v)};`)
        + mod('focus', (n, v) => `    pub const ${n}_PX: f32 = ${f32(v)};`)
        + '\n/// Debug builds only: MOTION_TIME_SCALE=10 slows every duration tenfold so motion can be recorded.\n'
        + 'pub fn scaled(d: std::time::Duration) -> std::time::Duration {\n'
        + '    if cfg!(debug_assertions) {\n'
        + '        if let Some(s) = std::env::var("MOTION_TIME_SCALE").ok().and_then(|v| v.parse::<f32>().ok()).filter(|s| *s > 0.0) {\n'
        + '            return d.mul_f32(s);\n'
        + '        }\n'
        + '    }\n'
        + '    d\n'
        + '}\n';
    }
    default:
      throw new Error(`Unknown target "${target}" (use css, scss, ts or rust)`);
  }
}

export function writeEmitted(outFile, text, { force = false } = {}) {
  const out = resolve(outFile);
  if (existsSync(out) && !force && !readFileSync(out, 'utf8').includes(HEADER_MARK)) {
    throw new Error(`${out} was not generated from the kit; refusing to overwrite it (use --force)`);
  }
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, text);
  return out;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--force') a.force = true;
    else if (argv[i].startsWith('--')) a[argv[i].slice(2)] = argv[++i];
  }
  return a;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const a = parseArgs(process.argv.slice(2));
  try {
    if (!a.tokens || !a.target) {
      throw new Error('usage: emit-tokens.mjs --tokens <file.json> --target css|scss|ts|rust [--out <file>] [--force]');
    }
    const text = emit(JSON.parse(readFileSync(a.tokens, 'utf8')), a.target);
    if (a.out) console.log(`wrote ${writeEmitted(a.out, text, { force: a.force })}`);
    else process.stdout.write(text);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
