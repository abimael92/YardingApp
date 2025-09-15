// app/components/NotificationToast.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface NotificationToastProps {
  notification: Notification
  onClose: (id: string) => void
}

export default function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const typeIcons = {
    success: 'ri-checkbox-circle-fill text-green-500',
    error: 'ri-error-warning-fill text-red-500',
    warning: 'ri-alert-fill text-yellow-500',
    info: 'ri-information-fill text-blue-500'
  }

  const typeColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className={`p-4 rounded-lg border ${typeColors[notification.type]} shadow-lg max-w-sm mb-2`}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className={`text-lg ${typeIcons[notification.type]}`}></span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {notification.title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {notification.message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={() => onClose(notification.id)}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="ri-close-line"></span>
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}