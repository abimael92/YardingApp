"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal } from "@/src/shared/ui/Modal"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"
import { cn } from "@/src/lib/utils"
import { createEmployee, updateEmployee, getCurrentUserId } from "@/src/services/employeeService"
import {
  UserIcon, EnvelopeIcon, PhoneIcon, BriefcaseIcon,
  DocumentTextIcon, MapPinIcon, IdentificationIcon,
  BuildingOfficeIcon, CalendarIcon, CurrencyDollarIcon, AcademicCapIcon
} from "@heroicons/react/24/outline"

export default function EmployeeForm({ isOpen, onClose, onSuccess, employee }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "employment" | "additional">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    role: "worker", status: "active",
    department: "", hireDate: new Date().toISOString().split("T")[0],
    employeeNumber: "", hourlyRate: "", emergencyContact: "", emergencyPhone: "",
    address: "", city: "", state: "", zip: "", notes: "", certifications: "",
  })

  useEffect(() => {
    if (employee && isOpen) {
      // Safely handle date parsing whether it's a string, Date object, or undefined
      let safeDate = formData.hireDate;
      if (employee.hireDate) {
        try {
          safeDate = new Date(employee.hireDate).toISOString().split("T")[0];
        } catch (e) {
          // Keep default if parsing fails
        }
      }

      // Safely handle certifications whether it's an array, string, or undefined
      let safeCerts = "";
      if (Array.isArray(employee.certifications)) {
        safeCerts = employee.certifications.join(", ");
      } else if (typeof employee.certifications === "string") {
        safeCerts = employee.certifications;
      }

      setFormData(prev => ({
        ...prev,
        ...employee,
        hireDate: safeDate,
        hourlyRate: employee.hourlyRate ? String(employee.hourlyRate) : "",
        certifications: safeCerts,
      }))
    }
  }, [employee, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "Required"
    if (!formData.lastName.trim()) newErrors.lastName = "Required"
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email"
    if (!formData.hireDate) newErrors.hireDate = "Required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setIsSubmitting(true)
    try {
      // Clean up the payload to match DB expectations
      const payload = {
        ...formData,
        hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
        certifications: formData.certifications
          ? formData.certifications.split(',').map(c => c.trim()).filter(Boolean)
          : []
      }

      if (employee) {
        await updateEmployee(employee.id, payload as any)
      } else {
        const creatorId = await getCurrentUserId()
        await createEmployee(payload as any, creatorId)
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completion = useCallback(() => {
    let score = 0
    if (formData.firstName && formData.lastName) score += 35
    if (formData.role && formData.hireDate) score += 35
    if (formData.address && formData.emergencyContact) score += 30
    return score
  }, [formData])()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={employee ? "Edit Team Member" : "Hire New Employee"}
        subtitle="Complete the steps to update your workforce"
        progress={completion}
      />

      <Modal.Body>
        {/* Step Banner */}
        <div className="mb-4 p-2 rounded-xl border bg-[#f0f9f4] border-[#2e8b57]/20 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#2e8b57] flex items-center justify-center text-white font-bold text-sm">
            {activeTab === 'basic' ? '1' : activeTab === 'employment' ? '2' : '3'}
          </div>
          <p className="text-sm font-bold text-[#5d4037]">
            {activeTab === 'basic' && "Next: Employment details"}
            {activeTab === 'employment' && "Next: Additional information"}
            {activeTab === 'additional' && "Ready to hire!"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 p-1 bg-[#f5f1e6] rounded-xl border border-[#d4a574]/20 sticky top-0 z-30">
          {[
            { id: "basic", label: "Basic Info", icon: UserIcon },
            { id: "employment", label: "Employment", icon: BriefcaseIcon },
            { id: "additional", label: "Additional", icon: DocumentTextIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                activeTab === tab.id ? "bg-[#2e8b57] text-white shadow-md" : "text-[#8b4513]/60 hover:bg-white/40"
              )}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <form className="space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: BASIC INFO */}
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">First Name *</label>
                    <input className={cn("w-full px-4 py-3 rounded-xl border-2 bg-white outline-none transition-all", errors.firstName ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Last Name *</label>
                    <input className={cn("w-full px-4 py-3 rounded-xl border-2 bg-white outline-none transition-all", errors.lastName ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Email Address *</label>
                  <input className={cn("w-full px-4 py-3 rounded-xl border-2 bg-white outline-none transition-all", errors.email ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="john.doe@example.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Phone Number</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                    <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 bg-white outline-none focus:border-[#2e8b57]" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(555) 123-4567" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: EMPLOYMENT */}
            {activeTab === "employment" && (
              <motion.div key="employment" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Role</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                      <option value="worker">worker</option>
                      <option value="supervisor">supervisor</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Status</label>
                    <select className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="active">active</option>
                      <option value="pending">pending</option>
                      <option value="inactive">inactive</option>
                      <option value="terminated">terminated</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Hire Date *</label>
                  <div className="relative">
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8b4513]" />
                    <input type="date" className={cn("w-full px-4 py-3 rounded-xl border-2 bg-white outline-none focus:border-[#2e8b57]", errors.hireDate ? "border-red-500" : "border-[#d4a574]/20")} value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Department</label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                      <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Operations" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Employee #</label>
                    <div className="relative">
                      <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                      <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.employeeNumber} onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })} placeholder="EMP-0001" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Hourly Rate ($)</label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                    <input type="number" step="0.01" className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} placeholder="25.00" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: ADDITIONAL */}
            {activeTab === "additional" && (
              <motion.div key="additional" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Emergency Contact</label>
                    <input className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} placeholder="Full name" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-[#8b4513]">Emergency Phone</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                      <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} placeholder="(555) 123-4567" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Address</label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                    <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input className="col-span-1 w-full px-3 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" />
                  <input className="col-span-1 w-full px-3 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" />
                  <input className="col-span-1 w-full px-3 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} placeholder="ZIP" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-[#8b4513]">Certifications</label>
                  <div className="relative">
                    <AcademicCapIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4a574]" />
                    <input className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57]" value={formData.certifications} onChange={(e) => setFormData({ ...formData, certifications: e.target.value })} placeholder="e.g. OSHA, CPR (comma separated)" />
                  </div>
                </div>
                <textarea className="w-full px-4 py-3 rounded-xl border-2 border-[#d4a574]/20 outline-none focus:border-[#2e8b57] min-h-[100px] resize-none" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes..." />
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        <p className="mt-4 text-center text-[10px] text-[#b85e1a]/60">Press <span className="px-1.5 py-0.5 rounded border border-[#d4a574]/40 bg-white">Tab</span> to navigate fields</p>
      </Modal.Body>

      <Modal.Footer>
        <button onClick={onClose} className="px-6 py-2 text-sm font-bold text-[#8b4513]/60 hover:text-[#8b4513]">Cancel</button>
        {activeTab !== "basic" && (
          <button onClick={() => setActiveTab(activeTab === "additional" ? "employment" : "basic")} className="px-6 py-2 text-sm font-bold text-[#8b4513] border border-[#d4a574]/30 rounded-xl">Back</button>
        )}
        <button
          onClick={activeTab === "additional" ? handleSubmit : () => setActiveTab(activeTab === "basic" ? "employment" : "additional")}
          className={cn("px-10 py-3 text-white rounded-xl font-bold shadow-xl transition-all", activeTab === "additional" ? "bg-[#2e8b57]" : "bg-[#8b4513]")}
        >
          {activeTab === "additional" ? (isSubmitting ? "Saving..." : "Confirm Hire") : "Next Step"}
        </button>
      </Modal.Footer>
    </Modal>
  )
}