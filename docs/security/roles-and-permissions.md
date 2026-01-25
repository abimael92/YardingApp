# Roles and Permissions

## Roles
- Admin
- Supervisor
- Worker
- Client

## Permission Model
All dashboard routes must be role-restricted. Roles are assigned in the auth layer
and used for server-side route protection and API authorization.

## Permissions by Role
- Admin: full access to analytics, users, tasks, settings.
- Supervisor: team overview, task management, analytics, schedules.
- Worker: own tasks, schedules, map views, status actions.
- Client: services, schedule, billing, requests.

## Notes
- Role names must remain consistent with UI copy and route names.
- Roles are case-sensitive in access control checks.
