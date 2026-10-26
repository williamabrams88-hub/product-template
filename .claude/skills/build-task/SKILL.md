---
name: build-task
description: Implements exactly one planned task on a feature branch - tests first, small commits - then runs verify and writes a plain-English change summary. Use when the owner says "build task 3", "implement the next task", "start building", "do the next step" or "build it". Not for planning (use plan), for hunting a bug (use superpowers:systematic-debugging) or for opening the pull request (use ship).
---

# Build task

Follow the Behaviour section of CLAUDE.md. Every changed line must trace to the task.

## Before you start

1. An approved plan must exist in `docs/plans/`. Identify the task (the owner's number, or the first unfinished one). If the task is unclear, ask.
2. Never work on `main` or `master`. If you are on one, create `feat/NNN-short-name` from it. The hooks block pushes to main anyway.
3. Read the task, the spec criteria it covers, and the rules that match the files you will touch.

## Do the task

1. Load `superpowers:test-driven-development`. Write the failing test, run it, and read why it fails. Then write the minimum code to pass.
2. Match existing style. Do not refactor nearby code. Mention unrelated problems; do not fix them.
3. If the task adds or changes a component, a table or an external service, update the matching diagram in `docs/architecture.md` in the same commit.
4. Mark any deliberate shortcut as `// shortcut: <what was skipped and why, what changes if requirements grow>`.
5. Commit in small steps with conventional messages (`feat:`, `fix:`, `test:`, `docs:`, `chore:`). One task is one pull request. Do not push.
6. If something fails twice, stop guessing and load `superpowers:systematic-debugging`.

## Finish

1. Run `/verify` in full mode. Do not continue until it passes or you have told the owner what fails and why.
2. Write the change summary, in plain English:
   - **What changed**: files and behaviour, in a few lines.
   - **What could break**: honest risks.
   - **How it was verified**: the evidence block from `/verify`.
   - **Shortcuts**: every `// shortcut:` you added, or "none".
3. Update the task's checkbox in the plan.
4. Stop. Do not start the next task. Tell the owner the next step: run `/peer-review`, or `/build-task` for the next task.
