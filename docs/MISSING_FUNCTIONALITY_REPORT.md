# Missing Functionality Report & Implementation Summary

**Project:** J&J Desert Landscaping LLC – Landscaping Services Platform  
**Date:** March 2025  
**Scope:** Frontend-only; no database schema or backend API changes.

---

## 1. Completed Implementations

### 1.1 Login Page UX
- **Back to Website** link added on both:
  - `app/login/page.tsx` (NextAuth login)
  - `src/features/auth/ui/LoginPage.tsx` (mock login)
- Link points to `/` and uses consistent styling; authentication flow unchanged.

### 1.2 SEO (Homepage / Marketing)
- **Metadata** (Phoenix, Arizona, landscaping):
  - `app/(marketing)/page.tsx`: title, description, keywords, OpenGraph, Twitter, canonical, robots.
  - `app/layout.tsx`: default title/description updated with Phoenix AZ and service keywords.
- **Structured data:** JSON-LD `LocalBusiness` in `(marketing)/page.tsx` (name, description, telephone, address, geo, areaServed, openingHours).
- **Sitemap:** `app/sitemap.ts` with `/`, `/#services`, `/#contact`, `/request-quote`.
- **Content:** Hero H1 and Services H2/paragraph updated to include “Phoenix, Arizona” and service terms (desert landscaping, yard cleanup, irrigation, gravel installation, tree trimming, yard maintenance).

### 1.3 Contract & Note Services (Neon DB)
- **`src/services/contractService.ts`** (new):
  - Reads from `contracts` (no schema change).
  - `getByClientId(clientId)` → list of contracts for client.
  - Returns `ContractForUI[]` used by Client Directory → Client Contracts tab.
- **`src/services/noteService.ts`** (new):
  - Reads from `job_notes` joined to `jobs` by `client_id`.
  - `getByClientId(clientId)` → list of notes for that client’s jobs.
  - Returns `NoteForUI[]` used by Client Directory → Client Notes tab.
- **`src/features/admin/clients/ui/ClientDirectory.tsx`**:
  - Imports `getContractsByClient`, `getClientNotes`, and types `ContractForUI`, `NoteForUI`.
  - State for contracts and notes typed with these types.

### 1.4 User Management (Admin System Users)
- **`src/services/userService.ts`**:
  - **`getSystemUsers()`** added: profiles + `User` (email) + `user_roles`/`roles` + `employee_details` + last login from `audit_logs` (action = `'login'`).
  - Uses `LEFT JOIN "User" u ON u.id = p.user_id` (Postgres table name `User`).
- **`src/features/admin/users/ui/UserManagement.tsx`**:
  - Uses `getSystemUsers()` instead of `getAllUsers()`.
  - Shows all roles (Admin, Supervisor, Worker, Client); no longer filtered to Client/Worker only.
  - Last login comes from DB when available.
- **`src/features/admin/users/ui/UserDetail.tsx`**:
  - **Assigned Role:** dropdown to change role (optional `onRoleChange`).
  - **Last Login** and **Employee #** displayed when present.
  - **Actions:** Edit, Disable (toggle status), Reset Password, Impersonate, Delete (callbacks passed from UserManagement; Reset Password / Impersonate currently show alerts; backend can be wired later).

### 1.5 Job Service Alias
- **`src/services/jobService.ts`**:
  - `getJobsByClient` exported as alias of `getJobsByClientId` for ClientDirectory.

### 1.6 Hooks
- **`src/hooks/useMediaQuery.ts`**:
  - SSR-safe: initial state `false`; real value set in `useEffect` to avoid hydration mismatch.
  - Effect dependency simplified (removed `matches` from deps).
- **`src/hooks/useFormPersistence.ts`**:
  - No change; already supports value, setValue, reset, clear.
- **`src/hooks/usePagination.ts`** (new):
  - Page, pageSize, totalItems, totalPages, startIndex/endIndex, setPage, setPageSize, setTotalItems, next/prev/first/last, hasNextPage/hasPrevPage.
- **`src/hooks/useAsync.ts`** (new):
  - Wraps async function; exposes data, error, isLoading, isSuccess, isError, execute, reset; optional onSuccess/onError.

---

## 2. Not Implemented / Recommendations

