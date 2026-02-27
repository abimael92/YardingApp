"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getServices } from "@/src/services/serviceCatalog"
import { getAllowedProjectTypes } from "@/src/data/serviceProjectTypes"
import { calculateQuoteRange, type QuoteCalculatorInput } from "@/src/lib/quoteCalculator"
import { createQuoteRequest } from "@/app/actions/quoteRequest"
import type { ProjectType } from "@/src/lib/pricingCore"

const ZONES = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
] as const

export default function RequestQuotePage() {
  const searchParams = useSearchParams()
  const services = getServices()
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<ProjectType>("maintenance")
  const [zone, setZone] = useState<"residential" | "commercial">("residential")
  const [sqft, setSqft] = useState(0)
  const [extras, setExtras] = useState("")

  // Auto-calculated from sqft (hidden from customer): hours = (sqft/1000)*1.5, min 2; visits = 1
  const computedHours = sqft > 0 ? Math.max(2, (sqft / 1000) * 1.5) : 2
  const computedVisits = 1
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  // Prefill service when landing page sends ?serviceId= (e.g. from "Request Quote" on a service card)
  useEffect(() => {
    const id = searchParams.get("serviceId")
    if (id && services.some((s) => s.id === id)) {
      setServiceId(id)
      const types = getAllowedProjectTypes(id)
      setProjectType(types[0])
    }
  }, [searchParams, services])

  const allowedTypes = useMemo(
    () => (serviceId ? getAllowedProjectTypes(serviceId) : (["maintenance", "installation", "repair"] as ProjectType[])),
    [serviceId]
  )

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  )

  const quoteResult = useMemo(() => {
    const input: QuoteCalculatorInput = {
      serviceName: selectedService?.name,
      hours: computedHours,
      sqft,
      visits: computedVisits,
      zone,
      projectType,
      extras: extras || undefined,
    }
    return calculateQuoteRange(input)
  }, [computedHours, sqft, computedVisits, zone, projectType, extras, selectedService?.name])

  const handleServiceChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value
      setServiceId(id)
      const types = id ? getAllowedProjectTypes(id) : (["maintenance"] as ProjectType[])
      setProjectType(types[0])
    },
    []
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      if (!selectedService || !quoteResult.valid) {
        setError("Please fill required fields and ensure estimate is valid.")
        return
      }
      if (!clientName.trim() || !clientEmail.trim()) {
        setError("Name and email are required.")
        return
      }
      setSubmitting(true)
      const result = await createQuoteRequest({
        client_name: clientName.trim(),
        client_email: clientEmail.trim(),
        client_phone: clientPhone.trim() || undefined,
        service_name: selectedService.name,
        project_type: projectType,
        zone,
        hours: computedHours,
        sqft,
        visits: computedVisits,
        extras: extras.trim() || undefined,
        min_cents: quoteResult.minTotal * 100,
        max_cents: quoteResult.maxTotal * 100,
        breakdown_metadata: quoteResult.breakdown as unknown as Record<string, unknown>,
      })
      setSubmitting(false)
      if (result.success) {
        setSubmitted(true)
      } else {
        setError(result.error)
      }
    },
    [
      selectedService,
      quoteResult,
      clientName,
      clientEmail,
      clientPhone,
      projectType,
      zone,
      computedHours,
      sqft,
      computedVisits,
      extras,
    ]
  )

  const pageBg = "min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/80 to-amber-50/60 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800"

  if (submitted) {
    return (
      <div className={`${pageBg} py-12 px-4`}>
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-700 dark:bg-emerald-900/30">
            {/* Success Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-800">
              <svg className="h-8 w-8 text-emerald-600 dark:text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-emerald-800 dark:text-emerald-200">
              Quote Request Received!
            </h2>

            <p className="mt-2 text-emerald-700 dark:text-emerald-300">
              We'll review your request and get back to you with a formal quote.
              {clientPhone && ` You'll receive SMS updates at ${clientPhone}`}
            </p>

            {submittedId && (
              <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400">
                Reference ID: {submittedId.substring(0, 8)}...
              </p>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Home
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  // Reset form fields
                  setClientName("");
                  setClientEmail("");
                  setClientPhone("");
                  setServiceId("");
                  setSqft(0);
                  setExtras("");
                  setProjectType("maintenance");
                  setZone("residential");
                  setSubmittedId(null);
                }}
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-emerald-700 shadow-md border-2 border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors dark:bg-gray-800 dark:text-emerald-300 dark:border-emerald-700 dark:hover:bg-gray-700"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Request Another Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pageBg} py-8 px-4 sm:px-6`}>
    <div className="mx-auto max-w-2xl pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request a job quote</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Get an estimated price range. Final quote may vary after we review your details.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-xl border-2 border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20 p-6 shadow-lg">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone*</label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Service *</label>
          <select
            value={serviceId}
            onChange={handleServiceChange}
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white"
            required
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {serviceId && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Project type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
              className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white"
            >
              {allowedTypes.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Zone</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as "residential" | "commercial")}
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white"
          >
            {ZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Property size (sq ft)</label>
          <input
            type="number"
            min={0}
            max={100000}
            value={sqft || ""}
            onChange={(e) => setSqft(parseInt(e.target.value, 10) || 0)}
            placeholder="e.g. 1500"
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            We use this to estimate labor and provide your price range. Hours and visit count are calculated automatically.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Extras / notes (optional)</label>
          <input
            type="text"
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            placeholder="e.g. urgency, access, special requests"
            className="w-full rounded-lg border-2 border-emerald-200 bg-white px-3 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
          />
        </div>

        {quoteResult.valid && (quoteResult.minTotal > 0 || quoteResult.maxTotal > 0) && (
          <div className="rounded-lg border-2 border-emerald-300 bg-emerald-100 p-4 dark:border-emerald-700 dark:bg-emerald-900/40">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Estimated range</p>
            <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              ${quoteResult.minTotal.toFixed(0)} – ${quoteResult.maxTotal.toFixed(0)}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              Approximate. Final quote may vary. No tax breakdown in estimate.
            </p>
          </div>
        )}

        {!quoteResult.valid && quoteResult.errors.length > 0 && (
          <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
            <ul className="list-inside list-disc">
              {quoteResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !quoteResult.valid || !clientName.trim() || !clientEmail.trim() || !serviceId}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3.5 font-semibold text-white shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "Submitting…" : "Request Job"}
          </button>
        </div>
      </form>
    </div>
    </div>
  )
}
