/**
 * Job Service
 *
 * Service layer for job management operations using real database.
 */

import { neon } from '@neondatabase/serverless';
import type {
	Job,
	EntityId,
	JobStatus,
	Priority,
	JobWithFullRelations,
	JobTask,
	JobMaterial,
} from '@/src/domain/entities';

// ============================================================================
// Service Interface
// ============================================================================

export interface JobService {
	// Basic CRUD
	getAll(): Promise<Job[]>;
	getById(id: EntityId): Promise<Job | undefined>;
	getByClientId(clientId: EntityId): Promise<Job[]>;
	getByEmployeeId(employeeId: EntityId): Promise<Job[]>;
	getByStatus(status: JobStatus): Promise<Job[]>;

	// Advanced Queries
	getWithRelations(id: EntityId): Promise<JobWithFullRelations | undefined>;
	getByDateRange(startDate: Date, endDate: Date): Promise<Job[]>;
	getByPriority(priority: Priority): Promise<Job[]>;
	getUpcoming(limit?: number): Promise<Job[]>;
	getOverdue(): Promise<Job[]>;

	// Assignment Methods
	assignEmployee(jobId: EntityId, employeeId: EntityId): Promise<boolean>;
	unassignEmployee(jobId: EntityId, employeeId: EntityId): Promise<boolean>;
	getAssignedEmployees(
		jobId: EntityId,
	): Promise<Array<{ id: string; name: string; role: string }>>;

	// Task Management
	getTasks(jobId: EntityId): Promise<JobTask[]>;
	addTask(jobId: EntityId, task: Omit<JobTask, 'id'>): Promise<JobTask>;
	updateTask(
		jobId: EntityId,
		taskId: EntityId,
		updates: Partial<JobTask>,
	): Promise<JobTask | undefined>;
	deleteTask(jobId: EntityId, taskId: EntityId): Promise<boolean>;

	// Material Management
	getMaterials(jobId: EntityId): Promise<JobMaterial[]>;
	addMaterial(
		jobId: EntityId,
		material: Omit<JobMaterial, 'id'>,
	): Promise<JobMaterial>;
	updateMaterial(
		jobId: EntityId,
		materialId: EntityId,
		updates: Partial<JobMaterial>,
	): Promise<JobMaterial | undefined>;
	deleteMaterial(jobId: EntityId, materialId: EntityId): Promise<boolean>;

	// Status Management
	updateStatus(jobId: EntityId, status: JobStatus): Promise<Job | undefined>;
	markAsCompleted(
		jobId: EntityId,
		completionNotes?: string,
	): Promise<Job | undefined>;
	markAsCancelled(jobId: EntityId, reason?: string): Promise<Job | undefined>;

	// Progress Tracking
	updateProgress(jobId: EntityId, completedTasks: number): Promise<number>;
	getCompletionPercentage(jobId: EntityId): Promise<number>;

	// Utility
	fetchOpenJobsForAssignment(): Promise<
		Array<{ id: string; jobNumber: string; title: string; status: string }>
	>;
	getJobStats(): Promise<{
		total: number;
		active: number;
		completed: number;
		overdue: number;
		byStatus: Record<JobStatus, number>;
	}>;

	// CRUD Operations
	create(
		job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'> & {
			createdBy?: string;
		},
	): Promise<Job>;
	update(id: EntityId, updates: Partial<Job>): Promise<Job | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Helper Functions
// ============================================================================

