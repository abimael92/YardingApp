/**
 * Utility functions for client components
 */

export const formatCurrency = (money: { amount: number; currency: string }) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
  }).format(money.amount)
}

export const formatDate = (date?: string) => {
  if (!date) return "N/A"
  return new Date(date).toLocaleDateString()
}
