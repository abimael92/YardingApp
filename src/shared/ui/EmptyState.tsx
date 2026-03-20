/**
 * Empty State Component
 *
 * Merged empty state variant supporting both legacy and current props.
 */

"use client"

import { motion } from "framer-motion"
import { ExclamationCircleIcon } from "@heroicons/react/24/outline"
import type React from "react"

interface EmptyStateProps {
  title?: string
  description?: string
  message?: string
  action?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}

const EmptyState = ({
  title = "No items found",
  description,
  message = "Get started by creating a new item.",
  action,
  actionLabel,
  onAction,
  icon: Icon = ExclamationCircleIcon,
  className,
}: EmptyStateProps) => {
  const body = description ?? message

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-4 rounded-2xl bg-white dark:bg-gray-900 border border-[#d4a574]/30 dark:border-[#8b4513]/30 ${className ?? ""}`}
    >
      <div className="flex justify-center mb-4">
        <Icon className="w-16 h-16 text-[#d88c4a] dark:text-[#d4a574]" />
      </div>
      <h3 className="text-lg font-semibold text-[#2e8b57] dark:text-[#4a7c5c] mb-2">{title}</h3>
      <p className="text-sm text-[#6b7280] dark:text-gray-400 mb-6 max-w-sm mx-auto">{body}</p>
      {action ? action : actionLabel && onAction ? (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-[#2e8b57] hover:bg-[#1f6b41] text-white text-sm font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      ) : null}
    </motion.div>
  )
}

export default EmptyState
export { EmptyState }
