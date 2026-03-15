# Structural Audit: TypeScript Types, Services, Hooks & Architecture

**Audit date:** Based on codebase state at time of review.  
**Scope:** Type definitions, service layer, hooks, API, utils, alignment with database schema and workflows.

---

## SECTION 1 — TYPE ISSUES

### 1.1 Schema vs. Type Source of Truth

- **Prisma schema is incomplete.** Many tables present in the live DB (and referenced in `database-schema.txt` / `schema-summary.txt`) are **not** in `prisma/schema.prisma`, including:
  - `crews`, `crew_members`, `crew_jobs`
  - `client_addresses`, `client_communications`, `client_preferences`, `communication_reminders`, `contracts`, `contract_amendments`, `contract_templates`
  - `job_notes`, `job_photos`, `job_milestones`, `job_materials`, `job_tasks`
  - `employee_skills`, `equipment`, `equipment_assignments`, `materials`
  - `dashboard_widgets`, `user_dashboards`, `dashboard_widget_assignments`
  - Others listed in `database-schema.txt`
- **Consequence:** No single source of truth. Types in `src/domain/entities.ts` and services are written against an assumed or partial schema, leading to drift and runtime risk.

### 1.2 Duplicate or Conflicting Types

- **Two `Client` interfaces:**
  - `src/domain/entities.ts`: rich domain model (`contactInfo`, `primaryAddress`, `status`, `segment`, `totalSpent`, etc.).
  - `src/domain/models.ts`: flat UI model (`name`, `email`, `phone`, `address`, `serviceHistory`, `totalSpent`).
- **Risk:** Consumers importing `Client` from different files get incompatible shapes. No shared “DB client” or DTO that matches `clients` table columns.

### 1.3 Domain Entities vs. Database Columns

- **`Job` (entities.ts)** includes fields not present on the **actual `jobs`** table (from `database-schema.txt` and Prisma):
  - Missing in DB: `priority`, `estimated_duration`, `actual_duration`, `scheduled_start`, `scheduled_end`, `actual_start`, `actual_end`, `supervisor_id`, `invoice_id`, `contract_id`, `notes`, `internal_notes`, `photos`, `completion_notes`, `cancelled_at`, `cancellation_reason`.
  - Prisma `jobs` has: `id`, `job_number`, `client_id`, `status`, `title`, `description`, `street`, `city`, `state`, `zip_code`, `country`, `quoted_price_cents`, `currency`, `created_at`, `updated_at`, `created_by`, `deleted_at`, `approved_by`, `approved_at`, `completed_by`, `completed_at`, and (in DB) `quote_request_id`.
- **`Client` (entities.ts)** uses nested `contactInfo`, `primaryAddress`, `segment`, etc. The `clients` table is flat (`name`, `email`, `phone`, `street`, `city`, `state`, `zip_code`, `country`). No interface clearly represents the raw row.

### 1.4 Nullable / Optional Mismatches

- **Prisma `employee_details`:** `profile_id`, `hire_date`, `status`, `department`, `position`, `hourly_rate_cents`, `created_at`, `updated_at` are optional/nullable. Domain `Employee` and service mappers do not consistently treat these as optional when reading from DB.
- **Prisma `employee_jobs`:** `employee_id`, `job_id`, `assigned_at`, `status` are optional. Assignment types and service INSERTs assume required; type contracts should reflect nullability.

### 1.5 Enums

- **Prisma enums** (`job_status`, `invoice_status`, `user_status`, `payment_status`, etc.) use **lowercase** (e.g. `draft`, `in_progress`).
- **Domain enums** (e.g. `JobStatus`, `EmployeeRole`) use **UPPER_CASE** values that match. `models.ts` `User.role` and `User.status` use **PascalCase** (`'Admin'`, `'Active'`), which does not match DB or Prisma.
- **InvoiceStatus (entities.ts)** includes values not in Prisma `invoice_status`: e.g. `VIEWED`, `PARTIALLY_PAID`, `REFUNDED`. Prisma has: `draft`, `sent`, `paid`, `overdue`, `cancelled`.

### 1.6 Primary / Foreign Keys

