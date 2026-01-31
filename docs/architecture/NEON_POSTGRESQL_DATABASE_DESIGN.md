# Neon Serverless PostgreSQL — Database Design Document

**Application:** Yarding-App (J&J Desert Landscaping)  
**Target:** Neon Serverless PostgreSQL — production-grade, implementation-ready.  
**Scope:** Full domain, relations, constraints, enums, metadata, security, performance, and DDL.  
**Constraints:** No placeholders; no breaking assumptions; analysis first, then schema. Document only — no application code.

---

## Part 1 — Full Domain Analysis

### 1.1 Core Entities and Sub-Entities

| Entity | Type | Sub-entities / Children | Description |
|--------|------|-------------------------|--------------|
| **User** | Root | — | Auth identity; role (Admin/Client/Supervisor/Worker); links to Employee or Client via optional FK. |
| **Role** | Lookup | Permission (via junction) | Named role for RBAC; permissions attached via role_permission. |
| **Client** | Root | — | Customer master: contact, address, status, segment, monetary aggregates. |
| **Employee** | Root | — | Internal worker: identity, role, status, availability, performance. |
| **Service** | Root | — | Catalog offering: name, category, price display, duration, features. |
| **QuoteTemplate** | Root | QuoteTemplateLineItem | Reusable quote skeleton; line items reference Service. |
| **Quote** | Root | QuoteLineItem | Estimate for a Client; line items (serviceId, qty, unit price); lifecycle states. |
| **Job** | Root | JobTask, JobMaterial | Work order from Client; optional Quote; tasks and materials; schedule and financial links. |
| **Schedule** | Root | — | Time slot linking Job to one or more Employees (via junction). |
| **Invoice** | Root | InvoiceLineItem | Bill to Client; optional Job; line items; status draft → sent → paid/overdue/cancelled. |
| **PaymentIntent** | Root | — | Intent to charge (before capture); links to Invoice/Client; status until succeeded/cancelled. |
| **Payment** | Root | — | Settled charge: Client pays; links to Invoice, Job; amount, method, processor, timestamps. |
| **Refund** | Root | — | Reversal of Payment (full or partial); amount, reason, processor_refund_id, status. |
| **Payout** | Root | — | Company pays out (e.g. to Employee/vendor); amount, payee, status, optional Job reference. |
| **Transaction** | Root | — | Immutable ledger row: type (payment | refund | payout), amount_cents, references; for reporting. |
| **Communication** | Root | — | Message (email/SMS/in-app) linked to Client, Employee, Job, or Quote; direction, status. |
| **AuditLog** | Root | — | Who did what to which entity; entity_type, entity_id, action, actor_id, old/new values (JSONB). |
| **SystemConfig** | Root | — | Key-value config (tax rate, company name, timezone, etc.). |
| **CalculationHistory** | Root | — | Job cost calculator audit: inputs and breakdown (JSONB); link to Job. |

### 1.2 How Users, Services, Jobs, and Payments Correlate

- **Users** authenticate and have a **Role**. Optionally, a User is bound to one **Employee** (staff) or one **Client** (customer) via `user_id` on those tables.
- **Services** are catalog offerings. **Quotes** and **QuoteTemplates** reference Services in line items. **Jobs** are created from accepted Quotes or ad hoc; Jobs do not store a direct Service FK — the link is Quote → QuoteLineItem.service_id → Service.
- **Jobs** belong to a **Client**, optionally to a **Quote**. A **Schedule** assigns a Job to **Employee(s)**. When billed, a Job may have one **Invoice** (job.invoice_id). An **Invoice** is for one Client and optionally one Job; it has line items (optionally tied to a service for display).
- **Payments** flow: Client pays company. **PaymentIntent** is created for an Invoice (or ad hoc) with amount and status (e.g. requires_payment_method → processing → succeeded). On success, a **Payment** row is created (and optionally a **Transaction** ledger row). **Refunds** reference the Payment and store amount and status. **Payouts** are company → payee (Employee/vendor), separate from client payments.
- **Ownership**: Client owns Quotes, Jobs, Invoices, PaymentIntents, Payments (client_id). Job owns JobTasks, JobMaterials, Schedules. Invoice owns InvoiceLineItems. Quote owns QuoteLineItems. Payment owns Refunds.

### 1.3 Ownership and Lifecycle (Summary)

| Entity | Owner | Lifecycle |
|--------|--------|-----------|
| User | — | Created → Active/Pending/Inactive; no delete (soft only). |
| Client | created_by (Employee id) | Created → Active/Inactive/Pending/Suspended; soft delete. |
| Quote | Client | Draft → Sent → Viewed → Accepted/Rejected/Expired/Revised. |
| Job | Client | Draft → Quoted → Scheduled → In progress → Completed | Cancelled | On hold. |
| Schedule | Job | Scheduled → In progress → Completed | Cancelled | Rescheduled. |
| Invoice | Client | Draft → Sent → Paid/Overdue | Cancelled. |
| PaymentIntent | Client (via Invoice) | requires_payment_method → requires_confirmation → processing → succeeded | cancelled. |
| Payment | Client | Pending → Processing → Completed | Failed. |
| Refund | Payment | Pending → Succeeded | Failed | Cancelled. |
| Payout | — (company) | Pending → Processing → Completed | Failed | Cancelled. |

---

## Part 2 — Relational Data Model

### 2.1 One-to-One, One-to-Many, Many-to-Many

| Relation | Cardinality | Implementation |
|----------|-------------|----------------|
| User → Employee | 0..1 : 1 | employee.user_id → users.id |
| User → Client | 0..1 : 1 | client.user_id → users.id |
| Role → User | 1 : N | users.role_id → roles.id |
| Role ↔ Permission | M : M | role_permission(role_id, permission_id) |
| Client → Quote, Job, Invoice, PaymentIntent, Payment, Communication | 1 : N | FK on child |
| Quote → QuoteLineItem | 1 : N | quote_line_items.quote_id |
| Quote → Job | 1 : 0..1 | job.quote_id (when converted) |
| Job → Quote | 0..1 : 1 | job.quote_id |
| Job → JobTask, JobMaterial | 1 : N | FK on child |
| Job → Invoice | 0..1 : 1 | job.invoice_id, invoice.job_id (one direction authoritative: job.invoice_id) |
| Job ↔ Employee (assignments) | M : M | job_assignment(job_id, employee_id) |
| Job → Schedule | 1 : N | schedule.job_id |
| Schedule ↔ Employee | M : M | schedule_assignment(schedule_id, employee_id) |
| Invoice → InvoiceLineItem | 1 : N | invoice_line_items.invoice_id |
| PaymentIntent → Payment | 1 : 0..1 | payment.payment_intent_id (when succeeded) |
| Payment → Refund | 1 : N | refund.payment_id |
| Payment → Transaction | 1 : 1 (per payment) | transaction.payment_id (nullable; refund/payout have their own) |
| Refund → Transaction | 1 : 1 | transaction.refund_id |
| Payout → Transaction | 1 : 1 | transaction.payout_id |
| Service → QuoteLineItem, QuoteTemplateLineItem | 1 : N | service_id on line item |
| Communication → Client, Employee, Job, Quote | N : 0..1 | Optional FKs on communication |

### 2.2 Junction Tables

| Table | Purpose | PK | FKs |
|-------|---------|-----|-----|
| role_permission | Role ↔ Permission | (role_id, permission_id) | role_id → roles, permission_id → permissions |
| job_assignment | Job ↔ Employee | (job_id, employee_id) | job_id → jobs, employee_id → employees |
| schedule_assignment | Schedule ↔ Employee | (schedule_id, employee_id) | schedule_id → schedules, employee_id → employees |

### 2.3 Foreign Key Strategy

- **Naming:** `{table_singular}_{referenced_table_singular}_id` (e.g. `client_id`, `invoice_id`).
- **Nullability:** FK nullable only where relationship is optional (e.g. `job_id`, `quote_id`, `invoice_id` on payments).
- **Cascade:**
  - **ON DELETE RESTRICT:** Client, User, Service, Role — prevent delete if children exist (or use soft delete so no hard delete).
  - **ON DELETE CASCADE:** QuoteLineItem (when Quote deleted), JobTask, JobMaterial (when Job deleted), InvoiceLineItem (when Invoice deleted), ScheduleAssignment (when Schedule deleted), JobAssignment (when Job deleted), Refund (when Payment deleted), Transaction (when Payment/Refund/Payout deleted if we ever delete those — prefer soft delete).
  - **ON DELETE SET NULL:** Optional FKs (e.g. job.invoice_id when Invoice soft-deleted: set null or keep and filter by deleted_at). Recommendation: soft delete only; never hard-delete Invoice/Payment, so no SET NULL needed for payment/invoice refs.
- **Unique:** At most one Invoice per Job: `job.invoice_id` UNIQUE. At most one Job per Quote: `quote.job_id` UNIQUE (or job.quote_id UNIQUE). One Payment per PaymentIntent when succeeded: `payment.payment_intent_id` UNIQUE.

---

## Part 3 — Enums & Status Modeling

PostgreSQL **ENUM** types are used for fixed, application-defined states to avoid magic strings and to document allowed values. Use **lookup tables** (e.g. `roles`, `permissions`) where values may be extended by config or admin.

### 3.1 PostgreSQL ENUMs (Create Before Tables)

| Enum Name | Values | Use Case |
|-----------|--------|---------|
| user_status | 'active', 'pending', 'inactive' | users.status |
| client_status | 'active', 'inactive', 'pending', 'suspended' | clients.status |
| client_segment | 'vip', 'regular', 'new', 'at_risk' | clients.segment |
| quote_status | 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised' | quotes.status |
| job_status | 'draft', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold' | jobs.status |
| schedule_status | 'scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled' | schedules.status |
| invoice_status | 'draft', 'sent', 'paid', 'overdue', 'cancelled' | invoices.status |
| payment_intent_status | 'requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'cancelled' | payment_intents.status |
| payment_status | 'pending', 'processing', 'completed', 'failed' | payments.status |
| payment_method_type | 'credit_card', 'debit_card', 'ach', 'check', 'cash', 'other' | payments.method, payment_intents.method |
| refund_status | 'pending', 'succeeded', 'failed', 'cancelled' | refunds.status |
| payout_status | 'pending', 'processing', 'completed', 'failed', 'cancelled' | payouts.status |
| payout_payee_type | 'employee', 'vendor' | payouts.payee_type |
| communication_type | 'email', 'sms', 'in_app', 'push', 'phone' | communications.type |
| communication_direction | 'inbound', 'outbound' | communications.direction |
| communication_status | 'draft', 'sent', 'delivered', 'read', 'failed' | communications.status |
| task_priority | 'low', 'medium', 'high', 'urgent' | job_tasks.priority |
| job_task_status | 'pending', 'in_progress', 'completed', 'skipped' | job_tasks.status |
| transaction_type | 'payment', 'refund', 'payout' | transactions.type |

### 3.2 Lookup Tables (Roles & Permissions)

- **roles:** id (PK), name (UNIQUE), description. Example rows: Admin, Client, Supervisor, Worker.
- **permissions:** id (PK), code (UNIQUE), description. Example: invoices.create, jobs.assign, etc.
- **role_permission:** role_id, permission_id; PK (role_id, permission_id). Enables RBAC without changing schema when new permissions are added.

---

## Part 4 — Metadata Strategy (JSONB vs Relational)

| Data | Choice | Reason |
|------|--------|--------|
| Payment processor response (Stripe/PayPal payload) | **JSONB** | Structure varies by provider; we don’t query inside it for filters/joins. |
| PaymentIntent metadata (e.g. idempotency key, return URL) | **JSONB** | Optional, variable shape. |
| Schedule recurring_pattern (frequency, interval, end_date) | **JSONB** | Nested, rarely filtered by inner keys; one column per schedule. |
| Communication attachments (array of {name, url, mime_type, size}) | **JSONB** | Variable length; no FK to attachments table required for MVP. |
| Communication template_variables | **JSONB** | Key-value map; not used in WHERE. |
| AuditLog old_values / new_values | **JSONB** | Arbitrary entity snapshots; query by entity_type/entity_id/action, not by field. |
| CalculationHistory inputs, breakdown | **JSONB** | Structured but not normalized; used for display/replay only. |
| QuoteTemplate line items (if stored as single blob) | **Relational** | Prefer quote_template_line_items table for consistency with quotes. |

**JSONB rules:** Use for variable or provider-specific payloads; do not rely on JSONB keys for critical uniqueness or foreign keys. Prefer relational columns for anything used in WHERE, JOIN, or UNIQUE. Limit size where appropriate (e.g. audit log payloads capped by application).

---

## Part 5 — Security & Integrity

### 5.1 Row-Level Security (RLS) Readiness

- **Tenant isolation:** If the app becomes multi-tenant, add `tenant_id` (or `organization_id`) to all business tables and enable RLS so that each role sees only rows where `tenant_id = current_setting('app.tenant_id')`. This document does not add `tenant_id` but the schema is RLS-ready: all tables have clear ownership (e.g. client_id) so policies can be written as “user can see row if user’s client_id = row.client_id” or “user is admin”.
- **Recommendation:** Create RLS policies in a follow-up migration after schema is stable; use service role for server-side API to bypass RLS if all authorization is in app layer.

### 5.2 Soft Deletes vs Hard Deletes

- **Soft delete:** Use `deleted_at TIMESTAMPTZ` on: users, clients, employees, services, quotes, jobs, schedules, invoices, payment_intents, payments, refunds, payouts, communications. When `deleted_at IS NOT NULL`, row is considered deleted. Unique constraints that must remain unique only among “live” rows use a **partial unique index**: `CREATE UNIQUE INDEX ... ON invoices (invoice_number) WHERE deleted_at IS NULL;`
- **Hard delete:** Do not hard-delete payments, refunds, or invoices (compliance/audit). Optional: allow hard delete only for draft quotes, draft invoices, cancelled payment_intents with no payment. Prefer soft delete everywhere for audit trail.

### 5.3 Audit Fields

Every main entity table includes:

| Column | Type | Meaning |
|--------|------|--------|
| created_at | TIMESTAMPTZ NOT NULL DEFAULT now() | Row creation time (UTC). |
| updated_at | TIMESTAMPTZ NOT NULL DEFAULT now() | Last update time; application must set on every update. |
| deleted_at | TIMESTAMPTZ NULL | Soft delete time; NULL = active. |
| created_by | UUID NULL | User or Employee id who created the row (optional; use when available). |
| updated_by | UUID NULL | User or Employee id who last updated (optional). |

Payment and refund tables additionally: `processed_at`, `completed_at`, `failed_at`, `refunded_at` as appropriate.

---

## Part 6 — Performance & Scaling (Neon-Specific)

### 6.1 Indexing Strategy

- **Primary keys:** All tables use `id UUID PRIMARY KEY DEFAULT gen_random_uuid()` (or `id BIGINT GENERATED ALWAYS AS IDENTITY` if you prefer). UUID avoids coordination and is friendly to distributed and serverless.
- **Foreign keys:** Index every FK column used in JOINs and WHERE (Neon/Postgres already creates indexes on PK; create explicit indexes on FK columns): e.g. `client_id`, `job_id`, `invoice_id`, `payment_id`, `quote_id`, `schedule_id`, `employee_id`.
- **Status + date:** Composite indexes for common filters: `(client_id, status)`, `(status, created_at)`, `(invoice_id, status)`, `(job_id, status)` where dashboards filter by status and date.
- **Uniqueness with soft delete:** Partial unique indexes: `(invoice_number) WHERE deleted_at IS NULL`, `(quote_number) WHERE deleted_at IS NULL`, `(job_number) WHERE deleted_at IS NULL`, `(payment_number) WHERE deleted_at IS NULL`, `(payment_intent_id) WHERE deleted_at IS NULL` on payments.

### 6.2 Read/Write Patterns

- **Read-heavy:** Quotes list by client, jobs list by client/employee, invoices list by client/status, payments by invoice. Indexes above support these.
- **Write:** Single-row inserts/updates (payments, refunds, status changes). Keep transactions short: one payment intent → one payment in one small transaction window.

### 6.3 Serverless Considerations

- **Connection pooling:** Use Neon’s pooler (transaction or session mode). Application opens one connection per serverless invocation and releases quickly.
- **Cold starts:** Schema is static; no schema changes in request path. Prepared statements can be used for hot paths (payment insert, status update).
- **Transaction length:** Minimize lock hold time. For “create payment intent then later confirm”: create PaymentIntent in one tx; confirm and create Payment in a second tx with idempotency key so duplicate requests do not double-charge.

### 6.4 Safe Transaction Boundaries for Payments

- **Idempotency:** For payment confirmation, require an idempotency key (e.g. stored on PaymentIntent or in a small `payment_idempotency_keys(key, payment_intent_id, created_at)` table). Within one transaction: check key; if not seen, create Payment and mark key used; commit. On duplicate key, return existing Payment.
- **Balance / double-spend:** Do not derive “invoice paid” from a single balance column that is updated in place. Derive from: `invoice.total_cents <= (SELECT COALESCE(SUM(amount_cents), 0) FROM payments WHERE invoice_id = ? AND status = 'completed') - (SELECT COALESCE(SUM(amount_cents), 0) FROM refunds WHERE payment_id IN (...) AND status = 'succeeded')`. Use `SELECT ... FOR UPDATE` on the invoice row only if you update `invoice.paid_at` in the same tx as payment insert to avoid race; prefer deriving paid_at from payments to keep tx small.
- **Refund:** Insert Refund row; in same tx (or serialized) ensure `SUM(refund.amount_cents) <= payment.amount_cents` for that payment (constraint or application check). Optionally update payment row with `refunded_amount_cents` and status for quick display.

---

## Part 7 — ER-Style Schema (Textual)

```
users (1) ──< (N) employees [user_id]
users (1) ──< (N) clients   [user_id]
roles (1) ──< (N) users     [role_id]
roles (M) ──< (N) permissions [role_permission]

clients (1) ──< (N) quotes
clients (1) ──< (N) jobs
clients (1) ──< (N) invoices
clients (1) ──< (N) payment_intents
clients (1) ──< (N) payments
clients (1) ──< (N) communications

services (1) ──< (N) quote_line_items [service_id]
services (1) ──< (N) quote_template_line_items [service_id]

quotes (1) ──< (N) quote_line_items
quotes (1) ──< (0..1) jobs [quote_id on job]

jobs (1) ──< (N) job_tasks
jobs (1) ──< (N) job_materials
jobs (1) ──< (N) schedules
jobs (M) ──< (N) employees [job_assignment]
jobs (0..1) ──< (1) invoices [job.invoice_id]

schedules (1) ──< (N) schedule_assignments
employees (1) ──< (N) schedule_assignments
schedules (N) ──> (1) jobs

invoices (1) ──< (N) invoice_line_items
invoices (1) ──< (N) payment_intents
invoices (1) ──< (N) payments

payment_intents (1) ──< (0..1) payments [payment.payment_intent_id]

payments (1) ──< (N) refunds
payments (1) ──< (0..1) transactions [transaction.type=payment]
refunds (1) ──< (0..1) transactions [transaction.type=refund]
payouts (1) ──< (0..1) transactions [transaction.type=payout]

communications ──> clients, employees, jobs, quotes (optional FKs)
audit_logs ── (entity_type, entity_id, actor_id)
system_config ── (key, value)
calculation_history ──> jobs (job_id)
```

---

## Part 8 — Full Table List (Summary)

| # | Table | Purpose |
|---|--------|--------|
| 1 | users | Auth identity and role |
| 2 | roles | RBAC role names |
| 3 | permissions | RBAC permission codes |
| 4 | role_permission | Junction: role ↔ permission |
| 5 | clients | Customer master |
| 6 | employees | Internal staff |
| 7 | services | Catalog offerings |
| 8 | quote_templates | Reusable quote header |
| 9 | quote_template_line_items | Template lines (service_id, qty, unit_price) |
| 10 | quotes | Estimates for clients |
| 11 | quote_line_items | Quote lines |
| 12 | jobs | Work orders |
| 13 | job_tasks | Job sub-tasks |
| 14 | job_materials | Job materials |
| 15 | job_assignment | Junction: job ↔ employee |
| 16 | schedules | Time slots for jobs |
| 17 | schedule_assignment | Junction: schedule ↔ employee |
| 18 | invoices | Bills to clients |
| 19 | invoice_line_items | Invoice lines |
| 20 | payment_intents | Pre-capture payment intent |
| 21 | payments | Settled charges |
| 22 | refunds | Reversals of payments |
| 23 | payouts | Company payouts |
| 24 | transactions | Ledger rows (payment/refund/payout) |
| 25 | communications | Messages |
| 26 | audit_logs | Entity change log |
| 27 | system_config | Key-value config |
| 28 | calculation_history | Job cost calculator audit |
| 29 | invoice_settings | Single-row or keyed: tax rate, company info |

---

---

## Part 9 — Table Definitions (PostgreSQL)

For each table: **name**, **purpose**, **columns** (name, data type, nullable, default), **indexes**, **constraints**, **primary key**, **foreign keys**, **cascade rules**. Monetary amounts stored as **integer cents**; currency as **char(3)** (ISO 4217). Timestamps **TIMESTAMPTZ**. Identifiers **UUID** unless noted.

### 9.1 users

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|--------|-------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| email | VARCHAR(255) | NOT NULL | — | UNIQUE (partial: WHERE deleted_at IS NULL) |
| name | VARCHAR(255) | NOT NULL | — | |
| role_id | UUID | NOT NULL | — | FK → roles.id, ON DELETE RESTRICT |
| status | user_status | NOT NULL | 'active' | |
| join_date | DATE | NOT NULL | — | |
| created_at | TIMESTAMPTZ | NOT NULL | now() | |
| updated_at | TIMESTAMPTZ | NOT NULL | now() | |
| deleted_at | TIMESTAMPTZ | NULL | — | Soft delete |
| created_by | UUID | NULL | — | Optional |
| updated_by | UUID | NULL | — | Optional |

**PK:** id. **Unique:** (email) WHERE deleted_at IS NULL. **Indexes:** role_id, status, created_at.

### 9.2 roles

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(64) | NOT NULL | — | UNIQUE, e.g. 'Admin', 'Client' |
| description | TEXT | NULL | — |

**PK:** id. **Unique:** name.

