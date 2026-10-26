import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { runHook, tempRepo } from './helpers.mjs';

function project(testScript) {
  const repo = tempRepo('feature/x');
  writeFileSync(
    path.join(repo.dir, 'package.json'),
    JSON.stringify({ scripts: { typecheck: 'node -e 0', lint: 'node -e 0', test: testScript } }),
  );
  writeFileSync(path.join(repo.dir, 'a.ts'), 'export const a = 1;\n');
  return repo.dir;
}
const stop = (dir) => ({ hook_event_name: 'Stop', stop_hook_active: false, cwd: dir });
const env = (dir) => ({ CLAUDE_PROJECT_DIR: dir });

test('blocks the turn from ending when a unit test fails', () => {
  const dir = project('node -e "console.error(\'1 test failed\'); process.exit(1)"');
  const r = runHook('quality-gate.mjs', stop(dir), env(dir));
  assert.equal(r.code, 0);
  const decision = JSON.parse(r.stdout);
  assert.equal(decision.decision, 'block');
  assert.match(decision.reason, /failed at "test"/);
  assert.match(decision.reason, /1 test failed/);
});

test('lets the turn end when checks pass, and remembers the pass', () => {
  const dir = project('node -e 0');
  assert.equal(runHook('quality-gate.mjs', stop(dir), env(dir)).stdout, '');
  // Break the test script without touching a code file: the remembered pass must be reused.
  writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ scripts: { test: 'node -e "process.exit(1)"' } }));
  assert.equal(runHook('quality-gate.mjs', stop(dir), env(dir)).stdout, '');
});

test('does nothing when no code file changed or there is no package.json', () => {
  const repo = tempRepo('feature/x');
  writeFileSync(path.join(repo.dir, 'package.json'), JSON.stringify({ scripts: { test: 'exit 1' } }));
  repo.run('add', '.');
  repo.run('commit', '-q', '-m', 'add package');
  assert.equal(runHook('quality-gate.mjs', stop(repo.dir), env(repo.dir)).stdout, '');
  const bare = tempRepo('feature/y');
  assert.equal(runHook('quality-gate.mjs', stop(bare.dir), env(bare.dir)).stdout, '');
});
