# Third-party skill vetting

Audit date: 26 October 2026. Method: `gh api` for repository facts, shallow clones into an isolated scratch folder, then reading every SKILL.md and script I propose to ship. Nothing from these repositories has been installed or run. Nothing has been copied into `.claude/` yet.

Status: PROPOSED. Waiting for checkpoint C2 approval.

## 1. Repository facts (Tier 1)

| Repo | Owner type | Stars | Last push | Archived | Licence | Latest release | Audited SHA |
|---|---|---|---|---|---|---|---|
| anthropics/skills | Organisation | 183,930 | 2026-10-09 | No | Per skill (see section 3) | none published | dbd4588f9e1033efb41dad4bef2f7947c8993d44 |
| anthropics/claude-plugins-official | Organisation | 44,707 | 2026-10-26 | No | Apache-2.0 | none published | 58267944f92187b7d6a1c822165c96c81c864806 |
| obra/superpowers | Individual (Jesse Vincent) | 305,477 | 2026-10-23 | No | MIT (LICENSE file) | v7.0.1, 2026-10-21 | 2ce8aa15d05bd57213e6f746f953aafb7ded7a8b |
| vercel-labs/agent-skills | Organisation | 33,043 | 2026-10-14 | No | MIT declared in README and in two SKILL.md files; no LICENSE file | tagged 2026-08-28 | 063bee94c3f4df8453406c830b0a7df0f2860278 |
| vercel-labs/web-interface-guidelines | Organisation | 1,038 | 2026-10-05 | No | MIT (LICENSE file) | none | 434b7f91364665f2f733b310ec54809bf8f37937 |
| supabase/agent-skills | Organisation | 2,935 | 2026-10-02 | No | MIT (LICENSE file) | v0.1.9, 2026-09-28 | c9be0e931b7930f7d02126d04774d904c381e7d7 |

All six are real repositories under the exact owner named, none is a fork (`fork: false`), none is archived, all pushed within 90 days. vercel-labs/web-interface-guidelines was not on the author's list. It is the repository that web-design-guidelines fetches from at runtime (section 3, item 5), so it needed vetting too. It clears the 1,000 star bar narrowly.

Superpowers has many look-alike forks. The official Anthropic marketplace lists it from `https://github.com/obra/superpowers.git` pinned to bb92a77 (v7.0.0). My audited commit is 2 commits ahead (v7.0.1), same owner.

## 2. Tier 2 (metadata only, not audited, not proposed)

| Repo | Stars | Last push | Licence | Latest release | Head SHA seen |
|---|---|---|---|---|---|
| github/spec-kit | 142,997 | 2026-10-26 | MIT | v1.2.3, 2026-10-22 | 9783b49e |
| nextlevelbuilder/ui-ux-pro-max-skill | 140,778 | 2026-10-26 | MIT | v2.15.0, 2026-08-13 | 28b3b8de |
| bmad-code-org/BMAD-METHOD | 54,578 | 2026-10-20 | MIT (LICENSE file; API shows NOASSERTION) | v6.12.4, 2026-10-14 | 61e01f82 |

Corrections to the brief: spec-kit is no longer slow (pushed today, not 62 days ago). BMAD's licence is MIT despite the API reporting none. Both stay in Phase 8 only.

Rejected, unchanged: gsd-build/get-shit-done (archived, last push 2026-05-31, re-checked); any aggregator repo; anything under 1,000 stars.

## 3. Findings per candidate

What each item executes, network access, files written, `allowed-tools`, and `!` shell injection. Across everything I read, no SKILL.md uses `allowed-tools` or `!` shell injection lines. That was checked with grep and by reading.

### 3.1 anthropics/skills

