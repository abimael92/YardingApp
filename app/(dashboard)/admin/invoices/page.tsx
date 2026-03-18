"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon
} from "@heroicons/react/24/outline"
import DataTable, { type Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { mockStore, type Invoice, type InvoiceStatus } from "@/src/data/mockStore"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import Link from "next/link"
import { Card } from "@/src/components/layout/Card"
import { Button } from "@/src/components/layout/Button"
import { Input } from "@/src/components/layout/Input"
import { Skeleton } from "@/src/components/layout/Skeleton"
import { useMediaQuery } from "@/src/hooks/useMediaQuery"
import React from 'react'

// Types for enhanced data
interface InvoiceWithDetails extends Invoice {
  clientEmail?: string
  clientPhone?: string
  daysUntilDue?: number
  isOverdue: boolean
}

// Extended column type with responsive options
interface CustomColumn<T> extends Column<T> {
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

const STATUS_FILTER_OPTIONS: { value: "" | InvoiceStatus; label: string }[] = [
  { value: "", label: "All Status" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
]

// FilterSelect component matching EmployeeList
const FilterSelect = ({ value, onChange, options, label, icon }: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  label: string;
  icon?: React.ReactNode
}) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#b85e1a]/60 dark:text-[#d4a574]/60">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 ${icon ? 'pl-10' : 'pl-3'} pr-8 border border-[#d4a574] dark:border-[#8b4513] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-colors appearance-none cursor-pointer`}
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
    </div>
  )
}

// Status badge styling matching EmployeeList
const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case "paid":
      return "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c]"
    case "sent":
      return "bg-[#d88c4a]/20 text-[#b85e1a] dark:text-[#d88c4a]"
    case "overdue":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "draft":
    case "cancelled":
      return "bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d4a574]"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
  }
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"" | InvoiceStatus>("")
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1024px)')

  // Stats state
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    paidAmount: 0,
    overdueCount: 0,
    pendingCount: 0
  })

  const loadInvoices = useCallback(() => {
    console.log("[Invoices] loadInvoices: refetching from mockStore")
    const data = mockStore.getInvoices()

    // Enhance with calculated fields
    const enhanced = data.map(inv => {
      const today = new Date()
      const dueDate = new Date(inv.dueDate)
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

      return {
        ...inv,
        isOverdue: inv.status === 'sent' && daysUntilDue < 0,
        daysUntilDue
      }
    })

    setInvoices(enhanced)

    // Calculate stats
    setStats({
      totalInvoices: enhanced.length,
      totalAmount: enhanced.reduce((sum, inv) => sum + inv.total, 0),
      paidAmount: enhanced.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
      overdueCount: enhanced.filter(inv => inv.status === 'overdue' || (inv.status === 'sent' && new Date(inv.dueDate) < new Date())).length,
      pendingCount: enhanced.filter(inv => inv.status === 'sent').length
    })

    console.log("[Invoices] loadInvoices: set", data.length, "invoices")
  }, [])

  useEffect(() => {
    console.log("[Invoices] Fetching invoice data from mockStore")
    setIsLoading(true)
    loadInvoices()
    setIsLoading(false)
  }, [loadInvoices])

  // Filter and search invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          invoice.invoiceNumber?.toLowerCase().includes(searchLower) ||
          invoice.clientName?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter && invoice.status !== statusFilter) return false

      return true
    }).sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "amount-desc":
          return b.total - a.total
        case "amount-asc":
          return a.total - b.total
        default:
          return 0
      }
    })
  }, [invoices, searchQuery, statusFilter, sortBy])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const handleExpandRow = (invoice: InvoiceWithDetails) => {
    if (expandedRowId === invoice.id) {
      setExpandedRowId(null)
    } else {
      setExpandedRowId(invoice.id)
    }
  }

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdownId])

  // Define columns with CustomColumn type
  const columns: CustomColumn<InvoiceWithDetails>[] = [
    {
      key: "invoiceInfo",
      header: "Invoice",
      hideOnMobile: false,
      hideOnTablet: false,
      render: (inv) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExpandRow(inv)}
            className="p-1 rounded hover:bg-[#d4a574]/20 text-[#8b4513] dark:text-[#d4a574]"
            aria-expanded={expandedRowId === inv.id}
          >
            {expandedRowId === inv.id ? (
              <ChevronUpIcon className="w-4 h-4" />
            ) : (
              <ChevronDownIcon className="w-4 h-4" />
            )}
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white shadow-lg">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                {inv.invoiceNumber}
              </div>
              <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
                {formatDate(inv.createdAt)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      hideOnMobile: false,
      hideOnTablet: false,
      render: (inv) => (
        <div className="text-[#8b4513] dark:text-[#d4a574]">
          {inv.clientName}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      hideOnMobile: false,
      hideOnTablet: false,
      render: (inv) => (
        <span className="font-mono font-medium text-[#8b4513] dark:text-[#d4a574]">
          {formatCurrency(inv.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      hideOnMobile: false,
      hideOnTablet: false,
      render: (inv) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inv.status)}`}>
          {inv.status.toUpperCase()}
        </span>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      hideOnMobile: true,
      hideOnTablet: false,
      render: (inv) => (
        <div className="text-sm text-[#8b4513] dark:text-[#d4a574]">
          {formatDate(inv.dueDate)}
          {inv.daysUntilDue !== undefined && inv.status === 'sent' && inv.daysUntilDue < 0 && (
            <div className="text-xs text-red-500">Overdue</div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      hideOnMobile: false,
      hideOnTablet: false,
      render: (inv) => {
        const isOpen = openDropdownId === inv.id
        return (
          <div className="relative dropdown-container">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setOpenDropdownId(isOpen ? null : inv.id)}
              className="!px-2 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#4a7c5c]"
              aria-label="Actions menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg shadow-lg border border-[#d4a574] dark:border-[#8b4513] py-1 z-50">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Print
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors"
                >
                  Send Reminder
                </button>
              </div>
            )}
          </div>
        )
      },
    },
  ]

  // Mobile invoice card
  const InvoiceCard = ({ invoice }: { invoice: InvoiceWithDetails }) => {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <Card className="p-4 space-y-3 border-[#d4a574]/30 dark:border-[#8b4513]/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2e8b57] to-[#8b4513] flex items-center justify-center text-white shadow-lg shrink-0">
              <DocumentTextIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">
                {invoice.invoiceNumber}
              </div>
              <div className="text-xs text-[#b85e1a]/70 dark:text-gray-400">
                {invoice.clientName}
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="!px-2 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#4a7c5c]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg shadow-lg border border-[#d4a574] dark:border-[#8b4513] py-1 z-50">
                <button className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors">
                  View Details
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors">
                  Print
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Amount:</span>
            <span className="ml-1 font-mono text-[#2e8b57] dark:text-[#4a7c5c]">
              {formatCurrency(invoice.total)}
            </span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Status:</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
              {invoice.status}
            </span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Date:</span>
            <span className="ml-1 text-[#8b4513] dark:text-[#d4a574]">
              {formatDate(invoice.createdAt)}
            </span>
          </div>
          <div>
            <span className="text-[#b85e1a]/70 dark:text-gray-400">Due:</span>
            <span className="ml-1 text-[#8b4513] dark:text-[#d4a574]">
              {formatDate(invoice.dueDate)}
            </span>
          </div>
        </div>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    )
  }

  const statCardBase = "rounded-xl border p-5 transition-shadow hover:shadow-md flex flex-col gap-2 min-h-[100px] justify-center"

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Breadcrumbs />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574] sm:text-3xl tracking-tight">
              Invoices
            </h1>
            <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400 mt-1">
              Manage professional invoices and billing
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => { }}
            className="bg-[#2e8b57] hover:bg-[#1f6b41] text-white"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className={`${statCardBase} bg-white dark:bg-gray-800 border-[#d4a574]/30`}>
            <div className="flex items-center gap-2 text-[#b85e1a]/80 dark:text-gray-400">
              <DocumentTextIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Invoices</span>
            </div>
            <div className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">{stats.totalInvoices}</div>
          </Card>

          <Card className={`${statCardBase} bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30`}>
            <div className="flex items-center gap-2 text-[#2e8b57] dark:text-[#4a7c5c]">
              <CurrencyDollarIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Total Value</span>
            </div>
            <div className="text-2xl font-bold text-[#2e8b57] dark:text-[#4a7c5c]">{formatCurrency(stats.totalAmount)}</div>
          </Card>

          <Card className={`${statCardBase} bg-[#d88c4a]/5 dark:bg-[#d88c4a]/10 border-[#d88c4a]/30`}>
            <div className="flex items-center gap-2 text-[#b85e1a] dark:text-[#d88c4a]">
              <ClockIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Pending</span>
            </div>
            <div className="text-2xl font-bold text-[#b85e1a] dark:text-[#d88c4a]">{stats.pendingCount}</div>
          </Card>

          <Card className={`${statCardBase} bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30`}>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircleIcon className="w-5 h-5 shrink-0" />
              <span className="text-xs font-medium uppercase tracking-wide">Overdue</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdueCount}</div>
          </Card>
        </div>
      </section>

      {/* Filters Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Filters & Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-1">
            <Input
              type="search"
              placeholder="Search by invoice # or client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent rounded-lg"
              aria-label="Search invoices"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 pointer-events-none" />
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as "" | InvoiceStatus)}
            options={STATUS_FILTER_OPTIONS}
            label="Status"
            icon={<FunnelIcon className="w-4 h-4" />}
          />

          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: "date-desc", label: "Newest First" },
              { value: "date-asc", label: "Oldest First" },
              { value: "amount-desc", label: "Highest Amount" },
              { value: "amount-asc", label: "Lowest Amount" },
            ]}
            label="Sort by"
            icon={<ChevronDownIcon className="w-4 h-4" />}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={loadInvoices}
              className="w-full sm:w-auto border-[#d4a574] text-[#8b4513] dark:text-[#d4a574]"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        <AnimatePresence>
          {(searchQuery || statusFilter) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 pt-2"
            >
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm">
                  Search: {searchQuery}
                  <XMarkIcon className="w-4 h-4 cursor-pointer hover:text-blue-900" onClick={() => setSearchQuery("")} />
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm">
                  Status: {statusFilter}
                  <XMarkIcon className="w-4 h-4 cursor-pointer hover:text-green-900" onClick={() => setStatusFilter("")} />
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Content Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          Invoice List
        </h2>

        {filteredInvoices.length === 0 ? (
          <EmptyState
            title={invoices.length === 0 ? "No invoices yet" : "No matching invoices"}
            message={invoices.length === 0
              ? "Create your first invoice to get started."
              : "Try adjusting your filters to see more results."}
            onAction={invoices.length > 0 ? () => {
              setSearchQuery("")
              setStatusFilter("")
            } : undefined}
            actionLabel={invoices.length > 0 ? "Clear Filters" : "New Invoice"}
          />
        ) : isMobile ? (
          <div className="space-y-4">
            {filteredInvoices.map(invoice => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden border-[#d4a574]/30 dark:border-[#8b4513]/50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                <thead className="bg-[#f5f1e6] dark:bg-gray-800">
                  <tr>
                    {columns.filter((col: CustomColumn<InvoiceWithDetails>) => {
                      if (isTablet && col.hideOnTablet) return false
                      if (isMobile && col.hideOnMobile) return false
                      return true
                    }).map((col) => (
                      <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
                  {filteredInvoices.map((invoice) => (
                    <React.Fragment key={invoice.id}>
                      <tr className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50 transition-colors">
                        {columns.filter((col: CustomColumn<InvoiceWithDetails>) => {
                          if (isTablet && col.hideOnTablet) return false
                          if (isMobile && col.hideOnMobile) return false
                          return true
                        }).map((col) => (
                          <td key={col.key} className="px-4 py-3 text-sm">
                            {col.render?.(invoice) ?? null}
                          </td>
                        ))}
                      </tr>
                      {expandedRowId === invoice.id && (
                        <tr className="bg-[#f5f1e6]/30 dark:bg-gray-800/30">
                          <td colSpan={columns.length} className="px-4 py-3">
                            <div className="text-sm space-y-2">
                              <p><span className="font-medium text-[#8b4513] dark:text-[#d4a574]">Client:</span> {invoice.clientName}</p>
                              <p><span className="font-medium text-[#8b4513] dark:text-[#d4a574]">Due Date:</span> {formatDate(invoice.dueDate)}</p>
                              {invoice.daysUntilDue !== undefined && invoice.status === 'sent' && (
                                <p className={invoice.daysUntilDue < 0 ? 'text-red-500' : 'text-[#2e8b57]'}>
                                  {invoice.daysUntilDue < 0
                                    ? `Overdue by ${Math.abs(invoice.daysUntilDue)} days`
                                    : `Due in ${invoice.daysUntilDue} days`}
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}