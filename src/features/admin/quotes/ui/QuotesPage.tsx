/**
 * Admin Quotes Page — Quote requests (auto-generated estimates).
 * Table: Client, Service, Estimated Range, Status, Created, Actions (View, Override, Send to Client).
 */

"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import DataTable, { type Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getQuoteRequests } from "@/app/actions/quoteRequest"
import QuoteRequestDetailModal, { type QuoteRequestRow } from "@/src/features/admin/quotes/components/QuoteRequestDetailModal"
import { EyeIcon, PencilIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline"

const STATUS_OPTIONS = ["pending", "reviewed", "sent"] as const

export default function QuotesPage() {
  const searchParams = useSearchParams()
  const openId = searchParams.get("open")

  const [quotes, setQuotes] = useState<QuoteRequestRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [detailQuote, setDetailQuote] = useState<QuoteRequestRow | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("")

  const loadQuotes = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getQuoteRequests()
      setQuotes(data)
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
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      sent: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"}`}>
        {status}
      </span>
    )
  }

  const formatRange = (min: bigint, max: bigint) => {
    const lo = Number(min) / 100
    const hi = Number(max) / 100
    return `$${lo.toFixed(0)} – $${hi.toFixed(0)}`
  }

  const formatDate = (d: Date) => new Date(d).toLocaleDateString()

  const columns: Column<QuoteRequestRow>[] = [
    {
      key: "client_name",
      header: "Client",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">{row.client_name}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.client_email}</div>
        </div>
      ),
    },
    {
      key: "service_name",
      header: "Service",
      render: (row) => <div className="text-gray-700 dark:text-gray-300">{row.service_name}</div>,
    },
    {
      key: "range",
      header: "Estimated range",
      render: (row) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatRange(row.approved_min_cents ?? row.min_cents, row.approved_max_cents ?? row.max_cents)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      key: "created_at",
      header: "Created",
      render: (row) => <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(row.created_at)}</div>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleView(row)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-blue-600 dark:hover:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            title="View"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleView(row)}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-amber-600 dark:hover:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-400"
            title="Edit / Override"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          {row.status !== "sent" && (
            <button
              type="button"
              onClick={() => handleView(row)}
              className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-emerald-600 dark:hover:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-emerald-400"
              title="Send to client"
            >
              <PaperAirplaneIcon className="h-4 w-4" />
            </button>
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
      <div className="flex flex-wrap items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {quotes.length === 0 ? (
        <EmptyState
          title="No quote requests yet"
          message="Quote requests appear here when clients use Request Job."
        />
      ) : (
        <DataTable
          data={filteredQuotes}
          columns={columns}
          keyExtractor={(row) => row.id}
          emptyMessage={statusFilter ? "No quote requests with this status." : "No quote requests."}
        />
      )}

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