### 2.1 Client Service → Neon
- **Current:** `clientService` uses `mockStore` (in-memory).
- **Recommendation:** Add Neon-backed `getAll`/`getById` using `clients` and `client_addresses` (per `database-schema.txt`), mapping to domain `Client`. Keep create/update/delete as-is or implement via server actions/API when available.
- **Note:** These services run in the environment where they’re called. If called from client components (e.g. `useEffect`), `process.env.DATABASE_URL` is not available in the browser. Prefer invoking Neon-backed logic from Server Components, Server Actions, or API routes.

### 2.2 Communication Service → Neon
- **Current:** Uses mockStore.
- **Recommendation:** Add Neon implementation reading `client_communications` and `communication_reminders` for the Communications tab; same server-side invocation pattern as above.

### 2.3 User Role Update (Dropdown)
- **Current:** UserDetail has role dropdown and `onRoleChange` callback; UserManagement does not pass `onRoleChange` (only Edit, Disable, Reset Password, Impersonate, Delete).
- **Recommendation:** Implement role update in backend (e.g. update `user_roles` / `roles`), then in UserManagement pass `onRoleChange` that calls a server action or API and refetches users.

### 2.4 Reset Password & Impersonate
- **Current:** Placeholder alerts in UserDetail.
- **Recommendation:** Integrate with your auth provider (e.g. NextAuth, custom API) for reset-password flow and impersonation (if allowed by policy).

### 2.5 Employee Management
- **Route:** `/admin/employees` exists; EmployeeList and profile tabs (Personal, Skills, Schedule, Time Cards, Performance, Payroll, Equipment) should be wired to:
  - `profiles`, `employee_details`, `employee_skills`, `schedules`, `crew_members`, `time_entries`, `payouts`, `equipment_assignments` (per schema).
- **Recommendation:** Reuse patterns from User and Client management: Neon-backed services + existing hooks (e.g. usePagination, useAsync) and ensure data is loaded server-side where Neon is used.

### 2.6 Client Preferences & Addresses
- **Schema:** `client_preferences`, `client_addresses` exist in `database-schema.txt`. ClientPreferences and ClientProperties tabs can be wired to these tables via new or extended Neon services (read-only from frontend if no APIs).

### 2.7 Notifications / Toasts
- **Current:** No global toast/notification system.
- **Recommendation:** Add a small context + UI (e.g. Sonner, react-hot-toast, or custom) and use it for success/error after actions (e.g. user status change, export).

---

## 3. Database & Architecture Notes

- **Schema:** All references follow `database-schema.txt` and `schema-summary.txt`; no schema changes were made.
- **Neon:** Services that use `neon(process.env.DATABASE_URL!)` must run in a Node/server context (Server Components, Server Actions, or API routes). Client-side calls from components will not have `DATABASE_URL` in the browser.
- **Postgres table name:** `getSystemUsers` uses `"User"` (quoted). If your actual table name is lowercase `user`, change the query to use that.

---

## 4. File Change Summary

| Area            | Files touched |
|-----------------|---------------|
| Login           | `app/login/page.tsx`, `src/features/auth/ui/LoginPage.tsx` |
| SEO             | `app/(marketing)/page.tsx`, `app/layout.tsx`, `app/sitemap.ts`, `src/features/marketing/ui/HeroSection.tsx`, `src/features/marketing/ui/ServicesSection.tsx` |
| Contracts/Notes | `src/services/contractService.ts` (new), `src/services/noteService.ts` (new), `src/features/admin/clients/ui/ClientDirectory.tsx` |
| Users           | `src/services/userService.ts`, `src/features/admin/users/ui/UserManagement.tsx`, `src/features/admin/users/ui/UserDetail.tsx` |
| Jobs            | `src/services/jobService.ts` (getJobsByClient alias) |
| Hooks           | `src/hooks/useMediaQuery.ts`, `src/hooks/usePagination.ts` (new), `src/hooks/useAsync.ts` (new) |
| Docs            | `docs/MISSING_FUNCTIONALITY_REPORT.md` (this file) |

---

## 5. Safe Refactoring Recommendations

1. **Centralize Neon usage:** Consider a single data-access layer (e.g. server actions or API route handlers) that calls Neon and returns typed DTOs; UI only calls these and never imports `neon()` in client bundles.
2. **Types:** Keep `ContractForUI` and `NoteForUI` in sync with ClientContracts/ClientNotes UI; consider sharing one type from a shared types file.
3. **Error handling:** Services currently catch and log errors and return empty arrays or throw; add user-facing error state in UI (e.g. useAsync + toast) where appropriate.
4. **Tables:** Reuse existing DataTable + pagination (e.g. usePagination) and loading/empty states across admin tables for consistency.
