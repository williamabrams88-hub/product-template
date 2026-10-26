---
paths:
  - "app/api/**"
  - "app/**/actions.ts"
  - "lib/server/**"
  - "supabase/functions/**"
---

# Backend standards

- Authorisation first. The first statement in every protected route or server action checks who the caller is and what they may do. Authentication alone is not authorisation.
- Validate every input at the boundary with a schema (for example Zod). Reject unknown fields. Never trust client-side checks.
- The Supabase service-role key is server-side only. It must never appear in a client bundle or a `NEXT_PUBLIC_` variable.
- Return typed, consistent errors. Do not leak stack traces, SQL or internal ids to the client.
- Make writes safe to retry: use idempotency keys for payments and webhooks.
- Verify webhook signatures before reading the body. Reject on failure.
- Log events, not personal data. No emails, names, tokens or card details in logs.
- Rate-limit anything public or expensive.
- Secrets come from environment variables. Never read or write `.env` files. Document each variable name in `docs/` without its value.
- External calls have timeouts and a defined failure path.
- Server code is covered by Vitest unit tests for logic and by Playwright for journeys that cross it.
