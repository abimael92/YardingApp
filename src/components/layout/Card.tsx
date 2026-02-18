// components/ui/Card.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    padding?: 'none' | 'sm' | 'md' | 'lg'
    variant?: 'default' | 'elevated' | 'outlined'
}

const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
}

const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-900 shadow-lg',
    outlined: 'bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700',
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'md',
    variant = 'default',
    className,
    ...props
}) => {
    return (
        <div
            className={cn(
                'rounded-lg',
                variantClasses[variant],
                paddingClasses[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}