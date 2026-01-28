/**
 * User Detail Component
 * 
 * Displays detailed view of a user
 */

"use client"

import FormModal from "@/src/shared/ui/FormModal"
import type { User } from "@/src/domain/models"

interface UserDetailProps {
  isOpen: boolean
  onClose: () => void
  user: User
}

const UserDetail = ({ isOpen, onClose, user }: UserDetailProps) => {
  const getStatusBadge = (status: User["status"]) => {
    const colors = {
      Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      Inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const getRoleColor = (role: User["role"]) => {
    const colors = {
      Admin: "text-purple-600 dark:text-purple-400",
      Supervisor: "text-blue-600 dark:text-blue-400",
      Worker: "text-green-600 dark:text-green-400",
      Client: "text-gray-600 dark:text-gray-400",
    }
    return colors[role] || "text-gray-600 dark:text-gray-400"
  }

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="User Details" size="md" footer={null}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</dt>
              <dd className="mt-1">
                <span className={`font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="mt-1">{getStatusBadge(user.status)}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Join Date</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(user.joinDate).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </FormModal>
  )
}

export default UserDetail
