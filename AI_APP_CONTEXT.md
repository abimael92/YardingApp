# AI_APP_CONTEXT.md — Project Soul for AI Agents

**Purpose:** If you have **no memory** of this repository, read this first. It explains **what the product is**, **non‑negotiable engineering rules**, **how data fits together**, and **where to put code** so new work matches the existing system.

**Companion docs (read as needed):**

| Doc | Use when |
|-----|----------|
| [`SYSTEM_FLOW.md`](./SYSTEM_FLOW.md) | Lifecycle, status enums, Mermaid flows, FK behavior |
| [`TECH_STACK.md`](./TECH_STACK.md) | Stack details, auth nuances, responsive patterns |
| [`FUNCTIONALITY_REPORT.md`](./FUNCTIONALITY_REPORT.md) | Per-service CRUD inventory |
| [`CURRENT_FEATURES.md`](./CURRENT_FEATURES.md) | What is actually green vs mock in production |
| [`ROADMAP_GAPS.md`](./ROADMAP_GAPS.md) | Schema vs app gaps, prioritized backlog |

**Schema artifacts:** There is **no committed `schema.sql`** in this repo. Use **`prisma/schema.prisma`** (Prisma-managed subset) plus **`schema-summary.txt`** / **`database-schema.txt`** for the **full** Postgres picture on Neon. If the team adds `schema.sql` (e.g. `pg_dump --schema-only`), treat it as another reference and keep this file in sync.

---

## 1. Executive summary

### What is this app?

**J&J Desert Landscaping LLC** — a **landscaping CRM and operations platform** for **Phoenix, Arizona**, serving:

- **Owners / operators** — Back-office **admin** experience: quotes, jobs, crews, daily scheduling, clients, invoices, payments, equipment, reporting-style pages, settings.
- **Workers** — Field-oriented views: tasks, schedule, map-style navigation (product intent; implementation maturity varies—see `CURRENT_FEATURES.md`).
- **Supervisors & clients** — Additional dashboards for team oversight and customer self-service (schedule, billing, services).

Public visitors get a **marketing site** and a **request-quote** flow that persists leads into the database.

**Product identity:** This is **not** a generic SaaS starter. Domain nouns—**`quote_requests`, `jobs`, `schedules`, `profiles`, `invoices`**—match the database. New features should **extend** these models and services, not invent parallel “shadow” entities.

---

## 2. North Star principles

When legacy code disagrees with these rules, **new code follows the North Star** and leaves TODOs or follow-up tasks to retire legacy paths.

### 2.1 SOLID-style architecture

- **Single responsibility:** `src/domain` = types/enums; `src/services` = business logic + persistence; `app/` = routing + composition; `app/actions` = mutation orchestration + cache invalidation.
- **Open/closed:** Extend via new service functions and actions, not by duplicating SQL across components.
- **Dependency direction:** Services depend on **domain types**, not on React. UI depends on **actions**, **hooks**, and **serializable DTOs**.

### 2.2 Neon / PostgreSQL

- Production data lives in **Postgres on Neon**.
- Access patterns: **`@neondatabase/serverless`** (`neon(process.env.DATABASE_URL)`) and/or **Prisma** (`app/lib/prisma.ts` with serverless-friendly `connection_limit`).
- **Prisma schema is a subset** of the full DB. Tables such as **`schedules`**, **`schedule_jobs`**, **`crews`**, **`crew_members`** may exist in Neon and **`schema-summary.txt`** but **not** in `prisma/schema.prisma`—use raw SQL in services when Prisma has no model.

### 2.3 Next.js App Router

- App lives under **`app/`** with route groups: `(marketing)`, `(dashboard)`, etc.
- Prefer **Server Components** by default.
- Use **`"use client"`** only for interactivity, hooks, browser APIs, or third-party client-only libraries.

### 2.4 pnpm

- **`package.json`** declares **`"packageManager": "pnpm@9.0.0"`**.
- Install and run scripts with **`pnpm install`**, **`pnpm dev`**, **`pnpm typecheck`**, etc.

### 2.5 No mock data (core requirement)

- **Requirement:** Business data—**clients, jobs, schedules, assignments, invoices, payments**—must ultimately come from **Neon**, not **`mockStore`** or static fixtures.
- **Current reality:** Some screens still use mocks (e.g. parts of client directory, admin invoices UI, analytics/reports). **Do not add new features on top of mocks.** Implement **`src/services` + Server Actions (or server APIs)** and migrate UI to real data.
- **Marketing-only** static content (e.g. testimonials catalog) may stay static unless product asks otherwise.

