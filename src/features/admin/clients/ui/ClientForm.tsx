"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Modal } from "@/src/shared/ui/Modal" // Ensure this imports the updated Modal component
import { createClient, updateClient } from "@/src/services/clientService"
import type { Client } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  GlobeAltIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline"

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client?: Client | null
}

const ClientForm = ({ isOpen, onClose, onSuccess, client }: ClientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "address" | "details">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    preferredContactMethod: "email" as "email" | "phone" | "sms",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.REGULAR,
    tags: "",
    notes: "",
  })

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.contactInfo.email,
        phone: client.contactInfo.phone,
        phoneSecondary: client.contactInfo.phoneSecondary || "",
        preferredContactMethod: client.contactInfo.preferredContactMethod,
        street: client.primaryAddress.street,
        city: client.primaryAddress.city,
        state: client.primaryAddress.state,
        zipCode: client.primaryAddress.zipCode,
        country: client.primaryAddress.country || "USA",
        status: client.status,
        segment: client.segment,
        tags: client.tags?.join(", ") || "",
        notes: client.notes || "",
      })
    } else {
      // Reset form for new client
      setFormData({
        name: "",
        email: "",
        phone: "",
        phoneSecondary: "",
        preferredContactMethod: "email",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        status: ClientStatus.ACTIVE,
        segment: ClientSegment.REGULAR,
        tags: "",
        notes: "",
      })
    }
  }, [client, isOpen])

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let total = 0
    let completed = 0

    // Basic Info (40%)
    total += 40
    if (formData.name.trim()) completed += 15
    if (formData.email.trim()) completed += 15
    if (formData.phone.trim()) completed += 10

    // Address (35%)
    total += 35
    if (formData.street.trim()) completed += 10
    if (formData.city.trim()) completed += 10
    if (formData.state.trim()) completed += 7.5
    if (formData.zipCode.trim()) completed += 7.5

    // Details (25%)
    total += 25
    if (formData.status) completed += 8
    if (formData.segment) completed += 8
    if (formData.notes.trim()) completed += 5
    if (formData.tags.trim()) completed += 4

    return Math.min(100, Math.round((completed / total) * 100))
  }, [formData])

  const completionPercentage = calculateCompletion()

  // Validation functions
  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Client name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        return ""
      case "email":
        if (!value.trim()) return "Email is required"
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : ""
      case "phone":
        if (!value.trim()) return "Phone is required"
        return !/^[\d\s-+()]{10,}$/.test(value) ? "Invalid phone number" : ""
      case "phoneSecondary":
        if (value && !/^[\d\s-+()]{10,}$/.test(value)) return "Invalid phone number"
        return ""
      case "street":
        if (!value.trim()) return "Street address is required"
        return ""
      case "city":
        if (!value.trim()) return "City is required"
        return ""
      case "state":
        if (!value.trim()) return "State is required"
        return ""
      case "zipCode":
        if (!value.trim()) return "ZIP code is required"
        return !/^\d{5}(-\d{4})?$/.test(value) ? "Invalid ZIP code" : ""
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
    const tabs = ['basic', 'address', 'details'] as const
    const currentIndex = tabs.indexOf(activeTab)

    // Validate current tab before moving
    if (activeTab === 'basic') {
      const basicFields = ['name', 'email', 'phone']
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

    if (activeTab === 'address') {
      const addressFields = ['street', 'city', 'state', 'zipCode']
      const hasErrors = addressFields.some(field => {
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
    const tabs = ['basic', 'address', 'details'] as const
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode']
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
      const clientData: Omit<Client, "id" | "createdAt" | "updatedAt"> = {
        name: formData.name,
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          phoneSecondary: formData.phoneSecondary || undefined,
          preferredContactMethod: formData.preferredContactMethod,
        },
        primaryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        status: formData.status,
        segment: formData.segment,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
        totalSpent: { amount: 0, currency: "USD" },
        lifetimeValue: { amount: 0, currency: "USD" },
        serviceRequestIds: [],
        quoteIds: [],
        jobIds: [],
        paymentIds: [],
        communicationIds: [],
        notes: formData.notes || undefined,
        invoiceIds: [],
        contractIds: [],
        propertyIds: [],
        noteIds: [],
        activityLogIds: []
      }

      if (client) {
        await updateClient(client.id, clientData)
      } else {
        await createClient(clientData)
      }

      onSuccess()
    } catch (error) {
      console.error("Failed to save client:", error)
      alert("Failed to save client. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'state', 'zipCode']
    return requiredFields.every(field => {
      const value = formData[field as keyof typeof formData] as string
      return value && value.trim() && !validateField(field, value)
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <Modal.Header
        title={client ? "Edit Client" : "Create New Client"}
        subtitle={client ? `Editing ${formData.name}` : "Add a new client to your database"}
        progress={completionPercentage}
        icon={client ? formData.name.charAt(0).toUpperCase() : <BuildingOfficeIcon className="w-6 h-6" />}
      />

      <Modal.Body>
        {/* Tabs with indicators */}
        <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4  top-0 bg-[#fdfbf7] dark:bg-gray-950/20 z-10 pt-2">
          {[
            { id: "basic", label: "Basic Info", icon: UserIcon },
            { id: "address", label: "Address", icon: MapPinIcon },
            { id: "details", label: "Details", icon: TagIcon },
          ].map((tab) => {
            const Icon = tab.icon
            const hasError = tab.id === 'basic' && (errors.name || errors.email || errors.phone)

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
                    {tab.id === 'basic' ? '1/3' : tab.id === 'address' ? '2/3' : '3/3'}
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
              {activeTab === 'basic' ? '1' : activeTab === 'address' ? '2' : '3'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
                {activeTab === 'basic' && 'Next: Address information'}
                {activeTab === 'address' && 'Next: Classification and notes'}
                {activeTab === 'details' && 'Ready to create client!'}
              </p>
            </div>
          </motion.div>
        )}

        <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
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
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
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
                      placeholder="e.g., ABC Corporation"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                      <input
                        type="email"
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
                        placeholder="contact@example.com"
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
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        onBlur={() => handleBlur("phone")}
                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                          ${touched.phone && errors.phone
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : touched.phone && !errors.phone && formData.phone
                              ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                              : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Secondary Phone
                    </label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                      <input
                        type="tel"
                        value={formData.phoneSecondary}
                        onChange={(e) => handleChange("phoneSecondary", e.target.value)}
                        onBlur={() => handleBlur("phoneSecondary")}
                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none focus:border-[#2e8b57]
                          ${touched.phoneSecondary && errors.phoneSecondary
                            ? 'border-red-500 ring-2 ring-red-500/20'
                            : 'border-[#d4a574]/20'
                          } transition-all duration-200`}
                        placeholder="(555) 987-6543"
                      />
                    </div>
                    {touched.phoneSecondary && errors.phoneSecondary && (
                      <p className="mt-1 text-xs text-red-500">{errors.phoneSecondary}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Preferred Contact
                    </label>
                    <div className="relative">
                      <select
                        value={formData.preferredContactMethod}
                        onChange={(e) => handleChange("preferredContactMethod", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none outline-none"
                      >
                        <option value="email">Email</option>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                      </select>
                      <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "address" && (
              <motion.div
                key="address"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleChange("street", e.target.value)}
                      onBlur={() => handleBlur("street")}
                      className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.street && errors.street
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.street && !errors.street && formData.street
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
                        } transition-all duration-200`}
                      placeholder="123 Main St"
                    />
                  </div>
                  {touched.street && errors.street && (
                    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                      <XCircleIcon className="w-3 h-3" />
                      {errors.street}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.city && errors.city
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.city && !errors.city && formData.city
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
                        } transition-all duration-200`}
                      placeholder="Phoenix"
                    />
                    {touched.city && errors.city && (
                      <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      onBlur={() => handleBlur("state")}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.state && errors.state
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.state && !errors.state && formData.state
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
                        } transition-all duration-200`}
                      placeholder="AZ"
                      maxLength={2}
                    />
                    {touched.state && errors.state && (
                      <p className="mt-1 text-xs text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      onBlur={() => handleBlur("zipCode")}
                      className={`w-full px-4 py-3 border-2 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] outline-none
                        ${touched.zipCode && errors.zipCode
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.zipCode && !errors.zipCode && formData.zipCode
                            ? 'border-[#2e8b57] focus:border-[#2e8b57]'
                            : 'border-[#d4a574]/20 focus:border-[#2e8b57]'
                        } transition-all duration-200`}
                      placeholder="85001"
                    />
                    {touched.zipCode && errors.zipCode && (
                      <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Country
                  </label>
                  <div className="relative">
                    <GlobeAltIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] outline-none transition-all"
                      placeholder="USA"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] transition-all appearance-none outline-none"
                      >
                        {Object.values(ClientStatus).map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Segment
                    </label>
                    <div className="relative">
                      <select
                        value={formData.segment}
                        onChange={(e) => handleChange("segment", e.target.value)}
                        className="w-full px-4 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] transition-all appearance-none outline-none"
                      >
                        {Object.values(ClientSegment).map((segment) => (
                          <option key={segment} value={segment}>
                            {segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Tags (comma-separated)
                  </label>
                  <div className="relative">
                    <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60" />
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] outline-none transition-all"
                      placeholder="vip, commercial, monthly"
                    />
                  </div>
                  {formData.tags && (
                    <p className="text-xs text-[#b85e1a]/60 mt-1">
                      {formData.tags.split(',').length} tag(s) added
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Notes
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="absolute left-3 top-4 w-5 h-5 text-[#b85e1a]/60" />
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleChange("notes", e.target.value)}
                      rows={4}
                      className="w-full pl-10 pr-3 py-3 border-2 border-[#d4a574]/20 rounded-xl bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:border-[#2e8b57] outline-none transition-all resize-none"
                      placeholder="Any additional notes about this client..."
                    />
                  </div>
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
        {activeTab !== 'details' ? (
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
            form="client-form"
            disabled={isSubmitting || !isFormValid()}
            className="px-10 py-3 text-sm font-bold text-white bg-[#2e8b57] hover:bg-[#1f6b41] rounded-xl shadow-xl disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Saving..." : client ? "Update Client" : "Create Client"}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ClientForm