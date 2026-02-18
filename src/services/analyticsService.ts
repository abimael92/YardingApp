/**
 * Analytics Service
 *
 * Service layer for landscaping business analytics and reporting
 */

// Helper for mock async operations
const asyncify = <T>(fn: () => T): Promise<T> => {
	return new Promise((resolve) => {
		setTimeout(() => resolve(fn()), 500);
	});
};

export interface RevenueTrend {
	month: string;
	revenue: number;
	jobs: number;
	avgJobValue: number;
}

export interface ServiceRevenue {
	serviceName: string;
	revenue: number;
	jobs: number;
	percentage: number;
}

export interface CrewPerformance {
	crewId: string;
	crewName: string;
	jobsCompleted: number;
	revenue: number;
	avgRating: number;
	onTimeRate: number;
}

export interface SeasonalForecast {
	month: string;
	predictedJobs: number;
	predictedRevenue: number;
	confidence: number;
}

export interface ServiceAreaData {
	area: string;
	jobs: number;
	revenue: number;
	clients: number;
}

const mockRevenueTrends: RevenueTrend[] = [
	{ month: 'Jul 2025', revenue: 42500, jobs: 48, avgJobValue: 885 },
	{ month: 'Aug 2025', revenue: 48200, jobs: 52, avgJobValue: 927 },
	{ month: 'Sep 2025', revenue: 45100, jobs: 49, avgJobValue: 920 },
	{ month: 'Oct 2025', revenue: 38900, jobs: 42, avgJobValue: 927 },
	{ month: 'Nov 2025', revenue: 32100, jobs: 35, avgJobValue: 917 },
	{ month: 'Dec 2025', revenue: 28500, jobs: 31, avgJobValue: 919 },
	{ month: 'Jan 2025', revenue: 45820, jobs: 50, avgJobValue: 916 },
];

const mockServiceRevenue: ServiceRevenue[] = [
	{ serviceName: 'Lawn Care', revenue: 125000, jobs: 180, percentage: 35 },
	{ serviceName: 'Tree Trimming', revenue: 89000, jobs: 45, percentage: 25 },
	{ serviceName: 'Irrigation', revenue: 67000, jobs: 38, percentage: 19 },
	{ serviceName: 'Landscaping', revenue: 52000, jobs: 28, percentage: 15 },
	{ serviceName: 'Hardscaping', revenue: 28000, jobs: 12, percentage: 6 },
];

const mockCrewPerformance: CrewPerformance[] = [
	{
		crewId: 'crew-1',
		crewName: 'Crew A',
		jobsCompleted: 85,
		revenue: 125000,
		avgRating: 4.8,
		onTimeRate: 94,
	},
	{
		crewId: 'crew-2',
		crewName: 'Crew B',
		jobsCompleted: 72,
		revenue: 108000,
		avgRating: 4.9,
		onTimeRate: 97,
	},
	{
		crewId: 'crew-3',
		crewName: 'Crew C',
		jobsCompleted: 68,
		revenue: 98000,
		avgRating: 4.7,
		onTimeRate: 91,
	},
];

const mockSeasonalForecast: SeasonalForecast[] = [
	{
		month: 'Feb 2025',
		predictedJobs: 52,
		predictedRevenue: 47500,
		confidence: 85,
	},
	{
		month: 'Mar 2025',
		predictedJobs: 58,
		predictedRevenue: 53200,
		confidence: 88,
	},
	{
		month: 'Apr 2025',
		predictedJobs: 65,
		predictedRevenue: 59800,
		confidence: 90,
	},
	{
		month: 'May 2025',
		predictedJobs: 72,
		predictedRevenue: 66100,
		confidence: 92,
	},
	{
		month: 'Jun 2025',
		predictedJobs: 78,
		predictedRevenue: 71500,
		confidence: 90,
	},
];

const mockServiceAreaData: ServiceAreaData[] = [
	{ area: 'North District', jobs: 125, revenue: 185000, clients: 45 },
	{ area: 'South District', jobs: 98, revenue: 142000, clients: 38 },
	{ area: 'East District', jobs: 87, revenue: 128000, clients: 32 },
	{ area: 'West District', jobs: 75, revenue: 110000, clients: 28 },
];

export const analyticsService = {
	getRevenueTrends: (months: number = 6): Promise<RevenueTrend[]> =>
		asyncify(() => mockRevenueTrends.slice(-months)),

	getServiceRevenue: (): Promise<ServiceRevenue[]> =>
		asyncify(() => mockServiceRevenue),

	getCrewPerformance: (): Promise<CrewPerformance[]> =>
		asyncify(() => mockCrewPerformance),

	getSeasonalForecast: (): Promise<SeasonalForecast[]> =>
		asyncify(() => mockSeasonalForecast),

	getServiceAreaData: (): Promise<ServiceAreaData[]> =>
		asyncify(() => mockServiceAreaData),

	getJobCompletionRate: (): Promise<number> => asyncify(() => 87.5),

	getClientRetentionRate: (): Promise<number> => asyncify(() => 82.3),
};
