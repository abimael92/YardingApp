"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Bars3Icon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import Sidebar from "../src/components/Sidebar"
import Breadcrumbs from "../src/components/Breadcrumbs"
import StatsCard from "../src/components/StatsCard"

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    {
      title: "Total Revenue",
      value: "$24,580",
      icon: CurrencyDollarIcon,
      color: "primary" as const,
      change: "+12% from last month",
    },
    {
      title: "Active Clients",
      value: "156",
      icon: UserGroupIcon,
      color: "green" as const,
      change: "+8 new this week",
    },
    {
      title: "Team Members",
      value: "12",
      icon: UserGroupIcon,
      color: "earth" as const,
      change: "3 available, 9 busy",
    },
    {
      title: "System Health",
      value: "99.2%",
      icon: ChartBarIcon,
      color: "sand" as const,
      change: "All systems operational",
    },
  ]

  // Sample data for charts
  const revenueData = [
    { month: "Jul", revenue: 18500, clients: 142 },
    { month: "Aug", revenue: 22300, clients: 148 },
    { month: "Sep", revenue: 19800, clients: 145 },
    { month: "Oct", revenue: 25600, clients: 152 },
    { month: "Nov", revenue: 23400, clients: 149 },
    { month: "Dec", revenue: 26800, clients: 154 },
    { month: "Jan", revenue: 24580, clients: 156 },
  ]

  const serviceDistribution = [
    { name: "Lawn Mowing", value: 45, color: "#22c55e" },
    { name: "Landscaping", value: 25, color: "#3b82f6" },
    { name: "Tree Services", value: 20, color: "#f59e0b" },
    { name: "Irrigation", value: 10, color: "#ef4444" },
  ]

  const performanceData = [
    { day: "Mon", efficiency: 85, satisfaction: 92 },
    { day: "Tue", efficiency: 88, satisfaction: 94 },
    { day: "Wed", efficiency: 82, satisfaction: 89 },
    { day: "Thu", efficiency: 91, satisfaction: 96 },
    { day: "Fri", efficiency: 87, satisfaction: 93 },
    { day: "Sat", efficiency: 89, satisfaction: 95 },
    { day: "Sun", efficiency: 84, satisfaction: 91 },
  ]

  const recentUsers = [
    {
      id: "1",
      name: "Maria Rodriguez",
      email: "maria@email.com",
      role: "Client",
      status: "Active",
      joinDate: "2024-01-15",
    },
    {
      id: "2",
      name: "James Wilson",
      email: "james@email.com",
      role: "Worker",
      status: "Active",
      joinDate: "2024-01-12",
    },
    {
      id: "3",
      name: "Sarah Johnson",
      email: "sarah@email.com",
      role: "Client",
      status: "Pending",
      joinDate: "2024-01-10",
    },
    {
      id: "4",
      name: "Mike Chen",
      email: "mike@email.com",
      role: "Supervisor",
      status: "Active",
      joinDate: "2024-01-08",
    },
  ]

  const systemAlerts = [
    {
      id: "1",
      type: "warning",
      title: "High Server Load",
      description: "Server CPU usage at 85%. Consider scaling resources.",
      time: "5 minutes ago",
    },
    {
      id: "2",
      type: "info",
      title: "Scheduled Maintenance",
      description: "System maintenance scheduled for tonight at 2 AM.",
      time: "2 hours ago",
    },
    {
      id: "3",
      type: "success",
      title: "Backup Completed",
      description: "Daily database backup completed successfully.",
      time: "6 hours ago",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="admin" />

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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-400">System Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">System Status</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">All Systems Online</span>
                </div>
              </div>
              <img src="/asian-business-woman.png" alt="Admin" className="w-10 h-10 rounded-full object-cover" />
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

          {/* Charts Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Revenue & Client Growth</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-background)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.6}
                        name="Revenue ($)"
                      />
                      <Line
                        type="monotone"
                        dataKey="clients"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        name="Clients"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Service Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Distribution</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {serviceDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-gray-600 dark:text-gray-300">{item.name}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card p-6 mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Weekly Performance Metrics</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" className="text-gray-600 dark:text-gray-400" />
                  <YAxis className="text-gray-600 dark:text-gray-400" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="efficiency" fill="#f59e0b" name="Efficiency %" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="satisfaction" fill="#22c55e" name="Satisfaction %" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Users</h2>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400">Name</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400">Role</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400">Status</th>
                      <th className="text-left py-2 text-gray-600 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-3">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 text-gray-600 dark:text-gray-300">{user.role}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">System Alerts</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">{systemAlerts.length} alerts</span>
              </div>
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-l-yellow-500"
                        : alert.type === "success"
                          ? "bg-green-50 dark:bg-green-900/20 border-l-green-500"
                          : "bg-blue-50 dark:bg-blue-900/20 border-l-blue-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{alert.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{alert.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{alert.time}</p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          alert.type === "warning"
                            ? "bg-yellow-500"
                            : alert.type === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                        }`}
                      ></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
