"use client"

import { useState, useMemo, useCallback } from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { motion, AnimatePresence } from "framer-motion"
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  ClockIcon,
  Squares2X2Icon,
  CalendarIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  BuildingOfficeIcon,
  TagIcon
} from "@heroicons/react/24/outline"
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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(date))
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
  const [activeTab, setActiveTab] = useState<"details" | "breakdown" | "message">("details")

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

  // Calculate price range
  const minPrice = Number(quote.min_cents) / 100
  const maxPrice = Number(quote.max_cents) / 100
  const approvedMin = quote.approved_min_cents ? Number(quote.approved_min_cents) / 100 : null
  const approvedMax = quote.approved_max_cents ? Number(quote.approved_max_cents) / 100 : null

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "reviewed": return "bg-blue-100 text-blue-800 border-blue-200"
      case "sent": return "bg-green-100 text-green-800 border-green-200"
      case "approved": return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-gradient-to-br from-black/80 via-black/70 to-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-hidden rounded-2xl border border-white/20 bg-white shadow-2xl dark:bg-gray-800"
          onOpenAutoFocus={handleOpen}
        >
          {/* Header with gradient */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

            <div className="relative px-6 py-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border-2 border-white/30 shadow-xl">
                    <DocumentTextIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <Dialog.Title className="text-xl font-bold text-white">
                      Quote Request
                    </Dialog.Title>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm border border-white/30">
                        <TagIcon className="h-3 w-3" />
                        {quote.service_name}
                      </span>
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm ${getStatusColor(quote.status)}`}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-xl p-2 text-white/80 hover:bg-white/20 hover:text-white transition-all hover:rotate-90 duration-200"
                    aria-label="Close"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </div>

              {/* Quick stats */}
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <p className="text-xs text-white/80">Created</p>
                  <p className="text-sm font-medium text-white">{formatDate(quote.created_at)}</p>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <p className="text-xs text-white/80">Estimate</p>
                  <p className="text-sm font-medium text-white">
                    {formatCents(quote.min_cents)} - {formatCents(quote.max_cents)}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <p className="text-xs text-white/80">Approved</p>
                  <p className="text-sm font-medium text-white">
                    {approvedMin && approvedMax
                      ? `${formatCents(BigInt(approvedMin * 100))} - ${formatCents(BigInt(approvedMax * 100))}`
                      : "Not set"}
                  </p>
                </div>
                <div className="rounded-lg bg-white/10 backdrop-blur-sm px-3 py-2 border border-white/20">
                  <p className="text-xs text-white/80">Sent</p>
                  <p className="text-sm font-medium text-white">
                    {quote.sent_at ? formatDate(quote.sent_at) : "Not sent"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-6 pt-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            {[
              { id: "details", label: "Client Details", icon: UserIcon },
              { id: "breakdown", label: "Cost Breakdown", icon: ChartBarIcon },
              { id: "message", label: "Message & Pricing", icon: ChatBubbleLeftRightIcon },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all ${isActive
                      ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm border-b-2 border-green-500"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Content area */}
          <div className="max-h-[calc(90vh-320px)] overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {/* Client Details Tab */}
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Client Information Card */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                      <UserIcon className="h-4 w-4 text-green-500" />
                      Client Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                          {quote.client_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{quote.client_name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <EnvelopeIcon className="h-3 w-3" />
                              {quote.client_email}
                            </span>
                            {quote.client_phone && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span className="flex items-center gap-1">
                                  <PhoneIcon className="h-3 w-3" />
                                  {quote.client_phone}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Details Card */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                      <WrenchScrewdriverIcon className="h-4 w-4 text-green-500" />
                      Project Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.service_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TagIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Project Type</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.project_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Zone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.zone}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Hours</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.hours}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Square Feet</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.sqft.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Visits</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{quote.visits}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {quote.extras && (
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-400 flex items-center gap-1 mb-1">
                          <TagIcon className="h-3 w-3" />
                          Extras
                        </p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">{quote.extras}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Cost Breakdown Tab */}
              {activeTab === "breakdown" && breakdown && (
                <motion.div
                  key="breakdown"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                      <ChartBarIcon className="h-4 w-4 text-green-500" />
                      Detailed Cost Breakdown
                    </h3>

                    <div className="space-y-4">
                      {/* Cost items */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Labor</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCents(BigInt(Math.round((breakdown.labor ?? 0) * 100)))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Materials</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCents(BigInt(Math.round((breakdown.materials ?? 0) * 100)))}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Visit Fees</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCents(BigInt(Math.round((breakdown.visitFees ?? 0) * 100)))}
                          </span>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold text-gray-800 dark:text-gray-200">Subtotal</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCents(BigInt(Math.round((breakdown.subtotal ?? 0) * 100)))}
                          </span>
                        </div>
                      </div>

                      {/* Price Range Visualization */}
                      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-3">Price Range Analysis</p>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Min Estimate</span>
                              <span className="font-medium text-gray-900 dark:text-white">{formatCents(quote.min_cents)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full"
                                style={{ width: `${(minPrice / (maxPrice * 1.2)) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-600 dark:text-gray-400">Max Estimate</span>
                              <span className="font-medium text-gray-900 dark:text-white">{formatCents(quote.max_cents)}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${(maxPrice / (maxPrice * 1.2)) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Message & Pricing Tab */}
              {activeTab === "message" && (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Price Inputs */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-500" />
                      Approved Pricing
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Minimum Price ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={overrideMin !== "" ? overrideMin : String(effectiveMin)}
                            onChange={(e) => setOverrideMin(e.target.value)}
                            disabled={isSent}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-60"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Maximum Price ($)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={overrideMax !== "" ? overrideMax : String(effectiveMax)}
                            onChange={(e) => setOverrideMax(e.target.value)}
                            disabled={isSent}
                            className="w-full pl-8 pr-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Price Preview */}
                    {(effectiveMin > 0 || effectiveMax > 0) && (
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                        <p className="text-xs font-medium text-green-800 dark:text-green-400 flex items-center gap-1 mb-1">
                          <CheckCircleIcon className="h-3 w-3" />
                          Final Quote Range
                        </p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${effectiveMin.toFixed(2)} - ${effectiveMax.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message to Client */}
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-800 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700 mb-4">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 text-green-500" />
                      Message to Client
                    </h3>

                    <textarea
                      value={messageToClient}
                      onChange={(e) => setMessageToClient(e.target.value)}
                      disabled={isSent}
                      rows={4}
                      className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all disabled:opacity-60 resize-none"
                      placeholder="Add a personal message to the client..."
                    />

                    {messageToClient && (
                      <div className="mt-2 flex justify-end">
                        <span className="text-xs text-gray-400">
                          {messageToClient.length} characters
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Original Message (if exists) */}
                  {quote.message_to_client && quote.message_to_client !== messageToClient && (
                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Original message:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{quote.message_to_client}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XMarkIcon className="h-4 w-4" />
                  {error}
                </p>
              </motion.div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:scale-105 active:scale-95"
            >
              Close
            </button>

            {!isSent && (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  {saving ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PencilSquareIcon className="h-4 w-4" />
                  )}
                  {saving ? "Saving..." : "Save Draft"}
                </button>

                <button
                  type="button"
                  onClick={handleSendToClient}
                  disabled={sending}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-green-500/30 flex items-center gap-2"
                >
                  {sending ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-4 w-4" />
                  )}
                  {sending ? "Sending..." : "Send to Client"}
                </button>
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}