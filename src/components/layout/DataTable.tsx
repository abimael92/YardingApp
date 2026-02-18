// components/ui/DataTable.tsx
import React from 'react'
import { cn } from '@/src/lib/utils'

export interface Column<T> {
    key: string
    header: string
    render: (item: T) => React.ReactNode
    hideOnMobile?: boolean
    hideOnTablet?: boolean
}

interface DataTableProps<T> {
    data: T[]
    columns: Column<T>[]
    keyExtractor: (item: T) => string
    emptyMessage?: string
    className?: string
}

export function DataTable<T>({
    data,
    columns,
    keyExtractor,
    emptyMessage = 'No data available',
    className,
}: DataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {emptyMessage}
            </div>
        )
    }

    return (
        <div className={cn('overflow-x-auto', className)}>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={cn(
                                    'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                                    column.hideOnMobile && 'hidden sm:table-cell',
                                    column.hideOnTablet && 'hidden md:table-cell'
                                )}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.map((item) => {
                        const rowId = keyExtractor(item)
                        return (
                            <tr
                                key={rowId}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={`${rowId}-${column.key}`}
                                        className={cn(
                                            'px-6 py-4 whitespace-nowrap text-sm',
                                            column.hideOnMobile && 'hidden sm:table-cell',
                                            column.hideOnTablet && 'hidden md:table-cell'
                                        )}
                                    >
                                        {column.render(item)}
                                    </td>
                                ))}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}