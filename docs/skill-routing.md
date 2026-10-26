# Skill routing

Method: one main-thread orchestrator (the session), a fixed stage order in CLAUDE.md, routing by skill description, and subagents only for isolated read-only work (the `reviewer` and `security-reviewer`). Basis: Anthropic's "Building effective agents" (use the simplest design that works) and the Claude Code skills and sub-agents documentation.

Status of testing: descriptions written and overlap-checked on paper. Superpowers and the vendored skills are now installed, but the live routing tests (section 4) are NOT run, because they spend Pro usage (see OQ-23). Pass rates will be recorded in section 5.

## 1. Matrix

| Use case | Skill | Where it runs | Status |
|---|---|---|---|
| Strategy, market, kill criteria | own `discover` | main | written |
| Feature design conversation | `superpowers:brainstorming`, then own `spec` | main | installed (7.0.1) |
| Spec with metric and verification | own `spec` | main | written |
| Task plan | own `plan` (calls `superpowers:writing-plans`) | main, Sonnet | written |
| Build one task | own `build-task` (calls `superpowers:test-driven-development`) | main | written |
| Bug or failing test | `superpowers:systematic-debugging` | main | installed (7.0.1) |
| React or Next.js code | `react-best-practices`, `composition-patterns` | main, loads for app and components | vendored |
| UI and accessibility review | `web-design-guidelines`, `frontend-design` | main | vendored |
| Database, RLS, migrations | `supabase`, `supabase-postgres-best-practices` | main, loads for supabase files | vendored |
| Run all checks | own `verify` (deliberate name; Claude Code runs it before commits) | main | written |
| Independent review | own `peer-review` then `reviewer` agent | subagent, read-only | written |
| Security gate | own `gate-security` then `security-reviewer` agent | subagent, read-only | written |
| Documents (docx, pdf, xlsx, pptx) | Anthropic document skills, by reference only (proprietary licence) | main | available from the account, not copied |
| Design file to tokens and spec | own `ingest-design` | main | written |
| Open a pull request | own `ship` (never merges) | main, owner only | written |
| Create a project | own `new-project` | main, owner only | written |
| After a merge | own `retro` | main, owner only | written |
| New or changed skill | skill-creator | main | available from the account (OQ-3) |

Gaps: none marked. Third-party skills named above are expected names and must be confirmed against the installed list after the plugin and vendored skills are in place.

## 2. Trigger phrases per skill

| Skill | Phrases that should fire it |
|---|---|
| discover | "is this a good idea", "research the market", "who are the competitors", "what should we charge", "write the strategy", "who is this for" |
| spec | "write a spec", "spec this feature", "turn this into requirements", "what does done look like", "define the acceptance criteria" |
| plan | "plan this", "break this down", "make a task list", "how should we build this", "what are the steps" |
| build-task | "build task 3", "implement the next task", "start building", "do the next step", "build it" |
| verify | "verify", "check it works", "run all the checks", "is it done", "does it pass" |
| peer-review | "review this", "peer review", "second opinion on the changes", "check this against the spec" |
| gate-security | "security check", "is this safe to ship", "run the security gate", "check for secrets" |
| ingest-design | "here is the design", "use this Figma export", "apply this brand", "set up the design system", "turn this mockup into tokens" |
| ship, new-project, retro | Manual only (`disable-model-invocation: true`). No trigger phrases. |

Overlap check among our own skills: no phrase appears twice. Adjacent pairs carry a "not for" clause: discover/spec, spec/plan, plan/build-task, build-task/verify, verify/peer-review, peer-review/gate-security, ingest-design/web-design-guidelines.

## 3. Known overlaps with the full Superpowers plugin (decision C3)

All 15 Superpowers skills are enabled, so these collisions are real and are handled by the "Superpowers overrides" section of CLAUDE.md, not by hiding skills. They are the first things to measure.

