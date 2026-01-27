/**
 * Empty State Component
 * 
 * Displays an empty state message with optional action
 */

"use client"

import { motion } from "framer-motion"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"

interface EmptyStateProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  icon?: React.ComponentType<{ className?: string }>
}

const EmptyState = ({
  title = "No items found",
  message = "Get started by creating a new item.",
  actionLabel,
  onAction,
  icon: Icon = ExclamationCircleIcon,
}: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      <div className="flex justify-center mb-4">
        <Icon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  )
}

export default EmptyState
