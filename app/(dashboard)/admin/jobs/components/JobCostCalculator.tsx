"use client"

import { useState, useEffect } from "react"
import type { Job } from "@/src/domain/entities"

type ProjectType = "maintenance" | "installation" | "repair"
type Zone = "residential" | "commercial"

export interface CostBreakdown {
  labor: number
  materials: number
  visitsFee: number
  subtotal: number
  tax: number
  total: number
}

interface JobCostCalculatorProps {
  job: Job
  onCalculate?: (total: number, breakdown: CostBreakdown) => void
}

const JobCostCalculator = ({ job, onCalculate }: JobCostCalculatorProps) => {
  const [hours, setHours] = useState<number>(
    job.estimatedDuration ? Math.ceil(job.estimatedDuration / 60) : 2
  )
  const [squareFeet, setSquareFeet] = useState<number>(1000)
  const [visits, setVisits] = useState<number>(1)
  const [zone, setZone] = useState<Zone>("residential")
  const [projectType, setProjectType] = useState<ProjectType>("maintenance")

  const [breakdown, setBreakdown] = useState<CostBreakdown>({
    labor: 0,
    materials: 0,
    visitsFee: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  })

  // Log initial job data and auto-set project type from title
  useEffect(() => {
    console.log("📋 Job data received:", {
      id: job.id,
      title: job.title,
      type: (job as { type?: string }).type,
      estimatedDuration: job.estimatedDuration,
      estimatedCost: job.estimatedCost,
    })

    // Auto-set project type based on job title/type if available
    const jobTitle = job.title.toLowerCase()
    if (jobTitle.includes("install")) {
      setProjectType("installation")
      console.log("🔧 Auto-set project type: installation")
    } else if (jobTitle.includes("repair") || jobTitle.includes("fix")) {
      setProjectType("repair")
      console.log("🔧 Auto-set project type: repair")
    } else {
      setProjectType("maintenance")
      console.log("🔧 Auto-set project type: maintenance")
    }
  }, [job])

  // Calculate rates based on project type
  const getRates = () => {
    const rates = {
      maintenance: { hourlyRate: 45, materialRate: 2 },
      installation: { hourlyRate: 60, materialRate: 5 },
      repair: { hourlyRate: 75, materialRate: 8 },
    }
    return rates[projectType]
  }

  // Calculate costs whenever inputs change
  useEffect(() => {
    const calculateCosts = () => {
      console.log("🔢 Starting calculation with:", {
        hours,
        squareFeet,
        visits,
        zone,
        projectType,
      })

      const { hourlyRate, materialRate } = getRates()
      console.log("💰 Using rates:", { hourlyRate, materialRate })

      const labor = hours * hourlyRate
      const materials = squareFeet * materialRate
      const zoneMultiplier = zone === "commercial" ? 1.3 : 1
      const visitsFee = visits > 1 ? (visits - 1) * 50 : 0

      console.log("📊 Base calculations:", { labor, materials, visitsFee })

      const subtotal = (labor + materials + visitsFee) * zoneMultiplier
      const taxRate = 0.086 // Phoenix 8.6%
      const tax = subtotal * taxRate
      const total = subtotal + tax

      console.log("🧮 Final calculations:", { subtotal, tax, total })

      const newBreakdown: CostBreakdown = {
        labor: Math.round(labor * 100) / 100,
        materials: Math.round(materials * 100) / 100,
        visitsFee: Math.round(visitsFee * 100) / 100,
        subtotal: Math.round(subtotal * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100,
      }

      setBreakdown(newBreakdown)
      onCalculate?.(total, newBreakdown)

      console.log("✅ Breakdown calculated:", newBreakdown)
    }

    calculateCosts()
  }, [hours, squareFeet, visits, zone, projectType, onCalculate])

  return (
    <>
      {/* Cost Breakdown */}
      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Cost Breakdown</h4>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Labor:</span>
            <span className="font-medium">
              {hours} hrs × ${getRates().hourlyRate} = ${breakdown.labor.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Materials:</span>
            <span className="font-medium">
              {squareFeet} sqft × ${getRates().materialRate}/sqft = ${breakdown.materials.toFixed(2)}
            </span>
          </div>

          {visits > 1 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Additional Visits:</span>
              <span className="font-medium">
                ({visits - 1}) × $50 = ${breakdown.visitsFee.toFixed(2)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Zone Multiplier:</span>
            <span className="font-medium">
              {zone === "commercial" ? "Commercial (1.3x)" : "Residential (1x)"}
            </span>
          </div>

          <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
            <span className="text-gray-700 font-medium">Subtotal:</span>
            <span className="font-medium">${breakdown.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.6%):</span>
            <span className="font-medium">${breakdown.tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-base pt-2 border-t border-gray-200">
            <span className="text-gray-900 font-bold">TOTAL:</span>
            <span className="font-bold text-blue-600">${breakdown.total.toFixed(2)}</span>
          </div>

          <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
            <p>Calculation details logged to console for debugging.</p>
          </div>
        </div>
      </div>

      {/* Generate Invoice Button */}
      <div className="pt-4">
        <button
          onClick={() => {
            console.log("🧾 Generating invoice for job:", {
              jobId: job.id,
              jobTitle: job.title,
              clientId: job.clientId,
              totalAmount: breakdown.total,
              breakdown,
              calculationInputs: {
                hours,
                squareFeet,
                visits,
                zone,
                projectType,
              },
            })

            // Trigger parent component to create invoice
            onCalculate?.(breakdown.total, {
              ...breakdown,
              jobId: job.id,
              calculationDetails: {
                hours,
                squareFeet,
                visits,
                zone,
                projectType,
                rates: getRates(),
              },
            } as CostBreakdown)

            alert(
              `Invoice for $${breakdown.total.toFixed(2)} created successfully!\nCheck console for details.`
            )
          }}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate Invoice for ${breakdown.total.toFixed(2)}
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          This will create an invoice with the calculated amount
        </p>
      </div>
    </>
  )
}

export default JobCostCalculator
