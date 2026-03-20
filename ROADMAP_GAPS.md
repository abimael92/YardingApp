# ROADMAP_GAPS.md — Schema Potential vs Built Product

**Audience:** Product strategists and senior developers; **next AI agent** picking up implementation work.  
**Inputs:** Full database shape from **`schema-summary.txt`** (and **`database-schema.txt`**). This repository does **not** include a committed **`schema.sql`**—use those files (or add `schema.sql` from `pg_dump --schema-only` and link it here). Current product reality: **`CURRENT_FEATURES.md`**, **`FUNCTIONALITY_REPORT.md`**, **`AI_APP_CONTEXT.md`**.

**Goal:** A **gap analysis** and **prioritized to-do list** so you know exactly where the app **lags behind the database’s potential**.

---

## 1. Executive summary

The **Postgres schema** describes a **mature landscaping ERP**: inventory, plants, formal quotes, billing queues, equipment lifecycle, rich client communications, reporting metadata, and audit trails.

The **application** delivers a **strong operational core**: **`quote_requests` → jobs → daily planner (`schedules` / `schedule_jobs` / `employee_jobs`) → payments** (and related admin dashboards, crew APIs, Neon job CRUD).

**Everything else in the schema** is either **unused**, **partially used**, or **disconnected from production UI**—that is the gap this document tracks.

---

## 2. Logic gaps — DB has the data model; app lacks UI and/or services

*Examples of what “logic gap” means here:* **Equipment tracking exists in SQL (`equipment`, `equipment_assignments`, maintenance tables) but there is no assignment dashboard or checkout workflow**—only a partial equipment registry UI. Same pattern applies across domains below.

### 2.1 Billing & revenue

| Schema / area | Missing or incomplete in app |
|---------------|------------------------------|
| **`billing_queue`** | No processor (cron/worker) or UI to drive **job → invoice** (or retry) async work. |
| **`invoice_line_items`** | Schema supports normalized lines; **Neon `invoiceService` exists**, but **admin Invoices page uses mock data**—no end-to-end management of real invoice rows in that UI. |
| **`quotes`** (table) | Formal **`quotes`** are not wired into the same lifecycle as **`quote_requests`**. |
| **`refunds`**, **`payouts`**, **`transactions`** | Ledger depth exists; **no** first-class admin flows for refunds/payouts; transactions not fully surfaced. |
| **`payment_intents`** | Schema supports intent state machine; UI may not expose full **intent → payment** journey. |

### 2.2 Client CRM (beyond single row on `clients`)

| Schema | Gap |
|--------|-----|
| **`client_addresses`** | Multi-property model; **no** confirmed Neon CRUD + UI persistence for admin “properties.” |
| **`client_preferences`** | Consent, timezone, notification JSON—**no** Neon-backed preferences UI. |
| **`client_communications`** | Threaded comms + attachments metadata—**standalone communications** uses **mock**, not this table. |
| **`communication_reminders`**, **`communication_templates`** | No job to send reminders; templates not tied to outbound sends. |

### 2.3 Equipment (beyond list/add)

| Schema | Gap |
|--------|-----|
| **`equipment_assignments`** | No service/UI to assign equipment to **jobs** or **workers** or track **returned_at**. |
| **`equipment_documents`**, **`equipment_fuel_logs`**, **`equipment_maintenance_*`**, **`equipment_purchase_plans`**, **`equipment_training_requirements`** | No operational modules. |
| **`employee_equipment_certifications`** | Not used in planner or compliance checks. |

### 2.4 Workforce

| Schema | Gap |
|--------|-----|
| **`employee_skills`** | **Not referenced** in TypeScript; assignments do **not** filter by skill. |

### 2.5 Job execution & media

| Schema | Gap |
|--------|-----|
| **`job_photos`** | **No** image upload, storage, or gallery (see §4). |
| **`job_milestones`**, **`job_progress`** | No drivers beyond / alongside **`job_tasks`**. |
| **`locations`** | No first-class site library feature. |

### 2.6 Inventory & purchasing

| Schema | Gap |
|--------|-----|
| **`materials`**, **`stock_movements`**, **`suppliers`**, **`purchase_orders`**, **`purchase_order_items`** | **`job_materials`** does not post consumption to stock or POs. |
| **`plant_catalog`**, **`plant_inventory`**, **`plant_usage`** | No nursery/plant features. |

### 2.7 Scheduling & routing

| Schema | Gap |
|--------|-----|
| **`route_optimization`** | No integration or UI. |
| **`crew_jobs`** | Unclear vs **`schedule_jobs`**; **alignment** undocumented—risk of dead or duplicate model. |

### 2.8 Reporting & dashboards

| Schema | Gap |
|--------|-----|
| **`report_definitions`**, **`saved_reports`** | Reports UI is **mock**; these tables unused. |
| **`dashboard_widgets`**, **`user_dashboards`**, **`dashboard_widget_assignments`** | Admin dashboard is **fixed layout**, not user-configurable. |

### 2.9 Governance

| Schema | Gap |
|--------|-----|
| **`audit_logs`** | No automatic append on mutations; no admin **audit timeline** UI. |
| **`permissions`**, **`role_permission`**, **`user_roles`** vs **`User.role`** | DB RBAC richer than route checks; **fine-grained enforcement** largely missing. |

### 2.10 Contracts (extended)

| Schema | Gap |
|--------|-----|
| **`contract_templates`**, **`contract_amendments`** | No template/amendment workflows beyond basic contract reads where implemented. |

