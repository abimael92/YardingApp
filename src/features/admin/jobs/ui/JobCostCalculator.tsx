"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Job } from "@/src/domain/entities"
import type { InvoiceItem } from "@/src/data/mockStore"
import { mockStore } from "@/src/data/mockStore"
import { addDays } from "date-fns"

const PHOENIX_TAX_RATE = 0.086
const VISIT_FEE = 50

type ProjectType = "maintenance" | "installation" | "repair"
type Zone = "residential" | "commercial"

// Maintenance $45/hr $2/sqft | Installation $60/hr $5/sqft | Repair $75/hr $8/sqft
const RATES: Record<
  ProjectType,
  { baseRatePerHour: number; materialCostPerSqft: number }
> = {
  maintenance: { baseRatePerHour: 45, materialCostPerSqft: 2 },
  installation: { baseRatePerHour: 60, materialCostPerSqft: 5 },
  repair: { baseRatePerHour: 75, materialCostPerSqft: 8 },
}

function inferProjectType(title: string): ProjectType {
  const t = title.toLowerCase()
  if (t.includes("install")) return "installation"
  if (t.includes("repair") || t.includes("fix")) return "repair"
  return "maintenance"
}

const HOURS_MIN = 0
const HOURS_MAX = 200
const SQFT_MIN = 0
const SQFT_MAX = 100_000
const VISITS_MIN = 1
const VISITS_MAX = 50

function validateInputs(
  hours: number,
  sqft: number,
  visits: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (hours < HOURS_MIN || hours > HOURS_MAX) {
    errors.push(`Hours must be between ${HOURS_MIN} and ${HOURS_MAX}`)
  }
  if (sqft < SQFT_MIN || sqft > SQFT_MAX) {
    errors.push(`Square feet must be between ${SQFT_MIN} and ${SQFT_MAX}`)
  }
  if (visits < VISITS_MIN || visits > VISITS_MAX) {
    errors.push(`Visits must be between ${VISITS_MIN} and ${VISITS_MAX}`)
  }
  return { valid: errors.length === 0, errors }
}

const PRESETS = [
  {
    id: "lawn",
    name: "Lawn Maintenance",
    projectType: "maintenance" as ProjectType,
    hours: 2,
    sqft: 1500,
    visits: 1,
  },
  {
    id: "sprinkler",
    name: "Sprinkler Repair",
    projectType: "repair" as ProjectType,
    hours: 1,
    sqft: 0,
    visits: 1,
  },
  {
    id: "install",
    name: "Full Installation",
    projectType: "installation" as ProjectType,
    hours: 8,
    sqft: 2000,
    visits: 2,
  },
]

/** Job-type → image URL (public). Jobs have no image; we use type-based fallbacks. */
const JOB_TYPE_IMAGES: Record<ProjectType, string> = {
  maintenance: "/professional-lawn-worker.jpg",
  installation: "/professional-landscaping-team-working-on-desert-ga.jpg",
  repair: "/tree-specialist-worker.jpg",
}

/** Chip colors for job type, matching ServiceCard-style category chips. */
const JOB_TYPE_CHIP_STYLES: Record<ProjectType, string> = {
  maintenance:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  installation:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  repair: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
}

export interface CalculatorResult {
  lineItems: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  dueDate: string
}

interface JobCostCalculatorProps {
  job: Job
  clientName: string
  /** When provided (e.g. from CreateInvoiceModal), restrict project type to these only. */
  allowedProjectTypes?: ProjectType[]
  /** Optional image URL (e.g. from service); else type-based fallback. */
  jobImage?: string
  onGenerateInvoice: (result: CalculatorResult) => void
}

const ALL_PROJECT_TYPES: ProjectType[] = ["maintenance", "installation", "repair"]

export default function JobCostCalculator({
  job,
  clientName,
  allowedProjectTypes,
  jobImage,
  onGenerateInvoice,
}: JobCostCalculatorProps) {
  const effectiveAllowed = useMemo(
    () =>
      allowedProjectTypes?.length
        ? allowedProjectTypes
        : ALL_PROJECT_TYPES,
    [allowedProjectTypes]
  )
  const [hours, setHours] = useState(0)
  const [sqft, setSqft] = useState(0)
  const [zone, setZone] = useState<Zone>("residential")
  const [projectType, setProjectType] = useState<ProjectType>(effectiveAllowed[0])
  const [visits, setVisits] = useState(1)

  useEffect(() => {
    console.log("📋 Job data received:", {
      id: job.id,
      title: job.title,
      type: (job as { type?: string }).type,
      estimatedDuration: job.estimatedDuration,
      estimatedCost: job.estimatedCost,
      allowedProjectTypes: effectiveAllowed,
    })
    const inferred = inferProjectType(job.title)
    const initialType = effectiveAllowed.includes(inferred)
      ? inferred
      : effectiveAllowed[0]
    setProjectType(initialType)
    const h = job.estimatedDuration ? job.estimatedDuration / 60 : 0
    setHours(h)
    console.log("🔧 Project type:", initialType, "(allowed:", effectiveAllowed.join(", ") + ")")
  }, [job, effectiveAllowed])

  const validation = useMemo(
    () => validateInputs(hours, sqft, visits),
    [hours, sqft, visits]
  )

  const filteredPresets = useMemo(
    () => PRESETS.filter((p) => effectiveAllowed.includes(p.projectType)),
    [effectiveAllowed]
  )

  const { labor, materials, visitFees, subtotal, tax, total } = useMemo(() => {
    const mult = zone === "commercial" ? 1.3 : 1
    const { baseRatePerHour, materialCostPerSqft } = RATES[projectType]
    const l = Math.round(hours * baseRatePerHour * mult * 100) / 100
    const m = Math.round(sqft * materialCostPerSqft * mult * 100) / 100
    const v = Math.max(0, visits - 1) * VISIT_FEE
    const sub = l + m + v
    const t = Math.round(sub * PHOENIX_TAX_RATE * 100) / 100
    const tot = Math.round((sub + t) * 100) / 100
    console.log("[JobCostCalculator] Recalculate", {
      hours,
      sqft,
      zone,
      projectType,
      visits,
      labor: l,
      materials: m,
      visitFees: v,
      subtotal: sub,
      tax: t,
      total: tot,
    })
    return { labor: l, materials: m, visitFees: v, subtotal: sub, tax: t, total: tot }
  }, [hours, sqft, zone, projectType, visits])

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n)

  const handlePresetChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const id = e.target.value
      if (!id) return
      const p = PRESETS.find((x) => x.id === id)
      if (!p) return
      setProjectType(p.projectType)
      setHours(p.hours)
      setSqft(p.sqft)
      setVisits(p.visits)
      console.log("📋 Preset applied:", p.name, p)
    },
    []
  )

  const handleGenerate = useCallback(() => {
    if (!validation.valid) {
      console.warn("[JobCostCalculator] Generate blocked: validation failed", validation.errors)
      return
    }
    const rate = RATES[projectType].baseRatePerHour
    const matRate = RATES[projectType].materialCostPerSqft
    const mult = zone === "commercial" ? 1.3 : 1
    const extraVisits = Math.max(0, visits - 1)
    const lineItems: InvoiceItem[] = []
    if (hours > 0) {
      lineItems.push({
        id: `li-labour-${Date.now()}`,
        description: `Labor — ${job.title}`,
        quantity: hours,
        unitPrice: Math.round(rate * mult * 100) / 100,
        total: labor,
      })
    }
    if (sqft > 0) {
      lineItems.push({
        id: `li-mat-${Date.now()}`,
        description: "Materials",
        quantity: sqft,
        unitPrice: Math.round(matRate * mult * 100) / 100,
        total: materials,
      })
    }
    if (extraVisits > 0) {
      lineItems.push({
        id: `li-visits-${Date.now()}`,
        description: "Additional site visits",
        quantity: extraVisits,
        unitPrice: VISIT_FEE,
        total: visitFees,
      })
    }
    if (lineItems.length === 0) {
      lineItems.push({
        id: `li-base-${Date.now()}`,
        description: `Job — ${job.title}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
      })
    }
    const dueDate = addDays(new Date(), 30).toISOString().slice(0, 10)
    const result: CalculatorResult = {
      lineItems,
      subtotal,
      tax,
      total,
      dueDate: new Date(dueDate).toISOString(),
    }
    mockStore.addCalculationEntry({
      jobId: job.id,
      jobNumber: job.jobNumber,
      clientId: job.clientId,
      clientName,
      inputs: { hours, sqft, visits, zone, projectType },
      breakdown: {
        labor,
        materials,
        visitFees,
        subtotal,
        tax,
        total,
      },
    })
    console.log("[JobCostCalculator] Generate invoice", result)
    onGenerateInvoice(result)
  }, [
    validation.valid,
    validation.errors,
    job.id,
    job.jobNumber,
    job.clientId,
    job.title,
    clientName,
    hours,
    sqft,
    visits,
    zone,
    projectType,
    labor,
    materials,
    visitFees,
    subtotal,
    tax,
    total,
    onGenerateInvoice,
  ])

  const imgSrc =
    jobImage ??
    (job as { image?: string }).image ??
    JOB_TYPE_IMAGES[projectType]
  const chipStyle = JOB_TYPE_CHIP_STYLES[projectType]
  const projectTypeLabel =
    projectType === "maintenance"
      ? "Maintenance"
      : projectType === "installation"
        ? "Installation"
        : "Repair"

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      {/* Job image + type chip — same layout as ServiceCard */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img
          src={imgSrc}
          alt={job.title}
          className="w-full h-48 object-cover object-top"
          loading="lazy"
          decoding="async"
        />
        <div
          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium ${chipStyle}`}
        >
          {projectTypeLabel}
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Cost calculator
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {job.jobNumber} — {job.title} · {clientName}
      </p>

      {/* Preset templates (only for allowed project types) */}
      {filteredPresets.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Preset templates
          </label>
          <select
            defaultValue=""
            onChange={handlePresetChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Choose a preset…</option>
            {filteredPresets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.hours}h, {p.sqft} sqft
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time spent (hours)
          </label>
          <input
            type="number"
            min={HOURS_MIN}
            max={HOURS_MAX}
            step={0.25}
            value={hours || ""}
            onChange={(e) => {
              const v = parseFloat(e.target.value)
              const n = Number.isFinite(v) ? Math.max(HOURS_MIN, Math.min(HOURS_MAX, v)) : 0
              setHours(n)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {HOURS_MIN}–{HOURS_MAX} hrs
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Square footage (sqft)
          </label>
          <input
            type="number"
            min={SQFT_MIN}
            max={SQFT_MAX}
            value={sqft || ""}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              const n = Number.isFinite(v) ? Math.max(SQFT_MIN, Math.min(SQFT_MAX, v)) : 0
              setSqft(n)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {SQFT_MIN.toLocaleString()}–{SQFT_MAX.toLocaleString()} sqft
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Zone
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as Zone)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="residential">Residential (1×)</option>
            <option value="commercial">Commercial (1.3×)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Project type
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
            disabled={effectiveAllowed.length === 1}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 disabled:opacity-75 disabled:cursor-default dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            {effectiveAllowed.map((t) => (
              <option key={t} value={t}>
                {t === "maintenance" && "Maintenance ($45/hr, $2/sqft)"}
                {t === "installation" && "Installation ($60/hr, $5/sqft)"}
                {t === "repair" && "Repair ($75/hr, $8/sqft)"}
              </option>
            ))}
          </select>
          {effectiveAllowed.length === 1 && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This service supports {projectType} only.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of site visits
          </label>
          <input
            type="number"
            min={VISITS_MIN}
            max={VISITS_MAX}
            value={visits}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10)
              const n = Number.isFinite(v) ? Math.max(VISITS_MIN, Math.min(VISITS_MAX, v)) : 1
              setVisits(n)
            }}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {VISITS_MIN}–{VISITS_MAX} visits
          </p>
        </div>
      </div>

      {!validation.valid && validation.errors.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          <p className="font-medium">Please fix inputs:</p>
          <ul className="mt-1 list-inside list-disc">
            {validation.errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Labor: {hours} h × {formatCurrency(RATES[projectType].baseRatePerHour * (zone === "commercial" ? 1.3 : 1))}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(labor)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Materials: {sqft} sqft × {formatCurrency(RATES[projectType].materialCostPerSqft * (zone === "commercial" ? 1.3 : 1))}/sqft
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(materials)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Visits: ({(visits - 1) < 0 ? 0 : visits - 1}) × {formatCurrency(VISIT_FEE)}
          </span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(visitFees)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax (8.6% Phoenix)</span>
          <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between border-t-2 border-emerald-200 pt-2 dark:border-emerald-800">
          <span className="font-semibold text-gray-900 dark:text-white">TOTAL</span>
          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={!validation.valid}
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate Invoice
      </button>
      {!validation.valid && (
        <p className="text-center text-xs text-amber-600 dark:text-amber-400">
          Fix validation errors above to enable Generate Invoice.
        </p>
      )}
    </div>
  )
}