### 9.3 permissions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| code | VARCHAR(128) | NOT NULL | — | UNIQUE, e.g. 'invoices.create' |
| description | TEXT | NULL | — |

**PK:** id. **Unique:** code.

### 9.4 role_permission

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| role_id | UUID | NOT NULL | — | FK → roles.id, ON DELETE CASCADE |
| permission_id | UUID | NOT NULL | — | FK → permissions.id, ON DELETE CASCADE |

**PK:** (role_id, permission_id). **Indexes:** permission_id (for “roles that have permission X”).

### 9.5 clients

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NULL | — | FK → users.id, ON DELETE SET NULL |
| name | VARCHAR(255) | NOT NULL | — |
| email | VARCHAR(255) | NOT NULL | — |
| phone | VARCHAR(64) | NOT NULL | — |
| phone_secondary | VARCHAR(64) | NULL | — |
| preferred_contact | VARCHAR(16) | NOT NULL | 'email' | email | phone | sms |
| street | VARCHAR(255) | NOT NULL | — |
| city | VARCHAR(128) | NOT NULL | — |
| state | VARCHAR(64) | NOT NULL | — |
| zip_code | VARCHAR(20) | NOT NULL | — |
| country | CHAR(2) | NULL | 'US' |
| status | client_status | NOT NULL | 'active' |
| segment | client_segment | NOT NULL | 'regular' |
| total_spent_cents | BIGINT | NOT NULL | 0 | Denormalized; maintain via trigger or app |
| total_spent_currency | CHAR(3) | NOT NULL | 'USD' |
| lifetime_value_cents | BIGINT | NOT NULL | 0 |
| lifetime_value_currency | CHAR(3) | NOT NULL | 'USD' |
| first_service_at | TIMESTAMPTZ | NULL | — |
| last_service_at | TIMESTAMPTZ | NULL | — |
| next_scheduled_at | TIMESTAMPTZ | NULL | — |
| notes | TEXT | NULL | — |
| internal_notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| created_by | UUID | NULL | — | FK → employees.id |

**PK:** id. **Indexes:** user_id, status, created_at, (status, segment). **Unique:** (email) WHERE deleted_at IS NULL if desired.

### 9.6 employees

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NULL | — | FK → users.id, ON DELETE SET NULL |
| first_name | VARCHAR(128) | NOT NULL | — |
| last_name | VARCHAR(128) | NOT NULL | — |
| display_name | VARCHAR(255) | NOT NULL | — |
| email | VARCHAR(255) | NOT NULL | — | UNIQUE WHERE deleted_at IS NULL |
| phone | VARCHAR(64) | NOT NULL | — |
| phone_emergency | VARCHAR(64) | NULL | — |
| role | VARCHAR(32) | NOT NULL | — | admin | supervisor | worker |
| status | VARCHAR(32) | NOT NULL | 'active' | active | inactive | on_leave | terminated |
| employee_number | VARCHAR(64) | NULL | — |
| department | VARCHAR(128) | NULL | — |
| hire_date | DATE | NOT NULL | — |
| termination_date | DATE | NULL | — |
| availability | JSONB | NULL | — | e.g. { "monday": [{ "start": "09:00", "end": "17:00" }] } |
| rating | NUMERIC(3,2) | NULL | — |
| completed_jobs_count | INT | NOT NULL | 0 |
| total_hours_worked | INT | NOT NULL | 0 |
| avatar_url | VARCHAR(512) | NULL | — |
| notes | TEXT | NULL | — |
| certifications | TEXT[] | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| created_by | UUID | NULL | — |

**PK:** id. **Indexes:** user_id, status, role.

### 9.7 services

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| image_url | VARCHAR(512) | NULL | — |
| category | VARCHAR(128) | NOT NULL | — |
| category_color | VARCHAR(32) | NULL | — |
| duration | VARCHAR(64) | NULL | — | e.g. "1-3 hours" |
| price_display | VARCHAR(128) | NOT NULL | — | e.g. "Starting at $75/visit" |
| features | TEXT[] | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |

**PK:** id. **Indexes:** category.

### 9.8 quote_templates

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| default_markup_pct | NUMERIC(5,2) | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |

**PK:** id.

### 9.9 quote_template_line_items

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| quote_template_id | UUID | NOT NULL | — | FK → quote_templates.id, ON DELETE CASCADE |
| service_id | UUID | NULL | — | FK → services.id, ON DELETE SET NULL |
| service_name | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| quantity | INT | NOT NULL | 1 |
| unit_price_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| sort_order | INT | NOT NULL | 0 |

**PK:** id. **Indexes:** quote_template_id.

### 9.10 quotes

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| quote_number | VARCHAR(64) | NOT NULL | — | UNIQUE WHERE deleted_at IS NULL |
| client_id | UUID | NOT NULL | — | FK → clients.id, ON DELETE RESTRICT |
| requested_by_id | UUID | NULL | — | FK → employees.id |
| job_id | UUID | NULL | — | FK → jobs.id, ON DELETE SET NULL; UNIQUE (one job per quote) |
| status | quote_status | NOT NULL | 'draft' |
| subtotal_cents | BIGINT | NOT NULL | — |
| tax_cents | BIGINT | NOT NULL | — |
| discount_cents | BIGINT | NULL | 0 |
| total_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| valid_until | TIMESTAMPTZ | NOT NULL | — |
| expires_at | TIMESTAMPTZ | NOT NULL | — |
| notes | TEXT | NULL | — |
| terms | TEXT | NULL | — |
| revision_number | INT | NOT NULL | 1 |
| parent_quote_id | UUID | NULL | — | FK → quotes.id |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| sent_at | TIMESTAMPTZ | NULL | — |
| viewed_at | TIMESTAMPTZ | NULL | — |
| accepted_at | TIMESTAMPTZ | NULL | — |
| rejected_at | TIMESTAMPTZ | NULL | — |
| rejection_reason | TEXT | NULL | — |

**PK:** id. **Indexes:** client_id, status, expires_at. **Unique:** (quote_number) WHERE deleted_at IS NULL.

### 9.11 quote_line_items

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| quote_id | UUID | NOT NULL | — | FK → quotes.id, ON DELETE CASCADE |
| service_id | UUID | NULL | — | FK → services.id |
| service_name | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| quantity | INT | NOT NULL | 1 |
| unit_price_cents | BIGINT | NOT NULL | — |
| total_price_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| notes | TEXT | NULL | — |
| sort_order | INT | NOT NULL | 0 |

**PK:** id. **Indexes:** quote_id, service_id.

### 9.12 jobs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| job_number | VARCHAR(64) | NOT NULL | — | UNIQUE WHERE deleted_at IS NULL |
| client_id | UUID | NOT NULL | — | FK → clients.id, ON DELETE RESTRICT |
| quote_id | UUID | NULL | — | FK → quotes.id, ON DELETE SET NULL; UNIQUE |
| service_request_id | UUID | NULL | — | Future |
| status | job_status | NOT NULL | 'draft' |
| title | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| priority | task_priority | NOT NULL | 'medium' |
| street | VARCHAR(255) | NOT NULL | — |
| city | VARCHAR(128) | NOT NULL | — |
| state | VARCHAR(64) | NOT NULL | — |
| zip_code | VARCHAR(20) | NOT NULL | — |
| country | CHAR(2) | NULL | 'US' |
| estimated_duration_min | INT | NOT NULL | — |
| actual_duration_min | INT | NULL | — |
| estimated_cost_cents | BIGINT | NOT NULL | — |
| actual_cost_cents | BIGINT | NULL | — |
| quoted_price_cents | BIGINT | NOT NULL | — |
| quoted_price_currency | CHAR(3) | NOT NULL | 'USD' |
| final_price_cents | BIGINT | NULL | — |
| final_price_currency | CHAR(3) | NULL | 'USD' |
| invoice_id | UUID | NULL | — | FK → invoices.id, ON DELETE SET NULL; UNIQUE |
| scheduled_start_at | TIMESTAMPTZ | NULL | — |
| scheduled_end_at | TIMESTAMPTZ | NULL | — |
| actual_start_at | TIMESTAMPTZ | NULL | — |
| actual_end_at | TIMESTAMPTZ | NULL | — |
| supervisor_id | UUID | NULL | — | FK → employees.id |
| notes | TEXT | NULL | — |
| internal_notes | TEXT | NULL | — |
| completion_notes | TEXT | NULL | — |
| photos | TEXT[] | NULL | — | URLs |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| completed_at | TIMESTAMPTZ | NULL | — |
| cancelled_at | TIMESTAMPTZ | NULL | — |
| cancellation_reason | TEXT | NULL | — |
| created_by | UUID | NULL | — |

