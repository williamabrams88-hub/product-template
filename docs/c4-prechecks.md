# Checks before any remote action (checkpoint C4)

Checked on 26 October 2026 against official documentation. Nothing remote has been created or changed.

## (a) GitHub secret scanning and push protection on your private repositories

Source: docs.github.com, "About secret scanning" and "About push protection".

- Secret scanning is free for public repositories.
- For private repositories it needs GitHub Secret Protection, and only on organisation-owned repositories on GitHub Team or Enterprise Cloud. Personal (user-owned) private repositories are covered only on Enterprise Cloud with Enterprise Managed Users.
- Push protection "for users" is on by default but only stops you pushing secrets to public repositories.

In plain English: if the project repository is private and sits under your personal account `williamabrams88-hub`, GitHub will not scan it for secrets or block pushes. So the plan is the local `secret-scan` hook (already built and tested) plus a gitleaks step in CI.

Gitleaks vetting (same policy as the skills):

| Item | Owner | Stars | Last push | Licence | Latest release | Verdict |
|---|---|---|---|---|---|---|
| gitleaks/gitleaks | gitleaks (organisation) | 30,358 | 2026-10-23 | MIT | v8.30.1, 2026-03-21 | Passes. Release is 7 months old, repository is active |
| gitleaks/gitleaks-action | gitleaks (organisation) | 669 | 2026-10-14 | none declared | v3.0.0 | Fails (under 1,000 stars, no clear licence). Do not use |

Proposed CI step: download the `gitleaks_8.30.1_linux_x64.tar.gz` release asset, check its SHA-256 equals `551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb` (from the release's checksums file), then run `gitleaks detect --redact`. Tag v8.30.1 is commit `83d9cd684c87d95d656c1458ef04895a7f1cbd8e`. I have not read gitleaks' Go source; the safeguards are the pinned checksum and that the job has read-only access and no secrets. Approval needed before this is added to `ci.yml`.

## (b) Vercel: what merging to main does, and how to require your approval

Source: vercel.com/docs, "Environments", "Git Configuration".

- Confirmed: pushing or merging to the production branch (usually `main`) triggers a production deployment by default. Other branches and pull requests create preview deployments.
- Option 1, recommended: Project Settings, Environments, Production, Branch Tracking, turn off "Auto-assign Custom Production Domains". Merges to main still build, but the live site only changes when you promote that deployment by hand. You can test the real production build first. I have not confirmed which Vercel plans offer this toggle.
- Option 2: in `vercel.json`, `{"git": {"deploymentEnabled": {"main": false}}}` stops Vercel building main at all, so you deploy deliberately with `vercel --prod`. A change to that file would itself be a pull request, protected by the main ruleset.
- Claude's `vercel` commands are already on the ask list, so Claude cannot run `vercel --prod` without your approval.

## (c) Permission rule syntax

Source: code.claude.com/docs/en/permissions, checked and used in `.claude/settings.json`.

- Bash rules: `Bash(git push --force*)`; a space before a trailing `*` is part of the rule; deny is checked first, then ask, then allow; the first match wins.
- Deny and ask rules accept tool-name globs, so `mcp__*supabase*` and `mcp__*vercel*` are valid.
- Read and Edit rules use gitignore-style paths: `Read(**/.env)`, `Read(~/.ssh/**)`, `//` for an absolute path.
- Caveat from the docs: Bash patterns are fragile. `git -C . push` or `bash -c "git push"` can slip past a rule. That is why the `guard-branch` hook parses commands itself, and why the GitHub ruleset on main is the real gate.
- The auto-mode setting `defaultMode: "auto"` does not work in project settings, so it is not set.

## (d) Things that decide what C4 can do

1. **Your GitHub plan.** Rulesets work on private repositories only with GitHub Pro, Team or Enterprise (docs.github.com, "About rulesets"). On Free, they work only on public repositories. Without a ruleset, nothing on GitHub stops a direct push to main except the local hook. Which plan are you on?
2. **Ruleset body.** `.github/ruleset-main.json` was checked field by field against the REST API reference (`~DEFAULT_BRANCH`, `pull_request`, `required_status_checks`, `non_fast_forward`, `deletion`, `bypass_actors`). It sets zero required approvals because you cannot approve your own pull request. The required checks are the CI job named `checks`.
3. **`gh` in the sandbox.** Because `~/.config/gh` is on the read-deny list, every `gh` command will need an approved unsandboxed run (OQ-12).
