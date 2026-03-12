/**
 * Equipment Management Page
 * 
 * Manage all equipment including:
 * - List all equipment with status
 * - Add/edit equipment
 * - View maintenance schedule
 * - Track assignments
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"
import DataTable from "@/src/shared/ui/DataTable"

interface Equipment {
    id: string
    name: string
    type: string
    status: 'operational' | 'maintenance' | 'repair' | 'idle'
    hours: number
    nextMaintenance: string
    location?: string
    lastService?: string
}

interface EquipmentStats {
    total: number
    operational: number
    maintenance: number
    repair: number
    idle: number
}

interface StatusConfig {
    color: string
    icon: React.ComponentType<{ className: string }>
}

interface ColumnDefinition {
    key: string
    header: string
    render: (value: unknown, item?: Equipment) => React.ReactNode
}

interface FilterState {
    searchTerm: string
    statusFilter: string
}

interface StatusConfigMap {
    [key: string]: StatusConfig
}

export default function EquipmentPage(): React.ReactElement {
    const router = useRouter()
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const { getEquipmentStatus } = await import("@/src/services/adminService")
                const data = await getEquipmentStatus()
                setEquipment(data as unknown as Equipment[])
            } catch (error) {
                console.error("Failed to load equipment:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchEquipment()
    }, [])

    // Calculate stats
    const stats = {
        total: equipment.length,
        operational: equipment.filter(e => e.status === 'operational').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        repair: equipment.filter(e => e.status === 'repair').length,
        idle: equipment.filter(e => e.status === 'idle').length
    }

    // Filter equipment
    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || item.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getStatusBadge = (status: string) => {
        const config = {
            operational: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon },
            maintenance: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon },
            repair: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: ExclamationTriangleIcon },
            idle: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: TruckIcon }
        }
        const { color, icon: Icon } = config[status as keyof typeof config] || config.idle
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    if (loading) {
        return <LoadingState message="Loading equipment..." />
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <Breadcrumbs />
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Equipment Management
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Track and manage all equipment across your fleet
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.refresh()}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                     dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                                     dark:hover:bg-gray-800 transition-colors"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => router.push('/admin/equipment/add')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white 
                                     rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5" />
                            Add Equipment
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Equipment</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.total}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                      flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Operational</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {stats.operational}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl 
                                      flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">In Maintenance</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                {stats.maintenance}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl 
                                      flex items-center justify-center">
                            <ClockIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Needs Repair</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {stats.repair}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl 
                                      flex items-center justify-center">
                            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                         dark:border-gray-700 shadow-sm p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search equipment by name or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                                     rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 
                                     focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="operational">Operational</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="idle">Idle</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Equipment Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                         dark:border-gray-700 shadow-sm overflow-hidden"
            >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Equipment List
                        </h2>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {filteredEquipment.length} items
                        </span>
                    </div>
                </div>

                <DataTable
                    columns={[
                        {
                            key: "name",
                            header: "Equipment Name",
                            render: (value: unknown, item?: Equipment) => (
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {value as string}  {/* Add type assertion here for consistency */}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {item?.type}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "status",
                            header: "Status",
                            render: (value: unknown) => getStatusBadge(value as unknown as string) 
                        },
                        {
                            key: "hours",
                            header: "Hours Used",
                            render: (value: unknown) => (
                                <span className="font-mono text-sm text-gray-900 dark:text-white">
                                    {(value as number).toLocaleString()} hrs
                                </span>
                            )
                        },
                        {
                            key: "nextMaintenance",
                            header: "Next Maintenance",
                            render: (value: unknown) => {
                                // Convert the value to a string first
                                const dateString = String(value);
                                const maintenanceDate = new Date(dateString);

                                return (
                                    <div className="text-sm">
                                        <div className="text-gray-900 dark:text-white">
                                            {maintenanceDate.toLocaleDateString()}
                                        </div>
                                        {maintenanceDate < new Date() && (
                                            <span className="text-xs text-red-600 dark:text-red-400">
                                                Overdue
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        },
                        {
                            key: "id",
                            header: "",
                            render: (value: unknown) => (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/admin/equipment/${value as string}`)
                                    }}
                                    className="text-sm text-green-600 hover:text-green-700 
                                             dark:text-green-400 dark:hover:text-green-300"
                                >
                                    View Details →
                                </button>
                            )
                        }
                    ]}
                    data={filteredEquipment}
                    keyExtractor={(item) => item.id}
                    // onRowClick={(item) => router.push(`/admin/equipment/${item.id}`)}
                />
            </motion.div>
        </div>
    )
}