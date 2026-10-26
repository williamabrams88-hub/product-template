# File plan for the template (Phase 2, awaiting checkpoint C3)

Nothing in this plan has been written yet except docs/. Paths are relative to the template root. "Line budget" is a ceiling, not a target.

## 1. Changes to the brief's structure, with reasons

| Change | Reason |
|---|---|
| Hooks read commands from `package.json` scripts (`typecheck`, `lint`, `test`), not from project.config.yaml | Node has no built-in YAML parser. Avoids a dependency inside a security-relevant hook. The YAML flags are read by skills, which is where they are used. |
| Add `profiles/web.yaml` | The extension point for other stacks: scaffold command, script names, rule globs. Only `web` ships. |
| Superpowers pinned by an inline marketplace in `.claude/settings.json`, not a root `.claude-plugin/` file | Works for every project copy whatever its repository name (decision D-2a, updated at C3). |
| Add `.claude/skills/THIRD-PARTY/` and per-skill `SOURCE.md` | Licences, audited SHAs, NOTICE file for the Vercel skills (D-3). |
| Add `docs/vendor-patches/` | One diff per patched vendored file, so updates are deliberate. |
| Add `.gitignore`, `.gitattributes`, `.nvmrc` | Keep `.env`, `node_modules/`, `.superpowers/` out of git; force LF line endings for hooks (the repo is used from WSL and Windows); pin Node 22. |
| Hook tests use `node --test` | Built in to Node 22, no dependencies. |
| `scripts/new-project.sh` is the tested script; `new-project.ps1` is a thin wrapper | This machine is WSL and has no PowerShell to test with. The .ps1 will be marked untested in the README. |
| `/retro`, `/ship`, `/new-project` set `disable-model-invocation: true` | Side effects or user-only decisions. Also removes their descriptions from context. |

## 2. Tree

```
product-template/
  README.md                         start-a-project guide for a non-coder            (80)
  CLAUDE.md                         workflow, gates, Behaviour block, routing table  (150 target, 200 max)
  project.config.yaml               stack_profile + five flags                       (25)
  profiles/web.yaml                 scaffold command, script names, rule globs       (30)
  .gitignore  .gitattributes  .nvmrc
  .claude/
    settings.json                   sandbox, permissions, hook wiring, env, skill denies
    rules/   frontend.md backend.md database.md testing.md security.md   (40 each, with paths)
    agents/  reviewer.md security-reviewer.md                            (read-only, sonnet)
    hooks/   guard-branch.mjs format-and-lint.mjs quality-gate.mjs secret-scan.mjs
             tests/  one *.test.mjs per hook, fixture JSON in tests/fixtures/
    skills/
      own (11): discover spec plan build-task verify peer-review gate-security
                ship ingest-design new-project retro
      vendored (6): frontend-design react-best-practices composition-patterns
                web-design-guidelines supabase supabase-postgres-best-practices
      THIRD-PARTY/  licences and NOTICE
  docs/
    strategy/   brief.md market.md positioning.md pricing.md metrics.md impact.md (disabled)
    specs/ plans/ decisions/   (README stub each; decisions/ holds ADRs)
    design/     DESIGN-SPEC.md design-tokens.json
    compliance/ data-map.md dpia.md breach-runbook.md payments.md privacy-notice.md
                regulatory-stop.md   (all flag-gated, none legal advice)
    skill-vetting.md open-questions.md decisions.md file-plan.md skill-routing.md vendor-patches/
  .github/      workflows/ci.yml pull_request_template.md CODEOWNERS dependabot.yml
  supabase/     migrations/ tests/ README.md
  scripts/      new-project.sh new-project.ps1
```

## 3. Decisions made inside each file group

