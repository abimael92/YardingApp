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
	getById(id: EntityId): Promise<Partial<Employee> | undefined>;
	getByStatus(status: EmployeeStatus): Promise<Employee[]>;
	create(
		employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>,
		currentUserId: string,
	): Promise<Employee>;
	update(
		id: EntityId,
		updates: Partial<Employee>,
	): Promise<Partial<Employee> | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

// Get current user ID - you need to pass this from auth context
export const getCurrentUserId = async (): Promise<string> => {
	const result = await sql`
    SELECT id
    FROM "User"
    WHERE role = 'admin'
    ORDER BY created_at DESC
    LIMIT 1
  `;

	if (!result.length) throw new Error('No admin user found');

	return result[0].id;
};

export const employeeService: EmployeeService = {
	getAll: async () => {
		try {
			const employees = await sql`
			SELECT 
				u.id,
				u.name,
				u.email,
				u.role,
				ed.status,
				ed.department,
				ed.employee_number as "employeeNumber",
				ed.hire_date as "hireDate",
				ed.hourly_rate_cents / 100 as "hourlyRate",
				u.created_at as "createdAt",
				u.updated_at as "updatedAt",
				u.created_by as "createdBy",
				u.updated_by as "updatedBy"
			FROM "User" u
			LEFT JOIN employee_details ed ON u.id = ed.profile_id
			WHERE u.role IN ('worker', 'supervisor')
			ORDER BY u.name
		`;

			return employees.map((emp: any) => ({
				id: emp.id,
				firstName: emp.name?.split(' ')[0] || '',
				lastName: emp.name?.split(' ').slice(1).join(' ') || '',
				displayName: emp.name || '',
				email: emp.email || '',
				phone: '',
				role: emp.role || 'worker',
				status: emp.status || 'active',
				hireDate: emp.hireDate || new Date().toISOString(),
				employeeNumber: emp.employeeNumber,
				department: emp.department,
				hourlyRate: emp.hourlyRate,
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
				noteIds: [],
				activityLogIds: [],
				reminderIds: [],
				createdAt: emp.createdAt || new Date().toISOString(),
				updatedAt: emp.updatedAt || new Date().toISOString(),
				createdBy: emp.createdBy,
				updatedBy: emp.updatedBy,
			}));
		} catch (error) {
			console.error('Database error in getAll:', error);
			return [];
		}
	},

	getById: async (id: EntityId) => {
		try {
			const employees = await sql`
			SELECT 
				u.id,
				u.name,
				u.email,
				u.role,
				ed.status,
				ed.department,
				ed.employee_number as "employeeNumber",
				ed.hire_date as "hireDate",
				ed.hourly_rate_cents / 100 as "hourlyRate",
				u.created_at as "createdAt",
				u.updated_at as "updatedAt",
				u.created_by as "createdBy",
				u.updated_by as "updatedBy"
			FROM "User" u
			LEFT JOIN employee_details ed ON u.id = ed.profile_id
			WHERE u.id = ${id}
		`;

			if (employees.length === 0) return undefined;

			const emp = employees[0];
			return {
				id: emp.id,
				firstName: emp.name?.split(' ')[0] || '',
				lastName: emp.name?.split(' ').slice(1).join(' ') || '',
				displayName: emp.name || '',
				email: emp.email || '',
				phone: '',
				role: emp.role || 'worker',
				status: emp.status || 'active',
				hireDate: emp.hireDate || new Date().toISOString(),
				employeeNumber: emp.employeeNumber,
				department: emp.department,
				hourlyRate: emp.hourlyRate,
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
				noteIds: [],
				activityLogIds: [],
				reminderIds: [],
				createdAt: emp.createdAt || new Date().toISOString(),
				updatedAt: emp.updatedAt || new Date().toISOString(),
				createdBy: emp.createdBy,
				updatedBy: emp.updatedBy,
			};
		} catch (error) {
			console.error('Database error in getById:', error);
			return undefined;
		}
	},

	getByStatus: async (status: EmployeeStatus) => {
		const employees = await employeeService.getAll();
		return employees.filter((e) => e.status === status);
	},

	create: async (employee, currentUserId: string) => {

		try {
			// 1. create user
			const userResult = await sql`
      INSERT INTO "User" (
        name,
        email,
        role,
        created_by,
        updated_by
      )
      VALUES (
        ${employee.displayName},
        ${employee.email},
        ${employee.role},
        ${currentUserId},
        ${currentUserId}
      )
      RETURNING id
    `;

			const userId = userResult[0].id;

			// 2. create profile (required for FK)
			const profileResult = await sql`
      INSERT INTO profiles (
        user_id
      )
      VALUES (
        ${userId}
      )
      RETURNING id
    `;

			const profileId = profileResult[0].id;

			// 3. employee number
			const seq = await sql`
      SELECT COUNT(*)::int + 1 as next
      FROM employee_details
    `;

			const employeeNumber = `EMP-${String(seq[0].next).padStart(4, '0')}`;

			// 4. employee details
			await sql`
      INSERT INTO employee_details (
        profile_id,
        employee_number,
        hire_date,
        status,
        department,
        hourly_rate_cents,
        created_by,
        updated_by
      )
      VALUES (
        ${profileId},
        ${employeeNumber},
        ${employee.hireDate ? employee.hireDate.split('T')[0] : new Date().toISOString().split('T')[0]},
        ${employee.status || 'active'},
        ${employee.department || null},
        ${employee.hourlyRate ? Math.round(employee.hourlyRate * 100) : 0},
        ${currentUserId},
        ${currentUserId}
      )
    `;

			return {
				...employee,
				id: userId,
				employeeNumber,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				createdBy: currentUserId,
				updatedBy: currentUserId,
				availability: employee.availability ?? {
					monday: [],
					tuesday: [],
					wednesday: [],
					thursday: [],
					friday: [],
					saturday: [],
					sunday: [],
				},
				completedJobsCount: employee.completedJobsCount ?? 0,
				totalHoursWorked: employee.totalHoursWorked ?? 0,
				assignedJobIds: employee.assignedJobIds ?? [],
				supervisedJobIds: employee.supervisedJobIds ?? [],
				noteIds: employee.noteIds ?? [],
				activityLogIds: employee.activityLogIds ?? [],
				reminderIds: employee.reminderIds ?? [],
			};
		} catch (error) {
			console.error('Create failed:', error);
			throw error;
		}
	},

	update: async (id, updates) => {
		const currentUserId = getCurrentUserId();

		try {
			if (updates.displayName) {
				await sql`
        UPDATE "User"
        SET
          name = ${updates.displayName},
          updated_at = NOW(),
          updated_by = ${currentUserId}
        WHERE id = ${id}
      `;
			}

			await sql`
      UPDATE employee_details
      SET
        employee_number = COALESCE(${updates.employeeNumber ?? null}, employee_number),
        hire_date = COALESCE(${updates.hireDate ? updates.hireDate.split('T')[0] : null}, hire_date),
        status = COALESCE(${updates.status ?? null}, status),
        department = COALESCE(${updates.department ?? null}, department),
        hourly_rate_cents = COALESCE(${updates.hourlyRate ? Math.round(updates.hourlyRate * 100) : null}, hourly_rate_cents),
        updated_at = NOW(),
        updated_by = ${currentUserId}
      WHERE profile_id = ${id}
    `;

			const updated = await sql`
      SELECT
        u.created_at as "createdAt",
        u.updated_at as "updatedAt",
        u.created_by as "createdBy",
        u.updated_by as "updatedBy"
      FROM "User" u
      WHERE u.id = ${id}
    `;

			return {
				...updates,
				createdAt: updated[0]?.createdAt,
				updatedAt: updated[0]?.updatedAt,
				createdBy: updated[0]?.createdBy,
				updatedBy: updated[0]?.updatedBy,
			};
		} catch (error) {
			console.error('Update failed:', error);
			throw error;
		}
	},

	delete: async (id) => {
		try {
			await sql`DELETE FROM employee_details WHERE profile_id = ${id}`;
			await sql`DELETE FROM "User" WHERE id = ${id}`;
			return true;
		} catch (error) {
			console.error('Delete failed:', error);
			return false;
		}
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
	currentUserId: string,
) => employeeService.create(employee, currentUserId);
export const updateEmployee = (id: EntityId, updates: Partial<Employee>) =>
	employeeService.update(id, updates);
export const deleteEmployee = (id: EntityId) => employeeService.delete(id);

// ============================================================================
// Additional Functions Needed by EmployeeList
// ============================================================================

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

export const getEmployeeAssignments = async (employeeId: string) => {
	try {
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
		console.error('Failed to fetch assignments:', error);
		return [];
	}
};

export const updateUserStatus = async (id: string, status: string) => {
	return updateEmployee(id, { status: status as EmployeeStatus });
};

export const getAllUsers = getAllEmployees;
export const getEmployees = () => employeeService.getAll();
