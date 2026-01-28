/**
 * Reports Page Component
 * 
 * Financial reporting and business analytics
 */

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { DocumentChartBarIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import LoadingState from "@/src/shared/ui/LoadingState"
import { reportsService } from "@/src/services/reportsService"
import type { ProfitLossData, AccountsReceivableAging, RevenueByService, ClientProfitability, CrewProductivity, ExpenseCategory } from "@/src/services/reportsService"

const ReportsPage = () => {
  const [profitLoss, setProfitLoss] = useState<ProfitLossData[]>([])
  const [aging, setAging] = useState<AccountsReceivableAging | null>(null)
  const [revenueByService, setRevenueByService] = useState<RevenueByService[]>([])
  const [clientProfitability, setClientProfitability] = useState<ClientProfitability[]>([])
  const [crewProductivity, setCrewProductivity] = useState<CrewProductivity[]>([])
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([])
  const [yoyComparison, setYoyComparison] = useState<{ current: number; previous: number; change: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [pl, ar, revenue, clients, crews, exp, yoy] = await Promise.all([
          reportsService.getProfitLoss(),
          reportsService.getAccountsReceivableAging(),
          reportsService.getRevenueByService(),
          reportsService.getClientProfitability(),
          reportsService.getCrewProductivity(),
          reportsService.getExpenses(),
          reportsService.getYearOverYearComparison(),
        ])
        setProfitLoss(pl)
        setAging(ar)
        setRevenueByService(revenue)
        setClientProfitability(clients)
        setCrewProductivity(crews)
        setExpenses(exp)
        setYoyComparison(yoy)
      } catch (error) {
        console.error("Failed to load reports:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  if (isLoading) {
    return <LoadingState message="Loading reports..." />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="space-y-6">

      {/* Year Over Year */}
      {yoyComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Year Over Year</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {yoyComparison.change > 0 ? "+" : ""}{yoyComparison.change}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {formatCurrency(yoyComparison.current)} vs {formatCurrency(yoyComparison.previous)}
              </p>
            </div>
            <CurrencyDollarIcon className="w-10 h-10 text-primary-500" />
          </div>
        </motion.div>
      )}

      {/* Profit & Loss */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profit & Loss Statement
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={profitLoss}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Accounts Receivable Aging */}
        {aging && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Accounts Receivable Aging
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Current</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(aging.current)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">1-30 Days</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(aging.days30)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">31-60 Days</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(aging.days60)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">61-90 Days</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(aging.days90)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Over 90 Days</span>
                <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(aging.over90)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(aging.total)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Revenue by Service */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue by Service Type
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByService}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="serviceName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Client Profitability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Client Profitability Analysis
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Client</th>
                <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Revenue</th>
                <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Costs</th>
                <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Profit</th>
                <th className="text-right py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">Margin</th>
              </tr>
            </thead>
            <tbody>
              {clientProfitability.map((client) => (
                <tr key={client.clientId} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{client.clientName}</td>
                  <td className="py-3 px-4 text-right text-gray-900 dark:text-white">{formatCurrency(client.totalRevenue)}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">{formatCurrency(client.totalCosts)}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(client.profit)}</td>
                  <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">{client.margin.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Expenses Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Expense Breakdown
        </h2>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.category} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-900 dark:text-white">{expense.category}</span>
                  <span className="text-gray-600 dark:text-gray-400">{expense.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${expense.percentage}%` }}
                  />
                </div>
              </div>
              <span className="ml-4 font-medium text-gray-900 dark:text-white min-w-[100px] text-right">
                {formatCurrency(expense.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default ReportsPage
