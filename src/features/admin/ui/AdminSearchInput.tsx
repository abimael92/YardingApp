"use client"

import React from "react"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { cn } from "@/src/lib/utils"

export interface AdminSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string
  containerClassName?: string
}

export function AdminSearchInput({
  className,
  containerClassName,
  placeholder = "Search...",
  ...props
}: AdminSearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <MagnifyingGlassIcon
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b85e1a]/60 pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600",
          "bg-white dark:bg-gray-800 text-[#8b4513] dark:text-[#d4a574]",
          "placeholder:text-[#b85e1a]/50 dark:placeholder-gray-500",
          "focus:border-[#2e8b57] focus:ring-4 focus:ring-[#2e8b57]/20 focus:outline-none transition-shadow",
          "text-sm",
          className
        )}
        {...props}
      />
    </div>
  )
}
