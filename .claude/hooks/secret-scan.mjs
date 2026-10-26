// PreToolUse on Bash. Before `git commit`, scans the lines being committed for common secret shapes.
// Reports the file and the kind of secret, never the value.
import { block, git, gitCalls, readInput, repoDir } from './lib/shell.mjs';

const PATTERNS = [
  ['AWS access key id', /\bAKIA[0-9A-Z]{16}\b/],
  ['private key block', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI-style API key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}/],
  ['Stripe live key', /\b[rs]k_live_[0-9A-Za-z]{16,}/],
  ['Slack token', /\bxox[abprs]-[0-9A-Za-z-]{10,}/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['JSON web token', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  [
    'hard-coded credential',
    /\b(?:secret|password|passwd|api[_-]?key|access[_-]?token|auth[_-]?token)\b\s*[:=]\s*['"](?![^'"]*(?:example|your[_-]|xxx|changeme|placeholder|<|\$\{))[^'"\s]{16,}['"]/i,
  ],
];
const SECRET_FILE = /(?:^|\/)(?:\.env(?:\.(?!example$|sample$|template$)[^/]+)?|id_rsa|id_ed25519|[^/]+\.(?:pem|p12|pfx))$/;

const input = readInput();
if (input.tool_name !== 'Bash') process.exit(0);

const command = input.tool_input?.command ?? '';
const cwd = input.cwd || process.cwd();
const calls = gitCalls(command);
const commits = calls.filter((c) => c.sub === 'commit');
if (commits.length === 0) process.exit(0);

// This hook runs before the command, so files staged by the same command are not in the index yet.
if (calls.some((c) => c.sub === 'add')) {
  block('Blocked by secret-scan. Run `git add` and `git commit` as separate commands so the staged files can be scanned. Nothing was committed.');
}

const findings = [];
for (const commit of commits) {
  const dir = repoDir(cwd, commit);
  const includesTracked = commit.args.some((a) => a === '--all' || /^-[a-zA-Z]*a[a-zA-Z]*$/.test(a));
  let diff = '';
  let names = '';
  try {
    names = git(dir, includesTracked ? ['diff', 'HEAD', '--name-only'] : ['diff', '--cached', '--name-only']);
    diff = git(dir, includesTracked ? ['diff', 'HEAD', '-U0', '--no-color'] : ['diff', '--cached', '-U0', '--no-color']);
  } catch {
    try {
      names = git(dir, ['diff', '--cached', '--name-only']);
      diff = git(dir, ['diff', '--cached', '-U0', '--no-color']);
    } catch {
      continue; // not a repository, so git commit will fail by itself
    }
  }
  for (const name of names.split('\n').filter(Boolean)) {
    if (SECRET_FILE.test(name)) findings.push(`${name}: file type that normally holds secrets`);
  }
  let file = '';
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line.slice(4).replace(/^b\//, '');
    } else if (line.startsWith('+')) {
      for (const [label, pattern] of PATTERNS) {
        if (pattern.test(line)) findings.push(`${file}: looks like a ${label}`);
      }
    }
  }
}

if (findings.length > 0) {
  const unique = [...new Set(findings)];
  block(
    `Blocked by secret-scan. Nothing was committed. Found:\n- ${unique.join('\n- ')}\n` +
      'Remove the value, keep it in an environment variable, and rotate it if it was ever real.',
  );
}
process.exit(0);
