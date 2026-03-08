import { useState, useEffect, useCallback } from 'react';
import {
	getAdminStats,
	getRevenueHistory,
	getRecentActivity,
	getPendingActions,
	getSystemHealth,
	getEquipmentStatus,
	getCrewAvailability,
	getUpcomingSchedule,
	getStockAlerts,
	getCommunicationAlerts,
	type ActivityLog,
	type PendingAction,
	type SystemHealth,
	type EquipmentStatus,
	type CrewAvailability,
	type ScheduleItem,
	type StockAlert,
	type CommunicationAlert,
} from '@/src/services/adminService';
import type { DashboardStats, DateRange, ViewMode } from '../types/dashboard.types';

interface UseDashboardDataReturn {
	// Original data
	stats: DashboardStats | null;
	revenueHistory: Array<{ month: string; revenue: number }>;
	recentActivity: ActivityLog[];
	pendingActions: PendingAction[];
	systemHealth: SystemHealth | null;

	// NEW DATA - From your database schema
	equipmentStatus: EquipmentStatus[];
	crewAvailability: CrewAvailability | null;
	upcomingSchedule: ScheduleItem[];
	stockAlerts: StockAlert[];
	communicationAlerts: CommunicationAlert[];

	// Status
	isLoading: boolean;
	error: string | null;
	refresh: () => Promise<void>;
}

export const useDashboardData = (
	dateRange: DateRange,
	viewMode: ViewMode, // NEW: 'today' | 'week' | 'month'
	selectedDate: Date, // NEW: Current selected date for navigation
): UseDashboardDataReturn => {
	// Original state
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [revenueHistory, setRevenueHistory] = useState<
		Array<{ month: string; revenue: number }>
	>([]);
	const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
	const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
	const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

	// NEW STATE - For the 6 missing data points
	const [equipmentStatus, setEquipmentStatus] = useState<EquipmentStatus[]>([]);
	const [crewAvailability, setCrewAvailability] =
		useState<CrewAvailability | null>(null);
	const [upcomingSchedule, setUpcomingSchedule] = useState<ScheduleItem[]>([]);
	const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
	const [communicationAlerts, setCommunicationAlerts] = useState<
		CommunicationAlert[]
	>([]);

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadData = useCallback(async () => {
		setIsLoading(true);
		setError(null);

		try {
			console.group('🔵 useDashboardData - Loading ALL data');
			console.log('Date range:', dateRange);
			console.log('View mode:', viewMode);
			console.log('Selected date:', selectedDate.toISOString());

			// Calculate months for revenue history
			const months =
				dateRange === '6m' ? 6 : dateRange === '12m' ? 12 : undefined;

			// Fetch ALL data in parallel - including the new ones
			const [
				statsData,
				revenueData,
				activityData,
				actionsData,
				healthData,
				equipmentData,
				crewData,
				scheduleData,
				stockData,
				commsData,
			] = await Promise.all([
				getAdminStats(),
				getRevenueHistory(months),
				getRecentActivity(5),
				getPendingActions(),
				getSystemHealth(),
				getEquipmentStatus(), // NEW
				getCrewAvailability(viewMode, selectedDate), // NEW - needs view mode
				getUpcomingSchedule(7, selectedDate), // NEW - 7 days from selected date
				getStockAlerts(), // NEW
				getCommunicationAlerts(), // NEW
			]);

			// Log each response for debugging
			console.log('✅ Stats:', statsData);
			console.log('✅ Revenue:', revenueData);
			console.log('✅ Activity:', activityData);
			console.log('✅ Actions:', actionsData);
			console.log('✅ Health:', healthData);
			console.log('✅ Equipment:', equipmentData);
			console.log('✅ Crew:', crewData);
			console.log('✅ Schedule:', scheduleData);
			console.log('✅ Stock Alerts:', stockData);
			console.log('✅ Communications:', commsData);

			// Set ALL state
			setStats(statsData);
			setRevenueHistory(revenueData);
			setRecentActivity(activityData);
			setPendingActions(actionsData);
			setSystemHealth(healthData);
			setEquipmentStatus(equipmentData);
			setCrewAvailability(crewData);
			setUpcomingSchedule(scheduleData);
			setStockAlerts(stockData);
			setCommunicationAlerts(commsData);

			console.groupEnd();
		} catch (err) {
			console.error('🔴 Failed to load dashboard data:', err);
			setError(
				err instanceof Error ? err.message : 'Failed to load dashboard data',
			);

			// Set empty arrays for error state to prevent undefined errors
			setEquipmentStatus([]);
			setCrewAvailability(null);
			setUpcomingSchedule([]);
			setStockAlerts([]);
			setCommunicationAlerts([]);
		} finally {
			setIsLoading(false);
		}
	}, [dateRange, viewMode, selectedDate]);

	useEffect(() => {
		loadData();
	}, [loadData]);

	return {
		// Original returns
		stats,
		revenueHistory,
		recentActivity,
		pendingActions,
		systemHealth,

		// NEW returns
		equipmentStatus,
		crewAvailability,
		upcomingSchedule,
		stockAlerts,
		communicationAlerts,

		// Status
		isLoading,
		error,
		refresh: loadData,
	};
};
