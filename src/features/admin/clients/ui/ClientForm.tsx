/**
 * Client Form Component
 * 
 * Form for creating and editing clients
 */

"use client"

import { useState, useEffect } from "react"
import FormModal from "@/src/shared/ui/FormModal"
import { createClient, updateClient } from "@/src/services/clientService"
import type { Client } from "@/src/domain/entities"
import { ClientStatus, ClientSegment } from "@/src/domain/entities"

interface ClientFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  client?: Client | null
}

const ClientForm = ({ isOpen, onClose, onSuccess, client }: ClientFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? "Edit Client" : "Create New Client"}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="client-form"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : client ? "Update" : "Create"}
          </button>
        </>
      }
    >
      <form id="client-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street *
              </label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Status & Classification */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Status & Classification
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.values(ClientStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Segment
              </label>
              <select
                value={formData.segment}
                onChange={(e) =>
                  setFormData({ ...formData, segment: e.target.value as ClientSegment })
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {Object.values(ClientSegment).map((segment) => (
                  <option key={segment} value={segment}>
                    {segment.charAt(0).toUpperCase() + segment.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </form>
    </FormModal>
  )
}

export default ClientForm
