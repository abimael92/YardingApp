/**
 * Employee Form Component
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FormModal from "@/src/shared/ui/FormModal"
import { createEmployee, updateEmployee } from "@/src/services/employeeService"
import type { Employee } from "@/src/domain/entities"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"
import { getCurrentUserId } from "@/src/services/employeeService"

interface EmployeeFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  employee?: Employee | null
}

const roleColors = {
  [EmployeeRole.ADMIN]: "from-purple-500 to-purple-600",
  [EmployeeRole.SUPERVISOR]: "from-[#2e8b57] to-[#1f6b41]",
  [EmployeeRole.WORKER]: "from-[#b85e1a] to-[#8b4513]",
}

const statusColors = {
  [EmployeeStatus.ACTIVE]: "bg-[#2e8b57]",
  [EmployeeStatus.INACTIVE]: "bg-[#8b4513]",
  [EmployeeStatus.ON_LEAVE]: "bg-[#d88c4a]",
  [EmployeeStatus.TERMINATED]: "bg-red-600",
  [EmployeeStatus.PENDING]: "bg-[#d88c4a]",
}

export default function EmployeeForm({ isOpen, onClose, onSuccess, employee }: EmployeeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "employment" | "additional">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    phone: "",
    role: EmployeeRole.WORKER,
    status: EmployeeStatus.ACTIVE,
    department: "",
    hireDate: new Date().toISOString().split("T")[0],
    employeeNumber: "",
    emergencyContact: "",
    emergencyPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    notes: "",
  })

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        displayName: employee.displayName || "",
        email: employee.email || "",
        phone: employee.phone || "",
        role: employee.role || EmployeeRole.WORKER,
        status: employee.status || EmployeeStatus.ACTIVE,
        department: employee.department || "",
        hireDate: employee.hireDate ? employee.hireDate.split("T")[0] : new Date().toISOString().split("T")[0],
        employeeNumber: (employee as any).employeeNumber || "",
        emergencyContact: (employee as any).emergencyContact || "",
        emergencyPhone: (employee as any).emergencyPhone || "",
        address: (employee as any).address || "",
        city: (employee as any).city || "",
        state: (employee as any).state || "",
        zipCode: (employee as any).zipCode || "",
        notes: (employee as any).notes || "",
      })
    } else if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        displayName: "",
        email: "",
        phone: "",
        role: EmployeeRole.WORKER,
        status: EmployeeStatus.ACTIVE,
        department: "",
        hireDate: new Date().toISOString().split("T")[0],
        employeeNumber: "",
        emergencyContact: "",
        emergencyPhone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        notes: "",
      })
    }
  }, [employee, isOpen]);

  useEffect(() => {
    const generateEmployeeNumber = async () => {
      if (!employee && isOpen && !formData.employeeNumber) {
        try {
          // Use the service directly
          const { getAllEmployees } = await import('@/src/services/employeeService');
          const employees = await getAllEmployees();
          console.log('Employees:', employees); 

          // Find highest number
          let maxNum = 0;
          employees.forEach(emp => {
            if (emp.employeeNumber) {
              const num = parseInt(emp.employeeNumber.split('-')[1]);
              if (num > maxNum) maxNum = num;
            }
          });

          const nextNum = (maxNum + 1).toString().padStart(4, '0');
          setFormData(prev => ({ ...prev, employeeNumber: `EMP-${nextNum}` }));
        } catch (error) {
          setFormData(prev => ({ ...prev, employeeNumber: "EMP-0001" }));
        }
      }
    };

    generateEmployeeNumber();
  }, [employee, isOpen]);

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName": return !value.trim() ? "First name is required" : ""
      case "lastName": return !value.trim() ? "Last name is required" : ""
      case "email":
        if (!value.trim()) return "Email is required"
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : ""
      case "phone":
        if (!value.trim()) return "Phone is required"
        return !/^[\d\s-+()]{10,}$/.test(value) ? "Invalid phone number" : ""
      case "hireDate": return !value ? "Hire date is required" : ""
      default: return ""
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData] as string)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredFields = ["firstName", "lastName", "email", "phone", "hireDate"]
    const newErrors: Record<string, string> = {}

    requiredFields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData] as string)
      if (error) newErrors[field] = error
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const allTouched = requiredFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
      setTouched(prev => ({ ...prev, ...allTouched }))
      return
    }

    setIsSubmitting(true)

    try {
      const employeeData: Omit<Employee, "id" | "createdAt" | "updatedAt"> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: formData.displayName || `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        department: formData.department || undefined,
        hireDate: new Date(formData.hireDate).toISOString(),
        employeeNumber: formData.employeeNumber || undefined,
        availability: {
          monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
        },
        completedJobsCount: 0,
        totalHoursWorked: 0,
        assignedJobIds: [],
        supervisedJobIds: [],
        noteIds: [],
        activityLogIds: [],
        reminderIds: []
      }

      if (employee) {
        await updateEmployee(employee.id, employeeData)
      } else {
        const currentUserId = await getCurrentUserId()
        await createEmployee(employeeData, currentUserId)
      }

      onSuccess()
    } catch (error) {
      console.error("Failed to save employee:", error)
      alert("Failed to save employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const requiredFields = ["firstName", "lastName", "email", "phone", "hireDate"]
    return requiredFields.every(field => {
      const value = formData[field as keyof typeof formData] as string
      return value && value.trim() && !validateField(field, value)
    })
  }

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={employee ? "Edit Employee" : "Hire New Employee"}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-transparent border border-[#d4a574] dark:border-[#8b4513] rounded-lg hover:bg-[#d4a574]/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="employee-form"
            disabled={isSubmitting || !isFormValid()}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] rounded-lg disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : employee ? "Update" : "Hire"}
          </button>
        </div>
      }
    >
      {/* Custom Header - MOVED INSIDE */}
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${employee
            ? roleColors[formData.role as EmployeeRole] || "from-[#2e8b57] to-[#1f6b41]"
            : "from-[#2e8b57] to-[#1f6b41]"
          } flex items-center justify-center text-white font-bold`}>
          {employee
            ? `${formData.firstName[0] || ""}${formData.lastName[0] || ""}`.toUpperCase()
            : "+"
          }
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            {employee ? "Edit Employee" : "Hire New Employee"}
          </h2>
          <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">
            {employee
              ? `Editing ${formData.firstName} ${formData.lastName}`
              : "Add a new team member to your workforce"
            }
          </p>
        </div>
      </div>

      {employee && (
        <div className="mb-6 flex items-center justify-between p-4 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-lg border border-[#d4a574]/30">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${statusColors[formData.status as EmployeeStatus]}`} />
            <span className="text-sm text-[#8b4513] dark:text-[#d4a574]">
              #{formData.employeeNumber || "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#b85e1a]/70">Joined:</span>
            <span className="text-sm text-[#2e8b57]">
              {new Date(formData.hireDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4">
        {[
          { id: "basic", label: "Basic Info" },
          { id: "employment", label: "Employment" },
          { id: "additional", label: "Additional" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium
              ${activeTab === tab.id
                ? "bg-[#2e8b57] text-white"
                : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form id="employee-form" onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === "basic" && (
            <motion.div
              key="basic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                    onBlur={() => handleBlur("firstName")}
                    className={`w-full px-3 py-2 border ${touched.firstName && errors.firstName ? "border-red-500" : "border-[#d4a574]"} rounded-lg bg-[#f5f1e6]`}
                  />
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    className={`w-full px-3 py-2 border ${touched.lastName && errors.lastName ? "border-red-500" : "border-[#d4a574]"} rounded-lg bg-[#f5f1e6]`}
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-3 py-2 border ${touched.email && errors.email ? "border-red-500" : "border-[#d4a574]"} rounded-lg bg-[#f5f1e6]`}
                />
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  onBlur={() => handleBlur("phone")}
                  className={`w-full px-3 py-2 border ${touched.phone && errors.phone ? "border-red-500" : "border-[#d4a574]"} rounded-lg bg-[#f5f1e6]`}
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "employment" && (
            <motion.div
              key="employment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleChange("role", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  >
                    {Object.values(EmployeeRole).map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  >
                    {Object.values(EmployeeStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Hire Date *</label>
                  <input
                    type="date"
                    value={formData.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                    onBlur={() => handleBlur("hireDate")}
                    className={`w-full px-3 py-2 border ${touched.hireDate && errors.hireDate ? "border-red-500" : "border-[#d4a574]"} rounded-lg bg-[#f5f1e6]`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Employee #</label>
                  <input
                    type="text"
                    value={formData.employeeNumber}
                    onChange={(e) => handleChange("employeeNumber", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "additional" && (
            <motion.div
              key="additional"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Emergency Phone</label>
                  <input
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-[#f5f1e6]"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </FormModal>
  )
}