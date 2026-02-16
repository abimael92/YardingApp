/**
 * Time Tracking Service
 *
 * Service layer for employee time tracking operations.
 */

import { neon } from '@neondatabase/serverless';

export interface TimeEntryData {
	employeeId: string;
	jobId: string;
	startTime: string;
}

export const getTimeEntries = async (employeeId: string) => {
	const sql = neon(process.env.DATABASE_URL!);

	const entries = await sql`
        SELECT 
            te.id,
            te.job_id as "jobId",
            j.job_number as "jobNumber",
            j.title as "jobTitle",
            te.start_time as "startTime",
            te.end_time as "endTime",
            te.duration_minutes as "duration"
        FROM time_entries te
        JOIN jobs j ON te.job_id = j.id
        WHERE te.employee_id = ${employeeId}
        ORDER BY te.start_time DESC
    `;

	return entries;
};

export const startTimeEntry = async (data: TimeEntryData) => {
	const sql = neon(process.env.DATABASE_URL!);

	// End any active entries first
	await sql`
        UPDATE time_entries 
        SET end_time = NOW(),
            duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60
        WHERE employee_id = ${data.employeeId} AND end_time IS NULL
    `;

	// Create new entry
	await sql`
        INSERT INTO time_entries (
            id, 
            employee_id, 
            job_id, 
            start_time
        ) VALUES (
            gen_random_uuid(),
            ${data.employeeId},
            ${data.jobId},
            ${data.startTime}
        )
    `;
};

export const endTimeEntry = async (entryId: string, endTime: string) => {
	const sql = neon(process.env.DATABASE_URL!);

	await sql`
        UPDATE time_entries 
        SET 
            end_time = ${endTime},
            duration_minutes = EXTRACT(EPOCH FROM (${endTime}::timestamp - start_time)) / 60
        WHERE id = ${entryId}
    `;
};

export const getActiveTimeEntry = async (employeeId: string) => {
	const sql = neon(process.env.DATABASE_URL!);

	const entries = await sql`
        SELECT 
            te.id,
            te.job_id as "jobId",
            j.job_number as "jobNumber",
            j.title as "jobTitle",
            te.start_time as "startTime"
        FROM time_entries te
        JOIN jobs j ON te.job_id = j.id
        WHERE te.employee_id = ${employeeId} AND te.end_time IS NULL
        LIMIT 1
    `;

	return entries[0] || null;
};

export const getTimeEntriesByDate = async (
	employeeId: string,
	startDate: string,
	endDate: string,
) => {
	const sql = neon(process.env.DATABASE_URL!);

	const entries = await sql`
        SELECT 
            te.id,
            te.job_id as "jobId",
            j.job_number as "jobNumber",
            j.title as "jobTitle",
            te.start_time as "startTime",
            te.end_time as "endTime",
            te.duration_minutes as "duration"
        FROM time_entries te
        JOIN jobs j ON te.job_id = j.id
        WHERE te.employee_id = ${employeeId}
            AND te.start_time >= ${startDate}
            AND te.start_time <= ${endDate}
        ORDER BY te.start_time DESC
    `;

	return entries;
};
