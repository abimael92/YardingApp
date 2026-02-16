/**
 * System Health Card Component
 * 
 * Displays system health metrics and service status
 */

"use client"

import { motion } from "framer-motion"
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XCircleIcon,
    ServerIcon,
    ClockIcon,
    ArrowPathIcon,
} from "@heroicons/react/24/outline"
import type { SystemHealth } from "@/src/services/adminService"

interface SystemHealthCardProps {
    health: SystemHealth | null
}

export const SystemHealthCard = ({ health }: SystemHealthCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return {
                    text: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    icon: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
                    label: "Healthy",
                }
            case "warning":
                return {
                    text: "text-yellow-600 dark:text-yellow-400",
                    bg: "bg-yellow-100 dark:bg-yellow-900/30",
                    icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />,
                    label: "Warning",
                }
            case "critical":
                return {
                    text: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    icon: <XCircleIcon className="w-5 h-5 text-red-500" />,
                    label: "Critical",
                }
            default:
                return {
                    text: "text-gray-600 dark:text-gray-400",
                    bg: "bg-gray-100 dark:bg-gray-800",
                    icon: <ServerIcon className="w-5 h-5 text-gray-500" />,
                    label: "Unknown",
                }
        }
    }

    const formatUptime = (uptime: number): string => {
        return `${uptime.toFixed(1)}%`
    }

    const formatLastCheck = (timestamp: string): string => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMin = Math.floor(diffMs / 60000)

        if (diffMin < 1) return 'Just now'
        if (diffMin < 60) return `${diffMin}m ago`
        if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`
        return date.toLocaleDateString()
    }

    const defaultHealth: SystemHealth = {
        status: "healthy",
        uptime: 99.2,
        activeConnections: 156,
        services: [
            { name: "API Server", status: "healthy", lastCheck: new Date().toISOString() },
            { name: "Database", status: "healthy", lastCheck: new Date().toISOString() },
            { name: "Payment Gateway", status: "healthy", lastCheck: new Date().toISOString() },
            { name: "Email Service", status: "warning", lastCheck: new Date(Date.now() - 300000).toISOString() },
        ],
    }

    const systemHealth = health || defaultHealth
    const overallStatus = getStatusColor(systemHealth.status)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="card p-6"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    System Health
                </h2>
                <ServerIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>

            {/* Overall Status */}
            <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Overall Status
                    </span>
                    <div className="flex items-center space-x-2">
                        {overallStatus.icon}
                        <span className={`text-sm font-semibold ${overallStatus.text}`}>
                            {overallStatus.label}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="flex items-center space-x-2">
                        <ClockIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Uptime</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatUptime(systemHealth.uptime)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <ArrowPathIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Connections</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {systemHealth.activeConnections}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Services Status
                </h3>
                <div className="space-y-3">
                    {systemHealth.services?.map((service, index) => {
                        const serviceStatus = getStatusColor(service.status)

                        return (
                            <motion.div
                                key={`${service.name}-${index}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.6 + index * 0.05 }}
                                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    {serviceStatus.icon}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {service.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Last check: {formatLastCheck(service.lastCheck)}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${serviceStatus.bg} ${serviceStatus.text}`}>
                                    {serviceStatus.label}
                                </span>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Additional Metrics */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {systemHealth.services?.filter(s => s.status === 'healthy').length || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Healthy Services</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {systemHealth.services?.filter(s => s.status === 'warning').length || 0}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Warnings</p>
                    </div>
                </div>
            </div>

            {/* Status Legend */}
            <div className="mt-4 flex items-center justify-end space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                    <span className="text-gray-500 dark:text-gray-400">Healthy</span>
                </div>
                <div className="flex items-center space-x-1">
                    <ExclamationTriangleIcon className="w-3 h-3 text-yellow-500" />
                    <span className="text-gray-500 dark:text-gray-400">Warning</span>
                </div>
                <div className="flex items-center space-x-1">
                    <XCircleIcon className="w-3 h-3 text-red-500" />
                    <span className="text-gray-500 dark:text-gray-400">Critical</span>
                </div>
            </div>
        </motion.div>
    )
}