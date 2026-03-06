
"use client"

import { useState, useEffect } from "react"
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

export default function SystemHealthPage() {
    const [health, setHealth] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const { getSystemHealth } = await import("@/src/services/adminService")
                const data = await getSystemHealth()
                setHealth(data)
            } catch (error) {
                console.error("Failed to load system health:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchHealth()
    }, [])

    if (loading) return <LoadingState message="Loading system health..." />

    return (
        <div className="space-y-6">
            <Breadcrumbs />
            <h1 className="text-2xl font-bold">System Health</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-2">Overall Status</h2>
                    <div className="flex items-center gap-2">
                        {health?.status === 'healthy' && (
                            <>
                                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                <span className="text-green-600 font-medium">Healthy</span>
                            </>
                        )}
                        {health?.status === 'warning' && (
                            <>
                                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                                <span className="text-yellow-600 font-medium">Warning</span>
                            </>
                        )}
                        {health?.status === 'critical' && (
                            <>
                                <XCircleIcon className="w-6 h-6 text-red-500" />
                                <span className="text-red-600 font-medium">Critical</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-2">Uptime</h2>
                    <p className="text-2xl font-bold">{Math.floor(health?.uptime / 3600)}h</p>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-2">Active Connections</h2>
                    <p className="text-2xl font-bold">{health?.activeConnections}</p>
                </div>
            </div>

            <div className="card p-6">
                <h2 className="text-lg font-semibold mb-4">Services Status</h2>
                <div className="space-y-4">
                    {health?.services.map((service: any) => (
                        <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">{service.name}</span>
                            <div className="flex items-center gap-3">
                                <span className={
                                    service.status === 'healthy' ? 'text-green-600' :
                                        service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                                }>
                                    {service.status}
                                </span>
                                <span className="text-sm text-gray-500">
                                    Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