1. frontend-design. Apache-2.0 with LICENSE.txt. Text only: no scripts, no network, no files written, no `allowed-tools`. Byte-identical to the copy in the official plugin directory. PROPOSE: vendor.
2. skill-creator. Apache-2.0. Same content as the official plugin (only the LICENSE copyright line differs). Scripts run `claude -p` as a subprocess (run_eval.py, improve_description.py), using my session login, so every eval query spends Pro plan usage. run_eval.py also writes a temporary file into `.claude/commands/` of the project root. Python only, no other network except a Google Fonts link in a generated HTML report. Not needed in the template. See 3.2.
3. docx, pdf, pptx, xlsx. LICENSE.txt is proprietary ("governed by your agreement with Anthropic"). The README calls them source-available, not open source. They must not be copied into a repository I may share. My Claude account already offers them as built-in skills. PROPOSE: use by reference only, do not vendor.
4. webapp-testing. Apache-2.0, but Python Playwright and `with_server.py` starts commands with `shell=True`. Our web profile uses TypeScript Playwright. PROPOSE: reject.
5. Other skills (canvas-design, slack-gif-creator, mcp-builder, and so on) are not needed. Not audited.

Item 4 of the brief's "unverified" list is now resolved: the licence terms of each skill I plan to copy are recorded above.

### 3.2 anthropics/claude-plugins-official

Contains skill-creator and frontend-design plugins with no hooks and no MCP servers. The marketplace has 315 entries. Two entries I recommend against because they would bypass my deployment and database gates: `vercel` (deployment integration) and `supabase` (MCP that runs SQL). Neither is wanted. PROPOSE: no copy into the template. skill-creator is a developer tool for me, not part of a product, so install it at user scope only if the skill already synced to my account lacks the eval scripts (open question OQ-3).

### 3.3 obra/superpowers v7.0.1

15 skills. I read in full: using-superpowers, brainstorming, writing-plans, executing-plans, test-driven-development, systematic-debugging, all scripts under hooks/, brainstorming/scripts/, executing-plans/scripts/, subagent-driven-development/scripts/ and systematic-debugging/find-polluter.sh. The remaining skills were grep-scanned for network, install, remote git and `gh` commands, not read in full.

Findings:
- The plugin route installs a SessionStart hook that injects the full using-superpowers text into every session. That text says to invoke any skill with even a 1% chance of applying, before clarifying questions. This works against R2 (lean context) and against the routing design in section 9.1. The hook itself is benign: it reads one local file and prints JSON.
- The visual companion in brainstorming starts a local Node web server (bound to 127.0.0.1, per-session key). Its page loads a logo from primeradiant.com with the Superpowers version in the URL, which tells that site when I use it. The opt-out is the environment variable `SUPERPOWERS_DISABLE_TELEMETRY` (or `DISABLE_TELEMETRY`). Not wanted. Not vendored.
- finishing-a-development-branch runs `git merge`, `git push`, `git branch -D` and `git worktree remove`. It contradicts "ship never merges". Reject.
- diagnosing-superpowers can run `gh issue create` on the maintainer's repository. Outward-facing. Reject.
- receiving-code-review can post replies to GitHub PR comments with `gh api`. Reject.
- executing-plans ends in finishing-a-development-branch, relies on using-git-worktrees, dispatches a reviewer subagent on "the most capable model", and tells the agent to settle plan conflicts itself ("Rulings, not stalls"). All four clash with my rules (Sonnet by default, ask when unclear, no merges). Our own `build-task` replaces it.
- brainstorming has a very broad description ("MUST use before any creative work") and would shadow our `discover` and `spec`. It writes to `docs/superpowers/specs/` and dispatches a subagent for a builder check. Its ideas are good (look before you ask, lay out approaches in a separate message, a hard gate before building).
- writing-plans is self-contained apart from its output path (`docs/superpowers/plans/`) and a handoff section that names subagent-driven-development and executing-plans.
- test-driven-development: text only, plus writing-good-tests.md. No findings.
- systematic-debugging: text plus find-polluter.sh, which only runs `npm test <file>` per test file and checks whether a path appears. No findings. References `superpowers:` skill names that will not exist when vendored.
- Cross-references use the `superpowers:` prefix. Vendored skills lose that prefix, so a few lines need editing. Every edit is listed under "Documented patches" below.