- **EntityId = string** is used consistently for IDs; UUIDs from DB are strings. No type distinction for “branded” IDs (e.g. `ClientId`, `JobId`), which would reduce mix-ups.

### 1.7 DTOs and System Fields

- **Create/Update DTOs** are ad hoc (e.g. `Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>` in jobService). There is no shared pattern (e.g. `JobCreate`, `JobUpdate`) that:
  - Omits `id`, `created_at`, `updated_at` (and sometimes `deleted_at`),
  - Makes optional fields explicit for updates.
- **Crew service** uses inline parameter types; no `CrewCreate` / `CrewUpdate` in domain.

### 1.8 Missing or Inconsistent Interfaces for DB-Only Tables

- **Crews:** `crewService` defines its own `Crew`, `CrewMember`, `CrewJob` (camelCase). These are not in `domain/entities.ts`. `crew_members` has `joined_date` (DB) mapped to `joinedDate` (TS); no shared “row” type.
- **employee_jobs:** Prisma has no `role_in_job`; `schema-summary.txt` shows it. If the column exists in DB, Prisma and any Prisma-based types are out of date; if not, `assignmentService` INSERT will fail.
- **Contracts, communications, job_notes, etc.:** Domain has rich types (e.g. `Contract`, `Communication`) but no clear “table row” types for the many tables not in Prisma.

---

## SECTION 2 — SERVICE ISSUES

### 2.1 Incorrect Database Usage

- **employeeService.getAll():** Queries `FROM "User" u LEFT JOIN employee_details ed ON u.id = ed.profile_id`. In schema, `employee_details.profile_id` references **profiles.id**, not **User.id**. The correct join is **User → profiles (user_id) → employee_details (profile_id)**. Current query is wrong and will not return correct employee details.
- **employeeService:** Selects `u.created_at`, `u.updated_at`, `u.created_by`, `u.updated_by` from `User`. The **User** model in Prisma has no such columns (only `id`, `email`, `password`, `role`, `name`, `emailVerified`, `image`). This will throw at runtime if the DB table matches Prisma.
- **jobService:** SELECTs and mapJobRow use columns that **do not exist** on the current `jobs` table in Prisma or in `database-schema.txt`: `priority`, `estimated_duration`, `actual_duration`, `scheduled_start`, `scheduled_end`, `actual_start`, `actual_end`, `supervisor_id`, `invoice_id`, `contract_id`, `notes`, `internal_notes`, `photos`, `completion_notes`, `cancelled_at`, `cancellation_reason`. Either the DB has been extended without schema docs, or these queries will fail or return null/undefined and propagate incorrect data.
- **assignmentService:** Inserts into `employee_jobs` with column `role_in_job`. Prisma schema for `employee_jobs` does not include `role_in_job`. If the column is missing in DB, INSERT fails; if it exists, Prisma and types are out of date.

### 2.2 Return Types vs. Interfaces

- **jobService.mapJobRow:** Uses `any` for the row and returns `Job` with many fields defaulted or from non-existent columns. Actual runtime shape may not satisfy `Job` for consumers.
- **employeeService:** Returns `Employee[]` / `Partial<Employee>` but builds objects with hardcoded empty arrays and default availability; some fields (e.g. `terminationDate`, `paySchedule`) are never set. Return type overstates what’s actually provided.
- **crewService:** Return types are service-defined interfaces; no domain/entities types for Crew, so no single contract for “crew” across the app.

### 2.3 Error Handling

- **jobService:** No try/catch in `getAll`, `getById`, `getByClientId`, etc. Failures propagate as unhandled rejections. No logging.
- **crewService.getSql():** Throws if `DATABASE_URL` is missing; other functions do not wrap in try/catch. `getCrewJobs` and related catch only for “table does not exist” and return [] or false; other errors propagate.
- **assignmentService:** No try/catch; no logging. Callers must handle all failures.
- **invoiceService:** Same pattern as jobService (no try/catch in sampled methods).
- **employeeService:** Uses try/catch and returns [] or undefined on error, but only logs with `console.error`; no structured error or rethrow for API layer to translate to HTTP status.
- **clientService:** Uses mock only; no real DB. If switched to DB, current interface would need error handling and correct types.

