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
} from "@heroicons/react/24/outline"
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
                setEquipment(equipmentData as unknown as Equipment[])
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
        const config: Record<string, { color: string; icon: React.ComponentType<{ className: string }> }> = {
            operational: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon },
            maintenance: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon },
            repair: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: ExclamationTriangleIcon },
            idle: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', icon: TruckIcon },
            out_of_service: { color: 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300', icon: XMarkIcon },
            pending_purchase: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CurrencyDollarIcon }
        }
        const { color, icon: Icon } = config[status] || config.idle
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                <Icon className="w-3.5 h-3.5" />
                {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
        )
    }

    const handleAddEquipment = async () => {
        try {
            const { addEquipment } = await import("@/src/services/adminService")
            const added = await addEquipment(newEquipment)
            setEquipment([...equipment, added as Equipment])
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
                            onClick={() => setIsAddModalOpen(true)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Idle/Storage</p>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                                {stats.idle}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl 
                                      flex items-center justify-center">
                            <TruckIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">To Purchase</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                {stats.pendingPurchase}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                      flex items-center justify-center">
                            <CurrencyDollarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters and Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                         dark:border-gray-700 shadow-sm p-4"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search equipment by name, type, manufacturer, model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 
                                     rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 
                                     focus:ring-green-500 focus:border-transparent"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Categories</option>
                            {EQUIPMENT_CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 min-w-[180px]">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="operational">Operational</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="repair">Repair</option>
                            <option value="idle">Idle</option>
                            <option value="out_of_service">Out of Service</option>
                            <option value="pending_purchase">Pending Purchase</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* Equipment Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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
                            header: "Equipment",
                            render: (value: unknown, item?: Equipment) => (
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {value as string}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {item?.manufacturer} {item?.model} • {item?.year}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "category",
                            header: "Category",
                            render: (value: unknown) => (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                            header: "Hours",
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
                                const dateString = String(value);
                                const maintenanceDate = new Date(dateString);
                                const today = new Date();
                                const daysUntil = Math.ceil((maintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                return (
                                    <div className="text-sm">
                                        <div className="text-gray-900 dark:text-white">
                                            {maintenanceDate.toLocaleDateString()}
                                        </div>
                                        {maintenanceDate < today ? (
                                            <span className="text-xs text-red-600 dark:text-red-400">
                                                Overdue by {Math.abs(daysUntil)} days
                                            </span>
                                        ) : daysUntil <= 7 ? (
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400">
                                                Due in {daysUntil} days
                                            </span>
                                        ) : null}
                                    </div>
                                );
                            }
                        },
                        {
                            key: "location",
                            header: "Location",
                            render: (value: unknown) => (
                                <span className="text-sm text-gray-600 dark:text-gray-400">
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
                />
            </motion.div>

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

// ============================================================================
// ADD EQUIPMENT MODAL
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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave()
        } finally {
            setIsSaving(false)
        }
    }

    // Dynamic field sets based on category
    const getCategorySpecificFields = (category: string) => {
        switch (category) {
            case "Mowers":
            case "Trimmers & Edgers":
            case "Blowers":
            case "Power Equipment":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Equipment Details</h3>

                        {/* Manufacturer/Model/Year for power equipment */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Manufacturer
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.manufacturer || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="e.g., John Deere"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.model || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="e.g., Z930M"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.year || new Date().getFullYear()}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, year: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Serial Number
                            </label>
                            <input
                                type="text"
                                value={newEquipment.serialNumber || ''}
                                onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                placeholder="Serial #"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Fuel Type
                            </label>
                            <select
                                value={newEquipment.fuelType || 'gasoline'}
                                onChange={(e) => setNewEquipment({ ...newEquipment, fuelType: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                                {fuelTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Hours Meter
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.hours || 0}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, hours: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Blade/Cutter Condition
                                </label>
                                <select
                                    value={newEquipment.bladeCondition || 'good'}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, bladeCondition: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                >
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor - Replace</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )

            case "Trucks & Trailers":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Vehicle Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    License Plate
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.licensePlate || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, licensePlate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="ABC-1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    VIN
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.vin || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, vin: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="1HGCM82633A123456"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Odometer (miles)
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.odometer || 0}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, odometer: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Registration Expiration
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.registrationExpiration || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, registrationExpiration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                            </div>
                        </div>
                        {category === "Trucks & Trailers" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        GVWR (lbs)
                                    </label>
                                    <input
                                        type="number"
                                        value={newEquipment.gvwr || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, gvwr: parseInt(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                        placeholder="10000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Axles
                                    </label>
                                    <select
                                        value={newEquipment.axles || '1'}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, axles: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    >
                                        <option value="1">Single Axle</option>
                                        <option value="2">Tandem Axle</option>
                                        <option value="3">Triple Axle</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                )

            case "Hand Tools":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Tool Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Serial Number (optional)
                            </label>
                            <input
                                type="text"
                                value={newEquipment.serialNumber || ''}
                                onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                placeholder="Serial #"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Condition
                            </label>
                            <select
                                value={newEquipment.condition || 'good'}
                                onChange={(e) => setNewEquipment({ ...newEquipment, condition: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                            >
                                <option value="new">New</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="worn">Worn</option>
                                <option value="needs_replace">Needs Replacement</option>
                            </select>
                        </div>
                    </div>
                )

            case "Sprayers":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Sprayer Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Tank Capacity (gal)
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.tankCapacity || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, tankCapacity: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="25"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Last Calibration
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.lastCalibration || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, lastCalibration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )

            case "Safety Equipment":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Safety Equipment Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Size
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.size || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, size: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="M, L, XL, etc."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.inspectionDate || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, inspectionDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                )

            case "Storage":
                return (
                    <div className="space-y-4 mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Details</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dimensions
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.dimensions || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, dimensions: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="10x10x8"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Material
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.material || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, material: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    placeholder="Wood, Metal, etc."
                                />
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl h-[750px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <TruckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Add New Equipment
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'basic'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Basic Info
                    </button>
                    {/* <button
                        onClick={() => setActiveTab('purchase')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'purchase'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Purchase Details
                    </button> */}
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'maintenance'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Purchase & Maintenance
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'training'
                            ? 'border-green-500 text-green-600 dark:text-green-400'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                    >
                        Training & Requirements
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 p-6 overflow-y-auto min-h-0">
                    {activeTab === 'basic' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Equipment Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newEquipment.name || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                        placeholder="e.g., Zero-Turn Mower"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Type
                                    </label>
                                    <input
                                        type="text"
                                        value={newEquipment.type || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                        placeholder="e.g., Mower"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={newEquipment.category || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={newEquipment.status || 'operational'}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value as Equipment['status'] })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                                    >
                                        <option value="operational">Operational</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="repair">Repair</option>
                                        <option value="idle">Idle</option>
                                        <option value="out_of_service">Out of Service</option>
                                        <option value="pending_purchase">Pending Purchase</option>
                                    </select>
                                </div>
                            </div>

                            {/* Category-specific fields appear here */}
                            {newEquipment.category && getCategorySpecificFields(newEquipment.category)}
                        </div>
                    )}
                    {/* Purchase */}

                    {activeTab === 'maintenance' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newEquipment.purchaseDate || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Purchase Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={newEquipment.purchasePrice || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Location/Storage
                                    </label>
                                    <input
                                        type="text"
                                        value={newEquipment.location || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="e.g., Main Yard, Truck #3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Assign to Crew
                                    </label>
                                    <select
                                        value={newEquipment.currentCrew || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, currentCrew: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Not Assigned</option>
                                        {crews.map(crew => (
                                            <option key={crew.id} value={crew.id}>{crew.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Service Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newEquipment.lastService || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, lastService: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Next Maintenance Date
                                    </label>
                                    <input
                                        type="date"
                                        value={newEquipment.nextMaintenance || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, nextMaintenance: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Insurance Expiration
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.insuranceExpiration || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, insuranceExpiration: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'training' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newEquipment.requiresLicense || false}
                                        onChange={(e) => setNewEquipment({
                                            ...newEquipment,
                                            requiresLicense: e.target.checked,
                                            requiredLicenseType: e.target.checked ? newEquipment.requiredLicenseType || '' : ''
                                        })}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Requires License/Certification
                                    </span>
                                </label>
                            </div>

                            {newEquipment.requiresLicense && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        License Type Required
                                    </label>
                                    <select
                                        value={newEquipment.requiredLicenseType || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, requiredLicenseType: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                                 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Select License Type</option>
                                        {licenseTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={newEquipment.requiresTraining || false}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, requiresTraining: e.target.checked })}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                        Requires Special Training
                                    </span>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Notes / Special Requirements
                                </label>
                                <textarea
                                    value={newEquipment.notes || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                                             rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                             focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    placeholder="Any additional notes about training requirements, safety considerations, etc."
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                                 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!newEquipment.name || !newEquipment.category || isSaving}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                                 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center gap-2"
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