**PK:** id. **Indexes:** client_id, status, quote_id, invoice_id, scheduled_start_at, supervisor_id. **Unique:** (job_number) WHERE deleted_at IS NULL.

### 9.13 job_tasks

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| job_id | UUID | NOT NULL | — | FK → jobs.id, ON DELETE CASCADE |
| title | VARCHAR(255) | NOT NULL | — |
| description | TEXT | NULL | — |
| status | job_task_status | NOT NULL | 'pending' |
| priority | task_priority | NOT NULL | 'medium' |
| estimated_duration_min | INT | NOT NULL | — |
| actual_duration_min | INT | NULL | — |
| sort_order | INT | NOT NULL | 0 |

**PK:** id. **Indexes:** job_id.

### 9.14 job_materials

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| job_id | UUID | NOT NULL | — | FK → jobs.id, ON DELETE CASCADE |
| name | VARCHAR(255) | NOT NULL | — |
| quantity | NUMERIC(12,4) | NOT NULL | — |
| unit | VARCHAR(32) | NOT NULL | — |
| cost_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| supplier | VARCHAR(255) | NULL | — |

**PK:** id. **Indexes:** job_id.

### 9.15 job_assignment

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| job_id | UUID | NOT NULL | — | FK → jobs.id, ON DELETE CASCADE |
| employee_id | UUID | NOT NULL | — | FK → employees.id, ON DELETE CASCADE |

**PK:** (job_id, employee_id).

### 9.16 schedules

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| job_id | UUID | NOT NULL | — | FK → jobs.id, ON DELETE CASCADE |
| scheduled_start_at | TIMESTAMPTZ | NOT NULL | — |
| scheduled_end_at | TIMESTAMPTZ | NOT NULL | — |
| status | schedule_status | NOT NULL | 'scheduled' |
| street | VARCHAR(255) | NOT NULL | — |
| city | VARCHAR(128) | NOT NULL | — |
| state | VARCHAR(64) | NOT NULL | — |
| zip_code | VARCHAR(20) | NOT NULL | — |
| country | CHAR(2) | NULL | 'US' |
| travel_time_min | INT | NULL | — |
| notes | TEXT | NULL | — |
| reminder_sent | BOOLEAN | NOT NULL | false |
| reminder_sent_at | TIMESTAMPTZ | NULL | — |
| is_recurring | BOOLEAN | NOT NULL | false |
| recurring_pattern | JSONB | NULL | — | { "frequency": "weekly", "interval": 1, "end_date": "..." } |
| parent_schedule_id | UUID | NULL | — | FK → schedules.id |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| cancelled_at | TIMESTAMPTZ | NULL | — |
| cancellation_reason | TEXT | NULL | — |

**PK:** id. **Indexes:** job_id, scheduled_start_at, scheduled_end_at, status.

### 9.17 schedule_assignment

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| schedule_id | UUID | NOT NULL | — | FK → schedules.id, ON DELETE CASCADE |
| employee_id | UUID | NOT NULL | — | FK → employees.id, ON DELETE CASCADE |

**PK:** (schedule_id, employee_id). **Indexes:** employee_id.

### 9.18 invoices

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| invoice_number | VARCHAR(64) | NOT NULL | — | UNIQUE WHERE deleted_at IS NULL |
| client_id | UUID | NOT NULL | — | FK → clients.id, ON DELETE RESTRICT |
| job_id | UUID | NULL | — | FK → jobs.id, ON DELETE SET NULL; UNIQUE |
| status | invoice_status | NOT NULL | 'draft' |
| amount_cents | BIGINT | NOT NULL | — | Subtotal |
| tax_cents | BIGINT | NOT NULL | — |
| total_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| due_date | DATE | NOT NULL | — |
| sent_at | TIMESTAMPTZ | NULL | — |
| paid_at | TIMESTAMPTZ | NULL | — | Set when total covered by payments (or derived) |
| notes | TEXT | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| created_by | UUID | NULL | — |

**PK:** id. **Indexes:** client_id, status, due_date, job_id. **Unique:** (invoice_number) WHERE deleted_at IS NULL.

### 9.19 invoice_line_items

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| invoice_id | UUID | NOT NULL | — | FK → invoices.id, ON DELETE CASCADE |
| service_id | UUID | NULL | — | FK → services.id |
| description | VARCHAR(512) | NOT NULL | — |
| quantity | INT | NOT NULL | 1 |
| unit_price_cents | BIGINT | NOT NULL | — |
| total_cents | BIGINT | NOT NULL | — |
| sort_order | INT | NOT NULL | 0 |

**PK:** id. **Indexes:** invoice_id.

### 9.20 payment_intents

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| client_id | UUID | NOT NULL | — | FK → clients.id, ON DELETE RESTRICT |
| invoice_id | UUID | NULL | — | FK → invoices.id, ON DELETE RESTRICT |
| amount_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| status | payment_intent_status | NOT NULL | 'requires_payment_method' |
| method | payment_method_type | NULL | — |
| processor | VARCHAR(32) | NULL | — | stripe | paypal | square | manual |
| processor_intent_id | VARCHAR(255) | NULL | — | External id |
| metadata | JSONB | NULL | — | Idempotency key, return_url, etc. |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| cancelled_at | TIMESTAMPTZ | NULL | — |

**PK:** id. **Indexes:** client_id, invoice_id, status, processor_intent_id.

### 9.21 payments

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| payment_number | VARCHAR(64) | NOT NULL | — | UNIQUE WHERE deleted_at IS NULL |
| payment_intent_id | UUID | NULL | — | FK → payment_intents.id; UNIQUE (one payment per intent) |
| client_id | UUID | NOT NULL | — | FK → clients.id, ON DELETE RESTRICT |
| invoice_id | UUID | NULL | — | FK → invoices.id, ON DELETE RESTRICT |
| job_id | UUID | NULL | — | FK → jobs.id, ON DELETE SET NULL |
| status | payment_status | NOT NULL | 'pending' |
| method | payment_method_type | NOT NULL | — |
| amount_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| transaction_id | VARCHAR(255) | NULL | — | Processor charge id |
| processor | VARCHAR(32) | NULL | — |
| processor_response | JSONB | NULL | — |
| payment_method_id | UUID | NULL | — | Stored payment method ref (PCI: token only) |
| notes | TEXT | NULL | — |
| receipt_url | VARCHAR(512) | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| processed_at | TIMESTAMPTZ | NULL | — |
| completed_at | TIMESTAMPTZ | NULL | — |
| failed_at | TIMESTAMPTZ | NULL | — |
| failure_reason | TEXT | NULL | — |

