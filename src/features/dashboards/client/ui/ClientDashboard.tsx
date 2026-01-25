"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  HomeIcon,
  CalendarIcon,
  CreditCardIcon,
  StarIcon,
  PlusIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import Sidebar from "@/src/shared/ui/Sidebar"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import ServiceCard from "@/src/shared/ui/ServiceCard"
import StatsCard from "@/src/shared/ui/StatsCard"
import { getServices } from "@/src/services/serviceCatalog"

const ClientDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = [
    {
      title: "Active Services",
      value: "3",
      icon: HomeIcon,
      color: "primary" as const,
      change: "Lawn, Landscaping, Irrigation",
    },
    {
      title: "Next Service",
      value: "Jan 18",
      icon: CalendarIcon,
      color: "earth" as const,
      change: "Weekly lawn maintenance",
    },
    {
      title: "This Month",
      value: "$285",
      icon: CreditCardIcon,
      color: "sand" as const,
      change: "3 services completed",
    },
    {
      title: "Satisfaction",
      value: "4.9",
      icon: StarIcon,
      color: "green" as const,
      change: "Based on 12 reviews",
    },
  ]

  // Sample spending data
  const spendingData = [
    { month: "Jul", amount: 220 },
    { month: "Aug", amount: 280 },
    { month: "Sep", amount: 240 },
    { month: "Oct", amount: 320 },
    { month: "Nov", amount: 290 },
    { month: "Dec", amount: 310 },
    { month: "Jan", amount: 285 },
  ]

  const upcomingServices = [
    {
      id: "1",
      service: "Weekly Lawn Maintenance",
      date: "January 18, 2024",
      time: "9:00 AM - 11:00 AM",
      worker: "Mike Rodriguez",
      status: "confirmed",
    },
    {
      id: "2",
      service: "Irrigation System Check",
      date: "January 22, 2024",
      time: "2:00 PM - 4:00 PM",
      worker: "Sarah Chen",
      status: "pending",
    },
    {
      id: "3",
      service: "Tree Trimming",
      date: "January 25, 2024",
      time: "8:00 AM - 12:00 PM",
      worker: "David Wilson",
      status: "confirmed",
    },
  ]

  const recentActivity = [
    {
      id: "1",
      action: "Service Completed",
      description: "Weekly lawn maintenance completed successfully",
      date: "2 days ago",
      status: "completed",
    },
    {
      id: "2",
      action: "Payment Processed",
      description: "Monthly service payment of $285 processed",
      date: "3 days ago",
      status: "success",
    },
    {
      id: "3",
      action: "Service Scheduled",
      description: "Tree trimming scheduled for January 25th",
      date: "1 week ago",
      status: "scheduled",
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} userRole="client" />

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
                  Client Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Welcome back, Jennifer Martinez
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Request Service</span>
              </motion.button>
              <img
                src="/happy-female-customer.jpg"
                alt="Jennifer Martinez"
                className="w-10 h-10 rounded-full object-cover"
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
            {/* Spending Chart */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                  Monthly Spending
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={spendingData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
                      <YAxis className="text-gray-600 dark:text-gray-400" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--color-background)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                        }}
                        formatter={(value) => [`$${value}`, "Amount"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#22c55e"
                        strokeWidth={3}
                        dot={{ fill: "#22c55e", strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Property Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Property Overview
              </h3>
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg?key=property"
                    alt="Property overview"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
                    1234 Desert View Dr
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lot Size:</span>
                    <span className="text-gray-900 dark:text-white">0.25 acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Lawn Area:</span>
                    <span className="text-gray-900 dark:text-white">3,200 sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Irrigation Zones:
                    </span>
                    <span className="text-gray-900 dark:text-white">4 zones</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Trees:</span>
                    <span className="text-gray-900 dark:text-white">8 palm trees</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Upcoming Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upcoming Services
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {upcomingServices.length} scheduled
                </span>
              </div>
              <div className="space-y-4">
                {upcomingServices.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {service.service}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          service.status === "confirmed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{service.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-center">🕐</span>
                        <span>{service.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-center">👤</span>
                        <span>{service.worker}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h2>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === "completed"
                          ? "bg-green-500"
                          : activity.status === "success"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {activity.action}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.date}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Available Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Available Services
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getServices().map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <ServiceCard service={service} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default ClientDashboard
