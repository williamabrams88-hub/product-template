---
name: peer-review
description: Runs the read-only reviewer subagent in a fresh context on the current branch's diff and the spec, and reports correctness problems, security issues, spec gaps and Behaviour-rule breaches. Use when the owner says "review this", "peer review", "second opinion on the changes", "check this against the spec" or after verify passes. Not for style or formatting, and not for the security gate (use gate-security).
---

# Peer review

1. Confirm `/verify` passed in this session. If not, run it first.
2. Find the base: `git merge-base main HEAD` (use `master` if that is the default branch). Write the diff to a file in `$TMPDIR`:
   `git diff <base>...HEAD > "$TMPDIR/review.diff"`
3. Find the spec and the plan task for this branch in `docs/specs/` and `docs/plans/`.
4. Start the `reviewer` agent. Give it only: the path to the diff, the path to the spec, the path to `docs/architecture.md`, and the task text. Do not paste your own opinion of the change, and do not name a different model.
5. Read its report. For each finding decide: fix it, or explain why not. Blocking findings must be fixed or the owner must accept them knowingly.
6. Fix with `/build-task` rules: test first, minimal change, re-run `/verify`.
7. Report to the owner in plain English:
   - what the reviewer found (blocking and advisory),
   - what you changed,
   - what you left and why,
   - the reviewer's verdict.

The reviewer checks for changed lines that do not trace to the spec, new dependencies, abstractions with one caller, unmarked shortcuts, and unrequested refactors. These are Behaviour rules 2 and 3 in CLAUDE.md.

Next step for the owner: `/gate-security`.
