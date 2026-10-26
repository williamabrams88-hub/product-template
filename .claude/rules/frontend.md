---
paths:
  - "app/**"
  - "components/**"
---

# Frontend standards

- TypeScript strict mode. No `any` without a comment giving the reason.
- Server Components by default. Add `"use client"` only for state, effects or browser APIs.
- Accessibility: WCAG 2.2 AA. Use semantic HTML before ARIA. Every control reachable and visible by keyboard. Do not remove focus outlines without a replacement.
- Contrast is computed, never judged by eye. Text needs 4.5:1, large text and UI parts 3:1.
- Respect `prefers-reduced-motion`. Animate `transform` and `opacity` only.
- Every form field has a visible label, an inline error, and a focus move to the first error on submit.
- Images have explicit width and height and meaningful `alt` text (empty if decorative).
- Do not fetch in a waterfall. Start independent requests together.
- Validate all user input on the server as well as the client.
- Core Web Vitals budgets are checked in CI. Do not add a dependency to fix a budget before measuring.
- UK formats: dates and currency through `Intl` with `en-GB` and `GBP`, never hard-coded.
- Design tokens come from `docs/design/design-tokens.json`. No raw colour or spacing values in components.
- Plain, sentence-case copy. Buttons say what happens ("Save changes"). Errors say how to fix it.
- Review lenses: `web-design-guidelines` and `frontend-design`. Code lenses: `react-best-practices`, `composition-patterns`.
