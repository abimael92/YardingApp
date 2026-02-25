/**
 * Reports Service
 * 
 * Service layer for financial and business reporting
 */

import { asyncify } from "./utils"

export interface ProfitLossData {
  period: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

export interface AccountsReceivableAging {
  current: number
  days30: number
  days60: number
  days90: number
  over90: number
  total: number
}

export interface RevenueByService {
  serviceName: string
  revenue: number
  jobs: number
  percentage: number
}

export interface ClientProfitability {
  clientId: string
  clientName: string
  totalRevenue: number
  totalCosts: number
  profit: number
  margin: number
  jobs: number
}

export interface CrewProductivity {
  crewId: string
  crewName: string
  jobsCompleted: number
  hoursWorked: number
  revenue: number
  efficiency: number
}

export interface ExpenseCategory {
  category: string
  amount: number
  percentage: number
}

const mockProfitLoss: ProfitLossData[] = [
  { period: "Q1 2025", revenue: 125000, expenses: 85000, profit: 40000, margin: 32.0 },
  { period: "Q2 2025", revenue: 142000, expenses: 92000, profit: 50000, margin: 35.2 },
  { period: "Q3 2025", revenue: 138000, expenses: 88000, profit: 50000, margin: 36.2 },
  { period: "Q4 2025", revenue: 132000, expenses: 86000, profit: 46000, margin: 34.8 },
  { period: "Q1 2025", revenue: 145000, expenses: 95000, profit: 50000, margin: 34.5 },
]

const mockAging: AccountsReceivableAging = {
  current: 12500,
  days30: 3200,
  days60: 1800,
  days90: 950,
  over90: 550,
  total: 19000,
}

const mockRevenueByService: RevenueByService[] = [
  { serviceName: "Lawn Care", revenue: 125000, jobs: 180, percentage: 35 },
  { serviceName: "Tree Trimming", revenue: 89000, jobs: 45, percentage: 25 },
  { serviceName: "Irrigation", revenue: 67000, jobs: 38, percentage: 19 },
  { serviceName: "Landscaping", revenue: 52000, jobs: 28, percentage: 15 },
  // { serviceName: "Hardscaping", revenue: 28000, jobs: 12, percentage: 6 },
]

const mockClientProfitability: ClientProfitability[] = [
  { clientId: "client-1", clientName: "John Smith", totalRevenue: 12500, totalCosts: 7500, profit: 5000, margin: 40, jobs: 15 },
  { clientId: "client-2", clientName: "Sarah Johnson", totalRevenue: 9800, totalCosts: 6200, profit: 3600, margin: 36.7, jobs: 12 },
  { clientId: "client-3", clientName: "Mike Davis", totalRevenue: 7200, totalCosts: 4800, profit: 2400, margin: 33.3, jobs: 9 },
]

const mockCrewProductivity: CrewProductivity[] = [
  { crewId: "crew-1", crewName: "Crew A", jobsCompleted: 85, hoursWorked: 680, revenue: 125000, efficiency: 92 },
  { crewId: "crew-2", crewName: "Crew B", jobsCompleted: 72, hoursWorked: 576, revenue: 108000, efficiency: 94 },
  { crewId: "crew-3", crewName: "Crew C", jobsCompleted: 68, hoursWorked: 544, revenue: 98000, efficiency: 89 },
]

const mockExpenses: ExpenseCategory[] = [
  { category: "Labor", amount: 125000, percentage: 45 },
  { category: "Materials", amount: 45000, percentage: 16 },
  { category: "Equipment", amount: 35000, percentage: 13 },
  { category: "Vehicle & Fuel", amount: 28000, percentage: 10 },
  { category: "Insurance", amount: 18000, percentage: 6 },
  { category: "Marketing", amount: 15000, percentage: 5 },
  { category: "Other", amount: 14000, percentage: 5 },
]

export const reportsService = {
  getProfitLoss: (): Promise<ProfitLossData[]> => asyncify(() => mockProfitLoss),

  getAccountsReceivableAging: (): Promise<AccountsReceivableAging> =>
    asyncify(() => mockAging),

  getRevenueByService: (): Promise<RevenueByService[]> =>
    asyncify(() => mockRevenueByService),

  getClientProfitability: (): Promise<ClientProfitability[]> =>
    asyncify(() => mockClientProfitability),

  getCrewProductivity: (): Promise<CrewProductivity[]> =>
    asyncify(() => mockCrewProductivity),

  getExpenses: (): Promise<ExpenseCategory[]> =>
    asyncify(() => mockExpenses),

  getYearOverYearComparison: (): Promise<{ current: number; previous: number; change: number }> =>
    asyncify(() => ({
      current: 145000,
      previous: 125000,
      change: 16.0, // 16% increase
    })),
}
