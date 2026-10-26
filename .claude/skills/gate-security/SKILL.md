---
name: gate-security
description: Runs the security checklist selected by the flags in project.config.yaml, the bundled /security-review, a dependency audit and the read-only security-reviewer subagent, then reports pass or fail with evidence. Use when the owner says "security check", "is this safe to ship", "run the security gate", "check for secrets" or before ship. Not for general code review (use peer-review).
---

# Gate: security

1. Read `project.config.yaml`. The flags decide which checks run.
2. Always run and record the output:
   - `npm audit --omit=dev` (fail on high or critical).
   - A search of the diff for secrets and `.env` files (the `secret-scan` hook only checks at commit time).
   - Authorisation first in every changed protected route; input validated at every changed boundary; service-role key server-side only.
   - For `supabase/` changes: RLS enabled on every exposed table, one policy per operation, and `supabase test db` run locally.
3. Run the bundled `/security-review` on the branch. If you cannot start it yourself, ask the owner to type `/security-review` and wait for the result.
4. Flag-driven checks:
   - `handles_personal_data`: data map is current, logs hold no personal data, deletion path exists, privacy notice and DPIA status recorded.
   - `handles_payments`: hosted checkout only, webhook signature verified before the body is read, idempotency keys, refund and dispute notes.
   - `handles_financial_data`: STOP. Tell the owner to take professional regulatory advice before launch. This is a hard stop for `/ship`.
   - `uses_ai_features`: OWASP Top 10 for LLM Applications (2025) reviewed, eval suite exists and passes, prompts are versioned files, fallback for timeout, malformed output and refusal, per-user cap and provider spend alert.
5. Write the diff to `$TMPDIR/security.diff` and start the `security-reviewer` agent with the diff path and the contents of `project.config.yaml`.
6. Report a table: check, result (pass, fail, not verifiable), evidence. Fix failures with `/build-task` rules, then re-run.

Finish with one line: "Security gate: pass" or "Security gate: fail". A fail blocks `/ship`. Next step for the owner: `/ship`.
