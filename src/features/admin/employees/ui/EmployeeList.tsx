// components/employees/EmployeeList.tsx
"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Grid } from "@/src/shared/ui/Grid"
import { Button } from "@/src/shared/ui/Button"
import { Card } from "@/src/shared/ui/Card"
import { Input } from "@/src/shared/ui/Input"
import { Skeleton } from "@/src/shared/ui/Skeleton"
import { Modal } from "@/src/shared/ui/Modal"
import { EmptyState } from "@/src/shared/ui/EmptyState"
import { DataTable } from "@/src/shared/ui/DataTable"
import { StatusBadge } from "@/src/shared/ui/StatusBadge"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import { useFormPersistence } from "@/src/hooks/useFormPersistence"
import EmployeeForm from "./EmployeeForm"
import EmployeeDetail from "./EmployeeDetail"
import TimeTrackingModal from "./TimeTrackingModal"
import Link from "next/link"
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
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UsersIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EyeIcon,
  ChevronRightIcon, XMarkIcon
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
  const [availableEmployees, setAvailableEmployees] = useState<ApiEmployee[]>([])
  const [editingCrewDetail, setEditingCrewDetail] = useState<CrewDetailData | null>(null)
  const [crewFilterStatus, setCrewFilterStatus] = useState<string>("all")
  const [crewSortBy, setCrewSortBy] = useState<string>("name")
  const [crewSearchQuery, setCrewSearchQuery] = useState("")
  const [assignmentCounts, setAssignmentCounts] = useState<Record<string, number>>({})
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [expandedRowAssignments, setExpandedRowAssignments] = useState<JobAssignment[]>([])

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

  const [employeeCrewMap, setEmployeeCrewMap] = useState<Record<string, string>>({})

  // When on employees tab: load assignment counts and crew map for Crew/Current Job columns
  useEffect(() => {
    if (activeTab !== "employees") return
    const load = async () => {
      try {
        const [countsRes, crewsRes] = await Promise.all([
          fetch("/api/employees/assignment-counts"),
          fetch("/api/crews").then((r) => (r.ok ? r.json() : [])),
        ])
        if (countsRes.ok) {
          const data = await countsRes.json()
          setAssignmentCounts(data.counts ?? {})
        }
        if (Array.isArray(crewsRes) && crewsRes.length > 0) {
          const withMembers = await Promise.all(
            crewsRes.map((c: { id: string }) =>
              fetch(`/api/crews/${c.id}/members`).then((r) => (r.ok ? r.json() : []))
            )
          )
          const map: Record<string, string> = {}
          crewsRes.forEach((c: { id: string; name: string }, i: number) => {
            const members = withMembers[i] || []
            members.forEach((m: { employeeId: string }) => {
              if (m.employeeId) map[m.employeeId] = c.name
            })
          })
          setEmployeeCrewMap(map)
        }
      } catch (e) {
        console.error("Failed to load assignment counts / crew map:", e)
      }
    }
    load()
  }, [activeTab])

  // Crew CRUD operations
  const handleCreateCrew = async (
    name: string,
    description?: string,
    supervisorId?: string,
    memberIds?: string[]
  ) => {
    try {
      const res = await fetch("/api/crews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || null, supervisorId: supervisorId || null }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create crew")
      const created = (await res.json()) as { id: string }
      if (created?.id && Array.isArray(memberIds) && memberIds.length > 0) {
        for (const empId of memberIds) {
          await fetch(`/api/crews/${created.id}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ employeeId: empId }),
          })
        }
      }
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

  const [detailModalAssignments, setDetailModalAssignments] = useState<JobAssignment[]>([])

  const handleViewDetail = async (user: User) => {
    setSelectedEmployee(user)
    setShowDetailModal(true)
    try {
      const a = await getEmployeeAssignments(user.id)
      setDetailModalAssignments((a as JobAssignment[]) ?? [])
    } catch {
      setDetailModalAssignments([])
    }
  }

  const handleExpandRow = async (user: User) => {
    if (expandedRowId === user.id) {
      setExpandedRowId(null)
      setExpandedRowAssignments([])
      return
    }
    setExpandedRowId(user.id)
    try {
      const a = await getEmployeeAssignments(user.id)
      setExpandedRowAssignments(a as JobAssignment[])
    } catch {
      setExpandedRowAssignments([])
    }
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

  // Derived stats for dashboard cards (employees tab)
  const employeeStats = useMemo(() => {
    const total = employees.length
    const inCrews = Object.keys(employeeCrewMap).length
    const withoutCrew = total - inCrews
    const withActiveJobs = Object.keys(assignmentCounts).filter((id) => (assignmentCounts[id] ?? 0) > 0).length
    const withoutJobs = total - withActiveJobs
    return { total, inCrews, withoutCrew, withActiveJobs, withoutJobs }
  }, [employees.length, employeeCrewMap, assignmentCounts])

  // Crew stats for Crews tab (same structure as employee stats for consistent layout)
  const crewStats = useMemo(() => {
    const totalCrews = crews.length
    const totalMembers = crews.reduce((sum, c) => sum + c.total, 0)
    const available = crews.reduce((sum, c) => sum + c.available, 0)
    const onJobs = crews.reduce((sum, c) => sum + c.onJob, 0)
    const emptyCrews = crews.filter((c) => c.total === 0).length
    return { totalCrews, totalMembers, available, onJobs, emptyCrews }
  }, [crews])

  // Filter crews by search (name or supervisor)
  const filteredCrews = useMemo(() => {
    if (!crewSearchQuery.trim()) return crews
    const q = crewSearchQuery.toLowerCase()
    return crews.filter(
      (c) =>
        c.crewName.toLowerCase().includes(q) ||
        (c.supervisor && c.supervisor.toLowerCase().includes(q))
    )
  }, [crews, crewSearchQuery])

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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleExpandRow(user); }}
            className="p-1 rounded hover:bg-[#d4a574]/20 text-[#8b4513] dark:text-[#d4a574]"
            aria-expanded={expandedRowId === user.id}
            aria-label={expandedRowId === user.id ? "Collapse row" : "Expand row"}
          >
            {expandedRowId === user.id ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
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
        </div>
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
      key: "crew",
      header: "Crew",
      render: (user: User) => (
        <span className="text-[#8b4513] dark:text-[#d4a574]">
          {employeeCrewMap[user.id] ?? "Unassigned"}
        </span>
      ),
      hideOnMobile: true,
      hideOnTablet: false,
    },
    {
      key: "currentJob",
      header: "Current Job",
      render: (user: User) => {
        const count = assignmentCounts[user.id] ?? 0
        return (
          <span className="text-[#8b4513] dark:text-[#d4a574]">
            {count > 0 ? `${count} job${count !== 1 ? "s" : ""}` : "—"}
          </span>
        )
      },
      hideOnMobile: true,
      hideOnTablet: true,
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

  const statCardBase = "rounded-xl border p-5 transition-shadow hover:shadow-md flex flex-col gap-2 min-h-[100px] justify-center"

  return (
    <div className="space-y-8">
      {/* Header: Title + Tabs only */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-3xl tracking-tight">
            {activeTab === "employees" ? "Employees" : "Crews"}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
            {activeTab === "employees"
              ? "Manage your workforce and track employee performance"
              : "View and manage your crews and team assignments"}
          </p>
        </div>
        <div className="flex gap-1 bg-[#f5f1e6] dark:bg-gray-800 p-1.5 rounded-lg border border-[#d4a574]/30 w-fit">
          <button
            onClick={() => router.push("/admin/employees?tab=employees")}
            className={`px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all
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
            className={`px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all
              ${activeTab === "crews"
                ? "bg-[#2e8b57] text-white shadow-md"
                : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
              }`}
          >
            <BriefcaseIcon className="w-4 h-4" />
            Crews
          </button>
        </div>
      </div>

      {/* Top section: Stats cards (same structure for both tabs) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Overview
        </h2>
        {activeTab === "employees" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className={`${statCardBase} bg-white dark:bg-gray-800 border-[#d4a574]/30`}>
              <div className="flex items-center gap-2 text-[#b85e1a]/80 dark:text-gray-400">
                <UsersIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Employees</span>
              </div>
              <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{employeeStats.total}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
              <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
                <UserGroupIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">In Crews</span>
              </div>
              <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{employeeStats.inCrews}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#8b4513]/5 dark:bg-[#8b4513]/10 border-[#8b4513]/30`}>
              <div className="flex items-center gap-2 text-[#8b4513] dark:text-[#d4a574]">
                <UserIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Without Crew</span>
              </div>
              <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{employeeStats.withoutCrew}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
              <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
                <BriefcaseIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">With Active Jobs</span>
              </div>
              <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{employeeStats.withActiveJobs}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#d88c4a]/5 dark:bg-[#d88c4a]/10 border-[#d88c4a]/30`}>
              <div className="flex items-center gap-2 text-[#b85e1a] dark:text-[#d88c4a]">
                <ClockIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Without Assignments</span>
              </div>
              <div className="text-2xl font-bold text-[#b85e1a] dark:text-[#d88c4a]">{employeeStats.withoutJobs}</div>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className={`${statCardBase} bg-white dark:bg-gray-800 border-[#d4a574]/30`}>
              <div className="flex items-center gap-2 text-[#b85e1a]/80 dark:text-gray-400">
                <BriefcaseIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Crews</span>
              </div>
              <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{crewStats.totalCrews}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
              <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
                <UsersIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Total Members</span>
              </div>
              <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{crewStats.totalMembers}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
              <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
                <CheckCircleIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Available</span>
              </div>
              <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{crewStats.available}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#d88c4a]/5 dark:bg-[#d88c4a]/10 border-[#d88c4a]/30`}>
              <div className="flex items-center gap-2 text-[#b85e1a] dark:text-[#d88c4a]">
                <ClockIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">On Jobs</span>
              </div>
              <div className="text-2xl font-bold text-[#b85e1a] dark:text-[#d88c4a]">{crewStats.onJobs}</div>
            </Card>
            <Card className={`${statCardBase} bg-[#8b4513]/5 dark:bg-[#8b4513]/10 border-[#8b4513]/30`}>
              <div className="flex items-center gap-2 text-[#8b4513] dark:text-[#d4a574]">
                <UserGroupIcon className="w-5 h-5 shrink-0" />
                <span className="text-xs font-medium uppercase tracking-wide">Empty Crews</span>
              </div>
              <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{crewStats.emptyCrews}</div>
            </Card>
          </div>
        )}
      </section>

      {/* Filters + Search + Actions (same layout for both tabs) */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Filters &amp; actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTab === "employees" ? (
            <>
              <div className="relative lg:col-span-1">
                <Input
                  type="search"
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent rounded-lg"
                  aria-label="Search employees"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={statusOptions} label="Status" icon={<UserGroupIcon className="w-4 h-4" />} />
              <FilterSelect value={filterRole} onChange={setFilterRole} options={roleOptions} label="Role" icon={<BriefcaseIcon className="w-4 h-4" />} />
              <div className="flex items-end">
                <Button variant="primary" onClick={() => setShowHireModal(true)} className="w-full sm:w-auto bg-[#2e8b57] hover:bg-[#1f6b41] text-white" aria-label="Hire new employee">
                  <PlusIcon className="w-5 h-5 mr-2 inline" />
                  Hire Employee
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="relative lg:col-span-1">
                <Input
                  type="search"
                  placeholder="Search crews by name or supervisor..."
                  value={crewSearchQuery}
                  onChange={(e) => setCrewSearchQuery(e.target.value)}
                  className="pl-10 w-full border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent rounded-lg"
                  aria-label="Search crews"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <FilterSelect value={crewFilterStatus} onChange={setCrewFilterStatus} options={crewFilterOptions} label="Filter crews" icon={<UsersIcon className="w-4 h-4" />} />
              <FilterSelect value={crewSortBy} onChange={setCrewSortBy} options={crewSortOptions} label="Sort by" icon={<ChevronDownIcon className="w-4 h-4" />} />
              <div className="flex items-end">
                <Button variant="primary" onClick={() => { setEditingCrew(null); setEditingCrewDetail(null); setShowCrewForm(true); }} className="w-full sm:w-auto bg-[#2e8b57] hover:bg-[#1f6b41] text-white">
                  <PlusIcon className="w-5 h-5 mr-2 inline" />
                  Add Crew
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Content: Table or list */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          {activeTab === "employees" ? "Employee list" : "Crew list"}
        </h2>
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                  <thead className="bg-[#f5f1e6] dark:bg-gray-800">
                    <tr>
                      {columns.filter(col => {
                        if (isTablet && col.hideOnTablet) return false
                        if (isMobile && col.hideOnMobile) return false
                        return true
                      }).map((col) => (
                        <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
                          {col.header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                    {filteredEmployees.map((user) => (
                      <React.Fragment key={user.id}>
                        <tr className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50 transition-colors">
                          {columns.filter(col => {
                            if (isTablet && col.hideOnTablet) return false
                            if (isMobile && col.hideOnMobile) return false
                            return true
                          }).map((col) => (
                            <td key={col.key} className="px-4 py-3 text-sm">
                              {col.render(user)}
                            </td>
                          ))}
                        </tr>
                        {expandedRowId === user.id && (
                          <tr className="bg-[#f5f1e6]/30 dark:bg-gray-800/30">
                            <td colSpan={columns.filter(c => !(isTablet && c.hideOnTablet) && !(isMobile && c.hideOnMobile)).length} className="px-4 py-3">
                              <div className="text-sm">
                                <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">Assigned jobs</h4>
                                {expandedRowAssignments.length === 0 ? (
                                  <p className="text-[#b85e1a]/70 dark:text-gray-400">No job assignments. Manage jobs on the Jobs page.</p>
                                ) : (
                                  <ul className="space-y-1">
                                    {expandedRowAssignments.map((a) => (
                                      <li key={a.jobId} className="flex items-center justify-between py-1.5 px-2 rounded bg-white dark:bg-gray-800 border border-[#d4a574]/20">
                                        <span className="font-mono text-[#b85e1a]">{a.jobNumber}</span>
                                        <span className="text-[#8b4513] dark:text-[#d4a574]">{a.jobTitle}</span>
                                        <StatusBadge type="job" value={a.status} />
                                        <Link
                                          href={`/admin/jobs/${a.jobId}`}
                                          className="inline-flex items-center gap-1 text-xs text-[#2e8b57] hover:underline"
                                        >
                                          <EyeIcon className="w-4 h-4" />
                                          View Job
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
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
        </>
      ) : (
        <div className="space-y-4">
          {crewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-96 rounded-lg" />
              ))}
            </div>
          ) : filteredCrews.length === 0 ? (
            <EmptyState
              title={crewSearchQuery.trim() ? "No crews match your search" : "No crews found"}
              description={crewSearchQuery.trim() ? "Try a different search or filter." : "Create your first crew to start organizing your team."}
              action={
                !crewSearchQuery.trim() ? (
                  <Button
                    variant="primary"
                    onClick={() => { setEditingCrew(null); setEditingCrewDetail(null); setShowCrewForm(true); }}
                    className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
                  >
                    <PlusIcon className="w-5 h-5 mr-2 inline" />
                    Create Crew
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCrews.map((crew) => (
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
      </section>

      {/* Employee Modals */}
      <Modal isOpen={showHireModal} onClose={() => setShowHireModal(false)} >
        <EmployeeForm
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} >
        {selectedEmployee && (
          <EmployeeForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
            employee={mapUserToEmployee(selectedEmployee)}
          />
        )}
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg">
        {selectedEmployee && (
          <EmployeeDetail
            isOpen={showDetailModal}
            employee={selectedEmployee as any}
            onClose={() => setShowDetailModal(false)}
            crewName={employeeCrewMap[selectedEmployee.id] ?? null}
            assignedJobs={detailModalAssignments}
            jobDetailUrl={(jobId) => `/admin/jobs/${jobId}`}
          />
        )}
      </Modal>

      <Modal isOpen={showTimeTrackingModal} onClose={() => setShowTimeTrackingModal(false)}>
        {selectedEmployee && (
          <TimeTrackingModal
            isOpen={showTimeTrackingModal}
            onClose={() => setShowTimeTrackingModal(false)}
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
          />
        )}
      </Modal>

      <Modal isOpen={showAssignments} onClose={() => setShowAssignments(false)} size="lg">
        {assignments.length === 0 ? (
          <EmptyState
            title="No job assignments"
            description="This employee hasn't been assigned to any jobs yet. Assign jobs from the Jobs page."
            action={
              <Link href="/admin/jobs">
                <Button variant="primary" className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white">
                  Go to Jobs
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <Card key={assignment.jobId} className="p-4 border-[#d4a574]/30 dark:border-[#8b4513]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                    {assignment.jobNumber}
                  </span>
                  <div className="flex items-center gap-2">
                    <StatusBadge type="job" value={assignment.status} />
                    <Link
                      href={`/admin/jobs/${assignment.jobId}`}
                      className="inline-flex items-center gap-1 text-sm text-[#2e8b57] hover:underline"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View Job
                    </Link>
                  </div>
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
          size="lg"
        >
          <CrewFormModalInner
            initialName={editingCrewDetail?.name ?? editingCrew?.crewName ?? ""}
            initialDescription={editingCrewDetail?.description ?? ""}
            initialSupervisorId={editingCrewDetail?.supervisorId ?? editingCrew?.supervisorId}
            initialMemberIds={editingCrewDetail?.members?.map((m) => m.employeeId) ?? editingCrew?.members?.map((m) => m.employeeId) ?? []}
            isEdit={!!(editingCrewDetail ?? editingCrew)}
            supervisorOptions={employees.filter((e) => e.role === "Supervisor").map((e) => ({ id: e.id, name: e.name }))}
            memberOptions={employees.map((e) => ({ id: e.id, name: e.name }))}
            onCancel={() => { setShowCrewForm(false); setEditingCrew(null); setEditingCrewDetail(null); }}
            onSubmit={async (name, description, supervisorId, memberIds) => {
              const id = editingCrewDetail?.id ?? editingCrew?.id;
              if (id) await handleUpdateCrew(id, name, description, supervisorId);
              else await handleCreateCrew(name, description, supervisorId, memberIds);
            }}
          />
        </Modal>
      )}

      {/* Crew Detail Modal */}
      {showCrewDetail && selectedCrew && (
        <Modal
          isOpen={true}
          onClose={() => { setShowCrewDetail(false); setSelectedCrew(null); }}
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
          />
        </Modal>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedCrew && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddMemberModal(false)}
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

    </div>
  )
}

// ==================== Internal Modal Components ====================

function CrewFormModalInner({
  initialName,
  initialDescription,
  initialSupervisorId,
  initialMemberIds,
  isEdit,
  supervisorOptions,
  memberOptions,
  onCancel,
  onSubmit,
}: {
  initialName: string
  initialDescription: string
  initialSupervisorId?: string | null
  initialMemberIds?: string[]
  isEdit: boolean
  supervisorOptions: Array<{ id: string; name: string }>
  memberOptions: Array<{ id: string; name: string }>
  onCancel: () => void
  onSubmit: (name: string, description?: string, supervisorId?: string, memberIds?: string[]) => Promise<void>
}) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [supervisorId, setSupervisorId] = useState(initialSupervisorId || "")
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set(initialMemberIds || []))
  const [submitting, setSubmitting] = useState(false)

  // Validation errors state
  const [errors, setErrors] = useState<{
    name?: string
    supervisor?: string
    members?: string
  }>({})

  // Track touched fields for validation
  const [touched, setTouched] = useState<{
    name: boolean
    supervisor: boolean
    members: boolean
  }>({
    name: false,
    supervisor: false,
    members: false
  })

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let total = 0
    let completed = 0

    // Name is required (20%)
    total += 20
    if (name.trim()) completed += 20

    // Supervisor (20%)
    total += 20
    if (supervisorId) completed += 20

    // Members (40% - 5% per member up to 8 members)
    total += 40
    const memberCount = selectedMemberIds.size
    completed += Math.min(memberCount * 5, 40)

    // Description (20%)
    total += 20
    if (description.trim()) completed += 20

    return Math.round((completed / total) * 100)
  }, [name, supervisorId, selectedMemberIds.size, description])

  const completionPercentage = calculateCompletion()

  // Validation functions
  const validateName = useCallback((value: string) => {
    if (!value.trim()) return "Crew name is required"
    if (value.trim().length < 3) return "Crew name must be at least 3 characters"
    if (value.trim().length > 50) return "Crew name must be less than 50 characters"
    return undefined
  }, [])

  const validateSupervisor = useCallback((value: string) => {
    // Supervisor is optional, so no validation needed
    return undefined
  }, [])

  const validateMembers = useCallback((members: Set<string>) => {
    // Members are optional in create, but if provided validate
    return undefined
  }, [])

  // Run validation on field changes
  useEffect(() => {
    if (touched.name) {
      setErrors(prev => ({ ...prev, name: validateName(name) }))
    }
  }, [name, touched.name, validateName])

  useEffect(() => {
    if (touched.supervisor) {
      setErrors(prev => ({ ...prev, supervisor: validateSupervisor(supervisorId) }))
    }
  }, [supervisorId, touched.supervisor, validateSupervisor])

  useEffect(() => {
    if (touched.members) {
      setErrors(prev => ({ ...prev, members: validateMembers(selectedMemberIds) }))
    }
  }, [selectedMemberIds, touched.members, validateMembers])

  // Handle next step - scroll to first error or next section
  const handleNextStep = () => {
    if (!name.trim()) {
      setTouched(prev => ({ ...prev, name: true }))
      document.getElementById('crew-name-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    if (name.trim().length < 3) {
      setTouched(prev => ({ ...prev, name: true }))
      document.getElementById('crew-name-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    // Scroll to supervisor section
    document.getElementById('crew-supervisor-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setTouched(prev => ({ ...prev, members: true }))
  }

  const isFormValid = () => {
    return !validateName(name) && !validateSupervisor(supervisorId) && !validateMembers(selectedMemberIds)
  }

  // Get color based on completion percentage
  const getProgressColor = () => {
    if (completionPercentage === 100) return 'bg-[#2e8b57]'
    if (completionPercentage >= 70) return 'bg-[#2e8b57]'
    if (completionPercentage >= 40) return 'bg-[#d88c4a]'
    return 'bg-[#b85e1a]'
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar - Fill Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#8b4513] dark:text-[#d4a574]">
            Form Completion
          </span>
          <span className="text-sm font-bold text-[#2e8b57] dark:text-[#4a7c5c]">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#d4a574]/30 dark:bg-[#8b4513]/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${getProgressColor()}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#b85e1a]/60 dark:text-gray-500">
          <span>Name (20%)</span>
          <span>Leader (20%)</span>
          <span>Members (40%)</span>
          <span>Details (20%)</span>
        </div>
      </div>

      {/* Required Fields Indicator */}
      <div className="flex items-center gap-2 text-xs text-[#b85e1a]/70 dark:text-gray-400">
        <span className="text-red-500">*</span>
        <span>Required fields</span>
        {!isEdit && (
          <span className="ml-auto text-[#2e8b57] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e8b57] animate-pulse" />
            Next: Fill in crew details
          </span>
        )}
      </div>

      {/* Crew Name Field */}
      <div id="crew-name-section" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
            Crew Name <span className="text-red-500">*</span>
          </label>
          {touched.name && errors.name && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              <XCircleIcon className="w-3 h-3" />
              {errors.name}
            </motion.span>
          )}
          {touched.name && !errors.name && name.trim() && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-[#2e8b57] flex items-center gap-1"
            >
              <CheckCircleIcon className="w-3 h-3" />
              Looks good
            </motion.span>
          )}
        </div>
        <div className="relative">
          <input
            id="crew-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
            className={`w-full rounded-lg border px-3 py-2 bg-[#f5f1e6] dark:bg-gray-800 
              text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent
              ${touched.name && errors.name
                ? 'border-red-500 ring-2 ring-red-500/20'
                : touched.name && !errors.name && name.trim()
                  ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                  : 'border-[#d4a574] dark:border-[#8b4513]'
              } transition-all duration-200`}
            placeholder="e.g., Morning Crew, Tree Team"
            autoFocus
          />
          {name.trim() && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#b85e1a]/60">
              {name.length}/50
            </span>
          )}
        </div>
        {!touched.name && !name.trim() && (
          <p className="text-xs text-[#b85e1a]/60 dark:text-gray-500 mt-1">
            Give your crew a descriptive name
          </p>
        )}
      </div>

      {/* Supervisor Field */}
      <div id="crew-supervisor-section" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
            Crew Leader (Supervisor)
          </label>
          {touched.supervisor && !errors.supervisor && supervisorId && (
            <span className="text-xs text-[#2e8b57] flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              Selected
            </span>
          )}
        </div>
        <select
          value={supervisorId}
          onChange={(e) => setSupervisorId(e.target.value)}
          onBlur={() => setTouched(prev => ({ ...prev, supervisor: true }))}
          className={`w-full rounded-lg border px-3 py-2 bg-[#f5f1e6] dark:bg-gray-800 
            text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent
            ${touched.supervisor && supervisorId ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20' : 'border-[#d4a574] dark:border-[#8b4513]'}
            transition-all duration-200`}
        >
          <option value="">— No crew leader —</option>
          {supervisorOptions.map((emp) => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
        {supervisorOptions.length === 0 && (
          <p className="text-xs text-[#b85e1a]/60 dark:text-gray-500 mt-1 flex items-center gap-1">
            <UserIcon className="w-3 h-3" />
            No supervisors available. Employees will be promoted when assigned as leader.
          </p>
        )}
      </div>

      {/* Members Section */}
      {!isEdit && (
        <div id="crew-members-section" className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
              Add members now <span className="text-[#b85e1a]/60 text-xs">(optional)</span>
            </label>
            {selectedMemberIds.size > 0 && (
              <span className="text-xs font-medium text-[#2e8b57] bg-[#2e8b57]/10 px-2 py-0.5 rounded-full">
                {selectedMemberIds.size} selected
              </span>
            )}
          </div>

          {/* Search/filter for members could be added here */}
          <div className="max-h-48 overflow-y-auto rounded-lg border border-[#d4a574]/50 dark:border-[#8b4513]/50 divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
            {memberOptions.length === 0 ? (
              <div className="px-3 py-8 text-center text-[#b85e1a]/60 dark:text-gray-500">
                No employees available to add
              </div>
            ) : (
              memberOptions.map((emp) => (
                <label
                  key={emp.id}
                  className={`flex items-center gap-3 px-3 py-2 hover:bg-[#f5f1e6] dark:hover:bg-gray-800 cursor-pointer transition-colors
                    ${selectedMemberIds.has(emp.id) ? 'bg-[#2e8b57]/5' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.has(emp.id)}
                    onChange={() => toggleMember(emp.id)}
                    className="rounded text-[#2e8b57] border-[#d4a574] focus:ring-[#2e8b57]"
                  />
                  <span className="flex-1 text-[#8b4513] dark:text-[#d4a574]">{emp.name}</span>
                  {selectedMemberIds.has(emp.id) && (
                    <CheckCircleIcon className="w-4 h-4 text-[#2e8b57]" />
                  )}
                </label>
              ))
            )}
          </div>

          {/* Member count indicator */}
          {selectedMemberIds.size > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#b85e1a]/70 dark:text-gray-400">
              <UsersIcon className="w-3 h-3" />
              <span>
                {selectedMemberIds.size} member{selectedMemberIds.size !== 1 ? 's' : ''} will be added
              </span>
            </div>
          )}

          {/* Member selection progress */}
          {selectedMemberIds.size > 0 && (
            <div className="w-full h-1 bg-[#d4a574]/30 dark:bg-[#8b4513]/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(selectedMemberIds.size * 12.5, 100)}%` }}
                className="h-full bg-[#2e8b57] rounded-full"
              />
            </div>
          )}
        </div>
      )}

      {/* Description Field */}
      <div id="crew-description-section" className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
            Description <span className="text-[#b85e1a]/60 text-xs">(optional)</span>
          </label>
          {description.trim() && (
            <span className="text-xs text-[#2e8b57] flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" />
              Added
            </span>
          )}
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 px-3 py-2 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent resize-none"
          rows={3}
          placeholder="Any notes about this crew..."
        />
        {description.length > 100 && (
          <p className="text-xs text-[#b85e1a]/60 dark:text-gray-500 text-right">
            {description.length}/500 characters
          </p>
        )}
      </div>

      {/* Next Step Hint */}
      {!isEdit && completionPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#2e8b57] flex items-center justify-center text-white text-sm font-bold">
            {completionPercentage < 40 ? '1' : completionPercentage < 70 ? '2' : '3'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
              {!name.trim() && 'Start by naming your crew'}
              {name.trim() && !supervisorId && 'Consider adding a crew leader'}
              {name.trim() && supervisorId && selectedMemberIds.size === 0 && 'Add members to build your team'}
              {name.trim() && supervisorId && selectedMemberIds.size > 0 && !description.trim() && 'Add a description for context'}
              {name.trim() && supervisorId && selectedMemberIds.size > 0 && description.trim() && 'Ready to save!'}
            </p>
            <button
              onClick={handleNextStep}
              className="text-xs text-[#2e8b57] hover:underline mt-1 flex items-center gap-1"
            >
              Go to next step
              <ChevronDownIcon className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Validation Summary */}
      {Object.keys(errors).filter(key => errors[key as keyof typeof errors]).length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
        >
          <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
            Please fix the following errors:
          </p>
          <ul className="space-y-1">
            {errors.name && (
              <li className="text-xs text-red-500 flex items-center gap-1">
                <XCircleIcon className="w-3 h-3" />
                {errors.name}
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#d4a574]/30">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-[#d4a574] text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6]"
          disabled={submitting}
        >
          Cancel
        </Button>

        {/* Next Step Button (for multi-step feel) */}
        {!isEdit && completionPercentage < 100 && (
          <Button
            onClick={handleNextStep}
            className="bg-[#d4a574] hover:bg-[#b85e1a] text-white border-0"
          >
            Next Step
            <ChevronDownIcon className="w-4 h-4 ml-1" />
          </Button>
        )}

        <Button
          onClick={async () => {
            // Validate all fields before submit
            setTouched({ name: true, supervisor: true, members: true })
            const nameError = validateName(name)
            if (nameError) {
              document.getElementById('crew-name-input')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              return
            }

            setSubmitting(true)
            await onSubmit(
              name.trim(),
              description.trim() || undefined,
              supervisorId || undefined,
              isEdit ? undefined : Array.from(selectedMemberIds)
            )
            setSubmitting(false)
          }}
          disabled={!name.trim() || submitting || !!validateName(name)}
          className={`bg-[#2e8b57] hover:bg-[#1f6b41] text-white min-w-[100px] transition-all
            ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </span>
          ) : (
            'Save Crew'
          )}
        </Button>
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="text-[10px] text-[#b85e1a]/40 dark:text-gray-600 text-center">
        Press <kbd className="px-1 bg-[#f5f1e6] dark:bg-gray-700 rounded border border-[#d4a574]">⌘/Ctrl + Enter</kbd> to save
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
}: {
  crew: CrewDetailData
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onAddMember: () => void
  onRemoveMember: (employeeId: string) => void
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

      {/* Jobs section - display only; manage assignments on Jobs page */}
      {activeSection === 'jobs' && (
        <div>
          <h4 className="font-medium text-[#8b4513] dark:text-[#d4a574] mb-4">Assigned Jobs</h4>
          {crew.jobs.length === 0 ? (
            <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">No jobs assigned. Assign jobs from the Jobs page.</p>
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
                  <Link
                    href={`/admin/jobs/${job.jobId}`}
                    className="inline-flex items-center gap-1 text-sm text-[#2e8b57] hover:underline shrink-0 ml-2"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Job
                  </Link>
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
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter available employees
  const available = employees
    .filter(e => !existingMemberIds.has(e.id))
    .filter(e =>
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
    )

  // Group by first letter for better organization
  const groupedEmployees = available.reduce((groups, employee) => {
    const firstLetter = employee.fullName.charAt(0).toUpperCase()
    if (!groups[firstLetter]) {
      groups[firstLetter] = []
    }
    groups[firstLetter].push(employee)
    return groups
  }, {} as Record<string, typeof available>)

  // Sort letters alphabetically
  const sortedLetters = Object.keys(groupedEmployees).sort()

  // Handle select with loading state
  const handleSelect = async (employeeId: string) => {
    setSelectedEmployeeId(employeeId)
    setIsSubmitting(true)
    setError(null)

    try {
      await onSelect(employeeId)
      // onClose will be called by the parent after successful selection
    } catch (err) {
      setError('Failed to add member. Please try again.')
      setIsSubmitting(false)
      setSelectedEmployeeId(null)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearch("")
  }

  return (
    <div className="space-y-4">
      {/* Search Header with Counter */}
      <div className="flex items-center justify-between text-xs text-[#b85e1a]/70 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <UsersIcon className="w-3 h-3" />
          {available.length} employee{available.length !== 1 ? 's' : ''} available
        </span>
        {existingMemberIds.size > 0 && (
          <span className="flex items-center gap-1">
            <CheckCircleIcon className="w-3 h-3 text-[#2e8b57]" />
            {existingMemberIds.size} already in crew
          </span>
        )}
      </div>

      {/* Search Input with Enhanced Styling */}
      <div className="relative">
        <Input
          type="search"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`pl-10 pr-10 border-2 transition-all duration-200
            ${searchFocused 
              ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20' 
              : 'border-[#d4a574] dark:border-[#8b4513]'
            } 
            bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] 
            placeholder-[#b85e1a]/50 dark:placeholder-gray-500`}
        />
        <MagnifyingGlassIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 
          ${searchFocused ? 'text-[#2e8b57]' : 'text-[#b85e1a]/60'}`} 
        />
        {search && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#b85e1a]/60 hover:text-[#2e8b57] transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Count */}
      {search && (
        <div className="flex justify-between items-center">
          <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
            Found {available.length} result{available.length !== 1 ? 's' : ''}
          </p>
          {available.length === 0 && (
            <button
              onClick={handleClearSearch}
              className="text-xs text-[#2e8b57] hover:underline flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3 h-3" />
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2"
        >
          <XCircleIcon className="w-4 h-4 text-red-500" />
          <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
        </motion.div>
      )}

      {/* Employee List */}
      {available.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 px-4"
        >
          <UserGroupIcon className="w-12 h-12 mx-auto text-[#b85e1a]/30 dark:text-gray-600 mb-3" />
          <p className="text-[#b85e1a]/70 dark:text-gray-400 font-medium">
            {search ? "No matching employees found" : "No employees available to add"}
          </p>
          <p className="text-xs text-[#b85e1a]/50 dark:text-gray-500 mt-1">
            {search ? "Try a different search term" : "All employees are already in this crew"}
          </p>
          {search && (
            <Button
              variant="outline"
              onClick={handleClearSearch}
              className="mt-4 border-[#d4a574] text-[#8b4513] dark:text-[#d4a574]"
              size="sm"
            >
              Clear Search
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
          {/* Grouped by letter */}
          {sortedLetters.map(letter => (
            <div key={letter}>
              <div className="sticky top-0 bg-[#f5f1e6] dark:bg-gray-800 px-2 py-1 text-xs font-bold text-[#2e8b57] border-b border-[#d4a574]/30">
                {letter}
              </div>
              <div className="space-y-1 mt-1">
                {groupedEmployees[letter].map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => handleSelect(e.id)}
                      disabled={isSubmitting && selectedEmployeeId === e.id}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all relative
                        ${isSubmitting && selectedEmployeeId === e.id
                          ? 'bg-[#2e8b57]/20 cursor-wait'
                          : 'hover:bg-[#2e8b57]/10 border border-transparent hover:border-[#2e8b57]/30'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar placeholder with initials */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {e.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-[#8b4513] dark:text-[#d4a574] truncate">
                            {e.fullName}
                          </div>
                          <div className="text-sm text-[#b85e1a]/70 dark:text-gray-400 truncate">
                            {e.email}
                          </div>
                        </div>

                        {/* Role badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-[#2e8b57]/10 text-[#2e8b57] whitespace-nowrap">
                            {e.role || "Worker"}
                          </span>
                          
                          {/* Loading spinner */}
                          {isSubmitting && selectedEmployeeId === e.id && (
                            <svg className="animate-spin h-4 w-4 text-[#2e8b57]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          )}
                          
                          {/* Hover indicator */}
                          {!isSubmitting && (
                            <ChevronRightIcon className="w-4 h-4 text-[#b85e1a]/30 group-hover:text-[#2e8b57] transition-colors" />
                          )}
                        </div>
                      </div>

                      {/* Progress indicator for selected state */}
                      {isSubmitting && selectedEmployeeId === e.id && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "linear" }}
                          className="absolute bottom-0 left-0 h-0.5 bg-[#2e8b57] rounded-b-lg"
                        />
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#d4a574]/30">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-[#b85e1a]/70 dark:text-gray-400">
            <UserGroupIcon className="w-3 h-3" />
            Total: {employees.length}
          </span>
          <span className="w-1 h-1 rounded-full bg-[#d4a574]/50" />
          <span className="flex items-center gap-1 text-[#2e8b57]">
            <CheckCircleIcon className="w-3 h-3" />
            In crew: {existingMemberIds.size}
          </span>
        </div>

        {/* Cancel Button */}
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="border-[#d4a574] text-[#8b4513] dark:text-[#d4a574] hover:bg-[#f5f1e6]"
          disabled={isSubmitting}
          size="sm"
        >
          Cancel
        </Button>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="text-[10px] text-[#b85e1a]/40 dark:text-gray-600 text-center">
        Press <kbd className="px-1 bg-[#f5f1e6] dark:bg-gray-700 rounded border border-[#d4a574]">ESC</kbd> to close
      </div>
    </div>
  )
}