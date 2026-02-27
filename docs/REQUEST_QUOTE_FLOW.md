# Request Quote Form — What Happens When the Form Is Filled

This document describes the **one-time setup** required for the quote form to work, and the **end-to-end flow** from customer submit to admin follow-up.

---

## 1. One-Time Setup (Required)

The quote form saves to the database tables `quote_requests` and `admin_notifications`. If these tables do not exist, submit will fail with an error like: *"The table public.quote_requests does not exist"*.

**Do this once** (with `DATABASE_URL` in your `.env`):

**Option A — Create only quote tables (recommended if you want to avoid other schema changes):**

```bash
pnpm db:create-quote-tables
```

This creates only the `quote_request_status` enum, `quote_requests` table, and `admin_notifications` table (and indexes/FK). Safe to run even if they already exist.

**Option B — Sync full Prisma schema:**

```bash
pnpm db:push
```

This syncs your entire Prisma schema to the database. If Prisma warns about possible data loss (e.g. new unique constraints), you can use Option A instead to create only the quote tables.

---

## 2. Where the Form Lives

- **URL:** `/request-quote`
- **Linked from:** Landing page (“Get Free Quote”, “Request Quote” on service cards, “Schedule Consultation”), and client dashboard (“Request Job” on Services).

Optional query: `?serviceId=1` preselects a service when the user comes from a specific service card.

---

## 3. What the Customer Sees and Does

1. Customer opens `/request-quote` (from landing or dashboard).
2. **Fills the form:**
   - Name *, Email *, Phone (optional)
   - Service * (e.g. Lawn Care, Tree Services)
   - Project type (e.g. Maintenance, Installation, Repair)
   - Zone (Residential / Commercial)
   - Property size (sq ft) — used to auto-calculate labor estimate (hours and visit count are internal, not shown)
   - Extras / notes (optional)
3. **Estimated range** appears (min–max in dollars) based on shared pricing rules.
4. Customer clicks **“Request Job”**.
5. **While submitting:** Button shows “Submitting…” and is disabled.
6. **On success:** A green success message: *“Quote request received. We’ll review your request and get back to you…”*
7. **On error:** Red error message under the form (e.g. validation message, or if the DB isn’t set up: *“Quote request feature is not set up yet. Ask an administrator to run: pnpm db:push”*).

---

## 4. What Happens in the Backend When Submit Succeeds

When the customer clicks “Request Job” and the request is valid:

1. **Server action** `createQuoteRequest` runs (Next.js server).
2. **Database:**
   - One row is inserted into **`quote_requests`** with: client name/email/phone, service name, project type, zone, hours (auto), sqft, visits (1), min/max cents, breakdown metadata, status `pending`.
   - One row is inserted into **`admin_notifications`** with: type `quote_request`, entity_id = new quote id, read = false, quote_request_id = new quote id.
3. **SMS (optional):** If `ADMIN_PHONE_FOR_SMS` or `TWILIO_ADMIN_PHONE` is set, an SMS is sent to that number notifying about the new quote request. Otherwise a dev placeholder may log only.
4. **Revalidate:** `/admin/quotes` is revalidated so admin sees fresh data.
5. The server returns `{ success: true, id }`; the UI shows the success message and stops “Submitting…”.

---

## 5. What the Admin Sees and Does

1. **Notifications:** On the admin sidebar, the **Quotes** item can show a badge with the count of unread quote notifications. The **bell icon** can show a dropdown of unread “New quote request” items.
2. **Clicking a notification** (or going to Admin → Quotes) opens the **Quotes** list.
3. **Quotes table** shows: Client, Service, Estimated range, Status (pending / reviewed / sent), Created date, and actions: View, Edit/Override, Send to client.
4. **Opening a quote** (View / Edit) opens the **Quote detail modal**, where admin can:
   - See client info, original inputs, and internal breakdown (labor, materials, visits).
   - Override min/max amount and add a message to the client.
   - **Save (mark reviewed)** → status becomes `reviewed`.
   - **Send to client** → approved range and message are saved, status becomes `sent`, and an SMS is sent to the client’s phone if they provided one.

---

## 6. Summary Flow (Customer → Admin → Client)

| Step | Who | What |
|------|-----|------|
| 1 | Customer | Fills form on `/request-quote`, clicks “Request Job”. |
| 2 | System | Creates `quote_requests` + `admin_notifications`, optional SMS to admin. |
| 3 | Admin | Sees badge/notification, opens Admin → Quotes, opens quote detail. |
| 4 | Admin | Optionally overrides min/max, adds message, then “Save (mark reviewed)” and/or “Send to client”. |
| 5 | System | On “Send to client”: status → sent, optional SMS to client with message/range. |
| 6 | Client | Receives SMS (if phone was given) with the approved range and any message. |

---

## 7. If Submit Stays on “Submitting…” or Errors

- **Stuck “Submitting…” then error:** Usually a server/DB issue (e.g. missing tables or connection timeout). Fix setup (run `pnpm db:push`), ensure `DATABASE_URL` uses the **pooler** URL and the app uses a single connection per instance (see app/lib/prisma.ts). Then try again.
- **“Table does not exist”:** Run `pnpm db:push` once so `quote_requests` and `admin_notifications` exist.
- **Plain white background:** The request-quote page uses a gradient background (green/emerald/amber). If you still see white, hard-refresh or clear cache; the wrapper uses `min-h-screen` and the same gradient as the rest of the site.
