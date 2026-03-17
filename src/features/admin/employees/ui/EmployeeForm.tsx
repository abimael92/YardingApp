/**
 * Employee Form Component
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FormModal from "@/src/shared/ui/FormModal"
import { createEmployee, updateEmployee } from "@/src/services/employeeService"
import type { Employee } from "@/src/domain/entities"
import { EmployeeRole, EmployeeStatus } from "@/src/domain/entities"
import { getCurrentUserId } from "@/src/services/employeeService"
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  UserGroupIcon,
  MapPinIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline"

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
          const { getAllEmployees } = await import('@/src/services/employeeService');
          const employees = await getAllEmployees();

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

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let total = 0
    let completed = 0

    // Basic Info (35%)
    total += 35
    if (formData.firstName.trim()) completed += 10
    if (formData.lastName.trim()) completed += 10
    if (formData.email.trim()) completed += 10
    if (formData.phone.trim()) completed += 5

    // Employment Details (35%)
    total += 35
    if (formData.employeeNumber) completed += 10
    if (formData.role) completed += 5
    if (formData.status) completed += 5
    if (formData.hireDate) completed += 10
    if (formData.department) completed += 5

    // Additional Info (30%)
    total += 30
    if (formData.emergencyContact || formData.emergencyPhone) completed += 10
    if (formData.address || formData.city || formData.state || formData.zipCode) completed += 10
    if (formData.notes) completed += 10

    return Math.min(100, Math.round((completed / total) * 100))
  }, [formData])

  const completionPercentage = calculateCompletion()

  // Validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "First name is required"
        if (value.trim().length < 2) return "First name must be at least 2 characters"
        return ""
      case "lastName":
        if (!value.trim()) return "Last name is required"
        if (value.trim().length < 2) return "Last name must be at least 2 characters"
        return ""
      case "email":
        if (!value.trim()) return "Email is required"
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : ""
      case "phone":
        if (!value.trim()) return "Phone is required"
        return !/^[\d\s-+()]{10,}$/.test(value) ? "Invalid phone number" : ""
      case "hireDate":
        return !value ? "Hire date is required" : ""
      case "emergencyPhone":
        if (value && !/^[\d\s-+()]{10,}$/.test(value)) return "Invalid phone number"
        return ""
      case "zipCode":
        if (value && !/^\d{5}(-\d{4})?$/.test(value)) return "Invalid ZIP code"
        return ""
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

  const handleNextStep = () => {
    const tabs = ['basic', 'employment', 'additional'] as const
    const currentIndex = tabs.indexOf(activeTab)

    // Validate current tab before moving
    if (activeTab === 'basic') {
      const basicFields = ['firstName', 'lastName', 'email', 'phone']
      const hasErrors = basicFields.some(field => {
        const error = validateField(field, formData[field as keyof typeof formData] as string)
        if (error) {
          setTouched(prev => ({ ...prev, [field]: true }))
          setErrors(prev => ({ ...prev, [field]: error }))
          return true
        }
        return false
      })
      if (hasErrors) return
    }

    if (activeTab === 'employment') {
      const employmentFields = ['hireDate']
      const hasErrors = employmentFields.some(field => {
        const error = validateField(field, formData[field as keyof typeof formData] as string)
        if (error) {
          setTouched(prev => ({ ...prev, [field]: true }))
          setErrors(prev => ({ ...prev, [field]: error }))
          return true
        }
        return false
      })
      if (hasErrors) return
    }

    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePrevStep = () => {
    const tabs = ['basic', 'employment', 'additional'] as const
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
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
      setActiveTab('basic')
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

  // Get progress color
  const getProgressColor = () => {
    if (completionPercentage === 100) return 'bg-[#2e8b57]'
    if (completionPercentage >= 70) return 'bg-[#2e8b57]'
    if (completionPercentage >= 40) return 'bg-[#d88c4a]'
    return 'bg-[#b85e1a]'
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

          {/* Previous Step Button */}
          {activeTab !== 'basic' && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-4 py-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-transparent border border-[#d4a574] dark:border-[#8b4513] rounded-lg hover:bg-[#d4a574]/10"
            >
              Previous
            </button>
          )}

          {/* Next Step Button */}
          {activeTab !== 'additional' ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-4 py-2 text-sm font-medium text-white bg-[#d4a574] hover:bg-[#b85e1a] rounded-lg"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              form="employee-form"
              disabled={isSubmitting || !isFormValid()}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : employee ? "Update" : "Hire"}
            </button>
          )}
        </div>
      }
    >
      {/* Custom Header */}
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

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-[#8b4513] dark:text-[#d4a574]">
            Form Completion
          </span>
          <span className="text-sm font-bold text-[#2e8b57] dark:text-[#4a7c5c]">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-[#d4a574]/30 dark:bg-[#8b4513]/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full ${getProgressColor()}`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-[#b85e1a]/60 dark:text-gray-500">
          <span>Basic (35%)</span>
          <span>Employment (35%)</span>
          <span>Additional (30%)</span>
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

      {/* Tabs with indicators */}
      <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4">
        {[
          { id: "basic", label: "Basic Info", icon: UserIcon },
          { id: "employment", label: "Employment", icon: BriefcaseIcon },
          { id: "additional", label: "Additional", icon: DocumentTextIcon },
        ].map((tab) => {
          const Icon = tab.icon
          const hasError = tab.id === 'basic' && (errors.firstName || errors.lastName || errors.email || errors.phone)

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2
                ${activeTab === tab.id
                  ? "bg-[#2e8b57] text-white"
                  : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
                }
                ${hasError ? 'border border-red-500' : ''}
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {hasError && <XCircleIcon className="w-3 h-3 text-red-500" />}
              {activeTab === tab.id && completionPercentage > 0 && (
                <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                  {tab.id === 'basic' ? '1/3' : tab.id === 'employment' ? '2/3' : '3/3'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Next Step Hint */}
      {completionPercentage < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#2e8b57] flex items-center justify-center text-white text-sm font-bold">
            {activeTab === 'basic' ? '1' : activeTab === 'employment' ? '2' : '3'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
              {activeTab === 'basic' && 'Next: Employment details'}
              {activeTab === 'employment' && 'Next: Additional information'}
              {activeTab === 'additional' && 'Ready to hire!'}
            </p>
          </div>
        </motion.div>
      )}

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
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                        ${touched.firstName && errors.firstName
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.firstName && !errors.firstName && formData.firstName
                            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                            : 'border-[#d4a574] dark:border-[#8b4513]'
                        } transition-all duration-200`}
                      placeholder="John"
                    />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" />
                      {errors.firstName}
                    </p>
                  )}
                  {touched.firstName && !errors.firstName && formData.firstName && (
                    <p className="mt-1 text-xs text-[#2e8b57] flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      Looks good
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                    onBlur={() => handleBlur("lastName")}
                    className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                      ${touched.lastName && errors.lastName
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.lastName && !errors.lastName && formData.lastName
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                      } transition-all duration-200`}
                    placeholder="Doe"
                  />
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                      ${touched.email && errors.email
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.email && !errors.email && formData.email
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                      } transition-all duration-200`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <XCircleIcon className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                      ${touched.phone && errors.phone
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.phone && !errors.phone && formData.phone
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                      } transition-all duration-200`}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <XCircleIcon className="w-3 h-3" />
                    {errors.phone}
                  </p>
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
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
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
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                  >
                    {Object.values(EmployeeStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">
                    Hire Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="date"
                      value={formData.hireDate}
                      onChange={(e) => handleChange("hireDate", e.target.value)}
                      onBlur={() => handleBlur("hireDate")}
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                        ${touched.hireDate && errors.hireDate
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                        } transition-all duration-200`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Department</label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                      placeholder="e.g., Operations"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Employee #</label>
                  <div className="relative">
                    <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.employeeNumber}
                      onChange={(e) => handleChange("employeeNumber", e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                      placeholder="EMP-0001"
                      readOnly
                    />
                  </div>
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
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">Emergency Phone</label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                      onBlur={() => handleBlur("emergencyPhone")}
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                        ${touched.emergencyPhone && errors.emergencyPhone
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                        } transition-all duration-200`}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  {touched.emergencyPhone && errors.emergencyPhone && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" />
                      {errors.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Address</label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                    placeholder="Street address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
                    maxLength={2}
                    placeholder="CA"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    onBlur={() => handleBlur("zipCode")}
                    className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] 
                      ${touched.zipCode && errors.zipCode
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : 'border-[#d4a574] dark:border-[#8b4513]'
                      } transition-all duration-200`}
                    placeholder="12345"
                  />
                  {touched.zipCode && errors.zipCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all resize-none"
                  placeholder="Any additional notes about this employee..."
                />
                {formData.notes && (
                  <p className="text-xs text-[#b85e1a]/60 mt-1 text-right">
                    {formData.notes.length} characters
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Keyboard shortcut hint */}
      <div className="mt-4 text-[10px] text-[#b85e1a]/40 dark:text-gray-600 text-center">
        Press <kbd className="px-1 bg-[#f5f1e6] dark:bg-gray-700 rounded border border-[#d4a574]">Tab</kbd> to navigate fields
      </div>
    </FormModal>
  )
}