const mapJobRow = (job: any, assignedEmployeeIds?: any[]): Job => ({
	id: job.id,
	jobNumber: job.jobNumber,
	clientId: job.clientId,
	status: job.status,
	title: job.title,
	description: job.description,
	quotedPriceCents: Number(job.quotedPriceCents) || 0,
	quotedPrice: {
		amount: Number(job.quotedPriceCents || 0) / 100,
		currency: job.currency || 'USD',
	},
	currency: job.currency || 'USD',
	priority: job.priority || 'medium',
	estimatedDuration: Number(job.estimatedDuration) || 0,
	actualDuration: job.actualDuration
		? Number(job.actualDuration)
		: undefined,
	scheduledStart: job.scheduledStart,
	scheduledEnd: job.scheduledEnd,
	actualStart: job.actualStart,
	actualEnd: job.actualEnd,
	supervisorId: job.supervisorId,
	invoiceId: job.invoiceId,
	contractId: job.contractId,
	notes: job.notes,
	internalNotes: job.internalNotes,
	photos: job.photos ? job.photos.split(',') : [],
	completionNotes: job.completionNotes,
	createdAt: job.createdAt,
	updatedAt: job.updatedAt,
	createdBy: job.createdBy,
	completedAt: job.completedAt,
	cancelledAt: job.cancelledAt,
	cancellationReason: job.cancellationReason,
	tasks: [],
	assignedEmployeeIds: assignedEmployeeIds
		? assignedEmployeeIds.filter(Boolean)
		: job.assignedEmployeeIds
		? job.assignedEmployeeIds.filter(Boolean)
		: [],
	estimatedCost: { amount: 0, currency: 'USD' },
	address: {
		street: job.street,
		city: job.city,
		state: job.state,
		zipCode: job.zipCode,
		country: job.country || 'US',
	},
});

// ============================================================================
// Service Implementation
// ============================================================================

