// app/worker/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import TaskCard from '../components/TaskCard'
import StatsChart from '../components/StatsChart'
import { Task } from '../types'

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Lawn Mowing - Johnson Residence",
    description: "Weekly lawn maintenance including mowing, edging, and trimming",
    status: "in-progress",
    priority: "medium",
    assignedTo: 1,
    clientId: 1,
    propertyId: 1,
    scheduledDate: "2024-01-15",
    estimatedDuration: 2,
    cost: 85
  },
  {
    id: 2,
    title: "Tree Pruning - Smith Property",
    description: "Prune oak trees and remove dead branches",
    status: "pending",
    priority: "high",
    assignedTo: 1,
    clientId: 2,
    propertyId: 2,
    scheduledDate: "2024-01-16",
    estimatedDuration: 4,
    cost: 320
  }
]

const weeklyStats = [
  { name: 'Mon', value: 5 },
  { name: 'Tue', value: 8 },
  { name: 'Wed', value: 6 },
  { name: 'Thu', value: 7 },
  { name: 'Fri', value: 9 },
  { name: 'Sat', value: 4 },
  { name: 'Sun', value: 0 }
]

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)

  const handleStatusChange = (taskId: number, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const completedTasks = tasks.filter(task => task.status === 'completed').length
  const totalEarnings = tasks
    .filter(task => task.status === 'completed')
    .reduce((sum, task) => sum + task.cost, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Worker Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your tasks and track your performance
        </p>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="ri-task-line text-2xl text-emerald-600"></span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {tasks.length}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Total Tasks</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="ri-checkbox-circle-line text-2xl text-green-600"></span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {completedTasks}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Completed</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card text-center"
        >
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="ri-money-dollar-circle-line text-2xl text-blue-600"></span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            ${totalEarnings}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Total Earnings</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Today&#39;s Tasks
            </h2>
            <button className="btn-primary text-sm">
              <span className="ri-add-line mr-1"></span>
              New Task
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <TaskCard 
                  task={task} 
                  onStatusChange={handleStatusChange}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <StatsChart 
            data={weeklyStats}
            title="Weekly Hours Worked"
            color="#3b82f6"
          />
        </motion.div>
      </div>
    </div>
  )
}