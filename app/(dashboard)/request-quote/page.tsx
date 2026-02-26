"use client"

import { useState, useMemo, useCallback } from "react"
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
  const services = getServices()
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [serviceId, setServiceId] = useState("")
  const [projectType, setProjectType] = useState<ProjectType>("maintenance")
  const [zone, setZone] = useState<"residential" | "commercial">("residential")
  const [hours, setHours] = useState(0)
  const [sqft, setSqft] = useState(0)
  const [visits, setVisits] = useState(1)
  const [extras, setExtras] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

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
      hours,
      sqft,
      visits,
      zone,
      projectType,
      extras: extras || undefined,
    }
    return calculateQuoteRange(input)
  }, [hours, sqft, visits, zone, projectType, extras, selectedService?.name])

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
        hours,
        sqft,
        visits,
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
      hours,
      sqft,
      visits,
      extras,
    ]
  )

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-900/20">
        <h2 className="text-xl font-semibold text-green-800 dark:text-green-200">Quote request received</h2>
        <p className="mt-2 text-green-700 dark:text-green-300">
          We&apos;ll review your request and get back to you with a formal quote. You may receive an SMS confirmation if you provided a phone number.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Request a job quote</h1>
      <p className="mt-1 text-gray-600 dark:text-gray-400">
        Get an estimated price range. Final quote may vary after we review your details.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
          <input
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Phone (optional)</label>
          <input
            type="tel"
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Service *</label>
          <select
            value={serviceId}
            onChange={handleServiceChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {ZONES.map((z) => (
              <option key={z.value} value={z.value}>
                {z.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Hours (est.)</label>
            <input
              type="number"
              min={0}
              max={200}
              step={0.25}
              value={hours || ""}
              onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Sq ft</label>
            <input
              type="number"
              min={0}
              max={100000}
              value={sqft || ""}
              onChange={(e) => setSqft(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Visits</label>
            <input
              type="number"
              min={1}
              max={50}
              value={visits}
              onChange={(e) => setVisits(parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Extras / notes (optional)</label>
          <input
            type="text"
            value={extras}
            onChange={(e) => setExtras(e.target.value)}
            placeholder="e.g. urgency, access, special requests"
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {quoteResult.valid && (quoteResult.minTotal > 0 || quoteResult.maxTotal > 0) && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <ul className="list-inside list-disc">
              {quoteResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !quoteResult.valid || !clientName.trim() || !clientEmail.trim() || !serviceId}
          className="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? "Submitting…" : "Request Job"}
        </button>
      </form>
    </div>
  )
}
