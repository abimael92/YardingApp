/**
 * Quote Calculator — range-based estimates using shared pricing core.
 * min_price = base_subtotal * low_multiplier, max_price = base_subtotal * high_multiplier.
 */

import {
  computeBreakdown,
  validatePricingInputs,
  type PricingInputs,
  type PricingBreakdown,
} from "./pricingCore"

/** Multipliers for estimate range (e.g. 0.85–1.15 for ±15% variance). */
export const QUOTE_LOW_MULTIPLIER = 0.85
export const QUOTE_HIGH_MULTIPLIER = 1.15

export interface QuoteCalculatorInput extends PricingInputs {
  serviceName?: string
  /** Optional complexity or extras description for display. */
  extras?: string
}

export interface QuoteCalculatorResult {
  minTotal: number
  maxTotal: number
  breakdown: PricingBreakdown
  /** Same breakdown used for display; range is applied to subtotal only (no tax in quote). */
  valid: boolean
  errors: string[]
}

/**
 * Compute min/max quote range from job inputs. No tax breakdown; simplified for estimates.
 */
export function calculateQuoteRange(input: QuoteCalculatorInput): QuoteCalculatorResult {
  const validation = validatePricingInputs(input.hours, input.sqft, input.visits)
  if (!validation.valid) {
    return {
      minTotal: 0,
      maxTotal: 0,
      breakdown: { labor: 0, materials: 0, visitFees: 0, subtotal: 0 },
      valid: false,
      errors: validation.errors,
    }
  }
  const breakdown = computeBreakdown(input)
  const minTotal = Math.round(breakdown.subtotal * QUOTE_LOW_MULTIPLIER * 100) / 100
  const maxTotal = Math.round(breakdown.subtotal * QUOTE_HIGH_MULTIPLIER * 100) / 100
  return {
    minTotal,
    maxTotal,
    breakdown,
    valid: true,
    errors: [],
  }
}
