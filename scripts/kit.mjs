#!/usr/bin/env node
// Reads and checks design kits (<family>.md) and maps a repo folder to its family.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const DIALS = ['restrained', 'moment', 'full'];
export const TOKEN_MODES = ['write', 'adopt'];
const KITS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'kits');
// User kits live outside the skill folder so a plugin update can't overwrite them.
export const USER_KITS_DIR = join(homedir(), '.claude', 'considered-ux', 'kits');

export function parseKit(md) {
  const m = md.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error('a kit starts with --- frontmatter ---');
  const meta = YAML.parse(m[1]) ?? {};
  const sections = {};
  let current = null;
  for (const line of m[2].split('\n')) {
    const h = line.match(/^# (.+)$/);
    if (h) { current = h[1].trim(); sections[current] = []; continue; }
    if (current) sections[current].push(line);
  }
  const beliefs = (sections['What we believe'] ?? [])
    .map(l => l.match(/^\d+\.\s+\*\*(.+?)\*\*/)).filter(Boolean).map(x => x[1]);
  const rules = [];
  for (const line of sections.Rules ?? []) {
    const h = line.match(/^## (.+)$/);
    if (h) { rules.push({ name: h[1].trim() }); continue; }
    const f = line.match(/^- \*\*(What|Why|Feel):\*\*\s*(.+)$/);
    if (f && rules.length) rules[rules.length - 1][f[1].toLowerCase()] = f[2].trim();
  }
  const products = (sections.Products ?? [])
    .map(l => l.match(/^- \*\*(.+?):\*\*\s*(.+)$/)).filter(Boolean).map(x => ({ product: x[1], belief: x[2] }));
  const ledger = (sections.Ledger ?? []).filter(l => l.startsWith('|')).slice(2)
    .map(l => l.split('|').slice(1, -1).map(c => c.trim()));
  return { family: meta.family, repos: meta.repos ?? {}, tokens: meta.tokens, beliefs, rules, products, ledger };
}

export function validateKit(kit) {
  const errors = [];
  if (typeof kit.family !== 'string' || !/^[a-z][a-z0-9-]*$/.test(kit.family)) errors.push('family must be lowercase letters, digits and hyphens');
  if (!TOKEN_MODES.includes(kit.tokens)) errors.push(`tokens must be one of ${TOKEN_MODES.join(', ')}`);
  for (const [repo, dial] of Object.entries(kit.repos)) {
    if (!DIALS.includes(dial)) errors.push(`repo ${repo}: dial must be one of ${DIALS.join(', ')}`);
  }
  if (kit.beliefs.length < 1 || kit.beliefs.length > 3) errors.push('What we believe needs 1–3 numbered, bold beliefs');
  for (const r of kit.rules) {
    for (const f of ['what', 'why', 'feel']) if (!r[f]) errors.push(`rule "${r.name}" is missing ${f[0].toUpperCase()}${f.slice(1)}`);
    const b = r.why?.match(/^Belief (\d+)\b/);
    if (r.why && (!b || Number(b[1]) < 1 || Number(b[1]) > kit.beliefs.length)) {
      errors.push(`rule "${r.name}": Why must start with "Belief N" naming one of the ${kit.beliefs.length} beliefs`);
    }
  }
  for (const row of kit.ledger) if (row.length !== 6) errors.push(`ledger row "${row.join(' | ')}" needs 6 cells`);
  return errors;
}

export function familyFor(repo, kitsDirs = [USER_KITS_DIR, KITS_DIR]) {
  // The first folder with a match wins, so a user kit overrides a bundled one.
  for (const kitsDir of [kitsDirs].flat().filter(d => existsSync(d))) {
    const hits = [];
    for (const f of readdirSync(kitsDir).filter(n => n.endsWith('.md') && !n.startsWith('_')).sort()) {
      const kit = parseKit(readFileSync(join(kitsDir, f), 'utf8'));
      if (Object.hasOwn(kit.repos, repo)) {
        hits.push({ family: kit.family, dial: kit.repos[repo], tokens: kit.tokens, file: join(kitsDir, f), tokensFile: join(kitsDir, `${kit.family}.tokens.json`) });
      }
    }
    if (hits.length > 1) throw new Error(`${repo} is listed in more than one kit: ${hits.map(h => h.family).join(', ')}`);
    if (hits.length) return hits[0];
  }
  return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [flag, value, kitsFlag, kitsDir] = process.argv.slice(2);
  try {
    if (flag === '--check' && value) {
      const errors = validateKit(parseKit(readFileSync(value, 'utf8')));
      if (errors.length) { console.error(`${basename(value)}:\n- ${errors.join('\n- ')}`); process.exit(1); }
      console.log(`${basename(value)}: ok`);
    } else if (flag === '--family-for' && value) {
      console.log(JSON.stringify(kitsFlag === '--kits' ? familyFor(value, kitsDir) : familyFor(value)));
    } else {
      throw new Error('usage: kit.mjs --check <kit.md> | --family-for <repo-folder-name> [--kits <dir>]');
    }
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
