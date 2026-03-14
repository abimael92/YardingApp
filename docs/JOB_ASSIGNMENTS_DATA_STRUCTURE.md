# Job assignments – suggested data structures

Used by the employee list, job list table, and crew/employee assignment UI.

## Job list item (dashboard table)

Returned by `GET /api/jobs/list` and used in the Job assignments table:

```ts
interface JobListItem {
  id: string
  jobNumber: string
  title: string
  status: string
  clientName: string
  assignedToType: 'employee' | 'crew' | null
  assignedToName: string | null
  scheduledDate: string | null
  duration: number | null
  createdAt: string
}
```

- **assignedToType**: `'employee'` if assigned via `employee_jobs`, `'crew'` if assigned via `crew_jobs`, `null` if unassigned.
- **assignedToName**: Employee full name or crew name.
- **scheduledDate** / **duration**: Optional; can be extended from `schedule_jobs` or `jobs` when available.

## Employee assignment counts

Returned by `GET /api/employees/assignment-counts`:

```ts
{ counts: Record<string, number> }
```

- Keys: `employee_id` (profile id).
- Values: Number of rows in `employee_jobs` for that employee (any status).

Used for:

- Stats: “Employees With Active Jobs” = number of employees with `count > 0`, “Without Assignments” = total employees − that.
- Table: “Current Job” column shows “X job(s)” or “—”.

## Assigning a job

- **To an employee**: `POST /api/employees/[id]/jobs` with `{ jobId }`. Uses `employee_jobs`.
- **To a crew**: `POST /api/crews/[id]/jobs` with `{ jobIds }`. Uses `crew_jobs`.

UI can offer:

- Assign to **employee** (picker → single employee).
- Assign to **crew** (picker → single crew).
- Assign to **crew member** (picker → crew, then member) — same as assigning to that employee via `/api/employees/[id]/jobs`.

## Scheduling fields (optional extension)

For start/end and check-in/out you can add:

- **jobs**: `scheduled_start`, `scheduled_end`, `estimated_duration_minutes` (if added to schema).
- **schedule_jobs**: `estimated_start_time`, `estimated_duration_minutes`, `actual_start_time`, `actual_end_time`.

Suggested UI types:

```ts
interface JobScheduleInfo {
  startDate: string | null
  startTime: string | null
  estimatedDurationMinutes: number | null
  checkInTime: string | null
  checkOutTime: string | null
}
```

Check-in/check-out buttons would call APIs that set `actual_start_time` / `actual_end_time` (e.g. in `schedule_jobs` or `time_entries`).
