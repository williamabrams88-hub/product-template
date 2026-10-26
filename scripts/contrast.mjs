// Computes WCAG 2.2 contrast ratios for the pairs in a design-tokens file and suggests fixes.
// Usage: node scripts/contrast.mjs docs/design/design-tokens.json
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const MINIMUM = { text: 4.5, large: 3, ui: 3 };

export function parseHex(value) {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(value).trim());
  if (!match) throw new Error(`Not a 3 or 6 digit hex colour: ${value}`);
  const hex = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}

export function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(fg, bg) {
  const [a, b] = [luminance(parseHex(fg)), luminance(parseHex(bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const toHex = (rgb) => `#${rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`;

// Moves the foreground colour towards black or white, whichever reaches the minimum with the smaller change.
export function suggest(fg, bg, minimum) {
  const start = parseHex(fg);
  for (const target of [0, 255]) {
    for (let step = 1; step <= 100; step += 1) {
      const mixed = start.map((c) => c + ((target - c) * step) / 100);
      const candidate = toHex(mixed);
      if (ratio(candidate, bg) >= minimum) return candidate;
    }
  }
  return null;
}

export function check(tokens) {
  const colors = tokens.colors ?? {};
  return (tokens.pairs ?? []).map((pair) => {
    const use = pair.use ?? 'text';
    const minimum = MINIMUM[use];
    if (!minimum) throw new Error(`Unknown use "${use}" (expected text, large or ui)`);
    if (!colors[pair.fg] || !colors[pair.bg]) throw new Error(`Unknown colour in pair ${pair.fg} on ${pair.bg}`);
    const value = ratio(colors[pair.fg], colors[pair.bg]);
    const pass = value >= minimum;
    return {
      fg: pair.fg,
      bg: pair.bg,
      use,
      ratio: Math.round(value * 100) / 100,
      minimum,
      pass,
      fix: pass ? null : suggest(colors[pair.fg], colors[pair.bg], minimum),
    };
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/contrast.mjs <design-tokens.json>');
    process.exit(2);
  }
  const rows = check(JSON.parse(readFileSync(file, 'utf8')));
  for (const r of rows) {
    const note = r.pass ? '' : `  -> try ${r.fix ?? 'a different background'} for "${r.fg}"`;
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.ratio}:1 (min ${r.minimum})  ${r.fg} on ${r.bg} [${r.use}]${note}`);
  }
  const failed = rows.filter((r) => !r.pass).length;
  console.log(`${rows.length - failed}/${rows.length} pairs pass WCAG 2.2 AA`);
  process.exit(failed ? 1 : 0);
}
