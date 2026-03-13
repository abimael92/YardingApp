/**
 * ADMIN DASHBOARD - Complete Executive Overview
 * 
 * Displays ALL metrics from the database schema including:
 * - Revenue Today/This Week/This Month (toggle view)
 * - Active Jobs with status breakdown
 * - Pending Quotes with total value (click to view all quotes)
 * - Equipment Status Pie Chart (click for equipment management)
 * - Crew Availability % (click for crew management)
 * - Upcoming Schedule (7-day timeline with clickable jobs)
 * - Recent Activities Feed
 * - Low Stock Alerts (click for inventory)
 * - Unread Communications by type (click for messages)
 * 
 * Features:
 * - Toggle between Today/Week/Month views with date selector
 * - Real data from PostgreSQL database
 * - Fully responsive with mobile optimization
 * - All cards are clickable and navigate to detailed views
 * - Cool animations and visual feedback
 * - Export functionality for all dashboard data
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BellIcon,
  DocumentTextIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChartPieIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import StatsCard from "@/src/shared/ui/StatsCard"
import LoadingState from "@/src/shared/ui/LoadingState"
import { formatCurrency, formatDate, formatRelativeTime } from "@/src/features/admin/utils/formatters"
import { useDashboardData } from "@/src/features/admin/hooks/useDashboardData"
import { RecentActivityList } from "./RecentActivityList"
import { PendingActionsList } from "./PendingActionsList"
import { ViewAllActivityModal } from "./ViewAllActivityModal"
import { ViewAllPendingActionsModal } from "./ViewAllPendingActionsModal"
import type { DateRange } from "@/src/features/admin/types/dashboard.types"
import { SystemHealthCard } from './SystemHealthCard'

// ============================================================================
// TYPES - Based on your database schema
// ============================================================================

type ViewMode = 'today' | 'week' | 'month'

interface EquipmentStatus {
  name: string
  value: number
  color?: string
}

interface CrewAvailability {
  available: number
  total: number
  percentage: number
  byCrew: Array<{
    crewName: string
    available: number
    total: number
    supervisor: string
  }>
}

interface ScheduleItem {
  id: string
  jobTitle: string
  crewName: string
  date: Date
  startTime: string
  endTime: string
  location: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
}

interface StockAlert {
  id: string
  materialName: string
  currentStock: number
  reorderLevel: number
  unit: string
  supplier: string
  urgent: boolean
}

interface CommunicationAlert {
  type: 'email' | 'sms' | 'call' | 'chat'
  count: number
  unread: number
  latest: Date
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AdminDashboard = () => {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<DateRange>("6m")
  const [viewMode, setViewMode] = useState<ViewMode>('today')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [viewAllActivityOpen, setViewAllActivityOpen] = useState(false)
  const [viewAllPendingOpen, setViewAllPendingOpen] = useState(false)
  const [showStockAlerts, setShowStockAlerts] = useState(true)
  const [showCommunications, setShowCommunications] = useState(true)

  // Custom date navigation
  const navigateDate = useCallback((direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'today') {
        direction === 'prev'
          ? newDate.setDate(prev.getDate() - 1)
          : newDate.setDate(prev.getDate() + 1)
      } else if (viewMode === 'week') {
        direction === 'prev'
          ? newDate.setDate(prev.getDate() - 7)
          : newDate.setDate(prev.getDate() + 7)
      } else if (viewMode === 'month') {
        direction === 'prev'
          ? newDate.setMonth(prev.getMonth() - 1)
          : newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }, [viewMode])

  const {
    stats,
    revenueHistory,
    recentActivity,
    pendingActions,
    systemHealth,
    equipmentStatus,
    crewAvailability,
    upcomingSchedule,
    stockAlerts,
    communicationAlerts,
    isLoading,
    error,
    refresh,
  } = useDashboardData(dateRange, viewMode, selectedDate)

  // Debug logging - COMMENT OUT IN PRODUCTION
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Dashboard Data Debug');
      console.log('View Mode:', viewMode);
      console.log('Selected Date:', selectedDate.toLocaleDateString());
      console.log('📊 Stats:', stats);
      console.log('📊 Equipment Status:', equipmentStatus);
      console.log('👥 Crew Availability:', crewAvailability);
      console.log('📅 Upcoming Schedule:', upcomingSchedule);
      console.log('⚠️ Stock Alerts:', stockAlerts);
      console.log('💬 Communications:', communicationAlerts);
      console.groupEnd();
    }
  }, [stats, equipmentStatus, crewAvailability, upcomingSchedule, stockAlerts, communicationAlerts, viewMode, selectedDate]);

  const handleExportReport = useCallback(() => {
    if (!stats || !revenueHistory) return

    const report = {
      generatedAt: new Date().toISOString(),
      dateRange,
      viewMode,
      selectedDate: selectedDate.toISOString(),
      stats,
      revenueHistory,
      recentActivity,
      pendingActions,
      systemHealth,
      equipmentStatus,
      crewAvailability,
      upcomingSchedule,
      stockAlerts,
      communicationAlerts,
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dashboard-report-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }, [stats, revenueHistory, recentActivity, pendingActions, systemHealth, equipmentStatus, crewAvailability, upcomingSchedule, stockAlerts, communicationAlerts, dateRange, viewMode, selectedDate])

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
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <DashboardHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onDateNavigate={navigateDate}
        onRefresh={refresh}
        onExport={handleExportReport}
      />

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div onClick={() => navigateTo("/admin/payments")} className="cursor-pointer">
          <StatsCard
            title={`Revenue ${viewMode === 'today' ? 'Today' : viewMode === 'week' ? 'This Week' : 'This Month'}`}
            value={formatCurrency(stats.totalRevenue || 0)}
            icon={CurrencyDollarIcon}
            color="green"
            change={
              <div className="space-y-0.5">
                <span className={revenueChange.isPositive ? "text-green-600" : "text-red-600"}>
                  {revenueChange.isPositive ? "↑" : "↓"} {revenueChange.percent}%
                </span>
              </div>
            }
          />
        </div>

        <div onClick={() => navigateTo("/admin/jobs")} className="cursor-pointer">
          <StatsCard
            title="Active Jobs"
            value={stats.activeJobs.toString()}
            icon={ClipboardDocumentListIcon}
            color="blue"
            change={`${stats.pendingJobs} pending, ${stats.completedJobs} completed`}
          />
        </div>

        <div onClick={() => navigateTo("/admin/quotes")} className="cursor-pointer">
          <StatsCard
            title="Pending Quotes"
            value={(stats as any).pendingQuotes?.toString() || "0"}
            icon={DocumentTextIcon}
            color="purple"
            change={`${(stats as any).pendingQuotes || 0} waiting for approval`}
          />
        </div>

        <div onClick={() => navigateTo("/admin/clients")} className="cursor-pointer">
          <StatsCard
            title="Active Clients"
            value={stats.activeClients.toString()}
            icon={UserGroupIcon}
            color="brown"
            change={`${stats.newClientsThisMonth} new this month`}
          />
        </div>
      </div>

      {/* Second Row - Equipment, Crew, Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equipment Status Pie Chart */}
        <EquipmentStatusCard
          data={equipmentStatus || []}
          onViewAll={() => navigateTo("/admin/equipment")}
        />

        {/* Crew Availability Card */}
        <CrewAvailabilityCard
          data={crewAvailability}
          onManageCrews={() => navigateTo("/admin/employees?tab=crews")}
        />

        {/* Stock Alerts & Communications */}
        <AlertsCard
          stockAlerts={stockAlerts || []}
          communicationAlerts={communicationAlerts || []}
          showStock={showStockAlerts}
          showComms={showCommunications}
          onToggleStock={() => setShowStockAlerts(!showStockAlerts)}
          onToggleComms={() => setShowCommunications(!showCommunications)}
          onViewAllStock={() => navigateTo('/admin/materials')}
          onViewAllComms={() => navigateTo('/admin/communications')}
          onViewStockItem={(id) => navigateTo(`/admin/materials/${id}`)}
          onViewCommsByType={(type) => navigateTo(`/admin/communications?type=${type}`)}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueHistory || []} className="lg:col-span-2" />
        <SystemHealthCard
          health={systemHealth}
        />
      </div>

      {/* Upcoming Schedule - 7 Day Timeline */}
      <ScheduleTimeline
        schedule={upcomingSchedule || []}
        onViewAll={() => navigateTo('/admin/schedule')}
        onJobClick={(jobId) => navigateTo(`/admin/jobs/${jobId}`)}
      />

      {/* Activity and Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityList
          activities={recentActivity || []}
          onViewAll={() => setViewAllActivityOpen(true)}
        />
        <PendingActionsList
          actions={pendingActions || []}
          onActionClick={(link) => link && navigateTo(link)}
          onViewAll={() => setViewAllPendingOpen(true)}
        />
      </div>

      {/* Modals */}
      <ViewAllActivityModal
        isOpen={viewAllActivityOpen}
        onClose={() => setViewAllActivityOpen(false)}
      />
      <ViewAllPendingActionsModal
        isOpen={viewAllPendingOpen}
        onClose={() => setViewAllPendingOpen(false)}
      />
    </div>
  )
}

