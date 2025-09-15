"use client"

import { motion } from "framer-motion"
import { StarIcon, ChatBubbleLeftIcon, PhoneIcon } from "@heroicons/react/24/outline"
import type { Worker } from "../types"

interface WorkerCardProps {
  worker: Worker
  showActions?: boolean
}

const WorkerCard = ({ worker, showActions = false }: WorkerCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "busy":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "offline":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusDot = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-gray-400"
      default:
        return "bg-gray-400"
    }
  }

  return (
    <motion.div whileHover={{ y: -2 }} className="card p-4">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            src={worker.avatar || "/placeholder.svg"}
            alt={worker.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div
            className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(worker.status)} rounded-full border-2 border-white dark:border-gray-800`}
          ></div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">{worker.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(worker.status)}`}>
              {worker.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{worker.role}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span>{worker.rating}</span>
              </div>
              <div>
                <span>{worker.completedTasks} tasks</span>
              </div>
            </div>

            {showActions && (
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <PhoneIcon className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkerCard
