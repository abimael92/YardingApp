# Protected Routes

## Public Routes
- `/` (marketing landing)
- `/login` (mock login for now)

## Protected Routes (RBAC Required)
- `/admin` → Admin only
- `/supervisor` → Supervisor only
- `/worker` → Worker only
- `/client` → Client only

## Enforcement Strategy
- Gate server components and layouts with role checks.
- Deny access server-side before rendering protected UI.
- Avoid client-only gating for sensitive routes.
