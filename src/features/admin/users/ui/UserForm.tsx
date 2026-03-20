"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal } from "@/src/shared/ui/Modal"
import { createUser, updateUser } from "@/src/services/userService"
import type { User } from "@/src/domain/models"
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: User | null
}

const UserForm = ({ isOpen, onClose, onSuccess, user }: UserFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "permissions">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Client" as User["role"],
    status: "Active" as User["status"],
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      })
    } else {
      setFormData({
        name: "",
        email: "",
        role: "Client",
        status: "Active",
      })
    }
  }, [user, isOpen])

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let total = 0
    let completed = 0

    // Basic Info (70%)
    total += 70
    if (formData.name.trim()) completed += 30
    if (formData.email.trim()) completed += 40

    // Permissions (30%)
    total += 30
    if (formData.role) completed += 15
    if (formData.status) completed += 15

    return Math.min(100, Math.round((completed / total) * 100))
  }, [formData])

  const completionPercentage = calculateCompletion()

  // Validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return ""
      case "email":
        if (!value.trim()) return "Email is required"
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : ""
      default:
        return ""
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
    const tabs = ['basic', 'permissions'] as const
    const currentIndex = tabs.indexOf(activeTab)

    // Validate current tab before moving
    if (activeTab === 'basic') {
      const basicFields = ['name', 'email']
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

    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1])
    }
  }

  const handlePrevStep = () => {
    const tabs = ['basic', 'permissions'] as const
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    const requiredFields = ['name', 'email']
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
      if (user) {
        await updateUser(user.id, formData)
      } else {
        await createUser(formData)
      }
      onSuccess()
    } catch (error) {
      console.error("Failed to save user:", error)
      alert("Failed to save user. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const requiredFields = ['name', 'email']
    return requiredFields.every(field => {
      const value = formData[field as keyof typeof formData] as string
      return value && value.trim() && !validateField(field, value)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={user ? "Edit User" : "Create New User"}
        subtitle={user ? `Editing ${formData.name}` : "Add a new user to the system"}
        progress={completionPercentage}
        icon={user ? formData.name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
      />

      <Modal.Body>
        {/* Tabs with indicators */}
        <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4 sticky top-0 bg-[#fdfbf7] dark:bg-gray-950/20 z-10 pt-2">
          {[
            { id: "basic", label: "Basic Info", icon: UserIcon },
            { id: "permissions", label: "Permissions", icon: ShieldCheckIcon },
          ].map((tab) => {
            const Icon = tab.icon
            const hasError = tab.id === 'basic' && (errors.name || errors.email)

            return (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors
                  ${activeTab === tab.id
                    ? "bg-[#2e8b57] text-white"
                    : "text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20"
                  }
                  ${hasError ? 'border border-red-500' : 'border border-transparent'}
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {hasError && <XCircleIcon className="w-3 h-3 text-red-500" />}
                {activeTab === tab.id && completionPercentage > 0 && (
                  <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                    {tab.id === 'basic' ? '1/2' : '2/2'}
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
            className="mb-6 bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg p-3 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-[#2e8b57] flex items-center justify-center text-white text-sm font-bold">
              {activeTab === 'basic' ? '1' : '2'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
                {activeTab === 'basic' && 'Next: Set permissions and role'}
                {activeTab === 'permissions' && 'Ready to create user!'}
              </p>
            </div>
          </motion.div>
        )}

        <form id="user-form" onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.name && errors.name
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.name && !errors.name && formData.name
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
                        } transition-all duration-200`}
                      placeholder="John Doe"
                    />
                  </div>
                  {touched.name && errors.name && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                  {touched.name && !errors.name && formData.name && (
                    <p className="mt-1 text-xs text-[#2e8b57] flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      Looks good
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.email && errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.email && !errors.email && formData.email
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
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
              </motion.div>
            )}

            {activeTab === "permissions" && (
              <motion.div
                key="permissions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Role
                    </label>
                    <div className="relative">
                      <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                      <select
                        value={formData.role}
                        onChange={(e) => handleChange("role", e.target.value)}
                        className="w-full pl-10 pr-8 py-3 border-2 border-[#d4a574]/20 focus:border-[#2e8b57] rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none transition-all appearance-none"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Worker">Worker</option>
                        <option value="Client">Client</option>
                      </select>
                    </div>
                    <div className="mt-2 text-xs text-[#2e8b57]">
                      {formData.role === 'Admin' && 'Full system access'}
                      {formData.role === 'Supervisor' && 'Manage crews and jobs'}
                      {formData.role === 'Worker' && 'View assigned jobs only'}
                      {formData.role === 'Client' && 'Limited to client portal'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#d4a574]/20 focus:border-[#2e8b57] rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none transition-all appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>

                    {/* Status indicator */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${formData.status === 'Active' ? 'bg-[#2e8b57]' :
                          formData.status === 'Pending' ? 'bg-[#d88c4a]' :
                            'bg-[#8b4513]'
                        }`} />
                      <span className="text-xs text-[#b85e1a]/70">
                        {formData.status === 'Active' && 'User can access the system'}
                        {formData.status === 'Pending' && 'Awaiting verification'}
                        {formData.status === 'Inactive' && 'Access disabled'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Role Summary */}
                <div className="mt-4 p-4 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-xl border border-[#d4a574]/30">
                  <h4 className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-3">Role Summary</h4>
                  <ul className="space-y-2 text-xs text-[#b85e1a]/70 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-[#2e8b57]" />
                      User will be created as <span className="font-bold text-[#2e8b57]">{formData.role}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-[#2e8b57]" />
                      Initial status: <span className="font-bold text-[#2e8b57]">{formData.status}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-[#2e8b57]" />
                      Login credentials will be sent to {formData.email || "their email address"}
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Keyboard shortcut hint */}
        <div className="mt-8 text-[10px] text-[#b85e1a]/40 dark:text-gray-600 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-[#f5f1e6] dark:bg-gray-700 rounded border border-[#d4a574]/50">Tab</kbd> to navigate fields
        </div>
      </Modal.Body>

      <Modal.Footer>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 text-sm font-bold text-[#8b4513]/60 hover:text-[#8b4513] transition-colors"
        >
          Cancel
        </button>

        {/* Previous Step Button */}
        {activeTab !== 'basic' && (
          <button
            type="button"
            onClick={handlePrevStep}
            className="px-6 py-2 text-sm font-bold text-[#8b4513] border border-[#d4a574]/30 rounded-xl hover:bg-[#f5f1e6]"
          >
            Previous
          </button>
        )}

        {/* Next Step / Submit Button */}
        {activeTab !== 'permissions' ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="px-8 py-3 text-sm font-bold text-white bg-[#8b4513] hover:bg-[#5d4037] rounded-xl shadow-lg transition-all"
          >
            Next Step
          </button>
        ) : (
          <button
            type="submit"
            form="user-form"
            disabled={isSubmitting || !isFormValid()}
            className="px-10 py-3 text-sm font-bold text-white bg-[#2e8b57] hover:bg-[#1f6b41] rounded-xl shadow-xl disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Saving..." : user ? "Update User" : "Create User"}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default UserForm