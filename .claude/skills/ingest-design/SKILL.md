---
name: ingest-design
description: Turns a design input (screenshots, PDF, Figma export, DESIGN.md, tokens JSON or a text brief) into design tokens, a theme config, a WCAG contrast report and DESIGN-SPEC.md for the current project. Use when the owner says "here is the design", "use this Figma export", "apply this brand", "set up the design system" or "turn this mockup into tokens". Specialises the project, never the template. Not for reviewing UI that is already built (use web-design-guidelines).
---

# Ingest design

Refuse to run if `is_template: true` in `project.config.yaml`. The template is never specialised; tell the owner to run `/new-project` first.

## Steps

1. Inventory the inputs. Ask only for what is missing (brand colours, fonts, tone, target devices).
2. Extract tokens (colour, type scale, spacing, radius, elevation, motion) into `docs/design/design-tokens.json`, using this shape for colours so the contrast script can read it:
   ```json
   { "colors": { "text": "#111111", "background": "#ffffff" },
     "pairs": [ { "fg": "text", "bg": "background", "use": "text" } ] }
   ```
   `use` is `text` (4.5:1), `large` (3:1) or `ui` (3:1). List every text and background pair that appears in the design, including hover, disabled and focus states.
3. Generate the framework theme config from the tokens. For the web profile this is the Tailwind theme and CSS variables in `app/`. Do not hard-code colours elsewhere.
4. Compute contrast: `node scripts/contrast.mjs docs/design/design-tokens.json`. Anything below the minimum fails. Use the suggested fix, tell the owner what changed and why, and re-run until all pass. Never judge contrast by eye.
5. Write `docs/design/DESIGN-SPEC.md`: principles, grid, components with all states (default, hover, focus, active, disabled, error, loading, empty), content tone, motion rules (respect reduced motion).
6. Choose a component library. Check its current official documentation first; default to the most widely documented option for the stack (for the web profile, shadcn/ui on Tailwind unless the design rules it out). Map each component in the spec to the library.
7. Add a "Design rules" section of 15 lines or fewer to this project's `CLAUDE.md`. Use `frontend-design` as the lens for choices and `web-design-guidelines` for review.
8. Add Playwright screenshot checks for the main pages so `/verify` can compare the running UI with the design.
9. Record decisions in `docs/decisions.md`.

Finish with a summary of at most 10 lines: tokens found, contrast failures fixed, library chosen, and what the owner must confirm.
