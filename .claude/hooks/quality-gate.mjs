// Stop hook. If code files changed, runs typecheck, lint and tests and refuses to let the turn end
// until they pass. Claude Code ends the turn anyway after 8 blocks in a row (CLAUDE_CODE_STOP_HOOK_BLOCK_CAP).
// A passing run is remembered, so an unchanged working tree is not re-tested on every stop.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { git, readInput } from './lib/shell.mjs';

const CODE_FILE = /\.(?:ts|tsx|js|jsx|mjs|cjs)$/;
const IGNORED = /(^|\/)(node_modules|\.claude|docs|\.next|dist|build|coverage)\//;
const STEPS = ['typecheck', 'lint', 'test'];

const input = readInput();
const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
if (!existsSync(path.join(root, 'package.json'))) process.exit(0);

let status;
try {
  status = git(root, ['status', '--porcelain', '-z', '--untracked-files=all']);
} catch {
  process.exit(0); // not a git repository, so there is nothing to compare against
}

const changed = [];
const entries = status.split('\0').filter(Boolean);
for (let i = 0; i < entries.length; i += 1) {
  const code = entries[i].slice(0, 2);
  changed.push(entries[i].slice(3));
  if (code.includes('R') || code.includes('C')) i += 1; // the next entry is the old name
}
const codeFiles = changed.filter((f) => CODE_FILE.test(f) && !IGNORED.test(f)).sort();
if (codeFiles.length === 0) process.exit(0);

const fingerprint = createHash('sha1')
  .update(
    codeFiles
      .map((f) => {
        try {
          const s = statSync(path.join(root, f));
          return `${f}:${s.mtimeMs}:${s.size}`;
        } catch {
          return `${f}:deleted`;
        }
      })
      .join('\n'),
  )
  .digest('hex');
const stateFile = path.join(os.tmpdir(), `claude-quality-gate-${createHash('sha1').update(root).digest('hex')}.json`);
try {
  if (JSON.parse(readFileSync(stateFile, 'utf8')).fingerprint === fingerprint) process.exit(0);
} catch {
  // no earlier pass recorded
}

for (const step of STEPS) {
  try {
    execFileSync('npm', ['run', '--if-present', '--silent', step], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 280000,
      maxBuffer: 20 * 1024 * 1024,
      shell: process.platform === 'win32',
    });
  } catch (error) {
    const output = `${error.stdout ?? ''}${error.stderr ?? ''}`.trim().split('\n').slice(-40).join('\n');
    process.stdout.write(
      JSON.stringify({
        decision: 'block',
        reason:
          `Quality gate failed at "${step}" (code files changed: ${codeFiles.slice(0, 5).join(', ')}). ` +
          `Fix the cause, do not weaken the check, then finish.\n${output.slice(-3000)}`,
      }),
    );
    process.exit(0);
  }
}

try {
  writeFileSync(stateFile, JSON.stringify({ fingerprint }));
} catch {
  // not being able to cache only means the next stop runs the checks again
}
process.exit(0);
