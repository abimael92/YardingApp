/**
 * Invoices Page — admin earthy styling
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusIcon, DocumentDuplicateIcon, BanknotesIcon, ClockIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { invoiceService } from "@/src/services/invoiceService"
import type { Invoice as InvoiceType, InvoiceStatus } from "@/src/domain/entities"
import {
  AdminPageHeader,
  AdminHeaderButton,
  AdminStatsCard,
  adminStatusBadgeClass,
} from "@/src/features/admin/ui"
import { adminStaggerContainer, adminStaggerItem } from "@/src/features/admin/ui/page-styles"

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<InvoiceType[]>([])
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

  const getStatusBadge = (status: InvoiceStatus) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${adminStatusBadgeClass(status)}`}>
      {String(status).replace("_", " ")}
    </span>
  )

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  const columns: Column<InvoiceType>[] = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (invoice) => (
        <div className="font-medium text-[#8b4513] dark:text-[#d4a574]">{invoice.invoiceNumber}</div>
      ),
    },
    {
      key: "clientId",
      header: "Client",
      render: (invoice) => <div className="text-gray-900 dark:text-white">{invoice.clientId}</div>,
    },
    {
      key: "total",
      header: "Amount",
      render: (invoice) => (
        <span className="font-medium text-[#8b4513] dark:text-[#d4a574]">{formatCurrency(invoice.total.amount)}</span>
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
      render: (invoice) => <div className="text-gray-600 dark:text-gray-300">{formatDate(invoice.dueDate)}</div>,
    },
  ]

  if (isLoading) return <LoadingState message="Loading invoices..." />

  const overdueCount = invoices.filter((inv) => inv.status === "overdue").length
  const pendingCount = invoices.filter((inv) => inv.status === "sent" || inv.status === "draft").length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Invoices"
        subtitle="Track outstanding balances, payments, and overdue accounts."
        icon={<DocumentDuplicateIcon className="w-7 h-7 text-white" />}
        actions={
          <AdminHeaderButton onClick={() => {}}>
            <PlusIcon className="w-5 h-5" />
            Create Invoice
          </AdminHeaderButton>
        }
      />

      <motion.section
        variants={adminStaggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={adminStaggerItem}>
          <AdminStatsCard
            label="Outstanding"
            value={formatCurrency(outstanding)}
            icon={<BanknotesIcon />}
            variant="orange"
          />
        </motion.div>
        <motion.div variants={adminStaggerItem}>
          <AdminStatsCard label="Total paid" value={formatCurrency(totalPaid)} icon={<DocumentDuplicateIcon />} variant="green" />
        </motion.div>
        <motion.div variants={adminStaggerItem}>
          <AdminStatsCard label="Overdue" value={overdueCount} icon={<ExclamationTriangleIcon />} variant="red" />
        </motion.div>
        <motion.div variants={adminStaggerItem}>
          <AdminStatsCard label="Pending / draft" value={pendingCount} icon={<ClockIcon />} variant="brown" />
        </motion.div>
      </motion.section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">Invoice list</h2>
        {invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            message="Create your first invoice to get started."
            actionLabel="Create invoice"
            onAction={() => {}}
          />
        ) : (
          <DataTable data={invoices} columns={columns} keyExtractor={(invoice) => invoice.id} emptyMessage="No invoices found" />
        )}
      </section>
    </div>
  )
}

export default InvoicesPage