### 2.4 Silent Failures

- **employeeService.getAll():** On error, returns `[]`; callers cannot distinguish “no employees” from “query failed”.
- **crewService:** When `crew_jobs` does not exist, returns `[]` or `false` without signalling “table missing” to callers or logs.

### 2.5 Consistency of Responses

- Some services return `undefined` for “not found” (e.g. jobService.getById), others `null` (e.g. crewService.getCrewById). Inconsistent for API and UI (e.g. “404” vs “200 + null”).
- No shared `Result<T, E>` or `{ data?, error? }` pattern; mixing undefined, null, and thrown errors makes error handling inconsistent.

---

## SECTION 3 — HOOK ISSUES

### 3.1 Typing

- **useAsync:** Generic `UseAsyncReturn<T, A>` is correctly typed. `asyncFn` is not validated to return `Promise<T>` when called with `A`; type safety depends on correct usage.
- **useFormPersistence:** Generic `T` is used for initial value and persisted value. `JSON.parse` can return any; parsed value is not validated (e.g. with Zod). Corrupted or old localStorage can produce runtime type violations.
- **usePagination:** Well-typed; no dependency on API or domain types.
- **useMediaQuery:** Returns `boolean`; correctly typed.

### 3.2 API Response Alignment

- Hooks that call APIs (e.g. in features) often use raw `fetch` and then `res.json()` with no validation. Response types are assumed to match interfaces (e.g. `JobListItem`, assignment counts). If API changes or returns an error shape, hooks/components can use wrong data without type or runtime checks.
- Recommendation: Define response types (or Zod schemas) per endpoint and validate in a thin API layer or in the hook.

### 3.3 Loading and Error State

- **useAsync:** Exposes `isLoading`, `error`, `isSuccess`, `isError`; appropriate for one-off calls.
- **useFormPersistence:** No loading state (sync localStorage); errors only logged, not surfaced to caller.
- **usePagination:** No loading/error; it’s stateless pagination math. Data loading is the caller’s responsibility.
- Many feature components (e.g. EmployeeList) manage their own loading/error state and call services or APIs directly; no shared “data hook” pattern that guarantees loading/error handling.

### 3.4 Data Transformations

- **useFormPersistence:** Persists and restores `value` via JSON. No schema; nested objects and special values (Date, undefined in arrays) can be serialized/deserialized incorrectly.
- Transformations from API to domain (e.g. snake_case → camelCase, or API DTO → `Job`) are done in components or services inconsistently; no single place that “API response → domain” is typed and tested.

### 3.5 Reusability and Coupling

- **useAsync:** Reusable; not tied to a specific API.
- **useFormPersistence:** Reusable; key and initial value are parameters. Coupling to “form” is in the name only; it’s generic key-value persistence.
- **usePagination:** Reusable.
- **useMediaQuery:** Reusable.
- No dedicated “useEmployees”, “useJobs”, “useCrews” hooks that encapsulate fetch + loading + error + refetch. Each feature builds its own logic, which duplicates patterns and makes it harder to enforce types and error handling.

---

## SECTION 4 — ARCHITECTURE IMPROVEMENTS

### 4.1 Separation of Concerns

- **Types:** Split across `domain/entities.ts`, `domain/models.ts`, and service files (e.g. `crewService`, `assignmentService`). Recommendation: one place for “DB row” or “API response” types per aggregate (or per table), and domain types that represent business entities; keep services focused on mapping and persistence.
- **Services:** Some use Prisma, many use `neon()` directly. No shared “data access” layer, so table/column names and SQL are duplicated or drift. Recommendation: align Prisma schema with actual DB (or document why not), and prefer Prisma for tables it knows about; use a single “raw SQL” module for tables outside Prisma (e.g. crews, crew_jobs) with clear types for row shapes.
- **API routes:** Call services or raw `neon()`; some validate session, then return JSON. No shared middleware for auth or error formatting; no shared “API response” envelope (e.g. `{ data, error }`).
- **Utils:** `lib/utils.ts` is only `cn()` for CSS. Service `utils.ts` has `asyncify`/`asyncifyWithError`. Recommendation: keep “UI utils” and “async helpers” clearly separated and name them so (e.g. `asyncHelpers.ts` in services).

