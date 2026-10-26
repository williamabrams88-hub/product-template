import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const hooksDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Runs a hook the way Claude Code does: tool JSON on stdin, exit code and output back.
export function runHook(name, input, env = {}) {
  const result = spawnSync('node', [path.join(hooksDir, name)], {
    input: JSON.stringify(input),
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

export function tempRepo(branch = 'main') {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'hook-test-'));
  const run = (...args) => execFileSync('git', ['-C', dir, ...args], { stdio: 'ignore' });
  run('init', '-q', '-b', branch);
  run('config', 'user.email', 'test@example.com');
  run('config', 'user.name', 'Test');
  writeFileSync(path.join(dir, 'README.md'), 'hello\n');
  run('add', '.');
  run('commit', '-q', '-m', 'init');
  return { dir, run };
}

export const bash = (command, cwd) => ({ tool_name: 'Bash', tool_input: { command }, cwd });
