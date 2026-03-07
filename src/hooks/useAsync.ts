/**
 * useAsync
 *
 * Wraps an async function and exposes loading, error, and execute state.
 * Useful for one-off API calls or form submit.
 */

import { useState, useCallback } from "react"

export interface UseAsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export interface UseAsyncReturn<T, A extends unknown[]> extends UseAsyncState<T> {
  execute: (...args: A) => Promise<T | null>
  reset: () => void
}

const initialState = {
  data: null,
  error: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
}

export function useAsync<T, A extends unknown[]>(
  asyncFn: (...args: A) => Promise<T>,
  options?: { onSuccess?: (data: T) => void; onError?: (error: Error) => void }
): UseAsyncReturn<T, A> {
  const [state, setState] = useState<UseAsyncState<T>>(initialState as UseAsyncState<T>)

  const reset = useCallback(() => {
    setState(initialState as UseAsyncState<T>)
  }, [])

  const execute = useCallback(
    async (...args: A): Promise<T | null> => {
      setState({
        data: null,
        error: null,
        isLoading: true,
        isSuccess: false,
        isError: false,
      })
      try {
        const data = await asyncFn(...args)
        setState({
          data,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        options?.onSuccess?.(data)
        return data
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setState({
          data: null,
          error,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        options?.onError?.(error)
        return null
      }
    },
    [asyncFn, options]
  )

  return {
    ...state,
    execute,
    reset,
  }
}
