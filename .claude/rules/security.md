---
paths:
  - "app/api/**"
  - "app/**/actions.ts"
  - "middleware.ts"
  - "supabase/**"
  - "lib/server/**"
---

# Security standards

- Treat all input as hostile: request bodies, query strings, headers, file uploads, webhook payloads, model output.
- Authorisation check comes first in every protected route. Deny by default.
- Never put secrets in code, logs, client bundles, error messages or commits. The `secret-scan` hook is a backstop, not a plan.
- Service-role keys, API secrets and webhook secrets are server-side only.
- Output encoding by default. Never build HTML, SQL or shell commands by string concatenation.
- Session cookies: `HttpOnly`, `Secure`, `SameSite`. State-changing requests need CSRF protection.
- Dependencies: pinned versions, committed lockfile, `npm audit` in CI, Dependabot on. Add a dependency only after the simplicity ladder in CLAUDE.md fails.
- AI features follow the OWASP Top 10 for LLM Applications (2025): treat model output as untrusted, defend against prompt injection, limit tool permissions, cap usage per user.
- Personal data: collect the minimum, say why, delete on request. See `docs/compliance/` when `handles_personal_data` is true.
- Payments: hosted checkout only, so card data never touches our code. See `docs/compliance/payments.md` when `handles_payments` is true.
- Report a suspected leak to the owner at once. Do not try to fix it quietly.
- Review with `/gate-security` before every pull request.
