---
paths:
  - "**/*.test.*"
  - "**/*.spec.*"
  - "tests/**"
  - "e2e/**"
  - "supabase/tests/**"
---

# Testing standards

- Tests first for new behaviour. Write the test, watch it fail for the right reason, then write the minimum code (`superpowers:test-driven-development`).
- Bug fix: reproduce with a failing test before the fix.
- Vitest for units. Playwright for critical user journeys only: sign up, sign in, the core task, payment if present.
- Test behaviour a user or caller can see. Do not assert on mocks, internals or implementation details.
- Cover critical paths and edge cases: empty, very long, wrong type, unauthorised, double submit. Do not chase a coverage percentage.
- One behaviour per test, named for the behaviour ("rejects an empty email").
- No test depends on another test, the clock, the network or random order. Fake time and network explicitly.
- Do not weaken, skip or delete a failing test to get green. Fix the cause or ask.
- Accessibility checks (axe through Playwright) run on every page in the critical journeys.
- Database tests use `supabase test db` and cover each RLS policy for allowed, other and anonymous users.
- A test that never failed proves nothing. State what change would make it fail.
