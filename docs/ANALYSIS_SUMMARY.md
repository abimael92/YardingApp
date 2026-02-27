# Codebase Analysis Summary — Quote & Landing CTAs

**Date:** 2026-02-25  
**Scope:** Full repo for tech stack, DB access, auth, and "Create Quote" / "Request Quote" behavior.

---

## 1. Actual Technology Stack

| Layer | This Codebase | Mission Brief (Reference) |
|-------|----------------|----------------------------|
| **Framework** | Next.js 15, React 19 | Vue 3 + Vite |
| **State** | React state, server actions | Pinia |
| **Database** | Prisma + Neon (server-side) | Neon HTTP from browser |
| **Auth** | NextAuth (Credentials + Prisma) | Clerk |
| **Deployment** | Vercel (Next.js) | Vercel + Neon |

**Conclusion:** The mission brief describes a **Vue 3 + Clerk + Neon-from-browser** app. This repository is **Next.js + React + NextAuth + Prisma/Neon server-side**. No Vue, Pinia, Vite, or Clerk exist here. Neon is used only in **server-side** code (`jobService`, `userService`, etc.) via `neon(process.env.DATABASE_URL)` and Prisma — there is no browser HTTP API to Neon or RLS in the current architecture.

---

## 2. Database (Neon / Prisma)

- **ORM:** Prisma with `@prisma/adapter-neon` and `@neondatabase/serverless`.
- **Access pattern:** All DB access is **server-side** (API routes, server actions, server components). No direct browser → Neon.
- **Relevant tables:**
  - **clients** — single customer/client model (no separate "customers" table).
  - **quote_requests** — auto quote requests (client_name, client_email, service_name, inputs, min/max_cents, status, etc.).
  - **admin_notifications** — in-app notifications for new quote requests.
- **Indexes:** quote_requests has `status`, `created_at`; clients has `email`, `created_at`. No RLS policies in Prisma schema (RLS would be in Neon/Postgres if enabled).

---

## 3. Auth

- **NextAuth** with Credentials provider; session has `user.id`, `user.role`. Admin layout uses `getServerSession(authOptions)` and redirects non-admin. No Clerk.

---

## 4. Quote Flow (Current)

- **Request Quote page:** `/request-quote` — form (name, email, phone, service, project type, zone, hours, sqft, visits, extras) → client-side `calculateQuoteRange()` → **server action** `createQuoteRequest()` → Prisma `quote_requests.create` + `admin_notifications.create` + SMS placeholder. Works end-to-end.
- **Landing page:** Renders `LandingPage` → `HeroSection` ("Get Free Quote" button), `ServicesSection` (multiple `ServiceCard` with "Request Quote" button), contact section ("Schedule Consultation" button). **None of these buttons have `href` or `onClick`** — they do nothing.

---

## 5. Why "Create Quote" / "Request Quote" Doesn’t Work on Landing

| Location | Current behavior | Root cause |
|----------|------------------|------------|
| **ServiceCard** (each service) | "Request Quote" button | Plain `<motion.button>` with no `onClick` or `href` |
| **HeroSection** | "Get Free Quote" button | Plain `<motion.button>` with no link |
| **Landing contact section** | "Schedule Consultation" button | Plain `<motion.button>` with no link |

Fixing: wire all of these to **navigate to `/request-quote`** (and optionally pass `?serviceId=...` from ServiceCard so the form can preselect the service).

---

## 6. Customer/Client Model

- **Single model:** `clients` in Prisma (id, name, email, phone, address, etc.). Domain entities use "Client". No duplicate "Customer" table or store found; mockStore has clients and quote_requests are stored with inline client_name/client_email/client_phone (no FK to clients for anonymous quote requests).

---

## 7. Data Flow (Quotes)

1. User visits landing or dashboard → clicks "Request Quote" / "Get Free Quote" / "Schedule Consultation".
2. **After fix:** User is sent to `/request-quote` (optional `?serviceId=...`).
3. User fills form; `calculateQuoteRange()` shows min–max estimate; submit calls `createQuoteRequest` (server action).
4. Server action: Prisma insert into `quote_requests`, insert into `admin_notifications`, optional SMS; revalidatePath.
5. Admin sees notification and quote in Admin → Quotes; can override and send to client.

---

## 8. Actions Taken (No Breaking Changes)

- **ServiceCard:** "Request Quote" → `Link` to `/request-quote?serviceId={service.id}`.
- **HeroSection:** "Get Free Quote" → `Link` to `/request-quote`.
- **Landing contact:** "Schedule Consultation" → `Link` to `/request-quote`.
- **Request-quote page:** Read `serviceId` from search params and preselect service when present.

All use existing Next.js + Prisma + server-action flow; no Vue, Clerk, or browser-side Neon introduced.
