"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    TruckIcon, WrenchScrewdriverIcon, CurrencyDollarIcon,
    AcademicCapIcon, ShieldCheckIcon, MapPinIcon, GlobeAltIcon,
    SparklesIcon, ClockIcon,
    DocumentTextIcon
} from "@heroicons/react/24/outline"
import FormModal from "@/src/shared/ui/FormModal"

interface AddEquipmentModalProps {
    onClose: () => void
    onSave: (data: any) => Promise<void>
    categories: any[]
}

export default function AddEquipmentModal({ onClose, onSave, categories }: AddEquipmentModalProps) {
    const [activeTab, setActiveTab] = useState<'basic' | 'purchase' | 'maintenance' | 'training'>('basic')
    const [isSaving, setIsSaving] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        name: "",
        type: "Machinery",
        category_id: "",
        status: "operational",
        hours_meter: 0,
        manufacturer: "",
        model: "",
        year: new Date().getFullYear(),
        serial_number: "",
        purchase_date: new Date().toISOString().split('T')[0],
        purchase_price_cents: 0,
        fuel_type: "gasoline",
        requires_license: false,
        required_license_type: "None",
        requires_training: false,
        location: "Phoenix Yard",
        service_zone_id: "",
        notes: "",
        vin: "",
        license_plate: "",
        gvwr: 0,
        axles: "2",
        tank_capacity: 0,
        blade_condition: "Good"
    })

    // Profile Completion Logic
    const calculateCompletion = () => {
        let score = 0
        if (formData.name) score += 25
        if (formData.category_id) score += 25
        if (formData.serial_number) score += 25
        if (formData.manufacturer) score += 25
        return score
    }

    const validateStep = () => {
        const newErrors: Record<string, string> = {}
        if (activeTab === 'basic') {
            if (!formData.name) newErrors.name = "Asset name is required"
            if (!formData.category_id) newErrors.category_id = "Category relation is required"
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!validateStep()) return
        const steps: typeof activeTab[] = ['basic', 'purchase', 'maintenance', 'training']
        const nextIdx = steps.indexOf(activeTab) + 1
        if (nextIdx < steps.length) setActiveTab(steps[nextIdx])
    }

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault()
        const steps: typeof activeTab[] = ['basic', 'purchase', 'maintenance', 'training']
        const prevIdx = steps.indexOf(activeTab) - 1
        if (prevIdx >= 0) setActiveTab(steps[prevIdx])
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateStep()) return
        setIsSaving(true)
        try {
            await onSave(formData)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <FormModal
            isOpen={true}
            onClose={onClose}
            title="Register New Fleet Asset"
            size="xl"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <button type="button" onClick={onClose} className="px-6 py-2 border-2 border-[#d4a574] rounded-xl font-bold text-[#8b4513] hover:bg-gray-50">
                        Cancel
                    </button>
                    {activeTab !== 'basic' && (
                        <button type="button" onClick={handleBack} className="px-6 py-2 border-2 border-[#d4a574] rounded-xl font-bold text-[#8b4513]">
                            Previous
                        </button>
                    )}
                    {activeTab !== 'training' ? (
                        <button type="button" onClick={handleNext} className="px-8 py-2 bg-[#d4a574] text-white rounded-xl font-bold shadow-lg hover:bg-[#b85e1a] transition-all">
                            Next Step
                        </button>
                    ) : (
                        <button type="submit" form="equipment-form" disabled={isSaving} className="px-12 py-2 bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] text-white rounded-xl font-bold shadow-xl disabled:opacity-50">
                            {isSaving ? "Processing..." : "Confirm & Save Asset"}
                        </button>
                    )}
                </div>
            }
        >
            {/* Completion Header */}
            <div className="mb-6 p-4 bg-[#f5f1e6] rounded-2xl border border-[#d4a574]/20">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-[#8b4513] uppercase tracking-[0.2em]">Asset Readiness Score</span>
                    <span className="text-sm font-black text-[#2e8b57]">{calculateCompletion()}%</span>
                </div>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#d4a574]/30 p-[2px]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${calculateCompletion()}%` }} className="h-full rounded-full bg-gradient-to-r from-[#2e8b57] to-[#4ade80]" />
                </div>
            </div>

            {/* Step Indicators */}
            <div className="flex border-b border-gray-100 mb-8 bg-gray-50/50 p-1 rounded-t-2xl overflow-x-auto no-scrollbar">
                {[
                    { id: 'basic', label: 'Basic Info', icon: DocumentTextIcon },
                    { id: 'purchase', label: 'Financials', icon: CurrencyDollarIcon },
                    { id: 'maintenance', label: 'Fleet Health', icon: WrenchScrewdriverIcon },
                    { id: 'training', label: 'Compliance', icon: AcademicCapIcon }
                ].map((step) => (
                    <button
                        key={step.id}
                        type="button"
                        onClick={() => setActiveTab(step.id as any)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-bold capitalize transition-all border-b-4 whitespace-nowrap ${activeTab === step.id ? 'border-[#2e8b57] text-[#2e8b57]' : 'border-transparent text-gray-400'
                            }`}
                    >
                        <step.icon className="w-4 h-4" />
                        {step.label}
                    </button>
                ))}
            </div>

            <form id="equipment-form" onSubmit={handleSubmit} className="space-y-8 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'basic' && (
                        <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#8b4513]">Equipment Name *</label>
                                    <div className="relative">
                                        <SparklesIcon className="absolute left-3 top-3.5 w-5 h-5 text-[#b85e1a]/40" />
                                        <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={`w-full pl-10 p-3.5 border-2 rounded-2xl bg-[#f5f1e6] focus:border-[#2e8b57] outline-none transition-all ${errors.name ? 'border-red-500' : 'border-[#d4a574]'}`} placeholder="e.g. John Deere Z735" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#8b4513]">Category (DB Relation) *</label>
                                    <select
                                        value={formData.category_id}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                                        className="w-full p-3.5 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6] outline-none text-[#8b4513]"
                                    >
                                        <option value="">Select Category...</option>
                                        {categories && categories.length > 0 ? (
                                            categories.map((c: any, idx: number) => {
                                                const val = typeof c === 'object' ? (c.id || c.name || idx) : c;
                                                const label = typeof c === 'object' ? (c.name || c.id || `Category ${idx}`) : c;
                                                return (
                                                    <option key={val} value={val}>
                                                        {label}
                                                    </option>
                                                );
                                            })
                                        ) : (
                                            <option disabled>Loading categories...</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Manufacturer</label>
                                    <input type="text" value={formData.manufacturer} onChange={e => setFormData({ ...formData, manufacturer: e.target.value })} className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Model</label>
                                    <input type="text" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Year</label>
                                    <input type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })} className="w-full p-3 border-2 border-[#d4a574] rounded-xl bg-[#f5f1e6]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#8b4513]">AZ Routing Zone</label>
                                    <div className="relative">
                                        <GlobeAltIcon className="absolute left-3 top-3.5 w-5 h-5 text-[#b85e1a]/40" />
                                        <select value={formData.service_zone_id} onChange={e => setFormData({ ...formData, service_zone_id: e.target.value })} className="w-full pl-10 p-3.5 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6] outline-none">
                                            <option value="">Global Service Area</option>
                                            <option value="scottsdale">Scottsdale / Paradise Valley</option>
                                            <option value="phoenix-north">North Phoenix</option>
                                            <option value="east-valley">East Valley (Mesa/Gilbert)</option>
                                            <option value="west-valley">West Valley (Glendale)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-[#8b4513]">Serial / Identification Number</label>
                                    <input type="text" value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} className="w-full p-3.5 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" placeholder="VIN or Serial #" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'purchase' && (
                        <motion.div key="purchase" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#b85e1a] uppercase">Purchase Date</label>
                                    <input type="date" value={formData.purchase_date} onChange={e => setFormData({ ...formData, purchase_date: e.target.value })} className="w-full p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-[#b85e1a] uppercase">Purchase Price (USD)</label>
                                    <div className="relative">
                                        <CurrencyDollarIcon className="absolute left-3 top-4 w-5 h-5 text-emerald-600" />
                                        <input type="number" step="0.01" onChange={e => setFormData({ ...formData, purchase_price_cents: Math.round(parseFloat(e.target.value) * 100) })} className="w-full pl-10 p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6] font-bold text-emerald-700" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <input placeholder="License Plate" value={formData.license_plate} onChange={e => setFormData({ ...formData, license_plate: e.target.value })} className="p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                                <input placeholder="Vehicle VIN" value={formData.vin} onChange={e => setFormData({ ...formData, vin: e.target.value })} className="p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Gross Vehicle Weight (GVWR)</label>
                                    <input type="number" value={formData.gvwr} onChange={e => setFormData({ ...formData, gvwr: parseFloat(e.target.value) })} className="w-full p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Number of Axles</label>
                                    <input type="text" value={formData.axles} onChange={e => setFormData({ ...formData, axles: e.target.value })} className="w-full p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'maintenance' && (
                        <motion.div key="maintenance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-5 bg-white rounded-3xl border border-[#d4a574]/30 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ClockIcon className="w-5 h-5 text-[#2e8b57]" />
                                        <label className="text-xs font-black text-[#b85e1a] uppercase tracking-wider">Initial Hours Meter</label>
                                    </div>
                                    <input type="number" value={formData.hours_meter} onChange={e => setFormData({ ...formData, hours_meter: parseInt(e.target.value) })} className="text-3xl font-black text-[#8b4513] outline-none w-full bg-transparent" />
                                </div>
                                <div className="p-5 bg-white rounded-3xl border border-[#d4a574]/30 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPinIcon className="w-5 h-5 text-emerald-600" />
                                        <label className="text-xs font-black text-[#b85e1a] uppercase tracking-wider">Storage Location</label>
                                    </div>
                                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="text-xl font-bold text-[#8b4513] outline-none w-full bg-transparent" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <select value={formData.fuel_type} onChange={e => setFormData({ ...formData, fuel_type: e.target.value })} className="p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6] font-bold">
                                    <option value="gasoline">Gasoline</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Battery / Electric</option>
                                </select>
                                <input placeholder="Blade / Edge Condition" value={formData.blade_condition} onChange={e => setFormData({ ...formData, blade_condition: e.target.value })} className="p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]" />
                            </div>
                            <textarea placeholder="General maintenance notes, engine quirks, or special instructions..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={4} className="w-full p-5 border-2 border-[#d4a574] rounded-3xl bg-[#f5f1e6] resize-none focus:border-[#2e8b57] outline-none" />
                        </motion.div>
                    )}

                    {activeTab === 'training' && (
                        <motion.div key="training" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                            <div className="p-6 bg-white rounded-3xl border-2 border-[#2e8b57] flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#2e8b57]"><ShieldCheckIcon className="w-8 h-8" /></div>
                                    <div>
                                        <p className="text-lg font-black text-[#8b4513]">Licensing Required?</p>
                                        <p className="text-xs text-gray-500">Enable if operator needs CDL or special certs</p>
                                    </div>
                                </div>
                                <input type="checkbox" checked={formData.requires_license} onChange={e => setFormData({ ...formData, requires_license: e.target.checked })} className="w-8 h-8 accent-[#2e8b57]" />
                            </div>
                            {formData.requires_license && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="space-y-2">
                                    <label className="text-sm font-bold text-[#8b4513]">Select License Type</label>
                                    <select value={formData.required_license_type} onChange={e => setFormData({ ...formData, required_license_type: e.target.value })} className="w-full p-4 border-2 border-[#d4a574] rounded-2xl bg-[#f5f1e6]">
                                        <option value="None">Class C (Standard)</option>
                                        <option value="CDL Class A">CDL Class A</option>
                                        <option value="Pesticide">Pesticide Applier</option>
                                    </select>
                                </motion.div>
                            )}
                            <div className="p-6 bg-white rounded-3xl border-2 border-[#d4a574] flex items-center justify-between shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#8b4513]"><AcademicCapIcon className="w-8 h-8" /></div>
                                    <div>
                                        <p className="text-lg font-black text-[#8b4513]">Hands-on Training?</p>
                                        <p className="text-xs text-gray-500">Requires internal safety demonstration</p>
                                    </div>
                                </div>
                                <input type="checkbox" checked={formData.requires_training} onChange={e => setFormData({ ...formData, requires_training: e.target.checked })} className="w-8 h-8 accent-[#8b4513]" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </FormModal>
    )
}