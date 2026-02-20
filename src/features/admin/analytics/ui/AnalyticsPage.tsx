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
  ArrowTrendingUpIcon,
  StarIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Cell } from "recharts"
import LoadingState from "@/src/shared/ui/LoadingState"
import StatsCard from "@/src/shared/ui/StatsCard"
import { analyticsService } from "@/src/services/analyticsService"
import type { RevenueTrend, ServiceRevenue, CrewPerformance, SeasonalForecast } from "@/src/services/analyticsService"

// Desert landscape color palette
const DESERT_COLORS = {
  primary: "#2e8b57",      // Primary green (desert vegetation)
  primaryDark: "#1f6b41",
  secondary: "#3cb371",
  accent: "#8b4513",        // Accent brown (desert earth)
  accentLight: "#d4a574",
  sand: "#f5f1e6",          // Sand/light background
  sunset: "#d88c4a",        // Sunset orange
  sky: "#87a6c7",           // Desert sky blue
  cactus: "#4a7c5c",        // Cactus green
  clay: "#b85e1a",          // Clay/terracotta
  sage: "#7f9f7f",          // Sage green
  warning: "#ffc107",
  success: "#28a745",
  error: "#dc3545",
  info: "#17a2b8",
}

const CHART_COLORS = [
  DESERT_COLORS.primary,
  DESERT_COLORS.sky,
  DESERT_COLORS.sunset,
  DESERT_COLORS.clay,
  DESERT_COLORS.sage,
  DESERT_COLORS.cactus,
]

