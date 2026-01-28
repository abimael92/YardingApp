"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import TaskCard from "@/src/shared/ui/TaskCard"
import StatsCard from "@/src/shared/ui/StatsCard"
import WorkerCard from "@/src/shared/ui/WorkerCard"
import { getTasks } from "@/src/services/taskService"
import { getWorkers } from "@/src/services/workerService"

const SupervisorDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tasks, setTasks] = useState<any[]>([])
  const [workers, setWorkers] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tasksData, workersData] = await Promise.all([
          getTasks(),
          Promise.resolve(getWorkers()),
        ])
        setTasks(tasksData)
        setWorkers(workersData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      }
    }
    loadData()
  }, [])

  const stats = [
    {
      title: "Active Workers",
      value: workers
        .filter((w) => w.status === "available" || w.status === "busy")
        .length.toString(),
      icon: UserGroupIcon,
      color: "primary" as const,
      change: "3 available, 1 busy",
    },
    {
      title: "Tasks Today",
      value: tasks.length.toString(),
      icon: ClipboardDocumentListIcon,
      color: "earth" as const,
      change: "2 completed, 1 in progress",
    },
    {
      title: "Team Efficiency",
      value: "87%",
      icon: ChartBarIcon,
      color: "green" as const,
      change: "+5% from last week",
    },
    {
      title: "Issues Reported",
      value: "2",
      icon: ExclamationTriangleIcon,
      color: "red" as const,
      change: "1 resolved today",
    },
  ]

  // Sample data for charts
  const weeklyData = [
    { name: "Mon", completed: 12, assigned: 15 },
    { name: "Tue", completed: 19, assigned: 22 },
    { name: "Wed", completed: 8, assigned: 12 },
    { name: "Thu", completed: 15, assigned: 18 },
    { name: "Fri", completed: 22, assigned: 25 },
    { name: "Sat", completed: 18, assigned: 20 },
    { name: "Sun", completed: 6, assigned: 8 },
  ]

  const taskStatusData = [
    { name: "Completed", value: 45, color: "#22c55e" },
    { name: "In Progress", value: 25, color: "#3b82f6" },
    { name: "Pending", value: 20, color: "#f59e0b" },
    { name: "Cancelled", value: 10, color: "#ef4444" },
  ]

  const activeTasks = tasks.filter(
    (task) => task.status === "in-progress" || task.status === "pending"
  )

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        userRole="supervisor"
      />

      <div className="flex-1">
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
                  Supervisor Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Team Overview & Management
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Team Status
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    All Systems Operational
                  </span>
                </div>
              </div>
              <img
                src="/female-landscape-designer.jpg"
                alt="Supervisor"
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

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Weekly Performance Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Weekly Performance
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="name" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-background)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#22c55e"
                        name="Completed"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="assigned"
                        fill="#3b82f6"
                        name="Assigned"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Task Status Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Task Distribution
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {taskStatusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Team Members
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getWorkers().length} workers
                </span>
              </div>
              <div className="space-y-4">
                {getWorkers().map((worker, index) => (
                  <motion.div
                    key={worker.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <WorkerCard worker={worker} showActions={true} />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Active Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Active Tasks
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTasks.length} active
                </span>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <TaskCard task={task} isDraggable={true} />
                  </motion.div>
                ))}
                {activeTasks.length === 0 && (
                  <div className="text-center py-8">
                    <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No active tasks</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupervisorDashboard
