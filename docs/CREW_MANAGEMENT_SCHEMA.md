# Crew Management – Schema Analysis & Design

## 1. Existing Tables (Do Not Modify)

### crews
| Column         | Type      | Notes                    |
|----------------|-----------|--------------------------|
| id             | uuid      | PK                       |
| name           | varchar   | NOT NULL                 |
| supervisor_id  | uuid      | FK → profiles(id)        |
| description    | text      |                          |
| vehicle_id     | uuid      | FK → equipment(id)       |
| region         | varchar   |                          |
| is_active      | boolean   | DEFAULT true             |
| created_at     | timestamptz | DEFAULT now()          |
| updated_at     | timestamptz | DEFAULT now()          |

### crew_members
| Column      | Type    | Notes                     |
|-------------|---------|---------------------------|
| id          | uuid    | PK                        |
| crew_id     | uuid    | FK → crews(id)            |
| employee_id | uuid    | FK → profiles(id)         |
| role        | varchar | DEFAULT 'member'          |
| joined_date | date    | DEFAULT CURRENT_DATE      |
| left_date   | date    |                           |
| is_active   | boolean | DEFAULT true              |

**Unique:** `(crew_id, employee_id, is_active)` – one active membership per employee per crew.

### employee_jobs (existing – use for employee↔job)
| Column      | Type    | Notes        |
|-------------|---------|--------------|
| id          | uuid    | PK           |
| employee_id | uuid    | FK → profiles|
| job_id      | uuid    | FK → jobs    |
| assigned_at | timestamp | DEFAULT now() |
| status     | varchar | DEFAULT 'assigned' |

**Unique:** `(employee_id, job_id)`.

### schedules & schedule_jobs
- **schedules:** `id`, `crew_id` (FK → crews), `date`, `status`, `notes`, `created_by`, `created_at`, `updated_at`.  
  One schedule per crew per date.
- **schedule_jobs:** `id`, `schedule_id` (FK → schedules), `job_id` (FK → jobs), `route_order`, `estimated_start_time`, `estimated_duration_minutes`, plus actual/status fields.  
  Links a job to a crew’s schedule for a given day.

So: **crew → schedules (by date) → schedule_jobs → job**. This is date-bound (job on a specific schedule/day).

## 2. Crew-to-Job Assignment (New Table)

There is **no** direct “crew ↔ job” table. Two options:

1. **Use schedules + schedule_jobs**  
   Assign job to crew by creating/finding a schedule for that crew+date and inserting a `schedule_jobs` row. Assignment is always for a specific date.

2. **Add `crew_jobs` (recommended)**  
   Simple junction like `employee_jobs`: which crews are assigned to which jobs, independent of date. Matches “assign job to crew” in the UI and supports “jobs assigned to this crew” and “crews assigned to this job” without touching schedules.

**Recommendation:** Add **crew_jobs** and keep **schedules/schedule_jobs** for day-level dispatch/calendar. Use **crew_jobs** for “this crew is assigned to this job” and **employee_jobs** for “this employee is assigned to this job.”

## 3. crew_jobs Table (New)

Follows the same pattern as `employee_jobs`:

| Column      | Type      | Notes                    |
|-------------|-----------|--------------------------|
| id          | uuid      | PK, gen_random_uuid()    |
| crew_id     | uuid      | NOT NULL, FK → crews(id) |
| job_id      | uuid      | NOT NULL, FK → jobs(id)  |
| assigned_at | timestamp | DEFAULT now()            |
| status      | varchar   | DEFAULT 'assigned'       |

**Unique:** `(crew_id, job_id)` – one assignment per crew per job.

**Indexes:** `crew_id`, `job_id` for list-by-crew and list-by-job.

## 4. Data Flow Summary

- **Crews:** CRUD on `crews`; members via `crew_members`.
- **Employee→Job:** Use existing `employee_jobs` (assign/unassign employees to jobs).
- **Crew→Job:** Use new `crew_jobs` (assign/unassign crews to jobs). Optionally, when assigning a crew to a job, also create `employee_jobs` for each active crew member so the job appears on each member’s list (implementation choice).
- **Availability / double-booking:** Check `employee_jobs` + `schedule_jobs` (and optionally `crew_jobs`) for overlapping job dates/times before assigning.

## 5. No Changes to Existing Tables

- **crews** – use as-is.  
- **crew_members** – use as-is.  
- **employee_jobs** – use as-is.  
- **schedules / schedule_jobs** – use for schedule/calendar; optional for conflict checks.

Only addition: **crew_jobs** (new table) + migration below.

---

## 6. Migration and run instructions

### Create `crew_jobs` table

Run the migration against your Neon database (once):

```bash
# Option A: Neon SQL Editor – paste contents of scripts/migrate-crew-jobs.sql

# Option B: psql (if you have Postgres client)
psql "$DATABASE_URL" -f scripts/migrate-crew-jobs.sql
```

### Environment

- `DATABASE_URL` must be set (Neon connection string; use pooler URL for serverless).

### Testing

1. **Crews:** Create a crew from Admin → Crews → Add Crew. Open “Manage crew” and add members (employees) and assign jobs.
2. **Employees:** In Crews → Employees tab, use “Assign job” to assign a job to an employee (uses `employee_jobs`).
3. **Assignments:** Crews → Assignments tab lists jobs; assign jobs to a crew from the crew detail modal (“Assign jobs”).
4. **API:** All endpoints require an authenticated session (NextAuth). Use the same session as the admin dashboard.
