"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowLeftIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    FunnelIcon,
    MapPinIcon,
    DocumentTextIcon,
    PhotoIcon,
    XMarkIcon
} from "@heroicons/react/24/outline"
import Breadcrumbs from "@/src/shared/ui/Breadcrumbs"
import LoadingState from "@/src/shared/ui/LoadingState"

interface EquipmentFormData {
    name: string
    type: string
    model: string
    manufacturer: string
    year: number
    serialNumber: string
    licensePlate: string
    vin: string
    status: 'operational' | 'maintenance' | 'repair' | 'idle' | 'retired'
    condition: 'excellent' | 'good' | 'fair' | 'poor'
    hours: number
    fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid' | 'propane'
    fuelCapacity: number
    location: string
    yardLocation: string
    department: string
    purchaseDate: string
    purchasePrice: number
    lastService: string
    nextMaintenance: string
    notes: string
}

export default function EquipmentFormPage() {
    const router = useRouter()
    const params = useParams()
    const isEdit = params?.id ? true : false
    const [loading, setLoading] = useState(isEdit)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState<EquipmentFormData>({
        name: '',
        type: '',
        model: '',
        manufacturer: '',
        year: new Date().getFullYear(),
        serialNumber: '',
        licensePlate: '',
        vin: '',
        status: 'operational',
        condition: 'good',
        hours: 0,
        fuelType: 'diesel',
        fuelCapacity: 0,
        location: '',
        yardLocation: '',
        department: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: 0,
        lastService: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date().toISOString().split('T')[0],
        notes: ''
    })

    useEffect(() => {
        if (isEdit) {
            // Fetch equipment data for editing
            const fetchEquipment = async () => {
                try {
                    // Replace with your actual API call
                    await new Promise(resolve => setTimeout(resolve, 500))
                    // Mock data - replace with real data
                    setFormData({
                        name: "CAT 262D Skid Steer",
                        type: "Skid Steer Loader",
                        model: "262D",
                        manufacturer: "Caterpillar",
                        year: 2022,
                        serialNumber: "CAT262D2022001",
                        licensePlate: "XYZ-1234",
                        vin: "1G6KD57Y45U123456",
                        status: "operational",
                        condition: "excellent",
                        hours: 1245,
                        fuelType: "diesel",
                        fuelCapacity: 24,
                        location: "North Yard",
                        yardLocation: "Aisle 3, Bay 7",
                        department: "Construction",
                        purchaseDate: "2022-03-15",
                        purchasePrice: 65000,
                        lastService: "2024-01-15",
                        nextMaintenance: "2024-03-15",
                        notes: "Regular maintenance performed. Machine runs smoothly."
                    })
                } catch (error) {
                    console.error("Failed to load equipment:", error)
                } finally {
                    setLoading(false)
                }
            }
            fetchEquipment()
        }
    }, [isEdit])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Replace with your actual API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            router.push('/admin/equipment')
        } catch (error) {
            console.error("Failed to save equipment:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value
        }))
    }

    if (loading) {
        return <LoadingState message="Loading equipment data..." />
    }

    return (
        <div className="max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <div>
                    <Breadcrumbs />
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {isEdit ? 'Update equipment information' : 'Enter the details of the new equipment'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Equipment Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., CAT 262D Skid Steer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Equipment Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select type</option>
                                <option value="Skid Steer Loader">Skid Steer Loader</option>
                                <option value="Excavator">Excavator</option>
                                <option value="Bulldozer">Bulldozer</option>
                                <option value="Backhoe">Backhoe</option>
                                <option value="Wheel Loader">Wheel Loader</option>
                                <option value="Forklift">Forklift</option>
                                <option value="Dump Truck">Dump Truck</option>
                                <option value="Generator">Generator</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Manufacturer *
                            </label>
                            <select
                                name="manufacturer"
                                value={formData.manufacturer}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select manufacturer</option>
                                <option value="Caterpillar">Caterpillar</option>
                                <option value="John Deere">John Deere</option>
                                <option value="Komatsu">Komatsu</option>
                                <option value="Bobcat">Bobcat</option>
                                <option value="JCB">JCB</option>
                                <option value="Case">Case</option>
                                <option value="Volvo">Volvo</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Model *
                            </label>
                            <input
                                type="text"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., 262D"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Year *
                            </label>
                            <input
                                type="number"
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                required
                                min="1900"
                                max={new Date().getFullYear() + 1}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Serial Number *
                            </label>
                            <input
                                type="text"
                                name="serialNumber"
                                value={formData.serialNumber}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Enter serial number"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                License Plate
                            </label>
                            <input
                                type="text"
                                name="licensePlate"
                                value={formData.licensePlate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., XYZ-1234"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                VIN
                            </label>
                            <input
                                type="text"
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                maxLength={17}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="17-character VIN"
                            />
                        </div>
                    </div>
                </div>

                {/* Status & Usage */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Status & Usage</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status *
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="operational">Operational</option>
                                <option value="maintenance">In Maintenance</option>
                                <option value="repair">Needs Repair</option>
                                <option value="idle">Idle</option>
                                <option value="retired">Retired</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Condition *
                            </label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="excellent">Excellent</option>
                                <option value="good">Good</option>
                                <option value="fair">Fair</option>
                                <option value="poor">Poor</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hours *
                            </label>
                            <input
                                type="number"
                                name="hours"
                                value={formData.hours}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Fuel Information */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fuel Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fuel Type *
                            </label>
                            <select
                                name="fuelType"
                                value={formData.fuelType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="diesel">Diesel</option>
                                <option value="gasoline">Gasoline</option>
                                <option value="electric">Electric</option>
                                <option value="hybrid">Hybrid</option>
                                <option value="propane">Propane</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fuel Capacity (gallons)
                            </label>
                            <input
                                type="number"
                                name="fuelCapacity"
                                value={formData.fuelCapacity}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Location & Department</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., North Yard"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Yard Location
                            </label>
                            <input
                                type="text"
                                name="yardLocation"
                                value={formData.yardLocation}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="e.g., Aisle 3, Bay 7"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Department *
                            </label>
                            <select
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Select department</option>
                                <option value="Construction">Construction</option>
                                <option value="Landscaping">Landscaping</option>
                                <option value="Excavation">Excavation</option>
                                <option value="Demolition">Demolition</option>
                                <option value="Transportation">Transportation</option>
                                <option value="Facilities">Facilities</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Financial */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Financial Information</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Purchase Date *
                            </label>
                            <input
                                type="date"
                                name="purchaseDate"
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Purchase Price ($) *
                            </label>
                            <input
                                type="number"
                                name="purchasePrice"
                                value={formData.purchasePrice}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Maintenance */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Maintenance</h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Service *
                            </label>
                            <input
                                type="date"
                                name="lastService"
                                value={formData.lastService}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Next Maintenance *
                            </label>
                            <input
                                type="date"
                                name="nextMaintenance"
                                value={formData.nextMaintenance}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Notes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
                    </div>
                    <div className="p-6">
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                     focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Any additional notes about the equipment..."
                        />
                    </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 
                                 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed
                                 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEdit ? 'Update Equipment' : 'Add Equipment'
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}