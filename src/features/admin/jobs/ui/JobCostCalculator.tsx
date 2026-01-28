"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { Job } from "@/src/domain/entities"
import type { InvoiceItem } from "@/src/data/mockStore"
import { addDays } from "date-fns"

const PHOENIX_TAX_RATE = 0.086
const VISIT_FEE = 50

type ProjectType = "maintenance" | "installation" | "repair"
type Zone = "residential" | "commercial"

const RATES: Record<
  ProjectType,
  { baseRatePerHour: number; materialCostPerSqft: number }
> = {
  maintenance: { baseRatePerHour: 45, materialCostPerSqft: 2 },
  installation: { baseRatePerHour: 60, materialCostPerSqft: 6 },
  repair: { baseRatePerHour: 55, materialCostPerSqft: 4 },
}

function inferProjectType(title: string): ProjectType {
  const t = title.toLowerCase()
  if (t.includes("install")) return "installation"
  if (t.includes("repair")) return "repair"
  return "maintenance"
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
  onGenerateInvoice: (result: CalculatorResult) => void
}

export default function JobCostCalculator({
  job,
  clientName,
  onGenerateInvoice,
}: JobCostCalculatorProps) {
  const [hours, setHours] = useState(0)
  const [sqft, setSqft] = useState(0)
  const [zone, setZone] = useState<Zone>("residential")
  const [projectType, setProjectType] = useState<ProjectType>("maintenance")
  const [visits, setVisits] = useState(1)

  useEffect(() => {
    const initialType = inferProjectType(job.title)
    setProjectType(initialType)
    const h = job.estimatedDuration ? job.estimatedDuration / 60 : 0
    setHours(h)
    console.log("[JobCostCalculator] Pre-fill from job", {
      jobId: job.id,
      title: job.title,
      projectType: initialType,
      hours: h,
    })
  }, [job.id, job.title, job.estimatedDuration])

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

  const handleGenerate = useCallback(() => {
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
    console.log("[JobCostCalculator] Generate invoice", result)
    onGenerateInvoice(result)
  }, [
    job.title,
    job.id,
    hours,
    sqft,
    zone,
    projectType,
    visits,
    labor,
    materials,
    visitFees,
    subtotal,
    tax,
    total,
    onGenerateInvoice,
  ])

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Cost calculator
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {job.jobNumber} — {job.title} · {clientName}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Time spent (hours)
          </label>
          <input
            type="number"
            min={0}
            step={0.25}
            value={hours || ""}
            onChange={(e) => setHours(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Square footage (sqft)
          </label>
          <input
            type="number"
            min={0}
            value={sqft || ""}
            onChange={(e) => setSqft(Math.max(0, parseInt(e.target.value, 10) || 0))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
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
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="maintenance">Maintenance ($45/hr, $2/sqft)</option>
            <option value="installation">Installation ($60/hr, $6/sqft)</option>
            <option value="repair">Repair ($55/hr, $4/sqft)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Number of site visits
          </label>
          <input
            type="number"
            min={1}
            value={visits}
            onChange={(e) => setVisits(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

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
        className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
      >
        Generate Invoice
      </button>
    </div>
  )
}
