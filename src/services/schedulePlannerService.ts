/**
 * Daily work-day scheduling (server-only).
 * schedules + schedule_jobs + employee_jobs; crew-day collision detection.
 */

import { neon } from "@neondatabase/serverless"

function getSql() {
	if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set")
	return neon(process.env.DATABASE_URL)
}

export type CrewDayCollision = {
	employeeId: string
	employeeName: string
	otherCrewId: string
	otherCrewName: string
}

const SLOT_MINUTES = 120
const DAY_START_HOUR = 7

function minutesToTime(totalMinutes: number): string {
	const h = Math.floor(totalMinutes / 60)
	const m = totalMinutes % 60
	return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`
}

/**
 * Workers on this crew who already appear on another crew’s schedule the same calendar day.
 */
export async function detectCrewDayCollisions(
	crewId: string,
	dateYmd: string,
): Promise<CrewDayCollision[]> {
	const sql = getSql()
	const rows = await sql`
    SELECT DISTINCT
      p.id AS "employeeId",
      COALESCE(p.full_name, p.id::text) AS "employeeName",
      cr.id AS "otherCrewId",
      cr.name AS "otherCrewName"
    FROM crew_members cm0
    JOIN profiles p ON p.id = cm0.employee_id
    JOIN crew_members cm1
      ON cm1.employee_id = cm0.employee_id
      AND cm1.crew_id <> ${crewId}::uuid
      AND COALESCE(cm1.is_active, true) = true
    JOIN schedules s ON s.crew_id = cm1.crew_id AND s.date = ${dateYmd}::date
    JOIN crews cr ON cr.id = cm1.crew_id
    WHERE cm0.crew_id = ${crewId}::uuid
      AND COALESCE(cm0.is_active, true) = true
  `
	return rows as CrewDayCollision[]
}

export type CreateWorkDayResult =
	| {
			ok: true
			scheduleId: string
			warnings: CrewDayCollision[]
	  }
	| { ok: false; error: string }

/**
 * Inserts one schedules row, schedule_jobs per job (route_order, staggered start),
 * then employee_jobs for each active crew member × job (deduped).
 */
export async function createWorkDay(
	dateYmd: string,
	crewId: string,
	jobIds: string[],
): Promise<CreateWorkDayResult> {
	if (!jobIds.length) {
		return { ok: false, error: "Select at least one job." }
	}
	const sql = getSql()

	const warnings = await detectCrewDayCollisions(crewId, dateYmd)

	const jobCheck = await sql`
    SELECT id, status::text AS status
    FROM jobs
    WHERE id = ANY(${jobIds}::uuid[])
      AND deleted_at IS NULL
  `
	const found = new Map((jobCheck as { id: string; status: string }[]).map((j) => [j.id, j.status]))
	for (const id of jobIds) {
		const st = found.get(id)
		if (!st) return { ok: false, error: `Job ${id} not found or deleted.` }
		if (st !== "quoted" && st !== "scheduled") {
			return {
				ok: false,
				error: `Job must be quoted or scheduled (job ${id} is ${st}).`,
			}
		}
	}

	let scheduleId: string | undefined
	try {
		const ins = await sql`
      INSERT INTO schedules (crew_id, date, status, notes, created_at, updated_at)
      VALUES (
        ${crewId}::uuid,
        ${dateYmd}::date,
        'scheduled',
        NULL,
        NOW(),
        NOW()
      )
      RETURNING id
    `
		scheduleId = (ins[0] as { id: string }).id
	} catch (e) {
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Failed to create schedule.",
		}
	}

	try {
		let order = 1
		const baseMinutes = DAY_START_HOUR * 60
		for (const jobId of jobIds) {
			const startM = baseMinutes + (order - 1) * SLOT_MINUTES
			const t = minutesToTime(startM)
			await sql`
        INSERT INTO schedule_jobs (
          schedule_id,
          job_id,
          route_order,
          estimated_start_time,
          estimated_duration_minutes,
          status
        )
        VALUES (
          ${scheduleId}::uuid,
          ${jobId}::uuid,
          ${order},
          ${t}::time,
          ${SLOT_MINUTES},
          'pending'
        )
      `
			order++
		}

		const members = await sql`
      SELECT employee_id AS id
      FROM crew_members
      WHERE crew_id = ${crewId}::uuid
        AND COALESCE(is_active, true) = true
    `
		const empIds = (members as { id: string }[]).map((r) => r.id)

		for (const empId of empIds) {
			for (const jobId of jobIds) {
				await sql`
          INSERT INTO employee_jobs (job_id, employee_id, assigned_at, status)
          VALUES (${jobId}::uuid, ${empId}::uuid, NOW(), 'assigned')
          ON CONFLICT (employee_id, job_id) DO NOTHING
        `
			}
		}

		return { ok: true, scheduleId, warnings }
	} catch (e) {
		try {
			await sql`DELETE FROM schedule_jobs WHERE schedule_id = ${scheduleId}::uuid`
			await sql`DELETE FROM schedules WHERE id = ${scheduleId}::uuid`
		} catch {
			/* best-effort rollback */
		}
		return {
			ok: false,
			error: e instanceof Error ? e.message : "Failed to build work day.",
		}
	}
}

export type PlannerJobOption = {
	id: string
	jobNumber: string
	title: string
	status: string
}

export async function listPlannerJobs(): Promise<PlannerJobOption[]> {
	const sql = getSql()
	const rows = await sql`
    SELECT
      j.id,
      j.job_number AS "jobNumber",
      j.title,
      j.status::text AS status
    FROM jobs j
    WHERE j.deleted_at IS NULL
      AND j.status::text IN ('quoted', 'scheduled')
    ORDER BY j.created_at DESC
    LIMIT 500
  `
	return rows as PlannerJobOption[]
}
