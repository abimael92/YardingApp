/**
 * Job List Component
 *
 * Enhanced full CRUD list of all jobs with advanced features
 * Card layout, filters, stats, and consistent spacing.
 */

"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Grid } from "@/src/components/layout/Grid"
import { Button } from "@/src/components/layout/Button"
import { Card } from "@/src/components/layout/Card"
import { Input } from "@/src/components/layout/Input"
import { Skeleton } from "@/src/components/layout/Skeleton"
import { Modal } from "@/src/components/layout/Modal"
import { EmptyState } from "@/src/components/layout/EmptyState"
import { DataTable } from "@/src/components/layout/DataTable"
import { StatusBadge } from "@/src/components/layout/StatusBadge"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import { useFormPersistence } from "@/src/hooks/useFormPersistence"
import JobForm from "./JobForm"
import JobDetail from "./JobDetail"
import Link from "next/link"
import {
  getJobs,
  getJobStats,
  deleteJob,
  updateJob,
  getJobsByStatus,
  getUpcomingJobs,
  getOverdueJobs,
  getJobsByDateRange,
} from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import { getAllEmployees } from "@/src/services/employeeService"
import type { Job, Client, Employee, JobStatus, Priority } from "@/src/domain/entities"
import {
  BriefcaseIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline"

// Types
interface JobFilters {
  search: string
  status: string
  priority: string
  clientId: string
  dateRange: string
}

interface JobStats {
  total: number
  active: number
  completed: number
  overdue: number
  quoted: number
  draft: number
  byStatus: Record<string, number>
}

interface JobCardData extends Job {
  clientName: string
  assignedEmployeesCount: number
  completionPercentage: number
  isOverdue: boolean
}

// Enhanced FilterSelect with better styling
const FilterSelect = React.memo(({
  value,
  onChange,
  options,
  label,
  icon
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  icon?: React.ReactNode
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b85e1a]/60 dark:text-[#d4a574]/60">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 ${icon ? 'pl-10' : 'pl-3'} pr-8 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-colors appearance-none cursor-pointer`}
        aria-label={label}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b85e1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.25rem',
        }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
})

FilterSelect.displayName = 'FilterSelect'

// Enhanced Job Card for mobile/tablet view
const JobCard = ({
  job,
  onClick,
  onEdit,
  onDelete
}: {
  job: JobCardData
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}) => {
  const [expanded, setExpanded] = useState(false)

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400 font-bold"
      case "high": return "text-orange-600 dark:text-orange-400"
      case "medium": return "text-yellow-600 dark:text-yellow-400"
      case "low": return "text-green-600 dark:text-green-400"
      default: return "text-gray-600"
    }
  }

  const getStatusConfig = (status: JobStatus) => {
    const config: Record<JobStatus, { bg: string; text: string; icon: any }> = {
      draft: { bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-700 dark:text-gray-300", icon: ClockIcon },
      quoted: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300", icon: CurrencyDollarIcon },
      scheduled: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-300", icon: CalendarIcon },
      in_progress: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", icon: ArrowPathIcon },
      completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", icon: CheckCircleIcon },
      cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", icon: XCircleIcon },
      on_hold: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300", icon: ExclamationTriangleIcon },
    }
    return config[status] || config.draft
  }

  const StatusIcon = getStatusConfig(job.status).icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-5 border border-[#d4a574]/30 hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${job.status === 'completed' ? 'from-green-600 to-green-800' :
              job.status === 'in_progress' ? 'from-purple-600 to-purple-800' :
                job.status === 'scheduled' ? 'from-amber-600 to-amber-800' :
                  job.status === 'cancelled' ? 'from-red-600 to-red-800' :
                    'from-[#2e8b57] to-[#8b4513]'
              } flex items-center justify-center`}>
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] group-hover:text-[#2e8b57] transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[#b85e1a] dark:text-[#d88c4a]">{job.jobNumber}</span>
                <span className="text-[#b85e1a]/50">•</span>
                <span className="text-[#b85e1a]/70">{job.clientName}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="p-2 rounded-lg hover:bg-[#2e8b57]/10 text-[#2e8b57] transition-colors"
            title="Edit job"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
            title="Delete job"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-[#2e8b57]/10 p-2 rounded-lg text-center">
          <div className="text-sm font-medium text-[#2e8b57] dark:text-[#4a7c5c]">
            ${job.quotedPrice.amount.toFixed(2)}
          </div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Quoted</div>
        </div>
        <div className="bg-[#8b4513]/10 p-2 rounded-lg text-center">
          <div className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
            {job.assignedEmployeesCount || 0}
          </div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Team</div>
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${getStatusConfig(job.status).text}`} />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusConfig(job.status).bg} ${getStatusConfig(job.status).text}`}>
            {job.status.replace("_", " ")}
          </span>
        </div>
        <span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>
          {job.priority}
        </span>
      </div>

      {/* Schedule */}
      <div className="space-y-1 text-xs text-[#b85e1a]/70 dark:text-gray-400 mb-3">
        {job.scheduledStart && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3 h-3" />
            <span>
              {new Date(job.scheduledStart).toLocaleDateString()}
              {job.scheduledEnd && ` - ${new Date(job.scheduledEnd).toLocaleDateString()}`}
            </span>
          </div>
        )}
        {job.isOverdue && (
          <div className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="w-3 h-3" />
            <span className="font-medium">Overdue</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {job.status === 'in_progress' && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#b85e1a]/70">Progress</span>
            <span className="font-medium text-[#2e8b57]">{job.completionPercentage || 0}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${job.completionPercentage || 0}%` }}
              className="h-full bg-gradient-to-r from-[#2e8b57] to-[#4a7c5c]"
            />
          </div>
        </div>
      )}

      {/* Quick actions footer */}
      <div className="mt-3 pt-3 border-t border-[#d4a574]/30">
        <div className="flex justify-center gap-4 text-xs">
          <Link
            href={`/admin/jobs/${job.id}`}
            className="flex items-center gap-1 text-[#2e8b57] hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <EyeIcon className="w-3 h-3" />
            View Details
          </Link>
          <span className="flex items-center gap-1 text-[#b85e1a]">
            <CalendarIcon className="w-3 h-3" />
            Schedule
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export const JobList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "all"

  // State management
  const [jobs, setJobs] = useState<Job[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [stats, setStats] = useState<JobStats>({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0,
    quoted: 0,
    draft: 0,
    byStatus: {}
  })
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterClient, setFilterClient] = useState<string>("all")
  const [dateRange, setDateRange] = useState<string>("all")
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [clientMap, setClientMap] = useState<Record<string, string>>({})
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({})
  const [completionPercentages, setCompletionPercentages] = useState<Record<string, number>>({})

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // Filter options
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' },
  ], [])

  const priorityOptions = useMemo(() => [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ], [])

  const clientOptions = useMemo(() => [
    { value: 'all', label: 'All Clients' },
    ...clients.map(c => ({ value: c.id, label: c.name }))
  ], [clients])

  const dateRangeOptions = useMemo(() => [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
  ], [])

  // Persist filters in localStorage
  const { value: persistedFilters, setValue: setPersistedFilters } = useFormPersistence('job-filters', {
    search: '',
    status: 'all',
    priority: 'all',
    clientId: 'all',
    dateRange: 'all'
  })

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [jobsData, clientsData, employeesData, statsData] = await Promise.all([
        getJobs(),
        getAllClients(),
        getAllEmployees(),
        getJobStats()
      ])

      setJobs(jobsData)
      setClients(clientsData)
      setEmployees(employeesData)
      setStats(statsData as JobStats)

      // Build client map for quick lookups
      const map: Record<string, string> = {}
      clientsData.forEach(c => { map[c.id] = c.name })
      setClientMap(map)

      // Simulate assignment counts (replace with actual API)
      const counts: Record<string, number> = {}
      jobsData.forEach(j => { counts[j.id] = Math.floor(Math.random() * 3) })
      setAssignmentCounts(counts)

      // Simulate completion percentages (replace with actual API)
      const percentages: Record<string, number> = {}
      jobsData.forEach(j => {
        percentages[j.id] = j.status === 'completed' ? 100 :
          j.status === 'in_progress' ? Math.floor(Math.random() * 80) + 20 : 0
      })
      setCompletionPercentages(percentages)

    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Initialize filters from persisted state
  useEffect(() => {
    if (persistedFilters) {
      setSearchQuery(persistedFilters.search || '')
      setFilterStatus(persistedFilters.status || 'all')
      setFilterPriority(persistedFilters.priority || 'all')
      setFilterClient(persistedFilters.clientId || 'all')
      setDateRange(persistedFilters.dateRange || 'all')
    }
  }, [persistedFilters])

  useEffect(() => {
    setPersistedFilters({
      search: searchQuery,
      status: filterStatus,
      priority: filterPriority,
      clientId: filterClient,
      dateRange: dateRange
    })
  }, [searchQuery, filterStatus, filterPriority, filterClient, dateRange, setPersistedFilters])

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = searchQuery === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (clientMap[job.clientId]?.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = filterStatus === 'all' || job.status === filterStatus
      const matchesPriority = filterPriority === 'all' || job.priority === filterPriority
      const matchesClient = filterClient === 'all' || job.clientId === filterClient

      // Date range filtering
      let matchesDate = true
      if (dateRange !== 'all' && job.scheduledStart) {
        const jobDate = new Date(job.scheduledStart)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (dateRange) {
          case 'today':
            matchesDate = jobDate >= today && jobDate < new Date(today.getTime() + 86400000)
            break
          case 'week':
            const weekStart = new Date(today.getTime() - today.getDay() * 86400000)
            const weekEnd = new Date(weekStart.getTime() + 7 * 86400000)
            matchesDate = jobDate >= weekStart && jobDate < weekEnd
            break
          case 'month':
            matchesDate = jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear()
            break
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3)
            const jobQuarter = Math.floor(jobDate.getMonth() / 3)
            matchesDate = jobQuarter === quarter && jobDate.getFullYear() === now.getFullYear()
            break
          case 'year':
            matchesDate = jobDate.getFullYear() === now.getFullYear()
            break
        }
      }

      return matchesSearch && matchesStatus && matchesPriority && matchesClient && matchesDate
    })
  }, [jobs, searchQuery, filterStatus, filterPriority, filterClient, dateRange, clientMap])

  // Calculate overdue jobs
  const overdueJobs = useMemo(() => {
    const now = new Date()
    return jobs.filter(job =>
      job.status === 'scheduled' &&
      job.scheduledEnd &&
      new Date(job.scheduledEnd) < now
    ).length
  }, [jobs])

  // Handlers
  const handleCreate = () => {
    setSelectedJob(null)
    setShowCreateModal(true)
  }

  const handleEdit = (job: Job) => {
    setSelectedJob(job)
    setShowEditModal(true)
  }

  const handleViewDetail = (job: Job) => {
    setSelectedJob(job)
    setShowDetailModal(true)
  }

  const handleDelete = async (job: Job) => {
    if (!confirm(`Are you sure you want to delete ${job.title}?`)) return

    setUpdatingId(job.id)
    try {
      await deleteJob(job.id)
      await loadData()
    } catch (error) {
      console.error("Failed to delete job:", error)
      alert("Failed to delete job")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFormSuccess = async () => {
    setShowCreateModal(false)
    setShowEditModal(false)
    await loadData()
  }

  const handleExpandRow = (jobId: string) => {
    setExpandedRowId(expandedRowId === jobId ? null : jobId)
  }

  const getStatusBadge = (status: JobStatus) => {
    const config: Record<JobStatus, { bg: string; text: string }> = {
      draft: { bg: "bg-gray-100 dark:bg-gray-700/50", text: "text-gray-700 dark:text-gray-300" },
      quoted: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-800 dark:text-blue-300" },
      scheduled: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-800 dark:text-amber-300" },
      in_progress: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300" },
      completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300" },
      cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300" },
      on_hold: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-800 dark:text-orange-300" },
    }
    const { bg, text } = config[status] ?? config.draft
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {status.replace("_", " ")}
      </span>
    )
  }

  const getPriorityBadge = (priority: Priority) => {
    const colors = {
      low: "text-green-600 dark:text-green-400",
      medium: "text-yellow-600 dark:text-yellow-400",
      high: "text-orange-600 dark:text-orange-400",
      urgent: "text-red-600 dark:text-red-400 font-bold",
    }
    return (
      <span className={`font-medium capitalize ${colors[priority]}`}>
        {priority}
      </span>
    )
  }

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  // Table columns
  const columns = [
    {
      key: "title",
      header: "Job",
      render: (job: Job) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExpandRow(job.id)}
            className="p-1 rounded hover:bg-[#d4a574]/20 text-[#8b4513] dark:text-[#d4a574]"
            aria-expanded={expandedRowId === job.id}
          >
            {expandedRowId === job.id ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => handleViewDetail(job)}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:ring-offset-2 rounded-lg p-1 group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${job.status === 'completed' ? 'from-green-600 to-green-800' :
              job.status === 'in_progress' ? 'from-purple-600 to-purple-800' :
                job.status === 'scheduled' ? 'from-amber-600 to-amber-800' :
                  job.status === 'cancelled' ? 'from-red-600 to-red-800' :
                    'from-[#2e8b57] to-[#8b4513]'
              } flex items-center justify-center text-white font-bold text-sm`}>
              {job.jobNumber.split('-').pop() || 'JB'}
            </div>
            <div className="text-left">
              <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{job.title}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[#b85e1a] dark:text-[#d88c4a]">{job.jobNumber}</span>
                <span className="text-[#b85e1a]/50">•</span>
                <span className="text-[#b85e1a]/70">{clientMap[job.clientId] || 'Unknown'}</span>
              </div>
            </div>
          </button>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (job: Job) => getStatusBadge(job.status),
    },
    {
      key: "priority",
      header: "Priority",
      render: (job: Job) => getPriorityBadge(job.priority),
    },
    {
      key: "price",
      header: "Quoted",
      render: (job: Job) => (
        <span className="font-medium text-[#2e8b57] dark:text-[#4a7c5c]">
          {formatCurrency(job.quotedPrice)}
        </span>
      ),
    },
    {
      key: "team",
      header: "Team",
      render: (job: Job) => (
        <span className="text-[#8b4513] dark:text-[#d4a574]">
          {assignmentCounts[job.id] || 0} members
        </span>
      ),
    },
    {
      key: "schedule",
      header: "Schedule",
      render: (job: Job) => (
        <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
          {job.scheduledStart ? new Date(job.scheduledStart).toLocaleDateString() : 'Not scheduled'}
          {job.status === 'scheduled' && job.scheduledEnd && new Date(job.scheduledEnd) < new Date() && (
            <span className="ml-2 text-red-600 font-medium">Overdue</span>
          )}
        </div>
      ),
    },
    {
      key: "progress",
      header: "Progress",
      render: (job: Job) => (
        <div className="w-24">
          {job.status === 'in_progress' ? (
            <div className="space-y-1">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#2e8b57] h-1.5 rounded-full"
                  style={{ width: `${completionPercentages[job.id] || 0}%` }}
                />
              </div>
              <span className="text-xs text-[#2e8b57]">{completionPercentages[job.id] || 0}%</span>
            </div>
          ) : job.status === 'completed' ? (
            <span className="text-xs text-green-600">Complete</span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (job: Job) => {
        const isOpen = openDropdownId === job.id

        return (
          <div className="relative dropdown-container">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDropdownId(isOpen ? null : job.id)}
              className="!px-2 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#4a7c5c]"
              aria-label="Actions menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg shadow-lg border border-[#d4a574] dark:border-[#8b4513] py-1 z-50">
                <button
                  onClick={() => { handleViewDetail(job); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => { handleEdit(job); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <div className="border-t border-[#d4a574] dark:border-[#8b4513] my-1"></div>
                <button
                  onClick={() => { handleDelete(job); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        )
      },
    },
  ]

  // Mobile job card
  const MobileJobCard = ({ job }: { job: Job }) => {
    const cardData: JobCardData = {
      ...job,
      clientName: clientMap[job.clientId] || 'Unknown',
      assignedEmployeesCount: assignmentCounts[job.id] || 0,
      completionPercentage: completionPercentages[job.id] || 0,
      isOverdue: job.status === 'scheduled' && !!job.scheduledEnd && new Date(job.scheduledEnd) < new Date()
    }

    return (
      <JobCard
        job={cardData}
        onClick={() => handleViewDetail(job)}
        onEdit={(e) => { e.stopPropagation(); handleEdit(job); }}
        onDelete={(e) => { e.stopPropagation(); handleDelete(job); }}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-4 sm:mt-0">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16" />)}
        </div>
      </div>
    )
  }

  const statCardBase = "rounded-xl border p-5 transition-shadow hover:shadow-md flex flex-col gap-2 min-h-[100px] justify-center"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-3xl tracking-tight">
          Jobs
        </h1>
        <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
          Manage work orders, track progress, and schedule jobs
        </p>
      </div>

      {/* Stats Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${statCardBase} bg-white dark:bg-gray-800 border-[#d4a574]/30`}>
            <div className="flex items-center gap-2 text-[#b85e1a]/80 dark:text-gray-400">
              <BriefcaseIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Jobs</span>
            </div>
            <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{stats.total}</div>
          </Card>

          <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
            <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
              <ArrowPathIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Active</span>
            </div>
            <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{stats.active}</div>
          </Card>

          <Card className={`${statCardBase} bg-[#8b4513]/5 dark:bg-[#8b4513]/10 border-[#8b4513]/30`}>
            <div className="flex items-center gap-2 text-[#8b4513] dark:text-[#d4a574]">
              <CheckCircleIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Completed</span>
            </div>
            <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{stats.completed}</div>
          </Card>

          <Card className={`${statCardBase} ${overdueJobs > 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-300' : 'bg-white dark:bg-gray-800 border-[#d4a574]/30'}`}>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Overdue</span>
            </div>
            <div className={`text-2xl font-bold ${overdueJobs > 0 ? 'text-red-600 dark:text-red-400' : 'text-[#8b4513] dark:text-[#d4a574]'}`}>
              {overdueJobs}
            </div>
          </Card>
        </div>
      </section>

      {/* Filters & Actions */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Filters & Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-1">
            <Input
              type="search"
              placeholder="Search jobs, clients, numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent rounded-lg"
              aria-label="Search jobs"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 pointer-events-none" />
          </div>

          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            label="Status"
            icon={<FunnelIcon className="w-4 h-4" />}
          />

          <FilterSelect
            value={filterPriority}
            onChange={setFilterPriority}
            options={priorityOptions}
            label="Priority"
            icon={<ExclamationTriangleIcon className="w-4 h-4" />}
          />

          <FilterSelect
            value={filterClient}
            onChange={setFilterClient}
            options={clientOptions}
            label="Client"
            icon={<BuildingOfficeIcon className="w-4 h-4" />}
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={handleCreate}
              className="w-full sm:w-auto bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
            >
              <PlusIcon className="w-5 h-5 mr-2 inline" />
              New Job
            </Button>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Job List
        </h2>

        {filteredJobs.length === 0 ? (
          <EmptyState
            title="No jobs found"
            description={searchQuery || filterStatus !== 'all' || filterPriority !== 'all' || filterClient !== 'all'
              ? "Try adjusting your filters"
              : "Get started by creating your first job"
            }
            action={
              <Button
                variant="primary"
                onClick={handleCreate}
                className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
              >
                Create Job
              </Button>
            }
          />
        ) : isMobile ? (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <MobileJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden border-[#d4a574]/30 dark:border-[#8b4513]/50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                <thead className="bg-[#f5f1e6] dark:bg-gray-800">
                  <tr>
                        {columns.map((col) => (
                          <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
                            {col.header}
                          </th>
                        ))}
                  </tr>
                </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                      {filteredJobs.map((job) => (
                        <React.Fragment key={job.id}>
                          <tr className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50 transition-colors">
                            {columns.map((col) => (
                              <td key={col.key} className="px-4 py-3 text-sm">
                                {col.render(job)}
                              </td>
                            ))}
                          </tr>
                          {expandedRowId === job.id && (
                            <tr className="bg-[#f5f1e6]/30 dark:bg-gray-800/30">
                              <td colSpan={columns.length} className="px-4 py-3">
                                <div className="text-sm">
                                  <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">Job Details</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-[#b85e1a]/70 mb-1">Description</p>
                                      <p className="text-[#8b4513] dark:text-[#d4a574]">
                                        {job.description || 'No description provided'}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-[#b85e1a]/70 mb-1">Location</p>
                                      <p className="text-[#8b4513] dark:text-[#d4a574]">
                                        {job.address.street}, {job.address.city}, {job.address.state} {job.address.zipCode}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Modals */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Job" size="lg">
        <JobForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleFormSuccess}
          clients={clients}
          employees={employees}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Job" size="lg">
        {selectedJob && (
          <JobForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            job={selectedJob}
            clients={clients}
            employees={employees}
          />
        )}
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Job Details" size="lg">
        {selectedJob && (
          <JobDetail
            isOpen={showDetailModal}
            onClose={() => setShowDetailModal(false)}
            job={selectedJob}
            clients={clients}
            employees={employees}
            onInvoiceGenerated={() => {
              console.log("[JobList] Invoice generated, refreshing data")
              loadData()
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default JobList