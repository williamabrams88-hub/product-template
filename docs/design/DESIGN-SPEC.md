# Design spec

Status: template. Replaced by `/ingest-design` in a project.

## Principles

## Grid and layout

## Components and states

For each component: default, hover, focus, active, disabled, error, loading, empty.

## Content tone

Plain, sentence case, active voice. Buttons say what happens. Errors say how to fix it.

## Motion

Respect `prefers-reduced-motion`. Animate `transform` and `opacity` only.

## Accessibility

WCAG 2.2 AA. Contrast is computed with `node scripts/contrast.mjs docs/design/design-tokens.json`.
