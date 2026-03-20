/**
 * User Detail Component
 *
 * Displays detailed view of a user with Assigned Role dropdown and actions:
 * Edit, Disable, Reset Password, Impersonate, Delete.
 */

"use client"

import {
  PencilIcon,
  NoSymbolIcon,
  KeyIcon,
  UserCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import FormModal from "@/src/shared/ui/Modal"
import type { User } from "@/src/domain/models"

const ROLES: User["role"][] = ["Admin", "Supervisor", "Worker", "Client"]

interface UserDetailProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onEdit?: (user: User) => void
  onDisable?: (user: User) => void
  onResetPassword?: (user: User) => void
  onImpersonate?: (user: User) => void
  onDelete?: (user: User) => void
  onRoleChange?: (user: User, newRole: User["role"]) => void
}

const UserDetail = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onDisable,
  onResetPassword,
  onImpersonate,
  onDelete,
  onRoleChange,
}: UserDetailProps) => {
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

  const lastLogin = (user as { lastLogin?: string }).lastLogin

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
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Assigned Role
              </dt>
              <dd className="mt-0">
                {onRoleChange ? (
                  <select
                    value={user.role}
                    onChange={(e) =>
                      onRoleChange(user, e.target.value as User["role"])
                    }
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className={`font-medium ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                )}
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
            {lastLogin !== undefined && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Login
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {lastLogin
                    ? new Date(lastLogin).toLocaleString()
                    : "Never"}
                </dd>
              </div>
            )}
            {user.employeeNumber != null && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Employee #
                </dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {user.employeeNumber}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => { onEdit(user); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDisable && (
              <button
                type="button"
                onClick={() => { onDisable(user); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/30"
              >
                <NoSymbolIcon className="w-4 h-4" />
                {user.status === "Active" ? "Disable" : "Enable"}
              </button>
            )}
            {onResetPassword && (
              <button
                type="button"
                onClick={() => { onResetPassword(user); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/30"
              >
                <KeyIcon className="w-4 h-4" />
                Reset Password
              </button>
            )}
            {onImpersonate && (
              <button
                type="button"
                onClick={() => { onImpersonate(user); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/30"
              >
                <UserCircleIcon className="w-4 h-4" />
                Impersonate
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => { onDelete(user); onClose(); }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/30"
              >
                <TrashIcon className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </FormModal>
  )
}

export default UserDetail
