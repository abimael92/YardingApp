"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { mockStore } from "@/src/data/mockStore"
import type { InvoiceItem } from "@/src/data/mockStore"
import type { Job } from "@/src/domain/entities"
import { JobStatus, Priority } from "@/src/domain/entities"
import { getServices } from "@/src/services/serviceCatalog"
import type { Service } from "@/src/domain/models"
import { getAllowedProjectTypes, formatAllowedTypes } from "@/src/data/serviceProjectTypes"
import JobCostCalculator from "@/src/features/admin/jobs/ui/JobCostCalculator"

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildStubJobForService(clientId: string, service: Service): Job {
  const now = new Date().toISOString()
  return {
    id: `stub-inv-${clientId}-${service.id}`,
    jobNumber: "—",
    clientId,
    status: JobStatus.DRAFT,
    title: service.name,
    description: service.description,
    priority: Priority.MEDIUM,
    address: { street: "", city: "", state: "", zipCode: "", country: "USA" },
    tasks: [],
    estimatedDuration: 0,
    estimatedCost: { amount: 0, currency: "USD" },
    quotedPrice: { amount: 0, currency: "USD" },
    assignedEmployeeIds: [],
    createdAt: now,
    updatedAt: now,
  }
}

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

interface CreateInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [clientId, setClientId] = useState("")
  const [clientName, setClientName] = useState("")
  const [selectedServiceId, setSelectedServiceId] = useState("")

  const clients = mockStore.getClients()
  const services = getServices()
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) ?? null,
    [services, selectedServiceId]
  )
  const allowedProjectTypes = useMemo(
    () => (selectedServiceId ? getAllowedProjectTypes(selectedServiceId) : []),
    [selectedServiceId]
  )

  const stubJob = useMemo(() => {
    if (!clientId || !selectedService) return null
    return buildStubJobForService(clientId, selectedService)
  }, [clientId, selectedService])

  // Reset state when modal opens.
  useEffect(() => {
    if (!isOpen) return
    console.log("[CreateInvoiceModal] Reset state (modal opened)")
    const list = mockStore.getClients()
    setStep(1)
    setClientId(list[0]?.id ?? "")
    setClientName(list[0]?.name ?? "")
    setSelectedServiceId("")
  }, [isOpen])

  const handleClientChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value
      setClientId(id)
      const c = clients.find((x) => x.id === id)
      setClientName(c?.name ?? "")
    },
    [clients]
  )

  const goNext = useCallback(() => {
    if (step === 1) {
      if (!clientId) return
      console.log("[CreateInvoiceModal] Step 1 complete: client selected", { clientId, clientName })
      setStep(2)
    } else if (step === 2) {
      if (!selectedServiceId) return
      console.log("[CreateInvoiceModal] Step 2 complete: service selected", {
        selectedServiceId,
        allowedProjectTypes,
      })
      setStep(3)
    }
  }, [step, clientId, clientName, selectedServiceId, allowedProjectTypes])

  const goBack = useCallback(() => {
    if (step === 2) setStep(1)
    else if (step === 3) {
      setStep(2)
      setSelectedServiceId("")
    }
  }, [step])

  const handleGenerateFromJob = useCallback(
    (result: { lineItems: InvoiceItem[]; subtotal: number; tax: number; total: number; dueDate: string }) => {
      if (!clientId || !clientName) return
      const payload = {
        clientId,
        clientName,
        status: "draft" as const,
        amount: result.subtotal,
        tax: result.tax,
        total: result.total,
        dueDate: result.dueDate,
        lineItems: result.lineItems,
      }
      mockStore.createInvoice(payload)
      console.log("[CreateInvoiceModal] Invoice generated from job-type calculator", payload)
      onSuccess()
      onClose()
    },
    [clientId, clientName, onSuccess, onClose]
  )

  if (!isOpen) return null

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        console.log("[CreateInvoiceModal] onOpenChange", open)
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Invoice — Step {step} of 3
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:text-gray-400 dark:hover:bg-gray-700"
                aria-label="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Step 1: Client */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Client *
              </label>
              <select
                value={clientId}
                onChange={handleClientChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {clients.length === 0 && (
                <p className="text-sm text-amber-600 dark:text-amber-400">No clients in store. Add clients first.</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Next: choose a service, then use the cost calculator for this client.
              </p>
            </div>
          )}

          {/* Step 2: Select service (job offering) */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Service *
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a service. Each supports specific project types (maintenance, installation, repair).
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-h-[50vh] overflow-y-auto">
                {services.map((s) => {
                  const allowed = getAllowedProjectTypes(s.id)
                  const isSelected = selectedServiceId === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedServiceId(s.id)}
                      className={`rounded-lg border-2 overflow-hidden text-left transition-colors ${
                        isSelected
                          ? "border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 dark:border-primary-500"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-32 object-cover object-top"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-white/95 text-gray-800 dark:bg-gray-900/95 dark:text-gray-200 shadow-sm">
                          {formatAllowedTypes(allowed)}
                        </div>
                      </div>
                      <div className="p-3">
                        <span className="block font-semibold text-sm text-gray-900 dark:text-white">
                          {s.name}
                        </span>
                        <span className="block text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {s.description}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Cost calculator */}
          {step === 3 && stubJob && selectedService && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
              <JobCostCalculator
                job={stubJob}
                clientName={clientName}
                allowedProjectTypes={allowedProjectTypes}
                jobImage={selectedService.image}
                onGenerateInvoice={handleGenerateFromJob}
              />
            </div>
          )}

          <div className="mt-6 flex justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Back
                </button>
              )}
            </div>
            <div className="flex gap-2">
              {step === 3 ? (
                /* Step 3: calculator has Generate; footer shows only Back */
                null
              ) : (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !clientId) ||
                    (step === 2 && !selectedServiceId)
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
