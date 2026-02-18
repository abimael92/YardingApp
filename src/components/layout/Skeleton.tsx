// components/ui/Skeleton.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
}

export const Skeleton: React.FC<SkeletonProps> = ({
    className,
    variant = 'rectangular',
    width,
    height,
}) => {
    const style = {
        width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
        height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    }

    return (
        <div
            className={cn(
                'animate-pulse bg-gray-200 dark:bg-gray-700',
                variant === 'text' && 'rounded',
                variant === 'circular' && 'rounded-full',
                variant === 'rectangular' && 'rounded-md',
                className
            )}
            style={style}
        />
    )
}