/**
 * Analytics Page Component
 * 
 * Landscaping business analytics dashboard
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import LoadingState from "@/src/shared/ui/LoadingState"
import StatsCard from "@/src/shared/ui/StatsCard"
import { analyticsService } from "@/src/services/analyticsService"
import type { RevenueTrend, ServiceRevenue, CrewPerformance, SeasonalForecast } from "@/src/services/analyticsService"

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"]

const AnalyticsPage = () => {
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([])
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([])
  const [crewPerformance, setCrewPerformance] = useState<CrewPerformance[]>([])
  const [seasonalForecast, setSeasonalForecast] = useState<SeasonalForecast[]>([])
  const [completionRate, setCompletionRate] = useState<number>(0)
  const [retentionRate, setRetentionRate] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [trends, services, crews, forecast, completion, retention] = await Promise.all([
          analyticsService.getRevenueTrends(6),
          analyticsService.getServiceRevenue(),
          analyticsService.getCrewPerformance(),
          analyticsService.getSeasonalForecast(),
          analyticsService.getJobCompletionRate(),
          analyticsService.getClientRetentionRate(),
        ])
        setRevenueTrends(trends)
        setServiceRevenue(services)
        setCrewPerformance(crews)
        setSeasonalForecast(forecast)
        setCompletionRate(completion)
        setRetentionRate(retention)
      } catch (error) {
        console.error("Failed to load analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading analytics..." />
  }

  const totalRevenue = revenueTrends.reduce((sum, t) => sum + t.revenue, 0)
  const avgMonthlyRevenue = totalRevenue / revenueTrends.length

  return (
    <div >

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Avg Monthly Revenue"
          value={`$${avgMonthlyRevenue.toLocaleString()}`}
          icon={CurrencyDollarIcon}
          color="primary"
          change={`${((revenueTrends[revenueTrends.length - 1]?.revenue || 0) / (revenueTrends[0]?.revenue || 1) - 1) * 100 > 0 ? "+" : ""}${(((revenueTrends[revenueTrends.length - 1]?.revenue || 0) / (revenueTrends[0]?.revenue || 1) - 1) * 100).toFixed(1)}% vs first month`}
        />
        <StatsCard
          title="Job Completion Rate"
          value={`${completionRate}%`}
          icon={ClockIcon}
          color="green"
        />
        <StatsCard
          title="Client Retention"
          value={`${retentionRate}%`}
          icon={UserGroupIcon}
          color="blue"
        />
        <StatsCard
          title="Top Service"
          value={serviceRevenue[0]?.serviceName || "N/A"}
          icon={ChartBarIcon}
          color="earth"
          change={`${serviceRevenue[0]?.percentage || 0}% of revenue`}
        />
      </div>

      {/* Revenue Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Revenue Trends (Last 6 Months)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue by Service Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Crew Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Crew Performance
          </h2>
          <div className="space-y-4">
            {crewPerformance.map((crew) => (
              <div key={crew.crewId} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{crew.crewName}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${crew.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Jobs:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{crew.jobsCompleted}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{crew.avgRating}/5.0</span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">On-Time:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">{crew.onTimeRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Seasonal Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seasonal Demand Forecast
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={seasonalForecast}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="predictedJobs" stroke="#f59e0b" strokeWidth={2} name="Predicted Jobs" />
            <Line type="monotone" dataKey="predictedRevenue" stroke="#8b5cf6" strokeWidth={2} name="Predicted Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage
