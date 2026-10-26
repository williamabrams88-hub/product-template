# Payments (template)

Use when `handles_payments: true`. Not legal advice. Check every point against the chosen payment provider's current documentation when you pick one, and record the links here.

## Rules

1. **Hosted checkout only.** The provider's hosted page or embedded element collects card details, so card data never touches our code, logs or database. Store only the provider's ids.
2. **Verify webhook signatures** before reading the body. Reject on failure. The signing secret is a server-side environment variable.
3. **Idempotency.** Create payments and refunds with an idempotency key. Handle the same webhook arriving twice without double effects.
4. **The webhook, not the browser, confirms payment.** Never grant access because the browser says it paid.
5. **Refunds and disputes.** Write the policy, who can issue a refund, and how a dispute is answered and by when.
6. **Test mode first.** No live keys in development. Live keys are set in the host's environment by the owner only.
7. **Records.** Keep what accounting and tax rules require. Take advice on VAT.

## Provider

- Chosen provider and date:
- Documentation links checked:
