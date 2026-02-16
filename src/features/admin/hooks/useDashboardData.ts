import { useState, useEffect, useCallback } from 'react';
import {
	getAdminStats,
	getRevenueHistory,
	getRecentActivity,
	getPendingActions,
	getSystemHealth,
	type ActivityLog,
	type PendingAction,
	type AdminStats,
	type SystemHealth,
} from '@/src/services/adminService';
import type { DateRange } from '../types/dashboard.types';

interface UseDashboardDataReturn {
	stats: AdminStats | null;
	revenueHistory: Array<{ month: string; revenue: number }>;
	recentActivity: ActivityLog[];
	pendingActions: PendingAction[];
	systemHealth: SystemHealth | null;
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

export const useDashboardData = (
	dateRange: DateRange,
): UseDashboardDataReturn => {
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [revenueHistory, setRevenueHistory] = useState<
		Array<{ month: string; revenue: number }>
	>([]);
	const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
	const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
	const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			const months =
				dateRange === '6m' ? 6 : dateRange === '12m' ? 12 : undefined;

			const [statsData, revenueData, activityData, actionsData, healthData] =
				await Promise.all([
					getAdminStats(),
					getRevenueHistory(months),
					getRecentActivity(10),
					getPendingActions(),
					getSystemHealth(),
				]);

			setStats(statsData);
			setRevenueHistory(revenueData);
			setRecentActivity(activityData);
			setPendingActions(actionsData);
			setSystemHealth(healthData);
		} catch (err) {
			console.error('Failed to load dashboard data:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to load dashboard data',
			);

			// Set fallback data
			setStats({
				totalUsers: 0,
				activeUsers: 0,
				totalClients: 0,
				activeClients: 0,
				newClientsThisMonth: 0,
				totalEmployees: 0,
				activeEmployees: 0,
				availableEmployees: 0,
				totalTasks: 0,
				pendingTasks: 0,
				inProgressTasks: 0,
				completedTasks: 0,
				totalRevenue: 0,
				revenueChangePercent: 0,
				pendingRevenue: 0,
				activeJobs: 0,
				pendingJobs: 0,
				completedJobs: 0,
			});
		} finally {
			setIsLoading(false);
		}
	}, [dateRange]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	return {
		stats,
		revenueHistory,
		recentActivity,
		pendingActions,
		systemHealth,
		isLoading,
		error,
		refresh: loadData,
	};
};
