/**
 * usePagination
 *
 * Hook for table/list pagination: page index, page size, total count, and helpers.
 */

import { useState, useMemo, useCallback } from "react"

export interface UsePaginationOptions {
  initialPage?: number
  initialPageSize?: number
  totalItems?: number
}

export interface UsePaginationReturn {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  startIndex: number
  endIndex: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  setTotalItems: (n: number) => void
  nextPage: () => void
  prevPage: () => void
  goToFirstPage: () => void
  goToLastPage: () => void
  hasNextPage: boolean
  hasPrevPage: boolean
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotal = 0,
  } = options

  const [page, setPageState] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(initialTotal)

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (page - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const setPage = useCallback(
    (p: number) => setPageState((prev) => Math.max(1, Math.min(p, totalPages))),
    [totalPages]
  )
  const setPageSize = useCallback((size: number) => {
    setPageSizeState((s) => Math.max(1, size))
    setPageState(1)
  }, [])

  const nextPage = useCallback(() => setPageState((p) => Math.min(p + 1, totalPages)), [totalPages])
  const prevPage = useCallback(() => setPageState((p) => Math.max(p - 1, 1)), [])
  const goToFirstPage = useCallback(() => setPageState(1), [])
  const goToLastPage = useCallback(() => setPageState(totalPages), [totalPages])

  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  return useMemo(
    () => ({
      page,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      setPage,
      setPageSize,
      setTotalItems,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
      hasNextPage,
      hasPrevPage,
    }),
    [
      page,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      setPage,
      setPageSize,
      nextPage,
      prevPage,
      goToFirstPage,
      goToLastPage,
      hasNextPage,
      hasPrevPage,
    ]
  )
}
