/**
 * User Service
 *
 * Service layer for user management operations.
 */

import { neon } from '@neondatabase/serverless';
import type { User, JobAssignment } from '@/src/domain/models';

// ============================================================================
// Service Interface (API-ready)
// ============================================================================

export interface UserService {
	getAll(): Promise<User[]>;
	getById(id: string): Promise<User | undefined>;
	getByRole(role: User['role']): Promise<User[]>;
	getByStatus(status: User['status']): Promise<User[]>;
	create(user: Omit<User, 'id' | 'joinDate'>): Promise<User>;
	update(id: string, updates: Partial<User>): Promise<User | undefined>;
	delete(id: string): Promise<boolean>;
	// New boss management methods
	updateStatus(id: string, status: User['status']): Promise<User | undefined>;
	getEmployeeAssignments(id: string): Promise<JobAssignment[]>;
	getDashboardStats(): Promise<EmployeeStats>;
}

export interface EmployeeStats {
	total: number;
	active: number;
	pending: number;
	inactive: number;
	available: number;
	busy: number;
	jobsInProgress: number;
	jobsCompleted: number;
}

// ============================================================================
// Service Implementation
// ============================================================================

const sql = neon(process.env.DATABASE_URL!);

export const userService: UserService = {
	getAll: async () => {
		console.log('🚀 Starting getAll...');

		try {
			const users = await sql`
      SELECT 
        p.id,
        p.full_name as name,
        p.status,
        p.created_at as "joinDate",
        ed.employee_number as "employeeNumber",
        ed.department,
        ed.position,
        ed.hourly_rate_cents as "hourlyRate",
        CASE 
          WHEN r.name = 'employee' THEN 'Worker'
          WHEN r.name = 'supervisor' THEN 'Supervisor'
          WHEN r.name = 'admin' THEN 'Admin'
          WHEN r.name = 'client' THEN 'Client'
          ELSE r.name
        END as role,
        (
          SELECT json_agg(json_build_object(
            'jobId', ej.job_id,
            'jobNumber', j.job_number,
            'jobTitle', j.title,
            'status', ej.status,
            'assignedAt', ej.assigned_at
          ))
          FROM employee_jobs ej
          JOIN jobs j ON ej.job_id = j.id
          WHERE ej.employee_id = p.id
        ) as "assignedJobs"
      FROM profiles p
      LEFT JOIN employee_details ed ON p.id = ed.profile_id
      JOIN user_roles ur ON p.id = ur.profile_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name IN ('employee', 'supervisor')
      ORDER BY p.full_name
    `;

			console.log('📊 Raw SQL Result:', JSON.stringify(users, null, 2));
			console.log('📊 Number of users:', users?.length);

			if (!users || users.length === 0) {
				console.log('❌ No users returned from query');
				return [];
			}

			const mappedUsers = users.map((user) => {
				console.log('🔄 Mapping user:', user.name, 'Raw role:', user.role);

				const status: 'Active' | 'Pending' | 'Inactive' =
					user.status === 'active'
						? 'Active'
						: user.status === 'pending'
							? 'Pending'
							: 'Inactive';

				return {
					id: user.id,
					name: user.name,
					email:
						user.email ||
						`${user.name?.toLowerCase().replace(' ', '.')}@example.com`,
					role: user.role, // Use directly from SQL
					status,
					joinDate: user.joinDate,
					employeeNumber: user.employeeNumber,
					department: user.department,
					position: user.position,
					hourlyRate: user.hourlyRate
						? Math.floor(user.hourlyRate / 100)
						: undefined,
					assignedJobs: user.assignedJobs || [],
				};
			});

			console.log('✅ Mapped users:', mappedUsers);
			return mappedUsers;
		} catch (error) {
			console.error('💥 Error in getAll:', error);
			throw error;
		}
	},

	getById: async (id: string) => {
		const users = await sql`
      SELECT 
        p.id,
        p.full_name as name,
        p.email,
        p.status,
        p.created_at as "joinDate",
        ed.employee_number as "employeeNumber",
        ed.department,
        ed.position,
        ed.hourly_rate_cents as "hourlyRate",
        CASE 
          WHEN r.name = 'employee' THEN 'Worker'
          WHEN r.name = 'supervisor' THEN 'Supervisor'
          WHEN r.name = 'admin' THEN 'Admin'
          WHEN r.name = 'client' THEN 'Client'
          ELSE r.name
        END as role,
        (
          SELECT json_agg(json_build_object(
            'jobId', ej.job_id,
            'jobNumber', j.job_number,
            'jobTitle', j.title,
            'status', ej.status,
            'assignedAt', ej.assigned_at
          ))
          FROM employee_jobs ej
          JOIN jobs j ON ej.job_id = j.id
          WHERE ej.employee_id = p.id
        ) as "assignedJobs"
      FROM profiles p
      LEFT JOIN employee_details ed ON p.id = ed.profile_id
      JOIN user_roles ur ON p.id = ur.profile_id
      JOIN roles r ON ur.role_id = r.id
      WHERE p.id = ${id}
    `;

		if (users.length === 0) return undefined;

		const user = users[0];
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			status:
				user.status === 'active'
					? 'Active'
					: user.status === 'pending'
						? 'Pending'
						: 'Inactive',
			joinDate: user.joinDate,
			employeeNumber: user.employeeNumber,
			department: user.department,
			position: user.position,
			hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : undefined,
			assignedJobs: user.assignedJobs || [],
		};
	},

	getByRole: async (role: User['role']) => {
		const dbRole =
			role === 'Worker'
				? 'employee'
				: role === 'Supervisor'
					? 'supervisor'
					: role === 'Admin'
						? 'admin'
						: role === 'Client'
							? 'client'
							: 'employee';

		const users = await sql`
      SELECT 
        p.id,
        p.full_name as name,
        p.email,
        p.status,
        p.created_at as "joinDate",
        ed.employee_number as "employeeNumber",
        ed.department,
        ed.position,
        ed.hourly_rate_cents as "hourlyRate",
        CASE 
          WHEN r.name = 'employee' THEN 'Worker'
          WHEN r.name = 'supervisor' THEN 'Supervisor'
          WHEN r.name = 'admin' THEN 'Admin'
          WHEN r.name = 'client' THEN 'Client'
          ELSE r.name
        END as role
      FROM profiles p
      LEFT JOIN employee_details ed ON p.id = ed.profile_id
      JOIN user_roles ur ON p.id = ur.profile_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.name = ${dbRole}
      ORDER BY p.full_name
    `;

		return users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			status: user.status,
			joinDate: user.joinDate,
			employeeNumber: user.employeeNumber,
			department: user.department,
			position: user.position,
			hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : undefined,
		}));
	},

	getByStatus: async (status: User['status']) => {
		const dbStatus = status.toLowerCase();
		const users = await sql`
      SELECT 
        p.id,
        p.full_name as name,
        p.email,
        p.status,
        p.created_at as "joinDate",
        ed.employee_number as "employeeNumber",
        ed.department,
        ed.position,
        ed.hourly_rate_cents as "hourlyRate",
        CASE 
          WHEN r.name = 'employee' THEN 'Worker'
          WHEN r.name = 'supervisor' THEN 'Supervisor'
          WHEN r.name = 'admin' THEN 'Admin'
          WHEN r.name = 'client' THEN 'Client'
          ELSE r.name
        END as role
      FROM profiles p
      LEFT JOIN employee_details ed ON p.id = ed.profile_id
      JOIN user_roles ur ON p.id = ur.profile_id
      JOIN roles r ON ur.role_id = r.id
      WHERE p.status = ${dbStatus}::user_status
      ORDER BY p.full_name
    `;

		return users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			status: user.status,
			joinDate: user.joinDate,
			employeeNumber: user.employeeNumber,
			department: user.department,
			position: user.position,
			hourlyRate: user.hourlyRate ? user.hourlyRate / 100 : undefined,
		}));
	},

	updateStatus: async (id: string, status: User['status']) => {
		const dbStatus = status.toLowerCase();
		const updated = await sql`
      UPDATE profiles 
      SET status = ${dbStatus}::user_status, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

		if (updated.length === 0) return undefined;

		// Return the updated user
		return userService.getById(id);
	},

	getEmployeeAssignments: async (id: string): Promise<JobAssignment[]> => {
		const assignments = await sql`
      SELECT 
        ej.job_id as "jobId",
        j.job_number as "jobNumber",
        j.title as "jobTitle",
        ej.status,
        ej.assigned_at as "assignedAt"
      FROM employee_jobs ej
      JOIN jobs j ON ej.job_id = j.id
      WHERE ej.employee_id = ${id}
      ORDER BY ej.assigned_at DESC
    `;

		return assignments as JobAssignment[];
	},

	getDashboardStats: async (): Promise<EmployeeStats> => {
		const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM profiles p 
         JOIN user_roles ur ON p.id = ur.profile_id 
         JOIN roles r ON ur.role_id = r.id 
         WHERE r.name IN ('employee', 'supervisor')) as total,
        (SELECT COUNT(*) FROM profiles p 
         JOIN user_roles ur ON p.id = ur.profile_id 
         JOIN roles r ON ur.role_id = r.id 
         WHERE r.name IN ('employee', 'supervisor') AND p.status = 'active') as active,
        (SELECT COUNT(*) FROM profiles p 
         JOIN user_roles ur ON p.id = ur.profile_id 
         JOIN roles r ON ur.role_id = r.id 
         WHERE r.name IN ('employee', 'supervisor') AND p.status = 'pending') as pending,
        (SELECT COUNT(*) FROM profiles p 
         JOIN user_roles ur ON p.id = ur.profile_id 
         JOIN roles r ON ur.role_id = r.id 
         WHERE r.name IN ('employee', 'supervisor') AND p.status = 'inactive') as inactive,
        (SELECT COUNT(DISTINCT employee_id) FROM employee_jobs WHERE status = 'assigned') as available,
        (SELECT COUNT(DISTINCT employee_id) FROM employee_jobs WHERE status != 'assigned' AND status != 'completed') as busy,
        (SELECT COUNT(*) FROM employee_jobs WHERE status = 'assigned') as "jobsInProgress",
        (SELECT COUNT(*) FROM employee_jobs WHERE status = 'completed') as "jobsCompleted"
    `;

		return stats[0] as EmployeeStats;
	},

	create: async (user) => {
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

export const getAllUsers = () => userService.getAll();
export const getUserById = (id: string) => userService.getById(id);
export const getUsersByRole = (role: User['role']) =>
	userService.getByRole(role);
export const getUsersByStatus = (status: User['status']) =>
	userService.getByStatus(status);
export const updateUserStatus = (id: string, status: User['status']) =>
	userService.updateStatus(id, status);
export const getEmployeeAssignments = (id: string) =>
	userService.getEmployeeAssignments(id);
export const getEmployeeStats = () => userService.getDashboardStats();
export const createUser = (user: Omit<User, 'id' | 'joinDate'>) =>
	userService.create(user);
export const updateUser = (id: string, updates: Partial<User>) =>
	userService.update(id, updates);
export const deleteUser = (id: string) => userService.delete(id);
