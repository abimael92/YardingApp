# Frontend Visual Redesign — Analysis

**Goal:** Prepare a full visual redesign without changing logic.  
**Scope:** Identify shared UI, layouts, pages; hardcoded colors/fonts/spacing; role inconsistencies; responsiveness issues.  
**Output:** Checklist of files to touch + risk list (what NOT to break).  
**No code changes, no commit, no styles applied in this phase.**

---

## 1. Shared UI Components

| Component | Path | Usage / Notes |
|-----------|------|----------------|
| **Breadcrumbs** | `src/shared/ui/Breadcrumbs.tsx` | Used on admin + client dashboard pages; path-based links. |
| **DataTable** | `src/shared/ui/DataTable.tsx` | Tables with optional onView/onEdit/onDelete; loading/empty states; `min-w-[640px]` table. |
| **EmptyState** | `src/shared/ui/EmptyState.tsx` | Centered icon + title + message + optional CTA button. |
| **Footer** | `src/shared/ui/Footer.tsx` | Marketing layout only; logo, links, copyright. |
| **FormModal** | `src/shared/ui/FormModal.tsx` | Reusable modal with size variants (sm/md/lg/xl); motion. |
| **LoadingState** | `src/shared/ui/LoadingState.tsx` | Spinner + message; optional fullScreen. |
| **Navbar** | `src/shared/ui/Navbar.tsx` | Marketing + login; logo, nav links, dark mode, user dropdown. |
| **NavDropdown** | `src/shared/ui/NavDropdown.tsx` | Used inside Navbar for role-based menu. |
| **Sidebar** | `src/shared/ui/Sidebar.tsx` | Dashboard nav for admin/client/worker/supervisor; green/emerald theme; w-72; mobile overlay. |
| **StatsCard** | `src/shared/ui/StatsCard.tsx` | Metric card with icon; color prop: primary, green, earth, sand, blue, red; uses `.card`. |
| **TaskCard** | `src/shared/ui/TaskCard.tsx` | Task row with priority border, actions. |
| **TestimonialCard** | `src/shared/ui/TestimonialCard.tsx` | Marketing testimonials. |
| **WorkerCard** | `src/shared/ui/WorkerCard.tsx` | Worker avatar + name + actions. |
| **ServiceCard** | `src/shared/ui/ServiceCard.tsx` | Service image + title + description; used in marketing + client services. |

**Admin-only / route-specific components (not shared):**  
`CreateInvoiceModal`, `EditInvoiceModal`, `ViewInvoiceModal`, `InvoicePrintPreviewModal`, `InvoicePDF`, `JobCostCalculator` (under `app/(dashboard)/admin/` or `src/features/admin/`).

---

## 2. Layouts

| Layout | Path | Role | Notes |
|--------|------|------|--------|
| Root | `app/layout.tsx` | All | GeistSans/GeistMono in `<head>`; body `min-h-screen`. |
| Dashboard shell | `app/(dashboard)/layout.tsx` | All dashboards | Wrapper `min-h-screen` only; no chrome. |
| Admin | `app/(dashboard)/admin/layout.tsx` | admin | RoleGate + `section.min-h-screen`. |
| Client | `app/(dashboard)/client/layout.tsx` | client | RoleGate + `section.min-h-screen`. |
| Worker | `app/(dashboard)/worker/layout.tsx` | worker | RoleGate + `section.min-h-screen`. |
| Supervisor | `app/(dashboard)/supervisor/layout.tsx` | supervisor | RoleGate + `section.min-h-screen`. |
| Marketing | `app/(marketing)/layout.tsx` | Public | Navbar + main + Footer; dark mode state. |

**Page-level shells:**  
- **Admin list pages:** Sidebar + header (title + subtitle) + Breadcrumbs + content area; responsive (min-w-0, overflow-x-hidden, p-4 sm:p-6, text-xl sm:text-2xl).  
- **Client pages (e.g. schedule):** Sidebar + header + Breadcrumbs + content; **not** updated with same responsive classes (still p-6, text-2xl, no min-w-0).  
- **Worker/Supervisor:** Root route renders dashboard component only (no Sidebar in page); sub-routes (schedule, tasks, etc.) vary.  
- **Marketing:** Navbar + main (LandingPage sections) + Footer.  
- **Login:** Centered card, no Navbar/Sidebar.  
- **404:** Standalone centered block.

---

## 3. Pages (routes → content)

