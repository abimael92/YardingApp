/**
 * Shared admin page styling — palette, class helpers, status colors, motion presets.
 * Aligns with EmployeeList earthy theme.
 */

import type { Variants } from "framer-motion"

export const adminPalette = {
  green: "#2e8b57",
  brown: "#8b4513",
  tan: "#d4a574",
  orange: "#b85e1a",
  lightOrange: "#d88c4a",
  cream: "#f5f1e6",
  white: "#ffffff",
} as const

/** Tailwind-friendly class bundles */
export const adminClasses = {
  pageSection: "space-y-8",
  cardBorder: "border border-[#d4a574]/30 dark:border-[#8b4513]/50",
  textPrimary: "text-[#8b4513] dark:text-[#d4a574]",
  textMuted: "text-[#b85e1a]/80 dark:text-gray-400",
  inputBg: "bg-[#f5f1e6] dark:bg-gray-800",
  inputBorder: "border-[#d4a574] dark:border-[#8b4513]",
  primaryBtn: "bg-[#2e8b57] hover:bg-[#1f6b41] text-white",
  dropdownMenu:
    "bg-[#f5f1e6] dark:bg-gray-800 border border-[#d4a574] dark:border-[#8b4513] rounded-lg shadow-lg py-1",
  dropdownItem: "w-full px-4 py-2 text-left text-sm text-[#8b4513] dark:text-[#d4a574] hover:bg-[#d4a574]/20 dark:hover:bg-gray-700 transition-colors",
  tableHeader: "bg-[#f5f1e6] dark:bg-gray-800",
  tableHeaderCell:
    "px-4 py-3 text-left text-xs font-medium text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider",
  tableRowHover: "hover:bg-[#f5f1e6]/50 dark:hover:bg-gray-800/50",
  tableDivide: "divide-y divide-[#d4a574]/20 dark:divide-[#8b4513]/20",
  mobileCard: "p-4 space-y-3 rounded-xl border border-[#d4a574]/30 dark:border-[#8b4513]/50 bg-white dark:bg-gray-900",
  avatarGradient: "bg-gradient-to-br from-[#2e8b57] to-[#8b4513]",
} as const

export type AdminStatusTone = "success" | "warning" | "error" | "inactive" | "info"

/**
 * Badge classes for status-like labels (success/active, warning/pending, error/overdue, inactive/draft).
 */
export function getAdminStatusColor(tone: AdminStatusTone): string {
  switch (tone) {
    case "success":
      return "bg-[#2e8b57]/20 text-[#2e8b57] dark:text-[#4a7c5c] dark:bg-[#2e8b57]/15"
    case "warning":
      return "bg-[#d88c4a]/20 text-[#b85e1a] dark:text-[#d88c4a]"
    case "error":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "inactive":
      return "bg-[#8b4513]/20 text-[#8b4513] dark:text-[#d4a574]"
    case "info":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }
}

/** Map common string statuses to tone */
export function statusToneFromString(status: string): AdminStatusTone {
  const s = status.toLowerCase().replace(/\s+/g, "_")
  if (
    ["active", "completed", "paid", "sent", "success", "succeeded", "approved"].includes(s) ||
    s.includes("complete")
  )
    return "success"
  if (
    ["pending", "processing", "scheduled", "reviewed", "in_progress", "quoted"].includes(s) ||
    s.includes("pending")
  )
    return "warning"
  if (["failed", "overdue", "cancelled", "rejected", "error", "suspended"].includes(s))
    return "error"
  if (["draft", "inactive", "on_hold"].includes(s)) return "inactive"
  return "info"
}

export function adminStatusBadgeClass(status: string): string {
  return getAdminStatusColor(statusToneFromString(status))
}

/** Framer Motion — list stagger */
export const adminStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

export const adminStaggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

export const adminFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
}

export const adminPageHeaderMotion: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}
