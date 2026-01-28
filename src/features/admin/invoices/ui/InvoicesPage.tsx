/**
 * Invoices Page Component
 * 
 * Professional invoicing management
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { invoiceService } from "@/src/services/invoiceService"
import type { Invoice } from "@/src/services/invoiceService"

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [outstanding, setOutstanding] = useState<number>(0)
  const [totalPaid, setTotalPaid] = useState<number>(0)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [invoicesData, outstandingAmount, paidAmount] = await Promise.all([
          invoiceService.getAll(),
          invoiceService.getTotalOutstanding(),
          invoiceService.getTotalPaid(),
        ])
        setInvoices(invoicesData)
        setOutstanding(outstandingAmount)
        setTotalPaid(paidAmount)
      } catch (error) {
        console.error("Failed to load invoices:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusBadge = (status: Invoice["status"]) => {
    const colors: Record<Invoice["status"], string> = {
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const columns: Column<Invoice>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (invoice) => (
        <div className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
      ),
    },
    {
      key: "clientName",
      header: "Client",
      render: (invoice) => (
        <div className="text-gray-900 dark:text-white">{invoice.clientName}</div>
      ),
    },
    {
      key: "total",
      header: "Amount",
      render: (invoice) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(invoice.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (invoice) => getStatusBadge(invoice.status),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (invoice) => (
        <div className="text-gray-600 dark:text-gray-300">{formatDate(invoice.dueDate)}</div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading invoices..." />
  }

  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length
  const pendingCount = invoices.filter((inv) => inv.status === "sent" || inv.status === "draft").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(outstanding)}
              </p>
            </div>
            <DocumentDuplicateIcon className="w-10 h-10 text-yellow-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <DocumentDuplicateIcon className="w-10 h-10 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {overdueCount}
              </p>
            </div>
            <DocumentDuplicateIcon className="w-10 h-10 text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {pendingCount}
              </p>
            </div>
            <DocumentDuplicateIcon className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>
      </div>

      {/* Invoices Table */}
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          message="Create your first invoice to get started."
        />
      ) : (
        <DataTable
          data={invoices}
          columns={columns}
          keyExtractor={(invoice) => invoice.id}
          emptyMessage="No invoices found"
        />
      )}
    </div>
  )
}

export default InvoicesPage
