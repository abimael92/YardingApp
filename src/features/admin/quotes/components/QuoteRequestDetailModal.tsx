"use client"

import { useState, useMemo, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { updateQuoteRequest, sendQuoteToClient } from "@/app/actions/quoteRequest"
import { markQuoteNotificationReadByQuoteId } from "@/app/actions/notifications"

export type QuoteRequestRow = {
  id: string
  client_name: string
  client_email: string
  client_phone: string | null
  service_name: string
  project_type: string
  zone: string
  hours: number
  sqft: number
  visits: number
  extras: string | null
  min_cents: bigint
  max_cents: bigint
  breakdown_metadata: unknown
  status: string
  message_to_client: string | null
  approved_min_cents: bigint | null
  approved_max_cents: bigint | null
  created_at: Date
  updated_at: Date
  sent_at: Date | null
}

interface QuoteRequestDetailModalProps {
  quote: QuoteRequestRow | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function formatCents(c: bigint) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(c) / 100)
}

export default function QuoteRequestDetailModal({
  quote,
  isOpen,
  onClose,
  onSuccess,
}: QuoteRequestDetailModalProps) {
  const [overrideMin, setOverrideMin] = useState<string>("")
  const [overrideMax, setOverrideMax] = useState<string>("")
  const [messageToClient, setMessageToClient] = useState("")
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  const effectiveMin = useMemo(() => {
    if (overrideMin !== "") {
      const n = parseFloat(overrideMin)
      return Number.isFinite(n) ? n : Number(quote?.approved_min_cents ?? quote?.min_cents ?? 0) / 100
    }
    return Number(quote?.approved_min_cents ?? quote?.min_cents ?? 0) / 100
  }, [overrideMin, quote])
  const effectiveMax = useMemo(() => {
    if (overrideMax !== "") {
      const n = parseFloat(overrideMax)
      return Number.isFinite(n) ? n : Number(quote?.approved_max_cents ?? quote?.max_cents ?? 0) / 100
    }
    return Number(quote?.approved_max_cents ?? quote?.max_cents ?? 0) / 100
  }, [overrideMax, quote])

  const resetForm = useCallback(() => {
    if (quote) {
      setOverrideMin("")
      setOverrideMax("")
      setMessageToClient(quote.message_to_client ?? "")
    }
  }, [quote])

  const handleOpen = useCallback(() => {
    if (quote) {
      setOverrideMin("")
      setOverrideMax("")
      setMessageToClient(quote.message_to_client ?? "")
      setError("")
      markQuoteNotificationReadByQuoteId(quote.id)
    }
  }, [quote])

  const handleSave = useCallback(async () => {
    if (!quote) return
    setSaving(true)
    setError("")
    const result = await updateQuoteRequest(quote.id, {
      status: "reviewed",
      message_to_client: messageToClient.trim() || null,
      approved_min_cents: Math.round(effectiveMin * 100),
      approved_max_cents: Math.round(effectiveMax * 100),
    })
    setSaving(false)
    if (result.success) {
      onSuccess()
      resetForm()
    } else {
      setError(result.error)
    }
  }, [quote, messageToClient, effectiveMin, effectiveMax, onSuccess, resetForm])

  const handleSendToClient = useCallback(async () => {
    if (!quote) return
    setSending(true)
    setError("")
    await updateQuoteRequest(quote.id, {
      message_to_client: messageToClient.trim() || null,
      approved_min_cents: Math.round(effectiveMin * 100),
      approved_max_cents: Math.round(effectiveMax * 100),
    })
    const result = await sendQuoteToClient(quote.id)
    setSending(false)
    if (result.success) {
      onSuccess()
      onClose()
    } else {
      setError(result.error)
    }
  }, [quote, messageToClient, effectiveMin, effectiveMax, onSuccess, onClose])

  if (!quote) return null

  const breakdown =
    quote.breakdown_metadata as
    | {
      labor?: number
      materials?: number
      visitFees?: number
      subtotal?: number
    }
    | null
  const isSent = quote.status === "sent"

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800"
          onOpenAutoFocus={handleOpen}
        >
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              Quote request — {quote.service_name}
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

          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Client</h4>
              <p className="text-gray-900 dark:text-white">{quote.client_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client_email}</p>
              {quote.client_phone && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{quote.client_phone}</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Original input</h4>
              <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Service: {quote.service_name}</li>
                <li>Project type: {quote.project_type} · Zone: {quote.zone}</li>
                <li>Hours: {quote.hours} · Sq ft: {quote.sqft} · Visits: {quote.visits}</li>
                {quote.extras && <li>Extras: {quote.extras}</li>}
              </ul>
            </div>

            {breakdown && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Internal breakdown (admin)</h4>
                <ul className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  <li>Labor: {formatCents(BigInt(Math.round((breakdown.labor ?? 0) * 100)))}</li>
                  <li>Materials: {formatCents(BigInt(Math.round((breakdown.materials ?? 0) * 100)))}</li>
                  <li>Visit fees: {formatCents(BigInt(Math.round((breakdown.visitFees ?? 0) * 100)))}</li>
                  <li>Subtotal: {formatCents(BigInt(Math.round((breakdown.subtotal ?? 0) * 100)))}</li>
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated range</h4>
              <div className="mt-2 flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Min ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={overrideMin !== "" ? overrideMin : String(effectiveMin)}
                    onChange={(e) => setOverrideMin(e.target.value)}
                    disabled={isSent}
                    className="w-28 rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">Max ($)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={overrideMax !== "" ? overrideMax : String(effectiveMax)}
                    onChange={(e) => setOverrideMax(e.target.value)}
                    disabled={isSent}
                    className="w-28 rounded border border-gray-300 bg-white px-2 py-1.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message to client (optional)</label>
              <textarea
                value={messageToClient}
                onChange={(e) => setMessageToClient(e.target.value)}
                disabled={isSent}
                rows={2}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-60"
                placeholder="Custom message when sending quote"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
            {!isSent && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save (mark reviewed)"}
                </button>
                <button
                  type="button"
                  onClick={handleSendToClient}
                  disabled={sending}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {sending ? "Sending…" : "Send to client"}
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
