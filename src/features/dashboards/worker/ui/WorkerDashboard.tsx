"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ClipboardDocumentListIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import TaskCard from "@/src/shared/ui/TaskCard"
import StatsCard from "@/src/shared/ui/StatsCard"
import { getTasks } from "@/src/services/taskService"
import type { SVGProps } from "react"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

type HeroIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, "ref"> & {
    title?: string | undefined
    titleId?: string | undefined
  } & RefAttributes<SVGSVGElement>
>

interface StatItem {
  title: string
  value: string
  icon: HeroIcon
  color: "primary" | "green" | "earth" | "sand" | "blue" | "red"
  change: string
}

const WorkerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Filter tasks for worker view
  const myTasks = getTasks().filter(
    (task) => task.assignedTo === "Mike Rodriguez"
  )
  const todayTasks = myTasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate === today || task.status === "in-progress"
  })

  const stats: StatItem[] = [
    {
      title: "Today's Tasks",
      value: todayTasks.length.toString(),
      icon: ClipboardDocumentListIcon,
      color: "primary",
      change: "+2 from yesterday",
    },
    {
      title: "Completed This Week",
      value: "12",
      icon: CheckCircleIcon,
      color: "green",
      change: "+3 from last week",
    },
    {
      title: "Hours Logged",
      value: "34.5",
      icon: ClockIcon,
      color: "earth",
      change: "This week",
    },
    {
      title: "Efficiency Rating",
      value: "94%",
      icon: ExclamationTriangleIcon,
      color: "sand",
      change: "+2% from last month",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="worker" />

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Worker Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, Mike Rodriguez
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Current Status
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Available
                  </span>
                </div>
              </div>
              <img
                src="/professional-lawn-worker.jpg"
                alt="Mike Rodriguez"
                className="w-10 h-10 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Breadcrumbs />

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StatsCard {...stat} />
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Tasks */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Today's Tasks
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {todayTasks.length} tasks scheduled
                  </span>
                </div>
                <div className="space-y-4">
                  {todayTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <TaskCard task={task} showActions={true} />
                    </motion.div>
                  ))}
                  {todayTasks.length === 0 && (
                    <div className="text-center py-8">
                      <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No tasks scheduled for today
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full btn-primary text-left flex items-center space-x-3"
                  >
                    <ClockIcon className="w-5 h-5" />
                    <span>Clock In/Out</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-earth-500 hover:bg-earth-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3"
                  >
                    <MapPinIcon className="w-5 h-5" />
                    <span>View Route</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-sand-500 hover:bg-sand-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-3"
                  >
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Report Issue</span>
                  </motion.button>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Completed lawn maintenance
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Johnson Residence - 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Started landscape installation
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Smith Property - 4 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        Clocked in for shift
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        6 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Weather Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="card p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Today's Weather
                </h3>
                <div className="text-center">
                  <div className="text-3xl mb-2">☀️</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    78°F
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Sunny, Perfect for outdoor work
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Humidity</div>
                      <div className="font-medium text-gray-900 dark:text-white">45%</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Wind</div>
                      <div className="font-medium text-gray-900 dark:text-white">8 mph</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkerDashboard
