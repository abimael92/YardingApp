/**
 * User List Component
 * 
 * Read-only list of all users for admin view.
 * Phase 1: Display only, no mutations.
 */

"use client"

import { motion } from "framer-motion"
import { EyeIcon } from "@heroicons/react/24/outline"
import { getAllUsers } from "@/src/services/userService"
import type { User } from "@/src/domain/models"

const UserList = () => {
  const users = getAllUsers()

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "Inactive":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Admin":
        return "text-purple-600 dark:text-purple-400"
      case "Supervisor":
        return "text-blue-600 dark:text-blue-400"
      case "Worker":
        return "text-green-600 dark:text-green-400"
      case "Client":
        return "text-gray-600 dark:text-gray-400"
      default:
        return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Users</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {users.length} total users
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Active: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {users.filter((u) => u.status === "Active").length}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Pending: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {users.filter((u) => u.status === "Pending").length}
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Name
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Email
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Role
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Status
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Join Date
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                  {new Date(user.joinDate).toLocaleDateString()}
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

      {users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </div>
      )}
    </div>
  )
}

export default UserList
