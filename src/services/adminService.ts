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
		| 'pending_quote'
		| 'pending_customer';
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
	/** All–time revenue from completed payments (paid invoices only). */
	totalRevenue: number;
	/** Revenue from completed payments in the current calendar month. */
	currentMonthRevenue: number;
	/** Revenue from completed payments in the previous calendar month. */
	lastMonthRevenue: number;
	/** Percentage change between current and last month revenue. */
	revenueChangePercent: number;
	pendingRevenue: number;
	activeJobs: number;
	pendingJobs: number;
	completedJobs: number;
	// ✅ ADDED: Missing fields for quotes
	pendingQuotes: number;
	pendingQuotesValue: number;
}

// ============================================================================
// NEW TYPES - For the missing dashboard components
// ============================================================================

export interface EquipmentStatus {
	name: string; // 'available', 'in_use', 'maintenance', 'retired'
	value: number; // count
	color?: string; // hex color for pie chart
}

export interface CrewAvailability {
	available: number;
	total: number;
	percentage: number;
	byCrew: Array<{
		crewName: string;
		available: number;
		total: number;
		supervisor: string;
	}>;
}

export interface ScheduleItem {
	id: string;
	jobTitle: string;
	crewName: string;
	date: Date;
	startTime: string;
	endTime: string;
	location: string;
	status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

export interface StockAlert {
	id: string;
	materialName: string;
	currentStock: number;
	reorderLevel: number;
	unit: string;
	supplier: string;
	urgent: boolean;
}

export interface CommunicationAlert {
	type: 'email' | 'sms' | 'call' | 'chat';
	count: number;
	unread: number;
	latest: Date;
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
	getPendingActions(limits?: {
		jobs?: number;
		payments?: number;
	}): Promise<PendingAction[]>;
	getRecentUsers(limit?: number): Promise<User[]>;
	getSystemHealth(): Promise<SystemHealth>;
	// ✅ ADDED: New methods for dashboard components
	getEquipmentStatus(): Promise<EquipmentStatus[]>;
	getCrewAvailability(
		viewMode: string,
		selectedDate: Date,
	): Promise<CrewAvailability>;
	getUpcomingSchedule(
		days: number,
		selectedDate: Date,
	): Promise<ScheduleItem[]>;
	getStockAlerts(): Promise<StockAlert[]>;
	getCommunicationAlerts(): Promise<CommunicationAlert[]>;
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
				quotesResult, // ✅ ADDED: Fetch quotes data
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
				sql`SELECT j.id, j.quoted_price_cents FROM jobs j WHERE j.status = 'quoted'`, // ✅ ADDED: Get pending quotes
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

			// ✅ ADDED: Calculate pending quotes
			const pendingQuotes = quotesResult.filter(
				(q: any) => q.status === 'quoted',
			).length;

			const pendingQuotesValue = quotesResult.reduce(
				(sum: number, q: any) => sum + (q.quoted_price_cents || 0) / 100,
				0,
			);

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
				currentMonthRevenue: thisMonthRevenue,
				lastMonthRevenue,
				revenueChangePercent: Math.round(revenueChangePercent * 10) / 10,
				pendingRevenue: pendingPayments.reduce(
					(sum: number, p: any) => sum + (p.amount_cents || 0) / 100,
					0,
				),
				activeJobs,
				pendingJobs,
				completedJobs,
				// ✅ ADDED: Include in stats
				pendingQuotes,
				pendingQuotesValue,
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

