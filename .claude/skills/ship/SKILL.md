---
name: ship
description: Opens a pull request for the current feature branch using the pull request template, after checking that verify, peer-review and the security gate have passed. It never merges and never deploys. Only the owner starts it.
disable-model-invocation: true
---

# Ship

This skill opens a pull request. It never merges, never deploys and never touches production.

## Preconditions (check each, stop if one fails)

1. Not on `main` or `master`. Working tree clean (or the owner has said what to do with the rest).
2. `/verify` full mode passed in this session.
3. `/peer-review` verdict "ready" in this session.
4. `/gate-security` result "pass" in this session.
5. From `project.config.yaml`:
   - `handles_financial_data: true`: STOP. Say "Take professional regulatory advice before launch" and do not open the pull request.
   - `uses_ai_features: true`: eval results are attached or linked.
   - `handles_personal_data: true`: `docs/compliance/data-map.md` is up to date and the DPIA decision is recorded.
6. A remote exists and the owner has approved remote actions for this project. If there is no remote, stop and say so.

## Steps

1. Push the feature branch: `git push -u origin <branch>`. The hook blocks main and forced pushes.
2. Open the pull request with `gh pr create`, filling `.github/pull_request_template.md`:
   - **What**: plain English.
   - **Why**: the spec and the metric it moves.
   - **Evidence**: the `/verify` block, the reviewer verdict, the security result.
   - **Risks**: what could break.
   - **Rollback**: how to undo (revert commit, feature flag, migration down step).
3. Both `git push` to a feature branch and `gh pr create` may need an approval prompt. That is expected.

## Finish

Print the pull request URL and the exact next step for the owner:

1. Open the pull request on GitHub and read the plain-English summary.
2. Wait for the required checks to go green.
3. If you are happy, merge it yourself with the merge button. Claude will not.

Then suggest `/retro` after the merge.
