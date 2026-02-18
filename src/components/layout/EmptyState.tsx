// components/ui/EmptyState.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

interface EmptyStateProps {
    title: string
    description?: string
    action?: React.ReactNode
    className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center',
                'py-12 px-4',
                className
            )}
        >
            {/* Empty state illustration */}
            <div className="mb-4 text-gray-400 dark:text-gray-600">
                <svg
                    className="w-24 h-24 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                </svg>
            </div>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                    {description}
                </p>
            )}

            {action && <div>{action}</div>}
        </div>
    )
}