// components/employees/EmployeeList.tsx
"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
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
import  EmployeeDetail  from "./EmployeeDetail"
import AssignJobModal from "./AssignJobModal"
import TimeTrackingModal from "./TimeTrackingModal"
import {
  getAllEmployees,
  getEmployeeAssignments,
  getEmployeeStats,
  deleteEmployee,
  updateEmployee
} from "@/src/services/employeeService"  // Removed /src from path
import type { User, JobAssignment, EmployeeStats } from "@/src/domain/models"

interface EmployeeFilters {
  search: string
  status: string
  role: string
}

interface ColumnConfig {
  key: string
  header: string
  render: (user: User) => React.ReactNode
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

export const EmployeeList = () => {
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

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // Persist filters in localStorage
  const { value: persistedFilters, setValue: setPersistedFilters } = useFormPersistence('employee-filters', {
    search: '',
    status: 'all',
    role: 'all'
  })

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [allUsers, statsData] = await Promise.all([
        getAllEmployees(),
        getEmployeeStats()
      ])

      // Convert Employee[] to User[]
      const users: User[] = allUsers.map(emp => {
        // Use String() to ensure we're comparing strings, not enums
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

  // Initialize filters from persisted state
  useEffect(() => {
    if (persistedFilters) {
      setSearchQuery(persistedFilters.search || '')
      setFilterStatus(persistedFilters.status || 'all')
      setFilterRole(persistedFilters.role || 'all')
    }
  }, [persistedFilters])

  // Update persisted filters when they change
  useEffect(() => {
    setPersistedFilters({
      search: searchQuery,
      status: filterStatus,
      role: filterRole
    })
  }, [searchQuery, filterStatus, filterRole, setPersistedFilters])
  
  // Add this with your other useEffects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

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

  // Handlers
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

  // Table columns
  const columns = [
    {
      key: "name",
      header: "Employee",
      render: (user: User) => (
        <button
          onClick={() => handleViewDetail(user)}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1 group"
          aria-label={`View details for ${user.name}`}
        >
          <div className="relative dropdown-container">
            <img
              src={user.avatar || "/placeholder-user.jpg"}
              alt=""
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
              loading="lazy"
            />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${user.status === "Active" ? "bg-green-500" :
              user.status === "Pending" ? "bg-yellow-500" : "bg-gray-400"
              }`} />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="flex items-center gap-2 text-xs">
              {user.employeeNumber && (
                <span className="text-gray-500 dark:text-gray-400">ID: {user.employeeNumber}</span>
              )}
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400">{user.email}</span>
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
      render: (user: User) => <StatusBadge type="role" value={user.role} />,
      hideOnMobile: false,
      hideOnTablet: false,
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => <StatusBadge type="status" value={user.status} />,
      hideOnMobile: false,
      hideOnTablet: false,
    },
    {
      key: "department",
      header: "Department",
      render: (user: User) => (
        <div className="text-gray-600 dark:text-gray-300">
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
        <div className="text-gray-600 dark:text-gray-300 font-medium">
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
        // Use the global state instead of local hooks
        const isOpen = openDropdownId === user.id

        return (
          <div className="relative dropdown-container">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDropdownId(isOpen ? null : user.id)}
              className="!px-2"
              aria-label="Actions menu"
              aria-expanded={isOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Quick Actions</p>
                </div>

                <button
                  onClick={() => { handleViewDetail(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => { handleViewAssignments(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Jobs
                </button>
                <button
                  onClick={() => { handleAssignJob(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Assign to Job
                </button>
                <button
                  onClick={() => { handleTimeTracking(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Track Time
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => { handleEdit(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => { handleStatusToggle(user); setOpenDropdownId(null); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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

  // Mobile card view for employees
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
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <button
            onClick={() => handleViewDetail(user)}
            className="flex items-center space-x-3 flex-1 group"
          >
            <div className="relative">
              <img
                src={user.avatar || "/placeholder-user.jpg"}
                alt=""
                className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
                loading="lazy"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${user.status === "Active" ? "bg-green-500" :
                  user.status === "Pending" ? "bg-yellow-500" : "bg-gray-400"
                }`} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
            </div>
          </button>

          <div className="relative" ref={dropdownRef}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="!px-2"
              aria-label="Actions menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  onClick={() => { handleViewDetail(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => { handleViewAssignments(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  View Jobs
                </button>
                <button
                  onClick={() => { handleAssignJob(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Assign to Job
                </button>
                <button
                  onClick={() => { handleTimeTracking(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Track Time
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => { handleEdit(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => { handleStatusToggle(user); setIsOpen(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            <span className="text-gray-500 dark:text-gray-400">Role:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{user.role}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Status:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{user.status}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Dept:</span>
            <span className="ml-1 text-gray-900 dark:text-white">{user.department || "—"}</span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Rate:</span>
            <span className="ml-1 text-gray-900 dark:text-white">
              {user.hourlyRate ? `$${user.hourlyRate}` : "—"}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
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

        {/* Filters skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>

        {/* Table/Grid skeleton */}
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
      {/* Header with Stats and Hire Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Employees
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage your workforce
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {/* Stats Cards */}
          <Card className="p-3 bg-green-50 dark:bg-green-900/20">
            <div className="text-xs text-green-600 dark:text-green-400">Active</div>
            <div className="text-xl font-bold text-green-700 dark:text-green-300">{stats.active}</div>
          </Card>
          <Card className="p-3 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
            <div className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
          </Card>
          <Card className="p-3 bg-gray-50 dark:bg-gray-800">
            <div className="text-xs text-gray-600 dark:text-gray-400">Inactive</div>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-300">{stats.inactive}</div>
          </Card>
          <Button
            variant="primary"
            onClick={() => setShowHireModal(true)}
            className="ml-2"
            aria-label="Hire new employee"
          >
            + Hire
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Grid cols={{ default: 1, sm: 2, md: 3 }} gap="md">
        <Input
          type="search"
          placeholder="Search by name, email, or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search employees"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Pending">Pending</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="input-field"
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          <option value="Worker">Worker</option>
          <option value="Supervisor">Supervisor</option>
        </select>
      </Grid>

      {/* Employee List */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          title="No employees found"
          description={searchQuery || filterStatus !== 'all' || filterRole !== 'all'
            ? "Try adjusting your filters"
            : "Get started by hiring your first employee"
          }
          action={
            <Button variant="primary" onClick={() => setShowHireModal(true)}>
              Hire Employee
            </Button>
          }
        />
      ) : isMobile ? (
        // Mobile: Card grid
        <div className="space-y-4">
          {filteredEmployees.map(employee => (
            <EmployeeCard key={employee.id} user={employee} />
          ))}
        </div>
      ) : (
        // Tablet/Desktop: Data table
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
      )}

      {/* Modals */}
      <Modal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        title="Hire New Employee"
      >
        <EmployeeForm
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          onSuccess={handleFormSuccess}
        />
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Employee"
      >
        {selectedEmployee && (
          <EmployeeForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleFormSuccess}
          />
        )}
      </Modal>

      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Employee Details"
        size="lg"
      >
        {selectedEmployee && (
          <EmployeeDetail
            isOpen={showDetailModal}  // Add this line
            employee={selectedEmployee as any}
            onClose={() => setShowDetailModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={showAssignJobModal}
        onClose={() => setShowAssignJobModal(false)}
        title="Assign Job"
      >
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

      <Modal
        isOpen={showTimeTrackingModal}
        onClose={() => setShowTimeTrackingModal(false)}
        title="Time Tracking"
      >
        {selectedEmployee && (
          <TimeTrackingModal
            isOpen={showTimeTrackingModal}
            onClose={() => setShowTimeTrackingModal(false)}
            employeeId={selectedEmployee.id}
            employeeName={selectedEmployee.name}
          />
        )}
      </Modal>

      {/* Assignments Modal */}
      <Modal
        isOpen={showAssignments}
        onClose={() => setShowAssignments(false)}
        title={`${selectedEmployee?.name}'s Jobs`}
        size="lg"
      >
        {assignments.length === 0 ? (
          <EmptyState
            title="No job assignments"
            description="This employee hasn't been assigned to any jobs yet."
          />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <Card key={assignment.jobId} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {assignment.jobNumber}
                  </span>
                  <StatusBadge type="job" value={assignment.status} />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {assignment.jobTitle}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}