PROPOSE: vendor test-driven-development, systematic-debugging and writing-plans (patched). Do not vendor brainstorming: write our own `discover` and `spec` using its method, with an MIT attribution line. Do not install the plugin, so there is no hook and no telemetry. See decision D-2.

### 3.4 vercel-labs/agent-skills

- react-best-practices and composition-patterns. Text and markdown rule files only (76 and 14 files). SKILL.md read in full. The rule files were pattern-scanned for commands, network calls and instruction-injection phrases, with no hits, and not read line by line. Licence: README says MIT and both SKILL.md files say `license: MIT`, but there is no LICENSE file, so the GitHub API reports no licence. Brief says: if unresolved, use by reference or skip. See decision D-3.
- web-design-guidelines. Its SKILL.md tells Claude to fetch rules at review time from `raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md` and follow them. That is a moving target on a branch, so it defeats SHA pinning and means unreviewed text can steer a review. The fetched file today (191 lines, read in full) is plain rules and looks safe. The repo also ships install.sh, which downloads the file with curl into `~/.claude/commands/`; do not run it. PROPOSE: vendor with a patch that replaces the fetch with a local copy of command.md pinned at 434b7f9. That repository has a real MIT LICENSE file, so the licence question disappears for this skill. Some rules there are house style (Title Case headings, curly quotes) that conflict with my British English and sentence case style; the patch tells the reviewer to treat the Content and Copy section as advisory.
- deploy-to-vercel, vercel-cli-with-tokens: REJECTED as instructed. They would bypass the deployment gate.
- Others (react-native-skills, react-view-transitions, vercel-optimize, writing-guidelines): not needed, not audited.

### 3.5 supabase/agent-skills

Two skills: `supabase` and `supabase-postgres-best-practices`. MIT with LICENSE file. Both SKILL.md files read in full; the 37 reference files were pattern-scanned, not read line by line.
- `.mcp.json` points at `https://mcp.supabase.com/mcp?features=docs`. A remote MCP server is third-party code and would be able to run SQL against a remote project, which skips my `ask` rules on `supabase db push` and `supabase migration` (those match Bash commands only). Not copied. The template will deny or ask on `mcp__supabase*` tools. Verify the rule syntax before C4 (OQ-6).
- The skill tells Claude to fetch `supabase.com/changelog.md` and docs pages before work. That is read-only fetching from the official site and fits R1. Accepted.
- The skill suggests running `curl` against the MCP URL and creating a `.mcp.json`. Patch removes the MCP troubleshooting section.
- references/skill-feedback.md tells Claude to open a GitHub issue on supabase/agent-skills (it asks permission first). Outward-facing. Patch removes it and the feedback template.
- Descriptions are long and say "ANY task involving Supabase". Patch adds `paths` so they only load for database and Supabase client files (exact globs fixed in Phase 2).
- Installed skill CHANGELOG.md files and `scripts/build-release.ts` are repo tooling and are not copied.

PROPOSE: vendor both skills (patched).

## 4. Documented patches (edits to vendored files)

Every patch is kept as a unified diff in `docs/vendor-patches/` and listed here. No script or LICENSE file is modified.

| Skill | Patch |
|---|---|
| writing-plans | Change save path to `docs/plans/`. Replace "Execution Handoff" with a single inline-execution handoff. Remove `superpowers:` prefixes. Remove REQUIRED SUB-SKILL lines for subagent-driven-development and executing-plans. |
| test-driven-development | Remove `superpowers:writing-skills` reference in writing-good-tests.md. |
| systematic-debugging | Remove `superpowers:` prefixes. Point the verification step at our `verify` skill. Omit CREATION-LOG.md and test-*.md (not instructions). |
| web-design-guidelines | Replace the fetch step with a local `command.md` at the audited SHA. Add the style note. |
| supabase | Remove MCP troubleshooting and the Reference Guides section. Add `paths`. Do not copy references/skill-feedback.md or assets/. |
| supabase-postgres-best-practices | Add `paths`. |
| react-best-practices, composition-patterns | Omit the compiled AGENTS.md (3,810 and 946 lines, a duplicate of the rule files) and the build metadata. Keep SKILL.md and rules/. |

