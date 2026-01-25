"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline"
import type { Task } from "@/src/domain/models"

interface TaskCardProps {
  task: Task
  showActions?: boolean
  isDraggable?: boolean
}

const TaskCard = ({
  task,
  showActions = false,
  isDraggable = false,
}: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500"
      case "medium":
        return "border-l-yellow-500"
      case "low":
        return "border-l-green-500"
      default:
        return "border-l-gray-300"
    }
  }

  const TaskContent = () => (
    <div
      className={`card p-4 border-l-4 ${getPriorityColor(task.priority)} ${
        isDraggable ? "cursor-move" : "cursor-pointer"
      } hover:shadow-md transition-shadow duration-200`}
      onClick={() => !isDraggable && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {task.description}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
        >
          {task.status.replace("-", " ")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
        <div className="flex items-center space-x-1">
          <MapPinIcon className="w-4 h-4" />
          <span className="truncate">{task.location}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ClockIcon className="w-4 h-4" />
          <span>{task.estimatedDuration}</span>
        </div>
        {task.assignedTo && (
          <div className="flex items-center space-x-1">
            <UserIcon className="w-4 h-4" />
            <span className="truncate">{task.assignedTo}</span>
          </div>
        )}
        <div className="flex items-center space-x-1">
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
        </div>
      </div>

      {showActions && (
        <div className="flex items-center space-x-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {task.status === "pending" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
            >
              <PlayIcon className="w-4 h-4" />
              <span>Start</span>
            </motion.button>
          )}
          {task.status === "in-progress" && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors"
              >
                <PauseIcon className="w-4 h-4" />
                <span>Pause</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <CheckCircleIcon className="w-4 h-4" />
                <span>Complete</span>
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            <span>Report Issue</span>
          </motion.button>
        </div>
      )}

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Priority:{" "}
              </span>
              <span
                className={`capitalize ${
                  task.priority === "high"
                    ? "text-red-600"
                    : task.priority === "medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                }`}
              >
                {task.priority}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Full Address:{" "}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {task.location}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-900 dark:text-white">
                Estimated Duration:{" "}
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {task.estimatedDuration}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )

  if (isDraggable) {
    return (
      <motion.div
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        whileDrag={{ scale: 1.05, rotate: 5 }}
        className="select-none"
      >
        <TaskContent />
      </motion.div>
    )
  }

  return <TaskContent />
}

export default TaskCard
