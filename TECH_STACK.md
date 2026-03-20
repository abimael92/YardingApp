# TECH_STACK.md — Implementation Deep-Dive

This document describes **how** the yarding app is built today: infrastructure, layering, auth, UI strategy, and data freshness patterns. Pair with [`SYSTEM_FLOW.md`](./SYSTEM_FLOW.md) for domain lifecycle and schema-level flows.

---

## 1. Infrastructure

### Neon Postgres

- **Serverless driver:** `@neondatabase/serverless` — many services call `neon(process.env.DATABASE_URL)` for parameterized SQL against Neon (e.g. `src/services/jobService.ts`, `invoiceService.ts`, `adminService.ts`, `schedulePlannerService.ts`).
- **Prisma:** `prisma` + `@prisma/client` with datasource URL from `DATABASE_URL`. Singleton in `app/lib/prisma.ts` with **`connection_limit=1`** appended for serverless pool safety on Vercel/Neon.
- **Adapter (tooling):** `@prisma/adapter-neon` is present for Neon-compatible Prisma usage; auth and some flows use Prisma directly.
- **Boundary rule:** `DATABASE_URL` and `neon()` must run only on the **server** (Server Components, Route Handlers, Server Actions, `tsx` scripts). Client components should call **Server Actions** or API routes, not import services that touch the DB.

### Next.js App Router

- **Version:** Next.js **15** with React **19**.
- **Routing:** `app/` uses route groups such as `(marketing)`, `(dashboard)`, and role-scoped segments: `admin`, `worker`, `supervisor`, `client`.
- **Server Actions:** `app/actions/*.ts` files start with `"use server"` and encapsulate mutations + cache invalidation (see §5).
- **API auth:** `app/api/auth/[...nextauth]/route.ts` wires NextAuth to `authOptions` in `app/lib/auth.ts`.

### pnpm

- **Declared in** `package.json`: `"packageManager": "pnpm@9.0.0"` — reproducible installs and strict node_modules layout.
- **Scripts:** `pnpm dev`, `pnpm build`, `pnpm typecheck`, `pnpm db:*` (Prisma push, seed, inspect), etc.

---

## 2. Folder Structure & Layering

The codebase favors **clear boundaries** between routing, orchestration, domain logic, and UI — aligned with SOLID-style habits (one reason to change per module, depend on abstractions like domain types).

### `src/services/`

- **Role:** Application **service layer** — CRUD, aggregations, and Neon/Prisma queries, returning typed DTOs or domain shapes.
- **Examples:** `jobService`, `clientService`, `invoiceService`, `schedulePlannerService`, `quoteService`, `adminService`.
- **Patterns:**
  - **Single responsibility** per file (jobs vs invoices vs quotes).
  - **Dependency direction:** services import from `@/src/domain/*` (entities, models), not from React.
  - **Mixed data policy:** several services are **DB-first**; a few modules still use in-memory or static data (called out in §5).

### `src/hooks/`

- **Role:** **Client-side** reusable state and effects — no direct DB access.
- **Examples:** `useDailyPlanner.ts` (calls Server Actions for planner data/mutations), `usePagination`, `useFormPersistence`, `useMediaQuery`, `useAsync`.
- **Pattern:** hooks compose UI behavior; **mutations** delegate to `app/actions/*`.

### `src/components/`

- **Role:** Shared, mostly **presentational** building blocks used across features (not full pages).
- **Examples:** `layout/*` (Card, DataTable, Modal, Skeleton), `schedule/DailyPlanner.tsx`.
- **Contrast:** Feature-specific screens often live under `src/features/**/ui` and `app/(dashboard)/**`; admin invoice modals live under `app/(dashboard)/admin/...` with Radix primitives.

### Other important roots

| Area | Purpose |
|------|---------|
| `app/` | Routes, layouts, Server Actions, API routes |
| `src/features/` | Vertical slices (e.g. `dashboards/worker`, `admin/quotes`, `auth`) |
| `src/shared/ui/` | Cross-cutting UI (e.g. `Sidebar`, `Breadcrumbs`) |
| `src/domain/` | Entities, enums, shared types |
| `prisma/` | Schema and migrations |

---

## 3. Authentication & Authorization

### `User` model (NextAuth session)

- **Table:** `User` in Prisma (`prisma/schema.prisma`).
- **Fields:** `email`, `password` (hashed via `bcryptjs` in `authorize`), optional `name`, and **`role` string** defaulting to **`"worker"`**.
- **Session:** JWT strategy; `callbacks.jwt` / `callbacks.session` copy **`user.role`** into the token and `session.user.role`.
- **Usage:** `app/(dashboard)/admin/layout.tsx` calls `getServerSession(authOptions)` and requires **`session.user.role === "admin"`** for the admin shell; otherwise redirects home.
- **Middleware:** `middleware.ts` uses `next-auth/middleware` `withAuth` so `/admin`, `/worker`, `/supervisor`, `/client` require **any** authenticated token — **fine-grained role checks** are done in layouts (admin) or client gates (worker — see below).

### `profiles` and RBAC in the database

- **`profiles`:** Domain identity for people in the business — `full_name`, `avatar_url`, `status`, optional **`user_id` → `User`** (`@relation("UserProfile")`). Employee operational data links here (e.g. `employee_details`, `employee_jobs`, `time_entries`).
- **`roles` / `user_roles` / `role_permission`:** Normalized **RBAC** — many-to-many from `profiles` to named `roles`, with optional `permissions`. This is the right place for **Owner vs Worker** (and supervisor, etc.) if modeled as rows in `roles` rather than only the string on `User`.
- **Today’s split:** **Route authorization for admin** relies on **`User.role === "admin"`** in the session. The **`profiles` + `user_roles`** graph is the **data model** for workforce and future fine-grained ACLs; wiring every screen to `user_roles` is not uniformly implemented in the NextAuth callback yet.

