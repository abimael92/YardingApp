// components/layout/Grid.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

interface GridProps {
    children: React.ReactNode
    cols?: {
        default?: number
        sm?: number
        md?: number
        lg?: number
        xl?: number
    }
    gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const gapClasses = {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
}

export const Grid: React.FC<GridProps> = ({
    children,
    cols = { default: 1 },
    gap = 'md',
    className,
}) => {
    const gridCols = {
        'grid-cols-1': cols.default === 1,
        'grid-cols-2': cols.default === 2,
        'grid-cols-3': cols.default === 3,
        'grid-cols-4': cols.default === 4,
        'grid-cols-5': cols.default === 5,
        'grid-cols-6': cols.default === 6,
        'grid-cols-12': cols.default === 12,
        'sm:grid-cols-1': cols.sm === 1,
        'sm:grid-cols-2': cols.sm === 2,
        'sm:grid-cols-3': cols.sm === 3,
        'sm:grid-cols-4': cols.sm === 4,
        'sm:grid-cols-5': cols.sm === 5,
        'sm:grid-cols-6': cols.sm === 6,
        'sm:grid-cols-12': cols.sm === 12,
        'md:grid-cols-1': cols.md === 1,
        'md:grid-cols-2': cols.md === 2,
        'md:grid-cols-3': cols.md === 3,
        'md:grid-cols-4': cols.md === 4,
        'md:grid-cols-5': cols.md === 5,
        'md:grid-cols-6': cols.md === 6,
        'md:grid-cols-12': cols.md === 12,
        'lg:grid-cols-1': cols.lg === 1,
        'lg:grid-cols-2': cols.lg === 2,
        'lg:grid-cols-3': cols.lg === 3,
        'lg:grid-cols-4': cols.lg === 4,
        'lg:grid-cols-5': cols.lg === 5,
        'lg:grid-cols-6': cols.lg === 6,
        'lg:grid-cols-12': cols.lg === 12,
        'xl:grid-cols-1': cols.xl === 1,
        'xl:grid-cols-2': cols.xl === 2,
        'xl:grid-cols-3': cols.xl === 3,
        'xl:grid-cols-4': cols.xl === 4,
        'xl:grid-cols-5': cols.xl === 5,
        'xl:grid-cols-6': cols.xl === 6,
        'xl:grid-cols-12': cols.xl === 12,
    }

    return (
        <div
            className={cn(
                'grid',
                gridCols,
                gapClasses[gap],
                className
            )}
        >
            {children}
        </div>
    )
}