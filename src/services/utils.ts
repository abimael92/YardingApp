/**
 * Service Utilities
 * 
 * Helper functions for service layer to simulate async API calls
 */

/**
 * Simulates network delay for mock API calls
 * @param ms Milliseconds to delay (default: 300-800ms random)
 */
export const delay = (ms?: number): Promise<void> => {
  const delayMs = ms ?? Math.random() * 500 + 300 // 300-800ms
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

/**
 * Wraps a synchronous function to simulate async API call
 */
export const asyncify = <T>(
  fn: () => T,
  delayMs?: number
): Promise<T> => {
  return delay(delayMs).then(() => fn())
}

/**
 * Wraps a synchronous function that may throw to simulate async API call with error handling
 */
export const asyncifyWithError = <T>(
  fn: () => T,
  delayMs?: number
): Promise<T> => {
  return delay(delayMs).then(() => {
    try {
      return fn()
    } catch (error) {
      return Promise.reject(error)
    }
  })
}
