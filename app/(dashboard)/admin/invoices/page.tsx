"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { PlusIcon, Bars3Icon, FunnelIcon } from "@heroicons/react/24/outline"
import DataTable, { type Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import CreateInvoiceModal from "./components/CreateInvoiceModal"
import ViewInvoiceModal from "./components/ViewInvoiceModal"
import EditInvoiceModal from "./components/EditInvoiceModal"
import InvoicePrintPreviewModal from "./components/InvoicePrintPreviewModal"
import { mockStore, type Invoice, type InvoiceStatus } from "@/src/data/mockStore"

const STATUS_FILTER_OPTIONS: { value: "" | InvoiceStatus; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
]

export default function InvoicesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"" | InvoiceStatus>("")
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null)
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null)
  const [printPreviewInvoice, setPrintPreviewInvoice] = useState<Invoice | null>(null)

  const loadInvoices = useCallback(() => {
    console.log("[Invoices] loadInvoices: refetching from mockStore")
    const data = mockStore.getInvoices()
    setInvoices(data)
    console.log("[Invoices] loadInvoices: set", data.length, "invoices")
  }, [])

  useEffect(() => {
    console.log("[Invoices] Fetching invoice data from mockStore")
    setIsLoading(true)
    loadInvoices()
    setIsLoading(false)
  }, [loadInvoices])

  useEffect(() => {
    console.log("[Invoices] Modal state changed: isCreateModalOpen =", isCreateModalOpen)
  }, [isCreateModalOpen])

  const handleNewInvoice = () => {
    console.log("[Invoices] New Invoice button clicked")
    setCreateModalOpen(true)
    console.log("[Invoices] Modal state set to open (isCreateModalOpen=true)")
  }

  const handleCreateModalClose = () => {
    console.log("[Invoices] CreateInvoiceModal onClose")
    setCreateModalOpen(false)
  }

  const handleCreateModalSuccess = () => {
    console.log("[Invoices] CreateInvoiceModal onSuccess")
    loadInvoices()
    setCreateModalOpen(false)
  }

  const filteredInvoices = useMemo(() => {
    if (!statusFilter) return invoices
    return invoices.filter((inv) => inv.status === statusFilter)
  }, [invoices, statusFilter])

  const handleView = useCallback((inv: Invoice) => setViewInvoice(inv), [])
  const handleEdit = useCallback((inv: Invoice) => setEditInvoice(inv), [])
  const handlePrintPreview = useCallback((inv: Invoice) => setPrintPreviewInvoice(inv), [])

  const getStatusBadge = (status: InvoiceStatus) => {
    const colors: Record<InvoiceStatus, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      paid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      overdue: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    )
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (inv) => (
        <div className="font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</div>
      ),
    },
    {
      key: "clientName",
      header: "Client",
      render: (inv) => <div className="text-gray-600 dark:text-gray-300">{inv.clientName}</div>,
    },
    {
      key: "total",
      header: "Amount",
      render: (inv) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(inv.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (inv) => getStatusBadge(inv.status),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (inv) => (
        <div className="text-gray-600 dark:text-gray-300 text-sm">{formatDate(inv.dueDate)}</div>
      ),
    },
  ]

  return (
        <div className="p-4 sm:p-6">
          <Breadcrumbs />

          <div className="space-y-4 sm:space-y-6">
            {/* List header + New Invoice button — jobs-style */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">Invoices</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1">
                  Manage professional invoices and billing
                </p>
              </div>
              <button
                type="button"
                onClick={handleNewInvoice}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Invoice
              </button>
            </div>

            {/* Status filter dropdown */}
            {!isLoading && invoices.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <FunnelIcon className="w-5 h-5 shrink-0 text-gray-500 dark:text-gray-400" />
                <label htmlFor="invoice-status-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
                  Status
                </label>
                <select
                  id="invoice-status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as "" | InvoiceStatus)}
                  className="w-full min-w-0 max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {STATUS_FILTER_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {isLoading ? (
              <LoadingState message="Loading invoices..." />
            ) : invoices.length === 0 ? (
              <EmptyState
                title="No invoices yet"
                message="Create your first invoice to get started."
                actionLabel="New Invoice"
                onAction={handleNewInvoice}
              />
            ) : (
              <DataTable
                data={filteredInvoices}
                columns={columns}
                keyExtractor={(inv) => inv.id}
                emptyMessage={statusFilter ? "No invoices match this status." : "No invoices found."}
                onView={handleView}
                onEdit={handleEdit}
              />
            )}
          </div>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateModalSuccess}
      />

      <ViewInvoiceModal
        isOpen={!!viewInvoice}
        onClose={() => setViewInvoice(null)}
        invoice={viewInvoice}
        onPrintPreview={handlePrintPreview}
      />

      <EditInvoiceModal
        isOpen={!!editInvoice}
        onClose={() => setEditInvoice(null)}
        onSuccess={() => {
          loadInvoices()
          setEditInvoice(null)
        }}
        invoice={editInvoice}
      />

      <InvoicePrintPreviewModal
        isOpen={!!printPreviewInvoice}
        onClose={() => setPrintPreviewInvoice(null)}
        invoice={printPreviewInvoice}
      />
    </div>

  )
}
