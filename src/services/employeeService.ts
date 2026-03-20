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

const isBuildTime =
	process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

if (!process.env.DATABASE_URL) {
	console.warn(
		'⚠️ DATABASE_URL environment variable is not set. Using mock data mode.',
	);
	sql = async () => [];
} else {
	try {
		const { neon } = require('@neondatabase/serverless');
		sql = neon(process.env.DATABASE_URL);
	} catch (error) {
		console.error('Failed to initialize database:', error);
		sql = async () => [];
	}
}

// ============================================================================
// Service Interface
// ============================================================================

export interface EmployeeService {
	getAll(): Promise<Employee[]>;
	getById(id: EntityId): Promise<Partial<Employee> | undefined>;
	getByStatus(status: EmployeeStatus): Promise<Employee[]>;
	create(
		employee: any, // Using any here to accept the extended form payload without TS errors
		currentUserId: string,
	): Promise<Employee>;
	update(id: EntityId, updates: any): Promise<Partial<Employee> | undefined>;
	delete(id: EntityId): Promise<boolean>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const getCurrentUserId = async (): Promise<string> => {
	const result = await sql`
        SELECT id FROM "User"
        WHERE role = 'admin'
        LIMIT 1
    `;
	if (!result.length) throw new Error('No admin user found');
	return result[0].id;
};

export const employeeService: EmployeeService = {
	getAll: async () => {
		try {
			// MATCHES SCHEMA EXACTLY: Joined through "User" -> profiles -> employee_details
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
                    ed.hourly_rate_cents / 100.0 as "hourlyRate",
                    u.created_at as "createdAt",
                    u.updated_at as "updatedAt",
                    u.created_by as "createdBy",
                    u.updated_by as "updatedBy"
                FROM "User" u
                JOIN profiles p ON u.id = p.user_id
                JOIN employee_details ed ON p.id = ed.profile_id
                WHERE u.role IN ('worker', 'supervisor', 'admin')
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
				hourlyRate: emp.hourlyRate ? Number(emp.hourlyRate) : undefined,
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
                    ed.hourly_rate_cents / 100.0 as "hourlyRate",
                    u.created_at as "createdAt",
                    u.updated_at as "updatedAt",
                    u.created_by as "createdBy",
                    u.updated_by as "updatedBy"
                FROM "User" u
                JOIN profiles p ON u.id = p.user_id
                JOIN employee_details ed ON p.id = ed.profile_id
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
				hourlyRate: emp.hourlyRate ? Number(emp.hourlyRate) : undefined,
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
			const fullName =
				employee.displayName ||
				`${employee.firstName} ${employee.lastName}`.trim();

			// 1. Create User
			const userResult = await sql`
                INSERT INTO "User" (name, email, role, created_by, updated_by)
                VALUES (${fullName}, ${employee.email}, ${employee.role}, ${currentUserId}, ${currentUserId})
                RETURNING id
            `;
			const userId = userResult[0].id;

			// 2. Create Profile
			const profileResult = await sql`
                INSERT INTO profiles (user_id, full_name, created_by)
                VALUES (${userId}, ${fullName}, ${currentUserId})
                RETURNING id
            `;
			const profileId = profileResult[0].id;

			// 3. Generate Employee Number
			const seq =
				await sql`SELECT COUNT(*)::int + 1 as next FROM employee_details`;
			const employeeNumber =
				employee.employeeNumber ||
				`EMP-${String(seq[0].next).padStart(4, '0')}`;

			// 4. Create Employee Details (Safely removed non-existent certifications column)
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
                    ${employee.hourlyRate ? Math.round(Number(employee.hourlyRate) * 100) : null},
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
			};
		} catch (error) {
			console.error('Create failed:', error);
			throw error;
		}
	},

	update: async (id, updates) => {
		const currentUserId = await getCurrentUserId();

		try {
			// Update User & Profiles if name changes
			if (updates.displayName || updates.firstName || updates.lastName) {
				const newName =
					updates.displayName ||
					`${updates.firstName} ${updates.lastName}`.trim();

				await sql`
                    UPDATE "User"
                    SET name = ${newName}, updated_at = NOW(), updated_by = ${currentUserId}
                    WHERE id = ${id}
                `;

				await sql`
                    UPDATE profiles
                    SET full_name = ${newName}, updated_at = NOW()
                    WHERE user_id = ${id}
                `;
			}

			// Update Employee Details (Safely removed non-existent certifications column)
			await sql`
                UPDATE employee_details
                SET
                    employee_number = COALESCE(${updates.employeeNumber ?? null}, employee_number),
                    hire_date = COALESCE(${updates.hireDate ? updates.hireDate.split('T')[0] : null}, hire_date),
                    status = COALESCE(${updates.status ?? null}, status),
                    department = COALESCE(${updates.department ?? null}, department),
                    hourly_rate_cents = COALESCE(${updates.hourlyRate ? Math.round(Number(updates.hourlyRate) * 100) : null}, hourly_rate_cents),
                    updated_at = NOW(),
                    updated_by = ${currentUserId}
                WHERE profile_id = (SELECT id FROM profiles WHERE user_id = ${id})
            `;

			return updates;
		} catch (error) {
			console.error('Update failed:', error);
			throw error;
		}
	},

	delete: async (id) => {
		try {
			// Must delete in exact order due to Foreign Keys
			await sql`DELETE FROM employee_details WHERE profile_id = (SELECT id FROM profiles WHERE user_id = ${id})`;
			await sql`DELETE FROM profiles WHERE user_id = ${id}`;
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
export const createEmployee = (employee: any, currentUserId: string) =>
	employeeService.create(employee, currentUserId);
export const updateEmployee = (id: EntityId, updates: any) =>
	employeeService.update(id, updates);
export const deleteEmployee = (id: EntityId) => employeeService.delete(id);

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
            FROM employee_jobs ja
            JOIN jobs j ON ja.job_id = j.id
            WHERE ja.employee_id = (SELECT id FROM profiles WHERE user_id = ${employeeId})
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
