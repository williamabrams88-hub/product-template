import assert from 'node:assert/strict';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { runHook } from './helpers.mjs';

// A project with fake prettier and eslint binaries that record what they were asked to do.
function project({ eslintExit = 0 } = {}) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'fl-test-'));
  writeFileSync(path.join(dir, 'package.json'), '{}');
  mkdirSync(path.join(dir, 'node_modules', '.bin'), { recursive: true });
  for (const [name, exit] of [['prettier', 0], ['eslint', eslintExit]]) {
    const bin = path.join(dir, 'node_modules', '.bin', name);
    writeFileSync(
      bin,
      `#!/usr/bin/env node\nrequire('fs').appendFileSync(${JSON.stringify(path.join(dir, `${name}.log`))}, process.argv.slice(2).join(' ') + '\\n');\n` +
        (exit ? `console.error('1 problem found'); process.exit(${exit});\n` : ''),
    );
    chmodSync(bin, 0o755);
  }
  return dir;
}

const edit = (file) => ({ tool_name: 'Edit', tool_input: { file_path: file } });

test('formats and lints the changed TypeScript file only', () => {
  const dir = project();
  const file = path.join(dir, 'src', 'a.ts');
  const r = runHook('format-and-lint.mjs', edit(file), { CLAUDE_PROJECT_DIR: dir });
  assert.equal(r.code, 0);
  assert.ok(existsSync(path.join(dir, 'prettier.log')));
  assert.ok(existsSync(path.join(dir, 'eslint.log')));
});

test('does not run eslint on markdown', () => {
  const dir = project();
  runHook('format-and-lint.mjs', edit(path.join(dir, 'README.md')), { CLAUDE_PROJECT_DIR: dir });
  assert.ok(existsSync(path.join(dir, 'prettier.log')));
  assert.ok(!existsSync(path.join(dir, 'eslint.log')));
});

test('exits 2 with the linter output when eslint reports a problem', () => {
  const dir = project({ eslintExit: 1 });
  const r = runHook('format-and-lint.mjs', edit(path.join(dir, 'a.ts')), { CLAUDE_PROJECT_DIR: dir });
  assert.equal(r.code, 2);
  assert.match(r.stderr, /1 problem found/);
});

test('does nothing outside the project, inside node_modules, or without package.json', () => {
  const dir = project();
  assert.equal(runHook('format-and-lint.mjs', edit('/etc/hosts'), { CLAUDE_PROJECT_DIR: dir }).code, 0);
  assert.equal(
    runHook('format-and-lint.mjs', edit(path.join(dir, 'node_modules', 'x', 'i.js')), { CLAUDE_PROJECT_DIR: dir }).code,
    0,
  );
  const bare = mkdtempSync(path.join(os.tmpdir(), 'fl-bare-'));
  assert.equal(runHook('format-and-lint.mjs', edit(path.join(bare, 'a.ts')), { CLAUDE_PROJECT_DIR: bare }).code, 0);
  assert.ok(!existsSync(path.join(dir, 'prettier.log')));
});
