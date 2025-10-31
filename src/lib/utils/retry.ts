/**
 * Retry utility for handling network errors and temporary failures
 */

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryCondition = (error: any) => {
      // Retry on network errors or CORS errors
      return (
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('Network') ||
        error?.message?.includes('CORS') ||
        error?.code === 'NETWORK_ERROR' ||
        error?.message?.includes('Сетевое соединение потеряно')
      );
    },
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if it's the last attempt or condition doesn't match
      if (attempt === maxRetries || !retryCondition(error)) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      const delay = retryDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Check if error is a network/CORS error
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('Network') ||
    error?.message?.includes('CORS') ||
    error?.message?.includes('Сетевое соединение потеряно') ||
    error?.message?.includes('access control checks') ||
    error?.code === 'NETWORK_ERROR'
  );
}

