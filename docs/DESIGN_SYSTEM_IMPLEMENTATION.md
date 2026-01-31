# Design System Implementation — Non-Breaking Update

**Status:** Phase 1 and Phase 2 applied. No TSX/JSX or business logic changed.

---

## Backup

- **File:** `app/globals.css.backup`  
- **Contents:** Original `app/globals.css` before design system variables and component classes.

To restore: copy `app/globals.css.backup` over `app/globals.css`.

---

## What Was Done

### Phase 1: CSS Variables (`app/globals.css`)

Added under `:root` (existing Tailwind/shadcn variables left unchanged):

- **Primary:** `--primary-green`, `--primary-green-dark`, `--secondary-green`, `--accent-brown`, `--accent-tan`
- **Status:** `--success`, `--warning`, `--error`, `--info`
- **Delivery/Job status:** `--status-pending`, `--status-accepted`, `--status-in-transit`, `--status-delivered`, `--status-cancelled`
- **Neutrals:** `--bg-primary`, `--bg-secondary`, `--border-light`, `--text-primary`, `--text-secondary`, `--text-disabled`, `--overlay`
- **Spacing:** `--space-xs` through `--space-xxl`
- **Radius:** `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-circle`
- **Shadows:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`

Dark mode (`.dark`) overrides for the new neutrals so existing dark behavior is preserved.

### Phase 2: Component Classes (add-only)

New classes in `@layer components`. Existing class names and HTML structure are unchanged; these are for incremental use:

| Class | Purpose |
|-------|--------|
| `.primary-btn` | Primary actions (green, hover darken) |
| `.primary-btn:hover` | Hover state |
| `.page-header` | Page title styling |
| `.card` | Card container (background, border, radius, padding, shadow) — **now defined**; existing `class="card ..."` usage picks this up |
| `.input-field` | Text inputs (border, focus ring) |
| `.nav-active` | Active nav item (green text + bottom border) |
| `.status-pending` | Pending (yellow) |
| `.status-accepted` | Accepted (info blue) |
| `.status-in-transit` | In transit (primary green) |
| `.status-delivered` | Delivered (success green) |
| `.status-cancelled` | Cancelled (error red) |
| `.order-btn-prominent` | Prominent CTA (client/order) |
| `.order-history-bg` | Order/history background (accent-tan) |
| `.delivery-card-active` | Active delivery/worker card border |
| `.financial-accent` | Financial section accent (brown) |

Existing Tailwind classes (e.g. `p-6`, `rounded-lg`) still apply and override where they set the same properties (utilities layer wins over components).

---

## What Was Not Changed

- No TSX/JSX files modified.
- No removal or renaming of existing class names.
- No changes to routing, auth, or data/API usage.
- No changes to `tailwind.config.mjs` or component props.

---

## Verification Checklist (manual)

Use this after pulling the change and on deploy:

- [ ] **All roles:** Log in as admin, client, worker, supervisor; confirm dashboards and main flows render.
- [ ] **Buttons:** Every primary action (Sign In, Create Job, Add User, etc.) still works and looks correct.
- [ ] **Forms:** Submit login, create/edit job, create/edit user/client/employee; no layout or focus issues.
- [ ] **Navigation:** Sidebar and navbar links go to correct routes; active state still visible.
- [ ] **Cards:** Lists and dashboard cards (e.g. DataTable, StatsCard) still have correct background/border (`.card` now uses design system variables).
- [ ] **Mobile (320px–480px):** No horizontal scroll; touch targets ≥ 44px where applicable.
- [ ] **Tablet (768px–1024px):** Layout and spacing look correct.
- [ ] **Desktop (1200px+):** No regressions.
- [ ] **Dark mode:** If used, check one page per role; text and borders readable.
- [ ] **Loading / errors:** LoadingState and error messages still visible and readable.

---

## Optional Next Steps (incremental)

1. **Adopt new classes in components**  
   Where it makes sense, add (do not replace) design system classes, e.g. `primary-btn` on primary buttons, `input-field` on inputs, or status classes on badges. Keep existing Tailwind classes until confirmed.

2. **Map Tailwind to design system (later)**  
   In `tailwind.config.mjs`, extend `theme.colors` with values that reference the new CSS variables (e.g. `primaryGreen: 'var(--primary-green)'`) so you can use `bg-primaryGreen` etc. without changing behavior of existing `primary-*` usage until you migrate.

3. **Charts and invoice print**  
   When ready, replace hardcoded hex colors in charts and invoice print/PDF with the new variables (e.g. `var(--primary-green)`, `var(--success)`) so they stay in sync with the rest of the UI.

---

## Rollback

If anything breaks:

1. Restore styles:  
   `cp app/globals.css.backup app/globals.css`
2. Re-run the verification checklist for affected roles and viewports.