- **Marketing:** `app/(marketing)/page.tsx` → `LandingPage` (HeroSection, ServicesSection, WhyChooseUsSection, StatsSection, ClientTestimonialsSection).  
- **Login:** `app/login/page.tsx` → `LoginPage`.  
- **404:** `app/not-found.tsx`.  
- **Admin:** `app/(dashboard)/admin/page.tsx` → `AdminDashboard`; sub-routes (analytics, clients, employees, invoices, jobs, payments, quotes, reports, schedule, settings, tasks, users) each use Sidebar + header + Breadcrumbs + feature component.  
- **Client:** `app/(dashboard)/client/page.tsx` → `ClientDashboard`; schedule, services, billing each use Sidebar + header + Breadcrumbs + feature view.  
- **Worker:** `app/(dashboard)/worker/page.tsx` → `WorkerDashboard`; tasks, schedule, map have their own page wrappers.  
- **Supervisor:** `app/(dashboard)/supervisor/page.tsx` → `SupervisorDashboard`; analytics, schedule, tasks, team have their own pages.

---

## 4. Hardcoded Colors

### 4.1 Hex / RGB in TSX (charts and invoice print)

- **Analytics:** `AnalyticsPage.tsx` — `COLORS` array and Line/Bar `stroke`/`fill`: `#10b981`, `#3b82f6`, `#f59e0b`, `#ef4444`, `#8b5cf6`.  
- **Reports:** `ReportsPage.tsx` — Line/Bar: `#10b981`, `#ef4444`, `#3b82f6`.  
- **SupervisorDashboard:** Pie/donut: `#22c55e`, `#3b82f6`, `#f59e0b`, `#ef4444`; legend fill.  
- **AdminDashboard:** Line chart stroke/dot: `#22c55e`.  
- **ClientDashboard:** Line chart: `#22c55e`.  
- **InvoicePrintPreviewModal.tsx** and **InvoicePDF.tsx:** Inline styles for print/PDF: `#059669`, `#065f46`, `#6b7280`, `#374151`, `#e5e7eb`, `#f9fafb`, `#9ca3af`, etc.

### 4.2 Tailwind semantic tokens

- **globals.css:** `--primary`, `--background`, `--foreground`, `--card`, etc. (HSL values).  
- **tailwind.config.mjs:** Maps CSS vars to `primary`, `card`, `background`, etc. **No** `primary-500`, `primary-600`, etc. defined; only single `primary` hue.  
- **Usage:** Many files use `primary-600`, `primary-700`, `primary-50`, `primary-100`, etc. These are **not** in the current config; they may be undefined or coming from a preset. Any redesign should either define a full primary scale or replace with a defined palette.

### 4.3 Green / emerald (Sidebar and marketing)

- **Sidebar:** `from-green-50/30`, `to-emerald-50/30`, `from-green-600 to-emerald-600`, `border-green-200/50`, `bg-green-100`, `text-green-700`, etc.  
- **Marketing / Login / 404:** Emerald and green used for CTAs and accents (e.g. `bg-emerald-600`, `text-emerald-500`).  
- **StatsCard / WorkerDashboard:** `green`, `earth`, `sand` — **earth** and **sand** are not in Tailwind config; they resolve to the default gray branch in StatsCard and may be invalid in WorkerDashboard.

---

## 5. Hardcoded Fonts & Typography

- **Root layout:** Inline style sets `font-family` to GeistSans and CSS vars `--font-sans`, `--font-mono` (GeistMono).  
- **tailwind.config.mjs:** `sans: ["Inter", ...defaultTheme.fontFamily.sans]`, `display: ["Poppins", ...]`. So Tailwind uses Inter/Poppins while the root injects Geist — potential conflict unless Geist is applied elsewhere.  
- **No single source of truth** for heading scales or body text; sizes and weights are ad hoc (e.g. `text-2xl`, `text-xl`, `text-lg`, `font-bold`, `font-semibold`).

---

## 6. Hardcoded Spacing

- **Padding:** Mix of `p-4`, `p-6`, `p-8`, `px-3 py-2`, `px-4 py-2`, `p-5`; admin content uses `p-4 sm:p-6`, client schedule still uses `p-6`.  
- **Gaps:** `gap-2`, `gap-3`, `gap-4`, `gap-6`; `space-x-2`, `space-x-3`, `space-x-4`; no design-token system.  
- **Margins:** `mb-2`, `mb-4`, `mb-6`, `mb-8`, `mt-1`, `mt-4`, etc. used inconsistently across components.

---

## 7. Inconsistencies Across Roles

- **Admin pages:** Use responsive shell (min-w-0, overflow-x-hidden, responsive padding and title sizes).  
- **Client schedule (and possibly other client sub-pages):** Use older shell (no min-w-0, fixed p-6, text-2xl).  
- **Worker/Supervisor:** Root is dashboard-only; no shared “list page” shell like admin.  
- **Sidebar:** Green/emerald theme; rest of app leans on `primary-*` (and gray) — dual “brand” systems.  
- **Breadcrumbs:** Present on admin and some client pages; not on worker/supervisor dashboard views.  
- **.card class:** Used as a class name (e.g. `className="card p-6"`). Tailwind config only has `card` as a **color** (hsl(var(--card))), not a utility. So `card` alone does not apply background unless a plugin adds it; many places pair it with `p-6` or `overflow-hidden`. Redesign should clarify whether `card` is a component style (and define it) or replace with explicit utilities (e.g. `bg-card` + `rounded-lg`).

