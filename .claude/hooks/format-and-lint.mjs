// PostToolUse on Edit, Write and MultiEdit. Formats and lints the one changed file.
// Silent when the project has no package.json or the tools are not installed yet.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { readInput } from './lib/shell.mjs';

const input = readInput();
const file = input.tool_input?.file_path;
if (!file) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const relative = path.relative(root, file);
if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0);
if (/(^|[\\/])(node_modules|\.git|\.claude|\.next)[\\/]/.test(relative)) process.exit(0);
if (!existsSync(path.join(root, 'package.json'))) process.exit(0);

const extension = path.extname(file).toLowerCase();
const formattable = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css', '.md', '.yaml', '.yml'];
const lintable = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

const bin = (name) => {
  const base = path.join(root, 'node_modules', '.bin', name);
  const candidate = process.platform === 'win32' ? `${base}.cmd` : base;
  return existsSync(candidate) ? candidate : null;
};

const run = (tool, args) => {
  try {
    execFileSync(tool, args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 50000,
      shell: process.platform === 'win32',
    });
    return null;
  } catch (error) {
    return `${error.stdout ?? ''}${error.stderr ?? ''}`.trim() || String(error.message);
  }
};

const problems = [];
const prettier = bin('prettier');
if (prettier && formattable.includes(extension)) {
  const result = run(prettier, ['--write', '--log-level', 'warn', file]);
  if (result) problems.push(`prettier:\n${result}`);
}
const eslint = bin('eslint');
if (eslint && lintable.includes(extension)) {
  const result = run(eslint, ['--fix', file]);
  if (result) problems.push(`eslint:\n${result}`);
}

if (problems.length > 0) {
  process.stderr.write(`Fix these before moving on (${relative}):\n${problems.join('\n\n').slice(0, 3000)}\n`);
  process.exit(2);
}
process.exit(0);
