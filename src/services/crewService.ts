/**
 * Crew Service
 *
 * Crew and crew–job management using existing tables: crews, crew_members, crew_jobs.
 * Uses Neon serverless driver. Run scripts/migrate-crew-jobs.sql if crew_jobs is missing.
 */

import { neon } from '@neondatabase/serverless';

const getSql = () => {
	if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
	return neon(process.env.DATABASE_URL);
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Crew {
	id: string;
	name: string;
	supervisorId: string | null;
	supervisorName: string | null;
	description: string | null;
	vehicleId: string | null;
	region: string | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
	memberCount?: number;
}

export interface CrewMember {
	id: string;
	crewId: string;
	employeeId: string;
	employeeName: string;
	role: string;
	joinedDate: string | null;
	leftDate: string | null;
	isActive: boolean;
}

export interface CrewJob {
	id: string;
	crewId: string;
	jobId: string;
	jobNumber: string;
	jobTitle: string;
	status: string;
	assignedAt: string;
}

export interface CrewWithMembers extends Crew {
	members: CrewMember[];
}

// ---------------------------------------------------------------------------
// Crews CRUD
// ---------------------------------------------------------------------------

export async function getCrews(): Promise<Crew[]> {
	const sql = getSql();
	const rows = await sql`
		SELECT 
			c.id,
			c.name,
			c.supervisor_id AS "supervisorId",
			p.full_name AS "supervisorName",
			c.description,
			c.vehicle_id AS "vehicleId",
			c.region,
			COALESCE(c.is_active, true) AS "isActive",
			c.created_at AS "createdAt",
			c.updated_at AS "updatedAt",
			(SELECT COUNT(*) FROM crew_members cm WHERE cm.crew_id = c.id AND COALESCE(cm.is_active, true)) AS "memberCount"
		FROM crews c
		LEFT JOIN profiles p ON c.supervisor_id = p.id
		ORDER BY c.name
	`;
	return rows as Crew[];
}

export async function getCrewById(id: string): Promise<CrewWithMembers | null> {
	const sql = getSql();
	const crews = await sql`
		SELECT 
			c.id,
			c.name,
			c.supervisor_id AS "supervisorId",
			p.full_name AS "supervisorName",
			c.description,
			c.vehicle_id AS "vehicleId",
			c.region,
			COALESCE(c.is_active, true) AS "isActive",
			c.created_at AS "createdAt",
			c.updated_at AS "updatedAt"
		FROM crews c
		LEFT JOIN profiles p ON c.supervisor_id = p.id
		WHERE c.id = ${id}
	`;
	if (crews.length === 0) return null;
	const crew = crews[0] as Record<string, unknown>;
	const members = await getCrewMembers(id);
	return { ...crew, members } as CrewWithMembers;
}

export async function createCrew(data: {
	name: string;
	supervisorId?: string | null;
	description?: string | null;
	region?: string | null;
	isActive?: boolean;
}): Promise<Crew> {
	const sql = getSql();
	const rows = await sql`
		INSERT INTO crews (name, supervisor_id, description, region, is_active)
		VALUES (
			${data.name},
			${data.supervisorId ?? null},
			${data.description ?? null},
			${data.region ?? null},
			${data.isActive ?? true}
		)
		RETURNING id, name, supervisor_id AS "supervisorId", description, vehicle_id AS "vehicleId", region, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
	`;
	const row = rows[0] as Record<string, unknown>;
	const supervisorName = data.supervisorId
		? await sql`SELECT full_name FROM profiles WHERE id = ${data.supervisorId}`.then((r: Record<string, unknown>[]) => (r[0]?.full_name as string) ?? null)
		: null;
	return { ...row, supervisorName, memberCount: 0 } as Crew;
}

export async function updateCrew(
	id: string,
	data: Partial<{ name: string; supervisorId: string | null; description: string | null; region: string | null; isActive: boolean }>
): Promise<Crew | null> {
	const sql = getSql();
	const current = await sql`SELECT name, supervisor_id, description, region, is_active FROM crews WHERE id = ${id}`;
	if (current.length === 0) return null;
	const cur = current[0] as { name: string; supervisor_id: string | null; description: string | null; region: string | null; is_active: boolean | null };
	const name = data.name ?? cur.name;
	const supervisorId = data.supervisorId !== undefined ? data.supervisorId : cur.supervisor_id;
	const description = data.description !== undefined ? data.description : cur.description;
	const region = data.region !== undefined ? data.region : cur.region;
	const isActive = data.isActive !== undefined ? data.isActive : (cur.is_active ?? true);
	await sql`
		UPDATE crews 
		SET name = ${name}, supervisor_id = ${supervisorId}, description = ${description}, region = ${region}, is_active = ${isActive}, updated_at = now()
		WHERE id = ${id}
	`;
	return getCrewById(id).then((c) => (c ? { ...c, memberCount: c.members?.length ?? 0 } : null));
}

export async function deleteCrew(id: string): Promise<boolean> {
	const sql = getSql();
	await sql`DELETE FROM crew_members WHERE crew_id = ${id}`;
	await sql`DELETE FROM crew_jobs WHERE crew_id = ${id}`;
	const result = await sql`DELETE FROM crews WHERE id = ${id} RETURNING id`;
	return result.length > 0;
}

// ---------------------------------------------------------------------------
// Crew members
// ---------------------------------------------------------------------------

export async function getCrewMembers(crewId: string): Promise<CrewMember[]> {
	const sql = getSql();
	const rows = await sql`
		SELECT 
			cm.id,
			cm.crew_id AS "crewId",
			cm.employee_id AS "employeeId",
			p.full_name AS "employeeName",
			COALESCE(cm.role, 'member') AS role,
			cm.joined_date AS "joinedDate",
			cm.left_date AS "leftDate",
			COALESCE(cm.is_active, true) AS "isActive"
		FROM crew_members cm
		JOIN profiles p ON cm.employee_id = p.id
		WHERE cm.crew_id = ${crewId}
		ORDER BY cm.joined_date DESC NULLS LAST
	`;
	return rows as CrewMember[];
}

export async function addCrewMember(
	crewId: string,
	employeeId: string,
	role: string = 'member'
): Promise<CrewMember | null> {
	const sql = getSql();
	const existing = await sql`
		SELECT id FROM crew_members 
		WHERE crew_id = ${crewId} AND employee_id = ${employeeId} AND COALESCE(is_active, true)
	`;
	if (existing.length > 0) return null;
	await sql`
		INSERT INTO crew_members (crew_id, employee_id, role, is_active)
		VALUES (${crewId}, ${employeeId}, ${role}, true)
	`;
	const members = await getCrewMembers(crewId);
	return members.find((m) => m.employeeId === employeeId) ?? null;
}

export async function removeCrewMember(crewId: string, employeeId: string): Promise<boolean> {
	const sql = getSql();
	const result = await sql`
		UPDATE crew_members SET is_active = false, left_date = CURRENT_DATE
		WHERE crew_id = ${crewId} AND employee_id = ${employeeId}
		RETURNING id
	`;
	return result.length > 0;
}

// ---------------------------------------------------------------------------
// Crew jobs (crew_jobs table – run migrate-crew-jobs.sql if missing)
// ---------------------------------------------------------------------------

export async function getCrewJobs(crewId: string): Promise<CrewJob[]> {
	const sql = getSql();
	try {
		const rows = await sql`
			SELECT 
				cj.id,
				cj.crew_id AS "crewId",
				cj.job_id AS "jobId",
				j.job_number AS "jobNumber",
				j.title AS "jobTitle",
				j.status,
				cj.assigned_at AS "assignedAt"
			FROM crew_jobs cj
			JOIN jobs j ON cj.job_id = j.id
			WHERE cj.crew_id = ${crewId}
			ORDER BY cj.assigned_at DESC
		`;
		return rows as CrewJob[];
	} catch (e) {
		if (String(e).includes('crew_jobs') && String(e).includes('does not exist')) return [];
		throw e;
	}
}

export async function assignJobToCrew(crewId: string, jobId: string): Promise<boolean> {
	const sql = getSql();
	try {
		await sql`
			INSERT INTO crew_jobs (crew_id, job_id, status)
			VALUES (${crewId}, ${jobId}, 'assigned')
			ON CONFLICT (crew_id, job_id) DO NOTHING
		`;
		return true;
	} catch (e) {
		if (String(e).includes('crew_jobs') && String(e).includes('does not exist')) return false;
		throw e;
	}
}

export async function unassignJobFromCrew(crewId: string, jobId: string): Promise<boolean> {
	const sql = getSql();
	try {
		const result = await sql`
			DELETE FROM crew_jobs WHERE crew_id = ${crewId} AND job_id = ${jobId}
			RETURNING id
		`;
		return result.length > 0;
	} catch (e) {
		if (String(e).includes('crew_jobs') && String(e).includes('does not exist')) return false;
		throw e;
	}
}

// ---------------------------------------------------------------------------
// Bulk assign jobs to crew (creates crew_jobs rows)
// ---------------------------------------------------------------------------

export async function assignJobsToCrew(crewId: string, jobIds: string[]): Promise<{ assigned: number; failed: string[] }> {
	const failed: string[] = [];
	let assigned = 0;
	for (const jobId of jobIds) {
		try {
			const ok = await assignJobToCrew(crewId, jobId);
			if (ok) assigned++;
		} catch {
			failed.push(jobId);
		}
	}
	return { assigned, failed };
}
