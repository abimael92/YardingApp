"use client"

import React from "react"
import { cn } from "@/src/lib/utils"

export interface AdminFilterSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  /** Active filter chips with clear */
  activeFilters?: Array<{ key: string; label: string; onClear: () => void }>
}

export function AdminFilterSection({
  title = "Filters",
  children,
  className,
  activeFilters,
}: AdminFilterSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm",
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-[#8b4513] dark:text-[#d4a574] uppercase tracking-wider">
          {title}
        </h2>
        {children}
        {activeFilters && activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={f.onClear}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-[#2e8b57]/20 dark:text-[#4a7c5c] hover:bg-green-200 dark:hover:bg-[#2e8b57]/30 transition-colors"
              >
                {f.label}
                <span className="text-green-600 dark:text-green-400" aria-hidden>
                  ×
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
