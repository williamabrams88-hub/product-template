---
name: plan
description: Turns an approved spec into small tasks, each sized for one session with its own test and verification, and records architecture decisions as ADRs. Use when the owner says "plan this", "break this down", "make a task list", "how should we build this" or "what are the steps". Wraps superpowers:writing-plans. Not for writing the spec (use spec) and not for building (use build-task).
---

# Plan

## Before you start

- A spec in `docs/specs/` must exist and the owner must have approved it. If not, stop and say so.
- Use Sonnet. Use a more capable model only if `/model` lists it for this plan and the owner approves it for this task.

## Steps

1. Load `superpowers:writing-plans` and follow it, with these overrides from CLAUDE.md:
   - Save the plan to `docs/plans/NNN-name.md` (same number as the spec), not `docs/superpowers/`.
   - In the plan header, replace the "REQUIRED SUB-SKILL" line with: `Build each task with /build-task, in this session, in order.`
   - Skip the execution-method question. Execution is inline.
2. Each task must:
   - be small enough for one session,
   - name the files it touches,
   - start with a failing test (or say why a test is not possible),
   - end with a verification command and the output that means it passed,
   - link to the spec criterion it satisfies.
3. Order tasks so the app works after each one. Put the riskiest or least certain task first.
4. Apply Behaviour rule 2 to the plan: no task for a feature the spec does not ask for, no new dependency unless the simplicity ladder fails (say which rung).
5. Record each architecture decision as `docs/decisions/NNN-title.md` with: context, options considered, decision, consequences. Add one line to `docs/decisions.md`.
6. Self-review: every acceptance criterion maps to a task; every task maps to a criterion; flag-driven items from the spec have tasks.
7. Show the owner the plan in plain English and wait for approval.

Finish with a summary of at most 10 lines and the next decision: approve the plan, then `/build-task 1`.
