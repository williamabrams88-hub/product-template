# Supabase

- `migrations/`: SQL migration files, created with `supabase migration new <name>`. Never edit one that has been applied.
- `tests/`: database tests run with `supabase test db`. Every Row Level Security policy needs tests for an allowed user, a different user, and an anonymous user.

Local work only. `supabase db push`, `db reset`, `link` and any command that touches a remote project need the owner's approval. See `.claude/rules/database.md`.
