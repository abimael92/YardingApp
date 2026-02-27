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
			console.group('🔵 useDashboardData - Loading data');
			console.log('Date range:', dateRange);

			const months =
				dateRange === '6m' ? 6 : dateRange === '12m' ? 12 : undefined;

			console.log('Months calculated:', months);

			// Log each service call individually to see which fails
			console.log('Calling getAdminStats...');
			const statsData = await getAdminStats();
			console.log('✅ getAdminStats response:', statsData);

			console.log('Calling getRevenueHistory...');
			const revenueData = await getRevenueHistory(months);
			console.log('✅ getRevenueHistory response:', revenueData);

			console.log('Calling getRecentActivity...');
			// Dashboard preview: show the 5 most recent activities
			const activityData = await getRecentActivity(5);
			console.log('✅ getRecentActivity response:', activityData);

			console.log('Calling getPendingActions...');
			const actionsData = await getPendingActions();
			console.log('✅ getPendingActions response:', actionsData);

			console.log('Calling getSystemHealth...');
			const healthData = await getSystemHealth();
			console.log('✅ getSystemHealth response:', healthData);

			setStats(statsData);
			setRevenueHistory(revenueData);
			setRecentActivity(activityData);
			setPendingActions(actionsData);
			setSystemHealth(healthData);

			console.groupEnd();
		} catch (err) {
			console.error('🔴 Failed to load dashboard data:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to load dashboard data',
			);

			// DON'T set fallback data - this masks the error!
			// Let the error state show instead
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
		error, // This will now show real errors
		refresh: loadData,
	};
};
