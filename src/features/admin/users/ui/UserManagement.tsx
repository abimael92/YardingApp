/**
 * Enhanced User Management Component
 * 
 * Full-featured user management with filters, search, bulk actions, and more
 */

"use client"

import React, { useState, useEffect, useMemo } from "react"
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

      // System Users: Only show Client or Worker roles, and only Active status
      data = data.filter((u) =>
        (u.role === "Client" || u.role === "Worker") && u.status === "Active"
      )

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
        return "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c]"
      case "Pending":
        return "bg-[#ffc107]/20 text-[#b85e1a] dark:text-[#d88c4a]"
      case "Inactive":
        return "bg-[#d4a574]/20 text-[#8b4513] dark:text-[#d4a574]"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const getRoleColor = (role: User["role"]) => {
    switch (role) {
      case "Admin":
        return "text-[#8b4513] dark:text-[#d4a574] font-semibold"
      case "Supervisor":
        return "text-[#2e8b57] dark:text-[#4a7c5c] font-semibold"
      case "Worker":
        return "text-[#b85e1a] dark:text-[#d88c4a] font-semibold"
      case "Client":
        return "text-[#87a6c7] dark:text-[#a6c7e0] font-semibold"
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
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white font-bold text-sm">
            {user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{user.name}</div>
            <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">{user.email}</div>
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
        <div className="text-[#8b4513] dark:text-[#d4a574] text-sm">
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
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-2xl">
              User Management
            </h1>
            <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-0.5 sm:mt-1">
              Manage all system users ({filteredUsers.length} total)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-[#f5f1e6] dark:bg-gray-800 hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={handleImport}
              className="inline-flex items-center px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-[#f5f1e6] dark:bg-gray-800 hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowUpTrayIcon className="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-[#2e8b57]/20 transform hover:-translate-y-0.5"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-4 border-[#d4a574]/30 dark:border-[#8b4513]/50" style={{ background: "var(--bg-primary)" }}>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 dark:text-[#d4a574]/60" />
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all ${showFilters
                  ? "bg-[#2e8b57]/20 border-[#2e8b57] text-[#2e8b57] dark:text-[#4a7c5c]"
                  : "border-[#d4a574] dark:border-[#8b4513] text-[#8b4513] dark:text-[#d4a574] bg-[#f5f1e6] dark:bg-gray-800 hover:bg-[#d4a574]/20 dark:hover:bg-gray-700"
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
                className="mt-4 pt-4 border-t border-[#d4a574]/30 dark:border-[#8b4513]/50 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value as User["role"] | "all")}
                      className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
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
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as User["status"] | "all")}
                      className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Join Date
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) =>
                        setDateFilter(e.target.value as "all" | "today" | "week" | "month")
                      }
                      className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
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
                    className="mt-4 text-sm text-[#2e8b57] dark:text-[#4a7c5c] hover:underline"
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
          <div className="card p-4 bg-[#2e8b57]/10 border border-[#2e8b57] dark:border-[#4a7c5c]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#2e8b57] dark:text-[#4a7c5c]">
                {selectedUsers.size} user(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction("activate")}
                  className="px-3 py-1.5 text-sm font-medium text-[#2e8b57] dark:text-[#4a7c5c] bg-[#2e8b57]/20 rounded-lg hover:bg-[#2e8b57]/30 transition-all"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkAction("deactivate")}
                  className="px-3 py-1.5 text-sm font-medium text-[#b85e1a] dark:text-[#d88c4a] bg-[#b85e1a]/20 rounded-lg hover:bg-[#b85e1a]/30 transition-all"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => handleBulkAction("delete")}
                  className="px-3 py-1.5 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-[#8b4513]/20 rounded-lg hover:bg-[#8b4513]/30 transition-all"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-3 py-1.5 text-sm font-medium text-[#b85e1a] dark:text-[#d4a574] hover:underline"
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
          <div className="card overflow-hidden border-[#d4a574]/30 dark:border-[#8b4513]/50" style={{ background: "var(--bg-primary)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d4a574]/30 dark:border-[#8b4513]/50 bg-[#f5f1e6] dark:bg-gray-800">
                    <th className="w-12 py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-[#d4a574] dark:border-[#8b4513] text-[#2e8b57] focus:ring-[#2e8b57]"
                      />
                    </th>
                    <th className="w-12 py-3 px-4"></th>
                    {columns.map((column) => (
                      <th
                        key={String(column.key)}
                        className="text-left py-3 px-4 text-[#8b4513] dark:text-[#d4a574] font-medium cursor-pointer hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => handleSort(column.key as keyof ExtendedUser)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>{column.header}</span>
                          {sortColumn === column.key && (
                            <span className="text-[#2e8b57] dark:text-[#4a7c5c]">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="text-left py-3 px-4 text-[#8b4513] dark:text-[#d4a574] font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user, index) => {
                    const isExpanded = expandedRows.has(user.id)
                    const isSelected = selectedUsers.has(user.id)
                    return (
                      <React.Fragment key={user.id}>
                        <motion.tr
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`border-b border-[#d4a574]/20 dark:border-[#8b4513]/30 hover:bg-[#f5f1e6] dark:hover:bg-gray-800/50 transition-colors ${isSelected ? "bg-[#2e8b57]/10 dark:bg-[#2e8b57]/20" : ""
                            }`}
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleUserSelection(user.id)}
                              className="rounded border-[#d4a574] dark:border-[#8b4513] text-[#2e8b57] focus:ring-[#2e8b57]"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => toggleRowExpansion(user.id)}
                              className="text-[#b85e1a]/60 hover:text-[#2e8b57] dark:text-[#d4a574]/60 dark:hover:text-[#4a7c5c] transition-colors"
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
                                className="p-1.5 text-[#b85e1a]/60 hover:text-[#2e8b57] dark:text-[#d4a574]/60 dark:hover:text-[#4a7c5c] rounded transition-colors"
                                title="Edit"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeactivate(user)}
                                className={`p-1.5 rounded transition-colors ${user.status === "Active"
                                    ? "text-[#b85e1a]/60 hover:text-[#b85e1a] dark:text-[#d88c4a]/60 dark:hover:text-[#d88c4a]"
                                    : "text-[#2e8b57]/60 hover:text-[#2e8b57] dark:text-[#4a7c5c]/60 dark:hover:text-[#4a7c5c]"
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
                                className="p-1.5 text-[#b85e1a]/60 hover:text-[#8b4513] dark:text-[#d4a574]/60 dark:hover:text-[#8b4513] rounded transition-colors"
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
                            className="bg-[#f5f1e6] dark:bg-gray-800/50"
                          >
                            <td colSpan={columns.length + 3} className="px-4 py-4">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <dt className="text-[#b85e1a]/70 dark:text-gray-400">User ID</dt>
                                  <dd className="text-[#8b4513] dark:text-[#d4a574] font-mono text-xs">
                                    {user.id}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[#b85e1a]/70 dark:text-gray-400">Join Date</dt>
                                  <dd className="text-[#8b4513] dark:text-[#d4a574]">
                                    {new Date(user.joinDate).toLocaleDateString()}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[#b85e1a]/70 dark:text-gray-400">Last Login</dt>
                                  <dd className="text-[#8b4513] dark:text-[#d4a574]">
                                    {user.lastLogin
                                      ? new Date(user.lastLogin).toLocaleString()
                                      : "Never"}
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-[#b85e1a]/70 dark:text-gray-400">Status</dt>
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
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-[#d4a574]/30 dark:border-[#8b4513]/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 border border-[#d4a574] dark:border-[#8b4513] rounded bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">per page</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-[#d4a574] dark:border-[#8b4513] rounded bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-[#d4a574] dark:border-[#8b4513] rounded bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] disabled:opacity-50 disabled:cursor-not-allowed text-sm hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
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