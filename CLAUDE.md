# Product template

Reusable starting point for software products. In a project copy, this file is specialised to that product. In the template itself it is never edited by a project, only by a reviewed pull request with a changelog entry.

The owner is not a coder. Correctness must be provable: tests, CI, checks, evidence. Explain every change in plain English: what changed, what could break, how it was verified. British English, no em dashes, plain language, no emoji.

## Commands (filled in by /new-project)

| Task | Command |
|---|---|
| Install | `{{INSTALL}}` |
| Typecheck | `{{TYPECHECK}}` |
| Lint | `{{LINT}}` |
| Unit tests | `{{TEST}}` |
| Build | `{{BUILD}}` |
| Accessibility check | `{{A11Y}}` |
| Run locally | `{{DEV}}` |

Hooks call the `typecheck`, `lint` and `test` scripts in package.json. Keep those names. Hook tests: `node --test ".claude/hooks/tests/*.test.mjs"`.

## Config

`project.config.yaml` holds the stack profile and five flags: `handles_personal_data`, `handles_payments`, `handles_financial_data`, `uses_ai_features`, `uk_market`. Each flag switches on checks in `/gate-security` and `/ship` and unlocks `docs/compliance/` templates. Read the file before any security, ship or spec work.

## Workflow (deterministic order)

`discover > spec > plan > build-task > verify > peer-review > gate-security > ship`

You are the only orchestrator. Do not skip a stage. Use a subagent only for the two read-only reviewers. Specs live in `docs/specs/`, plans in `docs/plans/`, decisions in `docs/decisions/` and the running log `docs/decisions.md`. These paths override any default path a skill suggests.

## Human gates (the owner decides, you never do)

Stop and wait for explicit approval before: any merge; any deployment; anything touching production; creating or changing any remote (GitHub repo, ruleset, Vercel or Supabase project); installing third-party code; changing permissions, hooks or settings; spending money. Pushing a feature branch is allowed. Pushing to main is not.

These are enforced by `.claude/settings.json` ask and deny rules, hooks and GitHub rulesets. This paragraph is only a reminder. If a gate blocks you, report it. Do not look for a way round it.

## Skill routing

| Need | Use | Runs |
|---|---|---|
| Strategy, market, kill criteria | `/discover` | main |
| Feature design conversation | `superpowers:brainstorming`, then `/spec` | main |
| Spec with metric and verification | `/spec` | main |
| Task plan | `/plan` (uses `superpowers:writing-plans`) | main |
| Build one task | `/build-task` (uses `superpowers:test-driven-development`) | main |
| Bug or failing test | `superpowers:systematic-debugging` | main |
| React or Next.js code | `react-best-practices`, `composition-patterns` | main |
| UI and accessibility review | `web-design-guidelines`, `frontend-design` | main |
| Database, RLS, migrations | `supabase`, `supabase-postgres-best-practices` | main |
| Run all checks | `/verify` | main |
| Independent review | `/peer-review` | reviewer agent |
| Security gate | `/gate-security` | security-reviewer agent |
| Open a pull request | `/ship` (owner starts it) | main |
| Create a project | `/new-project` (owner starts it) | main |
| Design file to tokens | `/ingest-design` | main |
| After a merge | `/retro` (owner starts it) | main |

Full matrix and test prompts: `docs/skill-routing.md`.

## Superpowers overrides

The Superpowers plugin is installed in full. Where it conflicts with this file, this file wins:
- Execute plans inline in this session. Do not use subagent-driven execution unless the owner asks.
- Do not use `finishing-a-development-branch`, `using-git-worktrees` or `requesting-code-review`. Use `/ship` and `/peer-review`.
- Never merge, push to main or open GitHub issues because a skill suggests it.
- Use Sonnet. Do not dispatch a reviewer on a more capable model unless the owner has approved that model for the task.

## Behaviour

1. Think before coding. State assumptions. If several interpretations exist, list them instead of choosing silently. If a simpler approach exists, say so and push back. If something is unclear, stop, name it and ask.
2. Simplicity first. Write the minimum code that solves the problem. Work down this ladder and stop at the first rung that holds: does it need to exist at all? Does the standard library cover it? A native platform feature? An already-installed dependency? One line? Only then custom code. No features beyond the request, no abstraction for single-use code, no unrequested configurability, no new dependency the ladder already covers. Never cut input validation at trust boundaries, error handling that prevents data loss, security or accessibility. If 200 lines could be 50, rewrite. Mark each deliberate shortcut inline as `// shortcut: <what was skipped and why, what changes if requirements grow>` and list shortcuts in the change summary.
3. Surgical changes. Touch only what the request needs. Match existing style. Do not refactor or improve adjacent code. Mention unrelated dead code, do not delete it. Remove only the imports, variables and functions your change orphaned. Every changed line must trace to the request.
4. Goal-driven execution. Turn each task into a verifiable goal: bug fix is a failing test first, then a pass; validation is tests for invalid inputs; refactor is tests green before and after. For multi-step work write a short plan as `step -> verify: check`. "Make it work" is not a criterion.

## Code standards

Standards load by file type from `.claude/rules/`. They are not repeated here.

## Compaction

When compacting, preserve: the list of changed files, failing tests, the current task, and open decisions awaiting the owner.
