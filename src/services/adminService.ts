// src/services/adminService.ts
/**
 * Admin Service
 *
 * Service layer for admin-specific aggregations and summaries.
 */

import type { User } from '@/src/domain/models';
import {
	PaymentStatus,
	JobStatus,
	EmployeeStatus,
	Priority,
} from '@/src/domain/entities';

// ============================================================================
// Safe database connection
// ============================================================================

let sql: any;

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
// Types (defined locally, not imported)
// ============================================================================

export interface ActivityLog {
	id: string;
	type:
		| 'user_created'
		| 'job_created'
		| 'job_updated'
		| 'payment_received'
		| 'client_created'
		| 'employee_created';
	description: string;
	user?: string;
	timestamp: string;
	metadata?: Record<string, unknown>;
}

export interface PendingAction {
	id: string;
	type:
		| 'unassigned_job'
		| 'pending_approval'
		| 'overdue_payment'
		| 'pending_quote';
	title: string;
	description: string;
	priority: 'high' | 'medium' | 'low';
	link?: string;
}

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealthService {
	name: string;
	status: HealthStatus;
	lastCheck: string;
}

export interface SystemHealth {
	status: HealthStatus;
	uptime: number;
	activeConnections: number;
	services: SystemHealthService[];
}

export interface AdminStats {
	totalUsers: number;
	activeUsers: number;
	totalClients: number;
	activeClients: number;
	newClientsThisMonth: number;
	totalEmployees: number;
	activeEmployees: number;
	availableEmployees: number;
	totalTasks: number;
	pendingTasks: number;
	inProgressTasks: number;
	completedTasks: number;
	totalRevenue: number;
	revenueChangePercent: number;
	pendingRevenue: number;
	activeJobs: number;
	pendingJobs: number;
	completedJobs: number;
}

// ============================================================================
// Service Interface
// ============================================================================

export interface AdminService {
	getStats(): Promise<AdminStats>;
	getRevenueHistory(
		months?: number,
	): Promise<Array<{ month: string; revenue: number }>>;
	getRecentActivity(limit?: number): Promise<ActivityLog[]>;
	getPendingActions(): Promise<PendingAction[]>;
	getRecentUsers(limit?: number): Promise<User[]>;
	getSystemHealth(): Promise<SystemHealth>;
}

// ============================================================================
// Service Implementation
// ============================================================================