**settings.json**
- `sandbox.enabled` and `sandbox.autoAllowBashIfSandboxed` true, plus `sandbox.filesystem.denyRead` for `~/.ssh`, `~/.aws`, `~/.gnupg`, `~/.config/gh` (key names to verify, OQ-5). No `defaultMode`.
- deny: force pushes, `git reset --hard origin/*`, reads of `.env*` and `secrets/`, the superpowers skills listed below.
- ask: `gh pr merge`, `git merge`, `gh repo *`, `gh issue *`, every `vercel *`, `supabase db push|reset`, remote `supabase migration`, `npm publish`, and any `mcp__supabase*` tool (syntax to verify, OQ-6).
- allow: read-only git, `npm run typecheck|lint|test|build`, `node --test`.
- env: `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` (key to verify), `SUPERPOWERS_DISABLE_TELEMETRY=1`.
- Superpowers: keep brainstorming, writing-plans, test-driven-development, systematic-debugging. Deny the other eleven. Reasons: using-superpowers (blanket trigger), finishing-a-development-branch, diagnosing-superpowers, receiving-code-review (remote actions), executing-plans, using-git-worktrees, subagent-driven-development, dispatching-parallel-agents (overlap with `build-task`, cost), requesting-code-review and verification-before-completion (replaced by `peer-review` and `verify`), writing-skills (skill-creator covers it).

**Hooks** (all Node `.mjs`, no dependencies)
- guard-branch: PreToolUse on Bash; blocks `git push` on main or master, including `HEAD:main` forms.
- format-and-lint: PostToolUse on Edit and Write; runs Prettier and ESLint on the changed file only; skips quietly when the project has no `package.json`.
- quality-gate: Stop; runs typecheck, lint and tests only if code files changed; blocks up to the documented cap, then lets the turn end and says so.
- secret-scan: PreToolUse on Bash `git commit`; regex over staged diff for common key shapes.
- Each test pipes sample tool JSON in and asserts exit code and message. A final check proves each hook really fires in a live session.

**Skills.** Each under 500 lines. Descriptions start with what the skill does, then "Use when" with my likely phrases, plus a "not for" clause where adjacent. Trigger overlap list goes in docs/skill-routing.md.
- discover is business strategy; Superpowers brainstorming is feature-level design. Adjacent, so both carry "not for" clauses. If Phase 7 shows they collide, brainstorming is added to the deny list and `discover` and `spec` absorb its method.
- `plan` wraps Superpowers writing-plans and sets the output path to `docs/plans/`. Stated in CLAUDE.md because plugin skills cannot be patched.
- `verify` is the deliberately shadowing name (needs Claude Code 2.1.286 or later; yours is 2.1.308).

**Rules and paths.** `paths` frontmatter syntax to be verified first (OQ-10). frontend: `app/**`, `components/**`. backend and security: `app/api/**`, `supabase/functions/**`. database: `supabase/**`. testing: `**/*.test.*`, `tests/**`. Vendored skills get matching `paths`.

**CI** (ci.yml). Install, typecheck, lint, test, build, a11y (axe via Playwright), `npm audit`, Core Web Vitals budget (tool to verify, likely Lighthouse CI). Gitleaks step added at C4 only if GitHub secret scanning is unavailable on your plan. Every action pinned to a commit SHA.

**Compliance.** Templates exist always; skills only point to them when the matching flag is true.

## 4. Build order for Phase 3 (each step verified before the next)

1. Verify docs: settings keys, permission syntax, `paths`, hook input schema, Stop-hook cap. Log results.
2. Plugin experiment: marketplace file, hook override, deny rules. Pass or fall back.
3. settings.json, then hooks with tests, then prove they fire.
4. Rules, agents, CLAUDE.md, config files.
5. Vendor the six skills with patches and licences.
6. Own skills (Phase 4), CI and docs templates, scripts.
7. `git init` locally (no remote) and commit in small steps.

## 5. Risks to know about

- Writes to `.claude/` prompt for approval each time. Expected; around 40 prompts across Phases 3 and 4.
- Plugin route depends on how project settings point at the marketplace. A project copy created from the template has a new repository name. If that cannot be solved cleanly, I fall back to vendoring.
- I can test .sh and hooks here. Native Windows behaviour (PowerShell, Git Bash) cannot be tested from WSL and will be marked as untested.
- CODEOWNERS will name `@williamabrams88-hub`. Confirm that is the owner you want.
