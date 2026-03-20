# CURRENT_FEATURES.md — Functional Map (QA / PM)

**Purpose:** List what is **actually built and working** in the running application.  
**Format:** Narrative and tables only — **no code samples.**  
**Assumption:** `DATABASE_URL` (Neon) and `NEXTAUTH_SECRET` are set for production-style behavior unless noted.

**Related:** [`FUNCTIONALITY_REPORT.md`](./FUNCTIONALITY_REPORT.md) (service inventory), [`AI_APP_CONTEXT.md`](./AI_APP_CONTEXT.md) (architecture rules), [`ROADMAP_GAPS.md`](./ROADMAP_GAPS.md) (what is not done yet).

---

## 1. How to read this document

- **Production-backed (Neon):** The flow reads/writes **Postgres** when the app is configured with a live database.
- **UI complete / demo data:** The screen is polished, but list or CRUD data comes from **in-memory or static** sources—not the same rows as quote conversion or Neon jobs.
- **Auth:** **`/login`** uses **NextAuth** (real session for **admin**). **`/worker`**, **`/supervisor`**, **`/client`** use a **cookie role gate** that is **not** the NextAuth session—treat as **demo / staging** for those areas until auth is unified.

**“Owner”** = business operator using the **admin** experience after signing in as **`role === "admin"`**.

---

## 2. Operational workflows

### 2.1 Examples of completed, Neon-backed flows

These are **live** when Neon env vars are present:

- **Quote creation is live:** Public **request quote** submits through a **server action** into **`quote_requests`** (plus admin notification rows where implemented).
- **Admin quote management is live:** List, filters, detail, status updates, and related actions hit the database via **server actions**.
- **Quote → job conversion is live:** Approve-and-create-job creates or links **`clients`** and **`jobs`** (including **`quote_request_id`**), with path revalidation for admin quotes and jobs.
- **Daily scheduling write path is live:** **Daily Planner** creates **`schedules`**, **`schedule_jobs`**, and bulk **`employee_jobs`** through **server actions** (with crew-day collision warnings).
- **Basic schedule reading is live** (aggregated view): When **`DATABASE_URL`** is set, **`scheduleService`** loads **`schedule_jobs`** with **`schedules`**, **`jobs`**, and crew membership into the app’s schedule model (no mock fallback on that path).
- **Jobs lifecycle is live:** Job list, detail, create/update/delete, status, **tasks**, and **materials** use Neon-backed job service operations for records that exist in the database.
- **Crews and crew members are live:** Used by the planner and related APIs/services.
- **Payments (admin) are live:** Payment service reads/writes Neon; display may still mix **mock client names** where the UI uses the mock client service.
- **Admin dashboard KPIs are live:** Stats, activity, pending actions, health, equipment list snapshot, crew availability, upcoming schedule snippets, and related widgets use **Neon-backed** admin aggregation.
- **Equipment registry (list + add) is live** against Neon for the paths wired to the admin equipment page.
- **System users and employees (admin) are live:** Profile/role/employee flows against Neon (with known empty fallbacks if DB is unavailable at build).

### 2.2 UI built, data not fully Neon — “amber”

| Workflow | Status |
|----------|--------|
| **Admin client directory** | Rich UI (list, profile tabs, communications, contracts, payments, properties, preferences, notes). **Core client list CRUD** still uses **mock store**, so it may **not** match **`clients`** created by quote conversion. **Notes** and **contracts** substeps can still use Neon where wired. |
| **Admin invoices page** | Full UI (filters, modals, print). Data from **mock invoice store**, **not** the Neon **`invoiceService`** layer. |
| **Admin reports** | Charts and layout complete; metrics from **mock reports service**. |
| **Admin analytics** | Dashboard complete; series from **mock analytics service**. |
| **Admin settings** | UI complete; values **mock-backed**. |
| **Standalone admin communications** | Page exists; **mock communications service**. |

### 2.3 Weak or placeholder experiences

| Item | Status |
|------|--------|
| **Worker `/schedule`, `/tasks`, `/map`** | Same **worker dashboard** component as **`/worker`**—not separate schedule, task, or map experiences. |
| **Worker “my tasks”** | Tasks derive from Neon jobs but filter on a **fixed demo assignee**—not the real user. |
| **Client schedule** | Uses Neon-capable schedule/job reads but **“current client”** comes from **mock client list** (e.g. first client), not real account linkage. |

---

## 3. Component audit — UI modules

### 3.1 Admin (Owner) — mature UI

