"use client"

import { useState, useEffect } from "react"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import EmployeeForm from "./EmployeeForm"
import EmployeeDetail from "./EmployeeDetail"
import AssignJobModal from "./AssignJobModal"
import TimeTrackingModal from "./TimeTrackingModal"
import {
  getAllUsers,
  updateUserStatus,
  getEmployeeAssignments,
  getEmployeeStats
} from "@/src/services/userService"
import { deleteEmployee, updateEmployee } from "@/src/services/employeeService"
import type { User, JobAssignment } from "@/src/domain/models"
import type { Employee } from "@/src/domain/entities"

const EmployeeList = () => {
  const [employees, setEmployees] = useState<User[]>([])
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 })
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null)
  const [assignments, setAssignments] = useState<JobAssignment[]>([])
  const [showAssignments, setShowAssignments] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHireModal, setShowHireModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAssignJobModal, setShowAssignJobModal] = useState(false)
  const [showTimeTrackingModal, setShowTimeTrackingModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [allUsers, statsData] = await Promise.all([
        getAllUsers(),
        getEmployeeStats()
      ])
      setEmployees(allUsers.filter(u => u.role === "Worker" || u.role === "Supervisor"))
      setStats(statsData)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleStatusToggle = async (user: User) => {
    setUpdatingId(user.id)
    try {
      const newStatus = user.status === "Active" ? "Inactive" : "Active"
      await updateUserStatus(user.id, newStatus)
      await loadData()
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleFire = async (id: string) => {
    if (confirm("Are you sure you want to permanently fire this employee? This cannot be undone.")) {
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
      setAssignments(userAssignments)
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

  const getStatusBadge = (status: User["status"]) => {
    const colors = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const getRoleBadge = (role: User["role"]) => {
    const colors = {
      Worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Supervisor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      Admin: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      Client: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
        {role}
      </span>
    )
  }
  
  
  console.log("Employees with roles:", employees.map(e => ({ name: e.name, role: e.role })))

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Employee",
      render: (user) => (
        <div
          className="flex items-center space-x-3 cursor-pointer hover:opacity-80"
          onClick={() => handleViewDetail(user)}
        >
          <img
            src={user.avatar || "/placeholder-user.jpg"}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
            {user.employeeNumber && (
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.employeeNumber}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300">{user.email}</div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300">
          {user.department || "—"}
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => getStatusBadge(user.status),
    },
    {
      key: "hourlyRate",
      header: "Rate",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300">
          {user.hourlyRate ? `$${user.hourlyRate}/hr` : "—"}
        </div>
      ),
    },
    {
      key: "assignments",
      header: "Jobs",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300">
          {user.assignedJobs?.filter(j => j.status !== "completed").length || 0} active
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewAssignments(user)}
            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            title="View job assignments"
          >
            Jobs
          </button>
          <button
            onClick={() => handleAssignJob(user)}
            className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            title="Assign to job"
          >
            Assign
          </button>
          <button
            onClick={() => handleTimeTracking(user)}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            title="Track time"
          >
            Time
          </button>
          <button
            onClick={() => handleEdit(user)}
            className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            title="Edit employee"
          >
            Edit
          </button>
          <button
            onClick={() => handleFire(user.id)}
            disabled={updatingId === user.id}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            title="Fire employee"
          >
            {updatingId === user.id ? "..." : "Fire"}
          </button>
          <button
            onClick={() => handleStatusToggle(user)}
            disabled={updatingId === user.id}
            className={`px-2 py-1 text-xs rounded transition-colors ${user.status === "Active"
                ? "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
              } ${updatingId === user.id ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {updatingId === user.id ? "..." : user.status === "Active" ? "Disable" : "Enable"}
          </button>
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading employees..." />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Stats and Hire Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Employees</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
            Workers and Supervisors
          </p>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          {/* Stats Cards */}
          <div className="bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400">Active</div>
            <div className="text-lg font-bold text-green-700 dark:text-green-300">{stats.active}</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
            <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{stats.pending}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400">Inactive</div>
            <div className="text-lg font-bold text-gray-700 dark:text-gray-300">{stats.inactive}</div>
          </div>
          <button
            onClick={() => setShowHireModal(true)}
            className="ml-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Hire
          </button>
        </div>
      </div>

      {/* Table */}
      {employees.length === 0 ? (
        <EmptyState
          title="No employees found"
          message="No active workers or supervisors in the system."
        />
      ) : (
        <DataTable
          data={employees}
          columns={columns}
          keyExtractor={(user) => user.id}
          emptyMessage="No employees found."
        />
      )}

      {/* Modals */}
      {showHireModal && (
        <EmployeeForm
          isOpen={showHireModal}
          onClose={() => setShowHireModal(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {showEditModal && selectedEmployee && (
        <EmployeeForm
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleFormSuccess}
          employee={selectedEmployee as unknown as Employee}
        />
      )}

      {showDetailModal && selectedEmployee && (
        <EmployeeDetail
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          employee={selectedEmployee as unknown as Employee}
        />
      )}

      {showAssignJobModal && selectedEmployee && (
        <AssignJobModal
          isOpen={showAssignJobModal}
          onClose={() => setShowAssignJobModal(false)}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
          onSuccess={loadData}
        />
      )}

      {showTimeTrackingModal && selectedEmployee && (
        <TimeTrackingModal
          isOpen={showTimeTrackingModal}
          onClose={() => setShowTimeTrackingModal(false)}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
        />
      )}

      {/* Assignments Modal */}
      {showAssignments && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedEmployee.name}'s Jobs
                </h2>
                <button
                  onClick={() => setShowAssignments(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              {assignments.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No job assignments found.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div
                      key={assignment.jobId}
                      className="border dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {assignment.jobNumber}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : assignment.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                          {assignment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {assignment.jobTitle}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                        <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeList