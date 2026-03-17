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
            operational: { color: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30', icon: CheckCircleIcon },
            maintenance: { color: 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/30', icon: ClockIcon },
            repair: { color: 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30', icon: ExclamationTriangleIcon },
            idle: { color: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg shadow-gray-500/30', icon: TruckIcon },
            out_of_service: { color: 'bg-gradient-to-r from-purple-500 to-violet-500 text-white shadow-lg shadow-purple-500/30', icon: XMarkIcon },
            pending_purchase: { color: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30', icon: CurrencyDollarIcon }
        }
        const { color, icon: Icon } = config[status] || config.idle
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${color}`}>
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
            {/* Page Header with Enhanced Gradient */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                    <Breadcrumbs />
                    <div className="flex items-center justify-between mt-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">
                                Equipment Management
                            </h1>
                            <p className="text-white/80 mt-1 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4" />
                                Track and manage all equipment across your fleet
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => router.refresh()}
                                className="p-2.5 bg-white/20 text-white rounded-xl backdrop-blur-sm 
                                         hover:bg-white/30 transition-all duration-300 border border-white/30"
                                title="Refresh"
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white text-green-600 
                                         rounded-xl hover:bg-gray-50 transition-all duration-200 
                                         shadow-lg shadow-white/25 font-medium group"
                            >
                                <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                Add Equipment
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stats Cards with Enhanced Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-blue-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Total Equipment</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.total}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                            <TruckIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-green-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Operational</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.operational}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-yellow-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">In Maintenance</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.maintenance}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-amber-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-red-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Needs Repair</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.repair}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                            <ExclamationTriangleIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-gray-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Idle/Storage</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.idle}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-gray-500/30 group-hover:scale-110 transition-transform">
                            <TruckIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-500 to-slate-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 
                             border-2 border-transparent hover:border-purple-500/50
                             shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">To Purchase</p>
                            <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 
                                      bg-clip-text text-transparent mt-1">
                                {stats.pendingPurchase}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 
                                      rounded-xl flex items-center justify-center text-white
                                      shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                            <CurrencyDollarIcon className="w-6 h-6" />
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-600 
                                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </motion.div>
            </div>

            {/* Filters and Search - Enhanced Version */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 
                         dark:border-gray-700 shadow-lg p-5"
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

                {/* Active Filters Display */}
                {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                    >
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 
                                           text-blue-700 rounded-lg text-sm">
                                Search: {searchTerm}
                                <XMarkIcon className="w-4 h-4 cursor-pointer hover:text-blue-900"
                                    onClick={() => setSearchTerm('')} />
                            </span>
                        )}
                        {statusFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 
                                           text-green-700 rounded-lg text-sm">
                                Status: {statusFilter.replace('_', ' ')}
                                <XMarkIcon className="w-4 h-4 cursor-pointer hover:text-green-900"
                                    onClick={() => setStatusFilter('all')} />
                            </span>
                        )}
                        {categoryFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 
                                           text-purple-700 rounded-lg text-sm">
                                Category: {categoryFilter}
                                <XMarkIcon className="w-4 h-4 cursor-pointer hover:text-purple-900"
                                    onClick={() => setCategoryFilter('all')} />
                            </span>
                        )}
                    </motion.div>
                )}
            </motion.div>

            {/* Equipment Table with Enhanced Styling */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-100 
                         dark:border-gray-700 shadow-lg overflow-hidden"
            >
                <div className="px-6 py-4 border-b-2 border-gray-100 dark:border-gray-700 
                              bg-gradient-to-r from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <DocumentTextIcon className="w-5 h-5 text-green-500" />
                            Equipment List
                        </h2>
                        <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="text-sm px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 
                                     text-white rounded-full font-medium shadow-lg shadow-green-500/30"
                        >
                            {filteredEquipment.length} items
                        </motion.span>
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
                                        {item?.serialNumber && (
                                            <span className="ml-2 font-mono text-xs text-gray-400">
                                                SN: {item.serialNumber}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        },
                        {
                            key: "category",
                            header: "Category",
                            render: (value: unknown) => (
                                <span className="text-sm px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-50 
                                               dark:from-gray-700 dark:to-gray-800 rounded-lg 
                                               text-gray-700 dark:text-gray-300 border border-gray-200 
                                               dark:border-gray-600">
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
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white 
                                               bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
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

                                let statusColor = 'text-gray-600 dark:text-gray-400'
                                let statusText = ''

                                if (maintenanceDate < today) {
                                    statusColor = 'text-red-600 dark:text-red-400 font-semibold'
                                    statusText = `Overdue by ${Math.abs(daysUntil)} days`
                                } else if (daysUntil <= 7) {
                                    statusColor = 'text-yellow-600 dark:text-yellow-400 font-semibold'
                                    statusText = `Due in ${daysUntil} days`
                                }

                                return (
                                    <div className="text-sm">
                                        <div className="text-gray-900 dark:text-white font-medium">
                                            {maintenanceDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {statusText && (
                                            <span className={`text-xs ${statusColor}`}>
                                                {statusText}
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
                                <span className="text-sm flex items-center gap-1.5 text-gray-600 dark:text-gray-400
                                               bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                                    <MapPinIcon className="w-3.5 h-3.5" />
                                    {value as string || 'Not assigned'}
                                </span>
                            )
                        },
                        {
                            key: "id",
                            header: "",
                            render: (value: unknown) => (
                                <motion.button
                                    whileHover={{ scale: 1.05, x: 4 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/admin/equipment/${value as string}`)
                                    }}
                                    className="text-sm font-medium text-white bg-gradient-to-r 
                                             from-green-500 to-emerald-600 px-4 py-2 
                                             rounded-lg hover:from-green-600 hover:to-emerald-700 
                                             shadow-lg shadow-green-500/30 hover:shadow-xl 
                                             transition-all duration-300"
                                >
                                    View Details →
                                </motion.button>
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
// ADD EQUIPMENT MODAL - MATCHING EMPLOYEELIST STYLING
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

    // Input class matching EmployeeList styling
    const getInputClasses = (fieldName: string, isSelect: boolean = false) => {
        const baseClasses = `w-full px-4 py-3 rounded-lg transition-all duration-200 
            border outline-none appearance-none
            ${isSelect ? 'cursor-pointer' : ''}`

        const focusedClasses = focusedField === fieldName
            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20 bg-[#f5f1e6] dark:bg-gray-800'
            : 'border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800 hover:border-[#2e8b57] dark:hover:border-[#2e8b57]'

        const textClasses = 'text-[#8b4513] dark:text-[#d4a574] placeholder-[#b85e1a]/50 dark:placeholder-gray-500'

        return `${baseClasses} ${focusedClasses} ${textClasses}`
    }

    // Label class matching EmployeeList
    const labelClasses = "block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1"

    // Required star
    const requiredStar = <span className="text-red-500">*</span>

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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <WrenchScrewdriverIcon className="w-4 h-4 text-[#2e8b57]" />
                            Equipment Details
                        </h3>

                        <div className="grid grid-cols-3 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <TruckIcon className="w-4 h-4 text-[#2e8b57]" />
                            Vehicle Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
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

                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="grid grid-cols-2 gap-4">
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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <WrenchScrewdriverIcon className="w-4 h-4 text-[#2e8b57]" />
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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <PaintBrushIcon className="w-4 h-4 text-[#2e8b57]" />
                            Sprayer Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <ShieldCheckIcon className="w-4 h-4 text-[#2e8b57]" />
                            Safety Equipment Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
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
                        className="space-y-4 mt-6 p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]"
                    >
                        <h3 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] flex items-center gap-2 pb-2 border-b border-[#d4a574]/30">
                            <DocumentTextIcon className="w-4 h-4 text-[#2e8b57]" />
                            Storage Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl h-[750px] flex flex-col overflow-hidden border border-[#d4a574] dark:border-[#8b4513]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#2e8b57] flex items-center justify-center shadow-md">
                            <TruckIcon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-[#8b4513] dark:text-[#d4a574]">
                                Add New Equipment
                            </h2>
                            <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-0.5">
                                Fill in the details below
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 rounded-lg transition-all"
                        aria-label="Close modal"
                    >
                        <XMarkIcon className="w-5 h-5 text-[#8b4513] dark:text-[#d4a574]" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-6 pt-4 border-b border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6]/50 dark:bg-gray-800/50">
                    <button
                        onClick={() => setActiveTab('basic')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === 'basic'
                            ? 'bg-white dark:bg-gray-700 text-[#2e8b57] border-b-2 border-[#2e8b57]'
                            : 'text-[#8b4513] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#2e8b57]'
                            }`}
                    >
                        Basic Info
                    </button>
                    <button
                        onClick={() => setActiveTab('maintenance')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === 'maintenance'
                            ? 'bg-white dark:bg-gray-700 text-[#2e8b57] border-b-2 border-[#2e8b57]'
                            : 'text-[#8b4513] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#2e8b57]'
                            }`}
                    >
                        Purchase & Maintenance
                    </button>
                    <button
                        onClick={() => setActiveTab('training')}
                        className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${activeTab === 'training'
                            ? 'bg-white dark:bg-gray-700 text-[#2e8b57] border-b-2 border-[#2e8b57]'
                            : 'text-[#8b4513] hover:text-[#2e8b57] dark:text-[#d4a574] dark:hover:text-[#2e8b57]'
                            }`}
                    >
                        Training & Requirements
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
                    <AnimatePresence mode="wait">
                        {activeTab === 'basic' && (
                            <motion.div
                                key="basic"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-5">
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

                                <div className="grid grid-cols-2 gap-5">
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
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <div className="grid grid-cols-2 gap-5">
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
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b4513] dark:text-[#d4a574]">$</span>
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

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className={labelClasses}>
                                            Location/Storage
                                        </label>
                                        <div className="relative">
                                            <MapPinIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5
                                                ${focusedField === 'location' ? 'text-[#2e8b57]' : 'text-[#b85e1a]/60'}`} />
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
                                                ${focusedField === 'currentCrew' ? 'text-[#2e8b57]' : 'text-[#b85e1a]/60'}`} />
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

                                <div className="grid grid-cols-2 gap-5">
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
                                transition={{ duration: 0.2 }}
                                className="space-y-5"
                            >
                                <div className="p-5 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574] dark:border-[#8b4513]">
                                    <div className="space-y-4">
                                        <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 
                                                        rounded-lg border border-[#d4a574] dark:border-[#8b4513]
                                                        hover:border-[#2e8b57] transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newEquipment.requiresLicense || false}
                                                onChange={(e) => {
                                                    setNewEquipment({
                                                        ...newEquipment,
                                                        requiresLicense: e.target.checked,
                                                        requiredLicenseType: e.target.checked ? newEquipment.requiredLicenseType || '' : ''
                                                    })
                                                }}
                                                className="mt-1 rounded border-[#d4a574] text-[#2e8b57] focus:ring-[#2e8b57]"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
                                                    Requires License/Certification
                                                </span>
                                                <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1">
                                                    Operator must have valid license to use this equipment
                                                </p>
                                            </div>
                                            <ShieldCheckIcon className="w-5 h-5 text-[#2e8b57]" />
                                        </label>

                                        {newEquipment.requiresLicense && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="pl-8 pr-4"
                                            >
                                                <select
                                                    value={newEquipment.requiredLicenseType || ''}
                                                    onChange={(e) => setNewEquipment({ ...newEquipment, requiredLicenseType: e.target.value })}
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
                                        <label className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 
                                                        rounded-lg border border-[#d4a574] dark:border-[#8b4513]
                                                        hover:border-[#2e8b57] transition-colors cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={newEquipment.requiresTraining || false}
                                                onChange={(e) => setNewEquipment({ ...newEquipment, requiresTraining: e.target.checked })}
                                                className="mt-1 rounded border-[#d4a574] text-[#2e8b57] focus:ring-[#2e8b57]"
                                            />
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
                                                    Requires Special Training
                                                </span>
                                                <p className="text-xs text-[#b85e1a]/70 dark:text-gray-400 mt-1">
                                                    Additional training required before operation
                                                </p>
                                            </div>
                                            <AcademicCapIcon className="w-5 h-5 text-[#2e8b57]" />
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
                                        rows={4}
                                        className={`${getInputClasses('notes')} resize-none`}
                                        placeholder="Any additional notes about training requirements, safety considerations, etc."
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#d4a574] dark:border-[#8b4513] bg-[#f5f1e6] dark:bg-gray-800">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] 
                                 bg-white dark:bg-gray-700 border border-[#d4a574] dark:border-[#8b4513]
                                 rounded-lg hover:bg-[#f5f1e6] dark:hover:bg-gray-600 
                                 transition-all duration-200"
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!newEquipment.name || !newEquipment.category || isSaving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-[#2e8b57] 
                                 rounded-lg hover:bg-[#1f6b41] transition-all duration-200 
                                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2
                                 shadow-md hover:shadow-lg"
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