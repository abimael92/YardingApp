import type React from "react"
import { cn } from "@/src/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantClasses = {
  primary: "bg-[#2e8b57] text-white hover:bg-[#1f6b41] focus:ring-[#2e8b57]",
  secondary: "bg-[#f5f1e6] text-[#8b4513] hover:bg-[#ede4d1] focus:ring-[#d88c4a]",
  success: "bg-[#2e8b57] text-white hover:bg-[#1f6b41] focus:ring-[#2e8b57]",
  warning: "bg-[#d88c4a] text-white hover:bg-[#b85e1a] focus:ring-[#d88c4a]",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost:
    "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-[#6b7280] dark:text-gray-300 focus:ring-gray-500",
  outline:
    "border border-[#d4a574] dark:border-[#8b4513] bg-transparent hover:bg-[#f5f1e6] dark:hover:bg-gray-800 text-[#8b4513] dark:text-[#d4a574] focus:ring-[#d88c4a]",
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  disabled,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-md transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "min-h-[44px] min-w-[44px]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

