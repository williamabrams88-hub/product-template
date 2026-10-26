---
name: retro
description: After a pull request is merged, reviews what went wrong and right, compares the outcome with the spec's metric target, and proposes at most three changes to CLAUDE.md or the skills, for the owner to approve. Only the owner starts it.
disable-model-invocation: true
---

# Retro

Run after a merge. Base everything on evidence from this project, not on general advice.

1. Gather: the merged pull request and its review, the spec and its metric, `git log` for the branch, failures seen (hook blocks, failing checks, reviewer findings, rework).
2. Outcome check: compare the spec's metric target with what is known now. If it is too early or unmeasured, say so and add a dated follow-up to `docs/decisions.md`.
3. Find real mistakes: where did work need redoing, which check caught something late, what did the owner have to correct.
4. Propose at most **three** changes. Each names the file to change (CLAUDE.md, a rule, or a skill), the exact edit, and the mistake it prevents. No change without a real incident behind it.
5. Check the Behaviour success test and report on it: fewer unnecessary lines in diffs, fewer over-engineering rewrites, questions asked before work rather than after mistakes.
6. Look for stale rules: any line in CLAUDE.md or `.claude/rules/` that no longer applies. Propose pruning it.
7. Wait for the owner to approve each change. Apply only the approved ones, then log them in `docs/decisions.md`.

Finish with a summary of at most 10 lines.
