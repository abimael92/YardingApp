/**
 * Loading State Component
 * 
 * Displays a loading spinner with optional message
 */

"use client"

import { motion } from "framer-motion"

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

const LoadingState = ({ message = "Loading...", fullScreen = false }: LoadingStateProps) => {
  const containerClass = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center py-12"

  return (
    <div className={containerClass}>
      <div className="text-center">
        <motion.div
          className="inline-block"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-12 h-12 border-4 border-primary-200 dark:border-primary-800 border-t-primary-600 dark:border-t-primary-400 rounded-full"></div>
        </motion.div>
        {message && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
        )}
      </div>
    </div>
  )
}

export default LoadingState
