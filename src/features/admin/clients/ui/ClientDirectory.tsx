/**
 * Client Directory Dashboard
 * 
 * Comprehensive client management with search, filters, stats, and detailed profiles
 */

"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  CheckIcon,
  XMarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import StatsCard from "@/src/shared/ui/StatsCard"
import { getAllClients } from "@/src/services/clientService"
import { getJobs } from "@/src/services/jobService"
import { getPayments } from "@/src/services/paymentService"
import type { Client } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"
import { JobStatus } from "@/src/domain/entities"
import ClientForm from "./ClientForm"
import ClientProfile from "./ClientProfile"
import ClientAnalytics from "./ClientAnalytics"

const ClientDirectory = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [allJobs, setAllJobs] = useState<any[]>([])
  const [allPayments, setAllPayments] = useState<any[]>([])

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all")
  const [segmentFilter, setSegmentFilter] = useState<ClientSegment | "all">("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "thisMonth" | "lastMonth" | "thisYear">("all")
  const [showFilters, setShowFilters] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Load all data in parallel
      const [allClientsData, jobsData, paymentsData] = await Promise.all([
        getAllClients(),
        getJobs(),
        getPayments(),
      ])
      
      // Only load Active clients
      const activeClients = allClientsData.filter((c) => c.status === ClientStatus.ACTIVE)
      setClients(activeClients)
      setAllJobs(jobsData)
      setAllPayments(paymentsData)
    } catch (error) {
      console.error("Failed to load clients:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const [quickStats, setQuickStats] = useState({
    totalClients: 0,
    activeThisMonth: 0,
    monthlyRevenue: 0,
  })

  // Calculate stats
  useEffect(() => {
    const calculateStats = async () => {
      try {
        const [allClients, payments] = await Promise.all([
          getAllClients(),
          getPayments(),
        ])

        const activeClients = allClients.filter((c) => c.status === ClientStatus.ACTIVE)
        const thisMonth = new Date()
        thisMonth.setDate(1)
        const newThisMonth = activeClients.filter(
          (c) => new Date(c.createdAt) >= thisMonth
        ).length

        const thisMonthRevenue = payments
          .filter((p) => {
            const paymentDate = p.completedAt ? new Date(p.completedAt) : new Date(p.createdAt)
            return paymentDate >= thisMonth && p.status === "completed"
          })
          .reduce((sum, p) => sum + p.amount.amount, 0)

        setQuickStats({
          totalClients: activeClients.length,
          activeThisMonth: newThisMonth,
          monthlyRevenue: thisMonthRevenue,
        })
      } catch (error) {
        console.error("Failed to calculate stats:", error)
      }
    }
    calculateStats()
  }, [clients])

  // Get unique locations for filter dropdown
  const availableLocations = useMemo(() => {
    const locations = new Set<string>()
    clients.forEach((client) => {
      if (client.primaryAddress.city && client.primaryAddress.state) {
        locations.add(`${client.primaryAddress.city}, ${client.primaryAddress.state}`)
      }
    })
    return Array.from(locations).sort()
  }, [clients])

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          client.name.toLowerCase().includes(query) ||
          client.contactInfo.email.toLowerCase().includes(query) ||
          client.contactInfo.phone.includes(query) ||
          client.primaryAddress.city.toLowerCase().includes(query) ||
          client.primaryAddress.state.toLowerCase().includes(query) ||
          client.primaryAddress.street.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status filter (should always be Active, but keep for consistency)
      if (statusFilter !== "all" && client.status !== statusFilter) return false

      // Segment filter
      if (segmentFilter !== "all" && client.segment !== segmentFilter) return false

      // Location filter
      if (locationFilter !== "all") {
        const clientLocation = `${client.primaryAddress.city}, ${client.primaryAddress.state}`
        if (clientLocation !== locationFilter) return false
      }

      // Date range filter
      if (dateRangeFilter !== "all") {
        const clientDate = new Date(client.createdAt)
        const now = new Date()
        if (dateRangeFilter === "thisMonth") {
          if (clientDate.getMonth() !== now.getMonth() || clientDate.getFullYear() !== now.getFullYear()) {
            return false
          }
        } else if (dateRangeFilter === "lastMonth") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1)
          if (clientDate < lastMonth || clientDate.getMonth() !== lastMonth.getMonth()) {
            return false
          }
        } else if (dateRangeFilter === "thisYear") {
          if (clientDate.getFullYear() !== now.getFullYear()) {
            return false
          }
        }
      }

      return true
    })
  }, [clients, searchQuery, statusFilter, segmentFilter, locationFilter, dateRangeFilter])

  const handleCreate = () => {
    setEditingClient(null)
    setIsFormOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setIsFormOpen(true)
  }

  const handleView = (client: Client) => {
    setSelectedClient(client)
    setIsDetailOpen(true)
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) {
      return
    }
    // Delete logic would go here
    await loadData()
  }

  const handleBulkAction = async (action: "export" | "notify" | "updateStatus") => {
    if (selectedClients.size === 0) {
      alert("Please select clients first")
      return
    }

    switch (action) {
      case "export":
        // Export logic
        alert(`Exporting ${selectedClients.size} clients...`)
        break
      case "notify":
        alert(`Sending notifications to ${selectedClients.size} clients...`)
        break
      case "updateStatus":
        alert(`Updating status for ${selectedClients.size} clients...`)
        break
    }
  }

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  const getStatusBadge = (status: ClientStatus) => {
    const colors: Record<ClientStatus, string> = {
      [ClientStatus.ACTIVE]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [ClientStatus.INACTIVE]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [ClientStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [ClientStatus.SUSPENDED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }


  const toggleClientSelection = (clientId: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(clientId)) {
      newSelected.delete(clientId)
    } else {
      newSelected.add(clientId)
    }
    setSelectedClients(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedClients.size === filteredClients.length) {
      setSelectedClients(new Set())
    } else {
      setSelectedClients(new Set(filteredClients.map((c) => c.id)))
    }
  }

  const columns: Column<Client>[] = [
    {
      key: "select",
      header: "Select",
      render: (client) => (
        <input
          type="checkbox"
          checked={selectedClients.has(client.id)}
          onChange={() => toggleClientSelection(client.id)}
          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
        />
      ),
    },
    {
      key: "id",
      header: "ID",
      render: (client) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">{client.id.slice(0, 8)}</div>
      ),
    },
    {
      key: "name",
      header: "Name/Company",
      render: (client) => (
        <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
      ),
    },
    {
      key: "contactInfo",
      header: "Contact",
      render: (client) => (
        <div>
          <div className="text-gray-900 dark:text-white text-sm">{client.contactInfo.email}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{client.contactInfo.phone}</div>
        </div>
      ),
    },
    {
      key: "primaryAddress",
      header: "Address",
      render: (client) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {client.primaryAddress.city}, {client.primaryAddress.state}
        </div>
      ),
    },
    {
      key: "serviceType",
      header: "Service Type",
      render: (client) => {
        // Determine service type from job count and segment
        if (client.jobIds.length === 0) {
          return <span className="text-sm text-gray-500 dark:text-gray-400">No services</span>
        }
        const serviceTypes = []
        if (client.segment === ClientSegment.VIP) serviceTypes.push("VIP")
        if (client.jobIds.length > 5) serviceTypes.push("Multiple")
        else if (client.jobIds.length > 0) serviceTypes.push("Regular")
        return (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {serviceTypes.join(", ") || `${client.jobIds.length} job(s)`}
          </div>
        )
      },
    },
    {
      key: "lastServiceDate",
      header: "Last Service",
      render: (client) => (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {formatDate(client.lastServiceDate)}
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (client) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(client.totalSpent)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (client) => getStatusBadge(client.status),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading client directory..." />
  }

  return (
    <>
      <div className="space-y-6">
        {/* Analytics Section */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <ClientAnalytics clients={clients} jobs={allJobs} payments={allPayments} />
          </motion.div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Clients"
            value={quickStats.totalClients.toString()}
            icon={UserGroupIcon}
            color="primary"
          />
          <StatsCard
            title="Active This Month"
            value={quickStats.activeThisMonth.toString()}
            icon={CalendarIcon}
            color="green"
            change="New clients this month"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency({ amount: quickStats.monthlyRevenue, currency: "USD" })}
            icon={CurrencyDollarIcon}
            color="earth"
          />
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showFilters
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-700 dark:text-green-400"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <FunnelIcon className="w-5 h-5 inline mr-2" />
              Filters
            </button>

            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                showAnalytics
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <ChartBarIcon className="w-5 h-5 inline mr-2" />
              Analytics
            </button>

            {/* Add Client */}
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Client
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ClientStatus | "all")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value={ClientStatus.ACTIVE}>Active</option>
                  <option value={ClientStatus.INACTIVE}>Inactive</option>
                  <option value={ClientStatus.PENDING}>Pending</option>
                  <option value={ClientStatus.SUSPENDED}>Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Segment
                </label>
                <select
                  value={segmentFilter}
                  onChange={(e) => setSegmentFilter(e.target.value as ClientSegment | "all")}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Segments</option>
                  <option value={ClientSegment.VIP}>VIP</option>
                  <option value={ClientSegment.REGULAR}>Regular</option>
                  <option value={ClientSegment.NEW}>New</option>
                  <option value={ClientSegment.AT_RISK}>At Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Locations</option>
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date Range
                </label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="thisYear">This Year</option>
                </select>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedClients.size > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <span className="text-sm font-medium text-green-900 dark:text-green-400">
              {selectedClients.size} client(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleBulkAction("export")}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="w-4 h-4 sm:inline mr-1" />
                <span className="hidden sm:inline">Export</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button
                onClick={() => handleBulkAction("notify")}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center"
              >
                <EnvelopeIcon className="w-4 h-4 sm:inline mr-1" />
                <span className="hidden sm:inline">Notify</span>
                <span className="sm:hidden">Notify</span>
              </button>
              <button
                onClick={() => handleBulkAction("updateStatus")}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center justify-center"
              >
                <span className="hidden sm:inline">Update Status</span>
                <span className="sm:hidden">Status</span>
              </button>
              <button
                onClick={() => setSelectedClients(new Set())}
                className="flex-1 sm:flex-initial px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Client Table */}
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No clients found"
            message={searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first client to get started."}
          />
        ) : (
          <div className="card overflow-hidden">
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedClients.size === filteredClients.length && filteredClients.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({selectedClients.size} selected)
                </span>
              </label>
            </div>
            <DataTable
              data={filteredClients}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              keyExtractor={(client) => client.id}
              emptyMessage="No clients match your filters"
            />
          </div>
        )}
      </div>

      {/* Form Modal */}
      <ClientForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingClient(null)
        }}
        onSuccess={async () => {
          setIsFormOpen(false)
          setEditingClient(null)
          await loadData()
        }}
        client={editingClient}
      />

      {/* Profile Modal */}
      {selectedClient && (
        <ClientProfile
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false)
            setSelectedClient(null)
          }}
          client={selectedClient}
        />
      )}
    </>
  )
}

export default ClientDirectory