### 4.2 Files to Split or Reduce

- **`src/domain/entities.ts`:** Very large (~1100+ lines). Consider splitting by aggregate: `client.ts`, `job.ts`, `employee.ts`, `invoice.ts`, `payment.ts`, etc., and a single `entities/index.ts` that re-exports.
- **`EmployeeList.tsx`:** Very large (2000+ lines). Extract crew tab, modals, and table into subcomponents or feature modules; keep the page as composition and state wiring.
- **`jobService.ts`:** Large; could split into “read”, “write”, “assignments”, “tasks/materials” modules with a facade.

### 4.3 Duplicated Logic

- **DB connection:** Multiple services call `neon(process.env.DATABASE_URL!)` or a local `getSql()`. Recommendation: single module (e.g. `db.ts`) that exports a safe getter and handles missing env.
- **Snake → camel mapping:** Done ad hoc in each service. Consider a small shared mapper or convention (e.g. one function per table row type).
- **Session check in API:** Repeated `getServerSession(authOptions)` and `if (!session?.user)` in each route. Extract to a small `withAuth` or `requireSession` helper.

### 4.4 Missing Abstractions

- **Repository or data access layer:** No clear “JobRepository” / “ClientRepository” that hides SQL and returns domain types. Services mix “query” and “map to domain” and “throw or return”.
- **API client layer:** No typed client (e.g. `api.get('/api/jobs')` returning `Promise<Job[]>` with validation). Features use raw `fetch` and manual typing.
- **Error boundary / error types:** No shared “AppError” or “ServiceError” with codes; no boundary that turns service errors into consistent API or UI messages.

---

## SECTION 5 — MISSING TYPES OR FILES

### 5.1 Missing Interfaces for Existing Tables

- **crews / crew_members / crew_jobs:** No types in `domain/`; only in `crewService.ts`. Recommendation: add `domain/crew.ts` (or similar) with `Crew`, `CrewMember`, `CrewJob` and, if needed, row types matching DB.
- **client_addresses, client_preferences, client_communications, contracts, job_notes, job_tasks, etc.:** Domain has high-level entities (e.g. `Contract`, `Communication`) but no explicit “table row” interfaces for these tables. When services or API use raw SQL, row types are inferred or `any`.
- **employee_jobs:** No dedicated “EmployeeJobRow” or “AssignmentRow” that matches the table (including optional `role_in_job` if present in DB).
- **User (auth):** Prisma `User` exists; domain uses `User` in `models.ts` with different shape (e.g. `role: 'Admin' | 'Worker' | ...`). No single “AuthUser” or “SessionUser” type used across auth and features.

### 5.2 Missing DTOs

- **JobCreate / JobUpdate:** Not defined as named types; only `Omit<Job, ...>` at call sites.
- **CrewCreate / CrewUpdate:** Inline in crewService; not in domain.
- **ClientCreate / ClientUpdate:** Same as Job; clientService uses domain `Client` and mock only.
- **InvoiceCreate / InvoiceUpdate:** Same pattern as Job.
- Recommendation: Add a `dto/` or `domain/dto/` (or per-aggregate files) with Create/Update types that omit system fields and document optional fields for updates.

### 5.3 Missing Domain Types

- **Quote (from quote_requests):** Domain has `Quote`; Prisma has `quote_requests` and enums. Alignment and use of Prisma enums in domain should be explicit.
- **Payout, Refund, Transaction:** Present in Prisma; domain may have partial or no types. Ensure they exist and match usage in paymentService and reports.

---

## SECTION 6 — LOGGING / ERROR HANDLING IMPROVEMENTS

### 6.1 Logging

