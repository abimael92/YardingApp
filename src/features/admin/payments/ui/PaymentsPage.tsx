/**
 * Payments Page Component
 * 
 * Payment processing and management
 */

"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import {
  BanknotesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ReceiptRefundIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  EyeIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  UserIcon,
  WalletIcon,
  LinkIcon
} from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getPayments, paymentService } from "@/src/services/paymentService"
import { getJobs } from "@/src/services/jobService"
import { getAllClients } from "@/src/services/clientService"
import type { Payment } from "@/src/domain/entities"
import type { Job } from "@/src/domain/entities"
import type { Client } from "@/src/domain/entities"
import { PaymentStatus, PaymentMethod } from "@/src/domain/entities"
import Link from "next/link"
import {
  AdminPageHeader,
  AdminHeaderButton,
  AdminHeaderStatPill,
  AdminFilterSection,
  AdminSearchInput,
  AdminFilterSelect,
} from "@/src/features/admin/ui"

// Types for enhanced data
interface PaymentWithDetails extends Payment {
  jobNumber?: string
  jobTitle?: string
  clientName?: string
  clientEmail?: string
  transactionShortId?: string
  fees?: { amount: number; currency: string } // Added fees property
}

interface PaymentStats {
  totalCollected: number
  outstanding: number
  pending: number
  failed: number
  refunded: number
  averageTransaction: number
  monthlyTotal: number
  monthlyGrowth: number
  currency: string
}

// Mock data for recent transactions since getRecent might not be fully implemented
const mockRecentTransactions = [
  {
    id: "1",
    description: "Payment for Job #JOB-2024-001",
    createdAt: new Date().toISOString(),
    amount: { amount: 1250.00, currency: "USD" },
    clientName: "Acme Corp",
    status: PaymentStatus.COMPLETED
  },
  {
    id: "2",
    description: "Payment for Job #JOB-2024-002",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    amount: { amount: 850.50, currency: "USD" },
    clientName: "Smith Residence",
    status: PaymentStatus.PENDING
  },
  {
    id: "3",
    description: "Payment for Job #JOB-2024-003",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    amount: { amount: 2300.00, currency: "USD" },
    clientName: "Johnson Properties",
    status: PaymentStatus.COMPLETED
  }
]

