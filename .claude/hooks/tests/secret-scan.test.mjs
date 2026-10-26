import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { bash, runHook, tempRepo } from './helpers.mjs';

// Fake secrets are assembled at run time so this file never contains a literal that the scanner would flag.
const fakeAwsKey = `AKIA${'IOSFODNN7EXAMPLE'}`;
const fakeKeyHeader = `-----BEGIN ${'RSA PRIVATE KEY'}-----`;
const fakeAnthropic = `sk-ant-${'a1b2c3d4e5f6a7b8c9d0e1'}`;

function stage(name, content) {
  const repo = tempRepo('feature/x');
  writeFileSync(path.join(repo.dir, name), content);
  repo.run('add', name);
  return repo;
}

test('blocks a commit containing an AWS key and does not print the key', () => {
  const repo = stage('config.ts', `export const key = '${fakeAwsKey}';\n`);
  const r = runHook('secret-scan.mjs', bash('git commit -m "add config"', repo.dir));
  assert.equal(r.code, 2);
  assert.match(r.stderr, /AWS access key id/);
  assert.ok(!r.stderr.includes(fakeAwsKey));
});

test('blocks private keys, Anthropic keys and .env files', () => {
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m x', stage('k.txt', `${fakeKeyHeader}\n`).dir)).code, 2);
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m x', stage('a.txt', `${fakeAnthropic}\n`).dir)).code, 2);
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m x', stage('.env', 'PORT=3000\n').dir)).code, 2);
});

test('blocks with commit -a when the secret is in a tracked, unstaged file', () => {
  const repo = tempRepo('feature/x');
  writeFileSync(path.join(repo.dir, 'README.md'), `token = '${fakeAwsKey}'\n`);
  assert.equal(runHook('secret-scan.mjs', bash('git commit -am "notes"', repo.dir)).code, 2);
});

test('allows clean commits, example env files and placeholders', () => {
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m ok', stage('a.ts', 'export const a = 1;\n').dir)).code, 0);
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m ok', stage('.env.example', 'API_KEY=\n').dir)).code, 0);
  const placeholder = stage('c.ts', 'const password = "your-password-here-please";\n');
  assert.equal(runHook('secret-scan.mjs', bash('git commit -m ok', placeholder.dir)).code, 0);
});

test('ignores commands that are not commits', () => {
  const repo = stage('config.ts', `export const key = '${fakeAwsKey}';\n`);
  assert.equal(runHook('secret-scan.mjs', bash('git status', repo.dir)).code, 0);
});
