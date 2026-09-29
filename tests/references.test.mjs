import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = f => readFileSync(`references/${f}`, 'utf8');
const has = (md, list) => list.forEach(s => assert.ok(md.includes(s), `missing: ${s}`));

test('zombie tells: a table of at least 9 tells and the two-question check', () => {
  const md = read('zombie-tells.md');
  assert.ok(md.split('\n').filter(l => /^\| [^-|]/.test(l)).length >= 10);
  has(md, ['any similar app', "Does it express one of the kit's beliefs"]);
});

test('editor pass: journey walk, reduced motion, isolated critic, and the fallback', () => {
  has(read('editor-pass.md'), ['Walk the journey', '--reduced-motion', 'Never include your reasoning', 'critic-request.md']);
});

test('stacks: every emit target, adopt mode and recording', () => {
  has(read('stacks.md'), ['--target css', '--target ts', '--target scss', '--target rust', 'Adopt mode', 'frames.mjs', 'egui']);
});

test('craft: grounding, grammar and the carved moment', () => {
  has(read('craft.md'), ['material', 'Exits run faster', 'interruptible', 'Reduced motion', 'The carved moment']);
});
