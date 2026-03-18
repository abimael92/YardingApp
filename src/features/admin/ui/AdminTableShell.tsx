"use client"

import React from "react"
import { cn } from "@/src/lib/utils"

export interface AdminTableShellProps {
  children: React.ReactNode
  className?: string
}

export function AdminTableShell({ children, className }: AdminTableShellProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm overflow-hidden",
        className
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