// ============================================================================
// ENHANCED DASHBOARD HEADER WITH DATE NAVIGATION
// ============================================================================

interface DashboardHeaderProps {
  dateRange: DateRange
  onDateRangeChange: (range: DateRange) => void
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  selectedDate: Date
  onDateNavigate: (direction: 'prev' | 'next') => void
  onRefresh: () => void
  onExport: () => void
}

const DashboardHeader = ({
  dateRange,
  onDateRangeChange,
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateNavigate,
  onRefresh,
  onExport,
}: DashboardHeaderProps) => {
  const formatDisplayDate = useCallback(() => {
    if (viewMode === 'today') {
      return selectedDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } else if (viewMode === 'week') {
      const endOfWeek = new Date(selectedDate)
      endOfWeek.setDate(selectedDate.getDate() + 6)
      return `${selectedDate.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
    } else {
      return selectedDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    }
  }, [viewMode, selectedDate])

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <Breadcrumbs />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          Executive Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Real-time business overview from database
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 p-1 bg-white dark:bg-gray-800">
          {(['today', 'week', 'month'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`
                px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-all
                ${viewMode === mode
                  ? 'bg-green-600 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button
            onClick={() => onDateNavigate('prev')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Previous"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
            {formatDisplayDate()}
          </span>
          <button
            onClick={() => onDateNavigate('next')}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Next"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
          aria-label="Select date range for charts"
        >
          <option value="6m">Last 6 Months</option>
          <option value="12m">Last 12 Months</option>
          <option value="ytd">Year to Date</option>
        </select>

        {/* Action Buttons */}
        <button
          onClick={onExport}
          className="inline-flex items-center px-3 py-2 border border-gray-300 
                     dark:border-gray-600 rounded-lg text-sm font-medium 
                     text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                     hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                     transition-colors focus:ring-2 focus:ring-green-500 
                     focus:border-transparent"
          title="Refresh Dashboard"
          aria-label="Refresh dashboard"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// EQUIPMENT STATUS PIE CHART WITH MODAL
// ============================================================================

const COLORS = ['#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7']

const EquipmentStatusCard = ({
  data,
  onViewAll
}: {
  data: EquipmentStatus[]
  onViewAll: () => void
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsModalOpen(true)
  }

  const handleViewAllEquipment = () => {
    setIsModalOpen(false)
    onViewAll()
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Equipment Status
          </h2>
          <TruckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>

        {data.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            No equipment data available
          </div>
        ) : (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Units']}
                    contentStyle={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || COLORS[index] }} />
                  <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
                  <span className="font-medium text-gray-900 dark:text-white ml-auto">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Equipment:</span>
                <span className="font-bold text-gray-900 dark:text-white">{total}</span>
              </div>
              <p className="text-xs text-green-600 mt-2 text-center">
                Click for detailed equipment view
              </p>
            </div>
          </>
        )}
      </motion.div>

      {/* Equipment Details Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <EquipmentModal
            data={data}
            onClose={() => setIsModalOpen(false)}
            onViewAllEquipment={handleViewAllEquipment}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ============================================================================
// EQUIPMENT DETAILS MODAL
// ============================================================================

const EquipmentModal = ({
  data,
  onClose,
  onViewAllEquipment,
}: {
  data: EquipmentStatus[]
  onClose: () => void
  onViewAllEquipment: () => void
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Calculate percentages
  const dataWithPercentages = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TruckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Equipment Status Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Equipment</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status Categories</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.length}</p>
            </div>
          </div>

          {/* Equipment List with Progress Bars */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Equipment Breakdown
            </h3>
            {dataWithPercentages.map((item, index) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.value} units
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-16 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Equipment Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Equipment Activity
            </h3>
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${item.name === 'Operational'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : item.name === 'Maintenance'
                          ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      }`}>
                      {item.name}
                    </span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {item.value} units
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={onViewAllEquipment}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                       hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <TruckIcon className="w-4 h-4" />
            Go to Equipment Page
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// CREW AVAILABILITY CARD
// ============================================================================

const CrewAvailabilityCard = ({
  data,
  onManageCrews
}: {
  data: CrewAvailability | null
  onManageCrews: () => void
}) => {
  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={onManageCrews}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Crew Availability
          </h2>
          <BriefcaseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="h-40 flex items-center justify-center text-gray-500">
          No crew data available
        </div>
      </motion.div>
    )
  }

  const availabilityColor = data.percentage >= 80 ? 'text-green-600'
    : data.percentage >= 50 ? 'text-yellow-600'
      : 'text-red-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="card p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onManageCrews}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Crew Availability
        </h2>
        <BriefcaseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Main Metric */}
      <div className="text-center mb-6">
        <div className={`text-4xl font-bold ${availabilityColor}`}>
          {data.percentage}%
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {data.available} of {data.total} members available
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-6 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.percentage}%` }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`h-full rounded-full ${data.percentage >= 80 ? 'bg-green-500'
            : data.percentage >= 50 ? 'bg-yellow-500'
              : 'bg-red-500'
            }`}
        />
      </div>

      {/* Crew Breakdown */}
      {data.byCrew && data.byCrew.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            By Crew:
          </h3>
          {data.byCrew.slice(0, 3).map((crew) => (
            <div key={crew.crewName} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">{crew.crewName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {crew.available}/{crew.total}
                </span>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(crew.available / crew.total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-green-600 mt-4 text-center">
        Click to manage crews
      </p>
    </motion.div>
  )
}

// ============================================================================
// ALERTS CARD (STOCK + COMMUNICATIONS)
// ============================================================================

const AlertsCard = ({
  stockAlerts,
  communicationAlerts,
  showStock,
  showComms,
  onToggleStock,
  onToggleComms,
  onViewAllStock,
  onViewAllComms,
  onViewStockItem,
  onViewCommsByType,
}: {
  stockAlerts: StockAlert[]
  communicationAlerts: CommunicationAlert[]
  showStock: boolean
  showComms: boolean
  onToggleStock: () => void
  onToggleComms: () => void
  onViewAllStock: () => void
  onViewAllComms: () => void
  onViewStockItem: (id: string) => void
  onViewCommsByType: (type: string) => void
}) => {
  const urgentStock = stockAlerts.filter(s => s.urgent)
  const totalUnread = communicationAlerts.reduce((sum, c) => sum + c.unread, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Alerts & Notifications
        </h2>
        <BellIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>

      {/* Stock Alerts Section */}
      <div className="mb-4">
        <button
          onClick={onToggleStock}
          className="w-full flex items-center justify-between text-left mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Low Stock Alerts {stockAlerts.length > 0 && `(${stockAlerts.length})`}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {showStock ? '▼' : '▶'}
          </span>
        </button>

        <AnimatePresence>
          {showStock && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {urgentStock.length > 0 && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
                    ⚠️ URGENT - Reorder Now
                  </p>
                  {urgentStock.slice(0, 2).map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => onViewStockItem(alert.id)}
                      className="text-sm flex justify-between py-1 cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/40 rounded px-1 transition-colors"
                    >
                      <span className="text-gray-600 dark:text-gray-400">{alert.materialName}</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        {alert.currentStock} / {alert.reorderLevel} {alert.unit}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {stockAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onViewStockItem(alert.id)}
                  className="flex items-center justify-between py-2 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors"
                >
                  <div>
                    <span className="text-gray-700 dark:text-gray-300">{alert.materialName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 ml-2">
                      ({alert.supplier})
                    </span>
                  </div>
                  <span className={alert.currentStock <= alert.reorderLevel ? 'text-yellow-600 font-medium' : 'text-gray-600'}>
                    {alert.currentStock} / {alert.reorderLevel} {alert.unit}
                  </span>
                </div>
              ))}

              {stockAlerts.length > 3 && (
                <button
                  onClick={onViewAllStock}
                  className="mt-2 text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium w-full text-center"
                >
                  View all {stockAlerts.length} stock alerts →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Communications Section */}
      <div>
        <button
          onClick={onToggleComms}
          className="w-full flex items-center justify-between text-left mb-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="w-4 h-4 text-blue-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              Unread Communications
            </span>
          </div>
          {totalUnread > 0 && (
            <span className="px-2 py-1 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
              {totalUnread}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showComms && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              {communicationAlerts.map((comm) => (
                <div
                  key={comm.type}
                  onClick={() => onViewCommsByType(comm.type)}
                  className="flex items-center justify-between py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-2 rounded transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {comm.type === 'email' && <EnvelopeIcon className="w-4 h-4 text-gray-500" />}
                    {comm.type === 'sms' && <ChatBubbleLeftIcon className="w-4 h-4 text-gray-500" />}
                    {comm.type === 'call' && <PhoneIcon className="w-4 h-4 text-gray-500" />}
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{comm.type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 dark:text-gray-500 text-xs">
                      Total: {comm.count}
                    </span>
                    {comm.unread > 0 && (
                      <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full">
                        {comm.unread} new
                      </span>
                    )}
                  </div>
                </div>
              ))}

              <button
                onClick={onViewAllComms}
                className="mt-2 w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 
                           hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg 
                           transition-colors text-gray-700 dark:text-gray-300"
              >
                View All Communications
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ============================================================================
// UPCOMING SCHEDULE TIMELINE (7 DAYS)
// ============================================================================

const ScheduleTimeline = ({
  schedule,
  onViewAll,
  onJobClick,
}: {
  schedule: ScheduleItem[]
  onViewAll: () => void
  onJobClick: (jobId: string) => void
}) => {
  // Group by date
  const groupedByDate = schedule.reduce((acc, item) => {
    const dateKey = item.date.toDateString()
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(item)
    return acc
  }, {} as Record<string, ScheduleItem[]>)

  const dates = Object.keys(groupedByDate).sort((a, b) =>
    new Date(a).getTime() - new Date(b).getTime()
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
      case 'in_progress': return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed': return 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
      case 'cancelled': return 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Schedule
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Next 7 days
          </span>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
        >
          View Full Schedule →
        </button>
      </div>

      {schedule.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No jobs scheduled for the next 7 days
        </div>
      ) : (
        <div className="space-y-6">
          {dates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {new Date(date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </h3>
              <div className="space-y-3">
                {groupedByDate[date].map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onJobClick(item.id)}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 
                               rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 
                               transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.jobTitle}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <div className="flex items-center gap-1">
                          <BriefcaseIcon className="w-3 h-3" />
                          {item.crewName || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3" />
                          {item.startTime} - {item.endTime}
                        </div>
                        <div className="flex items-center gap-1 col-span-2">
                          <MapPinIcon className="w-3 h-3" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

// ============================================================================
// REVENUE CHART (Enhanced)
// ============================================================================

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>
  className?: string
}

const RevenueChart = ({ data, className = "" }: RevenueChartProps) => {
  const hasData = data.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className={`card p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Revenue Trend
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monthly revenue from completed jobs
          </p>
        </div>
        <ChartPieIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </div>

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