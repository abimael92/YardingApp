"use client"

import { motion } from "framer-motion"
import {
    WrenchIcon,
    ClockIcon,
    CurrencyDollarIcon,
    DocumentIcon,
    MapPinIcon,
    CheckCircleIcon,
    UserGroupIcon,
} from "@heroicons/react/24/outline"
import type { PendingAction } from "@/src/services/adminService"

interface PendingActionsListProps {
    actions: PendingAction[]
    onActionClick: (link?: string) => void
    onViewAll?: () => void
}

export const PendingActionsList = ({ actions, onActionClick, onViewAll }: PendingActionsListProps) => {
    const getPriorityColor = (priority: PendingAction["priority"]) => {
        switch (priority) {
            case "high":
                return {
                    border: "border-red-500",
                    bg: "bg-red-50 dark:bg-red-900/10",
                    hover: "hover:bg-red-100 dark:hover:bg-red-900/20",
                    badge: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    text: "text-red-700 dark:text-red-300",
                }
            case "medium":
                return {
                    border: "border-yellow-500",
                    bg: "bg-yellow-50 dark:bg-yellow-900/10",
                    hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/20",
                    badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                    text: "text-yellow-700 dark:text-yellow-300",
                }
            case "low":
                return {
                    border: "border-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-900/10",
                    hover: "hover:bg-blue-100 dark:hover:bg-blue-900/20",
                    badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                    text: "text-blue-700 dark:text-blue-300",
                }
        }
    }

    const getPriorityLabel = (priority: PendingAction["priority"]) =>
        priority.charAt(0).toUpperCase() + priority.slice(1)

    const getTypeIcon = (type: PendingAction["type"]) => {
        switch (type) {
            case "unassigned_job":
                return <WrenchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            case "pending_approval":
                return <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            case "overdue_payment":
                return <CurrencyDollarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            case "pending_quote":
                return <DocumentIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            case "pending_customer":
                return <UserGroupIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            default:
                return <MapPinIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        }
    }

    if (actions.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="card p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Pending Actions
                    </h2>
                </div>
                <div className="text-center py-8">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">All clear! No pending actions</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Everything is up to date</p>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pending Actions</h2>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 text-xs font-semibold rounded-full">
                        {actions.length}
                    </span>
                </div>
                {onViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                        View All
                    </button>
                )}
            </div>

            <div className="space-y-3">
                {actions.map((action, index) => {
                    const colors = getPriorityColor(action.priority)
                    const isClickable = !!action.link

                    return (
                        <motion.div
                            key={action.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                            onClick={() => isClickable && onActionClick(action.link)}
                            className={`
                p-4 rounded-lg border-l-4 ${colors.border} ${colors.bg} ${colors.hover}
                ${isClickable ? "cursor-pointer transform transition-transform hover:scale-[1.02]" : ""}
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
              `}
                            role={isClickable ? "button" : "article"}
                            tabIndex={isClickable ? 0 : undefined}
                            onKeyDown={(e) => {
                                if (isClickable && (e.key === "Enter" || e.key === " ") && action.link) {
                                    e.preventDefault()
                                    onActionClick(action.link)
                                }
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        {getTypeIcon(action.type)}
                                        <h3 className={`text-sm font-semibold ${colors.text}`}>{action.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors.badge}`}>
                                            {getPriorityLabel(action.priority)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">{action.description}</p>

                                    {isClickable && (
                                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-2 ml-7">Click to view →</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Priority Breakdown:</span>
                    <div className="flex space-x-3">
                        <span className="text-red-600 dark:text-red-400">
                            High: {actions.filter((a) => a.priority === "high").length}
                        </span>
                        <span className="text-yellow-600 dark:text-yellow-400">
                            Med: {actions.filter((a) => a.priority === "medium").length}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400">
                            Low: {actions.filter((a) => a.priority === "low").length}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}