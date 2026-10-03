import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const json = f => JSON.parse(readFileSync(f, 'utf8'));
const pkg = json('package.json');

test('the repo is its own marketplace, listing itself as the one plugin', () => {
  const plugin = json('.claude-plugin/plugin.json');
  const market = json('.claude-plugin/marketplace.json');
  assert.equal(plugin.name, 'considered-ux');
  assert.equal(market.name, 'considered-ux');
  assert.deepEqual(market.plugins.map(p => [p.name, p.source]), [['considered-ux', './']]);
});

test('the lockfile lets Claude Code install the dependencies on plugin install', () => {
  const lock = json('package-lock.json');
  assert.ok([2, 3].includes(lock.lockfileVersion), 'lockfileVersion 2 or 3');
  assert.deepEqual(lock.packages[''].dependencies, pkg.dependencies, 'lockfile and package.json list the same dependencies');
  assert.equal(pkg.overrides, undefined, 'overrides block the automatic install');
});

test('no instruction hard-codes the clone location; SKILL.md resolves its own folder', () => {
  const docs = ['SKILL.md', 'references/stacks.md', 'references/editor-pass.md', 'references/craft.md', 'references/zombie-tells.md'];
  for (const f of docs) assert.doesNotMatch(readFileSync(f, 'utf8'), /~\/\.claude\/skills/, f);
  assert.match(readFileSync('SKILL.md', 'utf8'), /\$\{CLAUDE_SKILL_DIR\}/);
});

test('every <skill>/ path in the references exists', () => {
  for (const f of ['references/stacks.md', 'references/editor-pass.md']) {
    for (const [, p] of readFileSync(f, 'utf8').matchAll(/<skill>\/([\w./-]+\.(?:mjs|ps1|md|json))/g)) assert.ok(existsSync(p), `${f}: ${p}`);
  }
});

test('no work kit is tracked, so none can ship in the plugin', () => {
  const tracked = execFileSync('git', ['ls-files', 'kits'], { encoding: 'utf8' }).split('\n');
  assert.deepEqual(tracked.filter(f => /^kits\/work/.test(f)), []);
});
