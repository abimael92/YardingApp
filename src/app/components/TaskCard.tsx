// app/components/TaskCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Task } from '../types'

interface TaskCardProps {
  task: Task
  onStatusChange?: (taskId: number, newStatus: Task['status']) => void
  onEdit?: (task: Task) => void
}

export default function TaskCard({ task, onStatusChange, onEdit }: TaskCardProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const priorityColors = {
    low: 'text-gray-600',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600'
  }

  return (
    <motion.div 
      className="card group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {task.title}
        </h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
          {task.status.replace('-', ' ')}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between text-sm mb-4">
        <span className={`font-medium ${priorityColors[task.priority]}`}>
          Priority: {task.priority}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {task.estimatedDuration}h estimated
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span>Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}</span>
        <span>${task.cost}</span>
      </div>

      <div className="flex space-x-2">
        {onStatusChange && (
          <select 
            value={task.status}
            onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
            className="flex-1 input-field text-sm"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
        
        {onEdit && (
          <button 
            onClick={() => onEdit(task)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <span className="ri-edit-line"></span>
          </button>
        )}
      </div>
    </motion.div>
  )
}