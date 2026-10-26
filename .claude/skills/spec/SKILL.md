---
name: spec
description: Interviews the owner, then writes a numbered spec in docs/specs/ with the user outcome, one business metric (baseline and target), user stories, testable acceptance criteria, out of scope, data model changes, analytics events, flag-driven security and compliance items, and an end-to-end verification step. Use when the owner says "write a spec", "spec this feature", "turn this into requirements", "what does done look like for X" or "define the acceptance criteria". Refuses to finish without a metric and a verification step. Not for strategy (use discover) and not for the task list (use plan).
---

# Spec

Follow the Behaviour section of CLAUDE.md. Rule 1 is the opening step: state assumptions, list interpretations, ask before writing.

## Steps

1. Read `project.config.yaml`, `docs/strategy/` and existing `docs/specs/`. Pick the next number `NNN` (three digits).
2. Interview with the question tool, open questions first, one topic at a time:
   - Who is the user and what outcome do they get?
   - What business metric moves, from what baseline to what target, by when? If the owner has no baseline, write "baseline unknown" and add a task to measure it first.
   - What is explicitly out of scope?
   - What could go wrong?
   Play the understanding back in under 200 words and ask what is wrong before writing.
3. Write `docs/specs/NNN-name.md` with exactly these headings:
   1. **User outcome**: one sentence.
   2. **Business metric**: primary metric, baseline, target, date, how it is measured. Supporting metrics. Cost to serve.
   3. **User stories**: "As a ... I want ... so that ...".
   4. **Acceptance criteria**: numbered, each testable by a person or a test. No "works well".
   5. **Out of scope**.
   6. **Data model changes**: tables, columns, RLS policy per operation.
   7. **Analytics events**: name, when it fires, properties (no personal data).
   8. **Security and compliance items**: from the flags below.
   9. **End-to-end verification**: the exact steps and commands that prove the outcome in the running app.
   10. **Kill criteria** for this feature.
4. Flag-driven items for section 8, from `project.config.yaml`:
   - `handles_personal_data`: data map entry, lawful basis, retention, deletion path, DPIA needed? (`docs/compliance/`).
   - `handles_payments`: hosted checkout, webhook signature check, idempotency, refunds.
   - `handles_financial_data`: write "STOP: regulatory advice required before launch" and tell the owner.
   - `uses_ai_features`: success criteria, eval set, prompt file, fallback, per-user cap.
5. Check before finishing. Refuse to mark the spec ready if any of these are missing: a metric with a target, at least three testable criteria, an out-of-scope list, an end-to-end verification step. Say which one is missing and ask for it.
6. Stop and wait for the owner to approve the spec. Nothing is planned or built before that.

Finish with a summary of at most 10 lines and the next decision: approve the spec, then `/plan`.
