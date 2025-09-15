// app/components/WorkerCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Worker } from '../types'

interface WorkerCardProps {
  worker: Worker
  onAssign?: (workerId: number) => void
}

export default function WorkerCard({ worker, onAssign }: WorkerCardProps) {
  const statusColors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    offline: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  return (
    <motion.div 
      className="card group"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <img 
            src={worker.image} 
            alt={worker.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {worker.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {worker.role}
            </p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[worker.status]}`}>
          {worker.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {worker.tasksCompleted}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Done</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {worker.rating}/5
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
        <span className="flex items-center">
          <span className="ri-map-pin-line mr-1"></span>
          {worker.location}
        </span>
        <span className="flex items-center">
          <span className="ri-phone-line mr-1"></span>
          {worker.phone}
        </span>
      </div>

      {onAssign && (
        <button 
          onClick={() => onAssign(worker.id)}
          className="w-full btn-primary"
          disabled={worker.status !== 'available'}
        >
          {worker.status === 'available' ? 'Assign Task' : 'Not Available'}
        </button>
      )}
    </motion.div>
  )
}