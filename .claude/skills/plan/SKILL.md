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
2. Before the tasks, write the architecture in `docs/architecture.md` (the file already holds a skeleton). It needs four Mermaid diagrams: system context, components and data flow, data model (an `erDiagram` matching the spec's data model changes), and trust boundaries. Show only what the spec and the flags in `project.config.yaml` need. If `docs/architecture.md` already describes the product, change only the parts this plan alters. Do not mark the plan ready without it.
3. Each task must:
   - be small enough for one session,
   - name the files it touches,
   - start with a failing test (or say why a test is not possible),
   - end with a verification command and the output that means it passed,
   - link to the spec criterion it satisfies.
4. Order tasks so the app works after each one. Put the riskiest or least certain task first.
5. Apply Behaviour rule 2 to the plan: no task for a feature the spec does not ask for, no new dependency unless the simplicity ladder fails (say which rung).
6. Record each architecture decision as `docs/decisions/NNN-title.md` with: context, options considered, decision, consequences, and the part of `docs/architecture.md` it changes. Add one line to `docs/decisions.md`.
7. Self-review: every acceptance criterion maps to a task; every task maps to a criterion; flag-driven items from the spec have tasks; every table in the spec appears in the data model diagram.
8. Show the owner the diagrams and the plan in plain English and wait for approval of both.

Finish with a summary of at most 10 lines and the next decision: approve the plan, then `/build-task 1`.
