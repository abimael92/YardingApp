"use client"

import { useState, useEffect, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import { addDays } from "date-fns"
import { mockStore } from "@/src/data/mockStore"
import type { InvoiceItem } from "@/src/data/mockStore"
import { getServices } from "@/src/services/serviceCatalog"
import type { Service } from "@/src/domain/models"
import ServiceCard from "@/src/shared/ui/ServiceCard"

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function parseUnitPriceFromService(price: string): number {
  const m = price.match(/\$?([\d.]+)/)
  return m ? parseFloat(m[1]) : 0
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
  const [lineItems, setLineItems] = useState<InvoiceItem[]>([])
  const [qtyByServiceId, setQtyByServiceId] = useState<Record<string, number>>({})

  const clients = mockStore.getClients()
  const services = getServices()
  const settings = mockStore.getInvoiceSettings()

  // Reset state when modal opens. Only depend on isOpen; do NOT use clients in deps
  // (getClients() returns new array ref each call → infinite loop).
  useEffect(() => {
    if (!isOpen) return
    console.log("[CreateInvoiceModal] Reset state (modal opened)")
    const list = mockStore.getClients()
    setStep(1)
    setClientId(list[0]?.id ?? "")
    setClientName(list[0]?.name ?? "")
    setLineItems([])
    setQtyByServiceId({})
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

  const handleAddItem = useCallback(
    (s: Service) => {
      const qty = Math.max(1, qtyByServiceId[s.id] ?? 1)
      const unitPrice = parseUnitPriceFromService(s.price)
      const total = qty * unitPrice
      const newItem: InvoiceItem = {
        id: `li-${Date.now()}-${s.id}`,
        description: s.name,
        quantity: qty,
        unitPrice,
        total,
      }
      setLineItems((prev) => [...prev, newItem])
      setQtyByServiceId((prev) => ({ ...prev, [s.id]: 1 }))
    },
    [qtyByServiceId]
  )

  const removeLineItem = useCallback((id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0)
  const tax = subtotal * settings.taxRate
  const total = subtotal + tax
  const dueDate = addDays(new Date(), 30).toISOString().slice(0, 10)

  const goNext = useCallback(() => {
    if (step === 1) {
      if (!clientId) return
      console.log("[CreateInvoiceModal] Step 1 complete: client selected", { clientId, clientName })
      setStep(2)
    } else if (step === 2) {
      if (lineItems.length === 0) return
      console.log("[CreateInvoiceModal] Step 2 complete: items added", { count: lineItems.length, lineItems })
      setStep(3)
    }
  }, [step, clientId, clientName, lineItems])

  const goBack = useCallback(() => {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }, [step])

  const handleGenerate = useCallback(() => {
    const payload = {
      clientId,
      clientName,
      status: "draft" as const,
      amount: subtotal,
      tax,
      total,
      dueDate: new Date(dueDate).toISOString(),
      lineItems,
    }
    mockStore.createInvoice(payload)
    console.log("[CreateInvoiceModal] Step 3 complete: invoice generated", payload)
    onSuccess()
    onClose()
  }, [clientId, clientName, subtotal, tax, total, dueDate, lineItems, onSuccess, onClose])

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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
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

          {/* Step 1: Client selection (reuse pattern from clients/jobs page) */}
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
            </div>
          )}

          {/* Step 2: Add items (reuse ServiceCatalog / getServices + ServiceCard) */}
          {step === 2 && (
            <div className="max-h-[60vh] space-y-4 overflow-y-auto py-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Pick services from the catalog and add them to the invoice.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-col gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <ServiceCard service={s} />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={qtyByServiceId[s.id] ?? 1}
                        onChange={(e) =>
                          setQtyByServiceId((prev) => ({ ...prev, [s.id]: Math.max(1, +e.target.value || 1) }))
                        }
                        className="w-20 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddItem(s)}
                        className="inline-flex items-center gap-1 rounded bg-emerald-600 px-3 py-1 text-sm font-medium text-white hover:bg-emerald-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                        Add to invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {lineItems.length > 0 && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-800">
                    Added items ({lineItems.length})
                  </p>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {lineItems.map((i) => (
                      <li
                        key={i.id}
                        className="flex items-center justify-between px-3 py-2 text-sm dark:text-gray-300"
                      >
                        <span>{i.description} × {i.quantity} @ ${i.unitPrice} = ${i.total.toFixed(2)}</span>
                        <button
                          type="button"
                          onClick={() => removeLineItem(i.id)}
                          className="rounded p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Preview & generate */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Client</p>
                <p className="text-gray-900 dark:text-white">{clientName || "—"}</p>
              </div>
              <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Description</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Qty</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Unit</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((i) => (
                      <tr key={i.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="px-3 py-2 text-gray-900 dark:text-white">{i.description}</td>
                        <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">{i.quantity}</td>
                        <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                          ${i.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-white">
                          ${i.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax ({settings.taxRate * 100}%)</span>
                  <span className="text-gray-900 dark:text-white">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 font-medium dark:border-gray-700">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Due date</span>
                  <span>{dueDate}</span>
                </div>
              </div>
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
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !clientId) ||
                    (step === 2 && lineItems.length === 0)
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Generate invoice
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
