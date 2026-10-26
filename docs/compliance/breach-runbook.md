# Personal data breach runbook (template)

Use when `handles_personal_data: true`. Print it or keep it somewhere you can reach if the system is down. Not legal advice.

The clock matters: if a breach is likely to risk people's rights and freedoms, report it to the ICO as soon as possible and, where feasible, within 72 hours of becoming aware. Report online at https://ico.org.uk/for-organisations/report-a-breach/

## Steps

1. **Contain**: stop the leak (revoke keys, disable the account or route, take the page down). Write down the time you found out.
2. **Preserve evidence**: logs, screenshots. Do not delete anything.
3. **Assess**: what data, how many people, could it harm them (fraud, distress, discrimination)? Write the reasoning.
4. **Decide and record**:
   - Likely risk to people: report to the ICO within 72 hours.
   - High risk to people: also tell those people without undue delay, in plain language, with what to do next.
   - No likely risk: do not report, but record the breach and why.
5. **Fix and prevent**: root cause, fix, test that proves it, and a rule or check so it cannot recur (`/retro`).
6. **Record** every breach, reported or not, in `docs/decisions.md`.

## Contacts (fill in)

- Owner:
- Hosting and database support:
- Data protection adviser (if any):
