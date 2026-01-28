/**
 * Employee List Component
 * 
 * Full CRUD list of all employees for admin view.
 */

"use client"

import { useState, useEffect } from "react"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getAllUsers } from "@/src/services/userService"
import type { User } from "@/src/domain/models"

const EmployeeList = () => {
  const [employees, setEmployees] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      // Employees: Show all users that are NOT Client or Admin (so Worker and Supervisor)
      // And only Active status
      const allUsers = await getAllUsers()
      const filtered = allUsers.filter(
        (u) => (u.role === "Worker" || u.role === "Supervisor") && u.status === "Active"
      )
      setEmployees(filtered)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const getRoleBadge = (role: User["role"]) => {
    const colors: Record<"Worker" | "Supervisor", string> = {
      Worker: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      Supervisor: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    }
    // Since we filter to only Worker and Supervisor, this is safe
    if (role === "Worker" || role === "Supervisor") {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role]}`}>
          {role}
        </span>
      )
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {role}
      </span>
    )
  }

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Employee",
      render: (user) => (
        <div className="flex items-center space-x-3">
          <img
            src="/placeholder-user.jpg"
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
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
      key: "role",
      header: "Role",
      render: (user) => getRoleBadge(user.role),
    },
    {
      key: "joinDate",
      header: "Join Date",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300">
          {new Date(user.joinDate).toLocaleDateString()}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading employees..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Workers and Supervisors (Active only)
          </p>
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
    </div>
  )
}

export default EmployeeList