---

## 8. Responsiveness & Overflow

- **DataTable:** `min-w-[640px]` on table forces horizontal scroll on small viewports; wrapper has `overflow-x-auto` and touch scrolling.  
- **Sidebar:** Fixed `w-72`; on mobile it’s off-canvas (translate).  
- **InvoicePrintPreviewModal:** Full-screen on mobile, centered modal on sm+; content area `overflow-auto`; invoice block uses inline styles and table-layout for width.  
- **InvoicePDF:** Hidden div `w-[210mm]` for PDF generation — fixed width intentional for print.  
- **Modals (CreateInvoice, ViewInvoice, EditInvoice):** `max-w-md` / `max-w-2xl`, `w-[95vw]`, `max-h-[90vh] overflow-y-auto`.  
- **Client schedule page:** Missing min-w-0 and overflow-x-hidden on main content; risk of horizontal overflow on narrow screens.  
- **Breadcrumbs:** `min-w-0 overflow-hidden` and flex-wrap added; generally safe.  
- **Charts (Recharts):** ResponsiveContainer used; chart colors are hex; no fixed widths that would break layout.

---

## 9. Checklist of Files to Touch (for visual redesign)

### Global / design tokens

- `app/layout.tsx` — font injection.  
- `app/globals.css` — CSS variables (colors, radius).  
- `styles/globals.css` — if used.  
- `tailwind.config.mjs` — theme extend (colors, fonts, radius); add primary scale and/or semantic tokens if desired.

### Shared components (one change propagates everywhere)

- `src/shared/ui/Breadcrumbs.tsx`  
- `src/shared/ui/DataTable.tsx`  
- `src/shared/ui/EmptyState.tsx`  
- `src/shared/ui/Footer.tsx`  
- `src/shared/ui/FormModal.tsx`  
- `src/shared/ui/LoadingState.tsx`  
- `src/shared/ui/Navbar.tsx`  
- `src/shared/ui/NavDropdown.tsx`  
- `src/shared/ui/Sidebar.tsx`  
- `src/shared/ui/StatsCard.tsx`  
- `src/shared/ui/TaskCard.tsx`  
- `src/shared/ui/TestimonialCard.tsx`  
- `src/shared/ui/WorkerCard.tsx`  
- `src/shared/ui/ServiceCard.tsx`

### Layouts

- `app/(dashboard)/layout.tsx`  
- `app/(dashboard)/admin/layout.tsx`  
- `app/(dashboard)/client/layout.tsx`  
- `app/(dashboard)/worker/layout.tsx`  
- `app/(dashboard)/supervisor/layout.tsx`  
- `app/(marketing)/layout.tsx`

### Marketing

- `app/(marketing)/page.tsx`  
- `src/features/marketing/ui/LandingPage.tsx`  
- `src/features/marketing/ui/HeroSection.tsx`  
- `src/features/marketing/ui/ServicesSection.tsx`  
- `src/features/marketing/ui/WhyChooseUsSection.tsx`  
- `src/features/marketing/ui/StatsSection.tsx`  
- `src/features/marketing/ui/ClientTestimonialsSection.tsx`

### Auth & standalone

- `app/login/page.tsx` — `src/features/auth/ui/LoginPage.tsx`  
- `app/not-found.tsx`

### Admin (pages + feature UI)

- All under `app/(dashboard)/admin/`: `page.tsx` (dashboard), `analytics/page.tsx`, `clients/page.tsx`, `employees/page.tsx`, `invoices/page.tsx`, `jobs/page.tsx`, `payments/page.tsx`, `quotes/page.tsx`, `reports/page.tsx`, `schedule/page.tsx`, `settings/page.tsx`, `tasks/page.tsx`, `users/page.tsx`.  
- Invoice: `CreateInvoiceModal.tsx`, `EditInvoiceModal.tsx`, `ViewInvoiceModal.tsx`, `InvoicePrintPreviewModal.tsx`, `InvoicePDF.tsx`.  
- `src/features/admin/` — all `ui/*.tsx` for analytics, clients, employees, invoices, jobs, payments, quotes, reports, settings, tasks, users (lists, forms, details, modals, JobCostCalculator, etc.).

### Dashboards

- `src/features/dashboards/admin/ui/AdminDashboard.tsx`  
- `src/features/dashboards/client/ui/ClientDashboard.tsx`  
- `src/features/dashboards/worker/ui/WorkerDashboard.tsx`  
- `src/features/dashboards/supervisor/ui/SupervisorDashboard.tsx`

### Client dashboard pages

- `app/(dashboard)/client/page.tsx`, `schedule/page.tsx`, `billing/page.tsx`, `services/page.tsx` (and their feature components in `src/features/client/`).

### Worker / Supervisor pages

- `app/(dashboard)/worker/page.tsx`, `tasks/page.tsx`, `schedule/page.tsx`, `map/page.tsx`.  
- `app/(dashboard)/supervisor/page.tsx`, `analytics/page.tsx`, `schedule/page.tsx`, `tasks/page.tsx`, `team/page.tsx`.

### Charts (color tokens)

- `src/features/admin/analytics/ui/AnalyticsPage.tsx`  
- `src/features/admin/reports/ui/ReportsPage.tsx`  
- `src/features/dashboards/supervisor/ui/SupervisorDashboard.tsx`  
- `src/features/dashboards/admin/ui/AdminDashboard.tsx`  
- `src/features/dashboards/client/ui/ClientDashboard.tsx`

---

## 10. Risk List — What NOT to Break

1. **Auth & routing**  
   - Do not change: `RoleGate`, `mockAuth`, login submit logic, cookie/role handling, redirects after login.  
   - Do not remove or rename route segments (e.g. `/admin`, `/client`, `/login`).

2. **Data & services**  
   - Do not change: service APIs (e.g. `invoiceService`, `jobService`, `mockStore`), data shapes, or props that components expect from parents (e.g. `invoice`, `job`, `client`).  
   - Redesign should be limited to layout, CSS, Tailwind classes, and inline style values that are purely visual.

3. **Invoice print/PDF**  
   - `InvoicePrintPreviewModal` and `InvoicePDF` use inline styles so the same DOM is printable and passed to html2pdf. Changing structure or removing inline styles can break print/PDF. If you introduce tokens, keep them in a form that still renders in the cloned/print window (e.g. inline or a print-specific stylesheet).

4. **Component contracts**  
   - Do not change: component props (e.g. `isOpen`, `onClose`, `invoice`, `onSuccess`), exported interfaces, or the way `DataTable` receives `columns` and `keyExtractor`.  
   - Do not remove or rename `keyExtractor`, `onView`, `onEdit`, `onDelete` on DataTable.

5. **Sidebar behavior**  
   - Do not change: `isOpen`/`setIsOpen` state, desktop vs mobile behavior (lg: static vs fixed overlay), or the way nav links and dropdowns are driven by `pathname` and `userRole`.

6. **Form behavior**  
   - Do not change: form submit handlers, validation, or the way modals open/close (e.g. `onSuccess` calling `loadInvoices()` and closing).  
   - Styling of inputs and buttons is in scope; logic is not.

7. **Recharts**  
   - Only change: `stroke`, `fill`, and `color` values (and any wrapper divs for layout). Do not change `dataKey`, `data`, or chart type/config in a way that changes what is rendered.

8. **Earth/sand colors**  
   - `StatsCard` and `WorkerDashboard` use `earth-*` and `sand-*`. These are not in Tailwind config. Redesign should either add these to the theme or replace with defined tokens so styles don’t disappear.

9. **Primary scale**  
   - Many components use `primary-600`, `primary-700`, etc. If the current build has no primary scale, those classes may do nothing or come from an external preset. Redesign should define a consistent primary palette and replace or map existing `primary-*` usages so buttons and links don’t lose styling.

10. **Accessibility**  
   - Do not remove: `aria-label`, `title`, focus behavior, or semantic structure (headings, landmarks) when restyling. Improve if possible (e.g. contrast, focus rings).

---

## 11. Summary

- **Shared UI:** 14 components in `src/shared/ui`; plus admin-specific modals and JobCostCalculator.  
- **Layouts:** 7 layout files; admin list pages use a responsive shell; client and worker/supervisor differ.  
- **Hardcoded visuals:** Hex in charts and invoice print; `primary-*` and green/emerald everywhere; earth/sand undefined; fonts split between Geist (root) and Inter/Poppins (Tailwind).  
- **Inconsistencies:** Admin vs client page shells; Sidebar green vs rest primary; `.card` usage vs config.  
- **Responsiveness:** DataTable min-width and overflow handled; client schedule page and any similar client pages need the same overflow/min-width treatment if redesign aligns all roles.  
- **Safe to change:** All colors, fonts, spacing, borders, shadows, and layout classes.  
- **Do not change:** Auth, routing, data fetching, component props/APIs, print/PDF structure, and form/table behavior.

Use this document as the checklist and risk list for the visual redesign phase.
