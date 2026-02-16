/**
 * Assignment Service
 *
 * Service layer for employee-job assignment operations.
 */

import { neon } from '@neondatabase/serverless';

export interface AssignmentData {
	employeeId: string;
	jobId: string;
	role: string;
	assignedAt: string;
}

export const assignEmployeeToJob = async (data: AssignmentData) => {
	const sql = neon(process.env.DATABASE_URL!);

	await sql`
        INSERT INTO employee_jobs (
            id, 
            employee_id, 
            job_id, 
            role_in_job, 
            assigned_at, 
            status
        ) VALUES (
            gen_random_uuid(),
            ${data.employeeId},
            ${data.jobId},
            ${data.role},
            ${data.assignedAt},
            'assigned'
        )
    `;
};

export const removeEmployeeFromJob = async (
	employeeId: string,
	jobId: string,
) => {
	const sql = neon(process.env.DATABASE_URL!);

	await sql`
        DELETE FROM employee_jobs 
        WHERE employee_id = ${employeeId} AND job_id = ${jobId}
    `;
};

export const updateAssignmentStatus = async (
	employeeId: string,
	jobId: string,
	status: string,
) => {
	const sql = neon(process.env.DATABASE_URL!);

	await sql`
        UPDATE employee_jobs 
        SET status = ${status}
        WHERE employee_id = ${employeeId} AND job_id = ${jobId}
    `;
};

export const getAssignmentsByEmployee = async (employeeId: string) => {
	const sql = neon(process.env.DATABASE_URL!);

	const assignments = await sql`
        SELECT 
            ej.id,
            ej.job_id as "jobId",
            j.job_number as "jobNumber",
            j.title as "jobTitle",
            ej.role_in_job as "role",
            ej.assigned_at as "assignedAt",
            ej.status
        FROM employee_jobs ej
        JOIN jobs j ON ej.job_id = j.id
        WHERE ej.employee_id = ${employeeId}
        ORDER BY ej.assigned_at DESC
    `;

	return assignments;
};

export const getAssignmentsByJob = async (jobId: string) => {
	const sql = neon(process.env.DATABASE_URL!);

	const assignments = await sql`
        SELECT 
            ej.id,
            ej.employee_id as "employeeId",
            p.full_name as "employeeName",
            ej.role_in_job as "role",
            ej.assigned_at as "assignedAt",
            ej.status
        FROM employee_jobs ej
        JOIN profiles p ON ej.employee_id = p.id
        WHERE ej.job_id = ${jobId}
        ORDER BY ej.assigned_at DESC
    `;

	return assignments;
};
