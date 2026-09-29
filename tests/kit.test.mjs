import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseKit, validateKit, familyFor } from '../scripts/kit.mjs';
import { validateTokens } from '../scripts/emit-tokens.mjs';

const jeff = () => readFileSync('kits/jeff.md', 'utf8');

test('the jeff kit parses and validates', () => {
  const kit = parseKit(jeff());
  assert.deepEqual(validateKit(kit), []);
  assert.equal(kit.family, 'jeff');
  assert.equal(kit.tokens, 'write');
  assert.equal(kit.beliefs.length, 3);
  assert.equal(kit.rules.length, 9);
  assert.equal(kit.repos['freight-quote-demo'], 'moment');
  assert.deepEqual(kit.products.map(p => p.product), ['daily-planner', 'freight-quote-demo']);
  assert.deepEqual(kit.ledger, []);
});

test('the jeff tokens validate and keep the harvested values', () => {
  const t = JSON.parse(readFileSync('kits/jeff.tokens.json', 'utf8'));
  assert.deepEqual(validateTokens(t), []);
  assert.equal(t.duration.hover, 150);
  assert.equal(t.duration.bump, 350);
  assert.equal(t.scale.bump, 1.4);
  assert.ok(t.duration.exit < t.duration.enter, 'exits run faster than entrances');
});

test('a Why that names a missing belief is an error', () => {
  const bad = jeff().replace('- **Why:** Belief 1', '- **Why:** Belief 7');
  assert.match(validateKit(parseKit(bad)).join('\n'), /Why must start with "Belief N"/);
});

test('a bad dial is an error', () => {
  const bad = jeff().replace('murmur: full', 'murmur: loud');
  assert.match(validateKit(parseKit(bad)).join('\n'), /dial must be one of/);
});

test('the template parses; only its placeholder family fails', () => {
  assert.deepEqual(validateKit(parseKit(readFileSync('kits/_template.md', 'utf8'))),
    ['family must be lowercase letters, digits and hyphens']);
});

test('familyFor finds the family, returns null for unknown repos, and rejects duplicates', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cx kits '));
  copyFileSync('kits/jeff.md', join(dir, 'jeff.md'));
  assert.equal(familyFor('murmur', dir).dial, 'full');
  assert.equal(familyFor('someone-elses-app', dir), null);
  assert.equal(familyFor('toString', dir), null);
  writeFileSync(join(dir, 'other.md'), jeff().replace('family: jeff', 'family: other'));
  assert.throws(() => familyFor('murmur', dir), /more than one kit: jeff, other/);
});
