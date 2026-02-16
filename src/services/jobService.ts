/**
 * Job Service
 *
 * Service layer for job management operations using real database.
 */

import { neon } from '@neondatabase/serverless';
import type { Job, EntityId, JobStatus, Priority } from '@/src/domain/entities';

// ============================================================================
// Service Interface
// ============================================================================

export interface JobService {
	getAll(): Promise<Job[]>;
	getById(id: EntityId): Promise<Job | undefined>;
	getByClientId(clientId: EntityId): Promise<Job[]>;
	getByEmployeeId(employeeId: EntityId): Promise<Job[]>;
	getByStatus(status: JobStatus): Promise<Job[]>;
	fetchOpenJobsForAssignment(): Promise<
		Array<{ id: string; jobNumber: string; title: string; status: string }>
	>;
	create(
		job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'> & { createdBy?: string },
	): Promise<Job>;
	update(id: EntityId, updates: Partial<Job>): Promise<Job | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const jobService: JobService = {
	getAll: async () => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        id,
        job_number as "jobNumber",
        client_id as "clientId",
        status,
        title,
        description,
        street,
        city,
        state,
        zip_code as "zipCode",
        country,
        quoted_price_cents as "quotedPriceCents",
        currency,
        created_at as "createdAt",
        updated_at as "updatedAt",
        created_by as "createdBy"
      FROM jobs
      ORDER BY created_at DESC
    `;
		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents),
			quotedPrice: { amount: Number(job.quotedPriceCents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium',
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country,
			},
		})) as Array<Job>;
	},

	fetchOpenJobsForAssignment: async () => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        id,
        job_number as "jobNumber",
        title,
        status
      FROM jobs
      WHERE status NOT IN ('completed', 'cancelled')
      ORDER BY created_at DESC
    `;
		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			title: job.title,
			status: job.status,
		}));
	},

	getById: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        id,
        job_number as "jobNumber",
        client_id as "clientId",
        status,
        title,
        description,
        street,
        city,
        state,
        zip_code as "zipCode",
        country,
        quoted_price_cents as "quotedPriceCents",
        currency,
        created_at as "createdAt",
        updated_at as "updatedAt",
        created_by as "createdBy"
      FROM jobs
      WHERE id = ${id}
    `;

		if (jobs.length === 0) return undefined;

		const job = jobs[0];
		return {
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents),
			quotedPrice: { amount: Number(job.quotedPriceCents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country,
			},
		};
	},

	getByClientId: async (clientId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        id,
        job_number as "jobNumber",
        client_id as "clientId",
        status,
        title,
        description,
        street,
        city,
        state,
        zip_code as "zipCode",
        country,
        quoted_price_cents as "quotedPriceCents",
        currency,
        created_at as "createdAt",
        updated_at as "updatedAt",
        created_by as "createdBy"
      FROM jobs
      WHERE client_id = ${clientId}
      ORDER BY created_at DESC
    `;
		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents),
			quotedPrice: { amount: Number(job.quotedPriceCents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country,
			},
		})) as Array<Job>;
	},

	getByEmployeeId: async (employeeId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        j.id,
        j.job_number as "jobNumber",
        j.client_id as "clientId",
        j.status,
        j.title,
        j.description,
        j.street,
        j.city,
        j.state,
        j.zip_code as "zipCode",
        j.country,
        j.quoted_price_cents as "quotedPriceCents",
        j.currency,
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy"
      FROM jobs j
      JOIN employee_jobs ej ON j.id = ej.job_id
      WHERE ej.employee_id = ${employeeId}
      ORDER BY j.created_at DESC
    `;
		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents),
			quotedPrice: { amount: Number(job.quotedPriceCents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			tasks: [],
			assignedEmployeeIds: [employeeId],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country,
			},
		})) as Array<Job>;
	},

	getByStatus: async (status: JobStatus) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT 
        id,
        job_number as "jobNumber",
        client_id as "clientId",
        status,
        title,
        description,
        street,
        city,
        state,
        zip_code as "zipCode",
        country,
        quoted_price_cents as "quotedPriceCents",
        currency,
        created_at as "createdAt",
        updated_at as "updatedAt",
        created_by as "createdBy"
      FROM jobs
      WHERE status = ${status}::job_status
      ORDER BY created_at DESC
    `;
		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents),
			quotedPrice: { amount: Number(job.quotedPriceCents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country,
			},
		})) as Array<Job>;
	},

	create: async (job) => {
		const sql = neon(process.env.DATABASE_URL!);

		// Generate job number
		const nextNum = await sql`SELECT nextval('job_number_seq') as num`;
		const jobNumber = `JOB-${nextNum[0].num}`;

		const newJob = await sql`
      INSERT INTO jobs (
        id, job_number, client_id, status, title, description,
        street, city, state, zip_code, country,
        quoted_price_cents, currency,
        created_at, updated_at, created_by
      ) VALUES (
        gen_random_uuid(),
        ${jobNumber},
        ${job.clientId},
        ${job.status}::job_status,
        ${job.title},
        ${job.description || null},
        ${job.address.street},
        ${job.address.city},
        ${job.address.state},
        ${job.address.zipCode},
        ${job.address.country || 'US'},
        ${Math.round(job.quotedPrice?.amount || 0) * 100},
        ${job.quotedPrice?.currency || 'USD'},
        NOW(),
        NOW(),
        ${job.createdBy || null}
      )
      RETURNING *
    `;

		const result = newJob[0];
		return {
			id: result.id,
			jobNumber: result.job_number,
			clientId: result.client_id,
			status: result.status,
			title: result.title,
			description: result.description,
			quotedPriceCents: Number(result.quoted_price_cents),
			quotedPrice: { amount: Number(result.quoted_price_cents) / 100, currency: result.currency },
			currency: result.currency,
			createdAt: result.created_at,
			updatedAt: result.updated_at,
			createdBy: result.created_by,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: result.street,
				city: result.city,
				state: result.state,
				zipCode: result.zip_code,
				country: result.country,
			},
		};
	},

	update: async (id, updates) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE jobs 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        status = COALESCE(${updates.status}::job_status, status),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, job_number, client_id, status, title, description, street, city, state, zip_code, country, quoted_price_cents, currency, created_at, updated_at, created_by
    `;

		if (updated.length === 0) return undefined;

		const job = updated[0];
		return {
			id: job.id,
			jobNumber: job.job_number,
			clientId: job.client_id,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quoted_price_cents),
			quotedPrice: { amount: Number(job.quoted_price_cents) / 100, currency: job.currency },
			currency: job.currency,
			createdAt: job.created_at,
			updatedAt: job.updated_at,
			createdBy: job.created_by,
			tasks: [],
			assignedEmployeeIds: [],
			estimatedDuration: 0,
			estimatedCost: { amount: 0, currency: 'USD' },
			priority: 'medium' as Priority,
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zip_code,
				country: job.country,
			},
		};
	},

	delete: async (id) => {
		const sql = neon(process.env.DATABASE_URL!);

		// First delete related employee_jobs
		await sql`DELETE FROM employee_jobs WHERE job_id = ${id}`;

		// Then delete the job
		const result = await sql`DELETE FROM jobs WHERE id = ${id} RETURNING id`;

		return result.length > 0;
	},
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getJobs = () => jobService.getAll();
export const getJobById = (id: EntityId) => jobService.getById(id);
export const getJobsByClientId = (clientId: EntityId) =>
	jobService.getByClientId(clientId);
export const getJobsByEmployeeId = (employeeId: EntityId) =>
	jobService.getByEmployeeId(employeeId);
export const getJobsByStatus = (status: JobStatus) =>
	jobService.getByStatus(status);
export const fetchOpenJobsForAssignment = () =>
	jobService.fetchOpenJobsForAssignment();
export const createJob = (
	job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>,
) => jobService.create(job);
export const updateJob = (id: EntityId, updates: Partial<Job>) =>
	jobService.update(id, updates);
export const deleteJob = (id: EntityId) => jobService.delete(id);
