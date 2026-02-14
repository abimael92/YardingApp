/**
 * Comprehensive Admin Dashboard
 * 
 * Full-featured dashboard with stats, charts, activity, and system health
 */

"use client"

import { useState, useEffect } from "react"
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
  ClockIcon,
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
} from "@/src/services/adminService"

const AdminDashboard = () => {
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [revenueHistory, setRevenueHistory] = useState<Array<{ month: string; revenue: number }>>([])
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([])
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState<"6m" | "12m" | "ytd">("6m")

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [statsData, revenueData, activityData, actionsData, healthData] = await Promise.all([
        getAdminStats(),
        getRevenueHistory(dateRange === "6m" ? 6 : dateRange === "12m" ? 12 : undefined),
        getRecentActivity(10),
        getPendingActions(),
        Promise.resolve(getSystemHealth()),
      ])
      setStats(statsData)
      setRevenueHistory(revenueData)
      setRecentActivity(activityData)
      setPendingActions(actionsData)
      setSystemHealth(healthData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
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
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [dateRange])

  const handleRefresh = () => {
    loadDashboardData()
  }

  const handleExportReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
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
    a.download = `admin-dashboard-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatActivityType = (type: ActivityLog["type"]) => {
    const types = {
      user_created: "User Created",
      job_created: "Job Created",
      job_updated: "Job Updated",
      payment_received: "Payment Received",
      client_created: "Client Created",
      employee_created: "Employee Created",
    }
    return types[type] || type
  }

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "user_created":
      case "client_created":
      case "employee_created":
        return UserGroupIcon
      case "job_created":
      case "job_updated":
        return ClipboardDocumentListIcon
      case "payment_received":
        return CurrencyDollarIcon
      default:
        return ClockIcon
    }
  }

  const getActivityColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "payment_received":
        return "text-green-600 dark:text-green-400"
      case "user_created":
      case "client_created":
      case "employee_created":
        return "text-blue-600 dark:text-blue-400"
      case "job_created":
      case "job_updated":
        return "text-purple-600 dark:text-purple-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  const getPriorityColor = (priority: PendingAction["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 dark:text-green-400"
      case "warning":
        return "text-yellow-600 dark:text-yellow-400"
      case "critical":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." fullScreen />
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Failed to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const revenueChangeColor = stats.revenueChangePercent >= 0 ? "text-green-600" : "text-red-600"
  const revenueChangeIcon = stats.revenueChangePercent >= 0 ? "↑" : "↓"

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Breadcrumbs />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">System Overview & Management</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "6m" | "12m" | "ytd")}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="6m">Last 6 Months</option>
            <option value="12m">Last 12 Months</option>
            <option value="ytd">Year to Date</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            title="Refresh Dashboard"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.push("/admin/payments")}
          className="cursor-pointer"
        >
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={CurrencyDollarIcon}
            color="primary"
            change={
              <span className={revenueChangeColor}>
                {revenueChangeIcon} {Math.abs(stats.revenueChangePercent)}% from last month
              </span>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          onClick={() => router.push("/admin/clients")}
          className="cursor-pointer"
        >
          <StatsCard
            title="Active Clients"
            value={stats.activeClients.toString()}
            icon={UserGroupIcon}
            color="green"
            change={`${stats.newClientsThisMonth} new this month`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={() => router.push("/admin/employees")}
          className="cursor-pointer"
        >
          <StatsCard
            title="Team Members"
            value={`${stats.availableEmployees}/${stats.totalEmployees}`}
            icon={BriefcaseIcon}
            color="earth"
            change={`${stats.activeEmployees} active`}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          onClick={() => router.push("/admin/jobs")}
          className="cursor-pointer"
        >
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            icon={ClipboardDocumentListIcon}
            color="sand"
            change={`${stats.pendingJobs} pending, ${stats.completedJobs} completed`}
          />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2 card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Revenue Trend
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="month"
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                />
                <YAxis
                  className="text-gray-600 dark:text-gray-400"
                  tick={{ fill: "currentColor" }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            System Health
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Overall Status
                </span>
                <span
                  className={`text-sm font-semibold ${getHealthStatusColor(systemHealth?.status || "healthy")}`}
                >
                  {systemHealth?.status?.toUpperCase() || "HEALTHY"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Uptime: {systemHealth?.uptime || 99.2}%</span>
                <span>{systemHealth?.activeConnections || 156} connections</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              {systemHealth?.services?.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{service.name}</span>
                  <div className="flex items-center space-x-2">
                    {service.status === "healthy" && (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    )}
                    {service.status === "warning" && (
                      <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
                    )}
                    {service.status === "critical" && (
                      <XCircleIcon className="w-5 h-5 text-red-500" />
                    )}
                    <span
                      className={`text-xs font-medium ${getHealthStatusColor(service.status)}`}
                    >
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <button
              onClick={() => router.push("/admin/analytics")}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No recent activity
              </p>
            ) : (
              recentActivity.map((activity, index) => {
                const Icon = getActivityIcon(activity.type)
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${getActivityColor(activity.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatActivityType(activity.type)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </motion.div>

        {/* Pending Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pending Actions</h2>
            {pendingActions.length > 0 && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold rounded-full">
                {pendingActions.length}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {pendingActions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">All clear! No pending actions</p>
              </div>
            ) : (
              pendingActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  onClick={() => action.link && router.push(action.link)}
                  className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${action.priority === "high"
                      ? "border-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                      : action.priority === "medium"
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
                        : "border-blue-500 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {action.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(action.priority)}`}
                        >
                          {action.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{action.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard