/**
 * Quotes Page Component
 * 
 * Estimate/Proposal management
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { PlusIcon, DocumentTextIcon } from "@heroicons/react/24/outline"
import DataTable, { Column } from "@/src/shared/ui/DataTable"
import LoadingState from "@/src/shared/ui/LoadingState"
import EmptyState from "@/src/shared/ui/EmptyState"
import { quoteService } from "@/src/services/quoteService"
import type { Quote } from "@/src/domain/entities"
import { QuoteStatus } from "@/src/domain/entities"

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [conversionRate, setConversionRate] = useState<number>(0)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [quotesData, rate] = await Promise.all([
          quoteService.getAll(),
          quoteService.getConversionRate(),
        ])
        setQuotes(quotesData)
        setConversionRate(rate)
      } catch (error) {
        console.error("Failed to load quotes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const getStatusBadge = (status: QuoteStatus) => {
    const colors: Record<QuoteStatus, string> = {
      [QuoteStatus.DRAFT]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [QuoteStatus.SENT]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      [QuoteStatus.VIEWED]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      [QuoteStatus.ACCEPTED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      [QuoteStatus.REJECTED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      [QuoteStatus.EXPIRED]: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      [QuoteStatus.REVISED]: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString()
  }

  const columns: Column<Quote>[] = [
    {
      key: "quoteNumber",
      header: "Quote #",
      render: (quote) => (
        <div className="font-medium text-gray-900 dark:text-white">{quote.quoteNumber}</div>
      ),
    },
    {
      key: "totalAmount",
      header: "Amount",
      render: (quote) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(quote.total)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (quote) => getStatusBadge(quote.status),
    },
    {
      key: "validUntil",
      header: "Valid Until",
      render: (quote) => (
        <div className="text-gray-600 dark:text-gray-300">{formatDate(quote.validUntil)}</div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (quote) => (
        <div className="text-gray-600 dark:text-gray-300">{formatDate(quote.createdAt)}</div>
      ),
    },
  ]

  if (isLoading) {
    return <LoadingState message="Loading quotes..." />
  }

  const pendingQuotes = quotes.filter((q) => q.status === QuoteStatus.SENT || q.status === QuoteStatus.VIEWED).length
  const totalValue = quotes.reduce((sum, q) => sum + q.total.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" />
          Create Quote
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Quotes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {quotes.length}
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-primary-500" />
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
                {pendingQuotes}
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-yellow-500" />
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {conversionRate}%
              </p>
            </div>
            <DocumentTextIcon className="w-10 h-10 text-green-500" />
          </div>
        </motion.div>
      </div>

      {/* Quotes Table */}
      {quotes.length === 0 ? (
        <EmptyState
          title="No quotes yet"
          message="Create your first quote to get started."
        />
      ) : (
        <DataTable
          data={quotes}
          columns={columns}
          keyExtractor={(quote) => quote.id}
          emptyMessage="No quotes found"
        />
      )}
    </div>
  )
}

export default QuotesPage
