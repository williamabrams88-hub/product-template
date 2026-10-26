# Open questions

Format: ID, question, why it matters, status. Items marked "template" must be handled when the template files are written.

## From the environment audit (Windows session)

- OQ-1. `claude doctor` shows 4 warnings about `~/.local/bin`. They do not apply to an apt install. Do not run `claude install`. Status: open, ignore unless the install method changes.
- OQ-2. `claude doctor` says auto-updates are enabled on channel "latest" for an apt install, but the docs say apt installs do not auto-update. Check whether the version changes without `apt upgrade`. Why it matters: an unexpected version change could change hook or permission behaviour mid-project. Method: note `claude --version` now (2.1.308), recheck after a week. Status: open.
- OQ-5. Add `sandbox.filesystem.denyRead` for `~/.ssh`, `~/.aws`, `~/.gnupg` and `~/.config/gh` in the template's `.claude/settings.json`, alongside `sandbox.enabled` and `sandbox.autoAllowBashIfSandboxed`. Key names and `~/` path syntax verified in the settings reference. Applied and confirmed live: sandboxed commands can no longer read these paths, including the GitHub login (see OQ-12). Status: closed.

## From Phase 1 (vetting)

- OQ-3. The skill-creator skill my account already offers (`anthropic-skills:skill-creator`) may or may not include the eval scripts (run_eval.py and others). Check before installing the official plugin. Each eval query is a headless Claude Code session, so it spends Pro plan usage; keep eval sets small. Status: open, check before Phase 4 testing.
- OQ-4. vercel-labs/agent-skills has no LICENSE file. README and two SKILL.md files declare MIT. Accepted with a NOTICE file (D-3, 26 October 2026). Status: closed.
- OQ-6. Permission syntax checked against the permissions docs: `Bash(cmd *)` with a space, `mcp__*` style globs in deny and ask rules, Read/Edit path patterns. Still to test: that `mcp__*supabase*` matches real tool names once a Supabase MCP server exists. Status: partly closed.
- OQ-7. The skills docs page was only partly read (the last 18,000 characters were not fetched). Re-fetch the remainder when writing our own skills, especially anything on `paths` frontmatter and the combined description cap. Status: open.
- OQ-8. Whether `claude plugin validate` accepts a `.claude/skills` folder that is not inside a plugin. Needed for the Phase 4 test step. Status: open.
- OQ-9. The Supabase skills were tested by nobody here against a running Supabase project. Their rules are only checked in Phase 7 on the sample build. Status: open.
- OQ-10. `paths` verified: skills take a comma-separated string or YAML list; rules take a YAML list with quoted globs. Status: closed.
- OQ-11. Items the brief listed as unverified and now resolved in docs/skill-vetting.md: latest releases for superpowers (v7.0.1) and spec-kit (v1.2.3); last push and release for supabase/agent-skills and BMAD-METHOD; licence terms for anthropics/skills and vercel-labs/agent-skills. Status: closed, except OQ-4.
- OQ-12. With denyRead on `~/.config/gh`, `gh` inside the sandbox reports "not logged in". Every gh command needs an approved unsandboxed run, which the auto-mode classifier may refuse. Decide later whether to use `sandbox.credentials` masking or `sandbox.excludedCommands` instead. Status: open.
- OQ-13. Live-fire proof so far: guard-branch fired and blocked a push. PostToolUse (format-and-lint), Stop (quality-gate) and secret-scan are covered by unit tests and are wired the same way, but have not yet been seen firing in a live session. Check `/hooks` lists all four, and watch for them in the sample build (Phase 7). Status: open.
- OQ-14. The inline "settings" marketplace and the sha-pinned plugin source have not been installed yet. Run `claude plugin install superpowers@pinned-plugins` (owner action, R3), then `claude plugin list` and `/context`. Status: open.
- OQ-15. Vendored skills could not be copied by Bash (sandbox protects .claude/skills, and the auto-mode classifier refused an unsandboxed copy). The owner runs scratchpad/install_vendor.sh. Status: open.
- OQ-16. Superpowers' own SessionStart hook injects its skill-use rule into every session, and all 15 skills load. Measure with `/context` after install and compare with the estimate in docs/skill-vetting.md section 6. Status: open.
