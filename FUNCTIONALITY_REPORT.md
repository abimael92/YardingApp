# FUNCTIONALITY_REPORT.md — Services, Hooks & Product Reality

**Audience:** Technical PMs, engineering leads, new hires.  
**Companion docs:** [`SYSTEM_FLOW.md`](./SYSTEM_FLOW.md) (domain lifecycle), [`TECH_STACK.md`](./TECH_STACK.md) (infrastructure & patterns).

This report inventories **`src/services`** and **`src/hooks`**, maps them to the **landscaping lifecycle**, and flags **gaps** (equipment assignments, skills, scheduler performance, calendar UX).

---

## 1. Feature inventory — services

| Service | Primary data source | CRUD / operations (summary) |
|--------|---------------------|-----------------------------|
| **`adminService`** | Neon SQL | **Read:** `getStats`, `getRevenueHistory`, `getRecentActivity`, `getPendingActions`, `getRecentUsers`, `getSystemHealth`, `getEquipmentStatus`, `getEquipmentCategories`, `getCrewAvailability`, `getUpcomingSchedule`, `getStockAlerts`, `getCommunicationAlerts`, `getCrews`. **Write:** `addEquipment`. |
| **`analyticsService`** | **In-memory mocks** | `getRevenueTrends`, `getServiceRevenue`, `getCrewPerformance`, `getSeasonalForecast`, `getServiceAreaData` — static demo data, not DB-backed. |
| **`assignmentService`** | Neon SQL | **Create:** `assignEmployeeToJob`. **Delete:** `removeEmployeeFromJob`. **Update:** `updateAssignmentStatus`. **Read:** `getAssignmentsByEmployee`, `getAssignmentsByJob` (`employee_jobs` + joins). |
| **`clientService`** | **`mockStore`** | **CRUD:** `getAll`, `getById`, `create`, `update`, `delete` — not Neon/Prisma in this layer. |
| **`communicationService`** | **`mockStore`** | **CRUD:** `getAll`, `getById`, `getByClientId`, `getByJobId`, `getByEmployeeId`, `create`, `update`, `delete`. |
| **`contractService`** | Neon SQL | **Read:** `getContractsByClient` (typed `ContractForUI`). Object `contractService` with client-scoped queries. |
| **`crewService`** | Neon SQL | **Crews:** `getCrews`, `getCrewById`, `createCrew`, `updateCrew`, `deleteCrew`. **Members:** `getCrewMembers`, `addCrewMember`, `removeCrewMember`. **Jobs on crew:** `getCrewJobs`, `assignJobToCrew`, `unassignJobFromCrew`, `assignJobsToCrew`. |
| **`employeeService`** | Neon SQL (or empty mock SQL if no `DATABASE_URL`) | **CRUD:** `getAll`, `getById`, `getByStatus`, `create`, `update`, `delete`. **Helpers:** `getEmployeeStats`, `getEmployeeAssignments`, `updateUserStatus`, `getCurrentUserId`. |
| **`invoiceService`** | Neon SQL | **Read:** `getAll`, `getById`, `getByClientId`, `getByJobId`, `getByStatus`, `getWithRelations`, `getByDateRange`, `getDueInDays`, `getOverdue`, `getRecent`, aggregates (`getTotalOutstanding`, `getTotalPaid`, `getInvoiceStats`). **Write:** `create`, `update`, `delete`. **Status:** `markAsSent`, `markAsPaid`, `markAsOverdue`, `markAsCancelled`. |
| **`jobService`** | Neon SQL | **Jobs:** `getAll`, `getById`, `getByClientId`, `getByEmployeeId`, `getByStatus`, `getWithRelations`, `getByDateRange`, `getUpcoming`, `getOverdue`, `create`, `update`, `delete`, `updateStatus`, `markAsCompleted`, `markAsCancelled`, `updateProgress`, `getCompletionPercentage`, `fetchOpenJobsForAssignment`, `getJobStats`. **Assignments (via job API):** `assignEmployeeToJob`, `unassignEmployeeFromJob`, `getJobAssignedEmployees`. **Tasks:** `getTasks`, `addTask`, `updateTask`, `deleteTask` (`job_tasks`). **Materials:** `getMaterials`, `addMaterial`, `updateMaterial`, `deleteMaterial` (`job_materials`). |
| **`noteService`** | Neon SQL (`job_notes`) | **Read:** `getByClientId`, `getByJobId` (mapped to `NoteForUI`). |
| **`paymentService`** | Neon SQL | **CRUD:** `getAll`, `getById`, `getByClientId`, `getByJobId`, `create`, `update`, `delete`. |
| **`quoteService`** | Prisma | **`convertToJob(quoteId, address)`** — updates `quote_requests`, finds/creates `clients`, creates `jobs` (with `quote_request_id`), job numbering. |
| **`reportsService`** | **Static mocks** | `getProfitLoss`, `getAccountsReceivableAging`, `getRevenueByService`, `getClientProfitability`, `getCrewProductivity`, `getExpenses`, `getYearOverYearComparison`. |
| **`schedulePlannerService`** | Neon SQL | **`detectCrewDayCollisions`**, **`createWorkDay`** (insert `schedules`, per-job `schedule_jobs`, bulk `employee_jobs` with `ON CONFLICT DO NOTHING`), **`listPlannerJobs`** (quoted/scheduled jobs). |
| **`scheduleService`** | Neon SQL **or** `mockStore` if no DB | **CRUD:** `getAll`, `getById`, `getByJobId`, `getByEmployeeId`, `getByStatus`, `create`, `update`, `delete`. Maps `schedule_jobs` + `schedules` + `jobs` + `crew_members` aggregation into domain `Schedule`. |
| **`serviceCatalog`** | Static import (`mockData`) | **Read:** `getServices()` — marketing/service list, not DB. |
| **`settingsService`** | **`mockStore`** | **Read:** `getAll`, `get`. |
| **`taskService`** | Indirect (via **`jobService` / `getJobs`**) | **Read:** `getTasks()` — converts jobs to legacy `Task` model for unmigrated UI. |
| **`testimonialService`** | Static array | **Read:** `getTestimonials()`. |
| **`timeTrackingService`** | Neon SQL (`time_entries`) | **Read:** `getTimeEntries`, `getActiveTimeEntry`, `getTimeEntriesByDate`. **Write:** `startTimeEntry`, `endTimeEntry` (closes open entry then opens new). |
| **`userService`** | Neon SQL (`profiles`, `user_roles`, `roles`, `employee_jobs`) | **CRUD:** `getAll`, `getById`, `getByRole`, `getByStatus`, `create`, `update`, `delete`. **Ops:** `updateStatus`, `getEmployeeAssignments`, `getDashboardStats`. Role labels from `roles.name`. |
| **`workerService`** | Via **`employeeService`** | **Read:** `getWorkers()` — maps `Employee` → legacy `Worker` for old components. |
| **`utils.ts`** | N/A | **`delay`**, **`asyncify`**, **`asyncifyWithError`** — test/mock timing helpers used by mock-backed services. |

### Notable absences (schema exists, no dedicated service in `src/services`)

- **`equipment_assignments`** — Table documented in `schema-summary.txt` / `database-schema.txt`; **no TypeScript service** reads or writes assignments (checkout/return, job linkage).
- **`employee_skills`** — **No references** in application TypeScript; not used for queries or assignment filtering.

---

## 2. Hooks inventory (`src/hooks`)

| Hook | Role |
|------|------|
| **`useDailyPlanner`** | Loads crews/jobs via Server Actions (`getDailyPlannerData`), previews collisions (`previewCrewDayCollisions`), submits workday (`submitCreateWorkDay`). Local state: date, crew, selected job IDs, warnings, loading/error. |
| **`usePagination`** | Generic list pagination: page, page size, totals, next/prev/first/last. |
| **`useFormPersistence`** | Persists form field values (e.g. localStorage) across sessions. |
| **`useAsync`** | Async operation wrapper (loading / error / result) for client components. |
| **`useMediaQuery`** | Responsive breakpoint detection for conditional UI. |

---

## 3. Landscaping lifecycle — automation vs manual

| Stage | Automated today? | How | Still manual / partial |
|-------|------------------|-----|-------------------------|
| **Lead / quote request** | **Strong** | Server actions + Prisma (`quote_requests`, notifications). | Review/send workflows depend on admin UX; SMS noted as placeholder in older docs. |
| **Quote → job** | **Strong** | `quoteService.convertToJob` + server action; client upsert, job creation, `quote_request_id` link. | Admin must trigger conversion and enter job-site address in UI. |
| **Job pricing / line items** | **Partial** | Jobs carry quoted amounts; `job_items` / invoicing can be wired in DB. | Full line-item sync from quote → job → invoice is not uniformly automated end-to-end in one action. |
| **Crew definition** | **Strong** | `crewService` CRUD + members. | Operational discipline (who is on which crew) is human. |
| **Daily scheduling & assignment** | **Strong** | `createWorkDay` writes `schedules`, `schedule_jobs`, `employee_jobs` for whole crew × selected jobs. | Choosing jobs/crew/date is manual; collision check warns but does not block. |
| **Calendar / timeline UI** | **Weak** | `scheduleService` can **read** unified rows from DB with aggregates. | Admin `/admin/schedule` is **Daily Planner** (form + job list), not a month/week **calendar** view. |
| **Field execution (clock-in, actuals)** | **Partial** | `timeTrackingService` hits `time_entries`. | Worker UI may not fully drive live clock-in; `schedule_jobs` actual start/end not guaranteed updated from mobile flows. |
| **Materials on job** | **Partial** | `jobService` **CRUD** on `job_materials` (planning/costing). | **No** automated decrement against warehouse/inventory or link to `materials` stock tables from this codebase path. |
| **Equipment on job** | **Weak** | `adminService` lists equipment and can **add** rows to `equipment`. | **`equipment_assignments` unused** — no check-out/check-in to jobs or workers in app services. |
| **Job completion** | **Partial** | `jobService.markAsCompleted` / status updates in Neon. | Invoice generation from completed job is **not** a single guaranteed automatic step (manual invoice UI flows exist). |
| **Invoicing & payment** | **Partial** | `invoiceService` / `paymentService` are Neon-backed with rich queries. | Creating/sending invoices and recording payments remains user-driven. |
| **Client directory (admin clients UI)** | **Weak** | **`clientService` is mockStore** — disconnected from Prisma `clients` used in quote conversion. | Risk of **two truths** unless admin clients are migrated to DB services. |
| **Analytics & reports** | **Weak** | **`analyticsService`** and **`reportsService`** are mocks. | Dashboard charts may not reflect live DB. |

---

## 4. Equipment & materials

### `job_materials` (implemented)

- **Access:** `jobService.getMaterials`, `addMaterial`, `updateMaterial`, `deleteMaterial`.
- **Behavior:** Standard **job-scoped** material lines (name, quantity, unit, `cost_cents`, supplier). Suitable for **estimates and job costing**.
- **Consumption / inventory:** There is **no** service logic that reduces stock in a `materials` inventory table or posts consumption transactions when a job completes. Treat `job_materials` as **documentation of planned/used materials**, not automated inventory.

### `equipment` & `equipment_assignments` (partial / missing)

- **`equipment`:** `adminService.getEquipmentStatus`, `getEquipmentCategories`, **`addEquipment`** — fleet metadata and dashboard widgets.
- **`equipment_assignments`:** Schema ties **equipment ↔ jobs ↔ profiles** (assignee, `returned_at`, etc.). **No service layer** in `src/services` creates or queries assignments, so the app does **not** currently automate “this mower is on Job 123 with Crew A.”

---

## 5. Improvements & optimization

### 5.1 Scheduler / planner — query & round-trip risk (not classic ORM N+1)

`schedulePlannerService.createWorkDay` uses **one round-trip per `schedule_jobs` row** and **one per `(employee, job)` pair** for `employee_jobs`:

- For **J** jobs and **M** crew members: **~ J + M×J** sequential `await sql\`...\``** calls (plus setup queries).

**Recommendation:** Replace inner loops with:

- **Bulk insert** `schedule_jobs` via `INSERT … SELECT` from a VALUES list or `unnest` arrays; and  
- **Bulk insert** `employee_jobs` with `INSERT … SELECT` crossing `crew_members` × selected `job_ids` with `ON CONFLICT DO NOTHING`.

This preserves semantics while cutting latency on Neon serverless.

**Contrast:** `scheduleService.getAll` uses **one** aggregated SQL query (`array_agg` for `employeeIds`) — good pattern for reads.

### 5.2 Missing product / platform features (roadmap ideas)

| Idea | Rationale |
|------|-----------|
| **GPS / live location** | Proof-of-service, ETAs, route compliance; would need mobile client + privacy policy + background location strategy. |
| **Push notifications** | New `employee_jobs` or `schedule_jobs` changes → FCM/APNs; complements email/SMS. |
| **Invoice-from-job automation** | Server action: on `completed` → draft `invoices` + lines from `job_items` / `job_materials`. |
| **`equipment_assignments` service + UI** | Check-out to job/worker, return workflow, maintenance alerts tied to usage. |
| **Skills-based assignment** | Join `employee_skills` to job requirements when suggesting crew or validating planner selections. |
| **Unify `clients` admin** | Replace `clientService` mock with Prisma/Neon CRUD aligned with quote conversion. |
| **Real analytics** | Replace `analyticsService` / `reportsService` mocks with SQL aggregations or BI export. |

### 5.3 Calendar view — UI recommendations

Today **`/admin/schedule`** renders **`DailyPlanner`** only (date + crew + multi-select jobs + submit). To match operator expectations of a **calendar**:

1. **Month grid** — density dots or counts per day from `schedules` grouped by `date`.  
2. **Day / crew lane** — timeline of `schedule_jobs.estimated_start_time` + duration bars; drag to reorder `route_order`.  
3. **Week view** — compare crews side-by-side to spot double-booking beyond current collision warning.  
4. **Deep link** — click calendar cell → open Daily Planner prefilled with date (and optional crew).  
5. **Mobile** — read-only schedule for workers with ICS export or responsive timeline.

Use **`scheduleService`** read paths or a dedicated aggregated query for the calendar data layer; keep mutations in Server Actions.

---

## 6. Worker qualifications — `employee_skills`

**Audit result:** **`employee_skills` is not used** in TypeScript application code (no imports, no SQL strings referencing it).

- **Schema:** `schema-summary.txt` describes `employee_skills` (e.g. skill name, level, certification flags).  
- **Runtime:** Assignment logic is **crew membership + planner job selection**, not “only workers with skill X.”

**Recommendation:** Define job-level **required skills** (new column or join table) and filter `crew_members` / planner job suggestions with `EXISTS (SELECT 1 FROM employee_skills …)` before saving `employee_jobs`.

---

## 7. Strategic summary

**Current power**

- Solid **Neon/Prisma** footprint for **jobs, invoices, payments, time entries, notes, contracts, crews, planner writes, quote conversion**.  
- **Daily workday creation** is a real differentiator: one action creates schedule rows and fan-out assignments.  
- **Admin dashboard** aggregates real DB metrics where `adminService` is used.

**Gaps to prioritize**

1. **Data truth:** Mock **`clientService`** vs real **`clients`** from quotes.  
2. **Planner performance:** Batch SQL for `createWorkDay`.  
3. **Equipment & skills:** Schema exists; **services and UI** missing.  
4. **Materials:** Cost tracking without inventory consumption.  
5. **Presentation:** **Calendar** UX lags behind data model capabilities.  
6. **Reporting/analytics:** Largely **placeholder** services.

---

*Generated from repository audit; verify behavior after major refactors by re-grepping `src/services` and `app/actions`.*
