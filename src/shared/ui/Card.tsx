import type React from "react"
import { cn } from "@/src/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  padding?: "none" | "sm" | "md" | "lg"
  variant?: "default" | "elevated" | "outlined"
}

const paddingClasses = {
  none: "p-0",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
}

const variantClasses = {
  default:
    "bg-white dark:bg-gray-900 border border-[#d4a574]/35 dark:border-[#8b4513]/40",
  elevated: "bg-white dark:bg-gray-900 shadow-lg border border-[#d4a574]/25 dark:border-[#8b4513]/30",
  outlined:
    "bg-white dark:bg-gray-900 border-2 border-[#d88c4a]/45 dark:border-[#8b4513]/50",
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "md",
  variant = "default",
  className,
  ...props
}) => {
  return (
    <div
      className={cn("rounded-lg", variantClasses[variant], paddingClasses[padding], className)}
      {...props}
    >
      {children}
    </div>
  )
}

