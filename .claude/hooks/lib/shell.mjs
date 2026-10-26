// Shared helpers for the hook scripts. No dependencies; behaves the same under bash and PowerShell.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const PROTECTED_BRANCHES = ['main', 'master'];

export function readInput() {
  try {
    return JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    return {};
  }
}

// Options that take a separate value and can sit between `git` and its subcommand.
const GIT_OPTIONS_WITH_VALUE = new Set(['-C', '-c', '--git-dir', '--work-tree', '--namespace', '--exec-path']);

// Finds every `git <subcommand> ...` in a shell command line. Quotes and brackets are
// stripped so `sh -c "git push"` and `$(git push)` are still seen. This over-detects
// slightly (a commit message that says "git push" counts); that errs on the safe side.
export function gitCalls(command) {
  const calls = [];
  const segments = String(command ?? '').split(/&&|\|\||;|\||&|\r?\n/);
  for (const segment of segments) {
    const tokens = segment.replace(/[()`'"$]/g, ' ').split(/\s+/).filter(Boolean);
    tokens.forEach((token, i) => {
      if (path.basename(token).replace(/\.exe$/i, '') !== 'git') return;
      let j = i + 1;
      let dir = null;
      while (j < tokens.length && tokens[j].startsWith('-')) {
        if (tokens[j] === '-C') dir = tokens[j + 1] ?? null;
        j += GIT_OPTIONS_WITH_VALUE.has(tokens[j]) ? 2 : 1;
      }
      const rest = tokens.slice(j + 1);
      const next = rest.findIndex((t) => path.basename(t) === 'git');
      calls.push({ sub: tokens[j] ?? '', args: next === -1 ? rest : rest.slice(0, next), dir });
    });
  }
  return calls;
}

export function repoDir(cwd, call) {
  return call?.dir ? path.resolve(cwd, call.dir) : cwd;
}

export function git(dir, args) {
  return execFileSync('git', ['-C', dir, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
    timeout: 8000,
    maxBuffer: 20 * 1024 * 1024,
  });
}

export function currentBranch(dir) {
  try {
    return git(dir, ['rev-parse', '--abbrev-ref', 'HEAD']).trim();
  } catch {
    return null;
  }
}

export function block(reason) {
  process.stderr.write(`${reason}\n`);
  process.exit(2);
}
