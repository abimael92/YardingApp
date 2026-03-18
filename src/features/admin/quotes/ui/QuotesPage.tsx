/**
 * Admin Quotes Page — Quote requests (auto-generated estimates).
 * Table: Client, Service, Estimated Range, Status, Created, Actions (View, Override, Send to Client).
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import DataTable, { type Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getQuoteRequests } from "@/app/actions/quoteRequest"
import {
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PaperAirplaneIcon,
  FunnelIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import QuoteRequestDetailModal, { type QuoteRequestRow } from "@/src/features/admin/quotes/components/QuoteRequestDetailModal"
import {
  AdminPageHeader,
  AdminHeaderStatPill,
  AdminFilterSection,
} from "@/src/features/admin/ui"

const STATUS_OPTIONS = ["pending", "reviewed", "sent"] as const

// Status color mapping
const STATUS_COLORS = {
  pending: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: ClockIcon,
    gradient: "from-amber-500 to-orange-500"
  },
  reviewed: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    icon: CheckCircleIcon,
    gradient: "from-blue-500 to-indigo-500"
  },
  sent: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
    icon: PaperAirplaneIcon,
    gradient: "from-green-500 to-emerald-500"
  }
}

export default function QuotesPage() {
  const searchParams = useSearchParams()
  const openId = searchParams.get("open")

  const [quotes, setQuotes] = useState<QuoteRequestRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [detailQuote, setDetailQuote] = useState<QuoteRequestRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    sent: 0,
    totalValue: 0
  })

  const loadQuotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getQuoteRequests()
      setQuotes(data)

      // Calculate stats
      const pending = data.filter(q => q.status === "pending").length
      const reviewed = data.filter(q => q.status === "reviewed").length
      const sent = data.filter(q => q.status === "sent").length
      const totalValue = data.reduce((acc, q) => {
        const max = Number(q.approved_max_cents ?? q.max_cents) / 100
        return acc + max
      }, 0)

      setStats({
        total: data.length,
        pending,
        reviewed,
        sent,
        totalValue
      })
    } catch (e) {
      console.error("Failed to load quote requests:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadQuotes()
  }, [loadQuotes])

  useEffect(() => {
    if (openId && quotes.length > 0 && !detailOpen) {
      const q = quotes.find((r) => r.id === openId)
      if (q) {
        setDetailQuote(q)
        setDetailOpen(true)
      }
    }
  }, [openId, quotes, detailOpen])

  const handleView = useCallback((row: QuoteRequestRow) => {
    setDetailQuote(row)
    setDetailOpen(true)
  }, [])

  const filteredQuotes = useMemo(() => {
    if (!statusFilter) return quotes
    return quotes.filter((q) => q.status === statusFilter)
  }, [quotes, statusFilter])

  const getStatusBadge = (status: string) => {
    const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <Icon className="h-3.5 w-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatRange = (min: bigint, max: bigint) => {
    const lo = Number(min) / 100
    const hi = Number(max) / 100
    return `$${lo.toFixed(0)} – $${hi.toFixed(0)}`
  }

  const formatCurrency = (cents: bigint) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(cents) / 100)
  }

  const formatDate = (d: Date) => {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const columns: Column<QuoteRequestRow>[] = [
    {
      key: "client",
      header: "Client",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold text-sm shadow-lg">
            {row.client_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.client_name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.client_email}</div>
            {row.client_phone && (
              <div className="text-xs text-gray-400 dark:text-gray-500">{row.client_phone}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.service_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {row.project_type} • {row.zone}
          </div>
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {row.hours}h • {row.sqft.toLocaleString()} sqft • {row.visits} visits
          </div>
        </div>
      ),
    },
    {
      key: "range",
      header: "Estimate",
      render: (row) => {
        const min = Number(row.approved_min_cents ?? row.min_cents) / 100
        const max = Number(row.approved_max_cents ?? row.max_cents) / 100
        const isApproved = row.approved_min_cents !== null

        return (
          <div>
            <div className="font-mono font-medium text-gray-900 dark:text-white">
              ${min.toFixed(0)} – ${max.toFixed(0)}
            </div>
            {isApproved && (
              <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                <CheckCircleIcon className="h-3 w-3" />
                Approved
              </div>
            )}
            {/* Mini range bar */}
            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                style={{ width: `${(min / (max * 1.2)) * 100}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "created",
      header: "Created",
      render: (row) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">{formatDate(row.created_at)}</div>
          {row.sent_at && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Sent: {formatDate(row.sent_at)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleView(row)}
            className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all"
            title="View details"
          >
            <EyeIcon className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            type="button"
            onClick={() => handleView(row)}
            className="rounded-lg p-2 text-gray-500 hover:bg-amber-50 hover:text-amber-600 dark:text-gray-400 dark:hover:bg-amber-900/20 dark:hover:text-amber-400 transition-all"
            title="Edit / Override pricing"
          >
            <PencilIcon className="h-4 w-4" />
          </motion.button>
          {row.status !== "sent" && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => handleView(row)}
              className="rounded-lg p-2 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-400 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-all"
              title="Send to client"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading quote requests..." />
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quote management"
        subtitle="Review and manage client quote requests."
        icon={<DocumentTextIcon className="w-7 h-7 text-white" />}
        actions={
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-[#2e8b57] shadow-md hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            New quote
          </motion.button>
        }
        headerStats={
          <>
            <AdminHeaderStatPill label="Total quotes" value={stats.total} />
            <AdminHeaderStatPill label="Pending" value={stats.pending} />
            <AdminHeaderStatPill label="Reviewed" value={stats.reviewed} />
            <AdminHeaderStatPill label="Sent" value={stats.sent} />
            <AdminHeaderStatPill
              label="Total value"
              value={new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(stats.totalValue)}
            />
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <AdminFilterSection title="Filters">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === ""
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                }`}
            >
              All ({stats.total})
            </button>

            {STATUS_OPTIONS.map((status) => {
              const count = stats[status as keyof typeof stats] as number
              const config = STATUS_COLORS[status]
              const Icon = config.icon

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === status
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                      : `${config.bg} ${config.text} hover:bg-opacity-80`
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={loadQuotes}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-all"
              title="Refresh"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Active filter indicator */}
        {statusFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-4 flex items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-700"
          >
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filter:</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[statusFilter as keyof typeof STATUS_COLORS]?.bg
              } ${STATUS_COLORS[statusFilter as keyof typeof STATUS_COLORS]?.text
              }`}>
              {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
            </span>
            <button
              onClick={() => setStatusFilter("")}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Clear filter
            </button>
          </motion.div>
        )}
        </AdminFilterSection>
      </motion.div>

      {/* Quotes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {quotes.length === 0 ? (
          <EmptyState
            title="No quote requests yet"
            message="Quote requests appear here when clients use the Request Job feature."
            actionLabel="Create Manual Quote" // Add this if it expects a label
          // OR if it expects a button directly:
          // button={
          //   <button className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
          //     <PlusIcon className="h-5 w-5" />
          //     Create Manual Quote
          //   </button>
          // }
          />
        ) : filteredQuotes.length === 0 ? (
            <EmptyState
              title={`No ${statusFilter} quotes`}
              message={`There are no quotes with status "${statusFilter}". Try a different filter.`}
              onAction={() => setStatusFilter("")}
              actionLabel="Clear Filter"
            />
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4 dark:border-gray-700 dark:bg-gray-800/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-green-500" />
                  Quote Requests
                </h2>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {filteredQuotes.length} of {quotes.length}
                </span>
              </div>
            </div>

            <DataTable
              data={filteredQuotes}
              columns={columns}
              keyExtractor={(row) => row.id}
              emptyMessage="No quote requests match your filter."
            />
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <QuoteRequestDetailModal
        quote={detailQuote}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setDetailQuote(null)
        }}
        onSuccess={loadQuotes}
      />
    </div>
  )
}