| Our skill | Overlapping Superpowers skill | Shared trigger | Handling |
|---|---|---|---|
| discover, spec | `brainstorming` ("before any creative work") | any new idea or feature | brainstorming is the feature-design front end; discover is business strategy; both carry "not for" clauses |
| plan | `writing-plans` | "have a spec, before touching code" | plan calls it with a different save path |
| build-task | `test-driven-development`, `executing-plans`, `subagent-driven-development` | "implementing any feature" | build-task calls TDD; CLAUDE.md forbids the other two unless asked |
| verify | `verification-before-completion` | "about to claim work is complete" | ours is the named gate; theirs may also fire. Acceptable, as both demand evidence |
| peer-review | `requesting-code-review`, `receiving-code-review` | "review" | CLAUDE.md forbids them; ours uses the read-only reviewer |
| ship | `finishing-a-development-branch` | "implementation is complete" | CLAUDE.md forbids it; merge and push are also behind ask rules and the hook |
| any | `using-superpowers` | "even a 1% chance a skill applies" | session-start text raises skill use generally; measure token cost |

If testing shows a Superpowers skill firing against CLAUDE.md, the next step is a `Skill(superpowers:<name>)` deny rule, which needs the owner's approval because it changes permissions.

## 4. Test prompts (3 should fire, 3 must stay quiet)

| Skill | Should fire | Must not fire |
|---|---|---|
| discover | "Is a bookkeeping app for sole traders a good idea?" / "Who are the competitors for a UK dog-walking booking tool?" / "What should we charge for this?" | "Add a dark mode toggle to settings" / "Write the acceptance criteria for login" / "Run the tests" |
| spec | "Write a spec for the invoice export feature" / "Turn this idea into requirements with a metric" / "What does done look like for sign-up?" | "Research competitors" / "Break the spec into tasks" / "Fix the failing test" |
| plan | "Plan spec 002" / "Break this down into tasks" / "Make a task list for the export feature" | "Write a spec for export" / "Build task 1" / "Open a pull request" |
| build-task | "Build task 3 of the plan" / "Implement the next task" / "Start building the sign-up form" | "Plan this feature" / "Why is the build failing?" / "Review my changes" |
| verify | "Verify the change" / "Run all the checks" / "Is it done?" | "Review the code for design problems" / "Write a plan" / "Check the security of the API" |
| peer-review | "Peer review this branch" / "Give me a second opinion on the changes" / "Check this against the spec" | "Run the tests" / "Is it secure?" / "Format the files" |
| gate-security | "Run the security gate" / "Is this safe to ship?" / "Check for leaked secrets" | "Review this diff for bugs" / "Add a login page" / "Open a pull request" |
| ingest-design | "Here is the Figma export, set up the design system" / "Apply this brand guide" / "Turn this mockup into tokens" | "Review the UI for accessibility problems" / "Make the button blue" / "Write the privacy notice" |

Manual-only skills (`ship`, `new-project`, `retro`) must never fire from a prompt. Test: ask "open a pull request" in plain words and confirm Claude tells the owner to type `/ship` rather than running it.

## 5. Results

Routing tests: not run (OQ-23). Record here: date, skill, fired on N of 3, stayed quiet on N of 3, fix applied.

### Token cost, measured with `/context` on 2026-10-26 (Claude Code 2.1.308, Sonnet 5.5, Superpowers 7.0.1 installed)

| Item | Tokens | Earlier estimate |
|---|---|---|
| CLAUDE.md (memory file) | 2.1k | not estimated |
| Our 8 auto-invocable workflow skills | about 1,210 | about 900 |
| 4 vendored skills listed (react-best-practices, composition-patterns, frontend-design, web-design-guidelines) | about 390 | not estimated |
| Superpowers, 15 skills | about 960 | 1,500 to 2,000 |
| Project agents (reviewer, security-reviewer) | 80 | not estimated |
| Template total (skills + CLAUDE.md + agents) | about 4.7k | not estimated |

Not in the list: `supabase` and `supabase-postgres-best-practices`. Probably hidden by their `paths` scope until Supabase files are touched; to confirm. Not counted: the user-level caveman plugin, MCP connectors (47.8k) and built-in skills, which are the owner's personal setup, not the template's. Total session at start of this check: 158.5k of 1m (16%), mostly this long build conversation.
