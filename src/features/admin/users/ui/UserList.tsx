/**
 * User List Component
 * 
 * Full CRUD list of all users for admin view.
 */

"use client"

import { useState, useEffect } from "react"
import { PlusIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import { getAllUsers, deleteUser } from "@/src/services/userService"
import type { User } from "@/src/domain/models"
import UserForm from "./UserForm"
import UserDetail from "./UserDetail"

const UserList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleView = (user: User) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) {
      return
    }

    try {
      await deleteUser(user.id)
      await loadUsers()
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingUser(null)
  }

  const handleFormSuccess = async () => {
    handleFormClose()
    await loadUsers()
  }

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

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Name",
      render: (user) => (
        <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user) => <div className="text-gray-600 dark:text-gray-300">{user.email}</div>,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <span className={`font-medium ${getRoleColor(user.role)}`}>{user.role}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status}
        </span>
      ),
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
    return <LoadingState message="Loading users..." />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all system users
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add User
          </button>
        </div>

        {/* Table */}
        <DataTable
          data={users}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found. Create your first user to get started."
        />
      </div>

      {/* Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        user={editingUser}
      />

      {/* Detail Modal */}
      {selectedUser && (
        <UserDetail
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
        />
      )}
    </>
  )
}

export default UserList
