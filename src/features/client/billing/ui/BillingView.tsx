/**
 * Client Billing View Component
 * 
 * Displays client's payment history and invoices
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCardIcon, CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { getPayments } from "@/src/services/paymentService"
import { getAllClients } from "@/src/services/clientService"
import { getMockRole } from "@/src/features/auth/services/mockAuth"
import type { Payment } from "@/src/domain/entities"
import { PaymentStatus, PaymentMethod } from "@/src/domain/entities"

const BillingView = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [paymentsData, clientsData] = await Promise.all([
          getPayments(),
          getAllClients(),
        ])

        // Get current user's client ID (simplified - in real app, get from auth)
        const currentRole = getMockRole()
        if (currentRole === "client") {
          const client = clientsData[0]
          if (client) {
            const clientPayments = paymentsData.filter((payment) => payment.clientId === client.id)
            setPayments(clientPayments)
          }
        }
      } catch (error) {
        console.error("Failed to load payments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

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

  const getStatusBadge = (status: PaymentStatus) => {
    const colors = {
      [PaymentStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [PaymentStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [PaymentStatus.PROCESSING]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [PaymentStatus.FAILED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    )
  }

  const getMethodIcon = (method: PaymentMethod) => {
    return <CreditCardIcon className="w-4 h-4 text-gray-400" />
  }

  const totalPaid = payments
    .filter((p) => p.status === PaymentStatus.COMPLETED)
    .reduce((sum, p) => sum + p.amount.amount, 0)

  const pendingAmount = payments
    .filter((p) => p.status === PaymentStatus.PENDING)
    .reduce((sum, p) => sum + p.amount.amount, 0)

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
        <div className="flex items-center space-x-2">
          {getMethodIcon(payment.method)}
          <span className="text-gray-600 dark:text-gray-300 capitalize">
            {payment.method.replace("_", " ")}
          </span>
        </div>
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
    return <LoadingState message="Loading billing information..." />
  }

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
            <CheckCircleIcon className="w-10 h-10 text-green-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency({ amount: pendingAmount, currency: "USD" })}
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
            <CreditCardIcon className="w-10 h-10 text-primary-500" />
          </div>
        </motion.div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Payment History
        </h2>

        {payments.length === 0 ? (
          <EmptyState
            title="No payments yet"
            message="Your payment history will appear here once you make a payment."
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
    </div>
  )
}

export default BillingView