### 2.6 Secrets and the client boundary

- **`DATABASE_URL`** is **server-only** and must **never** appear in client bundles.
- **Default pattern:** Implement DB reads/writes behind **`app/actions/*.ts`** with **`"use server"`**, calling **`src/services/*`** or Prisma; call actions from client components or pass data from Server Components.
- **Allowed alternative:** **`app/api/**/route.ts`** Route Handlers for REST or integrations—still server-only, no DB in the browser.

---

## 3. Data dictionary (critical tables & relationships)

Think in terms of the **operational chain**:

**`quote_requests` → `jobs` → `schedules` / `schedule_jobs` → `employee_jobs` → `invoices` / `payments`**

### 3.1 `quote_requests`

- **What:** Inbound **lead / auto-estimate** from the website (contact info, service parameters, min/max cents, status `pending` → `reviewed` → `sent`).
- **Relationship:** A **job** created from a quote stores **`jobs.quote_request_id`** → **`quote_requests.id`**. So: **the job is the operational child of the quote request** (when conversion happened).

### 3.2 `clients`

- **What:** Customer account (name, email, phone, address fields).
- **Relationship:** **Parent** of **`jobs`**, **`invoices`**, **`payments`**, etc. **Not** a child of quotes (quotes carry raw client fields until conversion creates or links a client).

### 3.3 `jobs`

- **What:** The **unit of work** at a site: **`job_status`**, address, **`quoted_price_cents`**, link to **`clients`**.
- **Parents:** **`clients`** (required); optionally **`quote_requests`** via **`quote_request_id`**.
- **Children (examples):** **`job_items`**, **`job_materials`**, **`job_tasks`**, **`employee_jobs`**, **`time_entries`**, **`invoices`**, optional **`payments`**, and—in Neon—**`schedule_jobs`** rows that reference this job.

**Canonical sentence:** *A **job** is the **child** of a **quote_request** (when converted) and the **client**; it is the **parent** of **`schedule_job`** rows (via `schedule_jobs.job_id`) and **`employee_jobs`***.

### 3.4 `schedules` and `schedule_jobs`

- **`schedules`:** One row ≈ **one crew’s workday** on a **calendar date** (`crew_id`, `date`, status).
- **`schedule_jobs`:** **Children of `schedules`**. Each row places **one job** in the route (`job_id`, `route_order`, estimated start/duration, slot status).
- **Link to jobs:** **`schedule_jobs.job_id` → `jobs.id`**. So each **`schedule_job`** belongs to **both** a **schedule** (day/crew container) **and** a **job** (the work order).

### 3.5 `employee_jobs`

- **What:** Assignment of a **`profiles`** row (worker) to a **`job`**, with role/status and timestamps.
- **Relationship:** Many-to-many bridge **worker ↔ job**; populated by the **Daily Planner** (`createWorkDay`) and assignment helpers.

### 3.6 `profiles`

- **What:** **Person** in the business (name, avatar, **`user_status`**). Optional **`user_id` → `User`** links login identity to the domain person.
- **Relationship:** **Workers** in scheduling/assignments are **`profiles`**, not duplicate “user” rows. **`user_roles`** connects **`profiles`** to **`roles`** for DB RBAC. Jobs reference **`profiles`** for created_by / approved_by / completed_by style fields.

### 3.7 Other tables to know

| Table | Role |
|-------|------|
| **`crews` / `crew_members`** | Crew definitions; members are **`profiles`**. Used by planner and schedule reads. |
| **`invoices` / `payments`** | Billing and cash application. |
| **`equipment`** | Asset registry (partial UI); **`equipment_assignments`** etc. may exist in full schema without app coverage—check `ROADMAP_GAPS.md`. |

---

## 4. Project map (folder structure)

### 4.1 The three `src` layers (memorize these)

| Directory | Purpose |
|-----------|---------|
| **`src/services`** | **Business logic and database transactions.** Neon SQL and/or Prisma. **No React.** Consumed by Server Actions, Route Handlers, or Server Components (ensure no accidental client import). |
| **`src/hooks`** | **UI state and orchestration of data fetching** from the client: pagination, form persistence, media queries, async helpers, hooks that **invoke Server Actions** (e.g. Daily Planner). **No raw SQL.** |
| **`src/components`** | **Reusable UI primitives** used across features: layout (Card, Button, DataTable, Modal, Skeleton), **`schedule/DailyPlanner`**, etc. The repo is **configured for Shadcn** (`components.json`); in practice you will also see **Radix** primitives and Tailwind. Treat **`src/components`** as **shared building blocks**, not full pages. |

