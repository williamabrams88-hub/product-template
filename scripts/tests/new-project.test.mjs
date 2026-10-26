import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'new-project.sh');
const run = (args, parent) =>
  spawnSync('bash', [script, ...args], {
    encoding: 'utf8',
    env: { ...process.env, NEW_PROJECT_PARENT: parent },
  });

test('dry run creates a complete, specialised local project and commits it', () => {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'np-'));
  const result = run(['demo', '--dry-run', '--skip-scaffold'], parent);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const dir = path.join(parent, 'demo');

  const claude = readFileSync(path.join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(claude.startsWith('# demo'));
  assert.ok(!claude.includes('{{'), 'placeholders must be filled');
  assert.match(claude, /`npm run typecheck`/);
  assert.match(readFileSync(path.join(dir, 'project.config.yaml'), 'utf8'), /^is_template: false/m);

  for (const file of ['.claude/settings.json', '.claude/hooks/guard-branch.mjs', '.github/workflows/ci.yml', 'docs/decisions.md']) {
    assert.ok(existsSync(path.join(dir, file)), `${file} should exist`);
  }
  assert.ok(!existsSync(path.join(dir, 'BOOTSTRAP.md')));
  assert.ok(!existsSync(path.join(dir, 'docs/file-plan.md')));

  const log = spawnSync('git', ['-C', dir, 'log', '--oneline'], { encoding: 'utf8' });
  assert.match(log.stdout, /create demo from product template/);
});

test('refuses an existing folder and a bad name', () => {
  const parent = mkdtempSync(path.join(os.tmpdir(), 'np-'));
  assert.equal(run(['demo', '--skip-scaffold'], parent).status, 0);
  assert.notEqual(run(['demo', '--skip-scaffold'], parent).status, 0);
  assert.notEqual(run(['Bad Name'], parent).status, 0);
});
