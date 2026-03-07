/**
 * Client Properties Component
 * 
 * Manages multiple property addresses for clients including primary, billing, and service locations
 */

"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeftIcon,
  HomeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XMarkIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline"
import type { Client } from "@/src/domain/entities"

export interface Property {
  id: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  type: "primary" | "billing" | "service" | "other"
  isPrimary: boolean
  name?: string
  notes?: string
  gateCode?: string
  accessInstructions?: string
  pets?: boolean
  petNotes?: string
  createdAt: Date
}

interface ClientPropertiesProps {
  client: Client
  onBack: () => void
}

const ClientProperties = ({ client, onBack }: ClientPropertiesProps) => {
  const [properties, setProperties] = useState<Property[]>([
    // Default primary property from client
    {
      id: "1",
      address: {
        ...client.primaryAddress,
        country: client.primaryAddress.country || "USA",
      },
      type: "primary",
      isPrimary: true,
      name: "Primary Residence",
      createdAt: new Date(),
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const stats = {
    total: properties.length,
    primary: properties.filter(p => p.isPrimary).length,
    service: properties.filter(p => p.type === "service").length,
    billing: properties.filter(p => p.type === "billing").length,
  }

  const handleAddProperty = (newProperty: Omit<Property, "id" | "createdAt">) => {
    const property: Property = {
      ...newProperty,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setProperties([...properties, property])
    setShowForm(false)
  }

  const handleUpdateProperty = (updatedProperty: Property) => {
    setProperties(properties.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    ))
    setEditingProperty(null)
  }

  const handleDeleteProperty = (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      setProperties(properties.filter(p => p.id !== id))
    }
  }

  const setAsPrimary = (id: string) => {
    setProperties(properties.map(p => ({
      ...p,
      isPrimary: p.id === id
    })))
  }

  const getPropertyTypeIcon = (type: string) => {
    switch (type) {
      case "primary": return <CheckCircleIcon className="w-5 h-5 text-[#2e8b57]" />
      case "billing": return <BuildingOfficeIcon className="w-5 h-5 text-blue-500" />
      case "service": return <MapPinIcon className="w-5 h-5 text-purple-500" />
      default: return <HomeIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const PropertyCard = ({ property }: { property: Property }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#f5f1e6] dark:bg-gray-800 p-6 rounded-lg border-2 transition-all ${
        property.isPrimary 
          ? "border-[#2e8b57] shadow-lg shadow-[#2e8b57]/20" 
          : "border-[#d4a574]/30 hover:border-[#2e8b57]/50"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#d4a574]/20 rounded-lg">
            {getPropertyTypeIcon(property.type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#8b4513] dark:text-[#d4a574]">
              {property.name || `${property.type.charAt(0).toUpperCase() + property.type.slice(1)} Address`}
            </h3>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#b85e1a]/70">Type:</span>
              <span className="text-[#8b4513] capitalize">{property.type}</span>
              {property.isPrimary && (
                <span className="px-2 py-0.5 text-xs bg-[#2e8b57]/20 text-[#2e8b57] rounded-full">
                  Primary
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!property.isPrimary && (
            <button
              onClick={() => setAsPrimary(property.id)}
              className="p-2 text-[#2e8b57] hover:bg-[#2e8b57]/10 rounded-lg transition-colors"
              title="Set as Primary"
            >
              <CheckCircleIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setEditingProperty(property)}
            className="p-2 text-[#b85e1a] hover:text-[#2e8b57] transition-colors"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteProperty(property.id)}
            className="p-2 text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPinIcon className="w-4 h-4 text-[#b85e1a] mt-0.5" />
          <div className="text-[#8b4513] dark:text-[#d4a574]">
            <div>{property.address.street}</div>
            <div className="text-sm text-[#b85e1a]/70">
              {property.address.city}, {property.address.state} {property.address.zipCode}
              <br />
              {property.address.country}
            </div>
          </div>
        </div>

        {property.gateCode && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#8b4513]">Gate Code:</span>
            <code className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm">
              {property.gateCode}
            </code>
          </div>
        )}

        {property.accessInstructions && (
          <div className="mt-2 p-3 bg-[#d4a574]/10 rounded-lg border border-[#d4a574]/30">
            <p className="text-sm text-[#8b4513]">
              <span className="font-medium">Access Instructions:</span>
              <br />
              {property.accessInstructions}
            </p>
          </div>
        )}

        {property.pets !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-[#8b4513]">Pets:</span>
            {property.pets ? (
              <span className="text-sm text-green-600">Yes</span>
            ) : (
              <span className="text-sm text-gray-500">No</span>
            )}
            {property.petNotes && (
              <span className="text-sm text-[#b85e1a]/70">- {property.petNotes}</span>
            )}
          </div>
        )}

        {property.notes && (
          <div className="mt-2 text-sm text-[#b85e1a]/70 border-t border-[#d4a574]/30 pt-2">
            <span className="font-medium text-[#8b4513]">Notes:</span>
            <br />
            {property.notes}
          </div>
        )}
      </div>

      <div className="mt-4 text-xs text-[#b85e1a]/50">
        Added {new Date(property.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  )

  const PropertyForm = ({ 
    property, 
    onSave, 
    onCancel 
  }: { 
    property?: Property | null
    onSave: (property: Omit<Property, "id" | "createdAt">) => void
    onCancel: () => void
  }) => {
    const [formData, setFormData] = useState({
      address: {
        street: property?.address.street || "",
        city: property?.address.city || "",
        state: property?.address.state || "",
        zipCode: property?.address.zipCode || "",
        country: property?.address.country || "USA",
      },
      type: property?.type || "service" as "primary" | "billing" | "service" | "other",
      isPrimary: property?.isPrimary || false,
      name: property?.name || "",
      notes: property?.notes || "",
      gateCode: property?.gateCode || "",
      accessInstructions: property?.accessInstructions || "",
      pets: property?.pets || false,
      petNotes: property?.petNotes || "",
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      onSave(formData)
    }

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-1">
            Property Name (Optional)
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            placeholder="e.g., Summer Home, Office, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-1">
            Property Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
          >
            <option value="primary">Primary Residence</option>
            <option value="service">Service Location</option>
            <option value="billing">Billing Address</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#8b4513] mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => setFormData({
                ...formData,
                address: { ...formData.address, street: e.target.value }
              })}
              required
              className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-1">
                City *
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
                required
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-1">
                State *
              </label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, state: e.target.value }
                })}
                required
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-1">
                Zip Code *
              </label>
              <input
                type="text"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                required
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#8b4513] mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value }
                })}
                className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-1">
            Gate Code (Optional)
          </label>
          <input
            type="text"
            value={formData.gateCode}
            onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
            className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            placeholder="e.g., #1234, 5678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-1">
            Access Instructions
          </label>
          <textarea
            value={formData.accessInstructions}
            onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            placeholder="Special instructions for accessing the property..."
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.pets}
              onChange={(e) => setFormData({ ...formData, pets: e.target.checked })}
              className="w-4 h-4 text-[#2e8b57] rounded"
            />
            <span className="text-sm text-[#8b4513]">Pets on property</span>
          </label>
        </div>

        {formData.pets && (
          <div>
            <label className="block text-sm font-medium text-[#8b4513] mb-1">
              Pet Notes
            </label>
            <input
              type="text"
              value={formData.petNotes}
              onChange={(e) => setFormData({ ...formData, petNotes: e.target.value })}
              className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
              placeholder="e.g., Dog in backyard, cat indoors"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-[#8b4513] mb-1">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-[#d4a574] rounded-lg bg-white dark:bg-gray-700 text-[#8b4513]"
            placeholder="Any other relevant information..."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-[#8b4513] hover:bg-[#d4a574]/20 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#2e8b57] text-white rounded-lg hover:bg-[#1f6b41]"
          >
            {property ? "Update Property" : "Add Property"}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-[#d4a574]/20 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-[#8b4513] dark:text-[#d4a574]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#8b4513] dark:text-[#d4a574]">
            Properties - {client.name}
          </h1>
          <p className="text-sm text-[#b85e1a]/80 dark:text-gray-400">
            Manage multiple property addresses
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#2e8b57]/10 p-4 rounded-lg border border-[#2e8b57]/30">
          <div className="text-sm text-[#2e8b57] mb-1">Total Properties</div>
          <div className="text-2xl font-bold text-[#2e8b57]">{stats.total}</div>
        </div>
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
          <div className="text-sm text-green-600 mb-1">Primary</div>
          <div className="text-2xl font-bold text-green-600">{stats.primary}</div>
        </div>
        <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
          <div className="text-sm text-blue-600 mb-1">Service</div>
          <div className="text-2xl font-bold text-blue-600">{stats.service}</div>
        </div>
        <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
          <div className="text-sm text-purple-600 mb-1">Billing</div>
          <div className="text-2xl font-bold text-purple-600">{stats.billing}</div>
        </div>
      </div>

      {/* Add Property Button */}
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-4 border-2 border-dashed border-[#d4a574] rounded-lg text-[#8b4513] hover:border-[#2e8b57] hover:text-[#2e8b57] transition-colors flex items-center justify-center gap-2"
      >
        <PlusIcon className="w-5 h-5" />
        Add New Property
      </button>

      {/* Properties List */}
      <div className="grid grid-cols-1 gap-6">
        {properties.map(property => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showForm || editingProperty) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#f5f1e6] dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-bold text-[#8b4513] dark:text-[#d4a574] mb-4">
                {editingProperty ? "Edit Property" : "Add New Property"}
              </h2>
              
              <PropertyForm
                property={editingProperty}
                onSave={(data) => {
                  if (editingProperty) {
                    handleUpdateProperty({ ...editingProperty, ...data })
                  } else {
                    handleAddProperty(data)
                  }
                }}
                onCancel={() => {
                  setShowForm(false)
                  setEditingProperty(null)
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ClientProperties