- **Shell:** Sidebar, section headers, mobile menu, toasts.
- **Dashboard:** Stats, revenue history, activity, pending actions, system health, equipment/crew/schedule widgets.
- **Users:** Table, filters, modals, detail, CRUD (Neon-backed profiles/roles).
- **Employees:** List, form, **employee detail** (admin view of a worker record), time-tracking modal.
- **Clients:** Directory, profile shell, tabs (analytics, communications, contracts, payments, properties, preferences, notes)—**see §2.2** for mock vs Neon on core list.
- **Jobs:** **Job list** (filters, stats, cards/table), job form, **job detail**, cost calculator integration.
- **Tasks:** Admin task list mapped from jobs (legacy “task” model).
- **Quotes:** Quote request table, stats, detail modal (job-site address, approve-to-job).
- **Schedule:** **Daily Planner** (date, crew, multi-job select, warnings, submit)—not a full calendar month grid.
- **Invoices:** Interactive UI (**mock data** on this page).
- **Payments:** Interactive UI (**Neon**, client-label caveat).
- **Reports / Analytics:** Polished pages (**mock data**).
- **Equipment:** List, filters, add modal, detail route (**Neon** for list/add paths).
- **Settings:** Templates and preferences UI (**mock data**).

### 3.2 Worker-facing UI

- **Worker dashboard:** Sidebar, stat cards, task list region, header—**functional shell**.
- **Dedicated worker profile screen:** **Not present** as a standalone “my profile” page for the worker role; **admin** has **employee detail** for staff records.
- **Worker schedule / tasks / map routes:** **Placeholders** (duplicate dashboard).

### 3.3 Supervisor

- **Supervisor dashboard:** Charts, task cards, worker cards, stats.
- **Team, tasks, schedule, analytics routes:** Present with supervisor layout; depth varies; data from task/worker pipelines tied to Neon where services support it.

### 3.4 Client

- **Dashboard, services, schedule, billing** pages with consistent layout.
- **Schedule:** See §2.3 for identity caveat.

### 3.5 Public and auth

- **Marketing landing** and **request quote** journey.
- **`/login`:** NextAuth credentials (**admin** portal).
- **Legacy mock-login UI** (feature folder): for cookie-based role demos—not the default **`app/login`** page.

---

## 4. Integration status — services vs Neon

**Neon-backed for real reads/writes (when env is set):**  
Admin aggregation service, quote request and quote-conversion flows (Prisma/actions), job service, assignment service, schedule planner service, schedule service (database path), **invoice service in the codebase** (service layer), payment service, contract service, note service, user service, employee service, crew service, time tracking service, equipment list/add via admin service paths.

**Important nuance:** The **admin Invoices screen** does **not** call the Neon invoice service today—it uses the **mock store**.

**Not Neon-backed (mock or static):**  
Client service, communication service, settings service, reports service, analytics service, service catalog (static), testimonials (static), mock-backed **admin invoice page**.

---

## 5. User roles — what each role sees

### 5.1 Owner (Admin)

- **Sees:** Full **`/admin`** navigation: dashboard, users, clients, employees, jobs, tasks, quotes, daily planner, invoices (UI), payments, equipment, reports, analytics, settings.
- **Can rely on Neon for:** Quotes, quote→job, jobs, crews, planner-created schedules, payments, equipment registry (wired paths), dashboard aggregates, users/employees, contracts/notes where those tabs use real services.
- **Treat as non-production data until rewired:** Invoices page, reports, analytics, settings, **core client directory CRUD** vs Neon clients from quotes.

### 5.2 Worker

- **Sees:** **`/worker`** dashboard UI (repeated on sub-routes).
- **Data:** Job-derived tasks from Neon **without** real user scoping (demo filter).
- **Auth:** Cookie role gate—not the same guarantees as NextAuth admin.

### 5.3 Supervisor

- **Sees:** **`/supervisor`** dashboard and linked sections (team, tasks, schedule, analytics).
- **Auth:** Same cookie caveat as worker.

### 5.4 Client

- **Sees:** **`/client`** dashboard, services, schedule, billing.
- **Schedule data:** Mixed—Neon-capable reads with **mock-picked** client identity.

---

## 6. Summary snapshot

| Area | Production-backed | Strong UI, weak / mock data |
|------|-------------------|-----------------------------|
| Quotes & quote→job | Yes | — |
| Daily planner & schedule writes | Yes | — |
| Schedule reading (schedule service) | Yes | — |
| Jobs, crews, assignments, time entries | Yes | — |
| Admin dashboard & equipment list | Yes | — |
| Users / employees | Yes | — |
| Payments | Mostly yes | Client labels may mix mock |
| Clients (directory CRUD) | No | Yes |
| Invoices (admin page) | No | Yes |
| Reports & analytics | No | Yes |
| Settings | No | Yes |
| Worker / client / supervisor portals | Partial | Yes (auth + personalization gaps) |

---

*Re-verify after auth unification, invoice UI rewiring, or client service migration to Neon.*
