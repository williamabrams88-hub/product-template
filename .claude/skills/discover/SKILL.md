---
name: discover
description: Researches and writes the business strategy for a product - problem, target user, jobs to be done, market scan, competitors, positioning, pricing hypotheses, business model, risks and kill criteria. Use when the owner says "is this a good idea", "research the market", "who are the competitors", "what should we charge", "write the strategy", "who is this for" or starts a new product. Not for designing one feature (use superpowers:brainstorming) and not for requirements (use spec).
---

# Discover

Output goes to `docs/strategy/`. Follow the Behaviour section of CLAUDE.md, especially rule 1: state assumptions, ask when unclear.

## Rules for evidence

- Every market fact, price or statistic needs a source (URL and date). Search the web with the search tools.
- If you cannot find a figure, write "unknown" and say how to find it. Never invent numbers, quotes or sources.
- Separate three things in every document: what the owner told you, what a source says, and what you are guessing.

## Steps

1. Read `project.config.yaml` and anything already in `docs/strategy/`. Do not redo finished work.
2. Interview the owner with the question tool, one topic at a time, open questions first: the problem, who has it, what they do today, why now, what success looks like, what the owner can and cannot do. Stop after the answers are clear enough to write down. Offer a one-paragraph playback and ask what is wrong.
3. Market scan: size the market with cited sources, list 3 to 6 competitors or substitutes with what they charge and where they are weak, and note regulation that applies in the UK (`uk_market`).
4. Write these files from the templates already in the folder, keeping each short:
   - `brief.md`: problem, target user, jobs to be done, business model.
   - `market.md`: scan, competitor table, sources.
   - `positioning.md`: who it is for, the one thing it does better, what it will not do.
   - `pricing.md`: two or three price hypotheses with the reasoning and how to test each.
   - `metrics.md`: one primary metric with baseline and target, supporting metrics, cost to serve.
5. In `brief.md` add **Risks** (top five, with how each would show up early) and **Kill criteria**: concrete, dated conditions under which the owner stops (for example "fewer than N paying users by DATE").
6. Do not touch `docs/strategy/impact.md`. It is a disabled placeholder.
7. Log any decision in `docs/decisions.md`.

## Finish

Give a plain-English summary of at most 10 lines: what you found, the biggest risk, what you could not verify, and the next decision the owner has to make. The next stage is `/spec`.
