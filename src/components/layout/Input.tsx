// components/ui/Input.tsx
import React, { useState } from 'react'
import { cn } from '@/src/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: string
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    hint,
    className,
    id,
    value,
    onChange,
    onBlur,
    ...props
}) => {
    const [touched, setTouched] = useState(false)
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setTouched(true)
        onBlur?.(e)
    }

    const showError = touched && error

    return (
        <div className="space-y-1">
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    id={inputId}
                    className={cn(
                        'block w-full rounded-md shadow-sm',
                        'border border-gray-300 dark:border-gray-600',
                        'bg-white dark:bg-gray-800',
                        'text-gray-900 dark:text-white',
                        'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                        'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        'min-h-[44px] px-4', // Touch target and spacing
                        showError && 'border-red-500 focus:ring-red-500',
                        className
                    )}
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    aria-invalid={!!error}
                    aria-describedby={
                        error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
                    }
                    {...props}
                />
            </div>

            {showError && (
                <p id={`${inputId}-error`} className="text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}

            {hint && !error && (
                <p id={`${inputId}-hint`} className="text-sm text-gray-500 dark:text-gray-400">
                    {hint}
                </p>
            )}
        </div>
    )
}