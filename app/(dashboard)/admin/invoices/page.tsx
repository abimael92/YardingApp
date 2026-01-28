"use client"

import { useState, useEffect, useCallback } from "react"
import { PlusIcon, Bars3Icon } from "@heroicons/react/24/outline"
import DataTable, { type Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import CreateInvoiceModal from "./components/CreateInvoiceModal"
import { mockStore, type Invoice, type InvoiceStatus } from "@/src/data/mockStore"

export default function InvoicesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setCreateModalOpen] = useState(false)

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
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

      <div className="flex-1">
        {/* Header — same layout as jobs page */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage professional invoices and billing
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6">
          <Breadcrumbs />

          <div className="space-y-6">
            {/* List header + New Invoice button — jobs-style */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage professional invoices and billing
                </p>
              </div>
              <button
                type="button"
                onClick={handleNewInvoice}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Invoice
              </button>
            </div>

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
                data={invoices}
                columns={columns}
                keyExtractor={(inv) => inv.id}
                emptyMessage="No invoices found."
              />
            )}
          </div>
        </div>
      </div>

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={handleCreateModalClose}
        onSuccess={handleCreateModalSuccess}
      />
    </div>
  )
}