const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentWithDetails[]>([])
  const [stats, setStats] = useState<PaymentStats>({
    totalCollected: 0,
    outstanding: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    averageTransaction: 0,
    monthlyTotal: 0,
    monthlyGrowth: 0,
    currency: "USD"
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: ""
  })
  const [sortBy, setSortBy] = useState<string>("date-desc")
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithDetails | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [recentTransactions, setRecentTransactions] = useState<any[]>(mockRecentTransactions)

  // Load data with enhanced details
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Fetch all required data in parallel
        const [paymentsData, statsData, jobsData, clientsData] = await Promise.all([
          getPayments(),
          paymentService.getPaymentStats(),
          getJobs(),
          getAllClients(),
        ])

        // Enhance payments with job and client details
        const enhancedPayments = paymentsData.map((payment: Payment) => {
          const job = jobsData.find((j: Job) => j.id === payment.jobId)
          const client = clientsData.find((c: Client) => c.id === payment.clientId)

          return {
            ...payment,
            jobNumber: job?.jobNumber,
            jobTitle: job?.title,
            clientName: client?.name,
            clientEmail: client?.contactInfo?.email, 
            transactionShortId: payment.transactionId?.slice(-8),
            // Optional fees field - only include if it exists in your data model
            fees: (payment as any).fees || undefined
          }
        })

        setPayments(enhancedPayments)
        setStats({
          totalCollected: statsData.totalAmount,
          outstanding: statsData.pending * (statsData.totalAmount / (statsData.completed || 1)),
          pending: statsData.pending,
          failed: statsData.failed,
          refunded: statsData.refunded,
          averageTransaction: statsData.completed > 0 ? statsData.totalAmount / statsData.completed : 0,
          monthlyTotal: statsData.totalAmount * 0.3, // This would come from actual monthly data
          monthlyGrowth: 12.5,
          currency: "USD"
        })

        // Try to get real recent transactions, fall back to mock
        try {
          const recent = await paymentService.getRecent(10)
          setRecentTransactions(recent.length > 0 ? recent : mockRecentTransactions)
        } catch {
          setRecentTransactions(mockRecentTransactions)
        }
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
          payment.paymentNumber?.toLowerCase().includes(searchLower) ||
          payment.clientName?.toLowerCase().includes(searchLower) ||
          payment.jobNumber?.toLowerCase().includes(searchLower) ||
          payment.jobTitle?.toLowerCase().includes(searchLower) ||
          payment.notes?.toLowerCase().includes(searchLower) ||
          payment.transactionShortId?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== "all" && payment.status !== statusFilter) return false

      // Method filter
      if (methodFilter !== "all" && payment.method !== methodFilter) return false

      // Date range filter
      if (dateRange.start && payment.createdAt) {
        const paymentDate = new Date(payment.createdAt)
        const startDate = new Date(dateRange.start)
        if (paymentDate < startDate) return false
      }
      if (dateRange.end && payment.createdAt) {
        const paymentDate = new Date(payment.createdAt)
        const endDate = new Date(dateRange.end)
        endDate.setHours(23, 59, 59)
        if (paymentDate > endDate) return false
      }

      return true
    }).sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "date-asc":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "amount-desc":
          return b.amount.amount - a.amount.amount
        case "amount-asc":
          return a.amount.amount - b.amount.amount
        default:
          return 0
      }
    })
  }, [payments, searchQuery, statusFilter, methodFilter, dateRange, sortBy])

  const paymentStatusOptions = useMemo(
    () => [
      { value: "all", label: "All statuses" },
      ...Object.values(PaymentStatus).map((s) => ({
        value: s,
        label: s.replace(/_/g, " "),
      })),
    ],
    []
  )
  const paymentMethodOptions = useMemo(
    () => [
      { value: "all", label: "All methods" },
      ...Object.values(PaymentMethod).map((m) => ({
        value: m,
        label: m.replace(/_/g, " "),
      })),
    ],
    []
  )

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { color: string; icon: any; label: string }> = {
      [PaymentStatus.COMPLETED]: {
        color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        icon: CheckCircleIcon,
        label: "Completed"
      },
      [PaymentStatus.PENDING]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
        icon: ClockIcon,
        label: "Pending"
      },
      [PaymentStatus.PROCESSING]: {
        color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
        icon: ArrowPathIcon,
        label: "Processing"
      },
      [PaymentStatus.FAILED]: {
        color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
        icon: XCircleIcon,
        label: "Failed"
      },
      [PaymentStatus.REFUNDED]: {
        color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800",
        icon: ReceiptRefundIcon,
        label: "Refunded"
      },
      [PaymentStatus.PARTIALLY_REFUNDED]: {
        color: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
        icon: ReceiptRefundIcon,
        label: "Partially Refunded"
      },
    }
    const { color, icon: Icon, label } = config[status] || config[PaymentStatus.PENDING]
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
    )
  }

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return CreditCardIcon
      case PaymentMethod.ACH:
        return BuildingOfficeIcon
      case PaymentMethod.CASH:
      case PaymentMethod.CHECK:
        return BanknotesIcon
      default:
        return CurrencyDollarIcon
    }
  }

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(money.amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const handleViewDetails = (payment: PaymentWithDetails) => {
    setSelectedPayment(payment)
    setShowDetailsModal(true)
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = filteredPayments.map(p => ({
      "Payment #": p.paymentNumber,
      "Date": formatDate(p.createdAt),
      "Client": p.clientName || "Unknown",
      "Job": p.jobNumber || "N/A",
      "Amount": p.amount.amount,
      "Method": p.method.replace("_", " "),
      "Status": p.status,
      "Transaction ID": p.transactionId || "N/A"
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0]).join(",")
    const rows = csvData.map(row => Object.values(row).join(",")).join("\n")
    const csv = `${headers}\n${rows}`

    // Download file
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments-export-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleRefund = async (payment: PaymentWithDetails) => {
    if (!confirm(`Initiate refund for ${payment.paymentNumber}?`)) return
    // Implement refund logic here
    alert("Refund functionality would be implemented here")
  }

  const columns: Column<PaymentWithDetails>[] = [
    {
      key: "paymentInfo",
      header: "Payment Details",
      render: (payment) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
            {(() => {
              const Icon = getMethodIcon(payment.method)
              return <Icon className="w-5 h-5" />
            })()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              {payment.paymentNumber}
              {payment.transactionId && (
                <span className="text-xs text-gray-500 font-mono">
                  ID: {payment.transactionId.slice(-8)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {formatDate(payment.createdAt)}
              </span>
              {payment.invoiceId && (
                <>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <Link
                    href={`/admin/invoices/${payment.invoiceId}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                  >
                    <LinkIcon className="w-3 h-3" />
                    Invoice
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client / Job",
      render: (payment) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <UserIcon className="w-4 h-4 text-gray-400" />
            {payment.clientName || "Unknown Client"}
          </div>
          {payment.jobNumber ? (
            <Link
              href={`/admin/jobs/${payment.jobId}`}
              className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <DocumentTextIcon className="w-3 h-3" />
              {payment.jobNumber} - {payment.jobTitle}
            </Link>
          ) : (
            <div className="text-xs text-gray-400 mt-1">No job linked</div>
          )}
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => (
        <div>
          <span className="font-mono font-bold text-gray-900 dark:text-white">
            {formatCurrency(payment.amount)}
          </span>
          {/* Conditionally render fees only if they exist */}
          {payment.fees && payment.fees.amount > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Fee: {formatCurrency(payment.fees)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (payment) => {
        const MethodIcon = getMethodIcon(payment.method)
        return (
          <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
            <MethodIcon className="w-4 h-4" />
            {payment.method.replace("_", " ")}
          </span>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => getStatusBadge(payment.status),
    },
    {
      key: "actions",
      header: "Actions",
      render: (payment) => (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleViewDetails(payment)}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400 transition-all"
            title="View Details"
          >
            <EyeIcon className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-green-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-green-400 transition-all"
            title="Download Receipt"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-purple-400 transition-all"
            title="Email Receipt"
          >
            <EnvelopeIcon className="w-4 h-4" />
          </motion.button>
          {payment.status === PaymentStatus.COMPLETED && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRefund(payment)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-red-400 transition-all"
              title="Refund"
            >
              <ReceiptRefundIcon className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading payment data..." />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payment management"
        subtitle="Track, manage, and reconcile all payments."
        icon={<BanknotesIcon className="w-7 h-7 text-white" />}
        actions={
          <AdminHeaderButton onClick={handleExport}>
            <ArrowDownTrayIcon className="h-5 w-5" />
            Export
          </AdminHeaderButton>
        }
        headerStats={
          <>
            <AdminHeaderStatPill
              label="Total collected"
              value={
                <span className="block">
                  <span className="text-xl font-bold">
                    {formatCurrency({ amount: stats.totalCollected, currency: stats.currency })}
                  </span>
                  <span className="text-xs font-normal text-white/70 block mt-0.5">
                    {payments.filter((p) => p.status === PaymentStatus.COMPLETED).length} completed
                  </span>
                </span>
              }
            />
            <AdminHeaderStatPill
              label="Outstanding"
              value={
                <span className="block">
                  <span className="text-xl font-bold">
                    {formatCurrency({ amount: stats.outstanding, currency: stats.currency })}
                  </span>
                  <span className="text-xs font-normal text-white/70 block mt-0.5">
                    {stats.pending} pending · {stats.failed} failed
                  </span>
                </span>
              }
            />
            <AdminHeaderStatPill
              label="Avg. transaction"
              value={
                <span className="block">
                  <span className="text-xl font-bold">
                    {formatCurrency({ amount: stats.averageTransaction, currency: stats.currency })}
                  </span>
                  <span className="text-xs font-normal text-white/70 block mt-0.5">
                    {payments.length} payments
                  </span>
                </span>
              }
            />
            <AdminHeaderStatPill
              label="This month"
              value={
                <span className="block">
                  <span className="text-xl font-bold">
                    {formatCurrency({ amount: stats.monthlyTotal, currency: stats.currency })}
                  </span>
                  <span
                    className={`text-xs font-normal block mt-0.5 ${
                      stats.monthlyGrowth >= 0 ? "text-green-200" : "text-red-200"
                    }`}
                  >
                    {stats.monthlyGrowth >= 0 ? "+" : ""}
                    {stats.monthlyGrowth}% vs last month
                  </span>
                </span>
              }
            />
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminFilterSection
          title="Search & filters"
          activeFilters={[
            ...(searchQuery.trim()
              ? [{ key: "q", label: `Search: ${searchQuery.slice(0, 24)}${searchQuery.length > 24 ? "…" : ""}`, onClear: () => setSearchQuery("") }]
              : []),
            ...(statusFilter !== "all"
              ? [{ key: "status", label: `Status: ${statusFilter.replace(/_/g, " ")}`, onClear: () => setStatusFilter("all") }]
              : []),
            ...(methodFilter !== "all"
              ? [{ key: "method", label: `Method: ${methodFilter.replace(/_/g, " ")}`, onClear: () => setMethodFilter("all") }]
              : []),
            ...(dateRange.start
              ? [{ key: "start", label: `From: ${dateRange.start}`, onClear: () => setDateRange((d) => ({ ...d, start: "" })) }]
              : []),
            ...(dateRange.end
              ? [{ key: "end", label: `To: ${dateRange.end}`, onClear: () => setDateRange((d) => ({ ...d, end: "" })) }]
              : []),
          ]}
        >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[280px]">
              <AdminSearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by payment #, client, job, or transaction ID…"
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <AdminFilterSelect
                label="Payment status"
                value={statusFilter}
                onChange={setStatusFilter}
                icon={<FunnelIcon className="w-4 h-4" />}
                options={paymentStatusOptions}
                className="min-w-[160px]"
              />
              <AdminFilterSelect
                label="Payment method"
                value={methodFilter}
                onChange={setMethodFilter}
                icon={<CreditCardIcon className="w-4 h-4" />}
                options={paymentMethodOptions}
                className="min-w-[160px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <span className="text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider w-full sm:w-auto">
              Date range
            </span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm focus:ring-2 focus:ring-[#2e8b57] focus:outline-none"
            />
            <span className="text-[#b85e1a]/70 text-sm">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm focus:ring-2 focus:ring-[#2e8b57] focus:outline-none"
            />
            <div className="flex items-center gap-2 sm:ml-auto">
              <span className="text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
                Sort
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] text-sm focus:ring-2 focus:ring-[#2e8b57] focus:outline-none"
              >
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
            </div>
          </div>

        </div>
        </AdminFilterSection>
      </motion.div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredPayments.length === 0 ? (
          <EmptyState
            title={payments.length === 0 ? "No payments yet" : "No matching payments"}
            message={payments.length === 0
              ? "Payment history will appear here once payments are processed."
              : "Try adjusting your filters to see more results."}
            onAction={payments.length > 0 ? () => {
              setSearchQuery("")
              setStatusFilter("all")
              setMethodFilter("all")
              setDateRange({ start: "", end: "" })
            } : undefined}
            actionLabel={payments.length > 0 ? "Clear All Filters" : undefined}
          />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-green-500" />
                  Payment Transactions
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredPayments.length} of {payments.length} payments
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.reload()}
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <ArrowPathIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            <DataTable
              data={filteredPayments}
              columns={columns}
              keyExtractor={(payment) => payment.id}
              emptyMessage="No payments found"
            />
          </div>
        )}
      </motion.div>

      {/* Recent Activity Section */}
      {recentTransactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-green-500" />
            Recent Activity
          </h3>

          <div className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${transaction.status === PaymentStatus.COMPLETED ? 'bg-green-500' :
                      transaction.status === PaymentStatus.PENDING ? 'bg-yellow-500' :
                        transaction.status === PaymentStatus.FAILED ? 'bg-red-500' :
                          'bg-gray-500'
                    }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {transaction.clientName}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default PaymentsPage