Each vendored folder gets a `SOURCE.md` with owner/repo, audited SHA, licence, date and the patch list. Updates are manual: re-audit, diff, then bump the SHA.

## 5. Install plan (exact, proposed)

No third-party install command is needed. Everything is a file copy from the audited clones, shown to you at C3 and run only after you approve.

| # | Item | Source and SHA | Destination | Licence kept |
|---|---|---|---|---|
| 1 | frontend-design | anthropics/skills dbd4588 | .claude/skills/frontend-design/ | LICENSE.txt (Apache-2.0) |
| 2 | test-driven-development | obra/superpowers 2ce8aa1 | .claude/skills/test-driven-development/ | LICENSE (MIT) at .claude/skills/THIRD-PARTY/superpowers-LICENSE |
| 3 | systematic-debugging | obra/superpowers 2ce8aa1 | .claude/skills/systematic-debugging/ | same |
| 4 | writing-plans (patched) | obra/superpowers 2ce8aa1 | .claude/skills/writing-plans/ | same |
| 5 | react-best-practices | vercel-labs/agent-skills 063bee9 | .claude/skills/react-best-practices/ | NOTICE file (decision D-3) |
| 6 | composition-patterns | vercel-labs/agent-skills 063bee9 | .claude/skills/composition-patterns/ | NOTICE file (decision D-3) |
| 7 | web-design-guidelines (patched) | skill: vercel-labs/agent-skills 063bee9; rules: web-interface-guidelines 434b7f9 | .claude/skills/web-design-guidelines/ | MIT LICENSE from web-interface-guidelines |
| 8 | supabase (patched) | supabase/agent-skills c9be0e9 | .claude/skills/supabase/ | LICENSE (MIT) |
| 9 | supabase-postgres-best-practices (patched) | supabase/agent-skills c9be0e9 | .claude/skills/supabase-postgres-best-practices/ | LICENSE (MIT) |

Not installed, with reasons: Superpowers plugin and its hook; brainstorming; executing-plans; verification-before-completion (our `verify` is the deliberate version); requesting-code-review (our `peer-review` and reviewer agent); finishing-a-development-branch; diagnosing-superpowers; Vercel deploy and token skills; anthropics document skills (proprietary, available already); webapp-testing; the official `vercel` and `supabase` plugins; every Tier 2 item.

Hook-bearing plugins: none proposed, so the plugin route and its version pinning are not needed.

## 6. Cost note

Nine skill descriptions will sit in context every session. Estimated from the descriptions above: roughly 1,500 to 2,000 tokens, with the two Supabase descriptions the largest. This is an estimate. I will measure with `/context` after Phase 3 and report the real figure. If it is too high, the Supabase and Vercel skills get `paths` restrictions first.

## 7. Routing matrix mapping (for docs/skill-routing.md after approval)

| Row | Third-party skill | Status |
|---|---|---|
| Vague idea, scope, options | Superpowers brainstorming | GAP, filled by own discover and spec (method adapted, MIT attribution) |
| Task plan | writing-plans | Installed (patched) |
| Implement a task | test-driven-development | Installed |
| React and Next.js code quality | react-best-practices, composition-patterns | Installed (licence decision D-3) |
| UI and accessibility review | web-design-guidelines | Installed (patched) |
| Database, RLS, migrations | supabase, supabase-postgres-best-practices | Installed (patched) |
| Documents | anthropics document skills | By reference only (proprietary licence) |
| New or changed skill | skill-creator | Already available through my account; install official plugin only if needed |
| Debugging (extra row) | systematic-debugging | Installed |
| Visual design (extra row) | frontend-design | Installed |
