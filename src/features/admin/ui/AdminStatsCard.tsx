"use client"

import React from "react"
import { cn } from "@/src/lib/utils"
import { Card } from "@/src/components/layout/Card"

export type AdminStatsCardVariant = "default" | "green" | "brown" | "orange" | "red"

const variantClasses: Record<AdminStatsCardVariant, string> = {
  default: "bg-white dark:bg-gray-800 border-[#d4a574]/30",
  green: "bg-[#2e8b57]/5 dark:bg-[#2e8b57]/10 border-[#2e8b57]/30",
  brown: "bg-[#8b4513]/5 dark:bg-[#8b4513]/10 border-[#8b4513]/30",
  orange: "bg-[#d88c4a]/5 dark:bg-[#d88c4a]/10 border-[#d88c4a]/30",
  red: "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/50",
}

const labelClasses: Record<AdminStatsCardVariant, string> = {
  default: "text-[#b85e1a]/80 dark:text-gray-400",
  green: "text-[#2e8b57] dark:text-[#4a7c5c]",
  brown: "text-[#8b4513] dark:text-[#d4a574]",
  orange: "text-[#b85e1a] dark:text-[#d88c4a]",
  red: "text-red-700 dark:text-red-400",
}

const valueClasses: Record<AdminStatsCardVariant, string> = {
  default: "text-[#8b4513] dark:text-[#d4a574]",
  green: "text-[#2e8b57] dark:text-[#4a7c5c]",
  brown: "text-[#8b4513] dark:text-[#d4a574]",
  orange: "text-[#b85e1a] dark:text-[#d88c4a]",
  red: "text-red-800 dark:text-red-300",
}

export interface AdminStatsCardProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  variant?: AdminStatsCardVariant
  className?: string
}

export function AdminStatsCard({
  label,
  value,
  icon,
  variant = "default",
  className,
}: AdminStatsCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border p-5 min-h-[100px] flex flex-col justify-center gap-2",
        "transition-shadow hover:shadow-md",
        variantClasses[variant],
        className
      )}
    >
      <div className={cn("flex items-center gap-2 text-xs font-medium uppercase tracking-wide", labelClasses[variant])}>
        {icon && <span className="shrink-0 [&_svg]:w-5 [&_svg]:h-5">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className={cn("text-2xl font-bold tabular-nums", valueClasses[variant])}>{value}</div>
    </Card>
  )
}
