---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Read the rules in `guidelines.md` in this folder. It is a pinned copy; do not fetch rules from the internet.
2. Read the specified files (or ask the user which files or pattern to review).
3. Check the files against every rule.
4. Output findings in the terse `file:line` format described at the end of `guidelines.md`.

## Local notes

- The Content and Copy and Typography sections are Vercel house style (Title Case, curly quotes). Treat them as advisory.
  This project uses sentence case and British English; where they conflict, the project wins.
- Accessibility, Focus States, Forms, Animation, Images, Performance and Anti-patterns apply in full.
