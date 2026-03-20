# J&J Desert Landscaping LLC

**Professional landscaping services platform for Phoenix, Arizona.**

A full-stack web application that powers the public website and internal operations for J&J Desert Landscaping LLC—from SEO-optimized marketing and quote requests to admin dashboards, client and employee management, jobs, scheduling, invoices, and payments.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Installation & Setup](#installation--setup)
- [Folder & Code Structure](#folder--code-structure)
- [Usage Guide](#usage-guide)
- [UI/UX](#uiux)
- [Data & Functionality](#data--functionality)
- [System flow (source of truth)](#system-flow-source-of-truth)
- [Technical stack deep-dive](#technical-stack-deep-dive)
- [Functionality report (PM / roadmap)](#functionality-report-pm--roadmap)
- [AI app context (for agents)](#ai-app-context-for-agents)
- [Current features (QA map)](#current-features-qa-map)
- [Roadmap & schema gaps](#roadmap--schema-gaps)
- [Best Practices & Tips](#best-practices--tips)
- [Screenshots & Examples](#screenshots--examples)
- [Contributing](#contributing)
- [License & Credits](#license--credits)

---

## Project Overview

### Purpose

This application serves two main areas:

1. **Public website** — SEO-optimized marketing site for Phoenix, Arizona, promoting landscaping services and driving quote requests.
2. **Admin dashboard** — Authenticated back office for managing users, clients, employees, jobs, schedules, quotes, invoices, payments, and reports.

### Main Features

| Area | Features |
|------|----------|
| **Public** | Landing page, services section, testimonials, contact/CTA, request-quote flow, sitemap, JSON-LD (LocalBusiness) |
| **Admin** | Dashboard, user management (system users, roles, status), client directory (list, profile, communications, contracts, payments, properties, preferences, notes), employees, jobs, tasks, schedule, quotes, invoices, payments, reports, settings |
| **Client** | Dashboard, my services, schedule, billing |
| **Supervisor** | Dashboard, team overview, task management, analytics, schedule |
| **Worker** | Dashboard, my tasks, schedule, map view |

### Target Users

- **Business owners / admins** — Full system access, user/client/employee management, financials, reports.
- **Office staff** — Clients, jobs, quotes, invoices, scheduling.
- **Supervisors** — Team and task oversight, analytics, schedules.
- **Field workers** — Tasks, schedule, map.
- **Customers** — Request quotes, view services, schedule, billing (client portal).
- **General public** — Browse services and contact the company (marketing site).

---

## Tech Stack

### Core

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js](https://nextjs.org/) 15 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19 |
| **Styling** | Tailwind CSS 3, CSS variables, global design tokens |
| **Database** | [Neon](https://neon.tech/) (serverless Postgres) |
| **ORM / DB** | Prisma 5 with `@prisma/adapter-neon`, `@neondatabase/serverless` for serverless SQL |
| **Auth** | NextAuth.js 4 (Credentials + JWT, Prisma adapter) |

### UI & UX

| Category | Technology |
|----------|------------|
| **Icons** | Heroicons, Lucide React, React Icons |
| **Components** | Radix UI primitives, custom components, shadcn-style patterns |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form, Zod, @hookform/resolvers |
| **Charts** | Recharts |
| **Fonts** | Geist Sans / Geist Mono |

### Tooling & Dev

| Category | Technology |
|----------|------------|
| **Package manager** | pnpm 9 |
| **Lint** | Next.js ESLint |
| **Build** | Next.js (Turbopack in dev) |
| **Analytics** | Vercel Analytics |
| **Env / config** | dotenv, Next.js env |

### State & Data

- **Server state:** Neon serverless driver and Prisma in Server Components, API routes, or Server Actions.
- **Client state:** React (useState, useEffect), custom hooks (e.g. `useFormPersistence`, `usePagination`, `useAsync`).
- **No global store:** Feature-level state and server data fetching.

For a **codebase-level** breakdown (folder layering, auth nuances, responsive patterns, Server Actions vs mock leftovers), see **[`TECH_STACK.md`](./TECH_STACK.md)**.

---

## Installation & Setup

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 9 (`npm install -g pnpm`)
- **Neon** (or any Postgres) database

### 1. Clone and install

```bash
git clone <repository-url>
cd yarding-app
pnpm install
```

Post-install runs `prisma generate` automatically.

### 2. Environment variables

Copy the example env and fill in values:

```bash
cp .env.example .env
```

Edit `.env` with at least:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon (or Postgres) connection string; use **pooler** URL for serverless | `postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require` |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT/session (generate with `openssl rand -base64 32`) | Random 32+ char string |
| `NEXTAUTH_URL` | Full URL of the app (dev: `http://localhost:3000`) | `http://localhost:3000` |
| `NEXT_PUBLIC_SITE_URL` | Optional; used for SEO canonical and sitemap | `https://yourdomain.com` |

### 3. Database

Push the Prisma schema and (optionally) seed:

```bash
pnpm db:push
pnpm db:seed
```

Other scripts:

- `pnpm db:inspect` — Inspect DB
- `pnpm db:data` — Query data script
- `pnpm db:admin` — Seed admin user

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Production build

```bash
pnpm build
pnpm start
```

Set `DATABASE_URL` and `NEXTAUTH_*` in your hosting (e.g. Vercel) and use the pooler URL for Neon.

### Quick test (no DB)

For a quick local demo without a database, the app may fall back to mock auth or mock data in some flows; for full functionality (users, clients, jobs, etc.) a real database and env are required.

---

## Folder & Code Structure

```
yarding-app/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing routes
│   │   ├── layout.tsx            # Navbar + Footer
│   │   └── page.tsx              # Landing (SEO, JSON-LD)
│   ├── (dashboard)/              # Authenticated dashboard routes
│   │   ├── admin/                # Admin-only (layout guards role)
│   │   │   ├── layout.tsx        # Session check + AdminShell
│   │   │   ├── page.tsx          # Admin dashboard
│   │   │   ├── users/            # User management
│   │   │   ├── clients/          # Client directory
│   │   │   ├── employees/        # Employee management
│   │   │   ├── jobs/             # Jobs
│   │   │   ├── tasks/            # Tasks
│   │   │   ├── schedule/         # Schedule
│   │   │   ├── quotes/          # Quote requests
│   │   │   ├── payments/        # Payments
│   │   │   ├── invoices/        # Invoices
│   │   │   ├── reports/         # Reports
│   │   │   ├── analytics/       # Analytics
│   │   │   └── settings/        # Settings
│   │   ├── client/               # Client portal
│   │   ├── supervisor/           # Supervisor dashboard
│   │   ├── worker/               # Worker dashboard
│   │   └── request-quote/        # Quote request flow
│   ├── login/                    # Login page (NextAuth)
│   ├── api/                      # API routes (e.g. auth)
│   ├── layout.tsx                # Root layout (fonts, providers, analytics)
│   ├── globals.css               # Design tokens, Tailwind
│   ├── providers.tsx             # NextAuth provider
│   └── sitemap.ts                # SEO sitemap
├── src/
│   ├── domain/                   # Domain layer (DDD-style)
│   │   ├── entities.ts           # Core entities, value objects, enums
│   │   ├── models.ts             # Legacy/shared models
│   │   └── relationships.ts     # Aggregates, relationships
│   ├── features/                 # Feature-based UI and logic
│   │   ├── admin/                # Admin feature modules
│   │   │   ├── users/            # User management UI
│   │   │   ├── clients/          # Client directory, profile, tabs
│   │   │   ├── employees/       # Employee list, modals
│   │   │   ├── jobs/             # Jobs, forms, detail
│   │   │   ├── invoices/         # Invoices UI
│   │   │   └── ...
│   │   ├── auth/                 # Login, role gate, mock auth
│   │   ├── marketing/            # Landing, hero, services, testimonials
│   │   └── client/               # Client-facing features
│   ├── services/                 # Data access & business logic
│   │   ├── userService.ts        # Users, system users, roles
│   │   ├── clientService.ts      # Clients
│   │   ├── jobService.ts         # Jobs (Neon)
│   │   ├── invoiceService.ts     # Invoices (Neon)
│   │   ├── paymentService.ts     # Payments (Neon)
│   │   ├── contractService.ts    # Contracts (Neon)
│   │   ├── noteService.ts       # Job notes (Neon)
│   │   ├── communicationService.ts
│   │   ├── employeeService.ts
│   │   ├── scheduleService.ts
│   │   └── ...
│   ├── shared/                   # Shared UI and utilities
│   │   └── ui/                   # Sidebar, Navbar, Footer, DataTable, modals, etc.
│   ├── hooks/                    # useMediaQuery, useFormPersistence, usePagination, useAsync
│   ├── components/               # Layout components (Card, Button, Modal, etc.)
│   └── data/                     # Mock store (dev/fallback)
├── prisma/
│   └── schema.prisma             # DB schema (Postgres/Neon)
├── scripts/                      # DB seed, inspect, query
├── docs/                         # Architecture, roles, implementation notes
├── middleware.ts                 # NextAuth protection for /admin, /client, etc.
└── package.json
```

**Key modules**

- **`app/`** — Routes, layouts, and auth guards; marketing vs dashboard route groups.
- **`src/domain/`** — Single source of truth for entities and value objects (Client, Job, Invoice, etc.).
- **`src/features/`** — Role-specific UIs (admin, client, supervisor, worker) and marketing.
- **`src/services/`** — Typed services that talk to Neon/Prisma or mock data; used from server or via Server Actions/API.
- **`src/shared/ui/`** — Reusable layout and table/modal components used across features.

---

## Usage Guide

### For Visitors (Public)

1. Open the **homepage** (`/`) — hero, services, testimonials, contact/CTA.
2. Use **Request a Quote** (e.g. `/request-quote`) to submit project details.
3. Use **Call** or **Schedule Consultation** for direct contact.

### For Admins

1. Go to **Login** (`/login`), sign in with credentials.
2. You are redirected to **Admin** (`/admin`): dashboard with revenue, clients, tasks, system health.
3. **Sidebar** (or nav):
   - **User management** — System Users, Clients, Employees.
   - **Operations** — Jobs, Tasks, Schedule, Quotes.
   - **Financial** — Payments, Invoices, Reports.
4. **Clients:** open Client Directory → search/filter → open a client → use tabs: Profile, Communications, Contracts, Payment History, Properties, Preferences, Notes.
5. **Users:** list all system users, filter by role/status, open user detail → Edit, Disable, Reset Password, Impersonate, Delete (where implemented).
6. Use **Back to Website** on the login page to return to the public site.

### For Clients

1. Log in → **Client dashboard** (`/client`).
2. **My Services** — view services; **Schedule** — view appointments; **Billing** — view/pay invoices.

### For Supervisors

1. Log in → **Supervisor dashboard** (`/supervisor`).
2. **Team**, **Task Management**, **Analytics**, **Schedule** from the sidebar.

### For Workers

1. Log in → **Worker dashboard** (`/worker`).
2. **My Tasks**, **Schedule**, **Map View** from the sidebar.

### Protected Routes

Middleware protects:

- `/admin/*` — requires session; admin layout also enforces role.
- `/client/*`, `/supervisor/*`, `/worker/*` — require session.

Public by default: `/`, `/login`, `/request-quote`, and static assets.

---

## UI/UX

### Theme and Color Palette

The app uses a consistent design system defined in `app/globals.css`:

| Purpose | Token / Color | Usage |
|--------|----------------|--------|
| Primary green | `--primary-green` (#2e8b57) | CTAs, success, links |
| Accent brown | `--accent-brown` (#8b4513) | Secondary emphasis, earth tone |
| Accent tan | `--accent-tan` (#f5f1e6) | Backgrounds, cards |
| Success / status | `--success`, `--status-*` | Status badges, completed |
| Warning / error | `--warning`, `--error` | Alerts, validation |
| Neutrals | `--bg-primary`, `--text-primary`, etc. | Backgrounds and text |

Marketing pages use **emerald** CTAs and gradients; dashboard uses **green/brown/tan** for a professional, landscape-oriented look. Dark mode is supported via theme toggle and `dark:` classes.

### Responsiveness

- **Marketing:** Responsive layout; hero and sections stack on small screens; buttons and nav adapt.
- **Dashboard:** Sidebar collapses to overlay on mobile; tables can show card-style rows on small viewports; filters and actions wrap.

### Accessibility

- Semantic HTML and ARIA where needed (e.g. modals, dropdowns).
- Focus management in modals and forms.
- Sufficient contrast for text and interactive elements; theme tokens used consistently.

### Animations

- **Framer Motion** for list and card transitions, modals, and subtle motion (e.g. hero, services).
- Sidebar slide-in/out on mobile.
- Avoids heavy motion that could affect performance or accessibility.

---

## Data & Functionality

### Core Models (Domain)

Defined in `src/domain/entities.ts` and `models.ts`:

- **Client** — Contact info, addresses, status, segment, jobs, payments, preferences.
- **Job** — Client, status, address, tasks, materials, assignments, quoted/final price.
- **Invoice** — Client, job, line items, status, due/paid dates.
- **Payment** — Client, invoice, method, status, amount.
- **Contract** — Client, job, status, dates, value, signatures.
- **User / Profile** — Name, email, role, status, employee details, last login (from audit_logs).

Enums cover statuses (e.g. job, invoice, payment, contract, user) and segments.

### Data Flow

- **Server:** Neon (`@neondatabase/serverless`) and Prisma run in Server Components, API routes, or Server Actions. Do not call them from client-only code; use Server Actions or API routes so `DATABASE_URL` is only on the server.
- **Services:** `src/services/*` encapsulate CRUD and queries; many return typed DTOs (e.g. `ContractForUI`, `NoteForUI`) for the UI.
- **Client:** Pages and features fetch via server-side calls or by calling server actions; local state and hooks (e.g. `useFormPersistence`, `usePagination`) handle UI state.

### System flow (source of truth)

For **end-to-end lifecycle** (quotes → jobs → schedules → assignments → invoices), **status enums**, **entity relationships**, **Mermaid diagrams** (assignment + billing), and **referential integrity** on job completion, see:

**[`SYSTEM_FLOW.md`](./SYSTEM_FLOW.md)**

### Technical stack deep-dive

For **Neon + App Router + pnpm**, **layering** (`services` / `hooks` / `components`), **auth & roles** (`User` vs `profiles` / `user_roles`), **responsive admin vs worker UI**, and **Server Actions + cache invalidation** (vs remaining mock paths), see:

**[`TECH_STACK.md`](./TECH_STACK.md)**

### Functionality report (PM / roadmap)

For a **service-by-service CRUD inventory**, **hooks**, **lifecycle automation vs manual**, **equipment / materials / skills** gaps, **scheduler optimization**, and **roadmap** ideas, see:

**[`FUNCTIONALITY_REPORT.md`](./FUNCTIONALITY_REPORT.md)**

### AI app context (for agents)

**[`AI_APP_CONTEXT.md`](./AI_APP_CONTEXT.md)** — North Star principles, data dictionary, directory map, and environment rules so AI (and humans) can write code that matches this project.

### Current features (QA map)

What is **actually built and usable** (workflows, UI modules, Neon vs mock, role visibility): **[`CURRENT_FEATURES.md`](./CURRENT_FEATURES.md)**.

### Roadmap & schema gaps

**[`ROADMAP_GAPS.md`](./ROADMAP_GAPS.md)** — Compares **full DB potential** (`schema-summary.txt`) to the **current app**: logic gaps, workflow breaks, infrastructure needs, and **prioritized** action items for the next build cycle.

### Main CRUD and Queries

| Area | Examples |
|------|----------|
| Users | `getSystemUsers()`, `getUserById()`, `updateUserStatus()` |
| Clients | `getAllClients()`, `getClientById()`, create/update/delete (mock or API) |
| Jobs | `getJobsByClient()`, `getJobById()`, assignments, status updates |
| Invoices | `getInvoicesByClient()`, get/create/update (Neon) |
| Payments | `getPaymentsByClient()`, get/create (Neon) |
| Contracts | `getContractsByClient()` (Neon) |
| Notes | `getClientNotes()` (Neon, job_notes by client) |

Database schema is documented in `database-schema.txt` / `schema-summary.txt` and in Prisma; no schema changes are made by the app beyond migrations you run.

---

## Best Practices & Tips

### For Users

- Use a **pooler** connection string for Neon in production to avoid connection limits.
- Create at least one admin user (e.g. via `pnpm db:admin` or seed) to access the dashboard.
- Use **Back to Website** on the login page to return to the public site without logging out.

### For Developers

- **Do not** modify the database schema in this repo without a migration plan; the README and docs assume the existing schema.
- **Do not** add new backend services or APIs unless required; extend existing services and call them from Server Actions or API routes.
- Keep **domain types** in `src/domain/` and use them in services and UI; use DTOs (e.g. `ContractForUI`) where the UI shape differs from the domain.
- Use **typed services** with clear error handling and optional pagination/filtering for list endpoints.
- Prefer **server-side** execution for any code that uses `neon()` or `prisma`; avoid importing them in client bundles.
- Reuse **shared UI** (DataTable, modals, buttons, Sidebar) and hooks (`usePagination`, `useAsync`, `useFormPersistence`, `useMediaQuery`) for consistency.
- Run **typecheck** and **lint**: `pnpm typecheck`, `pnpm lint`.

---

## Screenshots & Examples

### Placeholder: Public homepage

_Add a screenshot of the landing page (hero + services + CTA)._

### Placeholder: Admin dashboard

_Add a screenshot of the admin dashboard (stats, charts, recent activity)._

### Placeholder: Client directory

_Add a screenshot of the client list and/or client profile with tabs._

### Placeholder: Mobile navigation

_Add a screenshot of the sidebar or mobile menu._

---

## Contributing

1. **Fork** the repository and create a feature branch.
2. Follow existing **code style** (TypeScript, Tailwind, feature-based structure).
3. **Domain** changes (entities, enums) go in `src/domain/`; keep services and UI in sync.
4. **Test** critical flows (login, client list, job list) and run `pnpm typecheck` and `pnpm lint`.
5. **Document** non-obvious behavior or env in this README or in `docs/`.
6. Open a **Pull Request** with a short description and, if needed, screenshots.

---

## License & Credits

- **Application:** J&J Desert Landscaping LLC platform.
- **Stack:** Next.js, React, Neon, Prisma, NextAuth, Tailwind, and other open-source libraries (see `package.json`).
- **License:** Private/proprietary unless otherwise stated in the repository.

For questions about the project or deployment, contact the repository maintainers or the business owner.
