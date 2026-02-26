# Auto Quote Generator — Architecture

## How invoice logic was reused and abstracted

### Shared pricing core (`src/lib/pricingCore.ts`)

The existing **Invoice Maker** used pricing rules inside `JobCostCalculator` (rates by project type, zone multiplier, visit fee, labor/materials/subtotal formulas). That logic is now centralized:

- **RATES**: Same as before — Maintenance $45/hr + $2/sqft, Installation $60/hr + $5/sqft, Repair $75/hr + $8/sqft.
- **VISIT_FEE**: 50 (first visit free, then $50 per additional).
- **ZONE_MULTIPLIER**: residential 1×, commercial 1.3×.
- **computeBreakdown(inputs)**: Returns `{ labor, materials, visitFees, subtotal }` from `PricingInputs` (hours, sqft, visits, zone, projectType). No tax here; invoices add tax in the UI.

**JobCostCalculator** was refactored to import from `pricingCore` and call `computeBreakdown()` for the numbers, then add Phoenix tax (8.6%) and total locally. So invoice totals are unchanged; the single source of truth for labor/materials/visits/subtotal is `pricingCore`.

### Quote calculator (`src/lib/quoteCalculator.ts`)

- Uses **the same** `computeBreakdown()` and `validatePricingInputs()` from `pricingCore`.
- Does **not** add tax (quotes show ranges only, no line-by-line or tax breakdown).
- Applies range multipliers to the **subtotal**:
  - `minTotal = subtotal * QUOTE_LOW_MULTIPLIER` (0.85)
  - `maxTotal = subtotal * QUOTE_HIGH_MULTIPLIER` (1.15)
- Returns `{ minTotal, maxTotal, breakdown, valid, errors }`.

So: **one shared core** (pricingCore) drives both **exact invoice totals** (JobCostCalculator + tax) and **quote min–max ranges** (quoteCalculator, no tax).

---

## Data flow

1. **Client**: Request Quote page (`/request-quote`) → form (service, type, zone, hours, sqft, visits, extras) → `calculateQuoteRange()` (client-side) → display range → submit → `createQuoteRequest` server action.
2. **Server**: Persist `quote_requests` row (client data, inputs, min/max cents, breakdown_metadata, status `pending`), create `admin_notifications` row, call SMS placeholder (e.g. to `ADMIN_PHONE_FOR_SMS`).
3. **Admin**: Sidebar shows unread quote count (badge on Quotes, bell dropdown). Click notification → `/admin/quotes?open=<id>` → Quotes page opens detail modal for that quote. Table: Client, Service, Estimated range, Status, Created, Actions (View / Edit / Override / Send). Detail modal: override min/max, message to client, Save (→ status `reviewed`) or Send to client (→ persist approved range, SMS to client, status `sent`).

---

## Files added/updated

| Area | Files |
|------|--------|
| Shared pricing | `src/lib/pricingCore.ts`, `src/lib/quoteCalculator.ts` |
| Invoice reuse | `src/features/admin/jobs/ui/JobCostCalculator.tsx` (imports pricingCore) |
| DB | `prisma/schema.prisma` (quote_requests, admin_notifications), `prisma/migrations/.../migration.sql` |
| Server actions | `app/actions/quoteRequest.ts`, `app/actions/notifications.ts` |
| SMS | `src/lib/sms.ts` (Twilio-ready placeholder) |
| Client request | `app/(dashboard)/request-quote/page.tsx`, client Services page “Request Job” button |
| Admin quotes | `src/features/admin/quotes/ui/QuotesPage.tsx`, `src/features/admin/quotes/components/QuoteRequestDetailModal.tsx` |
| Notifications | `src/shared/ui/Sidebar.tsx` (badge + bell dropdown, link to `?open=`) |

---

## SMS (Twilio)

- `sendSms({ to, body })` in `src/lib/sms.ts` logs when Twilio is not configured.
- To enable: set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`; optionally `ADMIN_PHONE_FOR_SMS` for new-quote alerts. Uncomment the Twilio client code in `sms.ts` and install `twilio`.

---

## Running migrations

If the DB was unreachable during implementation, run:

```bash
npx prisma migrate deploy
```

(or `prisma migrate dev` with a reachable DB) so `quote_requests` and `admin_notifications` exist.
