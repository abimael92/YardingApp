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
    SparklesIcon,
    PaintBrushIcon,
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
            operational: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-600/20', icon: CheckCircleIcon },
            maintenance: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-600/20', icon: ClockIcon },
            repair: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-600/20', icon: ExclamationTriangleIcon },
            idle: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 ring-1 ring-gray-600/20', icon: TruckIcon },
            out_of_service: { color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-red-600/30', icon: XMarkIcon },
            pending_purchase: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-600/20', icon: CurrencyDollarIcon }
        }
        const { color, icon: Icon } = config[status] || config.idle
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${color}`}>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <Breadcrumbs />
                <div className="flex items-center justify-between mt-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Equipment Management
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Track and manage all equipment across your fleet
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.refresh()}
                            className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                                     dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 
                                     dark:hover:bg-gray-700 transition-all duration-200"
                            title="Refresh"
                        >
                            <ArrowPathIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white 
                                     rounded-xl hover:bg-green-700 transition-all duration-200 
                                     shadow-lg shadow-green-600/25 font-medium"
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
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Equipment</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.total}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                      flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <TruckIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Operational</p>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                {stats.operational}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl 
                                      flex items-center justify-center text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">In Maintenance</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                                {stats.maintenance}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl 
                                      flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Needs Repair</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                {stats.repair}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl 
                                      flex items-center justify-center text-red-600 dark:text-red-400">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Idle/Storage</p>
                            <p className="text-2xl font-bold text-gray-600 dark:text-gray-400 mt-1">
                                {stats.idle}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl 
                                      flex items-center justify-center text-gray-600 dark:text-gray-400">
                            <TruckIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 
                             dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">To Purchase</p>
                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                                {stats.pendingPurchase}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl 
                                      flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <CurrencyDollarIcon className="w-6 h-6" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters and Search - ENHANCED VERSION */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                         dark:border-gray-700 shadow-sm p-5"
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search with Enhanced Styling */}
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 
                                                       text-gray-400 group-focus-within:text-green-500 
                                                       transition-colors duration-300" />
                        <input
                            type="text"
                            placeholder="Search equipment by name, type, manufacturer, model..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                     rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     placeholder-gray-500 dark:placeholder-gray-400 
                                     focus:border-green-500 focus:ring-4 focus:ring-green-500/20 
                                     transition-all duration-300 hover:border-green-300"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <FunnelIcon className="w-5 h-5 text-gray-400" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                     rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-green-500 focus:ring-4 focus:ring-green-500/20 
                                     transition-all duration-300 hover:border-green-300 cursor-pointer"
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
                            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 
                                     rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:border-green-500 focus:ring-4 focus:ring-green-500/20 
                                     transition-all duration-300 hover:border-green-300 cursor-pointer"
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
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 
                         dark:border-gray-700 shadow-sm overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Equipment List
                        </h2>
                        <span className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full 
                                      text-gray-600 dark:text-gray-300 font-medium">
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
                                <div className="py-1">
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
                            header: "Hours",
                            render: (value: unknown) => (
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
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
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {maintenanceDate.toLocaleDateString()}
                                        </div>
                                        {maintenanceDate < today ? (
                                            <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                                                Overdue by {Math.abs(daysUntil)} days
                                            </span>
                                        ) : daysUntil <= 7 ? (
                                            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
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
                                    className="text-sm font-medium text-green-600 hover:text-green-700 
                                             dark:text-green-400 dark:hover:text-green-300 
                                             px-3 py-1.5 rounded-lg hover:bg-green-50 
                                             dark:hover:bg-green-500/10 transition-all"
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
// ADD EQUIPMENT MODAL - ENHANCED STYLING WITH VIBRANT INPUTS
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

interface EquipmentCategory {
    id: string
    name: string
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
    const [activeTab, setActiveTab] = useState<'basic' | 'maintenance' | 'training'>('basic')
    const [isSaving, setIsSaving] = useState(false)
    const [focusedField, setFocusedField] = useState<string | null>(null)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await onSave()
        } finally {
            setIsSaving(false)
        }
    }

    // Enhanced input class with vibrant colors
    const getInputClasses = (fieldName: string, isSelect: boolean = false) => {
        const baseClasses = `w-full px-4 py-3 rounded-xl transition-all duration-300 
            border-2 outline-none appearance-none
            ${isSelect ? 'cursor-pointer' : ''}`

        const focusedClasses = focusedField === fieldName
            ? 'border-green-500 ring-4 ring-green-500/20 bg-green-50 dark:bg-green-900/10'
            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-green-300 dark:hover:border-green-700'

        const textClasses = 'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500'

        return `${baseClasses} ${focusedClasses} ${textClasses}`
    }

    // Enhanced label class
    const labelClasses = "block text-sm font-semibold mb-2 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent"

    // Required star
    const requiredStar = <span className="text-transparent bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text">*</span>

    // Dynamic field sets based on category
    const getCategorySpecificFields = (category: string) => {
        switch (category) {
            case "Mowers":
            case "Trimmers & Edgers":
            case "Blowers":
            case "Power Equipment":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50/50 
                                 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl 
                                 border-2 border-green-200 dark:border-green-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-green-600 to-emerald-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-green-200 dark:border-green-800">
                            <WrenchScrewdriverIcon className="w-4 h-4 text-green-500" />
                            Equipment Details
                        </h3>

                        <div className="grid grid-cols-3 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Manufacturer
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.manufacturer || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, manufacturer: e.target.value })}
                                    onFocus={() => setFocusedField('manufacturer')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('manufacturer')}
                                    placeholder="e.g., John Deere"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Model
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.model || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, model: e.target.value })}
                                    onFocus={() => setFocusedField('model')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('model')}
                                    placeholder="e.g., Z930M"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Year
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.year || new Date().getFullYear()}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, year: parseInt(e.target.value) })}
                                    onFocus={() => setFocusedField('year')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('year')}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Serial Number
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.serialNumber || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                    onFocus={() => setFocusedField('serialNumber')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('serialNumber')}
                                    placeholder="Serial #"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Fuel Type
                                </label>
                                <select
                                    value={newEquipment.fuelType || 'gasoline'}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, fuelType: e.target.value })}
                                    onFocus={() => setFocusedField('fuelType')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('fuelType', true)}
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
                                <label className={labelClasses}>
                                    Hours Meter
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.hours || 0}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, hours: parseInt(e.target.value) })}
                                    onFocus={() => setFocusedField('hours')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('hours')}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Blade/Cutter Condition
                                </label>
                                <select
                                    value={newEquipment.bladeCondition || 'good'}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, bladeCondition: e.target.value })}
                                    onFocus={() => setFocusedField('bladeCondition')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('bladeCondition', true)}
                                >
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor - Replace</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )

            case "Trucks & Trailers":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 
                                 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl 
                                 border-2 border-blue-200 dark:border-blue-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-blue-600 to-indigo-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-blue-200 dark:border-blue-800">
                            <TruckIcon className="w-4 h-4 text-blue-500" />
                            Vehicle Details
                        </h3>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    License Plate
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.licensePlate || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, licensePlate: e.target.value })}
                                    onFocus={() => setFocusedField('licensePlate')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('licensePlate')}
                                    placeholder="ABC-1234"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    VIN
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.vin || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, vin: e.target.value })}
                                    onFocus={() => setFocusedField('vin')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('vin')}
                                    placeholder="1HGCM82633A123456"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Odometer (miles)
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.odometer || 0}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, odometer: parseInt(e.target.value) })}
                                    onFocus={() => setFocusedField('odometer')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('odometer')}
                                    placeholder="0"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Registration Expiration
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.registrationExpiration || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, registrationExpiration: e.target.value })}
                                    onFocus={() => setFocusedField('registrationExpiration')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('registrationExpiration')}
                                />
                            </div>
                        </div>

                        {category === "Trucks & Trailers" && (
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className={labelClasses}>
                                        GVWR (lbs)
                                    </label>
                                    <input
                                        type="number"
                                        value={newEquipment.gvwr || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, gvwr: parseInt(e.target.value) })}
                                        onFocus={() => setFocusedField('gvwr')}
                                        onBlur={() => setFocusedField(null)}
                                        className={getInputClasses('gvwr')}
                                        placeholder="10000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClasses}>
                                        Axles
                                    </label>
                                    <select
                                        value={newEquipment.axles || '1'}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, axles: e.target.value })}
                                        onFocus={() => setFocusedField('axles')}
                                        onBlur={() => setFocusedField(null)}
                                        className={getInputClasses('axles', true)}
                                    >
                                        <option value="1">Single Axle</option>
                                        <option value="2">Tandem Axle</option>
                                        <option value="3">Triple Axle</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )

            case "Hand Tools":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 
                                 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl 
                                 border-2 border-amber-200 dark:border-amber-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-amber-600 to-orange-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-amber-200 dark:border-amber-800">
                            <WrenchScrewdriverIcon className="w-4 h-4 text-amber-500" />
                            Tool Details
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Serial Number (optional)
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.serialNumber || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, serialNumber: e.target.value })}
                                    onFocus={() => setFocusedField('serialNumber')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('serialNumber')}
                                    placeholder="Serial #"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Condition
                                </label>
                                <select
                                    value={newEquipment.condition || 'good'}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, condition: e.target.value })}
                                    onFocus={() => setFocusedField('condition')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('condition', true)}
                                >
                                    <option value="new">New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="worn">Worn</option>
                                    <option value="needs_replace">Needs Replacement</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )

            case "Sprayers":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-purple-50 to-violet-50/50 
                                 dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl 
                                 border-2 border-purple-200 dark:border-purple-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-purple-600 to-violet-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-purple-200 dark:border-purple-800">
                            <PaintBrushIcon className="w-4 h-4 text-purple-500" />
                            Sprayer Details
                        </h3>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Tank Capacity (gal)
                                </label>
                                <input
                                    type="number"
                                    value={newEquipment.tankCapacity || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, tankCapacity: parseInt(e.target.value) })}
                                    onFocus={() => setFocusedField('tankCapacity')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('tankCapacity')}
                                    placeholder="25"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Last Calibration
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.lastCalibration || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, lastCalibration: e.target.value })}
                                    onFocus={() => setFocusedField('lastCalibration')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('lastCalibration')}
                                />
                            </div>
                        </div>
                    </motion.div>
                )

            case "Safety Equipment":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-red-50 to-rose-50/50 
                                 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl 
                                 border-2 border-red-200 dark:border-red-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-red-600 to-rose-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-red-200 dark:border-red-800">
                            <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                            Safety Equipment Details
                        </h3>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Size
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.size || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, size: e.target.value })}
                                    onFocus={() => setFocusedField('size')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('size')}
                                    placeholder="M, L, XL, etc."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Inspection Date
                                </label>
                                <input
                                    type="date"
                                    value={newEquipment.inspectionDate || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, inspectionDate: e.target.value })}
                                    onFocus={() => setFocusedField('inspectionDate')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('inspectionDate')}
                                />
                            </div>
                        </div>
                    </motion.div>
                )

            case "Storage":
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5 mt-6 p-6 bg-gradient-to-br from-teal-50 to-cyan-50/50 
                                 dark:from-teal-950/30 dark:to-cyan-950/30 rounded-2xl 
                                 border-2 border-teal-200 dark:border-teal-800"
                    >
                        <h3 className="text-sm font-bold text-transparent bg-gradient-to-r 
                                     from-teal-600 to-cyan-600 bg-clip-text flex items-center gap-2 
                                     pb-2 border-b border-teal-200 dark:border-teal-800">
                            <DocumentTextIcon className="w-4 h-4 text-teal-500" />
                            Storage Details
                        </h3>

                        <div className="grid grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Dimensions
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.dimensions || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, dimensions: e.target.value })}
                                    onFocus={() => setFocusedField('dimensions')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('dimensions')}
                                    placeholder="10x10x8"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>
                                    Material
                                </label>
                                <input
                                    type="text"
                                    value={newEquipment.material || ''}
                                    onChange={(e) => setNewEquipment({ ...newEquipment, material: e.target.value })}
                                    onFocus={() => setFocusedField('material')}
                                    onBlur={() => setFocusedField(null)}
                                    className={getInputClasses('material')}
                                    placeholder="Wood, Metal, etc."
                                />
                            </div>
                        </div>
                    </motion.div>
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, type: "spring", damping: 25 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-4xl h-[750px] flex flex-col overflow-hidden border-2 border-white/20"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header with Vibrant Gradient */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                    <div className="relative flex items-center justify-between px-8 py-6">
                        <div className="flex items-center gap-4">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.5 }}
                                className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm 
                                         flex items-center justify-center border-2 border-white/30
                                         shadow-xl"
                            >
                                <TruckIcon className="w-7 h-7 text-white" />
                            </motion.div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    Add New Equipment
                                </h2>
                                <p className="text-white/80 text-sm mt-1 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4" />
                                    Fill in the details below
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="p-3 bg-white/20 backdrop-blur-sm rounded-xl 
                                     hover:bg-white/30 transition-all duration-300
                                     border-2 border-white/30 text-white"
                            aria-label="Close modal"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </motion.button>
                    </div>
                </div>

                {/* Tabs with Enhanced Styling */}
                <div className="flex gap-1 px-8 pt-6 bg-gradient-to-b from-gray-50 to-white 
                              dark:from-gray-800 dark:to-gray-800 border-b-2 border-gray-100 
                              dark:border-gray-700">
                    {[
                        { id: 'basic', label: 'Basic Info', icon: DocumentTextIcon, color: 'green' },
                        { id: 'maintenance', label: 'Purchase & Maintenance', icon: CalendarIcon, color: 'blue' },
                        { id: 'training', label: 'Training & Requirements', icon: AcademicCapIcon, color: 'purple' }
                    ].map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const colorClasses = {
                            green: 'from-green-600 to-emerald-600',
                            blue: 'from-blue-600 to-indigo-600',
                            purple: 'from-purple-600 to-violet-600'
                        }[tab.color]

                        return (
                            <motion.button
                                key={tab.id}
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 0 }}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`relative px-6 py-3 text-sm font-medium rounded-t-2xl 
                                         transition-all duration-300 flex items-center gap-2
                                         ${isActive
                                        ? `bg-gradient-to-r ${colorClasses} text-white shadow-lg`
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-0.5 
                                                 bg-gradient-to-r from-green-500 to-emerald-600"
                                        transition={{ type: "spring", damping: 25 }}
                                    />
                                )}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Modal Content with Enhanced Inputs */}
                <div className="flex-1 p-8 overflow-y-auto bg-gradient-to-b from-white to-gray-50 
                              dark:from-gray-800 dark:to-gray-900">
                    <AnimatePresence mode="wait">
                        {activeTab === 'basic' && (
                            <motion.div
                                key="basic"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Equipment Name {requiredStar}
                                        </label>
                                        <input
                                            type="text"
                                            value={newEquipment.name || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                                            onFocus={() => setFocusedField('name')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('name')}
                                            placeholder="e.g., Zero-Turn Mower"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Type
                                        </label>
                                        <input
                                            type="text"
                                            value={newEquipment.type || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, type: e.target.value })}
                                            onFocus={() => setFocusedField('type')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('type')}
                                            placeholder="e.g., Mower"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Category {requiredStar}
                                        </label>
                                        <select
                                            value={newEquipment.category || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                                            onFocus={() => setFocusedField('category')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('category', true)}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Status
                                        </label>
                                        <select
                                            value={newEquipment.status || 'operational'}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, status: e.target.value as Equipment['status'] })}
                                            onFocus={() => setFocusedField('status')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('status', true)}
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
                            </motion.div>
                        )}

                        {activeTab === 'maintenance' && (
                            <motion.div
                                key="maintenance"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Purchase Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newEquipment.purchaseDate || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, purchaseDate: e.target.value })}
                                            onFocus={() => setFocusedField('purchaseDate')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('purchaseDate')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Purchase Price ($)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 
                                                           text-gray-500 font-medium">$</span>
                                            <input
                                                type="number"
                                                value={newEquipment.purchasePrice || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, purchasePrice: parseFloat(e.target.value) })}
                                                onFocus={() => setFocusedField('purchasePrice')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`${getInputClasses('purchasePrice')} pl-8`}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Location/Storage
                                        </label>
                                        <div className="relative">
                                            <MapPinIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                                ${focusedField === 'location' ? 'text-green-500' : 'text-gray-400'}`} />
                                            <input
                                                type="text"
                                                value={newEquipment.location || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, location: e.target.value })}
                                                onFocus={() => setFocusedField('location')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`${getInputClasses('location')} pl-10`}
                                                placeholder="e.g., Main Yard, Truck #3"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Assign to Crew
                                        </label>
                                        <div className="relative">
                                            <UserGroupIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                                ${focusedField === 'currentCrew' ? 'text-green-500' : 'text-gray-400'}`} />
                                            <select
                                                value={newEquipment.currentCrew || ''}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, currentCrew: e.target.value })}
                                                onFocus={() => setFocusedField('currentCrew')}
                                                onBlur={() => setFocusedField(null)}
                                                className={`${getInputClasses('currentCrew', true)} pl-10`}
                                            >
                                                <option value="">Not Assigned</option>
                                                {crews.map(crew => (
                                                    <option key={crew.id} value={crew.id}>{crew.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Last Service Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newEquipment.lastService || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, lastService: e.target.value })}
                                            onFocus={() => setFocusedField('lastService')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('lastService')}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Next Maintenance Date
                                        </label>
                                        <input
                                            type="date"
                                            value={newEquipment.nextMaintenance || ''}
                                            onChange={(e) => setNewEquipment({ ...newEquipment, nextMaintenance: e.target.value })}
                                            onFocus={() => setFocusedField('nextMaintenance')}
                                            onBlur={() => setFocusedField(null)}
                                            className={getInputClasses('nextMaintenance')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClasses}>
                                        Insurance Expiration
                                    </label>
                                    <input
                                        type="date"
                                        value={newEquipment.insuranceExpiration || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, insuranceExpiration: e.target.value })}
                                        onFocus={() => setFocusedField('insuranceExpiration')}
                                        onBlur={() => setFocusedField(null)}
                                        className={getInputClasses('insuranceExpiration')}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'training' && (
                            <motion.div
                                key="training"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50/50 
                                              dark:from-purple-950/30 dark:to-violet-950/30 rounded-2xl 
                                              border-2 border-purple-200 dark:border-purple-800">
                                    <div className="space-y-4">
                                        <label className={`flex items-start gap-4 p-5 bg-white dark:bg-gray-800 
                                                        rounded-xl border-2 transition-all duration-300 cursor-pointer
                                                        ${focusedField === 'requiresLicense'
                                                ? 'border-purple-500 ring-4 ring-purple-500/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
                                            <input
                                                type="checkbox"
                                                checked={newEquipment.requiresLicense || false}
                                                onChange={(e) => {
                                                    setNewEquipment({
                                                        ...newEquipment,
                                                        requiresLicense: e.target.checked,
                                                        requiredLicenseType: e.target.checked ? newEquipment.requiredLicenseType || '' : ''
                                                    })
                                                    setFocusedField('requiresLicense')
                                                }}
                                                onBlur={() => setFocusedField(null)}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 
                                                         text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <span className="text-base font-semibold text-transparent 
                                                               bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text">
                                                    Requires License/Certification
                                                </span>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Operator must have valid license to use this equipment
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br 
                                                          from-purple-500 to-violet-600 flex items-center 
                                                          justify-center text-white shadow-lg">
                                                <ShieldCheckIcon className="w-6 h-6" />
                                            </div>
                                        </label>

                                        {newEquipment.requiresLicense && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pl-16 pr-4"
                                            >
                                                <select
                                                    value={newEquipment.requiredLicenseType || ''}
                                                    onChange={(e) => setNewEquipment({ ...newEquipment, requiredLicenseType: e.target.value })}
                                                    onFocus={() => setFocusedField('requiredLicenseType')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className={getInputClasses('requiredLicenseType', true)}
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
                                        <label className={`flex items-start gap-4 p-5 bg-white dark:bg-gray-800 
                                                        rounded-xl border-2 transition-all duration-300 cursor-pointer
                                                        ${focusedField === 'requiresTraining'
                                                ? 'border-purple-500 ring-4 ring-purple-500/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}>
                                            <input
                                                type="checkbox"
                                                checked={newEquipment.requiresTraining || false}
                                                onChange={(e) => {
                                                    setNewEquipment({ ...newEquipment, requiresTraining: e.target.checked })
                                                    setFocusedField('requiresTraining')
                                                }}
                                                onBlur={() => setFocusedField(null)}
                                                className="mt-1 w-5 h-5 rounded border-gray-300 
                                                         text-purple-600 focus:ring-purple-500"
                                            />
                                            <div className="flex-1">
                                                <span className="text-base font-semibold text-transparent 
                                                               bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text">
                                                    Requires Special Training
                                                </span>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    Additional training required before operation
                                                </p>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br 
                                                          from-purple-500 to-violet-600 flex items-center 
                                                          justify-center text-white shadow-lg">
                                                <AcademicCapIcon className="w-6 h-6" />
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className={labelClasses}>
                                        Notes / Special Requirements
                                    </label>
                                    <textarea
                                        value={newEquipment.notes || ''}
                                        onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                                        onFocus={() => setFocusedField('notes')}
                                        onBlur={() => setFocusedField(null)}
                                        rows={5}
                                        className={`${getInputClasses('notes')} resize-none`}
                                        placeholder="Any additional notes about training requirements, safety considerations, etc."
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modal Footer with Enhanced Buttons */}
                <div className="flex items-center justify-end gap-4 px-8 py-5 border-t-2 
                              border-gray-100 dark:border-gray-700 bg-gradient-to-r 
                              from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 
                                 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600
                                 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 
                                 transition-all duration-300 shadow-lg hover:shadow-xl"
                        disabled={isSaving}
                    >
                        Cancel
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={!newEquipment.name || !newEquipment.category || isSaving}
                        className="px-8 py-3 text-sm font-semibold text-white 
                                 bg-gradient-to-r from-green-500 to-emerald-600 
                                 rounded-xl hover:from-green-600 hover:to-emerald-700 
                                 transition-all duration-300 disabled:opacity-50 
                                 disabled:cursor-not-allowed flex items-center gap-3
                                 shadow-xl shadow-green-500/30 relative overflow-hidden
                                 group"
                    >
                        <span className="absolute inset-0 bg-white/20 transform -skew-x-12 
                                       -translate-x-full group-hover:translate-x-full 
                                       transition-transform duration-700" />

                        {isSaving ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <PlusIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                                Add Equipment
                            </>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}