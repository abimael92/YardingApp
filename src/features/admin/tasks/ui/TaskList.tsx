/**
 * Task List Component
 * 
 * Read-only list of all tasks for admin view.
 * Phase 1: Display only, no mutations.
 */

"use client"

import { motion } from "framer-motion"
import { EyeIcon } from "@heroicons/react/24/outline"
import { getTasks } from "@/src/services/taskService"
import type { Task } from "@/src/domain/models"

const TaskList = () => {
  const tasks = getTasks()

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 dark:text-red-400"
      case "medium":
        return "text-yellow-600 dark:text-yellow-400"
      case "low":
        return "text-green-600 dark:text-green-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Tasks</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {tasks.length} total tasks
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Pending: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {tasks.filter((t) => t.status === "pending").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">In Progress: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {tasks.filter((t) => t.status === "in-progress").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Completed: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {tasks.filter((t) => t.status === "completed").length}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Title
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Assigned To
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Status
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Priority
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Due Date
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Location
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <motion.tr
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">{task.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {task.description}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {task.assignedTo || "Unassigned"}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`font-medium capitalize ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {new Date(task.dueDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  {task.location}
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

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
        </div>
      )}
    </div>
  )
}

export default TaskList
