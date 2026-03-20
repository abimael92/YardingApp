import type React from "react"
import { cn } from "@/src/lib/utils"

interface StatusBadgeProps {
  type: "status" | "role" | "job"
  value: string
  className?: string
}

const statusConfig = {
  status: {
    Active: "bg-[#e6f4ec] text-[#1f6b41] dark:bg-[#1f6b41]/25 dark:text-[#7f9f7f]",
    Pending: "bg-[#fff4db] text-[#b85e1a] dark:bg-[#b85e1a]/20 dark:text-[#d4a574]",
    Inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  },
  role: {
    Worker: "bg-[#e6f4ec] text-[#1f6b41] dark:bg-[#1f6b41]/25 dark:text-[#7f9f7f]",
    Supervisor: "bg-[#fff4db] text-[#8b4513] dark:bg-[#8b4513]/25 dark:text-[#d4a574]",
    Admin: "bg-[#f5f1e6] text-[#8b4513] dark:bg-gray-800 dark:text-[#d4a574]",
    Client: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  job: {
    pending: "bg-[#fff4db] text-[#b85e1a] dark:bg-[#b85e1a]/20 dark:text-[#d4a574]",
    accepted: "bg-[#e6f4ec] text-[#1f6b41] dark:bg-[#1f6b41]/25 dark:text-[#7f9f7f]",
    in_progress: "bg-[#f5f1e6] text-[#8b4513] dark:bg-[#8b4513]/25 dark:text-[#d4a574]",
    completed: "bg-[#e6f4ec] text-[#1f6b41] dark:bg-[#1f6b41]/25 dark:text-[#7f9f7f]",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, className }) => {
  const config = statusConfig[type]
  const colorClass =
    config[value as keyof typeof config] ||
    (type === "job"
      ? statusConfig.job.pending
      : type === "status"
        ? statusConfig.status.Pending
        : statusConfig.role.Worker)

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        "transition-colors duration-200",
        colorClass,
        className
      )}
      role="status"
      aria-label={`${type}: ${value}`}
    >
      {value}
    </span>
  )
}

export const EmployeeStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => (
  <StatusBadge type="status" value={status} className={className} />
)

export const EmployeeRoleBadge: React.FC<{ role: string; className?: string }> = ({ role, className }) => (
  <StatusBadge type="role" value={role} className={className} />
)

export const JobStatusBadge: React.FC<{ status: string; className?: string }> = ({ status, className }) => (
  <StatusBadge type="job" value={status} className={className} />
)

