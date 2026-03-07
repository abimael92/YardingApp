/**
 * Client Directory Dashboard
 * 
 * Comprehensive client management with all features:
 * - Client List (search, filter, export)
 * - Client Profile (jobs history, invoices)
 * - Communications (message history, follow-ups)
 * - Contracts (active contracts, history)
 * - Payment History (outstanding balance, paid)
 * - Properties (multiple addresses)
 * - Preferences (contact method, marketing consent)
 * - Notes (internal notes)
 * 
 * Same visual style and functionality as EmployeeList
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
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
  BuildingOfficeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  HomeIcon,
  Cog6ToothIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BriefcaseIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import StatsCard from "@/src/shared/ui/StatsCard"
import { Modal } from "@/src/components/layout/Modal"
import { Button } from "@/src/components/layout/Button"
import { Card } from "@/src/components/layout/Card"
import { StatusBadge } from "@/src/components/layout/StatusBadge"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import { useFormPersistence } from "@/src/hooks/useFormPersistence"
import { getAllClients, getClientById, deleteClient } from "@/src/services/clientService"
import { getJobsByClient } from "@/src/services/jobService"
import { getPaymentsByClientId } from "@/src/services/paymentService"
import { getInvoicesByClientId } from "@/src/services/invoiceService"
import { getCommunicationsByClient } from "@/src/services/communicationService"
import { getContractsByClient, type ContractForUI } from "@/src/services/contractService"
import { getClientNotes, type NoteForUI } from "@/src/services/noteService"
import type { Client, Job, Payment, Invoice } from "@/src/domain/entities"
import { ClientStatus, ClientSegment, JobStatus, PaymentStatus } from "@/src/domain/entities"
import ClientForm from "./ClientForm"
import ClientProfile from "./ClientProfile"
import ClientAnalytics from "./ClientAnalytics"
import ClientCommunications from "./ClientCommunications"
import ClientContracts from "./ClientContracts"
import ClientPaymentHistory from "./ClientPaymentHistory"
import ClientProperties from "./ClientProperties"
import ClientPreferences from "./ClientPreferences"
import ClientNotes from "./ClientNotes"

type ViewMode = "list" | "profile" | "communications" | "contracts" | "payments" | "properties" | "preferences" | "notes"

interface ClientFilters {
  search: string
  status: ClientStatus | "all"
  segment: ClientSegment | "all"
  location: string
  dateRange: "all" | "thisMonth" | "lastMonth" | "thisYear"
  showArchived: boolean
}

// Memoized FilterSelect component (same style as EmployeeList)
const FilterSelect = ({ value, onChange, options, label }: {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  label: string
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full px-3 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-colors duration-150 appearance-none cursor-pointer"
    aria-label={label}
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b85e1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1.25rem',
    }}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
)

export const ClientDirectory = () => {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientJobs, setClientJobs] = useState<Job[]>([])
  const [clientPayments, setClientPayments] = useState<Payment[]>([])
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([])
  const [clientCommunications, setClientCommunications] = useState<any[]>([])
  const [clientContracts, setClientContracts] = useState<ContractForUI[]>([])
  const [clientNotes, setClientNotes] = useState<NoteForUI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Filters
  const [filters, setFilters] = useState<ClientFilters>({
    search: "",
    status: "all",
    segment: "all",
    location: "all",
    dateRange: "all",
    showArchived: false,
  })

  // Persist filters
  const { value: persistedFilters, setValue: setPersistedFilters } = useFormPersistence('client-filters', filters)

  // Load filters from persistence
  useEffect(() => {
    if (!persistedFilters) return

    setFilters(prev => {
      if (JSON.stringify(prev) === JSON.stringify(persistedFilters)) {
        return prev
      }
      return persistedFilters
    })
  }, [persistedFilters])

  // Update persisted filters
  useEffect(() => {
    setPersistedFilters(filters)
  }, [filters, setPersistedFilters])

  // Check mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load all clients
  const loadClients = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAllClients()
      setClients(data)
    } catch (error) {
      console.error("Failed to load clients:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadClients()
  }, [loadClients])

  // Load client details when selected
  useEffect(() => {
    if (!selectedClient) return

    const loadClientDetails = async () => {
      try {
        const [jobs, payments, invoices, communications, contracts, notes] = await Promise.all([
          getJobsByClient(selectedClient.id),
          getPaymentsByClientId(selectedClient.id),
          getInvoicesByClientId(selectedClient.id),
          getCommunicationsByClient(selectedClient.id),
          getContractsByClient(selectedClient.id),
          getClientNotes(selectedClient.id),
        ])
        setClientJobs(jobs)
        setClientPayments(payments)
        setClientInvoices(invoices)
        setClientCommunications(communications)
        setClientContracts(contracts)
        setClientNotes(notes)
      } catch (error) {
        console.error("Failed to load client details:", error)
      }
    }

    loadClientDetails()
  }, [selectedClient])

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const activeClients = clients.filter(c => c.status === ClientStatus.ACTIVE)
    const newThisMonth = activeClients.filter(c => new Date(c.createdAt) >= thisMonth).length

    const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent.amount, 0)
    const monthlyRevenue = clients
      .filter(c => new Date(c.lastServiceDate || '') >= thisMonth)
      .reduce((sum, c) => sum + c.totalSpent.amount, 0)

    return {
      totalClients: activeClients.length,
      newThisMonth,
      totalRevenue,
      monthlyRevenue,
      averageValue: activeClients.length ? totalRevenue / activeClients.length : 0,
    }
  }, [clients])

  // Get unique locations
  const availableLocations = useMemo(() => {
    const locations = new Set<string>()
    clients.forEach(client => {
      if (client.primaryAddress?.city && client.primaryAddress?.state) {
        locations.add(`${client.primaryAddress.city}, ${client.primaryAddress.state}`)
      }
    })
    return Array.from(locations).sort()
  }, [clients])

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search
      if (filters.search) {
        const query = filters.search.toLowerCase()
        const matchesSearch =
          client.name.toLowerCase().includes(query) ||
          client.contactInfo.email.toLowerCase().includes(query) ||
          client.contactInfo.phone.includes(query) ||
          client.primaryAddress?.city?.toLowerCase().includes(query) ||
          client.primaryAddress?.state?.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Status
      if (filters.status !== "all" && client.status !== filters.status) return false

      // Segment
      if (filters.segment !== "all" && client.segment !== filters.segment) return false

      // Location
      if (filters.location !== "all") {
        const clientLocation = `${client.primaryAddress?.city}, ${client.primaryAddress?.state}`
        if (clientLocation !== filters.location) return false
      }

      // Date range
      if (filters.dateRange !== "all") {
        const clientDate = new Date(client.createdAt)
        const now = new Date()

        if (filters.dateRange === "thisMonth") {
          if (clientDate.getMonth() !== now.getMonth() || clientDate.getFullYear() !== now.getFullYear()) {
            return false
          }
        } else if (filters.dateRange === "lastMonth") {
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
          if (clientDate < lastMonth || clientDate > lastMonthEnd) return false
        } else if (filters.dateRange === "thisYear") {
          if (clientDate.getFullYear() !== now.getFullYear()) return false
        }
      }

      // Archived
      if (!filters.showArchived && client.status === ClientStatus.INACTIVE) return false

      return true
    })
  }, [clients, filters])

  // Handlers
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
    setViewMode("profile")
  }

  const handleDelete = async (client: Client) => {
    if (!confirm(`Are you sure you want to delete ${client.name}?`)) return
    try {
      await deleteClient(client.id)
      await loadClients()
    } catch (error) {
      console.error("Failed to delete client:", error)
    }
  }

  const handleBulkAction = async (action: "export" | "notify" | "updateStatus") => {
    if (selectedClients.size === 0) {
      alert("Please select clients first")
      return
    }

    switch (action) {
      case "export":
        // Export logic
        const exportData = clients.filter(c => selectedClients.has(c.id))
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `clients-export-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        URL.revokeObjectURL(url)
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

  const getStatusBadge = (status: ClientStatus) => {
    const colors: Record<ClientStatus, string> = {
      [ClientStatus.ACTIVE]: "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c]",
      [ClientStatus.INACTIVE]: "bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d4a574]",
      [ClientStatus.PENDING]: "bg-[#d88c4a]/20 text-[#b85e1a] dark:text-[#d88c4a]",
      [ClientStatus.SUSPENDED]: "bg-red-500/20 text-red-600 dark:text-red-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const getSegmentBadge = (segment: ClientSegment) => {
    const colors: Record<ClientSegment, string> = {
      [ClientSegment.VIP]: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      [ClientSegment.REGULAR]: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
      [ClientSegment.NEW]: "bg-green-500/20 text-green-600 dark:text-green-400",
      [ClientSegment.AT_RISK]: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[segment]}`}>
        {segment}
      </span>
    )
  }

  const columns: Column<Client>[] = [
    {
      key: "select",
      header: "",
      render: (client) => (
        <input
          type="checkbox"
          checked={selectedClients.has(client.id)}
          onChange={() => {
            const newSelected = new Set(selectedClients)
            if (newSelected.has(client.id)) {
              newSelected.delete(client.id)
            } else {
              newSelected.add(client.id)
            }
            setSelectedClients(newSelected)
          }}
          className="w-4 h-4 text-[#2e8b57] rounded focus:ring-[#2e8b57]"
        />
      ),
    },
    {
      key: "name",
      header: "Client",
      render: (client) => (
        <button
          onClick={() => handleView(client)}
          className="flex items-center space-x-3 hover:opacity-80 transition-opacity group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white font-bold text-sm">
              {client.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="text-left">
            <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{client.name}</div>
            <div className="flex items-center gap-2 text-xs text-[#b85e1a]/70 dark:text-gray-400">
              {client.contactInfo.email}
            </div>
          </div>
        </button>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (client) => (
        <div>
          <div className="text-sm text-[#8b4513] dark:text-[#d4a574]">{client.contactInfo.phone}</div>
          <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">{client.primaryAddress?.city}</div>
        </div>
      ),
    },
    {
      key: "segment",
      header: "Segment",
      render: (client) => getSegmentBadge(client.segment),
    },
    {
      key: "status",
      header: "Status",
      render: (client) => getStatusBadge(client.status),
    },
    {
      key: "jobs",
      header: "Jobs",
      render: (client) => (
        <div className="text-center">
          <span className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
            {client.jobIds?.length || 0}
          </span>
        </div>
      ),
    },
    {
      key: "totalSpent",
      header: "Total Spent",
      render: (client) => (
        <span className="font-medium text-[#2e8b57] dark:text-[#4a7c5c]">
          {formatCurrency(client.totalSpent)}
        </span>
      ),
    },
    {
      key: "lastService",
      header: "Last Service",
      render: (client) => (
        <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">
          {client.lastServiceDate ? new Date(client.lastServiceDate).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (client) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(client)}
            className="p-1 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleEdit(client)}
            className="p-1 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
            title="Edit"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(client)}
            className="p-1 text-red-600 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ]

  // Mobile card view
  const ClientCard = ({ client }: { client: Client }) => (
    <Card className="p-4 space-y-3 border-[#d4a574]/30 dark:border-[#8b4513]/50">
      <div className="flex items-start justify-between">
        <button
          onClick={() => handleView(client)}
          className="flex items-center space-x-3 flex-1 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white font-bold text-lg">
            {client.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div className="text-left">
            <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{client.name}</div>
            <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">{client.contactInfo.email}</div>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(client)}
            className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-[#b85e1a]/70 dark:text-gray-400">Phone:</span>
          <span className="ml-1 text-[#8b4513] dark:text-[#d4a574]">{client.contactInfo.phone}</span>
        </div>
        <div>
          <span className="text-[#b85e1a]/70 dark:text-gray-400">Status:</span>
          <span className="ml-1">{getStatusBadge(client.status)}</span>
        </div>
        <div>
          <span className="text-[#b85e1a]/70 dark:text-gray-400">Location:</span>
          <span className="ml-1 text-[#8b4513] dark:text-[#d4a574]">{client.primaryAddress?.city}</span>
        </div>
        <div>
          <span className="text-[#b85e1a]/70 dark:text-gray-400">Spent:</span>
          <span className="ml-1 text-[#2e8b57] dark:text-[#4a7c5c]">{formatCurrency(client.totalSpent)}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2 border-t border-[#d4a574]/30">
        <button
          onClick={() => handleView(client)}
          className="px-3 py-1 text-sm bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41]"
        >
          View Profile
        </button>
      </div>
    </Card>
  )

  if (isLoading && viewMode === "list") {
    return <LoadingState message="Loading client directory..." />
  }

  // Detail Views
  if (selectedClient && viewMode !== "list") {
    switch (viewMode) {
      case "profile":
        return (
          <ClientProfile
            isOpen={true}
            onClose={() => {
              setSelectedClient(null)
              setViewMode("list")
            }}
            client={selectedClient}
          />
        )
      case "communications":
        return (
          <ClientCommunications
            client={selectedClient}
            communications={clientCommunications}
            onBack={() => setViewMode("profile")}
          />
        )
      case "contracts":
        return (
          <ClientContracts
            client={selectedClient}
            contracts={clientContracts}
            onBack={() => setViewMode("profile")}
          />
        )
      case "payments":
        return (
          <ClientPaymentHistory
            client={selectedClient}
            payments={clientPayments}
            invoices={clientInvoices}
            onBack={() => setViewMode("profile")}
          />
        )
      case "properties":
        return (
          <ClientProperties
            client={selectedClient}
            onBack={() => setViewMode("profile")}
          />
        )
      case "preferences":
        return (
          <ClientPreferences
            client={selectedClient}
            onBack={() => setViewMode("profile")}
          />
        )
      case "notes":
        return (
          <ClientNotes
            client={selectedClient}
            notes={clientNotes}
            onBack={() => setViewMode("profile")}
            onUpdate={async () => {
              const notes = await getClientNotes(selectedClient.id)
              setClientNotes(notes)
            }}
          />
        )
    }
  }

  // Main List View
  return (
    <>
      <div className="space-y-6">
        {/* Header with Tabs and Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-3xl">
              Client Directory
            </h1>
            <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
              Manage your clients and track relationships
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            {/* Analytics Toggle */}
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${showAnalytics
                  ? "bg-[#2e8b57] text-white shadow-md"
                  : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] border border-[#d4a574]/30"
                }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              Analytics
            </button>

            {/* Add Client Button */}
            <Button
              variant="primary"
              onClick={handleCreate}
              className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Clients"
            value={stats.totalClients.toString()}
            icon={UserGroupIcon}
            color="primary"
          />
          <StatsCard
            title="New This Month"
            value={stats.newThisMonth.toString()}
            icon={CalendarIcon}
            color="green"
          />
          <StatsCard
            title="Monthly Revenue"
            value={formatCurrency({ amount: stats.monthlyRevenue, currency: "USD" })}
            icon={CurrencyDollarIcon}
            color="earth"
          />
          <StatsCard
            title="Avg. Value"
            value={formatCurrency({ amount: stats.averageValue, currency: "USD" })}
            icon={ChartBarIcon}
            color="purple"
          />
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60" />
              <input
                type="text"
                placeholder="Search by name, email, phone, location..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${showFilters
                  ? "bg-[#2e8b57] text-white border-[#2e8b57]"
                  : "bg-[#f5f1e6] dark:bg-gray-800 border-[#d4a574] dark:border-[#8b4513] text-[#8b4513] dark:text-[#d4a574]"
                }`}
            >
              <FunnelIcon className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[#d4a574]/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Status
                  </label>
                  <FilterSelect
                    value={filters.status}
                    onChange={(val) => setFilters(prev => ({ ...prev, status: val as ClientStatus | "all" }))}
                    options={[
                      { value: "all", label: "All Status" },
                      { value: ClientStatus.ACTIVE, label: "Active" },
                      { value: ClientStatus.INACTIVE, label: "Inactive" },
                      { value: ClientStatus.PENDING, label: "Pending" },
                      { value: ClientStatus.SUSPENDED, label: "Suspended" },
                    ]}
                    label="Filter by status"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Segment
                  </label>
                  <FilterSelect
                    value={filters.segment}
                    onChange={(val) => setFilters(prev => ({ ...prev, segment: val as ClientSegment | "all" }))}
                    options={[
                      { value: "all", label: "All Segments" },
                      { value: ClientSegment.VIP, label: "VIP" },
                      { value: ClientSegment.REGULAR, label: "Regular" },
                      { value: ClientSegment.NEW, label: "New" },
                      { value: ClientSegment.AT_RISK, label: "At Risk" },
                    ]}
                    label="Filter by segment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Location
                  </label>
                  <FilterSelect
                    value={filters.location}
                    onChange={(val) => setFilters(prev => ({ ...prev, location: val }))}
                    options={[
                      { value: "all", label: "All Locations" },
                      ...availableLocations.map(loc => ({ value: loc, label: loc }))
                    ]}
                    label="Filter by location"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Date Range
                  </label>
                  <FilterSelect
                    value={filters.dateRange}
                    onChange={(val) => setFilters(prev => ({ ...prev, dateRange: val as typeof filters.dateRange }))}
                    options={[
                      { value: "all", label: "All Time" },
                      { value: "thisMonth", label: "This Month" },
                      { value: "lastMonth", label: "Last Month" },
                      { value: "thisYear", label: "This Year" },
                    ]}
                    label="Filter by date"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-4 flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.showArchived}
                      onChange={(e) => setFilters(prev => ({ ...prev, showArchived: e.target.checked }))}
                      className="w-4 h-4 text-[#2e8b57] rounded focus:ring-[#2e8b57]"
                    />
                    <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">
                      Show archived/inactive clients
                    </span>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bulk Actions */}
        {selectedClients.size > 0 && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg">
            <span className="text-sm font-medium text-[#2e8b57]">
              {selectedClients.size} client(s) selected
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkAction("export")}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => handleBulkAction("notify")}
                className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1"
              >
                <EnvelopeIcon className="w-4 h-4" />
                Notify
              </button>
              <button
                onClick={() => setSelectedClients(new Set())}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Client List */}
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No clients found"
            message={
              filters.search || filters.status !== "all" || filters.segment !== "all"
                ? "Try adjusting your filters"
                : "Create your first client to get started."
            }
          />
        ) : isMobile ? (
          // Mobile: Card grid
          <div className="space-y-4">
            {filteredClients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        ) : (
          // Desktop: Data table
          <div className="card overflow-hidden border-[#d4a574]/30">
            <DataTable
              data={filteredClients}
              columns={columns}
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
          await loadClients()
        }}
        client={editingClient}
      />
    </>
  )
}

export default ClientDirectory