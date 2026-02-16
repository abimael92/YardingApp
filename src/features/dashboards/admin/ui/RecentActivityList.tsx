/**
 * Recent Activity List Component
 * 
 * Displays a list of recent system activities with icons and timestamps
 */

"use client"

import { motion } from "framer-motion"
import {
    UserGroupIcon,
    ClipboardDocumentListIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from "@heroicons/react/24/outline"
import { formatRelativeTime } from "@/src/features/admin/utils/formatters"
import type { ActivityLog } from "@/src/services/adminService"

interface RecentActivityListProps {
    activities: ActivityLog[]
    onViewAll: () => void
}

export const RecentActivityList = ({ activities, onViewAll }: RecentActivityListProps) => {
    const getActivityIcon = (type: ActivityLog["type"]) => {
        switch (type) {
            case "user_created":
            case "client_created":
            case "employee_created":
                return UserGroupIcon
            case "job_created":
            case "job_updated":
                return ClipboardDocumentListIcon
            case "payment_received":
                return CurrencyDollarIcon
            default:
                return ClockIcon
        }
    }

    const getActivityColor = (type: ActivityLog["type"]) => {
        switch (type) {
            case "payment_received":
                return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30"
            case "user_created":
            case "client_created":
            case "employee_created":
                return "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"
            case "job_created":
            case "job_updated":
                return "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30"
            default:
                return "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
        }
    }

    const formatActivityType = (type: ActivityLog["type"]): string => {
        const types: Record<ActivityLog["type"], string> = {
            user_created: "User Created",
            job_created: "Job Created",
            job_updated: "Job Updated",
            payment_received: "Payment Received",
            client_created: "Client Created",
            employee_created: "Employee Created",
        }
        return types[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    if (activities.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="card p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h2>
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                        View All
                    </button>
                </div>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No recent activity
                </p>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                </h2>
                <button
                    onClick={onViewAll}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type)
                    const colorClass = getActivityColor(activity.type)

                    return (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                        >
                            <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                                <Icon className="w-4 h-4" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {formatActivityType(activity.type)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                    {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatRelativeTime(activity.timestamp)}
                                </p>
                            </div>

                            {activity.user && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                    by {activity.user}
                                </span>
                            )}
                        </motion.div>
                    )
                })}
            </div>

            {activities.length >= 10 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-3 py-1"
                    >
                        View All Activity
                    </button>
                </div>
            )}
        </motion.div>
    )
}