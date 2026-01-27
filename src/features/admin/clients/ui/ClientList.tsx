/**
 * Client List Component
 * 
 * Read-only list of all clients for admin view.
 * Phase 1: Display only, no mutations.
 */

"use client"

import { motion } from "framer-motion"
import { EyeIcon } from "@heroicons/react/24/outline"
import { getAllClients } from "@/src/services/clientService"
import type { Client } from "@/src/domain/models"

const ClientList = () => {
  const clients = getAllClients()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">All Clients</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {clients.length} total clients
          </p>
        </div>
        <div className="text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total Revenue: </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatCurrency(clients.reduce((sum, c) => sum + c.totalSpent, 0))}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Name
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Contact
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Address
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Total Spent
              </th>
              <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <motion.tr
                key={client.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">
                  <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-gray-600 dark:text-gray-300">{client.email}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{client.phone}</div>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  {client.address}
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(client.totalSpent)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      title="View Details"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No clients found</p>
        </div>
      )}
    </div>
  )
}

export default ClientList
