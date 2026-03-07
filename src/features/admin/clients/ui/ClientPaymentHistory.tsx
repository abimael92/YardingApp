/**
 * Client Payment History Component
 * 
 * Displays all payments and invoices for a client
 */

"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowLeftIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline"
import { formatCurrency, formatDate } from "@/src/features/admin/utils/formatters"
import type { Client, Payment, Invoice } from "@/src/domain/entities"

interface ClientPaymentHistoryProps {
  client: Client
  payments: Payment[]
  invoices: Invoice[]
  onBack: () => void
}

const ClientPaymentHistory = ({ client, payments, invoices, onBack }: ClientPaymentHistoryProps) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<"all" | "paid" | "pending" | "overdue">("all")

  const stats = {
    totalPaid: payments
      .filter(p => p.status === "completed")
      .reduce((sum, p) => sum + p.amount.amount, 0),
    totalPending: invoices
      .filter(i => i.status === "sent" || i.status === "overdue")
      .reduce((sum, i) => sum + i.total.amount, 0),
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === "paid").length,
    overdueInvoices: invoices.filter(i => i.status === "overdue").length,
  }

  const filteredInvoices = invoices
    .filter(i => {
      if (filter === "paid") return i.status === "paid"
      if (filter === "pending") return i.status === "sent"
      if (filter === "overdue") return i.status === "overdue"
      return true
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "text-green-600 bg-green-500/10"
      case "sent": return "text-blue-600 bg-blue-500/10"
      case "overdue": return "text-red-600 bg-red-500/10"
      case "draft": return "text-gray-600 bg-gray-500/10"
      default: return "text-gray-600 bg-gray-500/10"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircleIcon className="w-4 h-4" />
      case "sent": return <ClockIcon className="w-4 h-4" />
      case "overdue": return <XCircleIcon className="w-4 h-4" />
      default: return <DocumentTextIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#d4a574]/20 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#8b4513] dark:text-[#d4a574]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            Payment History - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            View all invoices and payments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2e8b57]/10 p-4 rounded-lg border border-[#2e8b57]/30">
          <div className="text-sm text-[#2e8b57] mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-[#2e8b57]">
            {formatCurrency({ amount: stats.totalPaid, currency: "USD" })}
          </div>
        </div>
        <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500/30">
          <div className="text-sm text-yellow-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {formatCurrency({ amount: stats.totalPending, currency: "USD" })}
          </div>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <div className="text-sm text-blue-600 mb-1">Total Invoices</div>
          <div className="text-2xl font-bold text-blue-600">{stats.totalInvoices}</div>
        </div>
        <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/30">
          <div className="text-sm text-red-600 mb-1">Overdue</div>
          <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-[#2e8b57] text-white"
              : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] hover:bg-[#d4a574]/20"
          }`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setFilter("paid")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "paid"
              ? "bg-green-600 text-white"
              : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] hover:bg-[#d4a574]/20"
          }`}
        >
          Paid
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "pending"
              ? "bg-blue-600 text-white"
              : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] hover:bg-[#d4a574]/20"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter("overdue")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "overdue"
              ? "bg-red-600 text-white"
              : "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] hover:bg-[#d4a574]/20"
          }`}
        >
          Overdue
        </button>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border border-[#d4a574]/30">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto text-[#b85e1a]/40 mb-3" />
            <h3 className="text-lg font-medium text-[#8b4513] dark:text-[#d4a574]">
              No invoices found
            </h3>
            <p className="text-sm text-[#b85e1a]/70 mt-1">
              No invoices match the selected filter
            </p>
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <motion.div
              key={invoice.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#f5f1e6] dark:bg-gray-800 p-6 rounded-lg border border-[#d4a574]/30 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-[#2e8b57]" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
                      Invoice #{invoice.invoiceNumber}
                    </h3>
                    <p className="text-sm text-[#b85e1a]/70">
                      Created {formatDate(invoice.createdAt.toISOString())}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  {invoice.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-[#b85e1a]/70">Due Date</p>
                  <p className="text-[#8b4513] dark:text-[#d4a574]">
                    {formatDate(invoice.dueDate.toISOString())}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#b85e1a]/70">Subtotal</p>
                  <p className="text-[#8b4513] dark:text-[#d4a574]">
                    {formatCurrency(invoice.subtotal)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#b85e1a]/70">Tax</p>
                  <p className="text-[#8b4513] dark:text-[#d4a574]">
                    {formatCurrency(invoice.tax)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#b85e1a]/70">Total</p>
                  <p className="text-xl font-bold text-[#2e8b57]">
                    {formatCurrency(invoice.total)}
                  </p>
                </div>
              </div>

              {/* Related Payments */}
              {invoice.status === "paid" && (
                <div className="mt-4 pt-4 border-t border-[#d4a574]/30">
                  <h4 className="text-sm font-medium text-[#8b4513] mb-2">Payments</h4>
                  {payments
                    .filter(p => p.invoiceId === invoice.id)
                    .map(payment => (
                      <div key={payment.id} className="flex items-center justify-between text-sm bg-white dark:bg-gray-700 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="w-4 h-4 text-[#2e8b57]" />
                          <span className="text-[#8b4513] dark:text-[#d4a574]">
                            Paid {formatDate(payment.completedAt || payment.createdAt)}
                          </span>
                        </div>
                        <span className="font-medium text-[#2e8b57]">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[#d4a574]/30">
                <button
                  onClick={() => setSelectedInvoice(invoice)}
                  className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
                  title="View Details"
                >
                  <EyeIcon className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
                  title="Download PDF"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

export default ClientPaymentHistory