---
name: verify
description: Runs typecheck, lint, unit tests, build and accessibility checks, runs the app and confirms the change in the running app, then prints an evidence block of commands and results. Use when the owner says "verify", "check it works", "run all the checks", "is it done" or "does it pass". Claude Code also runs this before each commit. Never claims success without evidence. Not for reviewing the code (use peer-review).
---

# Verify

Nothing is "done", "fixed" or "passing" until this skill has produced evidence in the current session. If a command was not run, say so. Do not infer a result from the code looking right.

## Two modes

- **Quick** (use when this runs automatically before a commit): typecheck, lint and unit tests only. Stop at the first failure.
- **Full** (use when the owner asks, at the end of `/build-task`, and before `/ship`): quick, then build, accessibility, and the running-app check below.

## Steps

1. Read the commands table in CLAUDE.md. If a command is still a `{{PLACEHOLDER}}`, say that the project has not been set up and stop.
2. Run in this order and read the output of each: `typecheck`, `lint`, `test`, then (full only) `build`, `a11y`.
3. Full mode, running-app check:
   - Start the app with the dev command in the background.
   - Do what the changed behaviour is meant to allow, using Playwright (headless) or `curl` for an API. Check the actual result against the acceptance criterion the task satisfies.
   - If `docs/design/design-tokens.json` exists and the change is visual, take a screenshot and compare it with `docs/design/DESIGN-SPEC.md`.
   - Stop the app.
4. If anything fails, stop. Report the failing command, the last lines of its output, and your reading of the cause. Do not weaken or skip a check to get green.

## Evidence block (always print this)

```
VERIFY (quick|full) <date>
typecheck : PASS|FAIL  (<command>)
lint      : PASS|FAIL  (<command>)
unit tests: PASS|FAIL  (<n> passed, <n> failed)
build     : PASS|FAIL|not run
a11y      : PASS|FAIL|not run
app check : PASS|FAIL|not run  (<what was done and seen>)
```

Then one plain-English line: ready, or what blocks it.
