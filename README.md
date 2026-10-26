# Product template

A starting point for any new software product. It sets up Claude Code so that it works in a fixed order, proves its work with tests, and stops to ask you before anything that cannot be undone.

You do not need to read code to use it.

## What you get

- A fixed workflow: discover, spec, plan, build, verify, review, security check, ship.
- Automatic safety checks (hooks) that block pushes to main, block secrets in commits, format and lint code, and stop Claude finishing while tests fail.
- Rules that only load for the kind of file being edited, to keep Claude fast and focused.
- Templates for strategy, specs, design and (switched off by default) UK compliance.
- A plain-English summary of every change: what changed, what could break, how it was checked.

## One-off setup (once per computer)

1. Use WSL 2 (Ubuntu) with VS Code, Node 22, Git and the GitHub CLI (`gh auth login`).
2. Install Claude Code from Anthropic's apt repository. Leave `ANTHROPIC_API_KEY` unset so usage stays on your Pro plan.
3. Install the pinned Superpowers plugin once: `claude plugin install superpowers@pinned-plugins`.

## Start a new project

1. Open a terminal in this template folder and run `claude`.
2. Type `/new-project my-product-name`. Claude makes a dry run first (a local copy only). Nothing goes to GitHub until you say yes, step by step.
3. Open the new folder in VS Code and start `claude` there.
4. Type `/discover` to work out the idea, or `/spec` if you already know what you want.
5. Add a design file when you have one and type `/ingest-design`.

## The workflow, in plain English

| Step | Command | What it does | What you do |
|---|---|---|---|
| 1 | `/discover` | Researches the market and writes the strategy | Answer questions, read the risks and kill criteria |
| 2 | `/spec` | Writes what "done" means, with one number that must move | Approve the spec |
| 3 | `/plan` | Breaks it into small tasks | Approve the plan |
| 4 | `/build-task` | Builds one task, tests first | Read the summary |
| 5 | `/verify` | Runs every check and the real app | Look at the evidence |
| 6 | `/peer-review` | A second Claude reviews the change cold | Read what it found |
| 7 | `/gate-security` | Security checklist | Read pass or fail |
| 8 | `/ship` | Opens a pull request | Merge it yourself on GitHub |

## What Claude will never do without you

Merge, deploy, touch production, create or change a GitHub, Vercel or Supabase project, install third-party code, change permissions or hooks, or spend money. These are enforced by settings, hooks and GitHub rules, not by asking nicely.

## Flags that switch on extra checks

Edit `project.config.yaml`: `handles_personal_data`, `handles_payments`, `handles_financial_data`, `uses_ai_features`, `uk_market`. The compliance templates in `docs/compliance/` are starting points, not legal advice.

## When you set up GitHub, Vercel and Supabase

Claude will list the exact steps and wait for you. Things to know:
- A GitHub ruleset on `main` is what really stops direct pushes. Hooks are a second layer.
- Vercel deploys `main` to production by default. Claude will check the current Vercel docs with you and help you require your approval first.
- Supabase: Row Level Security on every table, and the service-role key only ever on the server.

## Changing the template

Only through a reviewed pull request with an entry in `docs/decisions.md`. A project never edits the template.

## Where things are

`CLAUDE.md` (Claude's instructions), `.claude/` (settings, hooks, rules, skills, agents), `docs/` (strategy, specs, plans, design, compliance, decisions), `profiles/` (stack choices), `scripts/` (project creation, contrast check).

Windows without WSL is untested. The PowerShell wrapper `scripts/new-project.ps1` has not been run.
