/**
 * Employee Service
 *
 * Service layer for employee management operations.
 */

import type { Employee, EntityId, EmployeeStatus } from '@/src/domain/entities';

// ============================================================================
// Safe database connection - handles missing env var during build
// ============================================================================

let sql: any;

// Check if we're in a build environment
const isBuildTime =
	process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

if (!process.env.DATABASE_URL) {
	console.warn(
		'⚠️ DATABASE_URL environment variable is not set. Using mock data mode.',
	);
	// Create a mock SQL function that returns empty arrays
	sql = async () => [];
} else {
	try {
		// Dynamically import neon only when we have a database URL
		const { neon } = require('@neondatabase/serverless');
		sql = neon(process.env.DATABASE_URL);
	} catch (error) {
		console.error('Failed to initialize database:', error);
		sql = async () => [];
	}
}

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface EmployeeService {
	getAll(): Promise<Employee[]>;
	getById(id: EntityId): Promise<Employee | undefined>;
	getByStatus(status: EmployeeStatus): Promise<Employee[]>;
	create(
		employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
	): Promise<Employee>;
	update(
		id: EntityId,
		updates: Partial<Employee>,
	): Promise<Employee | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const employeeService: EmployeeService = {
	getAll: async () => {
		try {
			const employees = await sql`
				SELECT 
					p.id,
					p.full_name as name,
					r.name as role,
					'active' as status,
					p.created_at as "hireDate",
					p.updated_at as "updatedAt"
				FROM profiles p
				JOIN user_roles ur ON p.id = ur.profile_id
				JOIN roles r ON ur.role_id = r.id
				WHERE r.name IN ('employee', 'supervisor')
				ORDER BY p.full_name
			`;

			return employees.map((emp: any) => ({
				id: emp.id,
				firstName: emp.name?.split(' ')[0] || '',
				lastName: emp.name?.split(' ').slice(1).join(' ') || '',
				displayName: emp.name || '',
				email:
					emp.email ||
					`${emp.name?.toLowerCase().replace(' ', '.') || 'employee'}@jjlandscaping.com`,
				phone: '+1-555-0101',
				role: emp.role || 'employee',
				status: emp.status || 'active',
				hireDate: emp.hireDate || new Date().toISOString(),
				availability: {
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: [],
				},
				completedJobsCount: 0,
				totalHoursWorked: 0,
				assignedJobIds: [],
				supervisedJobIds: [],
				rating: 4.5,
				department: 'General',
				createdAt: emp.hireDate || new Date().toISOString(),
				updatedAt: emp.updatedAt || emp.hireDate || new Date().toISOString(),
			}));
		} catch (error) {
			console.error('Database error in getAll:', error);
			// Return empty array during build/error
			return [];
		}
	},

	getById: async (id: EntityId) => {
		try {
			const employees = await sql`
				SELECT 
					p.id,
					p.full_name as name,
					r.name as role,
					'active' as status,
					p.created_at as "hireDate",
					p.updated_at as "updatedAt"
				FROM profiles p
				JOIN user_roles ur ON p.id = ur.profile_id
				JOIN roles r ON ur.role_id = r.id
				WHERE r.name IN ('employee', 'supervisor') AND p.id = ${id}
			`;

			if (employees.length === 0) return undefined;

			const emp = employees[0];
			return {
				id: emp.id,
				firstName: emp.name?.split(' ')[0] || '',
				lastName: emp.name?.split(' ').slice(1).join(' ') || '',
				displayName: emp.name || '',
				email:
					emp.email ||
					`${emp.name?.toLowerCase().replace(' ', '.') || 'employee'}@jjlandscaping.com`,
				phone: '+1-555-0101',
				role: emp.role || 'employee',
				status: emp.status || 'active',
				hireDate: emp.hireDate || new Date().toISOString(),
				availability: {
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: [],
				},
				completedJobsCount: 0,
				totalHoursWorked: 0,
				assignedJobIds: [],
				supervisedJobIds: [],
				rating: 4.5,
				department: 'General',
				createdAt: emp.hireDate || new Date().toISOString(),
				updatedAt: emp.updatedAt || emp.hireDate || new Date().toISOString(),
			};
		} catch (error) {
			console.error('Database error in getById:', error);
			return undefined;
		}
	},

	getByStatus: async (status: EmployeeStatus) => {
		const employees = await employeeService.getAll();
		return employees;
	},

	create: async (employee) => {
		throw new Error('Create operation not implemented - use admin dashboard');
	},

	update: async (id, updates) => {
		throw new Error('Update operation not implemented - use admin dashboard');
	},

	delete: async (id) => {
		throw new Error('Delete operation not implemented - use admin dashboard');
	},
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAllEmployees = () => employeeService.getAll();
export const getEmployeeById = (id: EntityId) => employeeService.getById(id);
export const getEmployeesByStatus = (status: EmployeeStatus) =>
	employeeService.getByStatus(status);
export const createEmployee = (
	employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
) => employeeService.create(employee);
export const updateEmployee = (id: EntityId, updates: Partial<Employee>) =>
	employeeService.update(id, updates);
export const deleteEmployee = (id: EntityId) => employeeService.delete(id);

// ============================================================================
// Additional Functions Needed by EmployeeList
// ============================================================================

/**
 * Get employee statistics (counts by status)
 */
export const getEmployeeStats = async () => {
	const employees = await getAllEmployees();

	return {
		total: employees.length,
		active: employees.filter((e) => e.status === 'active').length,
		pending: employees.filter((e) => (e.status as string) === 'pending').length,
		inactive: employees.filter((e) => (e.status as string) === 'inactive')
			.length,
	};
};

/**
 * Get employee assignments (jobs they're working on)
 */
export const getEmployeeAssignments = async (employeeId: string) => {
	try {
		// Try to fetch from database first
		const assignments = await sql`
			SELECT 
				ja.id,
				ja.job_id as "jobId",
				j.job_number as "jobNumber",
				j.title as "jobTitle",
				ja.status,
				ja.assigned_at as "assignedAt"
			FROM job_assignments ja
			JOIN jobs j ON ja.job_id = j.id
			WHERE ja.employee_id = ${employeeId}
			ORDER BY ja.assigned_at DESC
		`;

		return assignments.map((assignment: any) => ({
			jobId: assignment.jobId,
			jobNumber: assignment.jobNumber,
			jobTitle: assignment.jobTitle,
			status: assignment.status,
			assignedAt: assignment.assignedAt,
		}));
	} catch (error) {
		console.error(
			'Failed to fetch assignments from DB, using mock data:',
			error,
		);

		// Fallback to mock data if table doesn't exist yet
		return [
			{
				jobId: 'job1',
				jobNumber: 'JOB-2024-001',
				jobTitle: 'Commercial Landscaping - Downtown',
				status: 'in_progress',
				assignedAt: new Date().toISOString(),
			},
			{
				jobId: 'job2',
				jobNumber: 'JOB-2024-002',
				jobTitle: 'Residential Maintenance - Smith Residence',
				status: 'pending',
				assignedAt: new Date().toISOString(),
			},
		];
	}
};

/**
 * Update user status (alias for updateEmployee with just status)
 */
export const updateUserStatus = async (id: string, status: string) => {
	return updateEmployee(id, { status: status as EmployeeStatus });
};

/**
 * Get all users (alias for getAllEmployees for backward compatibility)
 */
export const getAllUsers = getAllEmployees;

// Export as getEmployees for backward compatibility with workerService
export const getEmployees = () => employeeService.getAll();