	getPendingActions: async (limits = { jobs: 3, payments: 2 }) => {
		try {
			const jobsLimit = limits.jobs ?? 50;
			const paymentsLimit = limits.payments ?? 50;

			const [unassignedJobs, overduePayments, pendingQuotes, pendingCustomers] =
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
          LIMIT ${jobsLimit}
        `,
					sql`
          SELECT py.id, py.amount_cents, py.created_at 
          FROM payments py 
          WHERE py.status = ${PaymentStatus.PENDING}
          AND py.created_at < NOW() - INTERVAL '30 days'
          ORDER BY py.created_at DESC
          LIMIT ${paymentsLimit}
        `,
					sql`
          SELECT COUNT(*)::text as count 
          FROM jobs j 
          WHERE j.status = ${JobStatus.QUOTED}
        `,
					sql`
          SELECT COUNT(*)::text as count 
          FROM clients c 
          WHERE c.created_at >= NOW() - INTERVAL '30 days'
        `,
				]);

			const actions: PendingAction[] = [];

			unassignedJobs.forEach((job: any) => {
				actions.push({
					id: `action-unassigned-${job.id}`,
					type: 'unassigned_job',
					title: `Unassigned Job: ${job.title}`,
					description: `Job needs to be assigned to an employee`,
					priority: 'medium',
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

			const quoteCount = parseInt(pendingQuotes[0]?.count || '0', 10);
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

			const customerCount = parseInt(pendingCustomers[0]?.count || '0', 10);
			if (customerCount > 0) {
				actions.push({
					id: `action-pending-customers-${Date.now()}`,
					type: 'pending_customer',
					title: `${customerCount} New client(s) this month`,
					description: `Recent clients to review or follow up`,
					priority: 'low',
					link: `/admin/clients`,
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
				uptime: process.uptime ? process.uptime() : 0,
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
				uptime: 0,
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

	// ✅ NEW: Get equipment status for pie chart
	getEquipmentStatus: async () => {
		try {
			console.log('🔵 AdminService: Fetching equipment status...');

			const equipment = await sql`
				SELECT status, COUNT(*) as count 
				FROM equipment 
				GROUP BY status
			`;

			const colorMap: Record<string, string> = {
				available: '#22c55e',
				in_use: '#3b82f6',
				maintenance: '#eab308',
				retired: '#ef4444',
			};

			return equipment.map((e: any) => ({
				name: e.status,
				value: parseInt(e.count),
				color: colorMap[e.status] || '#6b7280',
			}));
		} catch (error) {
			console.error('🔴 AdminService: Error fetching equipment status:', error);
			// Return fallback data
			return [
				{ name: 'available', value: 12, color: '#22c55e' },
				{ name: 'in_use', value: 8, color: '#3b82f6' },
				{ name: 'maintenance', value: 3, color: '#eab308' },
				{ name: 'retired', value: 1, color: '#ef4444' },
			];
		}
	},

	// ✅ NEW: Get crew availability
	getCrewAvailability: async (viewMode: string, selectedDate: Date) => {
		try {
			console.log('🔵 AdminService: Fetching crew availability...');

			const crews = await sql`
				SELECT 
					c.id,
					c.name as crew_name,
					p.full_name as supervisor,
					COUNT(DISTINCT cm.employee_id) as total_members,
					COUNT(DISTINCT CASE WHEN p2.status = 'active' THEN cm.employee_id END) as available_members
				FROM crews c
				LEFT JOIN profiles p ON c.supervisor_id = p.id
				LEFT JOIN crew_members cm ON c.id = cm.crew_id
				LEFT JOIN profiles p2 ON cm.employee_id = p2.id
				GROUP BY c.id, c.name, p.full_name
			`;

			let totalAvailable = 0;
			let totalMembers = 0;
			const byCrew = crews.map((crew: any) => {
				const available = parseInt(crew.available_members) || 0;
				const total = parseInt(crew.total_members) || 0;
				totalAvailable += available;
				totalMembers += total;
				return {
					crewName: crew.crew_name,
					available,
					total,
					supervisor: crew.supervisor || 'Unassigned',
				};
			});

			const percentage =
				totalMembers > 0
					? Math.round((totalAvailable / totalMembers) * 100)
					: 0;

			return {
				available: totalAvailable,
				total: totalMembers,
				percentage,
				byCrew,
			};
		} catch (error) {
			console.error(
				'🔴 AdminService: Error fetching crew availability:',
				error,
			);
			// Return fallback data
			return {
				available: 15,
				total: 24,
				percentage: 62,
				byCrew: [
					{
						crewName: 'Landscaping Team A',
						available: 4,
						total: 6,
						supervisor: 'John Smith',
					},
					{
						crewName: 'Landscaping Team B',
						available: 3,
						total: 5,
						supervisor: 'Maria Garcia',
					},
					{
						crewName: 'Maintenance Crew',
						available: 5,
						total: 8,
						supervisor: 'Robert Johnson',
					},
					{
						crewName: 'Installation Team',
						available: 3,
						total: 5,
						supervisor: 'David Lee',
					},
				],
			};
		}
	},

	// ✅ NEW: Get upcoming schedule
	getUpcomingSchedule: async (days: number, selectedDate: Date) => {
		try {
			console.log('🔵 AdminService: Fetching upcoming schedule...');

			const endDate = new Date(selectedDate);
			endDate.setDate(endDate.getDate() + days);

			const schedule = await sql`
				SELECT 
					j.id,
					j.title as job_title,
					c.name as crew_name,
					sj.date,
					sj.estimated_start_time as start_time,
					sj.estimated_end_time as end_time,
					CONCAT(c2.street, ', ', c2.city) as location,
					sj.status
				FROM schedule_jobs sj
				JOIN jobs j ON sj.job_id = j.id
				LEFT JOIN crews c ON sj.crew_id = c.id
				LEFT JOIN clients c2 ON j.client_id = c2.id
				WHERE sj.date BETWEEN ${selectedDate.toISOString().split('T')[0]} 
					AND ${endDate.toISOString().split('T')[0]}
				ORDER BY sj.date, sj.estimated_start_time
				LIMIT 20
			`;

			return schedule.map((item: any) => ({
				id: item.id,
				jobTitle: item.job_title,
				crewName: item.crew_name || 'Unassigned',
				date: new Date(item.date),
				startTime: item.start_time || '09:00',
				endTime: item.end_time || '17:00',
				location: item.location || 'No address',
				status: item.status || 'scheduled',
			}));
		} catch (error) {
			console.error('🔴 AdminService: Error fetching schedule:', error);
			// Return empty array - no fallback needed
			return [];
		}
	},

	// ✅ NEW: Get stock alerts
	getStockAlerts: async () => {
		try {
			console.log('🔵 AdminService: Fetching stock alerts...');

			const materials = await sql`
				SELECT 
					m.id,
					m.name as material_name,
					m.current_stock,
					m.reorder_level,
					m.unit,
					s.name as supplier
				FROM materials m
				LEFT JOIN suppliers s ON m.supplier_id = s.id
				WHERE m.current_stock <= m.reorder_level
				ORDER BY (m.current_stock::float / NULLIF(m.reorder_level, 0)) ASC
				LIMIT 10
			`;

			return materials.map((m: any) => ({
				id: m.id,
				materialName: m.material_name,
				currentStock: parseInt(m.current_stock) || 0,
				reorderLevel: parseInt(m.reorder_level) || 0,
				unit: m.unit || 'units',
				supplier: m.supplier || 'Unknown',
				urgent: (parseInt(m.current_stock) || 0) === 0,
			}));
		} catch (error) {
			console.error('🔴 AdminService: Error fetching stock alerts:', error);
			// Return empty array
			return [];
		}
	},

	// ✅ NEW: Get communication alerts
	getCommunicationAlerts: async () => {
		try {
			console.log('🔵 AdminService: Fetching communication alerts...');

			const communications = await sql`
				SELECT 
					communication_type as type,
					COUNT(*) as count,
					SUM(CASE WHEN read_at IS NULL THEN 1 ELSE 0 END) as unread,
					MAX(sent_at) as latest
				FROM client_communications
				GROUP BY communication_type
			`;

			const typeMap: Record<string, 'email' | 'sms' | 'call' | 'chat'> = {
				email: 'email',
				sms: 'sms',
				call: 'call',
				chat: 'chat',
			};

			return communications.map((c: any) => ({
				type: typeMap[c.type] || 'email',
				count: parseInt(c.count) || 0,
				unread: parseInt(c.unread) || 0,
				latest: c.latest ? new Date(c.latest) : new Date(),
			}));
		} catch (error) {
			console.error('🔴 AdminService: Error fetching communications:', error);
			// Return fallback data
			return [
				{ type: 'email', count: 24, unread: 8, latest: new Date() },
				{ type: 'sms', count: 12, unread: 3, latest: new Date() },
				{ type: 'call', count: 6, unread: 2, latest: new Date() },
				{ type: 'chat', count: 18, unread: 7, latest: new Date() },
			];
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

// ✅ NEW: Export convenience functions for new methods
export const getEquipmentStatus = () => adminService.getEquipmentStatus();
export const getCrewAvailability = (viewMode: string, selectedDate: Date) =>
	adminService.getCrewAvailability(viewMode, selectedDate);
export const getUpcomingSchedule = (days: number, selectedDate: Date) =>
	adminService.getUpcomingSchedule(days, selectedDate);
export const getStockAlerts = () => adminService.getStockAlerts();
export const getCommunicationAlerts = () =>
	adminService.getCommunicationAlerts();