// Custom tooltip with desert theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#f5f1e6] dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-[#d4a574] dark:border-[#8b4513]">
        <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name?.includes("Revenue") ? `$${entry.value.toLocaleString()}` : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const AnalyticsPage = () => {
  const [revenueTrends, setRevenueTrends] = useState<RevenueTrend[]>([])
  const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue[]>([])
  const [crewPerformance, setCrewPerformance] = useState<CrewPerformance[]>([])
  const [seasonalForecast, setSeasonalForecast] = useState<SeasonalForecast[]>([])
  const [completionRate, setCompletionRate] = useState<number>(0)
  const [retentionRate, setRetentionRate] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"revenue" | "crews" | "forecast">("revenue")

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
  const growthRate = revenueTrends.length > 1
    ? ((revenueTrends[revenueTrends.length - 1]?.revenue || 0) / (revenueTrends[0]?.revenue || 1) - 1) * 100
    : 0

  return (
    <div className="space-y-6">
      {/* Header with mobile-friendly tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Business insights and performance metrics
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="flex sm:hidden gap-2 overflow-x-auto pb-2">
          {["revenue", "crews", "forecast"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab
                  ? "bg-[#2e8b57] text-white shadow-lg"
                  : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics - responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <StatsCard
            title="Avg Monthly Revenue"
            value={`$${avgMonthlyRevenue.toLocaleString()}`}
            icon={CurrencyDollarIcon}
            color="primary"
            change={
              <span className={growthRate >= 0 ? "text-[#2e8b57] dark:text-[#4a7c5c]" : "text-[#dc3545] dark:text-[#ff6b6b]"}>
                {growthRate >= 0 ? "↑" : "↓"} {Math.abs(growthRate).toFixed(1)}% vs first month
              </span>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <StatsCard
            title="Job Completion Rate"
            value={`${completionRate}%`}
            icon={ClockIcon}
            color="green"
            change={
              <div className="flex items-center gap-1">
                <StarIcon className="w-3 h-3 text-[#ffc107]" />
                <span className="text-[#8b4513] dark:text-[#d4a574]">{completionRate >= 90 ? "Excellent" : "Good"}</span>
              </div>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <StatsCard
            title="Client Retention"
            value={`${retentionRate}%`}
            icon={UserGroupIcon}
            color="blue"
            change={
              <span className="text-[#8b4513] dark:text-[#d4a574]">
                {retentionRate > 80 ? "Above" : "Below"} industry avg
              </span>
            }
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <StatsCard
            title="Top Service"
            value={serviceRevenue[0]?.serviceName || "N/A"}
            icon={ChartBarIcon}
            color="earth"
            change={
              <span className="text-[#b85e1a] dark:text-[#d88c4a]">
                {serviceRevenue[0]?.percentage || 0}% of revenue
              </span>
            }
          />
        </motion.div>
      </div>

      {/* Revenue Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-[#d4a574]/30 dark:border-[#8b4513]/50"
        style={{ background: "var(--bg-primary)" }}
      >
        <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] mb-4 flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-[#2e8b57]" />
          Revenue Trends (Last 6 Months)
        </h2>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrends}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2e8b57" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2e8b57" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#8b4513', fontSize: 12 }}
                axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
              />
              <YAxis
                tick={{ fill: '#8b4513', fontSize: 12 }}
                axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2e8b57"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Responsive grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${activeTab !== "revenue" ? "sm:block lg:grid" : ""}`}>
        {/* Service Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className={`card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-[#d4a574]/30 dark:border-[#8b4513]/50 ${activeTab !== "revenue" && "hidden sm:block"
            }`}
          style={{ background: "var(--bg-primary)" }}
        >
          <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] mb-4">
            Revenue by Service Type
          </h2>
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" opacity={0.2} />
                <XAxis
                  dataKey="serviceName"
                  tick={{ fill: '#8b4513', fontSize: 12 }}
                  axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
                />
                <YAxis
                  tick={{ fill: '#8b4513', fontSize: 12 }}
                  axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {serviceRevenue.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Crew Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-[#d4a574]/30 dark:border-[#8b4513]/50 ${activeTab !== "crews" && "hidden sm:block"
            }`}
          style={{ background: "var(--bg-primary)" }}
        >
          <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] mb-4 flex items-center gap-2">
            <UserGroupIcon className="w-5 h-5 text-[#b85e1a]" />
            Crew Performance
          </h2>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {crewPerformance.map((crew, index) => (
              <motion.div
                key={crew.crewId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="group/item border-b border-[#d4a574]/30 dark:border-[#8b4513]/50 pb-4 last:border-0 hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 p-3 rounded-lg transition-all duration-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#8b4513] dark:text-[#d4a574] group-hover/item:text-[#2e8b57] dark:group-hover/item:text-[#4a7c5c] transition-colors">
                    {crew.crewName}
                  </span>
                  <span className="text-sm font-semibold text-[#2e8b57] dark:text-[#4a7c5c]">
                    ${crew.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
                  <div className="bg-[#f5f1e6] dark:bg-gray-800 rounded-lg p-2 text-center group-hover/item:bg-[#d4a574]/20 dark:group-hover/item:bg-gray-700 transition-colors">
                    <span className="text-[#8b4513]/70 dark:text-gray-400 block">Jobs</span>
                    <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">{crew.jobsCompleted}</span>
                  </div>
                  <div className="bg-[#f5f1e6] dark:bg-gray-800 rounded-lg p-2 text-center group-hover/item:bg-[#d4a574]/20 dark:group-hover/item:bg-gray-700 transition-colors">
                    <span className="text-[#8b4513]/70 dark:text-gray-400 block">Rating</span>
                    <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">{crew.avgRating}/5.0</span>
                  </div>
                  <div className="bg-[#f5f1e6] dark:bg-gray-800 rounded-lg p-2 text-center group-hover/item:bg-[#d4a574]/20 dark:group-hover/item:bg-gray-700 transition-colors">
                    <span className="text-[#8b4513]/70 dark:text-gray-400 block">On-Time</span>
                    <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">{crew.onTimeRate}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Seasonal Forecast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`card p-4 sm:p-6 hover:shadow-xl transition-all duration-300 border-[#d4a574]/30 dark:border-[#8b4513]/50 ${activeTab !== "forecast" && "hidden sm:block"
          }`}
        style={{ background: "var(--bg-primary)" }}
      >
        <h2 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#d88c4a]" />
          Seasonal Demand Forecast
        </h2>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={seasonalForecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d4a574" opacity={0.2} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#8b4513', fontSize: 12 }}
                axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: '#8b4513', fontSize: 12 }}
                axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
                tickFormatter={(value) => `${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: '#8b4513', fontSize: 12 }}
                axisLine={{ stroke: '#d4a574', opacity: 0.3 }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="predictedJobs"
                stroke="#d88c4a"
                strokeWidth={3}
                dot={{ r: 4, fill: "#d88c4a" }}
                activeDot={{ r: 6, fill: "#d88c4a" }}
                name="Predicted Jobs"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="predictedRevenue"
                stroke="#2e8b57"
                strokeWidth={3}
                dot={{ r: 4, fill: "#2e8b57" }}
                activeDot={{ r: 6, fill: "#2e8b57" }}
                name="Predicted Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  )
}

export default AnalyticsPage