**PK:** id. **Indexes:** client_id, invoice_id, job_id, status, completed_at. **Unique:** (payment_number) WHERE deleted_at IS NULL; (payment_intent_id) WHERE payment_intent_id IS NOT NULL AND deleted_at IS NULL.

### 9.22 refunds

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| payment_id | UUID | NOT NULL | — | FK → payments.id, ON DELETE RESTRICT |
| amount_cents | BIGINT | NOT NULL | — | Must be ≤ payment.amount_cents (app or trigger) |
| currency | CHAR(3) | NOT NULL | 'USD' |
| status | refund_status | NOT NULL | 'pending' |
| reason | TEXT | NULL | — |
| processor_refund_id | VARCHAR(255) | NULL | — |
| processor_response | JSONB | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| succeeded_at | TIMESTAMPTZ | NULL | — |
| failed_at | TIMESTAMPTZ | NULL | — |

**PK:** id. **Indexes:** payment_id, status. **Check (application or trigger):** SUM(refund.amount_cents) WHERE status = 'succeeded' ≤ payment.amount_cents.

### 9.23 payouts

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| payee_type | payout_payee_type | NOT NULL | — | employee | vendor |
| payee_id | UUID | NOT NULL | — | employee_id or vendor_id (no FK if vendor is external) |
| amount_cents | BIGINT | NOT NULL | — |
| currency | CHAR(3) | NOT NULL | 'USD' |
| status | payout_status | NOT NULL | 'pending' |
| method | VARCHAR(32) | NULL | — | ach | check | etc. |
| reference_job_id | UUID | NULL | — | FK → jobs.id (optional) |
| scheduled_at | TIMESTAMPTZ | NULL | — |
| paid_at | TIMESTAMPTZ | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| created_by | UUID | NULL | — |

**PK:** id. **Indexes:** payee_type, payee_id, status, reference_job_id.

### 9.24 transactions

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| type | transaction_type | NOT NULL | — | payment | refund | payout |
| amount_cents | BIGINT | NOT NULL | — | Positive for payment; negative for refund if desired, or always positive and type indicates direction |
| currency | CHAR(3) | NOT NULL | 'USD' |
| payment_id | UUID | NULL | — | FK → payments.id; set when type = 'payment' |
| refund_id | UUID | NULL | — | FK → refunds.id; set when type = 'refund' |
| payout_id | UUID | NULL | — | FK → payouts.id; set when type = 'payout' |
| client_id | UUID | NULL | — | Denormalized for reporting |
| created_at | TIMESTAMPTZ | NOT NULL | now() |

**PK:** id. **Indexes:** type, payment_id, refund_id, payout_id, client_id, created_at. **Check:** Exactly one of payment_id, refund_id, payout_id set per type.

### 9.25 communications

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| client_id | UUID | NULL | — | FK → clients.id |
| employee_id | UUID | NULL | — | FK → employees.id |
| job_id | UUID | NULL | — | FK → jobs.id |
| quote_id | UUID | NULL | — | FK → quotes.id |
| type | communication_type | NOT NULL | — |
| direction | communication_direction | NOT NULL | — |
| subject | VARCHAR(512) | NULL | — |
| content | TEXT | NOT NULL | — |
| status | communication_status | NOT NULL | 'draft' |
| template_id | UUID | NULL | — |
| template_variables | JSONB | NULL | — |
| attachments | JSONB | NULL | — | [{ "id", "name", "url", "mime_type", "size" }] |
| priority | task_priority | NOT NULL | 'medium' |
| created_at | TIMESTAMPTZ | NOT NULL | now() |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |
| deleted_at | TIMESTAMPTZ | NULL | — |
| sent_at | TIMESTAMPTZ | NULL | — |
| read_at | TIMESTAMPTZ | NULL | — |
| delivered_at | TIMESTAMPTZ | NULL | — |
| scheduled_for | TIMESTAMPTZ | NULL | — |

**PK:** id. **Indexes:** client_id, employee_id, job_id, quote_id, status, created_at.

### 9.26 audit_logs

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| entity_type | VARCHAR(64) | NOT NULL | — | e.g. 'invoice', 'payment' |
| entity_id | UUID | NOT NULL | — |
| action | VARCHAR(32) | NOT NULL | — | create | update | delete |
| actor_id | UUID | NULL | — | user or employee id |
| old_values | JSONB | NULL | — |
| new_values | JSONB | NULL | — |
| created_at | TIMESTAMPTZ | NOT NULL | now() |

**PK:** id. **Indexes:** entity_type, entity_id, actor_id, created_at. Consider partitioning by created_at for very large volumes.

### 9.27 system_config

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| key | VARCHAR(128) | NOT NULL | — | PK |
| value | TEXT | NULL | — | Or JSONB for structured config |
| value_type | VARCHAR(16) | NULL | 'string' | string | number | boolean | json |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |

**PK:** key.

### 9.28 calculation_history

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| job_id | UUID | NOT NULL | — | FK → jobs.id |
| job_number | VARCHAR(64) | NOT NULL | — |
| client_id | UUID | NOT NULL | — |
| client_name | VARCHAR(255) | NOT NULL | — |
| inputs | JSONB | NOT NULL | — | { hours, sqft, visits, zone, project_type } |
| breakdown | JSONB | NOT NULL | — | { labor, materials, visit_fees, subtotal, tax, total } |
| created_at | TIMESTAMPTZ | NOT NULL | now() |

**PK:** id. **Indexes:** job_id, client_id, created_at.

### 9.29 invoice_settings

Single-row or keyed config for invoice defaults (tax rate, company name, address, email, phone). Can be merged into system_config with keys like `invoice.tax_rate`, `invoice.company_name`, or a dedicated table:

| Column | Type | Nullable | Default |
|--------|------|----------|--------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tax_rate_pct | NUMERIC(5,4) | NOT NULL | — | e.g. 8.6 |
| company_name | VARCHAR(255) | NOT NULL | — |
| company_address | TEXT | NULL | — |
| company_email | VARCHAR(255) | NOT NULL | — |
| company_phone | VARCHAR(64) | NOT NULL | — |
| updated_at | TIMESTAMPTZ | NOT NULL | now() |

**PK:** id. One row per tenant or global.

---

## Part 10 — Rows / Field Semantics (Example Values)

| Table.Column | Business meaning | Example value meaning |
|--------------|------------------|------------------------|
| users.email | Login identifier | "admin@company.com" |
| users.status | Account allowed to log in | 'active' = can log in |
| clients.total_spent_cents | Sum of completed payment amounts for this client | 15000 = $150.00 |
| quotes.quote_number | Human-readable quote id | "Q-2025-001" |
| quotes.status | Lifecycle of estimate | 'sent' = sent to client, awaiting response |
| jobs.job_number | Human-readable job id | "J-2025-042" |
| jobs.invoice_id | Invoice generated for this job (if any) | UUID of invoices row |
| invoices.invoice_number | Human-readable invoice id | "INV-2025-010" |
| invoices.paid_at | When invoice was fully paid (by payments) | Set when sum(payments) >= total_cents |
| payment_intents.status | Stripe-like intent state | 'succeeded' = charge captured |
| payments.payment_number | Human-readable payment id | "PAY-2025-003" |
| payments.transaction_id | Processor charge id (e.g. Stripe pi_xxx) | "ch_xxx" |
| refunds.amount_cents | Amount refunded to customer | 5000 = $50.00 |
| transactions.type | Ledger entry direction | 'payment' = money in; 'refund' = money out |
| audit_logs.entity_type | Table or domain name | "invoices" |
| audit_logs.action | What happened | "update" (status changed) |

---

## Part 11 — Ready-to-Implement PostgreSQL Schema (DDL)

Execution order: (1) Extensions, (2) ENUMs, (3) Tables (parents before children; quotes before jobs because job.quote_id), (4) Indexes, (5) Triggers (e.g. updated_at). Below: core DDL; partial unique indexes use `WHERE deleted_at IS NULL`.

### 11.1 Extensions

```sql
-- Enable UUID generation (built-in in PostgreSQL 13+)
-- No extension required for gen_random_uuid()
```

### 11.2 ENUMs

```sql
CREATE TYPE user_status AS ENUM ('active', 'pending', 'inactive');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'pending', 'suspended');
CREATE TYPE client_segment AS ENUM ('vip', 'regular', 'new', 'at_risk');
CREATE TYPE quote_status AS ENUM ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'revised');
CREATE TYPE job_status AS ENUM ('draft', 'quoted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold');
CREATE TYPE schedule_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_intent_status AS ENUM ('requires_payment_method', 'requires_confirmation', 'requires_action', 'processing', 'succeeded', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE payment_method_type AS ENUM ('credit_card', 'debit_card', 'ach', 'check', 'cash', 'other');
CREATE TYPE refund_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE payout_payee_type AS ENUM ('employee', 'vendor');
CREATE TYPE communication_type AS ENUM ('email', 'sms', 'in_app', 'push', 'phone');
CREATE TYPE communication_direction AS ENUM ('inbound', 'outbound');
CREATE TYPE communication_status AS ENUM ('draft', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE job_task_status AS ENUM ('pending', 'in_progress', 'completed', 'skipped');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'payout');
```

### 11.3 Tables (Core — Parent Tables First)

```sql
-- Roles and permissions (no soft delete)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(128) NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE role_permission (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE INDEX idx_role_permission_permission_id ON role_permission(permission_id);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  status user_status NOT NULL DEFAULT 'active',
  join_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID,
  updated_by UUID
);
CREATE UNIQUE INDEX idx_users_email_active ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role_status ON users(role_id, status);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  phone_secondary VARCHAR(64),
  preferred_contact VARCHAR(16) NOT NULL DEFAULT 'email',
  street VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(64) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country CHAR(2) DEFAULT 'US',
  status client_status NOT NULL DEFAULT 'active',
  segment client_segment NOT NULL DEFAULT 'regular',
  total_spent_cents BIGINT NOT NULL DEFAULT 0,
  total_spent_currency CHAR(3) NOT NULL DEFAULT 'USD',
  lifetime_value_cents BIGINT NOT NULL DEFAULT 0,
  lifetime_value_currency CHAR(3) NOT NULL DEFAULT 'USD',
  first_service_at TIMESTAMPTZ,
  last_service_at TIMESTAMPTZ,
  next_scheduled_at TIMESTAMPTZ,
  notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID
);
CREATE INDEX idx_clients_user_status ON clients(user_id, status);
CREATE INDEX idx_clients_status ON clients(status);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(128) NOT NULL,
  last_name VARCHAR(128) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  phone_emergency VARCHAR(64),
  role VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'active',
  employee_number VARCHAR(64),
  department VARCHAR(128),
  hire_date DATE NOT NULL,
  termination_date DATE,
  availability JSONB,
  rating NUMERIC(3,2),
  completed_jobs_count INT NOT NULL DEFAULT 0,
  total_hours_worked INT NOT NULL DEFAULT 0,
  avatar_url VARCHAR(512),
  notes TEXT,
  certifications TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID
);
CREATE UNIQUE INDEX idx_employees_email_active ON employees(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_employees_user_status ON employees(user_id, status);

-- Services
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(512),
  category VARCHAR(128) NOT NULL,
  category_color VARCHAR(32),
  duration VARCHAR(64),
  price_display VARCHAR(128) NOT NULL,
  features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Quote templates
CREATE TABLE quote_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  default_markup_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE quote_template_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_template_id UUID NOT NULL REFERENCES quote_templates(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_quote_template_line_items_template ON quote_template_line_items(quote_template_id);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number VARCHAR(64) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  requested_by_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  job_id UUID UNIQUE,
  status quote_status NOT NULL DEFAULT 'draft',
  subtotal_cents BIGINT NOT NULL,
  tax_cents BIGINT NOT NULL,
  discount_cents BIGINT DEFAULT 0,
  total_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  valid_until TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  terms TEXT,
  revision_number INT NOT NULL DEFAULT 1,
  parent_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT
);
CREATE UNIQUE INDEX idx_quotes_quote_number_active ON quotes(quote_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_quotes_client_status ON quotes(client_id, status);

CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL,
  total_price_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  notes TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_quote_line_items_quote ON quote_line_items(quote_id);

-- Jobs (invoice_id and quote_id FKs added after invoices table)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_number VARCHAR(64) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  quote_id UUID UNIQUE REFERENCES quotes(id) ON DELETE SET NULL,
  service_request_id UUID,
  status job_status NOT NULL DEFAULT 'draft',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority task_priority NOT NULL DEFAULT 'medium',
  street VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(64) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country CHAR(2) DEFAULT 'US',
  estimated_duration_min INT NOT NULL,
  actual_duration_min INT,
  estimated_cost_cents BIGINT NOT NULL,
  actual_cost_cents BIGINT,
  quoted_price_cents BIGINT NOT NULL,
  quoted_price_currency CHAR(3) NOT NULL DEFAULT 'USD',
  final_price_cents BIGINT,
  final_price_currency CHAR(3) DEFAULT 'USD',
  invoice_id UUID UNIQUE,
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  notes TEXT,
  internal_notes TEXT,
  completion_notes TEXT,
  photos TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_by UUID
);
CREATE UNIQUE INDEX idx_jobs_job_number_active ON jobs(job_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_client_status ON jobs(client_id, status);
CREATE INDEX idx_jobs_scheduled ON jobs(scheduled_start_at) WHERE scheduled_start_at IS NOT NULL;

CREATE TABLE job_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status job_task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  estimated_duration_min INT NOT NULL,
  actual_duration_min INT,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_job_tasks_job ON job_tasks(job_id);

CREATE TABLE job_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity NUMERIC(12,4) NOT NULL,
  unit VARCHAR(32) NOT NULL,
  cost_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  supplier VARCHAR(255)
);
CREATE INDEX idx_job_materials_job ON job_materials(job_id);

CREATE TABLE job_assignment (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, employee_id)
);
CREATE INDEX idx_job_assignment_employee ON job_assignment(employee_id);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  status schedule_status NOT NULL DEFAULT 'scheduled',
  street VARCHAR(255) NOT NULL,
  city VARCHAR(128) NOT NULL,
  state VARCHAR(64) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country CHAR(2) DEFAULT 'US',
  travel_time_min INT,
  notes TEXT,
  reminder_sent BOOLEAN NOT NULL DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern JSONB,
  parent_schedule_id UUID REFERENCES schedules(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);
CREATE INDEX idx_schedules_job ON schedules(job_id);
CREATE INDEX idx_schedules_times ON schedules(scheduled_start_at, scheduled_end_at);

CREATE TABLE schedule_assignment (
  schedule_id UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (schedule_id, employee_id)
);
CREATE INDEX idx_schedule_assignment_employee ON schedule_assignment(employee_id);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(64) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  job_id UUID UNIQUE REFERENCES jobs(id) ON DELETE SET NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  amount_cents BIGINT NOT NULL,
  tax_cents BIGINT NOT NULL,
  total_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  due_date DATE NOT NULL,
  sent_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_by UUID
);
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX idx_invoices_invoice_number_active ON invoices(invoice_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  description VARCHAR(512) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price_cents BIGINT NOT NULL,
  total_cents BIGINT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_invoice_line_items_invoice ON invoice_line_items(invoice_id);

-- Payment intents
CREATE TABLE payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status payment_intent_status NOT NULL DEFAULT 'requires_payment_method',
  method payment_method_type,
  processor VARCHAR(32),
  processor_intent_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);
CREATE INDEX idx_payment_intents_client_invoice ON payment_intents(client_id, invoice_id);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(64) NOT NULL,
  payment_intent_id UUID UNIQUE REFERENCES payment_intents(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE RESTRICT,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method_type NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  transaction_id VARCHAR(255),
  processor VARCHAR(32),
  processor_response JSONB,
  payment_method_id UUID,
  notes TEXT,
  receipt_url VARCHAR(512),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT
);
CREATE UNIQUE INDEX idx_payments_payment_number_active ON payments(payment_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_invoice_status ON payments(invoice_id, status);
CREATE INDEX idx_payments_completed_at ON payments(completed_at) WHERE completed_at IS NOT NULL;

-- Refunds
CREATE TABLE refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status refund_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  processor_refund_id VARCHAR(255),
  processor_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  succeeded_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);
CREATE INDEX idx_refunds_payment ON refunds(payment_id);

-- Payouts
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payee_type payout_payee_type NOT NULL,
  payee_id UUID NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  status payout_status NOT NULL DEFAULT 'pending',
  method VARCHAR(32),
  reference_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  created_by UUID
);
CREATE INDEX idx_payouts_payee ON payouts(payee_type, payee_id);

-- Transactions (ledger)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type transaction_type NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'USD',
  payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  refund_id UUID REFERENCES refunds(id) ON DELETE RESTRICT,
  payout_id UUID REFERENCES payouts(id) ON DELETE RESTRICT,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_transaction_ref CHECK (
    (type = 'payment' AND payment_id IS NOT NULL AND refund_id IS NULL AND payout_id IS NULL) OR
    (type = 'refund' AND refund_id IS NOT NULL AND payment_id IS NULL AND payout_id IS NULL) OR
    (type = 'payout' AND payout_id IS NOT NULL AND payment_id IS NULL AND refund_id IS NULL)
  )
);
CREATE INDEX idx_transactions_type_refs ON transactions(type, payment_id, refund_id, payout_id);
CREATE INDEX idx_transactions_client_created ON transactions(client_id, created_at);

-- Communications
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  type communication_type NOT NULL,
  direction communication_direction NOT NULL,
  subject VARCHAR(512),
  content TEXT NOT NULL,
  status communication_status NOT NULL DEFAULT 'draft',
  template_id UUID,
  template_variables JSONB,
  attachments JSONB,
  priority task_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ
);
CREATE INDEX idx_communications_entity ON communications(client_id, employee_id, job_id, quote_id);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(32) NOT NULL,
  actor_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- System config
CREATE TABLE system_config (
  key VARCHAR(128) PRIMARY KEY,
  value TEXT,
  value_type VARCHAR(16) DEFAULT 'string',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calculation history
CREATE TABLE calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_number VARCHAR(64) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  client_name VARCHAR(255) NOT NULL,
  inputs JSONB NOT NULL,
  breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_calculation_history_job ON calculation_history(job_id);

-- Invoice settings (single row or keyed)
CREATE TABLE invoice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_rate_pct NUMERIC(5,4) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT,
  company_email VARCHAR(255) NOT NULL,
  company_phone VARCHAR(64) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at trigger (example for one table; repeat for others)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER tr_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
-- Add similar triggers for quotes, jobs, invoices, payments, refunds, payouts, communications, etc.
```

Note: Use `EXECUTE PROCEDURE` (PostgreSQL 11+) for trigger; `EXECUTE FUNCTION` is valid in PostgreSQL 14+.

---

## Part 12 — Notes for Prisma / Migrations Compatibility

- **ENUMs:** Prisma maps PostgreSQL ENUMs to `enum` in the schema. Generate enums first; then `prisma db pull` or write `schema.prisma` to match. Adding a new enum value requires a migration (ALTER TYPE ... ADD VALUE).
- **UUID:** Use `@default(uuid())` or `@default(dbgenerated("gen_random_uuid()"))` in Prisma for `id` columns.
- **Soft deletes:** Prisma does not support partial unique indexes in schema declaration; define them in raw SQL migrations. Use global scopes or middleware to filter `deleted_at IS NULL` in queries.
- **Cascade:** Prisma `relation(onDelete: Cascade)` matches ON DELETE CASCADE; `Restrict` matches ON DELETE RESTRICT.
- **Money:** Store as `Int` or `BigInt` (cents) in Prisma; use `Decimal` only if you need fractional cents (not recommended).
- **JSONB:** Prisma type `Json` for processor_response, metadata, attachments, inputs, breakdown, old_values, new_values.
- **Neon:** Use connection string with pooler (e.g. `postgres://...@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require`). Run migrations with a single connection (not pooled) if your migration tool requires it, or use Neon’s migration guidance.
- **Migration order:** Create ENUMs → roles, permissions, role_permission → users → clients, employees → services, quote_templates, quote_template_line_items → quotes, quote_line_items → jobs, job_tasks, job_materials, job_assignment → schedules, schedule_assignment → invoices, invoice_line_items → payment_intents → payments → refunds → payouts → transactions → communications → audit_logs → system_config → calculation_history → invoice_settings. Then add FKs that cross (e.g. jobs.invoice_id → invoices.id).

---

## Part 13 — Open Risks and Assumptions

| Risk / Assumption | Mitigation |
|-------------------|------------|
| **User ↔ Employee / Client:** No FK today in app; schema adds optional user_id on employees and clients. | Populate when auth is linked; keep nullable so existing data is valid. |
| **Single tenant:** No tenant_id column. | If multi-tenant later, add tenant_id to all business tables and RLS policies. |
| **Refund sum ≤ payment amount:** Not enforced by DB constraint (cross-row). | Enforce in application or via trigger: before insert/update on refunds, check SUM(refund.amount_cents) WHERE payment_id = NEW.payment_id AND status = 'succeeded' + NEW.amount_cents ≤ payment.amount_cents. |
| **Invoice paid_at:** Derived from payments or updated in app. | Prefer deriving in queries/views to avoid tx contention; if updating paid_at in same tx as payment insert, use SELECT ... FOR UPDATE on invoice. |
| **Idempotency for payment confirmation:** Not a table in DDL. | Add table payment_idempotency_keys (idempotency_key VARCHAR UNIQUE, payment_id UUID, created_at TIMESTAMPTZ) or store key in payment_intents.metadata. |
| **Payout payee_id:** No FK when payee_type = 'vendor' (vendor may be external). | Optional vendors table later; for now payee_id is UUID reference to employees.id when payee_type = 'employee'. |
| **Currency:** Single currency (USD) assumed for reporting. | All amounts in cents; currency column on every monetary table for future multi-currency. |
| **ENUM evolution:** Adding enum values requires ALTER TYPE. | Prefer ADD VALUE in migrations; avoid removing or reordering values. |
| **Neon branch/restore:** Schema is branchable. | No schema-specific risks; use Neon branching for staging/restore as documented. |
| **Audit log size:** Unbounded growth. | Partition audit_logs by created_at (e.g. monthly) or archive old partitions; add retention policy. |

---

**Document version:** 1.0  
**Target DB:** Neon Serverless PostgreSQL  
**Last updated:** From analysis and schema design; no application code generated.
