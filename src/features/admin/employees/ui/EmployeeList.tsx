// components/employees/EmployeeList.tsx
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Grid } from "@/src/components/layout/Grid"
import { Button } from "@/src/components/layout/Button"
import { Card } from "@/src/components/layout/Card"
import { Input } from "@/src/components/layout//Input"
import { Skeleton } from "@/src/components/layout/Skeleton"
import { Modal } from "@/src/components/layout/Modal"
import { EmptyState } from "@/src/components/layout/EmptyState"
import { DataTable } from "@/src/components/layout/DataTable"
import { StatusBadge } from "@/src/components/layout/StatusBadge"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import { useFormPersistence } from "@/src/hooks/useFormPersistence"
import EmployeeForm from "./EmployeeForm"
import EmployeeDetail from "./EmployeeDetail"
import AssignJobModal from "./AssignJobModal"
import TimeTrackingModal from "./TimeTrackingModal"
import {
  getAllEmployees,
  getEmployeeAssignments,
  getEmployeeStats,
  deleteEmployee,
  updateEmployee
} from "@/src/services/employeeService"
import { mapUserToEmployee } from '@/src/lib/mappers/employeeMappers';
import type { User, JobAssignment, EmployeeStats } from "@/src/domain/models"
import {
  UserGroupIcon,
  BriefcaseIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline"

// Types for crew management
interface CrewCardData {
  id: string
  crewName: string
  supervisor: string
  supervisorId?: string
  available: number
  total: number
  onJob: number
  members?: Array<{
    id: string
    name: string
    role: string
    status: string
    avatar?: string
    employeeId: string
  }>
}

interface CrewDetailData {
  id: string
  name: string
  supervisorName: string | null
  supervisorId: string | null
  description: string | null
  createdAt: string
  members: Array<{
    id: string
    employeeId: string
    employeeName: string
    role: string
    isActive: boolean
    joinedAt: string
  }>
  jobs: Array<{
    id: string
    jobId: string
    jobNumber: string
    jobTitle: string
    status: string
    assignedAt: string
  }>
}

interface ApiEmployee {
  id: string
  fullName: string
  email: string
  status: string
  role?: string
  department?: string
  avatar?: string
}

interface ApiJob {
  id: string
  jobNumber: string
  title: string
  status: string
  clientName?: string
  scheduledDate?: string
}

interface EmployeeFilters {
  search: string
  status: string
  role: string
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

// Enhanced Crew Card with more features
const CrewCard = ({
  crew,
  onClick,
  onEdit,
  onDelete
}: {
  crew: CrewCardData
  onClick: () => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const availabilityPercentage = crew.total > 0 ? (crew.available / crew.total) * 100 : 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="card p-6 border border-[#d4a574]/30 hover:shadow-xl transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header with actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center">
              <BriefcaseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574] group-hover:text-[#2e8b57] transition-colors">
                {crew.crewName}
              </h3>
              <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">
                Supervisor: {crew.supervisor}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(e); }}
            className="p-2 rounded-lg hover:bg-[#2e8b57]/10 text-[#2e8b57] transition-colors"
            title="Edit crew"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(e); }}
            className="p-2 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
            title="Delete crew"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#2e8b57]/10 p-2 rounded-lg text-center">
          <div className="text-xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{crew.total}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-[#2e8b57]/10 p-2 rounded-lg text-center">
          <div className="text-xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{crew.available}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Available</div>
        </div>
        <div className="bg-[#d88c4a]/10 p-2 rounded-lg text-center">
          <div className="text-xl font-bold text-[#b85e1a] dark:text-[#d88c4a]">{crew.onJob}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">On Jobs</div>
        </div>
      </div>

      {/* Availability bar */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-[#b85e1a]/70 dark:text-gray-400">Crew Availability</span>
          <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">
            {crew.available}/{crew.total} available
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${availabilityPercentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-[#2e8b57] to-[#4a7c5c] rounded-full"
          />
        </div>
      </div>

      {/* Member preview with expand/collapse */}
      {crew.members && crew.members.length > 0 && (
        <div className="mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="flex items-center justify-between w-full text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2 hover:text-[#2e8b57] transition-colors"
          >
            <span>Team Members ({crew.members.length})</span>
            {expanded ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {(expanded ? crew.members : crew.members.slice(0, 2)).map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center justify-between py-2 px-2 hover:bg-[#f5f1e6] dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white text-xs font-bold">
                    {member.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">{member.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#2e8b57]/10 text-[#2e8b57]">
                    {member.role}
                  </span>
                  {member.status === 'active' ? (
                    <CheckCircleIcon className="w-4 h-4 text-[#2e8b57]" />
                  ) : (
                    <XCircleIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {!expanded && crew.members.length > 2 && (
            <p className="text-xs text-[#2e8b57] dark:text-[#4a7c5c] mt-1 text-center">
              +{crew.members.length - 2} more members (click to expand)
            </p>
          )}
        </div>
      )}

      {/* Quick actions footer */}
      <div className="mt-4 pt-4 border-t border-[#d4a574]/30 dark:border-gray-700">
        <div className="flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-[#2e8b57]">
            <CalendarIcon className="w-3 h-3" />
            View Schedule
          </span>
          <span className="flex items-center gap-1 text-[#b85e1a]">
            <ClockIcon className="w-3 h-3" />
            Track Time
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export const EmployeeList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "employees"

  // State management
  const [employees, setEmployees] = useState<User[]>([])
  const [stats, setStats] = useState<EmployeeStats>({ total: 0, active: 0, pending: 0, inactive: 0 })
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<JobAssignment[]>([])
  const [showAssignments, setShowAssignments] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHireModal, setShowHireModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignJobModal, setShowAssignJobModal] = useState(false)
  const [showTimeTrackingModal, setShowTimeTrackingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterRole, setFilterRole] = useState<string>("all")

  // Crew state
  const [crews, setCrews] = useState<CrewCardData[]>([])
  const [crewsLoading, setCrewsLoading] = useState(false)
  const [selectedCrew, setSelectedCrew] = useState<CrewDetailData | null>(null)
  const [showCrewForm, setShowCrewForm] = useState(false)
  const [editingCrew, setEditingCrew] = useState<CrewCardData | null>(null)
  const [showCrewDetail, setShowCrewDetail] = useState(false)
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showAssignJobsModal, setShowAssignJobsModal] = useState(false)
  const [availableEmployees, setAvailableEmployees] = useState<ApiEmployee[]>([])
  const [availableJobs, setAvailableJobs] = useState<ApiJob[]>([])
  const [editingCrewDetail, setEditingCrewDetail] = useState<CrewDetailData | null>(null)
  const [crewFilterStatus, setCrewFilterStatus] = useState<string>("all")
  const [crewSortBy, setCrewSortBy] = useState<string>("name")

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // Filter options
  const statusOptions = useMemo(() => [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Inactive', label: 'Inactive' },
  ], [])

  const roleOptions = useMemo(() => [
    { value: 'all', label: 'All Roles' },
    { value: 'Worker', label: 'Worker' },
    { value: 'Supervisor', label: 'Supervisor' },
  ], [])

  const crewFilterOptions = useMemo(() => [
    { value: 'all', label: 'All Crews' },
    { value: 'available', label: 'Has Available Members' },
    { value: 'full', label: 'Fully Booked' },
    { value: 'empty', label: 'No Members' },
  ], [])

  const crewSortOptions = useMemo(() => [
    { value: 'name', label: 'Sort by Name' },
    { value: 'members', label: 'Sort by Members' },
    { value: 'available', label: 'Sort by Available' },
    { value: 'newest', label: 'Newest First' },
  ], [])

  // Persist filters in localStorage
  const { value: persistedFilters, setValue: setPersistedFilters } = useFormPersistence('employee-filters', {
    search: '',
    status: 'all',
    role: 'all'
  })

  // Load employee data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allUsers, statsData] = await Promise.all([
        getAllEmployees(),
        getEmployeeStats()
      ])

      const users: User[] = allUsers.map(emp => {
        const roleStr = String(emp.role).toLowerCase();
        const statusStr = String(emp.status).toLowerCase();

        let role: User['role'] = "Worker";
        if (roleStr === "supervisor") role = "Supervisor";
        else if (roleStr === "worker" || roleStr === "employee") role = "Worker";
        else if (roleStr === "admin") role = "Admin";
        else if (roleStr === "client") role = "Client";

        let status: User['status'] = "Inactive";
        if (statusStr === "active") status = "Active";
        else if (statusStr === "pending") status = "Pending";

        return {
          id: emp.id,
          name: emp.displayName || `${emp.firstName} ${emp.lastName}`,
          email: emp.email,
          role: role,
          status: status,
          joinDate: emp.hireDate,
          employeeNumber: emp.employeeNumber,
          department: emp.department,
          position: emp.role,
          phone: emp.phone,
          avatar: emp.avatar,
          assignedJobs: [],
          hourlyRate: emp.hourlyRate,
        }
      })

      setEmployees(users.filter(u => u.role === "Worker" || u.role === "Supervisor"))
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Fetch real crews from API with enhanced data
  const fetchCrews = useCallback(async () => {
    setCrewsLoading(true)
    try {
      const res = await fetch("/api/crews")
      if (!res.ok) throw new Error("Failed to fetch crews")
      const crewsData = await res.json()

      const crewsWithMembers = await Promise.all(
        crewsData.map(async (crew: any) => {
          const [membersRes, jobsRes] = await Promise.all([
            fetch(`/api/crews/${crew.id}/members`),
            fetch(`/api/crews/${crew.id}/jobs`)
          ])

          const members = membersRes.ok ? await membersRes.json() : []
          const jobs = jobsRes.ok ? await jobsRes.json() : []

          const total = members.length
          const available = members.filter((m: any) => m.isActive !== false).length

          return {
            id: crew.id,
            crewName: crew.name,
            supervisor: crew.supervisorName || "Unassigned",
            supervisorId: crew.supervisorId,
            available,
            total,
            onJob: jobs.length,
            members: members.map((m: any) => ({
              id: m.id,
              name: m.employeeName,
              role: m.role || "Worker",
              status: m.isActive ? "active" : "inactive",
              employeeId: m.employeeId
            })),
          }
        })
      )

      // Apply filters and sorting
      let filtered = crewsWithMembers
      if (crewFilterStatus === 'available') {
        filtered = filtered.filter(c => c.available > 0)
      } else if (crewFilterStatus === 'full') {
        filtered = filtered.filter(c => c.available === 0 && c.total > 0)
      } else if (crewFilterStatus === 'empty') {
        filtered = filtered.filter(c => c.total === 0)
      }

      // Apply sorting
      filtered.sort((a, b) => {
        switch (crewSortBy) {
          case 'members':
            return b.total - a.total
          case 'available':
            return b.available - a.available
          case 'newest':
            return (b as any).createdAt ? 1 : -1 // Add createdAt to schema if needed
          default:
            return a.crewName.localeCompare(b.crewName)
        }
      })

      setCrews(filtered)
    } catch (error) {
      console.error("Failed to load crews:", error)
      setCrews([])
    } finally {
      setCrewsLoading(false)
    }
  }, [crewFilterStatus, crewSortBy])

  useEffect(() => {
    if (activeTab === "crews") fetchCrews()
  }, [activeTab, fetchCrews, crewFilterStatus, crewSortBy])

  // Crew CRUD operations
  const handleCreateCrew = async (name: string, description?: string, supervisorId?: string) => {
    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null, supervisorId: supervisorId || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create crew")
      setShowCrewForm(false)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to create crew")
    }
  }

  const handleUpdateCrew = async (id: string, name: string, description?: string, supervisorId?: string) => {
    try {
      const res = await fetch(`/api/crews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description ?? null, supervisorId: supervisorId ?? null }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update crew")
      setEditingCrew(null)
      setEditingCrewDetail(null)
      setShowCrewForm(false)
      if (selectedCrew?.id === id) setSelectedCrew(null)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update crew")
    }
  }

  const handleDeleteCrew = async (id: string) => {
    if (!confirm("Delete this crew? This will remove all member and job assignments.")) return
    try {
      const res = await fetch(`/api/crews/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete crew")
      setSelectedCrew(null)
      setShowCrewDetail(false)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete crew")
    }
  }

  const handleAddMember = async (crewId: string, employeeId: string) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add member")
      setShowAddMemberModal(false)
      await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to add member")
    }
  }

  const handleRemoveMember = async (crewId: string, employeeId: string) => {
    if (!confirm("Remove this member from the crew?")) return
    try {
      const res = await fetch(`/api/crews/${crewId}/members?employeeId=${encodeURIComponent(employeeId)}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove member")
      await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove member")
    }
  }

  const handleAssignJobsToCrew = async (crewId: string, jobIds: string[]) => {
    try {
      const res = await fetch(`/api/crews/${crewId}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobIds }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to assign jobs")
      setShowAssignJobsModal(false)
      await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to assign jobs")
    }
  }

  const handleRemoveJobFromCrew = async (crewId: string, jobId: string) => {
    if (!confirm("Remove this job assignment?")) return
    try {
      const res = await fetch(`/api/crews/${crewId}/jobs?jobId=${encodeURIComponent(jobId)}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove job")
      await loadCrewDetail(crewId)
      await fetchCrews()
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to remove job")
    }
  }

  const loadCrewDetail = useCallback(async (crewId: string) => {
    try {
      const [crewRes, membersRes, jobsRes] = await Promise.all([
        fetch(`/api/crews/${crewId}`),
        fetch(`/api/crews/${crewId}/members`),
        fetch(`/api/crews/${crewId}/jobs`),
      ])
      if (!crewRes.ok) throw new Error("Crew not found")
      const crewJson = await crewRes.json()
      const members = membersRes.ok ? await membersRes.json() : []
      const jobs = jobsRes.ok ? await jobsRes.json() : []

      setSelectedCrew({
        id: crewJson.id,
        name: crewJson.name,
        supervisorName: crewJson.supervisorName ?? null,
        supervisorId: crewJson.supervisorId ?? null,
        description: crewJson.description ?? null,
        createdAt: crewJson.createdAt,
        members: members.map((m: any) => ({
          id: m.id,
          employeeId: m.employeeId,
          employeeName: m.employeeName,
          role: m.role || "Worker",
          isActive: m.isActive !== false,
          joinedAt: m.joinedAt
        })),
        jobs: jobs.map((j: any) => ({
          id: j.id,
          jobId: j.jobId,
          jobNumber: j.jobNumber,
          jobTitle: j.jobTitle,
          status: j.status,
          assignedAt: j.assignedAt
        })),
      })
      setShowCrewDetail(true)
    } catch (e) {
      console.error("Failed to load crew detail:", e)
      alert(e instanceof Error ? e.message : "Failed to load crew")
    }
  }, [])

  // Employee handlers
  const handleStatusToggle = async (user: User) => {
    setUpdatingId(user.id)
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active"
      await updateEmployee(user.id, { status: newStatus as any })
      await loadData()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFire = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently fire this employee? This cannot be undone.")) {
      setUpdatingId(id)
      try {
        await deleteEmployee(id)
        await loadData()
      } catch (error) {
        console.error("Failed to fire employee:", error)
        alert("Failed to fire employee. Please try again.")
      } finally {
        setUpdatingId(null)
      }
    }
  }

  const handleViewAssignments = async (user: User) => {
    setSelectedEmployee(user)
    try {
      const userAssignments = await getEmployeeAssignments(user.id)
      setAssignments(userAssignments as JobAssignment[])
      setShowAssignments(true)
    } catch (error) {
      console.error("Failed to load assignments:", error)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedEmployee(user)
    setShowEditModal(true)
  }

  const handleViewDetail = (user: User) => {
    setSelectedEmployee(user)
    setShowDetailModal(true)
  }

  const handleAssignJob = (user: User) => {
    setSelectedEmployee(user)
    setShowAssignJobModal(true)
  }

  const handleTimeTracking = (user: User) => {
    setSelectedEmployee(user)
    setShowTimeTrackingModal(true)
  }

  const handleFormSuccess = () => {
    setShowEditModal(false)
    setShowHireModal(false)
    loadData()
  }

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.employeeNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase())

      const matchesStatus = filterStatus === 'all' || emp.status === filterStatus
      const matchesRole = filterRole === 'all' || emp.role === filterRole

      return matchesSearch && matchesStatus && matchesRole
    })
  }, [employees, searchQuery, filterStatus, filterRole])

  // Initialize filters from persisted state
  useEffect(() => {
    if (persistedFilters) {
      setSearchQuery(persistedFilters.search || '')
      setFilterStatus(persistedFilters.status || 'all')
      setFilterRole(persistedFilters.role || 'all')
    }
  }, [persistedFilters])

  useEffect(() => {
    setPersistedFilters({
      search: searchQuery,
      status: filterStatus,
      role: filterRole
    })
  }, [searchQuery, filterStatus, filterRole, setPersistedFilters])

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

  // Styling helpers
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Active":
        return "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c]"
      case "Pending":
        return "bg-[#d88c4a]/20 text-[#b85e1a] dark:text-[#d88c4a]"
      case "Inactive":
        return "bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d4a574]"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Supervisor":
        return "text-[#2e8b57] dark:text-[#4a7c5c] font-semibold"
      case "Worker":
        return "text-[#b85e1a] dark:text-[#d88c4a] font-semibold"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (user: User) => (
        <button
          onClick={() => handleViewDetail(user)}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:ring-offset-2 rounded-lg p-1 group"
          aria-label={`View details for ${user.name}`}
        >
          <div className="relative dropdown-container">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent group-hover:ring-[#2e8b57] transition-all">
              {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${user.status === "Active" ? "bg-[#2e8b57]" :
                user.status === "Pending" ? "bg-[#d88c4a]" : "bg-[#8b4513]"
              }`} />
          </div>
          <div className="text-left">
            <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{user.name}</div>
            <div className="flex items-center gap-2 text-xs">
              {user.employeeNumber && (
                <span className="text-[#b85e1a]/70 dark:text-gray-400">ID: {user.employeeNumber}</span>
              )}
              <span className="text-[#b85e1a]/50 dark:text-gray-600">•</span>
              <span className="text-[#b85e1a]/70 dark:text-gray-400">{user.email}</span>
            </div>
          </div>
        </button>
      ),
      hideOnMobile: false,
      hideOnTablet: false,
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) => (
        <span className={`${getRoleColor(user.role)}`}>{user.role}</span>
      ),
      hideOnMobile: false,
      hideOnTablet: false,
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
      ),
      hideOnMobile: false,
      hideOnTablet: false,
    },
    {
      key: "department",
      header: "Department",
      render: (user: User) => (
        <div className="text-[#8b4513] dark:text-[#d4a574]">
          {user.department || "—"}
        </div>
      ),
      hideOnMobile: true,
      hideOnTablet: false,
    },
    {
      key: "hourlyRate",
      header: "Rate",
      render: (user: User) => (
        <div className="text-[#2e8b57] dark:text-[#4a7c5c] font-medium">
          {user.hourlyRate ? `$${user.hourlyRate}/hr` : "—"}
        </div>
      ),
      hideOnMobile: true,
      hideOnTablet: true,
    },
    {
      key: "actions",
      header: "",
      render: (user: User) => {
        const isOpen = openDropdownId === user.id

        return (
          <div className="relative dropdown-container">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDropdownId(isOpen ? null : user.id)}
              className="!px-2 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#4a7c5c]"
              aria-label="Actions menu"
              aria-expanded={isOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg shadow-lg border border-[#d4a574] dark:border-[#8b4513] py-1 z-50">
                <div className="px-3 py-2 border-b border-[#d4a574] dark:border-[#8b4513]">
                  <p className="text-xs font-medium text-[#8b4513] dark:text-[#d4a574]">Quick Actions</p>
                </div>

                <button
                  onClick={() => { handleViewDetail(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => { handleViewAssignments(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Jobs
                </button>
                <button
                  onClick={() => { handleAssignJob(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Assign to Job
                </button>
                <button
                  onClick={() => { handleTimeTracking(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Track Time
                </button>
                <div className="border-t border-[#d4a574] dark:border-[#8b4513] my-1"></div>
                <button
                  onClick={() => { handleEdit(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { handleStatusToggle(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.status === "Active" ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => { handleFire(user.id); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Fire
                </button>
              </div>
            )}
          </div>
        )
      },
      hideOnMobile: false,
      hideOnTablet: false,
    },
  ]

  // Mobile employee card
  const EmployeeCard = ({ user }: { user: User }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <Card className="p-4 space-y-3 border-[#d4a574]/30 dark:border-[#8b4513]/50">
        <div className="flex items-start justify-between">
          <button
            onClick={() => handleViewDetail(user)}
            className="flex items-center space-x-3 flex-1 group"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white font-bold text-lg ring-2 ring-transparent group-hover:ring-[#2e8b57] transition-all">
                {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
              </div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${user.status === "Active" ? "bg-[#2e8b57]" :
                  user.status === "Pending" ? "bg-[#d88c4a]" : "bg-[#8b4513]"
                }`} />
            </div>
            <div className="text-left">
              <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{user.name}</div>
              <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">{user.email}</div>
            </div>
          </button>

          <div className="relative" ref={dropdownRef}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
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
                  onClick={() => { handleViewDetail(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  onClick={() => { handleViewAssignments(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Jobs
                </button>
                <button
                  onClick={() => { handleAssignJob(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Assign to Job
                </button>
                <button
                  onClick={() => { handleTimeTracking(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Track Time
                </button>
                <div className="border-t border-[#d4a574] dark:border-[#8b4513] my-1"></div>
                <button
                  onClick={() => { handleEdit(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => { handleStatusToggle(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  {user.status === "Active" ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => { handleFire(user.id); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Fire
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Role:</span>
            <span className={`ml-1 ${getRoleColor(user.role)}`}>{user.role}</span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Status:</span>
            <span className={`ml-1 ${getStatusColor(user.status)}`}>{user.status}</span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Dept:</span>
            <span className="ml-1 text-[#8b4513] dark:text-[#d4a574]">{user.department || "—"}</span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Rate:</span>
            <span className="ml-1 text-[#2e8b57] dark:text-[#4a7c5c]">
              {user.hourlyRate ? `$${user.hourlyRate}` : "—"}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  if (isLoading && activeTab === "employees") {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-20 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-3xl">
            {activeTab === "employees" ? "Employees" : "Crews"}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
            {activeTab === "employees"
              ? "Manage your workforce and track employee performance"
              : "View and manage your crews and team assignments"}
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#f5f1e6] dark:bg-gray-800 p-1 rounded-lg border border-[#d4a574]/30">
            <button
              onClick={() => router.push("/admin/employees?tab=employees")}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all
                ${activeTab === "employees"
                  ? "bg-[#2e8b57] text-white shadow-md"
                  : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
                }`}
            >
              <UserGroupIcon className="w-4 h-4" />
              Employees
            </button>
            <button
              onClick={() => router.push("/admin/employees?tab=crews")}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all
                ${activeTab === "crews"
                  ? "bg-[#2e8b57] text-white shadow-md"
                  : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
                }`}
            >
              <BriefcaseIcon className="w-4 h-4" />
              Crews
            </button>
          </div>

          {/* Stats Cards - Only show for employees tab */}
          {activeTab === "employees" && (
            <>
              <Card className="p-3 bg-[#2e8b57]/10 border border-[#2e8b57]/30 dark:border-[#4a7c5c]/50">
                <div className="text-xs text-[#2e8b57] dark:text-[#4a7c5c]">Active</div>
                <div className="text-xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{stats.active}</div>
              </Card>
              <Card className="p-3 bg-[#d88c4a]/10 border border-[#d88c4a]/30 dark:border-[#d88c4a]/50">
                <div className="text-xs text-[#b85e1a] dark:text-[#d88c4a]">Pending</div>
                <div className="text-xl font-bold text-[#b85e1a] dark:text-[#d88c4a]">{stats.pending}</div>
              </Card>
              <Card className="p-3 bg-[#8b4513]/10 border border-[#8b4513]/30 dark:border-[#d4a574]/50">
                <div className="text-xs text-[#8b4513] dark:text-[#d4a574]">Inactive</div>
                <div className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574]">{stats.inactive}</div>
              </Card>
              <Button
                variant="primary"
                onClick={() => setShowHireModal(true)}
                className="ml-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white transition-all hover:shadow-lg hover:shadow-[#2e8b57]/20 transform hover:-translate-y-0.5"
                aria-label="Hire new employee"
              >
                + Hire
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      {activeTab === "employees" ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 dark:placeholder-gray-500 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
              aria-label="Search employees"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 dark:text-[#d4a574]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <FilterSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={statusOptions}
            label="Filter by status"
            icon={<UserGroupIcon className="w-4 h-4" />}
          />
          <FilterSelect
            value={filterRole}
            onChange={setFilterRole}
            options={roleOptions}
            label="Filter by role"
            icon={<BriefcaseIcon className="w-4 h-4" />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FilterSelect
            value={crewFilterStatus}
            onChange={setCrewFilterStatus}
            options={crewFilterOptions}
            label="Filter crews"
            icon={<UsersIcon className="w-4 h-4" />}
          />
          <FilterSelect
            value={crewSortBy}
            onChange={setCrewSortBy}
            options={crewSortOptions}
            label="Sort crews"
            icon={<ChevronDownIcon className="w-4 h-4" />}
          />
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={() => { setEditingCrew(null); setEditingCrewDetail(null); setShowCrewForm(true); }}
              className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white w-full sm:w-auto"
            >
              <PlusIcon className="w-5 h-5 mr-2 inline" />
              Add Crew
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {activeTab === "employees" ? (
        <>
          {filteredEmployees.length === 0 ? (
            <EmptyState
              title="No employees found"
              description={searchQuery || filterStatus !== 'all' || filterRole !== 'all'
                ? "Try adjusting your filters"
                : "Get started by hiring your first employee"
              }
              action={
                <Button variant="primary" onClick={() => setShowHireModal(true)} className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white">
                  Hire Employee
                </Button>
              }
            />
          ) : isMobile ? (
            <div className="space-y-4">
              {filteredEmployees.map(employee => (
                <EmployeeCard key={employee.id} user={employee} />
              ))}
            </div>
          ) : (
            <div className="card overflow-hidden border-[#d4a574]/30 dark:border-[#8b4513]/50">
              <DataTable
                data={filteredEmployees}
                columns={columns.filter(col => {
                  if (isTablet && col.hideOnTablet) return false
                  if (isMobile && col.hideOnMobile) return false
                  return true
                })}
                keyExtractor={(user: User) => user.id}
                emptyMessage="No employees found."
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {crewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : crews.length === 0 ? (
            <EmptyState
              title="No crews found"
              description="Create your first crew to start organizing your team"
              action={
                <Button
                  variant="primary"
                  onClick={() => { setEditingCrew(null); setEditingCrewDetail(null); setShowCrewForm(true); }}
                  className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
                >
                  <PlusIcon className="w-5 h-5 mr-2 inline" />
                  Create Crew
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {crews.map((crew) => (
                <CrewCard
                  key={crew.id}
                  crew={crew}
                  onClick={() => loadCrewDetail(crew.id)}
                  onEdit={(e) => {
                    e.stopPropagation()
                    setEditingCrew(crew)
                    setEditingCrewDetail({
                      id: crew.id,
                      name: crew.crewName,
                      supervisorName: crew.supervisor,
                      supervisorId: crew.supervisorId || null,
                      description: null,
                      createdAt: new Date().toISOString(),
                      members: crew.members?.map(m => ({
                        id: m.id,
                        employeeId: m.employeeId,
                        employeeName: m.name,
                        role: m.role,
                        isActive: m.status === 'active',
                        joinedAt: new Date().toISOString()
                      })) || [],
                      jobs: []
                    })
                    setShowCrewForm(true)
                  }}
                  onDelete={(e) => {
                    e.stopPropagation()
                    handleDeleteCrew(crew.id)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Employee Modals */}
      <Modal isOpen={showHireModal} onClose={() => setShowHireModal(false)} title="Hire New Employee">
        <EmployeeForm
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Employee">
        {selectedEmployee && (
          <EmployeeForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            employee={mapUserToEmployee(selectedEmployee)}
          />
        )}
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Employee Details" size="lg">
        {selectedEmployee && (
          <EmployeeDetail
            isOpen={showDetailModal}
            employee={selectedEmployee as any}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>

      <Modal isOpen={showAssignJobModal} onClose={() => setShowAssignJobModal(false)} title="Assign Job">
        {selectedEmployee && (
          <AssignJobModal
            isOpen={showAssignJobModal}
            onClose={() => setShowAssignJobModal(false)}
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
            onSuccess={loadData}
          />
        )}
      </Modal>

      <Modal isOpen={showTimeTrackingModal} onClose={() => setShowTimeTrackingModal(false)} title="Time Tracking">
        {selectedEmployee && (
          <TimeTrackingModal
            isOpen={showTimeTrackingModal}
            onClose={() => setShowTimeTrackingModal(false)}
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
          />
        )}
      </Modal>

      <Modal isOpen={showAssignments} onClose={() => setShowAssignments(false)} title={`${selectedEmployee?.name}'s Jobs`} size="lg">
        {assignments.length === 0 ? (
          <EmptyState title="No job assignments" description="This employee hasn't been assigned to any jobs yet." />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <Card key={assignment.jobId} className="p-4 border-[#d4a574]/30 dark:border-[#8b4513]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                    {assignment.jobNumber}
                  </span>
                  <StatusBadge type="job" value={assignment.status} />
                </div>
                <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mb-2">
                  {assignment.jobTitle}
                </p>
                <div className="text-xs text-[#b85e1a]/60 dark:text-gray-500">
                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>

      {/* Crew Form Modal */}
      {showCrewForm && (
        <Modal
          isOpen={true}
          onClose={() => { setShowCrewForm(false); setEditingCrew(null); setEditingCrewDetail(null); }}
          title={editingCrew || editingCrewDetail ? "Edit Crew" : "Create New Crew"}
          size="lg"
        >
          <CrewFormModalInner
            initialName={editingCrewDetail?.name ?? editingCrew?.crewName ?? ""}
            initialDescription={editingCrewDetail?.description ?? ""}
            initialSupervisorId={editingCrewDetail?.supervisorId ?? editingCrew?.supervisorId}
            employees={employees.filter(e => e.role === "Supervisor").map(e => ({
              id: e.id,
              name: e.name
            }))}
            onCancel={() => { setShowCrewForm(false); setEditingCrew(null); setEditingCrewDetail(null); }}
            onSubmit={async (name, description, supervisorId) => {
              const id = editingCrewDetail?.id ?? editingCrew?.id;
              if (id) await handleUpdateCrew(id, name, description, supervisorId);
              else await handleCreateCrew(name, description, supervisorId);
            }}
          />
        </Modal>
      )}

      {/* Crew Detail Modal */}
      {showCrewDetail && selectedCrew && (
        <Modal
          isOpen={true}
          onClose={() => { setShowCrewDetail(false); setSelectedCrew(null); }}
          title={selectedCrew.name}
          size="lg"
        >
          <CrewDetailModalInner
            crew={selectedCrew}
            onClose={() => { setShowCrewDetail(false); setSelectedCrew(null); }}
            onEdit={() => {
              setEditingCrewDetail(selectedCrew)
              setEditingCrew(crews.find(c => c.id === selectedCrew.id) || null)
              setShowCrewDetail(false)
              setShowCrewForm(true)
            }}
            onDelete={() => handleDeleteCrew(selectedCrew.id)}
            onAddMember={async () => {
              const res = await fetch("/api/employees")
              if (res.ok) setAvailableEmployees(await res.json())
              setShowAddMemberModal(true)
            }}
            onRemoveMember={(employeeId) => handleRemoveMember(selectedCrew.id, employeeId)}
            onAssignJobs={async () => {
              const res = await fetch("/api/jobs/available?limit=200")
              if (res.ok) setAvailableJobs(await res.json())
              setShowAssignJobsModal(true)
            }}
            onRemoveJob={(jobId) => handleRemoveJobFromCrew(selectedCrew.id, jobId)}
          />
        </Modal>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedCrew && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddMemberModal(false)}
          title={`Add Member to ${selectedCrew.name}`}
          size="md"
        >
          <AddMemberModalInner
            employees={availableEmployees}
            existingMemberIds={new Set(selectedCrew.members.map(m => m.employeeId))}
            onSelect={async (employeeId) => {
              await handleAddMember(selectedCrew.id, employeeId)
              setShowAddMemberModal(false)
            }}
            onClose={() => setShowAddMemberModal(false)}
          />
        </Modal>
      )}

      {/* Assign Jobs Modal */}
      {showAssignJobsModal && selectedCrew && (
        <Modal
          isOpen={true}
          onClose={() => setShowAssignJobsModal(false)}
          title={`Assign Jobs to ${selectedCrew.name}`}
          size="lg"
        >
          <AssignJobsModalInner
            jobs={availableJobs}
            existingJobIds={new Set(selectedCrew.jobs.map(j => j.jobId))}
            onSelect={async (jobIds) => {
              await handleAssignJobsToCrew(selectedCrew.id, jobIds)
              setShowAssignJobsModal(false)
            }}
            onClose={() => setShowAssignJobsModal(false)}
          />
        </Modal>
      )}
    </div>
  )
}

// ==================== Internal Modal Components ====================

function CrewFormModalInner({
  initialName,
  initialDescription,
  initialSupervisorId,
  employees,
  onCancel,
  onSubmit,
}: {
  initialName: string
  initialDescription: string
  initialSupervisorId?: string | null
  employees: Array<{ id: string; name: string }>
  onCancel: () => void
  onSubmit: (name: string, description?: string, supervisorId?: string) => Promise<void>
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [supervisorId, setSupervisorId] = useState(initialSupervisorId || "")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setName(initialName)
    setDescription(initialDescription)
    setSupervisorId(initialSupervisorId || "")
  }, [initialName, initialDescription, initialSupervisorId])

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
          Crew Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 px-3 py-2 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
          placeholder="e.g., Morning Crew, Tree Team"
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
          Supervisor (Optional)
        </label>
        <select
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          className="w-full rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 px-3 py-2 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
        >
          <option value="">-- No supervisor --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
          Description (Optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 px-3 py-2 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
          rows={2}
          placeholder="Any notes about this crew..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel} className="border-[#d4a574] text-[#8b4513] dark:text-[#d4a574]">
          Cancel
        </Button>
        <Button
          onClick={async () => {
            if (!name.trim()) {
              alert("Crew name is required")
              return
            }
            setSubmitting(true)
            await onSubmit(name.trim(), description.trim() || undefined, supervisorId || undefined)
            setSubmitting(false)
          }}
          disabled={!name.trim() || submitting}
          className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white min-w-[100px]"
        >
          {submitting ? "Saving..." : "Save Crew"}
        </Button>
      </div>
    </div>
  )
}

function CrewDetailModalInner({
  crew,
  onClose,
  onEdit,
  onDelete,
  onAddMember,
  onRemoveMember,
  onAssignJobs,
  onRemoveJob,
}: {
  crew: CrewDetailData
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onAddMember: () => void
  onRemoveMember: (employeeId: string) => void
  onAssignJobs: () => void
  onRemoveJob: (jobId: string) => void
}) {
  const [activeSection, setActiveSection] = useState<'members' | 'jobs'>('members')

  return (
    <div className="space-y-6">
      {/* Header with metadata */}
      <div className="bg-[#f5f1e6] dark:bg-gray-800/50 p-4 rounded-lg border border-[#d4a574]/30">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Supervisor</p>
            <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">
              {crew.supervisorName || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Created</p>
            <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">
              {new Date(crew.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {crew.description && (
          <div className="mt-2 pt-2 border-t border-[#d4a574]/30">
            <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400">Description</p>
            <p className="text-sm text-[#8b4513] dark:text-[#d4a574]">{crew.description}</p>
          </div>
        )}
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 border-b border-[#d4a574]/30">
        <button
          onClick={() => setActiveSection('members')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'members'
              ? 'border-[#2e8b57] text-[#2e8b57]'
              : 'border-transparent text-[#b85e1a]/70 hover:text-[#8b4513]'
            }`}
        >
          Members ({crew.members.length})
        </button>
        <button
          onClick={() => setActiveSection('jobs')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeSection === 'jobs'
              ? 'border-[#2e8b57] text-[#2e8b57]'
              : 'border-transparent text-[#b85e1a]/70 hover:text-[#8b4513]'
            }`}
        >
          Assigned Jobs ({crew.jobs.length})
        </button>
      </div>

      {/* Members section */}
      {activeSection === 'members' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574]">Team Members</h4>
            <Button
              size="sm"
              onClick={onAddMember}
              className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Member
            </Button>
          </div>

          {crew.members.length === 0 ? (
            <EmptyState
              title="No members yet"
              description="Add employees to this crew to start assigning jobs"
              action={
                <Button size="sm" onClick={onAddMember} className="bg-[#2e8b57] text-white">
                  Add Member
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {crew.members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574]/20 hover:border-[#2e8b57]/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white text-xs font-bold">
                      {member.employeeName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                        {member.employeeName}
                      </p>
                      <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
                        {member.role} • Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveMember(member.employeeId)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors"
                    title="Remove from crew"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Jobs section */}
      {activeSection === 'jobs' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574]">Assigned Jobs</h4>
            <Button
              size="sm"
              onClick={onAssignJobs}
              className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Assign Jobs
            </Button>
          </div>

          {crew.jobs.length === 0 ? (
            <EmptyState
              title="No jobs assigned"
              description="Assign jobs to this crew to get them working"
              action={
                <Button size="sm" onClick={onAssignJobs} className="bg-[#2e8b57] text-white">
                  Assign Jobs
                </Button>
              }
            />
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {crew.jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574]/20 hover:border-[#2e8b57]/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#b85e1a]">
                        {job.jobNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${job.status === 'completed' ? 'bg-[#2e8b57]/20 text-[#2e8b57]' :
                          job.status === 'in_progress' ? 'bg-[#d88c4a]/20 text-[#b85e1a]' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {job.status}
                      </span>
                    </div>
                    <p className="font-medium text-[#8b4513] dark:text-[#d4a574] mt-1">
                      {job.jobTitle}
                    </p>
                    <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1">
                      Assigned {new Date(job.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => onRemoveJob(job.jobId)}
                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-600 transition-colors ml-2"
                    title="Remove job assignment"
                  >
                    <XCircleIcon className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#d4a574]/30">
        <Button
          variant="outline"
          onClick={onEdit}
          className="border-[#d4a574] text-[#8b4513] dark:text-[#d4a574]"
        >
          <PencilIcon className="w-4 h-4 mr-1" />
          Edit Crew
        </Button>
        <Button
          onClick={onDelete}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <TrashIcon className="w-4 h-4 mr-1" />
          Delete Crew
        </Button>
      </div>
    </div>
  )
}

function AddMemberModalInner({
  employees,
  existingMemberIds,
  onSelect,
  onClose,
}: {
  employees: ApiEmployee[]
  existingMemberIds: Set<string>
  onSelect: (employeeId: string) => Promise<void>
  onClose: () => void
}) {
  const [search, setSearch] = useState("")

  const available = employees
    .filter(e => !existingMemberIds.has(e.id))
    .filter(e =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800"
        />
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {available.length === 0 ? (
        <p className="text-center py-8 text-[#b85e1a]/70 dark:text-gray-400">
          {search ? "No matching employees found" : "No employees available to add"}
        </p>
      ) : (
        <ul className="max-h-96 overflow-y-auto space-y-1 pr-2">
          {available.map((e) => (
            <li key={e.id}>
              <button
                onClick={async () => {
                  await onSelect(e.id)
                  onClose()
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-[#2e8b57]/10 border border-transparent hover:border-[#2e8b57]/30 transition-all"
              >
                <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                  {e.fullName}
                </div>
                <div className="text-sm text-[#b85e1a]/70 dark:text-gray-400">
                  {e.email} • {e.role || "Worker"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClose} className="border-[#d4a574] text-[#8b4513]">
          Cancel
        </Button>
      </div>
    </div>
  )
}

function AssignJobsModalInner({
  jobs,
  existingJobIds,
  onSelect,
  onClose,
}: {
  jobs: ApiJob[]
  existingJobIds: Set<string>
  onSelect: (jobIds: string[]) => Promise<void>
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const filteredJobs = jobs
    .filter(j => !existingJobIds.has(j.id))
    .filter(j =>
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.title.toLowerCase().includes(search.toLowerCase())
    )

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === filteredJobs.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filteredJobs.map(j => j.id)))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800"
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {filteredJobs.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={selectAll}
            className="border-[#d4a574] text-[#8b4513] whitespace-nowrap"
          >
            {selected.size === filteredJobs.length ? 'Deselect All' : 'Select All'}
          </Button>
        )}
      </div>

      {filteredJobs.length === 0 ? (
        <p className="text-center py-8 text-[#b85e1a]/70 dark:text-gray-400">
          {search ? "No matching jobs found" : "No jobs available to assign"}
        </p>
      ) : (
        <>
          <ul className="max-h-96 overflow-y-auto space-y-1 pr-2 border border-[#d4a574]/30 rounded-lg divide-y divide-[#d4a574]/20">
            {filteredJobs.slice(0, 100).map((j) => (
              <li key={j.id} className="hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50">
                <label className="flex items-center gap-3 p-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.has(j.id)}
                    onChange={() => toggle(j.id)}
                    className="w-4 h-4 rounded text-[#2e8b57] border-[#d4a574] focus:ring-[#2e8b57]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-[#b85e1a]">
                        {j.jobNumber}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${j.status === 'completed' ? 'bg-[#2e8b57]/20 text-[#2e8b57]' :
                          j.status === 'in_progress' ? 'bg-[#d88c4a]/20 text-[#b85e1a]' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {j.status}
                      </span>
                    </div>
                    <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                      {j.title}
                    </p>
                    {j.clientName && (
                      <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1">
                        Client: {j.clientName}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            ))}
            {filteredJobs.length > 100 && (
              <li className="p-3 text-center text-sm text-[#b85e1a]/70">
                Showing first 100 of {filteredJobs.length} jobs
              </li>
            )}
          </ul>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-[#b85e1a]/70">
              {selected.size} job{selected.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="border-[#d4a574] text-[#8b4513]">
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  setSubmitting(true)
                  await onSelect(Array.from(selected))
                  setSubmitting(false)
                }}
                disabled={selected.size === 0 || submitting}
                className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white min-w-[120px]"
              >
                {submitting ? "Assigning..." : `Assign ${selected.size} Job${selected.size !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}