- **Inconsistent:** Some services use `console.error` on failure (e.g. employeeService); others have no logging (jobService, assignmentService, crewService for most paths).
- **No structure:** No log levels (e.g. debug vs error), request IDs, or correlation. Recommendation: introduce a small logger (or use a library) with levels and optional context (e.g. `logger.error('jobService.getById', { id, err })`).
- **Sensitive data:** Ensure logs never print full request bodies, tokens, or PII; audit `console.log`/`console.error` in services and API routes.

### 6.2 Error Handling

- **No shared error type:** Services throw strings or `new Error(...)`. API routes catch and return 500 with a message. No “not found” vs “validation” vs “conflict” distinction for proper status codes (404, 400, 409).
- **Recommendation:** Define a small set of error classes (e.g. `NotFoundError`, `ValidationError`) and a single place in API that maps them to status and safe client messages; services throw these instead of generic `Error`.
- **Client-safe messages:** Ensure `NextResponse.json({ error: ... })` never exposes stack traces or internal details in production.

### 6.3 Development vs Production

- **Debug logs:** No convention for “dev-only” logs. Recommendation: wrap in `if (process.env.NODE_ENV === 'development')` or use a logger that respects level so production stays quiet.

---

## SECTION 7 — FINAL CODE QUALITY NOTES

### 7.1 Comments and Documentation

- **Services:** Some have file-level JSDoc (e.g. crewService, jobService); many functions lack comments. Complex queries (e.g. jobService getWithRelations) would benefit from a short comment explaining intent.
- **Domain entities:** Well-commented in places (e.g. Client, Job); large blocks could use a short “used by” or “mapped from table X” note.
- **API routes:** Minimal comments; recommend one-line description per route and documented request/response shapes (e.g. in a shared doc or OpenAPI).

### 7.2 Race Conditions and Concurrency

- **useFormPersistence:** Writes to localStorage on every `value` change; rapid updates could cause many writes. Consider debouncing or batching.
- **Employee list / crew list:** Multiple useEffects and fetch-on-tab or fetch-on-mount; no cancellation (AbortController). If user switches tabs quickly, older requests can overwrite newer state. Recommendation: abort previous request on tab change or unmount.

### 7.3 Potential Runtime Errors

- **process.env.DATABASE_URL!:** Non-null assertion in many places; if unset at runtime, `neon(undefined)` or similar can throw in unexpected ways. Prefer a single module that checks once and throws a clear error at startup or first use.
- **JSON.parse in useFormPersistence:** Can throw; already in try/catch but fallback to initialValue can hide corruption. Consider validating parsed value (e.g. Zod) and clearing key if invalid.
- **Optional chaining and defaults:** Many places use `??` or `||` for DB values; ensure “empty string” and “0” are handled as intended (e.g. not replaced by a default when they are valid).

### 7.4 Naming Conventions

- **Tables:** DB uses snake_case (e.g. `employee_jobs`, `crew_members`). Prisma uses snake_case for table names. Consistent.
- **Domain types:** PascalCase (Job, Client, Employee). Consistent.
- **Service functions:** Mix of camelCase (getAll, getById) and descriptive names. Some services export both an object (e.g. `jobService`) and standalone functions (e.g. `getJobs`, `getJobById`). Recommendation: pick one style per service (either object or named exports) and document it.
- **API routes:** REST-like paths; consistent. Response bodies are camelCase in many places; document and keep consistent.

### 7.5 Summary of High-Impact Fixes

1. **Fix employeeService query:** Join via `profiles` (User → profiles → employee_details); remove references to non-existent `User` columns.
2. **Align jobService with real schema:** Either add missing columns to schema/docs and Prisma, or remove use of non-existent columns and adjust `Job` type and mappers.
3. **Confirm employee_jobs.role_in_job:** Add to Prisma if it exists in DB; otherwise remove from assignmentService INSERT or add migration.
4. **Unify Client type usage:** Decide on “domain Client” vs “API/mock Client”; avoid two incompatible `Client` interfaces or document which to use where.
5. **Introduce shared error handling and optional logging:** One DB getter, one error-mapping layer for API, optional structured logger.
6. **Add missing domain/row types for crews and other non-Prisma tables:** So services and API have a single contract and fewer `any` or ad hoc shapes.

---

*End of audit.*