### 2.11 Prisma vs Neon drift

| Issue | Impact |
|-------|--------|
| **`schedules`**, **`schedule_jobs`**, **`crews`**, **`crew_members`** in Neon but **absent from `prisma/schema.prisma`** | Raw SQL only for those areas; easier drift and weaker agent discoverability. |

---

## 3. Workflow gaps — broken or incomplete links between features

*Concrete examples the product does not fully close today:*

| Workflow gap | What’s wrong |
|--------------|--------------|
| **Jobs → Invoices** | **Jobs cannot yet be converted to invoices** through a guided, reliable product flow: **`billing_queue`** is unused; no standard **“complete job → draft invoice”** action; admin invoice screen is **mock**. |
| **Crew / planner → workers** | **Crew assignments do not trigger worker notifications** (push, SMS, email, or durable in-app feed tied to **`profiles`**). |
| **Quote request → formal quote** | **`quote_requests`** are live; **`quotes`** table is not part of one unified commercial workflow. |
| **Single client truth** | Neon **`clients`** from quote conversion vs **mock client directory**—**split brain** for operators. |
| **Schedule actuals** | **`time_entries`** service exists; **not** tightly coupled to **`schedule_jobs`** actual start/end/status in one field workflow. |
| **Equipment on job** | Scheduled jobs have **no** linked **`equipment_assignments`**. |
| **Line items pipeline** | No enforced path from **`job_items`** / **`job_materials`** into **`invoice_line_items`**. |
| **Auth identity** | **Worker / client / supervisor** routes use **cookie role**; not aligned with **NextAuth + `profiles.user_id`**—**“my jobs”** and **“my schedule”** cannot be trustworthy for production. |

---

## 4. Infrastructure & platform needs

| Need | Ties to schema / product |
|------|---------------------------|
| **Image upload for job photos** | **`job_photos`** + object storage (S3/R2/Vercel Blob), signed uploads, Server Action or API route, access control. |
| **Real-time GPS status for workers** | No ingestion pipeline, map layer, or privacy/consent flow; would extend worker mobile story. |
| **Object storage (general)** | **`equipment_documents`**, communication **attachments** metadata. |
| **Background worker / queue** | Drain **`billing_queue`**, send reminders, heavy report generation. |
| **Real-time / push** | Schedule changes, assignment alerts—**SSE/WebSocket** or **FCM/APNs**; today mostly **revalidatePath** freshness. |
| **Email provider** | Operational use of **`communication_templates`**, not only UI editors. |
| **Observability** | Structured logs + optional **`audit_logs`** writers for compliance. |
| **Prisma completion or documented SQL module** | Scheduling/crew tables documented for agents. |

---

## 5. Prioritized action items (to-do for the next agent)

### High priority — core business loop & data truth

1. **Connect admin Invoices UI to Neon** — use existing **`invoiceService`** (and **`invoice_line_items`** per schema); remove mock invoice store from that page.  
2. **Implement job → draft invoice** — server action + optional **`billing_queue`**; populate lines from **`job_items`** / **`job_materials`**.  
3. **Replace mock `clientService` with Neon/Prisma CRUD** — align admin clients with **`clients`** from quotes.  
4. **Unify auth** — NextAuth session + **`profiles`** for workers/clients; deprecate cookie-only production use.  
5. **Personalize worker data** — filter tasks/schedule by **logged-in profile**, not demo constants.  
6. **Assignment notifications** — on **`employee_jobs` / `schedule_jobs`** changes: extend **`admin_notifications`** or add worker-facing notifications + email/push backlog.  
7. **Batch SQL in `createWorkDay`** — reduce per-row round-trips at scale.  
8. **Add Prisma models or a single “scheduling SQL module” doc** for **`schedules` / `schedule_jobs` / `crews` / `crew_members`**.

### Secondary — nice to have / operational depth

1. **`equipment_assignments`** service + admin/worker UI (check-out/return).  
2. **`employee_skills`** + job requirements + planner validation.  
3. **`job_photos`** gallery + upload pipeline.  
4. **Inventory** — **`job_materials`** ↔ **`materials`** / **`stock_movements`**.  
5. **Plant modules** (`plant_*`) if in scope.  
6. **`route_optimization`** (heuristic or integrated solver).  
7. **Reports** — SQL-driven or **`report_definitions`** / **`saved_reports`**.  
8. **Configurable dashboards** (`dashboard_widgets`, `user_dashboards`).  
9. **`audit_logs`** automation + read-only admin view.  
10. **Formal `quotes`** workflow vs **`quote_requests`**.  
11. **GPS + live map** (policy, mobile app, late phase).  
12. **Refunds / payouts / full `transactions` UI**.  
13. **`client_addresses` / `client_preferences` / real `client_communications`**.  

---

## 6. How the next agent should use this list

1. Open **`CURRENT_FEATURES.md`** — confirm what is already **green**.  
2. Open **`schema-summary.txt`** — confirm columns and FKs for the tables you touch.  
3. Check **`prisma/schema.prisma`** — add models or stay in raw SQL intentionally.  
4. Implement **Server Actions** → **`src/services`** → UI; keep **`DATABASE_URL`** server-only (**`AI_APP_CONTEXT.md`**).  
5. After shipping: update **`CURRENT_FEATURES.md`**, **`FUNCTIONALITY_REPORT.md`**, **`SYSTEM_FLOW.md`** as needed.

---

*Schema reference: **`schema-summary.txt`**. Add **`schema.sql`** to the repo when available and reference it in the header of this file.*
