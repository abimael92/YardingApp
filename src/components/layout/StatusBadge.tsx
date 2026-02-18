// components/ui/StatusBadge.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

interface StatusBadgeProps {
    type: 'status' | 'role' | 'job'
    value: string
    className?: string
}

const statusConfig = {
    status: {
        Active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    },
    role: {
        Worker: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        Supervisor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        Admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        Client: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    },
    job: {
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    type,
    value,
    className,
}) => {
    // Get the config for the specific type
    const config = statusConfig[type]

    // Get the color class for the value, fallback to a default style if not found
    const colorClass = config[value as keyof typeof config] ||
        (type === 'job' ? statusConfig.job.pending :
            type === 'status' ? statusConfig.status.Pending :
                statusConfig.role.Worker)

    return (
        <span
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                'transition-colors duration-200',
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

// Optional: Export individual badge components for specific use cases
export const EmployeeStatusBadge: React.FC<{ status: string; className?: string }> = ({
    status,
    className
}) => (
    <StatusBadge type="status" value={status} className={className} />
)

export const EmployeeRoleBadge: React.FC<{ role: string; className?: string }> = ({
    role,
    className
}) => (
    <StatusBadge type="role" value={role} className={className} />
)

export const JobStatusBadge: React.FC<{ status: string; className?: string }> = ({
    status,
    className
}) => (
    <StatusBadge type="job" value={status} className={className} />
)