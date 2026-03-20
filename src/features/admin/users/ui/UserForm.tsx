/**
 * User Form Component
 * 
 * Form for creating and editing users
 */

"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FormModal from "@/src/shared/ui/Modal"
import { createUser, updateUser } from "@/src/services/userService"
import type { User } from "@/src/domain/models"
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon
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
      title={user ? "Edit User" : "Create New User"}
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
          {activeTab !== 'permissions' ? (
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
              form="user-form"
              disabled={isSubmitting || !isFormValid()}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : user ? "Update" : "Create"}
            </button>
          )}
        </div>
      }
    >
      {/* Custom Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2e8b57] to-[#1f6b41] flex items-center justify-center text-white font-bold">
          {user ? formData.name.charAt(0).toUpperCase() : "+"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            {user ? "Edit User" : "Create New User"}
          </h2>
          <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">
            {user ? `Editing ${formData.name}` : "Add a new user to the system"}
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
          <span>Basic (70%)</span>
          <span>Permissions (30%)</span>
        </div>
      </div>

      {/* Tabs with indicators */}
      <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4">
        {[
          { id: "basic", label: "Basic Info", icon: UserIcon },
          { id: "permissions", label: "Permissions", icon: ShieldCheckIcon },
        ].map((tab) => {
          const Icon = tab.icon
          const hasError = tab.id === 'basic' && (errors.name || errors.email)

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
          className="mb-4 bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg p-3 flex items-center gap-3"
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
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]
                      ${touched.name && errors.name
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.name && !errors.name && formData.name
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
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
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <select
                      value={formData.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                      className="w-full pl-10 pr-8 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b85e1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.75rem center',
                        backgroundSize: '1.25rem',
                      }}
                    >
                      <option value="Admin">Admin</option>
                      <option value="Supervisor">Supervisor</option>
                      <option value="Worker">Worker</option>
                      <option value="Client">Client</option>
                    </select>
                  </div>
                  {formData.role === 'Admin' && (
                    <p className="mt-1 text-xs text-[#2e8b57]">
                      Full system access
                    </p>
                  )}
                  {formData.role === 'Supervisor' && (
                    <p className="mt-1 text-xs text-[#2e8b57]">
                      Manage crews and jobs
                    </p>
                  )}
                  {formData.role === 'Worker' && (
                    <p className="mt-1 text-xs text-[#2e8b57]">
                      View assigned jobs only
                    </p>
                  )}
                  {formData.role === 'Client' && (
                    <p className="mt-1 text-xs text-[#2e8b57]">
                      Limited to client portal
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b85e1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25rem',
                    }}
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
              <div className="mt-4 p-4 bg-[#f5f1e6] dark:bg-gray-800/50 rounded-lg border border-[#d4a574]/30">
                <h4 className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">Role Summary</h4>
                <ul className="space-y-1 text-xs text-[#b85e1a]/70 dark:text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-3 h-3 text-[#2e8b57]" />
                    User will be created as <span className="font-medium text-[#2e8b57]">{formData.role}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-3 h-3 text-[#2e8b57]" />
                    Initial status: <span className="font-medium text-[#2e8b57]">{formData.status}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircleIcon className="w-3 h-3 text-[#2e8b57]" />
                    Login credentials will be sent to {formData.email}
                  </li>
                </ul>
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

export default UserForm