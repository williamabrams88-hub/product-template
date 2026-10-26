---
paths:
  - "supabase/**"
---

# Database standards (Supabase and Postgres)

- Row Level Security is enabled on every table in an exposed schema, with one policy per operation (select, insert, update, delete). No table is reachable without a policy.
- Policies check ownership: `to authenticated using ((select auth.uid()) = user_id)`. A role check alone is authentication, not authorisation.
- Update policies carry both `using` and `with check`.
- Never base authorisation on `user_metadata`. Use `app_metadata` or a table.
- Views use `security_invoker = true`. Avoid `security definer`; if unavoidable keep it in a private schema and check `auth.uid()` inside.
- Migrations are files in `supabase/migrations/`, created with `supabase migration new`. Never edit one that has been applied. Never invent a filename.
- Every change to policies has a test in `supabase/tests/` run by `supabase test db`. Test an allowed user, a different user, and anon.
- Add an index for every foreign key and every column used in a policy or frequent filter.
- Use lowercase snake_case names, `timestamptz` for times, `uuid` or identity keys.
- Run `supabase db advisors` before committing a schema change and fix findings.
- Local only. `supabase db push`, `db reset`, `link` and remote migration commands need the owner's approval.
- Skills to follow: `supabase`, `supabase-postgres-best-practices`.
