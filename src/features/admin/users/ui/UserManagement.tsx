/**
 * Enhanced User Management Component
 * 
 * Full-featured user management with filters, search, bulk actions, and more
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import FormModal from "@/src/shared/ui/FormModal"
import {
  getAllUsers,
  deleteUser,
  updateUser,
  getUsersByRole,
  getUsersByStatus,
} from "@/src/services/userService"
import { getMockRole } from "@/src/features/auth/services/mockAuth"
import type { User } from "@/src/domain/models"
import UserForm from "./UserForm"
import UserDetail from "./UserDetail"

interface ExtendedUser extends User {
  lastLogin?: string
  avatar?: string
}

const UserManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<ExtendedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null)
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<User["role"] | "all">("all")
  const [statusFilter, setStatusFilter] = useState<User["status"] | "all">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [showFilters, setShowFilters] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [sortColumn, setSortColumn] = useState<keyof ExtendedUser | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const currentRole = getMockRole()

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      let data = await getAllUsers()

      // Role-based filtering
      if (currentRole === "supervisor") {
        // Supervisors only see workers and clients
        data = data.filter((u) => u.role === "Worker" || u.role === "Client")
      }

      // Add mock lastLogin and avatar
      const extendedData: ExtendedUser[] = data.map((user) => ({
        ...user,
        lastLogin: user.joinDate, // Mock: using joinDate as lastLogin
        avatar: `/placeholder-user.jpg`,
      }))

      setUsers(extendedData)
    } catch (error) {
      console.error("Failed to load users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...users]

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      filtered = filtered.filter((user) => {
        const joinDate = new Date(user.joinDate)
        switch (dateFilter) {
          case "today":
            return joinDate.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return joinDate >= weekAgo
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return joinDate >= monthAgo
          default:
            return true
        }
      })
    }

    // Sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn]
        const bVal = b[sortColumn]
        if (aVal === undefined || aVal === null) return 1
        if (bVal === undefined || bVal === null) return -1
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortDirection === "asc" ? comparison : -comparison
      })
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [users, searchQuery, roleFilter, statusFilter, dateFilter, sortColumn, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredUsers.slice(start, start + itemsPerPage)
  }, [filteredUsers, currentPage, itemsPerPage])

  const handleCreate = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: ExtendedUser) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleView = (user: ExtendedUser) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
  }

  const handleDelete = async (user: ExtendedUser) => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      await deleteUser(user.id)
      await loadUsers()
      setSelectedUsers((prev) => {
        const next = new Set(prev)
        next.delete(user.id)
        return next
      })
    } catch (error) {
      console.error("Failed to delete user:", error)
      alert("Failed to delete user")
    }
  }

  const handleDeactivate = async (user: ExtendedUser) => {
    if (
      !confirm(
        `Are you sure you want to ${user.status === "Active" ? "deactivate" : "activate"} ${user.name}?`
      )
    ) {
      return
    }

    try {
      await updateUser(user.id, {
        status: user.status === "Active" ? "Inactive" : "Active",
      })
      await loadUsers()
    } catch (error) {
      console.error("Failed to update user status:", error)
      alert("Failed to update user status")
    }
  }

  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUsers.size === 0) {
      alert("Please select at least one user")
      return
    }

    const actionText = {
      activate: "activate",
      deactivate: "deactivate",
      delete: "delete",
    }[action]

    if (
      !confirm(
        `Are you sure you want to ${actionText} ${selectedUsers.size} user(s)? This action cannot be undone.`
      )
    ) {
      return
    }

    try {
      if (action === "delete") {
        await Promise.all(
          Array.from(selectedUsers).map((id) => deleteUser(id))
        )
      } else {
        await Promise.all(
          Array.from(selectedUsers).map((id) => {
            const user = users.find((u) => u.id === id)
            if (user) {
              return updateUser(id, {
                status: action === "activate" ? "Active" : "Inactive",
              })
            }
          })
        )
      }
      await loadUsers()
      setSelectedUsers(new Set())
    } catch (error) {
      console.error(`Failed to ${actionText} users:`, error)
      alert(`Failed to ${actionText} users`)
    }
  }

  const toggleRowExpansion = (userId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) {
        next.delete(userId)
      } else {
        next.add(userId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(paginatedUsers.map((u) => u.id)))
    }
  }

  const handleExport = () => {
    const csv = [
      ["Name", "Email", "Role", "Status", "Join Date", "Last Login"].join(","),
      ...filteredUsers.map((user) =>
        [
          user.name,
          user.email,
          user.role,
          user.status,
          user.joinDate,
          user.lastLogin || "Never",
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const text = await file.text()
      const lines = text.split("\n").slice(1) // Skip header
      // Parse and import logic would go here
      alert("Import functionality would be implemented here")
    }
    input.click()
  }

  const handleSort = (column: keyof ExtendedUser) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
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

  const columns: Column<ExtendedUser>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center space-x-3">
          <img
            src={user.avatar || "/placeholder-user.jpg"}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
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
      key: "lastLogin",
      header: "Last Login",
      render: (user) => (
        <div className="text-gray-600 dark:text-gray-300 text-sm">
          {user.lastLogin
            ? new Date(user.lastLogin).toLocaleDateString()
            : "Never"}
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage all system users ({filteredUsers.length} total)
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters
                  ? "bg-primary-100 dark:bg-primary-900/30 border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-300"
                  : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
              }`}
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as User["role"] | "all")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Worker">Worker</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as User["status"] | "all")}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Join Date
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) =>
                        setDateFilter(e.target.value as "all" | "today" | "week" | "month")
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(roleFilter !== "all" || statusFilter !== "all" || dateFilter !== "all") && (
                  <button
                    onClick={() => {
                      setRoleFilter("all")
                      setStatusFilter("all")
                      setDateFilter("all")
                    }}
                    className="mt-4 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="card p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 text-sm font-medium text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 text-sm font-medium text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Data Table */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users found"
            message={
              searchQuery || roleFilter !== "all" || statusFilter !== "all" || dateFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first user to get started"
            }
            actionLabel="Add User"
            onAction={handleCreate}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="w-12 py-3 px-4"></th>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleSort(column.key as keyof ExtendedUser)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.header}</span>
                          {sortColumn === column.key && (
                            <span className="text-primary-600 dark:text-primary-400">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => {
                    const isExpanded = expandedRows.has(user.id)
                    const isSelected = selectedUsers.has(user.id)
                    return (
                      <>
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                            isSelected ? "bg-primary-50 dark:bg-primary-900/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded border-gray-300 dark:border-gray-600"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleRowExpansion(user.id)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                              {isExpanded ? (
                                <ChevronDownIcon className="w-4 h-4" />
                              ) : (
                                <ChevronRightIcon className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          {columns.map((column) => (
                            <td key={String(column.key)} className="py-3 px-4">
                              {column.render
                                ? column.render(user)
                                : (user[column.key as keyof ExtendedUser] as React.ReactNode)}
                            </td>
                          ))}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-1.5 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeactivate(user)}
                                className={`p-1.5 rounded ${
                                  user.status === "Active"
                                    ? "text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
                                    : "text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                                }`}
                                title={user.status === "Active" ? "Deactivate" : "Activate"}
                              >
                                {user.status === "Active" ? (
                                  <XMarkIcon className="w-4 h-4" />
                                ) : (
                                  <CheckIcon className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                                title="Delete"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        {/* Expandable Row */}
                        {isExpanded && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gray-50 dark:bg-gray-800/50"
                          >
                            <td colSpan={columns.length + 3} className="px-4 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">User ID</dt>
                                  <dd className="text-gray-900 dark:text-white font-mono text-xs">
                                    {user.id}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">Join Date</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {new Date(user.joinDate).toLocaleDateString()}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">Last Login</dt>
                                  <dd className="text-gray-900 dark:text-white">
                                    {user.lastLogin
                                      ? new Date(user.lastLogin).toLocaleString()
                                      : "Never"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                                  <dd>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}
                                    >
                                      {user.status}
                                    </span>
                                  </dd>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <UserForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingUser(null)
        }}
        onSuccess={async () => {
          setIsFormOpen(false)
          setEditingUser(null)
          await loadUsers()
        }}
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

export default UserManagement
