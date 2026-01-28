/**
 * Employee List Component
 * 
 * Full CRUD list of all employees for admin view.
 */

"use client"

import { useState, useEffect } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getAllEmployees, deleteEmployee } from "@/src/services/employeeService"
import type { Employee } from "@/src/domain/entities"
import { EmployeeStatus, EmployeeRole } from "@/src/domain/entities"
import EmployeeForm from "./EmployeeForm"
import EmployeeDetail from "./EmployeeDetail"

const EmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const loadEmployees = async () => {
    setIsLoading(true)
    try {
      const data = await getAllEmployees()
      setEmployees(data)
    } catch (error) {
      console.error("Failed to load employees:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleCreate = () => {
    setEditingEmployee(null)
    setIsFormOpen(true)
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsFormOpen(true)
  }

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee)
    setIsDetailOpen(true)
  }

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to delete ${employee.displayName}?`)) {
      return
    }

    try {
      await deleteEmployee(employee.id)
      await loadEmployees()
    } catch (error) {
      console.error("Failed to delete employee:", error)
      alert("Failed to delete employee")
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingEmployee(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    await loadEmployees()
  }

  const getStatusBadge = (status: EmployeeStatus) => {
    const colors = {
      [EmployeeStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [EmployeeStatus.INACTIVE]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [EmployeeStatus.ON_LEAVE]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [EmployeeStatus.TERMINATED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const columns: Column<Employee>[] = [
    {
      key: "displayName",
      header: "Employee",
      render: (employee) => (
        <div className="flex items-center space-x-3">
          <img
            src={employee.avatar || "/placeholder-user.jpg"}
            alt={employee.displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="font-medium text-gray-900 dark:text-white">{employee.displayName}</div>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (employee) => (
        <div className="text-gray-600 dark:text-gray-300">{employee.department || "N/A"}</div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (employee) => (
        <span className="font-medium text-gray-900 dark:text-white capitalize">{employee.role}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (employee) => getStatusBadge(employee.status),
    },
    {
      key: "rating",
      header: "Rating",
      render: (employee) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {employee.rating?.toFixed(1) || "N/A"}
          </span>
          {employee.rating && <span className="text-yellow-500">★</span>}
        </div>
      ),
    },
    {
      key: "completedJobsCount",
      header: "Completed Jobs",
      render: (employee) => (
        <div className="text-gray-600 dark:text-gray-300">{employee.completedJobsCount}</div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading employees..." />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all employees
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Employee
          </button>
        </div>

        {/* Table */}
        <DataTable
          data={employees}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          keyExtractor={(employee) => employee.id}
          emptyMessage="No employees found. Create your first employee to get started."
        />
      </div>

      {/* Form Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        employee={editingEmployee}
      />

      {/* Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedEmployee(null)
          }}
          employee={selectedEmployee}
        />
      )}
    </>
  )
}

export default EmployeeList
