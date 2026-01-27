/**
 * Employee List Component
 * 
 * Read-only list of all employees for admin view.
 * Phase 1: Display only, no mutations.
 */

"use client"

import { motion } from "framer-motion"
import { EyeIcon } from "@heroicons/react/24/outline"
import { getAllEmployees } from "@/src/services/employeeService"
import type { Worker } from "@/src/domain/models"

const EmployeeList = () => {
  const employees = getAllEmployees()

  const getStatusColor = (status: Worker["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "busy":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "offline":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Employees</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {employees.length} total employees
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Available: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {employees.filter((e) => e.status === "available").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Busy: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {employees.filter((e) => e.status === "busy").length}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Employee
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Role
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Status
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Rating
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Completed Tasks
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <motion.tr
                key={employee.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="font-medium text-gray-900 dark:text-white">
                      {employee.name}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{employee.role}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      employee.status
                    )}`}
                  >
                    {employee.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {employee.rating.toFixed(1)}
                    </span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {employee.completedTasks}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No employees found</p>
        </div>
      )}
    </div>
  )
}

export default EmployeeList
