---
name: new-project
description: Creates a new project from this template - a local copy first, then (only with the owner's approval) a public GitHub repository from the template with branch protection, Dependabot and the app scaffold for the chosen stack profile. Supports a dry run that makes no remote calls. Only the owner starts it.
disable-model-invocation: true
argument-hint: <project-name> [--dry-run]
---

# New project

Run from the template folder. Never edit the template itself; the project is a copy.

## Check the plugin registration first

Run `claude plugin marketplace list`. If `pinned-plugins` is missing, tell the owner to run the two commands in README.md under one-off setup, and wait. The copy carries `.claude-plugin/marketplace.json` and the Superpowers setting, but a new computer must register the marketplace once. The registration points at the template folder, so do not move or delete it.

## Always start with a dry run

1. Run `bash scripts/new-project.sh <name> --dry-run`. It copies the template to a sibling folder `../<name>`, sets `is_template: false`, fills the CLAUDE.md placeholders from `profiles/<stack_profile>.yaml`, empties the template-only logs, and starts a local git repository. No GitHub, Vercel or Supabase calls. Add `--skip-scaffold` to avoid the npm download.
2. Show the owner what was created and how to check it. Ask whether to continue to the real project.

## Real project (every step below needs the owner's explicit yes, one at a time)

1. Create the repository: `gh repo create <owner>/<name> --template <owner>/<template-repo> --public --clone`. Product repositories are public (owner decision, GitHub Free needs it for rulesets), so warn the owner that everything committed is visible. Remote action. Wait for yes.
2. Apply the branch ruleset from `.github/ruleset-main.json`: pull request required, required status checks, force pushes blocked, no bypass. Check the request shape against docs.github.com first. Remote action. Wait for yes.
3. Enable Dependabot alerts and security updates. Remote action. Wait for yes.
4. Generate the app scaffold with the command in the profile. Install the dev dependencies listed there. Set the package.json scripts named in the profile.
5. Fill the placeholders in CLAUDE.md with the real commands and run `/verify` once.
6. If a design file is present, run `/ingest-design`.
7. Vercel and Supabase projects are never created by this skill. Tell the owner what to create and which settings matter (see the notes in README.md).

Finish with a summary of at most 10 lines and the next decision: `/discover` or `/spec`.
