/**
 * Employee Detail Component
 * 
 * Displays detailed view of an employee
 */

"use client"

import FormModal from "@/src/shared/ui/FormModal"
import type { Employee } from "@/src/domain/entities"
import { EmployeeStatus } from "@/src/domain/entities"

interface EmployeeDetailProps {
  isOpen: boolean
  onClose: () => void
  employee: Employee
}

const EmployeeDetail = ({ isOpen, onClose, employee }: EmployeeDetailProps) => {
  const getStatusBadge = (status: EmployeeStatus) => {
    const colors: Record<EmployeeStatus, string> = {
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

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Employee Details" size="lg" footer={null}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.displayName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{employee.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white capitalize">
                {employee.role}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">{getStatusBadge(employee.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {employee.department || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Hire Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(employee.hireDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {employee.rating ? `${employee.rating.toFixed(1)} ★` : "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed Jobs
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {employee.completedJobsCount}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Hours Worked
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                {employee.totalHoursWorked}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </FormModal>
  )
}

export default EmployeeDetail