export const adminService: AdminService = {
	getStats: async () => {
		try {
			console.log('🔵 AdminService: Fetching stats from database...');

			const [
				usersResult,
				clientsResult,
				employeesResult,
				jobsResult,
				paymentsResult,
			] = await Promise.all([
				sql`SELECT p.id, p.status, p.created_at FROM profiles p`,
				sql`SELECT c.id, c.created_at FROM clients c`,
				sql`SELECT p.id, p.status 
            FROM profiles p
            JOIN user_roles ur ON p.id = ur.profile_id 
            JOIN roles r ON ur.role_id = r.id 
            WHERE r.name IN ('employee', 'supervisor')`,
				sql`SELECT j.id, j.status, j.created_at FROM jobs j`,
				sql`SELECT py.id, py.amount_cents, py.status, py.updated_at as completed_at, py.created_at FROM payments py`,
			]);

			const now = new Date();
			const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
			const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

			// Calculate new clients this month
			const newClientsThisMonth = clientsResult.filter((c: any) => {
				const createdAt = new Date(c.created_at);
				return createdAt >= thisMonth;
			}).length;

			// Calculate revenue change
			const thisMonthPayments = paymentsResult.filter((p: any) => {
				if (p.completed_at && p.status === PaymentStatus.COMPLETED) {
					const completed = new Date(p.completed_at);
					return completed >= thisMonth;
				}
				return false;
			});

			const lastMonthPayments = paymentsResult.filter((p: any) => {
				if (p.completed_at && p.status === PaymentStatus.COMPLETED) {
					const completed = new Date(p.completed_at);
					return completed >= lastMonth && completed <= lastMonthEnd;
				}
				return false;
			});

			const thisMonthRevenue = thisMonthPayments.reduce(
				(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
				0,
			);
			const lastMonthRevenue = lastMonthPayments.reduce(
				(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
				0,
			);
			const revenueChangePercent =
				lastMonthRevenue > 0
					? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
					: 0;

			const completedPayments = paymentsResult.filter(
				(p: any) => p.status === PaymentStatus.COMPLETED,
			);
			const pendingPayments = paymentsResult.filter(
				(p: any) => p.status === PaymentStatus.PENDING,
			);

			const activeJobs = jobsResult.filter(
				(j: any) =>
					j.status === JobStatus.SCHEDULED ||
					j.status === JobStatus.IN_PROGRESS,
			).length;

			const pendingJobs = jobsResult.filter(
				(j: any) =>
					j.status === JobStatus.DRAFT || j.status === JobStatus.QUOTED,
			).length;

			const completedJobs = jobsResult.filter(
				(j: any) => j.status === JobStatus.COMPLETED,
			).length;

			const availableEmployees = employeesResult.filter(
				(e: any) => e.status === EmployeeStatus.ACTIVE,
			).length;

			const stats = {
				totalUsers: usersResult.length,
				activeUsers: usersResult.filter((u: any) => u.status === 'ACTIVE')
					.length,
				totalClients: clientsResult.length,
				activeClients: clientsResult.length,
				newClientsThisMonth,
				totalEmployees: employeesResult.length,
				activeEmployees: employeesResult.filter(
					(e: any) => e.status === EmployeeStatus.ACTIVE,
				).length,
				availableEmployees,
				totalTasks: 0,
				pendingTasks: 0,
				inProgressTasks: 0,
				completedTasks: 0,
				totalRevenue: completedPayments.reduce(
					(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
					0,
				),
				revenueChangePercent: Math.round(revenueChangePercent * 10) / 10,
				pendingRevenue: pendingPayments.reduce(
					(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
					0,
				),
				activeJobs,
				pendingJobs,
				completedJobs,
			};

			console.log('🔵 AdminService: Stats calculated:', stats);
			return stats;
		} catch (error) {
			console.error('🔴 AdminService: Error fetching stats:', error);
			throw error;
		}
	},

	getRevenueHistory: async (months = 6) => {
		try {
			console.log(
				`🔵 AdminService: Fetching revenue history for last ${months} months`,
			);

			const payments = await sql`
        SELECT py.amount_cents, py.updated_at as completed_at 
        FROM payments py 
        WHERE py.status = ${PaymentStatus.COMPLETED} 
        AND py.updated_at IS NOT NULL
        ORDER BY py.updated_at ASC
      `;

			const history: Array<{ month: string; revenue: number }> = [];
			const now = new Date();

			for (let i = months - 1; i >= 0; i--) {
				const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
				const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

				const monthPayments = payments.filter((p: any) => {
					const completed = new Date(p.completed_at);
					return completed >= date && completed < nextDate;
				});

				const revenue = monthPayments.reduce(
					(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
					0,
				);

				history.push({
					month: date.toLocaleDateString('en-US', {
						month: 'short',
						year: 'numeric',
					}),
					revenue,
				});
			}

			return history;
		} catch (error) {
			console.error('🔴 AdminService: Error fetching revenue history:', error);
			throw error;
		}
	},

	getRecentActivity: async (limit = 10) => {
		try {
			console.log(`🔵 AdminService: Fetching recent activity, limit: ${limit}`);

			const [recentUsers, recentClients, recentJobs, recentPayments] =
				await Promise.all([
					sql`
          SELECT p.id, p.full_name as name, r.name as role, p.created_at as "joinDate"
          FROM profiles p
          LEFT JOIN user_roles ur ON p.id = ur.profile_id
          LEFT JOIN roles r ON ur.role_id = r.id
          ORDER BY p.created_at DESC 
          LIMIT 3
        `,
					sql`
          SELECT c.id, c.name, c.created_at 
          FROM clients c 
          ORDER BY c.created_at DESC 
          LIMIT 2
        `,
					sql`
          SELECT j.id, j.title, j.created_at 
          FROM jobs j 
          ORDER BY j.created_at DESC 
          LIMIT 3
        `,
					sql`
          SELECT py.id, py.amount_cents, py.updated_at as completed_at 
          FROM payments py
          WHERE py.status = ${PaymentStatus.COMPLETED} 
          AND py.updated_at IS NOT NULL
          ORDER BY py.updated_at DESC
          LIMIT 2
        `,
				]);

			const activities: ActivityLog[] = [];

			recentUsers.forEach((user: any) => {
				activities.push({
					id: `activity-user-${user.id}`,
					type: 'user_created',
					description: `New user ${user.name} (${user.role || 'user'}) joined`,
					user: user.name,
					timestamp: user.joinDate,
				});
			});

			recentClients.forEach((client: any) => {
				activities.push({
					id: `activity-client-${client.id}`,
					type: 'client_created',
					description: `New client ${client.name} added`,
					user: client.name,
					timestamp: client.created_at,
				});
			});

			recentJobs.forEach((job: any) => {
				activities.push({
					id: `activity-job-${job.id}`,
					type: 'job_created',
					description: `Job "${job.title}" created`,
					timestamp: job.created_at,
					metadata: { jobId: job.id },
				});
			});

			recentPayments.forEach((payment: any) => {
				activities.push({
					id: `activity-payment-${payment.id}`,
					type: 'payment_received',
					description: `Payment of $${((payment.amount_cents || 0) / 100).toFixed(2)} received`,
					timestamp: payment.completed_at,
					metadata: { paymentId: payment.id },
				});
			});

			return activities
				.sort(
					(a, b) =>
						new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
				)
				.slice(0, limit);
		} catch (error) {
			console.error('🔴 AdminService: Error fetching recent activity:', error);
			throw error;
		}
	},

	getPendingActions: async () => {
		try {
			console.log('🔵 AdminService: Fetching pending actions...');

			const [unassignedJobs, overduePayments, pendingQuotes] =
				await Promise.all([
					sql`
          SELECT j.id, j.title 
          FROM jobs j 
          WHERE NOT EXISTS (
            SELECT 1 FROM employee_jobs ej 
            WHERE ej.job_id = j.id
          )
          AND j.status != ${JobStatus.COMPLETED}
          ORDER BY j.created_at DESC
          LIMIT 3
        `,
					sql`
          SELECT py.id, py.amount_cents, py.created_at 
          FROM payments py 
          WHERE py.status = ${PaymentStatus.PENDING}
          AND py.created_at < NOW() - INTERVAL '30 days'
          ORDER BY py.created_at DESC
          LIMIT 2
        `,
					sql`
          SELECT COUNT(*) as count 
          FROM jobs j 
          WHERE j.status = ${JobStatus.QUOTED}
        `,
				]);

			const actions: PendingAction[] = [];

			unassignedJobs.forEach((job: any) => {
				actions.push({
					id: `action-unassigned-${job.id}`,
					type: 'unassigned_job',
					title: `Unassigned Job: ${job.title}`,
					description: `Job needs to be assigned to an employee`,
					priority: 'medium', // Default priority
					link: `/admin/jobs/${job.id}`,
				});
			});

			overduePayments.forEach((payment: any) => {
				actions.push({
					id: `action-overdue-${payment.id}`,
					type: 'overdue_payment',
					title: `Overdue Payment: $${((payment.amount_cents || 0) / 100).toFixed(2)}`,
					description: `Payment is past due date`,
					priority: 'high',
					link: `/admin/payments/${payment.id}`,
				});
			});

			const quoteCount = parseInt(pendingQuotes[0]?.count || '0');
			if (quoteCount > 0) {
				actions.push({
					id: `action-quotes-${Date.now()}`,
					type: 'pending_quote',
					title: `${quoteCount} Pending Quote(s)`,
					description: `Quotes awaiting client approval`,
					priority: 'medium',
					link: `/admin/quotes`,
				});
			}

			return actions.sort((a, b) => {
				const priorityOrder = { high: 0, medium: 1, low: 2 };
				return priorityOrder[a.priority] - priorityOrder[b.priority];
			});
		} catch (error) {
			console.error('🔴 AdminService: Error fetching pending actions:', error);
			throw error;
		}
	},

	getRecentUsers: async (limit = 10) => {
		try {
			const users = await sql`
        SELECT p.* 
        FROM profiles p 
        ORDER BY p.created_at DESC 
        LIMIT ${limit}
      `;
			return users;
		} catch (error) {
			console.error('🔴 AdminService: Error fetching recent users:', error);
			throw error;
		}
	},

	getSystemHealth: async () => {
		try {
			console.log('🔵 AdminService: Fetching system health...');

			await sql`SELECT 1`;

			const connections = await sql`
      SELECT count(*)::int as count 
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;

			const activeConnections = connections[0]?.count || 0;

			return {
				status: 'healthy',
				uptime: process.uptime ? process.uptime() : 0, // Check if function exists
				activeConnections,
				services: [
					{
						name: 'API Server',
						status: 'healthy',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Database',
						status: 'healthy',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Payment Gateway',
						status: 'healthy',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Email Service',
						status: 'warning',
						lastCheck: new Date(Date.now() - 300000).toISOString(),
					},
				],
			};
		} catch (error) {
			console.error('🔴 AdminService: Database health check failed:', error);

			return {
				status: 'critical',
				uptime: 0, // Default to 0 on client
				activeConnections: 0,
				services: [
					{
						name: 'API Server',
						status: 'warning',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Database',
						status: 'critical',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Payment Gateway',
						status: 'warning',
						lastCheck: new Date().toISOString(),
					},
					{
						name: 'Email Service',
						status: 'warning',
						lastCheck: new Date().toISOString(),
					},
				],
			};
		}
	},
};

// ============================================================================
// Convenience Functions
// ============================================================================

export const getAdminStats = () => adminService.getStats();
export const getRevenueHistory = (months?: number) =>
	adminService.getRevenueHistory(months);
export const getRecentActivity = (limit?: number) =>
	adminService.getRecentActivity(limit);
export const getPendingActions = () => adminService.getPendingActions();
export const getRecentUsers = (limit?: number) =>
	adminService.getRecentUsers(limit);
export const getSystemHealth = () => adminService.getSystemHealth();
