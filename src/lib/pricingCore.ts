/**
 * Shared pricing logic for Invoice Maker and Auto Quote Generator.
 * Single source of truth: rates, zone multiplier, visit fee, and breakdown calculation.
 */

export type ProjectType = "maintenance" | "installation" | "repair"
export type Zone = "residential" | "commercial"

/** Phoenix area tax rate (8.6%) — used for invoices only; quotes show ranges without tax detail. */
export const PHOENIX_TAX_RATE = 0.086

/** Fee per additional site visit (first visit free). */
export const VISIT_FEE = 50

/** Base rates by project type: $/hr and $/sqft (materials). */
export const RATES: Record<
  ProjectType,
  { baseRatePerHour: number; materialCostPerSqft: number }
> = {
  maintenance: { baseRatePerHour: 45, materialCostPerSqft: 2 },
  installation: { baseRatePerHour: 60, materialCostPerSqft: 5 },
  repair: { baseRatePerHour: 75, materialCostPerSqft: 8 },
}

export const ZONE_MULTIPLIER: Record<Zone, number> = {
  residential: 1,
  commercial: 1.3,
}

export interface PricingInputs {
  hours: number
  sqft: number
  visits: number
  zone: Zone
  projectType: ProjectType
}

export interface PricingBreakdown {
  labor: number
  materials: number
  visitFees: number
  subtotal: number
}

/**
 * Compute labor, materials, visit fees, and subtotal from shared pricing rules.
 * Used by both invoice (exact total + tax) and quote (range via multipliers).
 */
export function computeBreakdown(inputs: PricingInputs): PricingBreakdown {
  const mult = ZONE_MULTIPLIER[inputs.zone]
  const { baseRatePerHour, materialCostPerSqft } = RATES[inputs.projectType]
  const labor = Math.round(inputs.hours * baseRatePerHour * mult * 100) / 100
  const materials = Math.round(inputs.sqft * materialCostPerSqft * mult * 100) / 100
  const visitFees = Math.max(0, inputs.visits - 1) * VISIT_FEE
  const subtotal = labor + materials + visitFees
  return { labor, materials, visitFees, subtotal }
}

/** Validation bounds (aligned with JobCostCalculator). */
export const HOURS_MIN = 0
export const HOURS_MAX = 200
export const SQFT_MIN = 0
export const SQFT_MAX = 100_000
export const VISITS_MIN = 1
export const VISITS_MAX = 50

export function validatePricingInputs(
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
