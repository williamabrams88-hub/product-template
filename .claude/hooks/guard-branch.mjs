// PreToolUse on Bash. Blocks git pushes that could change main or master, and forced pushes.
import { PROTECTED_BRANCHES, block, currentBranch, gitCalls, readInput, repoDir } from './lib/shell.mjs';

const input = readInput();
if (input.tool_name !== 'Bash') process.exit(0);

const command = input.tool_input?.command ?? '';
const cwd = input.cwd || process.cwd();
const calls = gitCalls(command);
const pushes = calls.filter((c) => c.sub === 'push');
if (pushes.length === 0) process.exit(0);

// `git switch main && git push` pushes main although the branch is a feature branch right now.
const switchesToProtected = calls.some(
  (c) => ['checkout', 'switch'].includes(c.sub) && c.args.some((a) => PROTECTED_BRANCHES.includes(a)),
);

const isForce = (arg) => /^--force/.test(arg) || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(arg) || arg.startsWith('+');
const targetsProtected = (arg) => {
  if (arg.startsWith('-')) return false;
  const dest = arg.replace(/^\+/, '').split(':').pop().replace(/^refs\/heads\//, '');
  return PROTECTED_BRANCHES.includes(dest);
};

for (const push of pushes) {
  const branch = currentBranch(repoDir(cwd, push));
  const reasons = [];
  if (push.args.some(isForce)) reasons.push('forced pushes are not allowed');
  if (push.args.some((a) => ['--all', '--mirror'].includes(a))) reasons.push('--all and --mirror push every branch');
  if (push.args.some(targetsProtected)) reasons.push('the push names main or master');
  if (PROTECTED_BRANCHES.includes(branch)) reasons.push(`the current branch is ${branch}`);
  if (switchesToProtected) reasons.push('the command switches to main or master before pushing');
  if (reasons.length > 0) {
    block(
      `Blocked by guard-branch: ${reasons.join('; ')}. Work on a feature branch and open a pull request. ` +
        'Only the owner merges to main.',
    );
  }
}
process.exit(0);
