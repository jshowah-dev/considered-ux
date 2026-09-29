import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import YAML from 'yaml';

const md = readFileSync('SKILL.md', 'utf8').replace(/\r\n/g, '\n');
const [, front, body] = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const meta = YAML.parse(front);

test('frontmatter follows the skill rules', () => {
  assert.equal(meta.name, 'considered-ux');
  assert.match(meta.description, /^Use when /);
  assert.ok(meta.description.length <= 1024);
  assert.doesNotMatch(meta.description, /\b(I|we|my|our)\b/, 'third person');
  assert.doesNotMatch(meta.description, /belief|direction|frame|critic|ledger|kit/i, 'no workflow summary');
});

test('body stays at or under 500 words', () => {
  assert.ok(body.split(/\s+/).filter(Boolean).length <= 500);
});

test('every file the skill points to exists', () => {
  for (const f of body.match(/(references|scripts|kits)\/[\w.-]+\.(md|mjs|json)/g)) assert.ok(existsSync(f), f);
});

test('gate, sizes, dial, floor and red flags are present', () => {
  for (const s of ['Beliefs gate', 'Touch', 'Feature', 'Audit', 'restrained', 'moment', 'full', 'Floor', 'Red flags']) {
    assert.ok(body.includes(s), s);
  }
});