export const jobService: JobService = {
	getAll: async () => {
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
        j.priority,
        j.estimated_duration as "estimatedDuration",
        j.actual_duration as "actualDuration",
        j.scheduled_start as "scheduledStart",
        j.scheduled_end as "scheduledEnd",
        j.actual_start as "actualStart",
        j.actual_end as "actualEnd",
        j.supervisor_id as "supervisorId",
        j.invoice_id as "invoiceId",
        j.contract_id as "contractId",
        j.notes,
        j.internal_notes as "internalNotes",
        j.photos,
        j.completion_notes as "completionNotes",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy",
        j.completed_at as "completedAt",
        j.cancelled_at as "cancelledAt",
        j.cancellation_reason as "cancellationReason",
        array_agg(DISTINCT ej.employee_id) as "assignedEmployeeIds"
      FROM jobs j
      LEFT JOIN employee_jobs ej ON j.id = ej.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;

		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents) || 0,
			quotedPrice: {
				amount: Number(job.quotedPriceCents || 0) / 100,
				currency: job.currency || 'USD',
			},
			currency: job.currency || 'USD',
			priority: job.priority || 'medium',
			estimatedDuration: Number(job.estimatedDuration) || 0,
			actualDuration: job.actualDuration
				? Number(job.actualDuration)
				: undefined,
			scheduledStart: job.scheduledStart,
			scheduledEnd: job.scheduledEnd,
			actualStart: job.actualStart,
			actualEnd: job.actualEnd,
			supervisorId: job.supervisorId,
			invoiceId: job.invoiceId,
			contractId: job.contractId,
			notes: job.notes,
			internalNotes: job.internalNotes,
			photos: job.photos ? job.photos.split(',') : [],
			completionNotes: job.completionNotes,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			completedAt: job.completedAt,
			cancelledAt: job.cancelledAt,
			cancellationReason: job.cancellationReason,
			tasks: [],
			assignedEmployeeIds: job.assignedEmployeeIds
				? job.assignedEmployeeIds.filter(Boolean)
				: [],
			estimatedCost: { amount: 0, currency: 'USD' },
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country || 'US',
			},
		})) as Job[];
	},

	getById: async (id: EntityId) => {
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
        j.priority,
        j.estimated_duration as "estimatedDuration",
        j.actual_duration as "actualDuration",
        j.scheduled_start as "scheduledStart",
        j.scheduled_end as "scheduledEnd",
        j.actual_start as "actualStart",
        j.actual_end as "actualEnd",
        j.supervisor_id as "supervisorId",
        j.invoice_id as "invoiceId",
        j.contract_id as "contractId",
        j.notes,
        j.internal_notes as "internalNotes",
        j.photos,
        j.completion_notes as "completionNotes",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy",
        j.completed_at as "completedAt",
        j.cancelled_at as "cancelledAt",
        j.cancellation_reason as "cancellationReason",
        array_agg(DISTINCT ej.employee_id) as "assignedEmployeeIds"
      FROM jobs j
      LEFT JOIN employee_jobs ej ON j.id = ej.job_id
      WHERE j.id = ${id}
      GROUP BY j.id
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
			quotedPriceCents: Number(job.quotedPriceCents) || 0,
			quotedPrice: {
				amount: Number(job.quotedPriceCents || 0) / 100,
				currency: job.currency || 'USD',
			},
			currency: job.currency || 'USD',
			priority: job.priority || 'medium',
			estimatedDuration: Number(job.estimatedDuration) || 0,
			actualDuration: job.actualDuration
				? Number(job.actualDuration)
				: undefined,
			scheduledStart: job.scheduledStart,
			scheduledEnd: job.scheduledEnd,
			actualStart: job.actualStart,
			actualEnd: job.actualEnd,
			supervisorId: job.supervisorId,
			invoiceId: job.invoiceId,
			contractId: job.contractId,
			notes: job.notes,
			internalNotes: job.internalNotes,
			photos: job.photos ? job.photos.split(',') : [],
			completionNotes: job.completionNotes,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			completedAt: job.completedAt,
			cancelledAt: job.cancelledAt,
			cancellationReason: job.cancellationReason,
			tasks: [],
			assignedEmployeeIds: job.assignedEmployeeIds
				? job.assignedEmployeeIds.filter(Boolean)
				: [],
			estimatedCost: { amount: 0, currency: 'USD' },
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country || 'US',
			},
		} as Job;
	},

	getByClientId: async (clientId: EntityId) => {
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
        j.priority,
        j.estimated_duration as "estimatedDuration",
        j.actual_duration as "actualDuration",
        j.scheduled_start as "scheduledStart",
        j.scheduled_end as "scheduledEnd",
        j.actual_start as "actualStart",
        j.actual_end as "actualEnd",
        j.supervisor_id as "supervisorId",
        j.invoice_id as "invoiceId",
        j.contract_id as "contractId",
        j.notes,
        j.internal_notes as "internalNotes",
        j.photos,
        j.completion_notes as "completionNotes",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy",
        j.completed_at as "completedAt",
        j.cancelled_at as "cancelledAt",
        j.cancellation_reason as "cancellationReason",
        array_agg(DISTINCT ej.employee_id) as "assignedEmployeeIds"
      FROM jobs j
      LEFT JOIN employee_jobs ej ON j.id = ej.job_id
      WHERE j.client_id = ${clientId}
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;

		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents) || 0,
			quotedPrice: {
				amount: Number(job.quotedPriceCents || 0) / 100,
				currency: job.currency || 'USD',
			},
			currency: job.currency || 'USD',
			priority: job.priority || 'medium',
			estimatedDuration: Number(job.estimatedDuration) || 0,
			actualDuration: job.actualDuration
				? Number(job.actualDuration)
				: undefined,
			scheduledStart: job.scheduledStart,
			scheduledEnd: job.scheduledEnd,
			actualStart: job.actualStart,
			actualEnd: job.actualEnd,
			supervisorId: job.supervisorId,
			invoiceId: job.invoiceId,
			contractId: job.contractId,
			notes: job.notes,
			internalNotes: job.internalNotes,
			photos: job.photos ? job.photos.split(',') : [],
			completionNotes: job.completionNotes,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			completedAt: job.completedAt,
			cancelledAt: job.cancelledAt,
			cancellationReason: job.cancellationReason,
			tasks: [],
			assignedEmployeeIds: job.assignedEmployeeIds
				? job.assignedEmployeeIds.filter(Boolean)
				: [],
			estimatedCost: { amount: 0, currency: 'USD' },
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country || 'US',
			},
		})) as Job[];
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
        j.priority,
        j.estimated_duration as "estimatedDuration",
        j.actual_duration as "actualDuration",
        j.scheduled_start as "scheduledStart",
        j.scheduled_end as "scheduledEnd",
        j.actual_start as "actualStart",
        j.actual_end as "actualEnd",
        j.supervisor_id as "supervisorId",
        j.invoice_id as "invoiceId",
        j.contract_id as "contractId",
        j.notes,
        j.internal_notes as "internalNotes",
        j.photos,
        j.completion_notes as "completionNotes",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy",
        j.completed_at as "completedAt",
        j.cancelled_at as "cancelledAt",
        j.cancellation_reason as "cancellationReason"
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
			quotedPriceCents: Number(job.quotedPriceCents) || 0,
			quotedPrice: {
				amount: Number(job.quotedPriceCents || 0) / 100,
				currency: job.currency || 'USD',
			},
			currency: job.currency || 'USD',
			priority: job.priority || 'medium',
			estimatedDuration: Number(job.estimatedDuration) || 0,
			actualDuration: job.actualDuration
				? Number(job.actualDuration)
				: undefined,
			scheduledStart: job.scheduledStart,
			scheduledEnd: job.scheduledEnd,
			actualStart: job.actualStart,
			actualEnd: job.actualEnd,
			supervisorId: job.supervisorId,
			invoiceId: job.invoiceId,
			contractId: job.contractId,
			notes: job.notes,
			internalNotes: job.internalNotes,
			photos: job.photos ? job.photos.split(',') : [],
			completionNotes: job.completionNotes,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			completedAt: job.completedAt,
			cancelledAt: job.cancelledAt,
			cancellationReason: job.cancellationReason,
			tasks: [],
			assignedEmployeeIds: [employeeId],
			estimatedCost: { amount: 0, currency: 'USD' },
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country || 'US',
			},
		})) as Job[];
	},

	getByStatus: async (status: JobStatus) => {
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
        j.priority,
        j.estimated_duration as "estimatedDuration",
        j.actual_duration as "actualDuration",
        j.scheduled_start as "scheduledStart",
        j.scheduled_end as "scheduledEnd",
        j.actual_start as "actualStart",
        j.actual_end as "actualEnd",
        j.supervisor_id as "supervisorId",
        j.invoice_id as "invoiceId",
        j.contract_id as "contractId",
        j.notes,
        j.internal_notes as "internalNotes",
        j.photos,
        j.completion_notes as "completionNotes",
        j.created_at as "createdAt",
        j.updated_at as "updatedAt",
        j.created_by as "createdBy",
        j.completed_at as "completedAt",
        j.cancelled_at as "cancelledAt",
        j.cancellation_reason as "cancellationReason",
        array_agg(DISTINCT ej.employee_id) as "assignedEmployeeIds"
      FROM jobs j
      LEFT JOIN employee_jobs ej ON j.id = ej.job_id
      WHERE j.status = ${status}::job_status
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;

		return jobs.map((job) => ({
			id: job.id,
			jobNumber: job.jobNumber,
			clientId: job.clientId,
			status: job.status,
			title: job.title,
			description: job.description,
			quotedPriceCents: Number(job.quotedPriceCents) || 0,
			quotedPrice: {
				amount: Number(job.quotedPriceCents || 0) / 100,
				currency: job.currency || 'USD',
			},
			currency: job.currency || 'USD',
			priority: job.priority || 'medium',
			estimatedDuration: Number(job.estimatedDuration) || 0,
			actualDuration: job.actualDuration
				? Number(job.actualDuration)
				: undefined,
			scheduledStart: job.scheduledStart,
			scheduledEnd: job.scheduledEnd,
			actualStart: job.actualStart,
			actualEnd: job.actualEnd,
			supervisorId: job.supervisorId,
			invoiceId: job.invoiceId,
			contractId: job.contractId,
			notes: job.notes,
			internalNotes: job.internalNotes,
			photos: job.photos ? job.photos.split(',') : [],
			completionNotes: job.completionNotes,
			createdAt: job.createdAt,
			updatedAt: job.updatedAt,
			createdBy: job.createdBy,
			completedAt: job.completedAt,
			cancelledAt: job.cancelledAt,
			cancellationReason: job.cancellationReason,
			tasks: [],
			assignedEmployeeIds: job.assignedEmployeeIds
				? job.assignedEmployeeIds.filter(Boolean)
				: [],
			estimatedCost: { amount: 0, currency: 'USD' },
			address: {
				street: job.street,
				city: job.city,
				state: job.state,
				zipCode: job.zipCode,
				country: job.country || 'US',
			},
		})) as Job[];
	},

	getWithRelations: async (id: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const jobs = await sql`
      SELECT 
        j.*,
        json_agg(DISTINCT jsonb_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.contact_info->>'email',
          'phone', c.contact_info->>'phone'
        )) FILTER (WHERE c.id IS NOT NULL) as client,
        json_agg(DISTINCT jsonb_build_object(
          'id', e.id,
          'firstName', e.first_name,
          'lastName', e.last_name,
          'role', e.role
        )) FILTER (WHERE e.id IS NOT NULL) as employees,
        json_agg(DISTINCT jsonb_build_object(
          'id', p.id,
          'paymentNumber', p.payment_number,
          'amount', p.amount_cents,
          'status', p.status
        )) FILTER (WHERE p.id IS NOT NULL) as payments,
        json_agg(DISTINCT jsonb_build_object(
          'id', s.id,
          'scheduledStart', s.scheduled_start,
          'scheduledEnd', s.scheduled_end,
          'status', s.status
        )) FILTER (WHERE s.id IS NOT NULL) as schedules
      FROM jobs j
      LEFT JOIN clients c ON j.client_id = c.id
      LEFT JOIN employee_jobs ej ON j.id = ej.job_id
      LEFT JOIN employees e ON ej.employee_id = e.id
      LEFT JOIN payments p ON j.id = p.job_id
      LEFT JOIN schedules s ON j.id = s.job_id
      WHERE j.id = ${id}
      GROUP BY j.id
    `;

		if (jobs.length === 0) return undefined;

		const job = jobs[0];
		return {
			job: (await jobService.getById(id)) as Job,
			client: job.client?.[0],
			employees: job.employees?.filter(Boolean) || [],
			payments: job.payments?.filter(Boolean) || [],
			schedules: job.schedules?.filter(Boolean) || [],
		} as JobWithFullRelations;
	},

	getByDateRange: async (startDate: Date, endDate: Date) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT * FROM jobs 
      WHERE created_at BETWEEN ${startDate.toISOString()} AND ${endDate.toISOString()}
      ORDER BY created_at DESC
    `;
		return jobs as Job[];
	},

	getByPriority: async (priority: Priority) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT * FROM jobs 
      WHERE priority = ${priority}::priority
      ORDER BY created_at DESC
    `;
		return jobs as Job[];
	},

	getUpcoming: async (limit = 10) => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT * FROM jobs 
      WHERE status IN ('scheduled', 'in_progress')
      ORDER BY scheduled_start ASC
      LIMIT ${limit}
    `;
		return jobs as Job[];
	},

	getOverdue: async () => {
		const sql = neon(process.env.DATABASE_URL!);
		const jobs = await sql`
      SELECT * FROM jobs 
      WHERE status = 'scheduled' 
      AND scheduled_end < NOW()
      ORDER BY scheduled_end ASC
    `;
		return jobs as Job[];
	},

	assignEmployee: async (jobId: EntityId, employeeId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		// Check if already assigned
		const existing = await sql`
      SELECT 1 FROM employee_jobs 
      WHERE job_id = ${jobId} AND employee_id = ${employeeId}
    `;

		if (existing.length > 0) return true;

		const result = await sql`
      INSERT INTO employee_jobs (job_id, employee_id, assigned_at, status)
      VALUES (${jobId}, ${employeeId}, NOW(), 'assigned')
      RETURNING id
    `;

		return result.length > 0;
	},

	unassignEmployee: async (jobId: EntityId, employeeId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const result = await sql`
      DELETE FROM employee_jobs 
      WHERE job_id = ${jobId} AND employee_id = ${employeeId}
      RETURNING id
    `;
		return result.length > 0;
	},

	getAssignedEmployees: async (jobId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const employees = await sql`
      SELECT 
        e.id,
        e.first_name || ' ' || e.last_name as name,
        e.role
      FROM employees e
      JOIN employee_jobs ej ON e.id = ej.employee_id
      WHERE ej.job_id = ${jobId}
    `;
		return employees as Array<{ id: string; name: string; role: string }>;
	},

	getTasks: async (jobId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const tasks = await sql`
      SELECT 
        id,
        title,
        description,
        status,
        priority,
        estimated_duration as "estimatedDuration",
        actual_duration as "actualDuration",
        "order"
      FROM job_tasks
      WHERE job_id = ${jobId}
      ORDER BY "order" ASC
    `;
		return tasks as JobTask[];
	},

	addTask: async (jobId: EntityId, task) => {
		const sql = neon(process.env.DATABASE_URL!);

		// Get next order number
		const maxOrder = await sql`
      SELECT COALESCE(MAX("order"), 0) + 1 as next_order
      FROM job_tasks
      WHERE job_id = ${jobId}
    `;

		const order = maxOrder[0]?.next_order || 1;

		const newTask = await sql`
      INSERT INTO job_tasks (
        id, job_id, title, description, status, priority, 
        estimated_duration, "order"
      ) VALUES (
        gen_random_uuid(),
        ${jobId},
        ${task.title},
        ${task.description},
        ${task.status}::task_status,
        ${task.priority}::priority,
        ${task.estimatedDuration},
        ${order}
      )
      RETURNING *
    `;

		return newTask[0] as JobTask;
	},

	updateTask: async (jobId: EntityId, taskId: EntityId, updates) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE job_tasks
      SET
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        status = COALESCE(${updates.status}::task_status, status),
        priority = COALESCE(${updates.priority}::priority, priority),
        estimated_duration = COALESCE(${updates.estimatedDuration}, estimated_duration),
        actual_duration = COALESCE(${updates.actualDuration}, actual_duration),
        updated_at = NOW()
      WHERE job_id = ${jobId} AND id = ${taskId}
      RETURNING *
    `;

		return updated[0] as JobTask | undefined;
	},

	deleteTask: async (jobId: EntityId, taskId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const result = await sql`
      DELETE FROM job_tasks 
      WHERE job_id = ${jobId} AND id = ${taskId}
      RETURNING id
    `;
		return result.length > 0;
	},

	getMaterials: async (jobId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const materials = await sql`
      SELECT 
        id,
        name,
        quantity,
        unit,
        cost_cents as "cost",
        supplier
      FROM job_materials
      WHERE job_id = ${jobId}
    `;

		return materials.map((m) => ({
			...m,
			cost: { amount: Number(m.cost) / 100, currency: 'USD' },
		})) as JobMaterial[];
	},

	addMaterial: async (jobId: EntityId, material) => {
		const sql = neon(process.env.DATABASE_URL!);

		const newMaterial = await sql`
      INSERT INTO job_materials (
        id, job_id, name, quantity, unit, cost_cents, supplier
      ) VALUES (
        gen_random_uuid(),
        ${jobId},
        ${material.name},
        ${material.quantity},
        ${material.unit},
        ${material.cost.amount * 100},
        ${material.supplier}
      )
      RETURNING *
    `;

		const result = newMaterial[0];
		return {
			...result,
			cost: { amount: Number(result.cost_cents) / 100, currency: 'USD' },
		} as JobMaterial;
	},

	updateMaterial: async (jobId: EntityId, materialId: EntityId, updates) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE job_materials
      SET
        name = COALESCE(${updates.name}, name),
        quantity = COALESCE(${updates.quantity}, quantity),
        unit = COALESCE(${updates.unit}, unit),
        cost_cents = COALESCE(${updates.cost ? updates.cost.amount * 100 : undefined}, cost_cents),
        supplier = COALESCE(${updates.supplier}, supplier),
        updated_at = NOW()
      WHERE job_id = ${jobId} AND id = ${materialId}
      RETURNING *
    `;

		if (updated.length === 0) return undefined;

		const result = updated[0];
		return {
			...result,
			cost: { amount: Number(result.cost_cents) / 100, currency: 'USD' },
		} as JobMaterial;
	},

	deleteMaterial: async (jobId: EntityId, materialId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);
		const result = await sql`
      DELETE FROM job_materials 
      WHERE job_id = ${jobId} AND id = ${materialId}
      RETURNING id
    `;
		return result.length > 0;
	},

	updateStatus: async (jobId: EntityId, status: JobStatus) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE jobs 
      SET 
        status = ${status}::job_status,
        updated_at = NOW()
      WHERE id = ${jobId}
      RETURNING *
    `;

		if (updated.length === 0) return undefined;

		return jobService.getById(jobId);
	},

	markAsCompleted: async (jobId: EntityId, completionNotes?: string) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE jobs 
      SET 
        status = 'completed'::job_status,
        completed_at = NOW(),
        completion_notes = ${completionNotes || null},
        updated_at = NOW()
      WHERE id = ${jobId}
      RETURNING *
    `;

		if (updated.length === 0) return undefined;

		return jobService.getById(jobId);
	},

	markAsCancelled: async (jobId: EntityId, reason?: string) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE jobs 
      SET 
        status = 'cancelled'::job_status,
        cancelled_at = NOW(),
        cancellation_reason = ${reason || null},
        updated_at = NOW()
      WHERE id = ${jobId}
      RETURNING *
    `;

		if (updated.length === 0) return undefined;

		return jobService.getById(jobId);
	},

	updateProgress: async (jobId: EntityId, completedTasks: number) => {
		const sql = neon(process.env.DATABASE_URL!);

		const totalTasks = await sql`
      SELECT COUNT(*) as total FROM job_tasks WHERE job_id = ${jobId}
    `;

		const total = Number(totalTasks[0]?.total) || 0;
		const percentage =
			total > 0 ? Math.round((completedTasks / total) * 100) : 0;

		await sql`
      UPDATE jobs 
      SET 
        progress_percentage = ${percentage},
        updated_at = NOW()
      WHERE id = ${jobId}
    `;

		return percentage;
	},

	getCompletionPercentage: async (jobId: EntityId) => {
		const sql = neon(process.env.DATABASE_URL!);

		const tasks = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM job_tasks 
      WHERE job_id = ${jobId}
    `;

		const total = Number(tasks[0]?.total) || 0;
		const completed = Number(tasks[0]?.completed) || 0;

		return total > 0 ? Math.round((completed / total) * 100) : 0;
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

	getJobStats: async () => {
		const sql = neon(process.env.DATABASE_URL!);

		const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('scheduled', 'in_progress')) as active,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (
          WHERE status = 'scheduled' AND scheduled_end < NOW()
        ) as overdue,
        json_object_agg(status, count) as by_status
      FROM (
        SELECT status, COUNT(*) as count
        FROM jobs
        GROUP BY status
      ) s
    `;

		const result = stats[0];
		return {
			total: Number(result.total) || 0,
			active: Number(result.active) || 0,
			completed: Number(result.completed) || 0,
			overdue: Number(result.overdue) || 0,
			byStatus: result.by_status || {},
		};
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
        quoted_price_cents, currency, priority, estimated_duration,
        scheduled_start, scheduled_end, supervisor_id, contract_id,
        notes, internal_notes, photos, created_by,
        created_at, updated_at
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
        ${job.priority || 'medium'}::priority,
        ${job.estimatedDuration || 0},
        ${job.scheduledStart || null},
        ${job.scheduledEnd || null},
        ${job.supervisorId || null},
        ${job.contractId || null},
        ${job.notes || null},
        ${job.internalNotes || null},
        ${job.photos?.join(',') || null},
        ${job.createdBy || null},
        NOW(),
        NOW()
      )
      RETURNING id
    `;

		const result = newJob[0];
		return jobService.getById(result.id) as Promise<Job>;
	},

	update: async (id, updates) => {
		const sql = neon(process.env.DATABASE_URL!);

		const updated = await sql`
      UPDATE jobs 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description),
        status = COALESCE(${updates.status}::job_status, status),
        priority = COALESCE(${updates.priority}::priority, priority),
        scheduled_start = COALESCE(${updates.scheduledStart}, scheduled_start),
        scheduled_end = COALESCE(${updates.scheduledEnd}, scheduled_end),
        notes = COALESCE(${updates.notes}, notes),
        internal_notes = COALESCE(${updates.internalNotes}, internal_notes),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id
    `;

		if (updated.length === 0) return undefined;

		return jobService.getById(id);
	},

	delete: async (id) => {
		const sql = neon(process.env.DATABASE_URL!);

		// First delete related records
		await sql`DELETE FROM employee_jobs WHERE job_id = ${id}`;
		await sql`DELETE FROM job_tasks WHERE job_id = ${id}`;
		await sql`DELETE FROM job_materials WHERE job_id = ${id}`;

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
/** Alias for UI compatibility */
export const getJobsByClient = getJobsByClientId;
export const getJobsByEmployeeId = (employeeId: EntityId) =>
	jobService.getByEmployeeId(employeeId);
export const getJobsByStatus = (status: JobStatus) =>
	jobService.getByStatus(status);
export const getJobWithRelations = (id: EntityId) =>
	jobService.getWithRelations(id);
export const getJobsByDateRange = (startDate: Date, endDate: Date) =>
	jobService.getByDateRange(startDate, endDate);
export const getUpcomingJobs = (limit?: number) =>
	jobService.getUpcoming(limit);
export const getOverdueJobs = () => jobService.getOverdue();
export const assignEmployeeToJob = (jobId: EntityId, employeeId: EntityId) =>
	jobService.assignEmployee(jobId, employeeId);
export const unassignEmployeeFromJob = (
	jobId: EntityId,
	employeeId: EntityId,
) => jobService.unassignEmployee(jobId, employeeId);
export const getJobAssignedEmployees = (jobId: EntityId) =>
	jobService.getAssignedEmployees(jobId);
export const getJobTasks = (jobId: EntityId) => jobService.getTasks(jobId);
export const addJobTask = (jobId: EntityId, task: Omit<JobTask, 'id'>) =>
	jobService.addTask(jobId, task);
export const updateJobTask = (
	jobId: EntityId,
	taskId: EntityId,
	updates: Partial<JobTask>,
) => jobService.updateTask(jobId, taskId, updates);
export const deleteJobTask = (jobId: EntityId, taskId: EntityId) =>
	jobService.deleteTask(jobId, taskId);
export const getJobMaterials = (jobId: EntityId) =>
	jobService.getMaterials(jobId);
export const addJobMaterial = (
	jobId: EntityId,
	material: Omit<JobMaterial, 'id'>,
) => jobService.addMaterial(jobId, material);
export const updateJobMaterial = (
	jobId: EntityId,
	materialId: EntityId,
	updates: Partial<JobMaterial>,
) => jobService.updateMaterial(jobId, materialId, updates);
export const deleteJobMaterial = (jobId: EntityId, materialId: EntityId) =>
	jobService.deleteMaterial(jobId, materialId);
export const updateJobStatus = (jobId: EntityId, status: JobStatus) =>
	jobService.updateStatus(jobId, status);
export const completeJob = (jobId: EntityId, notes?: string) =>
	jobService.markAsCompleted(jobId, notes);
export const cancelJob = (jobId: EntityId, reason?: string) =>
	jobService.markAsCancelled(jobId, reason);
export const updateJobProgress = (jobId: EntityId, completedTasks: number) =>
	jobService.updateProgress(jobId, completedTasks);
export const getJobCompletionPercentage = (jobId: EntityId) =>
	jobService.getCompletionPercentage(jobId);
export const fetchOpenJobsForAssignment = () =>
	jobService.fetchOpenJobsForAssignment();
export const getJobStats = () => jobService.getJobStats();
export const createJob = (
	job: Omit<Job, 'id' | 'jobNumber' | 'createdAt' | 'updatedAt'>,
) => jobService.create(job);
export const updateJob = (id: EntityId, updates: Partial<Job>) =>
	jobService.update(id, updates);
export const deleteJob = (id: EntityId) => jobService.delete(id);
