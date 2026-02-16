/**
 * Admin Dashboard Component
 * 
 * Displays key business metrics, revenue trends, recent activity, and pending actions
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import StatsCard from "@/src/shared/ui/StatsCard"
import LoadingState from "@/src/shared/ui/LoadingState"
import { formatCurrency, formatDate, formatRelativeTime } from "@/src/features/admin/utils/formatters"
import { useDashboardData } from "@/src/features/admin/hooks/useDashboardData"
import { RecentActivityList } from "./RecentActivityList"
import { PendingActionsList } from "./PendingActionsList"
import type { DateRange } from "@/src/features/admin/types/dashboard.types.ts"
import { SystemHealthCard } from './SystemHealthCard'

export const AdminDashboard = () => {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange>("6m")

  const {
    stats,
    revenueHistory,
    recentActivity,
    pendingActions,
    systemHealth,
    isLoading,
    error,
    refresh,
  } = useDashboardData(dateRange)

  // Console logs to verify real data
  useEffect(() => {
    console.log('📊 Dashboard Data Loaded:', {
      stats,
      revenueHistory: revenueHistory.length,
      recentActivity: recentActivity.length,
      pendingActions: pendingActions.length,
      dateRange
    })
  }, [stats, revenueHistory, recentActivity, pendingActions, dateRange])

  const handleExportReport = useCallback(() => {
    if (!stats || !revenueHistory || !recentActivity || !pendingActions || !systemHealth) return

    const report = {
      generatedAt: new Date().toISOString(),
      dateRange,
      stats,
      revenueHistory,
      recentActivity,
      pendingActions,
      systemHealth,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [stats, revenueHistory, recentActivity, pendingActions, systemHealth, dateRange])

  const revenueChange = useMemo(() => {
    if (!stats) return { percent: 0, isPositive: true }
    return {
      percent: Math.abs(stats.revenueChangePercent),
      isPositive: stats.revenueChangePercent >= 0,
    }
  }, [stats])

  const navigateTo = useCallback((path: string) => {
    router.push(path)
  }, [router])

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." fullScreen />
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">
            {error || "Failed to load dashboard data"}
          </p>
          <button
            onClick={refresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={refresh}
        onExport={handleExportReport}
      />

      {/* Stats Cards Grid with tooltips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div
          onClick={() => navigateTo("/admin/payments")}
          className="cursor-pointer group relative"
          title="Click to view payment details - Data from database"
        >
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={CurrencyDollarIcon}
            color="primary"
            change={
              <span className={revenueChange.isPositive ? "text-green-600" : "text-red-600"}>
                {revenueChange.isPositive ? "↑" : "↓"} {revenueChange.percent}% from last month
              </span>
            }
          />
        </div>

        <div
          onClick={() => navigateTo("/admin/clients")}
          className="cursor-pointer group relative"
          title="Click to view client details - Data from database"
        >
          <StatsCard
            title="Active Clients"
            value={stats.activeClients.toString()}
            icon={UserGroupIcon}
            color="green"
            change={`${stats.newClientsThisMonth} new this month`}
          />
        </div>

        <div
          onClick={() => navigateTo("/admin/employees")}
          className="cursor-pointer group relative"
          title="Click to view employee details - Data from database"
        >
          <StatsCard
            title="Team Members"
            value={`${stats.availableEmployees}/${stats.totalEmployees}`}
            icon={BriefcaseIcon}
            color="earth"
            change={`${stats.activeEmployees} active`}
          />
        </div>

        <div
          onClick={() => navigateTo("/admin/jobs")}
          className="cursor-pointer group relative"
          title="Click to view job details - Data from database"
        >
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            icon={ClipboardDocumentListIcon}
            color="sand"
            change={`${stats.pendingJobs} pending, ${stats.completedJobs} completed`}
          />
        </div>
      </div>

      {/* Charts and Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueHistory} />
        <SystemHealthCard health={systemHealth} />
      </div>

      {/* Activity and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityList
          activities={recentActivity}
          onViewAll={() => navigateTo("/admin/analytics")}
        />
        <PendingActionsList
          actions={pendingActions}
          onActionClick={(link) => link && navigateTo(link)}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface DashboardHeaderProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  onRefresh: () => void
  onExport: () => void
}

const DashboardHeader = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  onExport,
}: DashboardHeaderProps) => (
  <div className="flex flex-wrap items-center justify-between gap-3">
    <div>
      <Breadcrumbs />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
        Admin Dashboard
      </h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        System Overview & Management
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <select
        value={dateRange}
        onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label="Select date range"
      >
        <option value="6m">Last 6 Months</option>
        <option value="12m">Last 12 Months</option>
        <option value="ytd">Year to Date</option>
      </select>

      <button
        onClick={onExport}
        className="inline-flex items-center px-3 py-2 border border-gray-300 
                   dark:border-gray-600 rounded-lg text-sm font-medium 
                   text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                   hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        aria-label="Export report"
      >
        <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
        <span className="hidden sm:inline">Export</span>
      </button>

      <button
        onClick={onRefresh}
        className="inline-flex items-center justify-center p-2 border border-gray-300 
                   dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 
                   bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
                   transition-colors focus:ring-2 focus:ring-primary-500 
                   focus:border-transparent"
        title="Refresh Dashboard"
        aria-label="Refresh dashboard"
      >
        <ArrowPathIcon className="w-4 h-4" />
      </button>
    </div>
  </div>
)

// ============================================================================

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>
}

const RevenueChart = ({ data }: RevenueChartProps) => {
  const hasData = data.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="lg:col-span-2 card p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Revenue Trend
      </h2>

      {!hasData ? (
        <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No revenue data available
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="month"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: "currentColor", fontSize: 12 }}
              />
              <YAxis
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-background)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                labelStyle={{ color: "var(--color-text-secondary)", marginBottom: 4 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  )
}

export default AdminDashboard