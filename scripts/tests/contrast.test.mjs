import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, ratio, suggest } from '../contrast.mjs';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'contrast.mjs');

test('black on white is 21:1 and white on white is 1:1', () => {
  assert.equal(Math.round(ratio('#000000', '#ffffff') * 100) / 100, 21);
  assert.equal(ratio('#fff', '#ffffff'), 1);
});

test('matches a known WCAG reference value (#767676 on white is 4.54:1)', () => {
  assert.equal(Math.round(ratio('#767676', '#ffffff') * 100) / 100, 4.54);
});

test('fails light grey text and suggests a passing colour', () => {
  const [row] = check({ colors: { fg: '#aaaaaa', bg: '#ffffff' }, pairs: [{ fg: 'fg', bg: 'bg', use: 'text' }] });
  assert.equal(row.pass, false);
  assert.ok(ratio(row.fix, '#ffffff') >= 4.5);
  assert.ok(suggest('#aaaaaa', '#ffffff', 4.5));
});

test('large text and UI parts only need 3:1', () => {
  const rows = check({
    colors: { fg: '#949494', bg: '#ffffff' },
    pairs: [
      { fg: 'fg', bg: 'bg', use: 'text' },
      { fg: 'fg', bg: 'bg', use: 'large' },
    ],
  });
  assert.deepEqual(rows.map((r) => r.pass), [false, true]);
});

test('rejects bad colours and unknown names', () => {
  assert.throws(() => ratio('red', '#fff'), /hex colour/);
  assert.throws(() => check({ colors: { a: '#000' }, pairs: [{ fg: 'a', bg: 'missing' }] }), /Unknown colour/);
});

test('command line exits 1 when any pair fails and 0 when all pass', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'contrast-'));
  const write = (name, data) => {
    const file = path.join(dir, name);
    writeFileSync(file, JSON.stringify(data));
    return file;
  };
  const bad = write('bad.json', { colors: { a: '#cccccc', b: '#ffffff' }, pairs: [{ fg: 'a', bg: 'b' }] });
  const good = write('good.json', { colors: { a: '#111111', b: '#ffffff' }, pairs: [{ fg: 'a', bg: 'b' }] });
  assert.equal(spawnSync('node', [script, bad]).status, 1);
  assert.equal(spawnSync('node', [script, good]).status, 0);
});