### 4.2 `app/` — App Router, actions, API

| Area | Purpose |
|------|---------|
| **`app/(marketing)/`** | Public marketing pages. |
| **`app/(dashboard)/`** | Role areas: **`admin`**, **`worker`**, **`supervisor`**, **`client`**, **`request-quote`**. |
| **`app/login/page.tsx`** | NextAuth credentials (**primary** admin login). |
| **`app/actions/*.ts`** | **`"use server"`** — **preferred** entry for mutations + **`revalidatePath`**. |
| **`app/api/**`** | REST endpoints (auth, crews, jobs, …) when not using actions. |
| **`app/lib/prisma.ts`**, **`app/lib/auth.ts`** | Prisma client, NextAuth options. |
| **`middleware.ts`** | JWT gate for protected route prefixes; **fine-grained roles** often in layouts. |

### 4.3 `src/features/`

Vertical slices: **`admin/clients`**, **`admin/quotes`**, **`dashboards/*`**, **`marketing`**, **`auth`**, etc. **Feature UI** lives here; **`app/.../page.tsx`** should stay thin.

### 4.4 `src/shared/ui/`

Cross-route UI: **Sidebar**, **Navbar**, **LoadingState**, **Breadcrumbs**, etc.

### 4.5 `src/domain/`

**`entities.ts`**, **`models.ts`**, enums — shared types for services and UI.

### 4.6 `src/data/`

**`mockStore`**, **`mockData`** — **legacy / demo**. North Star: shrink usage over time.

### 4.7 `src/lib/`

Small helpers (**`db.ts`**, calculators, mappers). Prefer **server-safe** modules here.

### 4.8 Root config (with `package.json`)

| File | Role |
|------|------|
| **`package.json`** | Dependencies (Next 15, React 19, Prisma 5, Neon, NextAuth), **`pnpm`** `packageManager`, scripts. |
| **`prisma/schema.prisma`** | ORM models + enums. |
| **`tailwind.config.ts`**, **`app/globals.css`** | Styling. |
| **`components.json`** | Shadcn paths and Tailwind integration. |
| **`scripts/`** | DB inspect, seed, one-off SQL. |
| **`docs/`** | Audits and design notes. |

---

## 5. Environment context

| Variable | Role |
|----------|------|
| **`DATABASE_URL`** | Neon Postgres connection string — **server only**. |
| **`NEXTAUTH_SECRET`** | NextAuth signing. |
| **`NEXTAUTH_URL`** | Canonical site URL in deployed environments (when configured). |

**DB protection checklist for new code**

1. Put **mutations** in **`app/actions/*.ts`** (or **`app/api`**), call **`src/services`** or Prisma, then **revalidate** affected routes.
2. Never import **`neon()`** or Prisma from **`"use client"`** files.
3. Return **JSON-serializable** data from actions to the client.
4. For **reads** used in client components, prefer **Server Actions** that fetch server-side, or **load in RSC** and pass props down.

---

## 6. Auth snapshot

- **NextAuth** + **Prisma `User`**: **`User.role`** string (default **`worker`**); JWT/session exposes role for **admin** layout checks (**`role === "admin"`**).
- **`profiles` + `user_roles` + `roles`**: Rich RBAC in the database; **not every route** enforces permission rows—verify before assuming.
- **Worker / client / supervisor** routes may still use **cookie-based role gates** in places—**align new work with session + `profiles`** where possible.

---

## 7. How to write code that fits perfectly

1. **New domain behavior** → **`src/services`** → **`app/actions`** → UI (**`src/features`** / **`src/components`** / **`app`**).
2. **New table** → Update **Prisma** if the feature uses Prisma; else **typed SQL** in a service and document in **`schema-summary`** / migrations process.
3. **No new business logic** in **`mockStore`**.
4. **Scheduling** → Reuse **`schedulePlannerService`** patterns; optimize **batch SQL** for many inserts.
5. **Docs** → Update **`SYSTEM_FLOW.md`** / **`FUNCTIONALITY_REPORT.md`** / **`CURRENT_FEATURES.md`** when behavior or data sources change.

---

## 8. One-line identity

> **A Neon-backed Next.js 15 landscaping CRM for owners and workers: pnpm, App Router, Server-Action–first data access, Postgres as source of truth, and a standing mandate to replace legacy mocks with real database integrations.**

---

*Refresh this file when auth is unified, Prisma gains scheduling models, or the team commits a canonical `schema.sql`.*
