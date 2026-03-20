"use client"

import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal } from "@/src/shared/ui/Modal"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"
import { cn } from "@/src/lib/utils"
import {
  createEmployee,
  updateEmployee,
  getCurrentUserId
} from "@/src/services/employeeService"
import {
  UserIcon, EnvelopeIcon, PhoneIcon,
  BriefcaseIcon, DocumentTextIcon, MapPinIcon,
  ExclamationCircleIcon, CheckCircleIcon
} from "@heroicons/react/24/outline"

export default function EmployeeForm({ isOpen, onClose, onSuccess, employee }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "employment" | "additional">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    role: EmployeeRole.WORKER, status: EmployeeStatus.ACTIVE,
    department: "", hireDate: new Date().toISOString().split("T")[0],
    employeeNumber: "", emergencyContact: "", emergencyPhone: "",
    address: "", notes: "",
  })

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || EmployeeRole.WORKER,
        status: employee.status || EmployeeStatus.ACTIVE,
        department: employee.department || "",
        hireDate: employee.hireDate?.split('T')[0] || new Date().toISOString().split("T")[0],
        employeeNumber: employee.employeeNumber || "",
        emergencyContact: employee.emergencyContact || "",
        emergencyPhone: employee.emergencyPhone || "",
        address: employee.address || "",
        notes: employee.notes || "",
      })
    }
  }, [employee, isOpen])

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = "Invalid email format"
    if (formData.phone.length < 10) newErrors.phone = "Invalid phone number"
    if (!formData.hireDate) newErrors.hireDate = "Hire date is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      setActiveTab("basic")
      return
    }
    setIsSubmitting(true)
    try {
      if (employee) {
        await updateEmployee(employee.id, formData as any)
      } else {
        const creatorId = await getCurrentUserId()
        await createEmployee(formData as any, creatorId)
      }
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const completionPercentage = useCallback(() => {
    let score = 0
    if (formData.firstName && formData.lastName) score += 35
    if (formData.email && formData.phone) score += 35
    if (formData.hireDate && formData.role) score += 30
    return score
  }, [formData])()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={employee ? "Edit Team Member" : "Hire New Employee"}
        subtitle={employee ? `Updating profile for ${formData.firstName}` : "Onboard a new member to your landscaping crew"}
        progress={completionPercentage}
      />

      <Modal.Body>
        <div className="flex gap-2 mb-10 p-1.5 bg-[#f5f1e6] rounded-[1.25rem] border border-[#d4a574]/20 sticky top-0 z-30">
          {[
            { id: "basic", label: "Identity", icon: UserIcon },
            { id: "employment", label: "Position", icon: BriefcaseIcon },
            { id: "additional", label: "Details", icon: DocumentTextIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 py-3 rounded-[0.9rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                activeTab === tab.id ? "bg-[#2e8b57] text-white shadow-lg" : "text-[#8b4513]/50 hover:bg-white/50"
              )}
            >
              <tab.icon className="w-4 h-4 stroke-[2.5px]" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">First Name *</label>
                    <input className={cn("w-full px-5 py-4 rounded-2xl border-2 bg-white outline-none transition-all", errors.firstName ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Last Name *</label>
                    <input className={cn("w-full px-5 py-4 rounded-2xl border-2 bg-white outline-none transition-all", errors.lastName ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Email Address *</label>
                  <input className={cn("w-full px-5 py-4 rounded-2xl border-2 bg-white outline-none transition-all", errors.email ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Phone Number *</label>
                  <input className={cn("w-full px-5 py-4 rounded-2xl border-2 bg-white outline-none transition-all", errors.phone ? "border-red-500" : "border-[#d4a574]/20 focus:border-[#2e8b57]")} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </motion.div>
            )}

            {activeTab === "employment" && (
              <motion.div key="employment" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Role</label>
                    <select className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white outline-none focus:border-[#2e8b57] appearance-none" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}>
                      {Object.values(EmployeeRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Hire Date</label>
                    <input type="date" className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white outline-none focus:border-[#2e8b57]" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Department</label>
                  <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g. Irrigation" />
                </div>
              </motion.div>
            )}

            {activeTab === "additional" && (
              <motion.div key="additional" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Residential Address</label>
                  <textarea className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none min-h-[100px] resize-none" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street, City, State, ZIP" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Emergency Contact</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.emergencyContact} onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#8b4513]/60 ml-2">Emergency Phone</label>
                    <input className="w-full px-5 py-4 rounded-2xl border-2 border-[#d4a574]/20 bg-white focus:border-[#2e8b57] outline-none" value={formData.emergencyPhone} onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <button onClick={onClose} className="px-8 py-3 text-sm font-bold text-[#8b4513]/60 hover:text-[#8b4513]">Cancel</button>
        {activeTab !== "basic" && (
          <button onClick={() => setActiveTab(activeTab === "additional" ? "employment" : "basic")} className="px-8 py-3 text-sm font-bold text-[#8b4513] border-2 border-[#d4a574]/30 rounded-2xl hover:bg-[#f5f1e6]">Back</button>
        )}
        {activeTab !== "additional" ? (
          <button onClick={() => setActiveTab(activeTab === "basic" ? "employment" : "additional")} className="px-12 py-4 bg-[#d4a574] text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-xl hover:bg-[#b85e1a] transition-all">Next Step</button>
        ) : (
          <button onClick={handleSubmit} disabled={isSubmitting} className="px-12 py-4 bg-[#2e8b57] text-white rounded-[1.25rem] font-black uppercase tracking-widest shadow-xl hover:bg-[#1f6b41] transition-all disabled:opacity-50">
            {isSubmitting ? "Saving..." : employee ? "Save Changes" : "Confirm Hire"}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}