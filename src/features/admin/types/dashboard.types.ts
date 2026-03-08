export type DateRange = '6m' | '12m' | 'ytd';

export interface DashboardStats {
  pendingQuotes?: any;
	totalRevenue: number;
	revenueChangePercent: number;
	activeClients: number;
	newClientsThisMonth: number;
	totalEmployees: number;
	activeEmployees: number;
	availableEmployees: number;
	activeJobs: number;
	pendingJobs: number;
	completedJobs: number;
}

export type ViewMode = 'today' | 'week' | 'month';