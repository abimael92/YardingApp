/**
 * Payments Page Component
 * 
 * Payment processing and management
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BanknotesIcon, CurrencyDollarIcon, ClockIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getPayments } from "@/src/services/paymentService"
import type { Payment } from "@/src/domain/entities"
import { PaymentStatus } from "@/src/domain/entities"

const PaymentsPage = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const paymentsData = await getPayments()
        setPayments(paymentsData)
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusBadge = (status: PaymentStatus) => {
    const colors: Record<PaymentStatus, string> = {
      [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [PaymentStatus.FAILED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [PaymentStatus.PARTIALLY_REFUNDED]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status}
      </span>
    )
  }

  const formatCurrency = (money: { amount: number; currency: string }) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: money.currency,
    }).format(money.amount)
  }

  const formatDate = (date?: string) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString()
  }

  const columns: Column<Payment>[] = [
    {
      key: "paymentNumber",
      header: "Payment #",
      render: (payment) => (
        <div className="font-medium text-gray-900 dark:text-white">{payment.paymentNumber}</div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (payment) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(payment.amount)}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (payment) => (
        <span className="text-gray-600 dark:text-gray-300 capitalize">
          {payment.method.replace("_", " ")}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => getStatusBadge(payment.status),
    },
    {
      key: "completedAt",
      header: "Date",
      render: (payment) => (
        <div className="text-gray-600 dark:text-gray-300">
          {formatDate(payment.completedAt || payment.createdAt)}
        </div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading payments..." />
  }

  const totalPaid = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount.amount, 0)

  const pendingAmount = payments
    .filter((p) => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount.amount, 0)

  const outstandingBalance = payments
    .filter((p) => p.status === PaymentStatus.PENDING || p.status === PaymentStatus.PROCESSING)
    .reduce((sum, p) => sum + p.amount.amount, 0)

  return (
    <div className="space-y-6">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency({ amount: totalPaid, currency: "USD" })}
              </p>
            </div>
            <CurrencyDollarIcon className="w-10 h-10 text-green-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency({ amount: outstandingBalance, currency: "USD" })}
              </p>
            </div>
            <ClockIcon className="w-10 h-10 text-yellow-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {payments.length}
              </p>
            </div>
            <BanknotesIcon className="w-10 h-10 text-primary-500" />
          </div>
        </motion.div>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <EmptyState
          title="No payments yet"
          message="Payment history will appear here once payments are processed."
        />
      ) : (
        <DataTable
          data={payments}
          columns={columns}
          keyExtractor={(payment) => payment.id}
          emptyMessage="No payments found"
        />
      )}
    </div>
  )
}

export default PaymentsPage