### Worker / client routes vs admin

- **Worker layout** (`app/(dashboard)/worker/layout.tsx`) wraps children in **`RoleGate`** (`src/features/auth/ui/RoleGate.tsx`), which currently checks a **browser cookie** (`mock-role`) via `getMockRole()` — **not** the NextAuth JWT. This is a **known inconsistency** with the admin layout’s server-side session check; consolidating on `getServerSession` + session role (or middleware role claims) is the intended hardening path.
- **Canonical admin login UI:** `app/login/page.tsx` uses **`signIn("credentials", …)`** from `next-auth/react` (real Prisma-backed auth). A **legacy mock login** component still exists at `src/features/auth/ui/LoginPage.tsx` for cookie-based demos — prefer the `/login` App Router page for production-style flows.

**Mental model:** **“Owner”** in product language maps to **`admin`** (and possibly a future `owner` role row in `roles`); **“Worker”** maps to default **`User.role`** and **`profiles`** used for assignments and time.

---

## 4. Responsive Strategy (Tailwind + Shadcn ecosystem)

### Tailwind CSS

- **Config:** `tailwind.config.ts`, global styles in `app/globals.css`.
- **Usage:** Utility-first layout everywhere — `flex`, `min-h-screen`, responsive breakpoints (`sm:`, `lg:`), dark mode classes (`dark:`).

### Shadcn / Radix

- **Shadcn** is configured via `components.json` (aliases, RSC, Tailwind, `lucide`). Many screens compose **Radix** primitives directly (e.g. `@radix-ui/react-dialog` in quote and invoice modals) plus **Sonner** toasts (`AdminShell`).
- **Pattern:** Accessible primitives + Tailwind styling; gradual adoption rather than a single `components/ui` barrel in all files.

### Mobile worker vs desktop admin

| Concern | Worker-oriented UI | Admin dashboard |
|--------|--------------------|-----------------|
| **Navigation** | `Sidebar` with `userRole="worker"`; **hamburger** (`Bars3Icon`) + overlay pattern for small screens (same sidebar component, mobile open state). | `AdminShell` + `Sidebar` with `userRole="admin"`; **lg:hidden** menu button to open sidebar on narrow viewports. |
| **Density** | Dashboards emphasize **cards**, stats, and task lists (`WorkerDashboard`, `TaskCard`, `StatsCard`) — touch-friendly spacing. | **Section headers**, data-heavy routes (`/admin/jobs`, `/admin/schedule`), tables (`DataTable` in shared components). |
| **Visual theme** | Neutral/gray worker shell vs admin **amber/brown gradient** chrome — different emotional affordance for “field” vs “office.” |

**Note:** Some worker views still use **demo filters** (e.g. hardcoded assignee names when reading tasks); tightening that to **session user ↔ `profiles` / jobs** is an implementation follow-up, not a stack limitation.

---

## 5. “Fresh” Data: Server Actions, Cache, and Mock Boundaries

The stack does **not** use WebSockets or Neon **real-time** subscriptions for general CRUD. **Freshness** is achieved with **server execution** + **Next.js cache invalidation** after writes.

### Server Actions (`app/actions/*`)

- **`"use server"`** modules: e.g. `quoteRequest.ts`, `quoteConversion.ts`, `schedulePlanner.ts`, `notifications.ts`, `dashboard.ts`.
- **Pattern:** Validate input → call `src/services/*` or Prisma → **`revalidatePath(...)`** so subsequent RSC navigations refetch server-rendered data.

### Revalidation (current code)

- **In use:** **`revalidatePath`** targeting admin routes (e.g. `/admin/quotes`, `/admin/jobs`, `/admin/schedule`) after quote and planner mutations.
- **Not observed in-repo:** `revalidateTag` / `fetch(..., { next: { tags } })` — reasonable **future** upgrade for finer-grained cache control.

### “No mock data” — where it holds vs where it doesn’t

- **Strong DB-only intent:** Comments and implementation in e.g. **`adminService.ts`** (“ONLY uses real database data”); **quote** and **schedule planner** actions/services are built around **Neon/Prisma**, not fixtures.
- **Remaining mock / static areas (honest inventory):** e.g. **`analyticsService.ts`** (in-memory trend mocks), **`settingsService.ts`** + **`mockStore`**, **`serviceCatalog.ts`** importing **`mockData`**, and **legacy mock login** / **RoleGate** cookie path. Treat these as **technical debt** when extending “single source of truth” from DB.

### How this differs from “real-time”

- **Server Actions + `revalidatePath`:** Data is fresh on **next navigation or refresh** after a mutation, and when Server Components run again.
- **For true push updates** (live job board), you’d add **polling**, **SSE**, or a **WebSocket** layer — not present in the default stack described here.

---

## 6. Quick Reference Map

| Concern | Primary location |
|---------|------------------|
| Env / DB URL | `process.env.DATABASE_URL`, `NEXTAUTH_SECRET` |
| Prisma client | `app/lib/prisma.ts` |
| Neon SQL helper | `src/lib/db.ts` (`neon(...)`) and per-service `neon()` |
| Auth config | `app/lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Route protection | `middleware.ts`, role layouts |
| Mutations + cache | `app/actions/*.ts` + `revalidatePath` |
| Domain types | `src/domain/entities.ts`, `models.ts` |

---

## 7. Related Docs

- [`SYSTEM_FLOW.md`](./SYSTEM_FLOW.md) — Quote → job → schedule → billing, enums, ER notes, Mermaid.
- [`README.md`](./README.md) — Setup, scripts, high-level architecture.
