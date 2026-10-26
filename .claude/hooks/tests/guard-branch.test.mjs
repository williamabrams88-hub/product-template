import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bash, runHook, tempRepo } from './helpers.mjs';

const main = tempRepo('main');
const feature = tempRepo('feature/login');

test('blocks a plain push while on main', () => {
  const r = runHook('guard-branch.mjs', bash('git push', main.dir));
  assert.equal(r.code, 2);
  assert.match(r.stderr, /current branch is main/);
});

test('blocks pushing to main from a feature branch', () => {
  for (const command of ['git push origin main', 'git push origin HEAD:main', 'git push origin HEAD:refs/heads/master']) {
    assert.equal(runHook('guard-branch.mjs', bash(command, feature.dir)).code, 2, command);
  }
});

test('blocks forced pushes in every spelling', () => {
  for (const command of [
    'git push --force origin feature/login',
    'git push -f origin feature/login',
    'git push origin feature/login --force-with-lease',
    'git push origin +feature/login',
  ]) {
    assert.equal(runHook('guard-branch.mjs', bash(command, feature.dir)).code, 2, command);
  }
});

test('blocks pushes hidden behind -C, sh -c and switch', () => {
  assert.equal(runHook('guard-branch.mjs', bash(`git -C ${main.dir} push`, feature.dir)).code, 2);
  assert.equal(runHook('guard-branch.mjs', bash('sh -c "git push origin main"', feature.dir)).code, 2);
  assert.equal(runHook('guard-branch.mjs', bash('git switch main && git push', feature.dir)).code, 2);
});

test('allows a normal push from a feature branch', () => {
  const r = runHook('guard-branch.mjs', bash('git push -u origin feature/login', feature.dir));
  assert.equal(r.code, 0);
});

test('ignores commands that are not pushes and other tools', () => {
  assert.equal(runHook('guard-branch.mjs', bash('git status', main.dir)).code, 0);
  assert.equal(runHook('guard-branch.mjs', bash('echo push to main', main.dir)).code, 0);
  assert.equal(runHook('guard-branch.mjs', { tool_name: 'Read', tool_input: { file_path: '/x' } }).code, 0);
});
