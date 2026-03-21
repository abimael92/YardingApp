/**
 * Client Form Component
 * 
 * Form for creating and editing clients
 * Arizona-focused with map integration and address validation
 */

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import FormModal from "@/src/shared/ui/FormModal"
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
  ChevronDownIcon,
  MapIcon,
  ClipboardDocumentIcon,
  PhotoIcon
} from "@heroicons/react/24/outline"

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client?: Client | null
}

// Arizona cities for dropdown
const ARIZONA_CITIES = [
  "Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale", "Gilbert", "Glendale",
  "Peoria", "Surprise", "Tempe", "Avondale", "Goodyear", "Buckeye", "Flagstaff",
  "Prescott", "Prescott Valley", "Yuma", "Lake Havasu City", "Casa Grande",
  "Maricopa", "Oro Valley", "Marana", "Apache Junction", "Queen Creek", "El Mirage",
  "Florence", "San Tan Valley", "Fountain Hills", "Cave Creek", "Paradise Valley"
]

// Arizona counties for dropdown
const ARIZONA_COUNTIES = [
  "Maricopa", "Pima", "Pinal", "Yavapai", "Mohave", "Yuma", "Coconino", "Navajo",
  "Cochise", "Gila", "Santa Cruz", "Graham", "La Paz", "Greenlee"
]

const ClientForm = ({ isOpen, onClose, onSuccess, client }: ClientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<"basic" | "address" | "details">("basic")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isUsingMap, setIsUsingMap] = useState(false)
  const [isPastingAddress, setIsPastingAddress] = useState(false)
  const [serviceHistory, setServiceHistory] = useState<Array<{ id: string, date: string, service: string, status: string }>>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [pasteBuffer, setPasteBuffer] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    phoneSecondary: "",
    preferredContactMethod: "email" as "email" | "phone" | "sms",
    street: "",
    city: "",
    county: "",
    zipCode: "",
    crossStreet: "",
    propertyType: "residential" as "residential" | "commercial" | "industrial" | "vacant",
    gateCode: "",
    accessInstructions: "",
    status: ClientStatus.ACTIVE,
    segment: ClientSegment.REGULAR,
    tags: "",
    notes: "",
    preferredContactTime: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    serviceHistory: "",
    referralSource: "",
    propertySize: "",
    hasHOA: false,
    hoaName: "",
    hoaContact: "",
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
        county: (client as any).county || "",
        zipCode: client.primaryAddress.zipCode,
        crossStreet: (client as any).crossStreet || "",
        propertyType: (client as any).propertyType || "residential",
        gateCode: (client as any).gateCode || "",
        accessInstructions: (client as any).accessInstructions || "",
        status: client.status,
        segment: client.segment,
        tags: client.tags?.join(", ") || "",
        notes: client.notes || "",
        preferredContactTime: (client as any).preferredContactTime || "",
        emergencyContactName: (client as any).emergencyContactName || "",
        emergencyContactPhone: (client as any).emergencyContactPhone || "",
        serviceHistory: (client as any).serviceHistory || "",
        referralSource: (client as any).referralSource || "",
        propertySize: (client as any).propertySize || "",
        hasHOA: (client as any).hasHOA || false,
        hoaName: (client as any).hoaName || "",
        hoaContact: (client as any).hoaContact || "",
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
        county: "",
        zipCode: "",
        crossStreet: "",
        propertyType: "residential",
        gateCode: "",
        accessInstructions: "",
        status: ClientStatus.ACTIVE,
        segment: ClientSegment.REGULAR,
        tags: "",
        notes: "",
        preferredContactTime: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        serviceHistory: "",
        referralSource: "",
        propertySize: "",
        hasHOA: false,
        hoaName: "",
        hoaContact: "",
      })
    }
  }, [client, isOpen])
  
  // Load service history when editing existing client
  useEffect(() => {
    const loadServiceHistory = async () => {
      if (!client?.id) return

      setLoadingHistory(true)
      try {
        // Fetch jobs for this client
        const jobs = await fetch(`/api/jobs?clientId=${client.id}`).then(res => res.json())
        const history = jobs
          .filter((job: any) => job.status === 'completed')
          .map((job: any) => ({
            id: job.id,
            date: new Date(job.completed_at || job.created_at).toLocaleDateString(),
            service: job.title,
            status: job.status
          }))
        setServiceHistory(history)
      } catch (error) {
        console.error('Failed to load service history:', error)
      } finally {
        setLoadingHistory(false)
      }
    }

    if (client?.id) {
      loadServiceHistory()
    }
  }, [client?.id])

  // Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let total = 0
    let completed = 0

    // Basic Info (35%)
    total += 35
    if (formData.name.trim()) completed += 12
    if (formData.email.trim()) completed += 12
    if (formData.phone.trim()) completed += 11

    // Address (35%)
    total += 35
    if (formData.street.trim()) completed += 10
    if (formData.city.trim()) completed += 10
    if (formData.zipCode.trim()) completed += 8
    if (formData.county.trim()) completed += 7

    // Details (30%)
    total += 30
    if (formData.status) completed += 6
    if (formData.segment) completed += 6
    if (formData.propertyType) completed += 6
    if (formData.accessInstructions.trim()) completed += 4
    if (formData.emergencyContactName.trim()) completed += 4
    if (formData.emergencyContactPhone.trim()) completed += 4

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
        if (!ARIZONA_CITIES.includes(value)) return "Please select a valid Arizona city"
        return ""
      case "county":
        if (!value.trim()) return "County is required"
        if (!ARIZONA_COUNTIES.includes(value)) return "Please select a valid Arizona county"
        return ""
      case "zipCode":
        if (!value.trim()) return "ZIP code is required"
        return !/^\d{5}(-\d{4})?$/.test(value) ? "Invalid ZIP code" : ""
      case "emergencyContactPhone":
        if (value === "NONE") return ""
        if (value && !/^[\d\s-+()]{10,}$/.test(value)) return "Invalid phone number"
        return ""
      default:
        return ""
    }
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    const error = validateField(field, formData[field as keyof typeof formData] as string)
    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handlePasteAddress = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    // Simple address parsing - can be enhanced with geocoding API
    const lines = pastedText.split('\n')
    if (lines[0]) {
      handleChange("street", lines[0])
    }
    setIsPastingAddress(false)
  }

  const handleNextStep = (e?: React.MouseEvent) => {
    
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
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
      const addressFields = ['street', 'city', 'county', 'zipCode']
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

  const handlePrevStep = (e?: React.MouseEvent) => {
  
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    const tabs = ['basic', 'address', 'details'] as const
    const currentIndex = tabs.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all required fields
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'county', 'zipCode']
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
      const clientData: any = {
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
          state: "AZ",
          zipCode: formData.zipCode,
          country: "US",
        },
        status: formData.status,
        segment: formData.segment,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : undefined,
        notes: formData.notes || undefined,
        // Arizona-specific fields
        county: formData.county,
        crossStreet: formData.crossStreet,
        propertyType: formData.propertyType,
        gateCode: formData.gateCode,
        accessInstructions: formData.accessInstructions,
        preferredContactTime: formData.preferredContactTime,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        serviceHistory: formData.serviceHistory,
        referralSource: formData.referralSource,
        propertySize: formData.propertySize,
        hasHOA: formData.hasHOA,
        hoaName: formData.hoaName,
        hoaContact: formData.hoaContact,
        totalSpent: { amount: 0, currency: "USD" },
        lifetimeValue: { amount: 0, currency: "USD" },
        serviceRequestIds: [],
        quoteIds: [],
        jobIds: [],
        paymentIds: [],
        communicationIds: [],
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
    const requiredFields = ['name', 'email', 'phone', 'street', 'city', 'county', 'zipCode']
    const isValid = requiredFields.every(field => {
      const value = formData[field as keyof typeof formData] as string
      const fieldError = validateField(field, value)
      const isValidField = value && value.trim() && !fieldError
      console.log(`${field}: value="${value}", isValid=${isValidField}, error="${fieldError}"`) // Debug log
      return isValidField
    })
    console.log("Form valid:", isValid) // Debug log
    return isValid
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
      title={client ? "Edit Client" : "Create New Client"}
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
              onClick={(e) => handlePrevStep(e)} 
              className="px-4 py-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-transparent border border-[#d4a574] dark:border-[#8b4513] rounded-lg hover:bg-[#d4a574]/10"
            >
              Previous
            </button>
          )}

          {/* Next Step Button */}
          {activeTab !== 'details' ? (
            <button
              type="button"
              onClick={(e) => handleNextStep(e)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#d4a574] hover:bg-[#b85e1a] rounded-lg"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              form="client-form"
              disabled={isSubmitting || !isFormValid()}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#2e8b57] to-[#1f6b41] rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : client ? "Update Client" : "Create Client"}
            </button>
          )}
        </div>
      }
    >
      {/* Custom Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2e8b57] to-[#1f6b41] flex items-center justify-center text-white font-bold">
          {client ? formData.name.charAt(0).toUpperCase() : "+"}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            {client ? "Edit Client" : "Create New Client"}
          </h2>
          <p className="text-sm text-[#b85e1a]/70 dark:text-gray-400">
            {client ? `Editing ${formData.name}` : "Add a new client to your database"}
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
          <span>Address (35%)</span>
          <span>Details (30%)</span>
        </div>
      </div>

      {/* Tabs with indicators */}
      <div className="flex gap-2 mb-6 border-b border-[#d4a574]/30 pb-4">
        {[
          { id: "basic", label: "Basic Info", icon: UserIcon },
          { id: "address", label: "Address", icon: MapPinIcon },
          { id: "details", label: "Details", icon: TagIcon },
        ].map((tab) => {
          const Icon = tab.icon
          const hasError = tab.id === 'basic' && (errors.name || errors.email || errors.phone)

          return (
            <button
              key={tab.id}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActiveTab(tab.id as any)
              }}
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
          className="mb-4 bg-[#2e8b57]/10 border border-[#2e8b57]/30 rounded-lg p-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#2e8b57] flex items-center justify-center text-white text-sm font-bold">
            {activeTab === 'basic' ? '1' : activeTab === 'address' ? '2' : '3'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#8b4513] dark:text-[#d4a574]">
              {activeTab === 'basic' && 'Next: Address information'}
              {activeTab === 'address' && 'Next: Additional details and preferences'}
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
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                      ${touched.name && errors.name
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.name && !errors.name && formData.name
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
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
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                        ${touched.email && errors.email
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.email && !errors.email && formData.email
                            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                            : 'border-[#d4a574] dark:border-[#8b4513]'
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
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                        ${touched.phone && errors.phone
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.phone && !errors.phone && formData.phone
                            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                            : 'border-[#d4a574] dark:border-[#8b4513]'
                        } transition-all duration-200`}
                      placeholder="(480) 555-1234"
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
                      className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                        ${touched.phoneSecondary && errors.phoneSecondary
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                        } transition-all duration-200`}
                      placeholder="(480) 987-6543"
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
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    <select
                      value={formData.preferredContactMethod}
                      onChange={(e) => handleChange("preferredContactMethod", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="sms">SMS</option>
                    </select>
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
              {/* Address Tools */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsUsingMap(!isUsingMap)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#2e8b57] border border-[#2e8b57] rounded-lg hover:bg-[#2e8b57]/10"
                >
                  <MapIcon className="w-4 h-4" />
                  {isUsingMap ? "Hide Map" : "Use Map"}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsPastingAddress(!isPastingAddress)
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#d4a574] border border-[#d4a574] rounded-lg hover:bg-[#d4a574]/10"
                >
                  <ClipboardDocumentIcon className="w-4 h-4" />
                  Paste Address
                </button>
              </div>

              {isPastingAddress && (
                <div className="mb-4 p-3 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg">
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                    Paste Full Address
                  </label>
                  <textarea
                    onPaste={handlePasteAddress}
                    rows={3}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-white dark:bg-gray-700"
                    placeholder="Paste address here..."
                  />
                  <p className="text-xs text-[#b85e1a]/60 mt-1">
                    Tip: Paste a complete address and it will auto-fill the fields
                  </p>
                </div>
              )}

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
                    className={`w-full pl-10 pr-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                      ${touched.street && errors.street
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.street && !errors.street && formData.street
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    <select
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none
                        ${touched.city && errors.city
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.city && !errors.city && formData.city
                            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                            : 'border-[#d4a574] dark:border-[#8b4513]'
                        }`}
                    >
                      <option value="">Select Arizona City</option>
                      {ARIZONA_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  {touched.city && errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    County <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    <select
                      value={formData.county}
                      onChange={(e) => handleChange("county", e.target.value)}
                      onBlur={() => handleBlur("county")}
                      className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none
                        ${touched.county && errors.county
                          ? 'border-red-500 ring-2 ring-red-500/20'
                          : touched.county && !errors.county && formData.county
                            ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                            : 'border-[#d4a574] dark:border-[#8b4513]'
                        }`}
                    >
                      <option value="">Select Arizona County</option>
                      {ARIZONA_COUNTIES.map(county => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                  {touched.county && errors.county && (
                    <p className="mt-1 text-xs text-red-500">{errors.county}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    ZIP Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => handleChange("zipCode", e.target.value)}
                    onBlur={() => handleBlur("zipCode")}
                    className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
                      ${touched.zipCode && errors.zipCode
                        ? 'border-red-500 ring-2 ring-red-500/20'
                        : touched.zipCode && !errors.zipCode && formData.zipCode
                          ? 'border-[#2e8b57] ring-2 ring-[#2e8b57]/20'
                          : 'border-[#d4a574] dark:border-[#8b4513]'
                      } transition-all duration-200`}
                    placeholder="85001"
                  />
                  {touched.zipCode && errors.zipCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.zipCode}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Cross Street
                  </label>
                  <input
                    type="text"
                    value={formData.crossStreet}
                    onChange={(e) => handleChange("crossStreet", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                    placeholder="e.g., Main St & 1st Ave"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                  Property Type
                </label>
                <div className="relative">
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                  <select
                    value={formData.propertyType}
                    onChange={(e) => handleChange("propertyType", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="industrial">Industrial</option>
                    <option value="vacant">Vacant Land</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                  Gate Code / Access Code
                </label>
                <input
                  type="text"
                  value={formData.gateCode}
                  onChange={(e) => handleChange("gateCode", e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                  placeholder="#1234 or code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                  Access Instructions
                </label>
                <textarea
                  value={formData.accessInstructions}
                  onChange={(e) => handleChange("accessInstructions", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                  placeholder="Parking instructions, where to enter, special considerations..."
                />
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
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                    >
                      {Object.values(ClientStatus).map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Segment
                  </label>
                  <div className="relative">
                    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b85e1a]/60 pointer-events-none" />
                    <select
                      value={formData.segment}
                      onChange={(e) => handleChange("segment", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all appearance-none"
                    >
                      {Object.values(ClientSegment).map((segment) => (
                        <option key={segment} value={segment}>
                          {segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Preferred Contact Time
                  </label>
                  <input
                    type="text"
                    value={formData.preferredContactTime}
                    onChange={(e) => handleChange("preferredContactTime", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                    placeholder="e.g., Weekdays after 5pm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Referral Source
                  </label>
                  <input
                    type="text"
                    value={formData.referralSource}
                    onChange={(e) => handleChange("referralSource", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                    placeholder="How did they hear about us?"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Emergency Contact Name
                      <div className="relative inline-block ml-2 group">
                        <button
                          type="button"
                          className="text-[#b85e1a]/60 hover:text-[#b85e1a] focus:outline-none"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                          </svg>
                        </button>
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                          Optional - who to contact in case of emergency during service work
                        </div>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                      placeholder="e.g., John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      Emergency Contact Phone
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input
                          type="tel"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                          onBlur={() => handleBlur("emergencyContactPhone")}
                          className={`w-full px-3 py-2 border-2 rounded-lg bg-[#f5f1e6] dark:bg-gray-800
            ${touched.emergencyContactPhone && errors.emergencyContactPhone
                              ? 'border-red-500 ring-2 ring-red-500/20'
                              : 'border-[#d4a574] dark:border-[#8b4513]'
                            }`}
                          placeholder="(480) 555-1234"
                          disabled={formData.emergencyContactPhone === 'NONE'}
                        />
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (formData.emergencyContactPhone === 'NONE') {
                              handleChange("emergencyContactPhone", "")
                            } else {
                              handleChange("emergencyContactPhone", "NONE")
                            }
                          }}
                          className="px-3 py-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] bg-transparent border border-[#d4a574] rounded-lg hover:bg-[#d4a574]/10 whitespace-nowrap"
                        >
                          {formData.emergencyContactPhone === 'NONE' ? 'Clear None' : 'None'}
                        </button>
                      </div>
                    </div>
                    {formData.emergencyContactPhone !== 'NONE' && formData.phone && !formData.emergencyContactPhone && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleChange("emergencyContactPhone", formData.phone)
                        }}
                        className="mt-1 text-xs text-[#2e8b57] hover:text-[#1f6b41] flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Use main phone number: {formData.phone}
                      </button>
                    )}
                    {touched.emergencyContactPhone && errors.emergencyContactPhone && (
                      <p className="mt-1 text-xs text-red-500">{errors.emergencyContactPhone}</p>
                    )}
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                    Property Size
                  </label>
                  <input
                    type="text"
                    value={formData.propertySize}
                    onChange={(e) => handleChange("propertySize", e.target.value)}
                    className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                    placeholder="e.g., 1/2 acre, 5000 sq ft"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                    Service History
                    <div className="relative inline-block ml-2 group">
                      <button
                        type="button"
                        className="text-[#b85e1a]/60 hover:text-[#b85e1a] focus:outline-none"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                        </svg>
                      </button>
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                        Previous services completed for this client. Shows job history from completed work orders.
                      </div>
                    </div>
                  </label>

                  {loadingHistory ? (
                    <div className="text-center py-4 text-[#b85e1a]/60">Loading service history...</div>
                  ) : serviceHistory.length > 0 ? (
                    <div className="border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 max-h-48 overflow-y-auto">
                      {serviceHistory.map((job) => (
                        <div key={job.id} className="p-3 border-b border-[#d4a574]/30 last:border-b-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-[#8b4513] dark:text-[#d4a574]">{job.service}</p>
                              <p className="text-xs text-[#b85e1a]/60">{job.date}</p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-[#2e8b57]/20 text-[#2e8b57]">
                              {job.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : client?.id ? (
                    <div className="text-center py-4 text-[#b85e1a]/60 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border-2 border-[#d4a574]">
                      No previous service history found
                    </div>
                  ) : (
                    <div className="text-center py-4 text-[#b85e1a]/60 bg-[#f5f1e6] dark:bg-gray-800 rounded-lg border-2 border-[#d4a574]">
                      Service history will appear after first completed job
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-2">
                  <input
                    type="checkbox"
                    checked={formData.hasHOA}
                    onChange={(e) => handleChange("hasHOA", e.target.checked)}
                    className="w-4 h-4 text-[#2e8b57] rounded border-[#d4a574]"
                  />
                  Property has HOA
                  <div className="relative group">
                    <button
                      type="button"
                      className="ml-1 text-[#b85e1a]/60 hover:text-[#b85e1a] focus:outline-none"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    </button>
                    <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg">
                      Homeowners Association - many Arizona communities have HOA rules about landscaping.
                      We'll need their contact info for approvals and to ensure compliance with community standards.
                    </div>
                  </div>
                </label>
              </div>

              {formData.hasHOA && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      HOA Name
                    </label>
                    <input
                      type="text"
                      value={formData.hoaName}
                      onChange={(e) => handleChange("hoaName", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                      placeholder="e.g., Desert Ridge Community Association"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#8b4513] dark:text-[#d4a574] mb-1">
                      HOA Contact
                    </label>
                    <input
                      type="text"
                      value={formData.hoaContact}
                      onChange={(e) => handleChange("hoaContact", e.target.value)}
                      className="w-full px-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800"
                      placeholder="Contact person and/or phone"
                    />
                  </div>
                </div>
              )}

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
                    className="w-full pl-10 pr-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all"
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
                  <DocumentTextIcon className="absolute left-3 top-3 w-4 h-4 text-[#b85e1a]/60" />
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    rows={4}
                    className="w-full pl-10 pr-3 py-2 border-2 border-[#d4a574] rounded-lg bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-all resize-none"
                    placeholder="Any additional notes about this client..."
                  />
                </div>
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

export default ClientForm