"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FormModal from "@/src/shared/ui/FormModal"
import { equipmentService } from "@/src/services/equipmentService"
import {
    TruckIcon,
    CurrencyDollarIcon,
    MapPinIcon,
    TagIcon,
    DocumentTextIcon,
    XCircleIcon,
    ChevronDownIcon,
    ClipboardDocumentCheckIcon,
    ShieldCheckIcon,
    BoltIcon,
    Cog6ToothIcon
} from "@heroicons/react/24/outline"

interface EquipmentFormProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    equipment?: any | null
    categories: any[]
}

const FUEL_TYPES = ["gasoline", "diesel", "electric", "battery", "propane", "manual"]
const LICENSE_TYPES = ["Driver's License", "CDL Class A", "CDL Class B", "Chainsaw Cert", "Forklift Cert", "None"]

const EquipmentForm = ({
    isOpen,
    onClose,
    onSuccess,
    equipment,
    categories = []
}: EquipmentFormProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState<"basic" | "technical" | "admin">("basic")
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const [formData, setFormData] = useState({
        name: "",
        type: "Machinery",
        category_id: "",
        status: "available",
        manufacturer: "",
        model: "",
        year: new Date().getFullYear(),
        serial_number: "",
        plate_number: "",
        identification_number: "",
        purchase_date: "",
        purchase_price_cents: 0,
        purchase_price_dollars: "", // UI-only field for decimal input
        current_value_cents: 0,
        condition: "Good",
        location: "Phoenix Yard",
        storage_location: "",
        hourly_rate_cents: 0,
        daily_rate_cents: 0,
        weekly_rate_cents: 0,
        fuel_type: "gasoline",
        hours_meter: 0,
        last_maintenance_date: "",
        next_maintenance_date: "",
        maintenance_interval_hours: 250,
        warranty_expiration: "",
        insurance_expiration: "",
        requires_license: false,
        required_license_type: "",
        requires_training: false,
        notes: "",
        current_crew_id: null,
        current_job_id: null
    })

    // Sync form data when equipment prop changes (Edit Mode)
    useEffect(() => {
        if (equipment && isOpen) {
            setFormData({
                ...equipment,
                purchase_price_dollars: equipment.purchase_price_cents ? (equipment.purchase_price_cents / 100).toFixed(2) : ""
            })
        } else if (!equipment && isOpen) {
            // Reset for New Mode
            setFormData({
                name: "",
                type: "Machinery",
                category_id: "",
                status: "available",
                manufacturer: "",
                model: "",
                year: new Date().getFullYear(),
                serial_number: "",
                plate_number: "",
                identification_number: "",
                purchase_date: "",
                purchase_price_cents: 0,
                purchase_price_dollars: "",
                current_value_cents: 0,
                condition: "Good",
                location: "Phoenix Yard",
                storage_location: "",
                hourly_rate_cents: 0,
                daily_rate_cents: 0,
                weekly_rate_cents: 0,
                fuel_type: "gasoline",
                hours_meter: 0,
                last_maintenance_date: "",
                next_maintenance_date: "",
                maintenance_interval_hours: 250,
                warranty_expiration: "",
                insurance_expiration: "",
                requires_license: false,
                required_license_type: "",
                requires_training: false,
                notes: "",
                current_crew_id: null,
                current_job_id: null
            })
            setActiveTab("basic")
            setErrors({})
            setTouched({})
        }
    }, [equipment, isOpen])

    const calculateCompletion = useCallback(() => {
        let completed = 0
        if (formData.name) completed += 20
        if (formData.category_id) completed += 20
        if (formData.status) completed += 20
        if (formData.serial_number) completed += 20
        if (formData.location) completed += 20
        return completed
    }, [formData])

    const validateField = (name: string, value: any) => {
        switch (name) {
            case "name": return !value ? "Asset name is required" : ""
            case "category_id": return !value ? "Category is required" : ""
            case "serial_number": return !value ? "Serial Number is required" : ""
            default: return ""
        }
    }

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }))
        setErrors(prev => ({ ...prev, [field]: validateField(field, (formData as any)[field]) }))
    }

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Final validation check
        const nameError = validateField("name", formData.name)
        const catError = validateField("category_id", formData.category_id)
        if (nameError || catError) {
            setErrors({ name: nameError, category_id: catError })
            setActiveTab("basic")
            return
        }

        setIsSubmitting(true)
        try {
            // Clean data before submission (Cents conversion already handled in onChange)
            const submissionData = {
                ...formData,
                required_license_type: formData.requires_license ? formData.required_license_type : null
            }

            if (equipment) {
                await equipmentService.update(equipment.id, submissionData)
            } else {
                await equipmentService.create(submissionData)
            }
            onSuccess()
        } catch (err) {
            console.error(err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const completion = calculateCompletion()

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={equipment ? "Edit Equipment" : "Add Fleet Asset"}
            size="lg"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-[#8b4513] border border-[#d4a574] rounded-lg hover:bg-[#d4a574]/10">
                        Cancel
                    </button>
                    {activeTab !== "admin" ? (
                        <button
                            type="button"
                            onClick={() => setActiveTab(activeTab === "basic" ? "technical" : "admin")}
                            className="px-6 py-2 text-white bg-[#d4a574] hover:bg-[#b85e1a] rounded-lg font-bold"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="equip-form"
                            disabled={isSubmitting}
                            className="px-8 py-2 text-white bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] rounded-lg font-bold shadow-lg disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : equipment ? "Update Asset" : "Register Asset"}
                        </button>
                    )}
                </div>
            }
        >
            {/* Form Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2e8b57] to-[#1f6b41] flex items-center justify-center text-white shadow-md">
                    <TruckIcon className="w-7 h-7" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#8b4513]">Asset Configuration</h2>
                    <p className="text-sm text-[#b85e1a]/70">Arizona Fleet Database Management</p>
                </div>
            </div>

            {/* Progress Tracker */}
            <div className="space-y-2 mb-8">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#8b4513]">Integrity Score</span>
                    <span className="text-sm font-black text-[#2e8b57]">{completion}%</span>
                </div>
                <div className="w-full h-3 bg-[#d4a574]/20 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${completion}%` }} className="h-full bg-[#2e8b57]" />
                </div>
            </div>

            {/* Step Navigation */}
            <div className="flex gap-2 mb-8 border-b border-[#d4a574]/30 pb-4">
                {[
                    { id: "basic", label: "General", icon: TagIcon },
                    { id: "technical", label: "Specs", icon: Cog6ToothIcon },
                    { id: "admin", label: "Financials", icon: ClipboardDocumentCheckIcon },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                            ${activeTab === tab.id ? "bg-[#2e8b57] text-white shadow-lg" : "text-[#8b4513] hover:bg-[#d4a574]/20"}`}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <form id="equip-form" onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                    {activeTab === "basic" && (
                        <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Asset Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange("name", e.target.value)}
                                        onBlur={() => handleBlur("name")}
                                        className={`w-full p-3 border-2 rounded-xl bg-[#f5f1e6] outline-none transition-all
                                            ${touched.name && errors.name ? "border-red-500" : "border-[#d4a574]"}`}
                                        placeholder="e.g., JD 333G Compact Track Loader"
                                    />
                                    {touched.name && errors.name && <p className="text-xs text-red-500 font-bold mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Category *</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={(e) => handleChange("category_id", e.target.value)}
                                        onBlur={() => handleBlur("category_id")}
                                        className={`w-full p-3 border-2 rounded-xl bg-[#f5f1e6] outline-none
                                            ${touched.category_id && errors.category_id ? "border-red-500" : "border-[#d4a574]"}`}
                                    >
                                        <option value="">Select Category</option>
                                        {categories?.map((c: any) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Current Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleChange("status", e.target.value)}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    >
                                        <option value="available">Available</option>
                                        <option value="operational">Operational</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="repair">Needs Repair</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Manufacturer</label>
                                    <input
                                        type="text"
                                        value={formData.manufacturer}
                                        onChange={(e) => handleChange("manufacturer", e.target.value)}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Model Number</label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => handleChange("model", e.target.value)}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "technical" && (
                        <motion.div key="tech" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Serial Number / VIN *</label>
                                    <input
                                        type="text"
                                        value={formData.serial_number}
                                        onChange={(e) => handleChange("serial_number", e.target.value)}
                                        onBlur={() => handleBlur("serial_number")}
                                        className={`w-full p-3 border-2 rounded-xl bg-[#f5f1e6]
                                            ${touched.serial_number && errors.serial_number ? "border-red-500" : "border-[#d4a574]"}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Hours Meter</label>
                                    <div className="relative">
                                        <BoltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e8b57]" />
                                        <input
                                            type="number"
                                            value={formData.hours_meter}
                                            onChange={(e) => handleChange("hours_meter", Number(e.target.value))}
                                            className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 p-4 bg-[#2e8b57]/5 border-2 border-[#2e8b57]/20 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheckIcon className="w-6 h-6 text-[#2e8b57]" />
                                        <div>
                                            <p className="text-sm font-bold text-[#8b4513]">License/Cert Required</p>
                                            <p className="text-xs text-[#b85e1a]">Requires CDL or Operator Certification</p>
                                        </div>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.requires_license}
                                        onChange={(e) => handleChange("requires_license", e.target.checked)}
                                        className="w-6 h-6 rounded border-[#d4a574] text-[#2e8b57]"
                                    />
                                </div>

                                {formData.requires_license && (
                                    <div className="col-span-2">
                                        <label className="block text-sm font-bold text-[#8b4513] mb-1">Required License Type</label>
                                        <select
                                            value={formData.required_license_type}
                                            onChange={(e) => handleChange("required_license_type", e.target.value)}
                                            className="w-full p-3 border-2 border-[#2e8b57] rounded-xl bg-white"
                                        >
                                            <option value="">Select License...</option>
                                            {LICENSE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Fuel Type</label>
                                    <select
                                        value={formData.fuel_type}
                                        onChange={(e) => handleChange("fuel_type", e.target.value)}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    >
                                        {FUEL_TYPES.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Maint. Interval (Hours)</label>
                                    <input
                                        type="number"
                                        value={formData.maintenance_interval_hours}
                                        onChange={(e) => handleChange("maintenance_interval_hours", Number(e.target.value))}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "admin" && (
                        <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Purchase Date</label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => handleChange("purchase_date", e.target.value)}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Purchase Price ($)</label>
                                    <div className="relative">
                                        <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b4513]" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.purchase_price_dollars}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    purchase_price_dollars: val,
                                                    purchase_price_cents: Math.round(Number(val) * 100)
                                                }));
                                            }}
                                            className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Storage / Yard Location</label>
                                    <div className="relative">
                                        <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2e8b57]" />
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => handleChange("location", e.target.value)}
                                            className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]"
                                            placeholder="e.g., North Yard - Section A"
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-[#8b4513] mb-1">Special Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleChange("notes", e.target.value)}
                                        rows={4}
                                        className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6] resize-none"
                                        placeholder="Add maintenance history notes or unique asset details..."
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </FormModal>
    )
}

export default EquipmentForm