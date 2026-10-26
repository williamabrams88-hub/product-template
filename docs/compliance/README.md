# Compliance templates

These are starting points. They are not legal advice. A flag in `project.config.yaml` switches on the matching checks in `/gate-security` and `/ship`. Use only the files for flags that are `true`.

| Flag | Files | What changes |
|---|---|---|
| `handles_personal_data` | `data-map.md`, `privacy-notice.md`, `dpia.md`, `breach-runbook.md` | Data map kept current, DPIA decision recorded, breach plan ready |
| `handles_payments` | `payments.md` | Hosted checkout, webhook signature check, idempotency |
| `handles_financial_data` | `regulatory-stop.md` | Hard stop in `/ship` until professional advice is taken |
| `uses_ai_features` | see `.claude/rules/security.md` | Eval suite, versioned prompts, fallbacks, usage caps, OWASP LLM Top 10 (2025) |

## UK facts checked against ico.org.uk on 26 October 2026 (re-check before relying on them)

- Organisations, including sole traders, that use personal information must pay the ICO data protection fee unless exempt. Use the ICO's self-assessment to find out: https://ico.org.uk/for-organisations/data-protection-fee/
- A personal data breach that is likely to risk people's rights and freedoms must be reported to the ICO as soon as possible and, where feasible, within 72 hours. If the risk to people is high, tell them without undue delay: https://ico.org.uk/for-organisations/report-a-breach/
- The ICO's DPIA guidance says it is under review because of the Data (Use and Access) Act, so re-check it before each launch: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/
