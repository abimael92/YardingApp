# Workflow & Data Flow

This document describes the full lifecycle of work and how each role interacts with the J&J Desert Landscaping platform.

---

## Actors

| Actor | Description |
|-------|-------------|
| **Client** | Property owner or contact who requests landscaping services, receives quotes and invoices, and makes payment decisions. |
| **Owner/Admin** | Business owner or administrator. Manages quotes, jobs, crews, employees, scheduling, and billing. |
| **Employee/Worker** | Field or office staff. May be assigned to jobs or crews; performs work and may update progress. |
| **Crew** | A team of employees led by a supervisor. Jobs can be assigned to a crew or to individual employees. |

---

## Quote Workflow

1. **Client submits quote request**  
   The client requests an estimate (e.g. via website form or phone). The system records the request (e.g. in quotes or leads).

2. **Owner reviews request**  
   Owner/Admin reviews the request and site details.

3. **Owner generates estimate**  
   Owner creates an estimate (quote) with scope, pricing, and validity.

4. **Owner sends estimate to client**  
   The estimate is sent to the client (email, portal, or print).

---

## Client Decision

- **If client accepts:**  
  The quote can be converted into a **Job**. The job is created in the system with status reflecting the next step (e.g. scheduled, in progress).

- **If client rejects or does not respond:**  
  The quote may be marked rejected, expired, or revised. No job is created from that quote unless the client later accepts.

---

## Job Lifecycle

1. **Job created**  
   After quote acceptance (or direct creation by admin), a job is created with client, scope, pricing, and optional schedule.

2. **Job scheduled**  
   Owner/Admin sets or updates scheduled date/time. Job status may move to **scheduled**.

3. **Job assigned**  
   Owner/Admin assigns the job to:
   - an **employee**, or  
   - a **crew**  
   Assignment is recorded in `employee_jobs` or `crew_jobs`. All job management (create, edit, assign, unassign, complete) is done from the **Jobs** page.

4. **Work performed**  
   Workers (or crew) perform the job. Progress can be updated (e.g. status to **in_progress**).

5. **Job marked complete**  
   When work is done, the job is marked **completed**. This triggers downstream steps (e.g. billing, invoicing).

---

## Execution Workflow

**Worker:**

1. Receives assignment (via Jobs page, schedule, or crew assignment).
2. Performs the job on-site.
3. May update progress (e.g. check-in, status updates, time tracking).
4. Marks job complete or supports completion by supervisor/admin.

**Crew:**

- Same as above, at crew level: the crew is assigned to the job; members perform work; completion is recorded for the job.

---

## Billing Workflow

1. **After job completion**  
   Owner reviews completed work and any adjustments.

2. **Pricing finalized**  
   Final amount is confirmed (may match quote or reflect changes).

3. **Invoice generated**  
   System (or admin) generates an invoice from the job.

4. **Invoice sent to client**  
   Client receives the invoice (email, portal, or mail).

5. **Payment processed**  
   Client pays; payment is recorded and linked to the invoice. Status is updated (e.g. paid, partial, overdue).

---

## Role Interaction Summary

| Role | Quote | Job | Assignment | Execution | Billing |
|------|--------|-----|------------|-----------|--------|
| **Client** | Submits request; receives estimate; accepts/rejects. | — | — | — | Receives invoice; pays. |
| **Owner/Admin** | Creates/sends estimate; converts quote to job. | Creates, edits, deletes jobs; schedules; assigns to employee or crew; marks complete. | Assigns jobs from **Jobs** page (employee or crew). | Oversees; may update status. | Generates invoice; sends; records payment. |
| **Employee/Worker** | — | Views assigned jobs (e.g. from Employees page: “View Job” → Jobs page). | — | Performs work; updates progress; supports completion. | — |
| **Crew** | — | Jobs assigned to crew (from Jobs page). | — | Crew members perform work. | — |

---

## Data Flow Summary

- **Quotes** → Client request and owner estimate; acceptance leads to **Job**.
- **Jobs** → Central entity; created/edited/assigned on **Jobs** page only.
- **Assignments** → Stored in `employee_jobs` (employee–job) and `crew_jobs` (crew–job). Managed only from the Jobs page.
- **Employees page** → Displays employee list, crew membership, and **current job / job count**. Actions are **View Employee**, **Edit Employee**, **View Job** (redirects to `/admin/jobs/[jobId]`). No job creation, assignment, or editing from the Employees page.
- **Crews** → Managed under the Employees area (Crews tab). Crew membership (add/remove) is managed there; **job assignment to crews** is done on the **Jobs** page.
- **Billing** → Job completion → Invoice generation → Invoice sent → Payment recorded.

---

*Last updated to reflect: job management centralized on Jobs page; Employees page display-only for jobs with “View Job” links.*
