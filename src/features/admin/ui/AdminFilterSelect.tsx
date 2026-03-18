"use client"

import React from "react"
import { cn } from "@/src/lib/utils"

const SELECT_ARROW =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b85e1a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")"

export interface AdminFilterSelectOption {
  value: string
  label: string
}

export interface AdminFilterSelectProps {
  value: string
  onChange: (value: string) => void
  options: AdminFilterSelectOption[]
  label: string
  icon?: React.ReactNode
  className?: string
}

export const AdminFilterSelect = React.memo(function AdminFilterSelect({
  value,
  onChange,
  options,
  label,
  icon,
  className,
}: AdminFilterSelectProps) {
  return (
    <div className={cn("relative", className)}>
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b85e1a]/60 dark:text-[#d4a574]/60 pointer-events-none">
          {icon}
        </div>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2.5 pr-9 rounded-lg border border-[#d4a574] dark:border-[#8b4513]",
          "bg-[#f5f1e6] dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]",
          "focus:outline-none focus:ring-2 focus:ring-[#2e8b57] focus:border-transparent transition-colors",
          "appearance-none cursor-pointer text-sm",
          icon && "pl-10"
        )}
        aria-label={label}
        style={{
          backgroundImage: SELECT_ARROW,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
          backgroundSize: "1.25rem",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
})
