# Changelog

The template changes only through a reviewed pull request with an entry here.

## Unreleased

- First build of the template: CLAUDE.md, settings and hooks (guard-branch, secret-scan, format-and-lint, quality-gate) with tests, five path-scoped rules, two read-only reviewer agents, eleven workflow skills, six vendored third-party skills (audited, see docs/skill-vetting.md), Superpowers plugin pinned to v7.0.1 through `.claude-plugin/marketplace.json`, CI, GitHub templates, project creation script, strategy, design and compliance templates.
- secret-scan now blocks a single command that chains a stage and a commit, because the hook cannot see files staged by the same command. Found by a live test; regression test added.
- new-project checks that the pinned-plugins marketplace is registered before copying.
- CI comment and C4 notes updated: no gitleaks step (owner declined); the public repository uses GitHub's own secret scanning.
- Template repository published at williamabrams88-hub/product-template (public) with secret scanning, push protection and the protect-main ruleset.
- Architecture diagrams: `/plan` now writes `docs/architecture.md` (system context, components and data flow, data model, trust boundaries as Mermaid) before the task list, and the owner approves it with the plan. `/build-task` updates it when a component, table or service changes; the reviewer agent flags drift. The template ships a skeleton; a test checks that new projects get it.
