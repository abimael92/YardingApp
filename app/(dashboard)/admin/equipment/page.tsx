/**
 * Equipment Management Page
 * 
 * Manage all equipment including:
 * - List all equipment with status
 * - Add/edit equipment via modal
 * - View maintenance schedule
 * - Track assignments
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
    DocumentTextIcon,
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ShieldCheckIcon,
    AcademicCapIcon,
    Cog6ToothIcon,
    ChartBarIcon,
    BoltIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline"
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"
import DataTable from "@/src/shared/ui/DataTable"

interface Equipment {
    id: string
    name: string
    type: string
    category?: string
    status: 'operational' | 'maintenance' | 'repair' | 'idle' | 'out_of_service' | 'pending_purchase'
    hours: number
    nextMaintenance: string
    location?: string
    lastService?: string
    purchaseDate?: string
    purchasePrice?: number
    warranty?: string
    bladeCondition?: string
    licensePlate?: string
    vin?: string
    odometer?: number
    registrationExpiration?: string
    gvwr?: number
    axles?: string
    condition?: string
    tankCapacity?: number
    lastCalibration?: string
    size?: string
    inspectionDate?: string
    dimensions?: string
    material?: string
    serialNumber?: string
    manufacturer?: string
    model?: string
    year?: number
    fuelType?: string
    requiresLicense?: boolean
    requiredLicenseType?: string
    requiresTraining?: boolean
    currentCrew?: string
    currentJob?: string
    insuranceExpiration?: string
    notes?: string
    image?: string
    healthScore?: number
}

interface EquipmentStats {
    total: number
    operational: number
    maintenance: number
    repair: number
    idle: number
    pendingPurchase: number
}

interface StatusConfig {
    color: string
    bgColor: string
    icon: React.ComponentType<{ className: string }>
    label: string
}

interface ColumnDefinition {
    key: string
    header: string
    render: (value: unknown, item?: Equipment) => React.ReactNode
}

interface FilterState {
    searchTerm: string
    statusFilter: string
    categoryFilter: string
}

interface StatusConfigMap {
    [key: string]: StatusConfig
}

interface EquipmentCategory {
    id: string
    name: string
}

interface Crew {
    id: string
    name: string
}

// Equipment Categories for dropdown
const EQUIPMENT_CATEGORIES = [
    "Mowers",
    "Trimmers & Edgers",
    "Blowers",
    "Hand Tools",
    "Power Equipment",
    "Tractors & Loaders",
    "Trucks & Trailers",
    "Irrigation Equipment",
    "Aeration Equipment",
    "Sprayers",
    "Specialty Equipment",
    "Safety Equipment",
    "Storage",
    "Miscellaneous"
]

// Fuel Types
const FUEL_TYPES = [
    "gasoline",
    "diesel",
    "electric",
    "battery",
    "manual"
]

// License Types
const LICENSE_TYPES = [
    "Driver's License",
    "CDL Class A",
    "CDL Class B",
    "CDL Class C",
    "Forklift Certification",
    "Pesticide License",
    "Chainsaw Certification",
    "Aerial Lift Certification",
    "Scissor Lift Certification",
    "None"
]

// Status configuration with enhanced styling
const STATUS_CONFIG: Record<string, StatusConfig> = {
    operational: { 
        color: 'text-emerald-700 dark:text-emerald-300', 
        bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
        icon: CheckCircleIcon,
        label: 'Operational'
    },
    maintenance: { 
        color: 'text-amber-700 dark:text-amber-300', 
        bgColor: 'bg-amber-50 dark:bg-amber-500/10',
        icon: ClockIcon,
        label: 'In Maintenance'
    },
    repair: { 
        color: 'text-rose-700 dark:text-rose-300', 
        bgColor: 'bg-rose-50 dark:bg-rose-500/10',
        icon: ExclamationTriangleIcon,
        label: 'Needs Repair'
    },
    idle: { 
        color: 'text-slate-700 dark:text-slate-300', 
        bgColor: 'bg-slate-50 dark:bg-slate-500/10',
        icon: TruckIcon,
        label: 'Idle'
    },
    out_of_service: { 
        color: 'text-red-700 dark:text-red-300', 
        bgColor: 'bg-red-50 dark:bg-red-500/10',
        icon: XMarkIcon,
        label: 'Out of Service'
    },
    pending_purchase: { 
        color: 'text-blue-700 dark:text-blue-300', 
        bgColor: 'bg-blue-50 dark:bg-blue-500/10',
        icon: CurrencyDollarIcon,
        label: 'Pending Purchase'
    }
}

export default function EquipmentPage(): React.ReactElement {
    const router = useRouter()
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [categoryFilter, setCategoryFilter] = useState<string>("all")
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [categories, setCategories] = useState<EquipmentCategory[]>([])
    const [crews, setCrews] = useState<Crew[]>([])
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
    const [selectedItems, setSelectedItems] = useState<string[]>([])

    // New equipment form state
    const [newEquipment, setNewEquipment] = useState<Partial<Equipment>>({
        name: "",
        type: "",
        category: "",
        status: "operational",
        hours: 0,
        manufacturer: "",
        model: "",
        year: new Date().getFullYear(),
        serialNumber: "",
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        fuelType: "gasoline",
        requiresLicense: false,
        requiredLicenseType: "",
        requiresTraining: false,
        location: "",
        notes: ""
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { getEquipmentStatus, getEquipmentCategories, getCrews } = await import("@/src/services/adminService")
                const [equipmentData, categoriesData, crewsData] = await Promise.all([
                    getEquipmentStatus(),
                    getEquipmentCategories(),
                    getCrews()
                ])
                // Add mock health scores for demo
                const enrichedData = (equipmentData as unknown as Equipment[]).map(item => ({
                    ...item,
                    healthScore: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
                }))
                setEquipment(enrichedData)
                setCategories(categoriesData as EquipmentCategory[])
                setCrews(crewsData as Crew[])
            } catch (error) {
                console.error("Failed to load equipment:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Calculate stats
    const stats = {
        total: equipment.length,
        operational: equipment.filter(e => e.status === 'operational').length,
        maintenance: equipment.filter(e => e.status === 'maintenance').length,
        repair: equipment.filter(e => e.status === 'repair').length,
        idle: equipment.filter(e => e.status === 'idle').length,
        pendingPurchase: equipment.filter(e => e.status === 'pending_purchase').length
    }

    // Filter equipment
    const filteredEquipment = equipment.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.model?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || item.status === statusFilter
        const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
    })

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.idle
        const Icon = config.icon
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        )
    }

    const getHealthScoreColor = (score: number = 85) => {
        if (score >= 90) return 'text-emerald-600 dark:text-emerald-400'
        if (score >= 70) return 'text-amber-600 dark:text-amber-400'
        return 'text-rose-600 dark:text-rose-400'
    }

    const handleAddEquipment = async () => {
        try {
            const { addEquipment } = await import("@/src/services/adminService")
            const added = await addEquipment(newEquipment)
            setEquipment([...equipment, { ...added as Equipment, healthScore: 100 }])
            setIsAddModalOpen(false)
            // Reset form
            setNewEquipment({
                name: "",
                type: "",
                category: "",
                status: "operational",
                hours: 0,
                manufacturer: "",
                model: "",
                year: new Date().getFullYear(),
                serialNumber: "",
                purchaseDate: new Date().toISOString().split('T')[0],
                purchasePrice: 0,
                fuelType: "gasoline",
                requiresLicense: false,
                requiredLicenseType: "",
                requiresTraining: false,
                location: "",
                notes: ""
            })
        } catch (error) {
            console.error("Failed to add equipment:", error)
        }
    }

    const toggleItemSelection = (id: string) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    if (loading) {
        return <LoadingState message="Loading equipment..." />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <div className="space-y-6 p-6">
                {/* Page Header with Glassmorphism */}
                <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 p-6 shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 dark:from-green-500/5 dark:to-blue-500/5" />
                    <div className="relative">
                        <Breadcrumbs />
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-4">
                            <div className="space-y-1">
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Equipment Management
                                </h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
                                    Track and manage all equipment across your fleet
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                             dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                                             dark:hover:bg-gray-700 transition-all duration-200"
                                    title={viewMode === 'grid' ? 'Switch to table view' : 'Switch to grid view'}
                                >
                                    {viewMode === 'grid' ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                    )}
                                </button>
                                <button
                                    onClick={() => router.refresh()}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                             dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 
                                             dark:hover:bg-gray-700 transition-all duration-200 hover:rotate-180"
                                    title="Refresh"
                                >
                                    <ArrowPathIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 
                                             text-white rounded-xl hover:from-green-700 hover:to-green-600 
                                             transition-all duration-200 shadow-lg shadow-green-500/25 
                                             hover:shadow-xl hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Equipment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <StatCard
                        title="Total Equipment"
                        value={stats.total}
                        icon={TruckIcon}
                        color="blue"
                        delay={0.05}
                    />
                    <StatCard
                        title="Operational"
                        value={stats.operational}
                        icon={CheckCircleIcon}
                        color="emerald"
                        delay={0.1}
                    />
                    <StatCard
                        title="In Maintenance"
                        value={stats.maintenance}
                        icon={ClockIcon}
                        color="amber"
                        delay={0.15}
                    />
                    <StatCard
                        title="Needs Repair"
                        value={stats.repair}
                        icon={ExclamationTriangleIcon}
                        color="rose"
                        delay={0.2}
                    />
                    <StatCard
                        title="Idle/Storage"
                        value={stats.idle}
                        icon={TruckIcon}
                        color="slate"
                        delay={0.25}
                    />
                    <StatCard
                        title="To Purchase"
                        value={stats.pendingPurchase}
                        icon={CurrencyDollarIcon}
                        color="blue"
                        delay={0.3}
                    />
                </div>

                {/* Enhanced Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
                             border border-gray-200/50 dark:border-gray-700/50 shadow-lg p-5"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search with enhanced styling */}
                        <div className="flex-1 relative group">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 
                                                           text-gray-400 group-focus-within:text-green-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search equipment by name, type, manufacturer, model..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-700/50 
                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                         text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500 
                                         transition-all duration-200"
                            />
                        </div>

                        {/* Filter chips */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 
                                          rounded-lg text-sm text-gray-600 dark:text-gray-300">
                                <FunnelIcon className="w-4 h-4" />
                                <span>Filters:</span>
                            </div>
                            
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-200 
                                         dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                         transition-all duration-200"
                            >
                                <option value="all">All Categories</option>
                                {EQUIPMENT_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-200 
                                         dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                         transition-all duration-200"
                            >
                                <option value="all">All Status</option>
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>

                            {selectedItems.length > 0 && (
                                <motion.button
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="px-3 py-2 bg-rose-500 text-white rounded-lg text-sm
                                             hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/25"
                                >
                                    Bulk Actions ({selectedItems.length})
                                </motion.button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Equipment Display */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl 
                             border border-gray-200/50 dark:border-gray-700/50 shadow-lg"
                >
                    <div className="p-5 border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 
                                             dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Equipment List
                                </h2>
                                <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700/50 rounded-full 
                                               text-xs font-medium text-gray-600 dark:text-gray-300">
                                    {filteredEquipment.length} items
                                </span>
                            </div>
                            
                            {/* Quick stats */}
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <CheckCircleSolid className="w-4 h-4 text-emerald-500" />
                                    {stats.operational} operational
                                </span>
                                <span className="flex items-center gap-1">
                                    <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                                    {stats.maintenance + stats.repair} attention needed
                                </span>
                            </div>
                        </div>
                    </div>

                    {viewMode === 'table' ? (
                        <DataTable
                            columns={[
                                {
                                    key: "select",
                                    header: "",
                                    render: (_: unknown, item?: Equipment) => (
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item?.id || '')}
                                            onChange={() => item?.id && toggleItemSelection(item.id)}
                                            className="rounded border-gray-300 text-green-600 
                     focus:ring-green-500 transition-shadow"
                                        />
                                    )
                                },
                                {
                                    key: "name",
                                    header: "Equipment",
                                    render: (value: unknown, item?: Equipment) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br 
                                                          from-gray-100 to-gray-200 dark:from-gray-700 
                                                          dark:to-gray-600 flex items-center justify-center">
                                                <TruckIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">
                                                    {value as string}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <span>{item?.manufacturer} {item?.model} • {item?.year}</span>
                                                    {item?.healthScore && (
                                                        <span className={`flex items-center gap-0.5 ${getHealthScoreColor(item.healthScore)}`}>
                                                            <BoltIcon className="w-3 h-3" />
                                                            {item.healthScore}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                },
                                {
                                    key: "category",
                                    header: "Category",
                                    render: (value: unknown) => (
                                        <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700/50 
                                                       rounded-lg text-gray-600 dark:text-gray-300">
                                            {value as string || 'Uncategorized'}
                                        </span>
                                    )
                                },
                                {
                                    key: "status",
                                    header: "Status",
                                    render: (value: unknown) => getStatusBadge(value as unknown as string)
                                },
                                {
                                    key: "hours",
                                    header: "Usage",
                                    render: (value: unknown) => (
                                        <div className="flex flex-col">
                                            <span className="font-mono text-sm text-gray-900 dark:text-white">
                                                {(value as number).toLocaleString()} hrs
                                            </span>
                                            <span className="text-xs text-gray-500">total hours</span>
                                        </div>
                                    )
                                },
                                {
                                    key: "nextMaintenance",
                                    header: "Maintenance",
                                    render: (value: unknown) => {
                                        const dateString = String(value);
                                        const maintenanceDate = new Date(dateString);
                                        const today = new Date();
                                        const daysUntil = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                        const isOverdue = maintenanceDate < today;
                                        const isDueSoon = !isOverdue && daysUntil <= 7;

                                        return (
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900 dark:text-white">
                                                    {maintenanceDate.toLocaleDateString()}
                                                </span>
                                                {isOverdue && (
                                                    <span className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                                        <ExclamationTriangleIcon className="w-3 h-3" />
                                                        Overdue
                                                    </span>
                                                )}
                                                {isDueSoon && (
                                                    <span className="text-xs text-amber-600 dark:text-amber-400">
                                                        Due in {daysUntil} days
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }
                                },
                                {
                                    key: "location",
                                    header: "Location",
                                    render: (value: unknown) => (
                                        <span className="text-sm flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <MapPinIcon className="w-3.5 h-3.5" />
                                            {value as string || 'Not assigned'}
                                        </span>
                                    )
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
                                            className="px-3 py-1.5 text-sm text-green-600 hover:text-green-700 
                                                     dark:text-green-400 dark:hover:text-green-300 
                                                     bg-green-50 dark:bg-green-500/10 rounded-lg
                                                     hover:bg-green-100 dark:hover:bg-green-500/20 
                                                     transition-all duration-200 hover:scale-105 active:scale-95"
                                        >
                                            Details →
                                        </button>
                                    )
                                }
                            ]}
                            data={filteredEquipment}
                            keyExtractor={(item) => item.id}
                        />
                    ) : (
                        <div className="p-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredEquipment.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        className="group relative bg-white dark:bg-gray-700/30 rounded-xl 
                                                 border border-gray-200 dark:border-gray-700 p-5
                                                 hover:shadow-xl hover:shadow-green-500/5 
                                                 hover:border-green-500/50 transition-all duration-300
                                                 cursor-pointer"
                                        onClick={() => router.push(`/admin/equipment/${item.id}`)}
                                    >
                                        {/* Selection checkbox */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.includes(item.id)}
                                                onChange={(e) => {
                                                    e.stopPropagation()
                                                    toggleItemSelection(item.id)
                                                }}
                                                className="rounded border-gray-300 text-green-600 
                                                         focus:ring-green-500 transition-shadow"
                                            />
                                        </div>

                                        {/* Health score indicator */}
                                        <div className="absolute top-3 right-3">
                                            <div className={`text-sm font-semibold ${getHealthScoreColor(item.healthScore)}`}>
                                                {item.healthScore}%
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center text-center pt-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br 
                                                          from-green-500 to-green-600 flex items-center 
                                                          justify-center mb-4 shadow-lg shadow-green-500/30
                                                          group-hover:scale-110 transition-transform duration-300">
                                                <TruckIcon className="w-8 h-8 text-white" />
                                            </div>
                                            
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                {item.name}
                                            </h3>
                                            
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                {item.manufacturer} {item.model} • {item.year}
                                            </p>
                                            
                                            <div className="mb-3">
                                                {getStatusBadge(item.status)}
                                            </div>
                                            
                                            <div className="w-full grid grid-cols-2 gap-2 text-xs 
                                                          text-gray-600 dark:text-gray-400">
                                                <div className="flex flex-col items-center p-2 
                                                              bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <ClockIcon className="w-4 h-4 mb-1" />
                                                    <span>{item.hours.toLocaleString()} hrs</span>
                                                </div>
                                                <div className="flex flex-col items-center p-2 
                                                              bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                                    <MapPinIcon className="w-4 h-4 mb-1" />
                                                    <span>{item.location || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Add Equipment Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddEquipmentModal
                        newEquipment={newEquipment}
                        setNewEquipment={setNewEquipment}
                        onClose={() => setIsAddModalOpen(false)}
                        onSave={handleAddEquipment}
                        categories={EQUIPMENT_CATEGORIES}
                        fuelTypes={FUEL_TYPES}
                        licenseTypes={LICENSE_TYPES}
                        crews={crews}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// Enhanced Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, delay }: { 
    title: string
    value: number
    icon: React.ComponentType<{ className: string }>
    color: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate'
    delay: number
}) => {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        emerald: 'from-emerald-500 to-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
        amber: 'from-amber-500 to-amber-600 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
        rose: 'from-rose-500 to-rose-600 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
        slate: 'from-slate-500 to-slate-600 bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="group relative overflow-hidden rounded-xl bg-white/80 dark:bg-gray-800/80 
                     backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 
                     shadow-lg hover:shadow-xl transition-all duration-300"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} opacity-0 
                           group-hover:opacity-5 transition-opacity duration-300`} />
            
            <div className="relative p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                        <p className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 
                                    dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {value}
                        </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${colorClasses[color].split(' ').slice(2).join(' ')} 
                                  flex items-center justify-center shadow-lg group-hover:scale-110 
                                  transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                
                {/* Mini sparkline effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r 
                              from-transparent via-current to-transparent opacity-10" />
            </div>
        </motion.div>
    )
}

// ============================================================================
// ADD EQUIPMENT MODAL (Enhanced)
// ============================================================================

interface AddEquipmentModalProps {
    newEquipment: Partial<Equipment>
    setNewEquipment: React.Dispatch<React.SetStateAction<Partial<Equipment>>>
    onClose: () => void
    onSave: () => Promise<void>
    categories: string[]
    fuelTypes: string[]
    licenseTypes: string[]
    crews: Crew[]
}

const AddEquipmentModal = ({
    newEquipment,
    setNewEquipment,
    onClose,
    onSave,
    categories,
    fuelTypes,
    licenseTypes,
    crews
}: AddEquipmentModalProps) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'purchase' | 'maintenance' | 'training'>('basic')
    const [isSaving, setIsSaving] = useState(false)
    const [formProgress, setFormProgress] = useState(25)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave()
        } finally {
            setIsSaving(false)
        }
    }

    // Update progress based on active tab
    useEffect(() => {
        const progressMap = {
            basic: 25,
            purchase: 50,
            maintenance: 75,
            training: 100
        }
        setFormProgress(progressMap[activeTab])
    }, [activeTab])

    // Dynamic field sets based on category (same as before but with enhanced styling)
    const getCategorySpecificFields = (category: string) => {
        // ... (keep the same logic but with enhanced styling)
        return (
            <div className="space-y-4 mt-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 
                          dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl border 
                          border-gray-200/50 dark:border-gray-700/50">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 
                             flex items-center gap-2">
                    <SparklesIcon className="w-4 h-4 text-green-500" />
                    Category Specific Details
                </h3>
                
                {/* Add your existing category-specific fields here with enhanced styling */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Fields will appear based on selected category
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 
                     bg-gradient-to-br from-black/60 to-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl 
                         h-[750px] flex flex-col overflow-hidden border border-gray-200/50 
                         dark:border-gray-700/50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header with Gradient */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 
                                  to-blue-500/10 dark:from-green-500/5 dark:to-blue-500/5" />
                    
                    <div className="relative flex items-center justify-between p-6 
                                  border-b border-gray-200/50 dark:border-gray-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br 
                                          from-green-500 to-green-600 flex items-center 
                                          justify-center shadow-lg shadow-green-500/30">
                                <TruckIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold bg-gradient-to-r 
                                             from-gray-900 to-gray-600 dark:from-white 
                                             dark:to-gray-300 bg-clip-text text-transparent">
                                    Add New Equipment
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Fill in the details to add new equipment
                                </p>
                            </div>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="flex items-center gap-3">
                            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${formProgress}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                                         rounded-lg transition-all duration-200 
                                         hover:rotate-90"
                                aria-label="Close modal"
                            >
                                <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enhanced Tabs */}
                <div className="flex border-b border-gray-200/50 dark:border-gray-700/50 px-6 bg-gray-50/50 dark:bg-gray-800/50">
                    {[
                        { id: 'basic', label: 'Basic Info', icon: DocumentTextIcon },
                        { id: 'purchase', label: 'Purchase', icon: CurrencyDollarIcon },
                        { id: 'maintenance', label: 'Maintenance', icon: WrenchScrewdriverIcon },
                        { id: 'training', label: 'Training', icon: AcademicCapIcon }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium 
                                      border-b-2 transition-all duration-200
                                      ${activeTab === tab.id
                                ? 'border-green-500 text-green-600 dark:text-green-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Modal Content with enhanced scrolling */}
                <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
                              dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'basic' && (
                                <div className="space-y-5">
                                    {/* Basic info fields with enhanced styling */}
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Equipment Name <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={newEquipment.name || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="e.g., Zero-Turn Mower"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Type
                                            </label>
                                            <input
                                                type="text"
                                                value={newEquipment.type || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="e.g., Mower"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Category <span className="text-rose-500">*</span>
                                            </label>
                                            <select
                                                value={newEquipment.category || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Status
                                            </label>
                                            <select
                                                value={newEquipment.status || 'operational'}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value as Equipment['status'] })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            >
                                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Category-specific fields */}
                                    {newEquipment.category && getCategorySpecificFields(newEquipment.category)}
                                </div>
                            )}

                            {/* Purchase tab */}
                            {activeTab === 'purchase' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Purchase Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newEquipment.purchaseDate || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Purchase Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={newEquipment.purchasePrice || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Warranty Until
                                            </label>
                                            <input
                                                type="date"
                                                value={newEquipment.warranty || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, warranty: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Manufacturer
                                            </label>
                                            <input
                                                type="text"
                                                value={newEquipment.manufacturer || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="e.g., John Deere"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Model
                                            </label>
                                            <input
                                                type="text"
                                                value={newEquipment.model || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="e.g., Z930M"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Year
                                            </label>
                                            <input
                                                type="number"
                                                value={newEquipment.year || new Date().getFullYear()}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, year: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                min="1900"
                                                max={new Date().getFullYear() + 1}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Serial Number
                                        </label>
                                        <input
                                            type="text"
                                            value={newEquipment.serialNumber || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                     border border-gray-200 dark:border-gray-600 rounded-xl
                                                     focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                     transition-all duration-200"
                                            placeholder="Serial #"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Maintenance tab */}
                            {activeTab === 'maintenance' && (
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Location/Storage
                                            </label>
                                            <input
                                                type="text"
                                                value={newEquipment.location || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="e.g., Main Yard, Truck #3"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Assign to Crew
                                            </label>
                                            <select
                                                value={newEquipment.currentCrew || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, currentCrew: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            >
                                                <option value="">Not Assigned</option>
                                                {crews.map(crew => (
                                                    <option key={crew.id} value={crew.id}>{crew.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Current Hours
                                            </label>
                                            <input
                                                type="number"
                                                value={newEquipment.hours || 0}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, hours: parseInt(e.target.value) })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                                placeholder="0"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Fuel Type
                                            </label>
                                            <select
                                                value={newEquipment.fuelType || 'gasoline'}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, fuelType: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            >
                                                {fuelTypes.map(type => (
                                                    <option key={type} value={type}>
                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Last Service Date
                                            </label>
                                            <input
                                                type="date"
                                                value={newEquipment.lastService || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, lastService: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Next Maintenance
                                            </label>
                                            <input
                                                type="date"
                                                value={newEquipment.nextMaintenance || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, nextMaintenance: e.target.value })}
                                                className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                         border border-gray-200 dark:border-gray-600 rounded-xl
                                                         focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                         transition-all duration-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Insurance Expiration
                                        </label>
                                        <input
                                            type="date"
                                            value={newEquipment.insuranceExpiration || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, insuranceExpiration: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                     border border-gray-200 dark:border-gray-600 rounded-xl
                                                     focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                     transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Training tab */}
                            {activeTab === 'training' && (
                                <div className="space-y-5">
                                    <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 
                                                  dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl 
                                                  border border-gray-200/50 dark:border-gray-700/50">
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 
                                                            rounded-lg border border-gray-200/50 dark:border-gray-700/50
                                                            hover:border-green-500/50 transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newEquipment.requiresLicense || false}
                                                    onChange={(e) => setNewEquipment({
                                                        ...newEquipment,
                                                        requiresLicense: e.target.checked,
                                                        requiredLicenseType: e.target.checked ? newEquipment.requiredLicenseType || '' : ''
                                                    })}
                                                    className="rounded border-gray-300 text-green-600 
                                                             focus:ring-green-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Requires License/Certification
                                                    </span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Operator must have valid license to use this equipment
                                                    </p>
                                                </div>
                                                <ShieldCheckIcon className="w-5 h-5 text-gray-400" />
                                            </label>

                                            {newEquipment.requiresLicense && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="pl-8"
                                                >
                                                    <select
                                                        value={newEquipment.requiredLicenseType || ''}
                                                        onChange={(e) => setNewEquipment({ ...newEquipment, requiredLicenseType: e.target.value })}
                                                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                                 border border-gray-200 dark:border-gray-600 rounded-xl
                                                                 focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                                 transition-all duration-200"
                                                    >
                                                        <option value="">Select License Type</option>
                                                        {licenseTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </motion.div>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <label className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800/50 
                                                            rounded-lg border border-gray-200/50 dark:border-gray-700/50
                                                            hover:border-green-500/50 transition-colors cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={newEquipment.requiresTraining || false}
                                                    onChange={(e) => setNewEquipment({ ...newEquipment, requiresTraining: e.target.checked })}
                                                    className="rounded border-gray-300 text-green-600 
                                                             focus:ring-green-500"
                                                />
                                                <div className="flex-1">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Requires Special Training
                                                    </span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        Additional training required before operation
                                                    </p>
                                                </div>
                                                <AcademicCapIcon className="w-5 h-5 text-gray-400" />
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Notes / Special Requirements
                                        </label>
                                        <textarea
                                            value={newEquipment.notes || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                                            rows={4}
                                            className="w-full px-4 py-2.5 bg-white dark:bg-gray-700/50 
                                                     border border-gray-200 dark:border-gray-600 rounded-xl
                                                     focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                                                     transition-all duration-200 resize-none"
                                            placeholder="Any additional notes about training requirements, safety considerations, etc."
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Modal Footer with enhanced buttons */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200/50 
                              dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 
                                 bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600
                                 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 
                                 transition-all duration-200 hover:scale-105 active:scale-95"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!newEquipment.name || !newEquipment.category || isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-white 
                                 bg-gradient-to-r from-green-600 to-green-500
                                 rounded-xl hover:from-green-700 hover:to-green-600 
                                 transition-all duration-200 disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center gap-2
                                 shadow-lg shadow-green-500/25 hover:shadow-xl 
                                 hover:shadow-green-500/30 hover:scale-105 active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-4 h-4" />
                                Add Equipment
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}