/**
 * Data Table Component
 *
 * Merged shared table used across admin and feature modules.
 * Supports legacy props from previous layout DataTable and existing shared usage.
 */

"use client"

import type React from "react"
import { motion } from "framer-motion"
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline"

export interface Column<T> {
  key: keyof T | string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
  hideOnMobile?: boolean
  hideOnTablet?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  keyExtractor: (item: T) => string
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}

function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  keyExtractor,
  isLoading = false,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d4a574]/40 dark:border-[#8b4513]/40 bg-white dark:bg-gray-900 p-12 shadow-sm">
        <p className="text-center text-[#6b7280] dark:text-gray-400">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-[#d4a574]/40 dark:border-[#8b4513]/40 bg-white dark:bg-gray-900 shadow-sm ${className ?? ""}`}>
      <div className="overflow-x-auto overflow-y-visible min-w-0" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="w-full text-sm min-w-[640px] divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
          <thead>
            <tr className="bg-[#f5f1e6] dark:bg-gray-800">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`text-left py-3 px-2 sm:px-4 text-xs font-semibold uppercase tracking-wider text-[#2e8b57] dark:text-[#4a7c5c] ${
                    column.hideOnMobile ? "hidden sm:table-cell " : ""
                  }${
                    column.hideOnTablet ? "hidden md:table-cell " : ""
                  }${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {(onEdit || onDelete || onView) && (
                <th className="text-left py-3 px-2 sm:px-4 text-xs font-medium uppercase tracking-wider text-[#8b4513] dark:text-[#d4a574] whitespace-nowrap">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20">
            {data.map((item, index) => (
              <motion.tr
                key={keyExtractor(item)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`py-3 px-2 sm:px-4 max-w-[200px] sm:max-w-none truncate sm:truncate-none ${
                      column.hideOnMobile ? "hidden sm:table-cell " : ""
                    }${
                      column.hideOnTablet ? "hidden md:table-cell " : ""
                    }`}
                  >
                    {column.render
                      ? column.render(item)
                      : (item[column.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
                {(onEdit || onDelete || onView) && (
                  <td className="py-3 px-2 sm:px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                      {onView && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onView(item)}
                          className="p-1 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d88c4a] dark:hover:text-[#4a7c5c]"
                          title="View"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onEdit && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onEdit(item)}
                          className="p-1 text-[#b85e1a] hover:text-[#2e8b57] dark:text-[#d88c4a] dark:hover:text-[#4a7c5c]"
                          title="Edit"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                      {onDelete && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(item)}
                          className="p-1 text-[#b85e1a] hover:text-red-600 dark:text-[#d88c4a]"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default DataTable
export { DataTable }
