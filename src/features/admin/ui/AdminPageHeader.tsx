"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/src/lib/utils"
import { adminPageHeaderMotion } from "./page-styles"

export interface AdminPageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  actions?: React.ReactNode
  /** Optional stats row inside header (glass cards) */
  headerStats?: React.ReactNode
  className?: string
}

export function AdminPageHeader({
  title,
  subtitle,
  icon,
  actions,
  headerStats,
  className,
}: AdminPageHeaderProps) {
  return (
    <motion.header
      variants={adminPageHeaderMotion}
      initial="hidden"
      animate="visible"
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600",
        "text-white shadow-lg",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/grid.svg')] bg-repeat"
        aria-hidden
      />
      <div className="relative px-5 py-6 sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            {icon && (
              <div className="shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center [&_svg]:w-7 [&_svg]:h-7">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-white/90 max-w-2xl">{subtitle}</p>}
            </div>
          </div>
          {actions && (
            <div className="flex flex-wrap gap-2 shrink-0 [&_button]:rounded-lg [&_button]:px-4 [&_button]:py-2.5 [&_button]:text-sm [&_button]:font-medium [&_button]:transition-colors [&_a]:inline-flex [&_a]:items-center">
              {actions}
            </div>
          )}
        </div>
        {headerStats && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">{headerStats}</div>
        )}
      </div>
    </motion.header>
  )
}

/** Glass button for use inside AdminPageHeader actions */
export function AdminHeaderButton({
  children,
  onClick,
  className,
  type = "button",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2",
        "bg-white/20 backdrop-blur-sm border border-white/30 text-white",
        "hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50",
        className
      )}
    >
      {children}
    </button>
  )
}

/** Small stat pill inside header */
export function AdminHeaderStatPill({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3">
      <p className="text-xs text-white/80 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-white mt-0.5">{value}</p>
    </div>
  )
}
