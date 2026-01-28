/**
 * Client Analytics Component
 * 
 * Analytics and reporting for client insights
 */

"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  ChartBarIcon,
  TrendingUpIcon,
  MapPinIcon,
  HeartIcon,
} from "@heroicons/react/24/outline"
import type { Client } from "@/src/domain/entities"
import type { Job } from "@/src/domain/entities"
import type { Payment } from "@/src/domain/entities"
import { ClientStatus, JobStatus, PaymentStatus } from "@/src/domain/entities"
import { formatCurrency } from "./utils"

interface ClientAnalyticsProps {
  clients: Client[]
  jobs: Job[]
  payments: Payment[]
}

const ClientAnalytics = ({ clients, jobs, payments }: ClientAnalyticsProps) => {
  // Client Retention Metrics
  const retentionMetrics = useMemo(() => {
    const activeClients = clients.filter((c) => c.status === ClientStatus.ACTIVE).length
    const totalClients = clients.length
    const retentionRate = totalClients > 0 ? (activeClients / totalClients) * 100 : 0
    
    // Calculate repeat client rate (clients with more than 1 job)
    const clientsWithMultipleJobs = clients.filter((c) => {
      const clientJobs = jobs.filter((j) => j.clientId === c.id)
      return clientJobs.length > 1
    }).length
    const repeatRate = totalClients > 0 ? (clientsWithMultipleJobs / totalClients) * 100 : 0
    
    return {
      retentionRate: retentionRate.toFixed(1),
      repeatRate: repeatRate.toFixed(1),
      activeClients,
      totalClients,
    }
  }, [clients, jobs])

  // Profitability Analysis
  const profitabilityData = useMemo(() => {
    return clients.map((client) => {
      const clientJobs = jobs.filter((j) => j.clientId === client.id)
      const clientPayments = payments.filter((p) => p.clientId === client.id && p.status === PaymentStatus.COMPLETED)
      
      const totalRevenue = clientPayments.reduce((sum, p) => sum + p.amount.amount, 0)
      const totalJobs = clientJobs.length
      const avgJobValue = totalJobs > 0 ? totalRevenue / totalJobs : 0
      
      return {
        clientId: client.id,
        clientName: client.name,
        totalRevenue,
        totalJobs,
        avgJobValue,
        lifetimeValue: client.lifetimeValue.amount,
      }
    }).sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10)
  }, [clients, jobs, payments])

  // Service Frequency Patterns
  const serviceFrequency = useMemo(() => {
    const frequencyMap = new Map<string, number>()
    jobs.forEach((job) => {
      const clientId = job.clientId
      frequencyMap.set(clientId, (frequencyMap.get(clientId) || 0) + 1)
    })
    
    const weekly = Array.from(frequencyMap.values()).filter((count) => count >= 4).length
    const monthly = Array.from(frequencyMap.values()).filter((count) => count >= 1 && count < 4).length
    const occasional = Array.from(frequencyMap.values()).filter((count) => count < 1).length
    
    return { weekly, monthly, occasional }
  }, [jobs])

  // Location-based distribution
  const locationDistribution = useMemo(() => {
    const locationMap = new Map<string, number>()
    clients.forEach((client) => {
      const location = `${client.primaryAddress.city}, ${client.primaryAddress.state}`
      locationMap.set(location, (locationMap.get(location) || 0) + 1)
    })
    
    return Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [clients])

  // Customer Satisfaction Trends (mock data based on job completion)
  const satisfactionTrends = useMemo(() => {
    const completedJobs = jobs.filter((j) => j.status === JobStatus.COMPLETED)
    const avgRating = completedJobs.length > 0 ? 4.7 : 0 // Mock rating
    const totalRatings = completedJobs.length
    
    return {
      avgRating: avgRating.toFixed(1),
      totalRatings,
      trend: "+5.2%", // Mock trend
    }
  }, [jobs])

  return (
    <div className="space-y-6">
      {/* Retention Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Client Retention
            </h3>
            <HeartIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {retentionMetrics.retentionRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${retentionMetrics.retentionRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">Repeat Client Rate</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {retentionMetrics.repeatRate}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${retentionMetrics.repeatRate}%` }}
                />
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {retentionMetrics.activeClients} active out of {retentionMetrics.totalClients} total clients
              </div>
            </div>
          </div>
        </motion.div>

        {/* Service Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Service Frequency
            </h3>
            <ChartBarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Weekly Services</span>
              <span className="font-semibold text-gray-900 dark:text-white">{serviceFrequency.weekly}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Monthly Services</span>
              <span className="font-semibold text-gray-900 dark:text-white">{serviceFrequency.monthly}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">Occasional</span>
              <span className="font-semibold text-gray-900 dark:text-white">{serviceFrequency.occasional}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Profitability Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Clients by Revenue
          </h3>
          <TrendingUpIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-400">Client</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Revenue</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Jobs</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-400">Avg/Job</th>
              </tr>
            </thead>
            <tbody>
              {profitabilityData.map((data, idx) => (
                <tr key={data.clientId} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 text-gray-900 dark:text-white">{data.clientName}</td>
                  <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                    {formatCurrency({ amount: data.totalRevenue, currency: "USD" })}
                  </td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">{data.totalJobs}</td>
                  <td className="py-2 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency({ amount: data.avgJobValue, currency: "USD" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Location Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Top Service Locations
          </h3>
          <MapPinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-2">
          {locationDistribution.map((loc, idx) => {
            const maxCount = locationDistribution[0]?.count || 1
            const percentage = (loc.count / maxCount) * 100
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-32 text-sm text-gray-700 dark:text-gray-300">
                  {loc.location}
                </div>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-gray-700 dark:text-gray-300">
                    {loc.count} clients
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Satisfaction Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Customer Satisfaction
          </h3>
          <div className="flex items-center space-x-1">
            <span className="text-2xl font-bold text-yellow-500">★</span>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              {satisfactionTrends.avgRating}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Based on {satisfactionTrends.totalRatings} completed jobs
          </div>
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            {satisfactionTrends.trend} vs last month
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default ClientAnalytics
