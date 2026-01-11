/**
 * Retry utility with exponential backoff and jitter
 * Implements circuit breaker pattern for production reliability
 */

export interface RetryOptions {
  maxRetries?: number
  initialDelayMs?: number
  maxDelayMs?: number
  backoffMultiplier?: number
  jitter?: boolean
  retryableErrors?: (error: Error) => boolean
}

export interface RetryResult<T> {
  success: boolean
  data?: T
  error?: Error
  attempts: number
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryableErrors'>> & { retryableErrors?: (error: Error) => boolean } = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitter: true,
}

/**
 * Check if error is retryable (network errors, rate limits, timeouts)
 */
function isRetryableError(error: Error): boolean {
  const retryableMessages = [
    'rate limit',
    'timeout',
    'network',
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    '429',
    '503',
    '502',
    '500',
  ]
  
  const message = error.message.toLowerCase()
  return retryableMessages.some(keyword => message.includes(keyword))
}

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: Required<Omit<RetryOptions, 'retryableErrors'>>): number {
  const baseDelay = Math.min(
    options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt),
    options.maxDelayMs
  )
  
  if (options.jitter) {
    // Add random jitter (±25%)
    const jitterAmount = baseDelay * 0.25 * (Math.random() * 2 - 1)
    return Math.max(0, baseDelay + jitterAmount)
  }
  
  return baseDelay
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<RetryResult<T>> {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
  }
  
  const retryableCheck = options.retryableErrors || isRetryableError
  let lastError: Error | undefined
  let attempts = 0
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    attempts++
    
    try {
      const result = await fn()
      return {
        success: true,
        data: result,
        attempts,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // Check if error is retryable
      if (!retryableCheck(lastError)) {
        return {
          success: false,
          error: lastError,
          attempts,
        }
      }
      
      // Don't retry on last attempt
      if (attempt >= opts.maxRetries) {
        break
      }
      
      // Calculate delay and wait
      const delay = calculateDelay(attempt, opts)
      await sleep(delay)
    }
  }
  
  return {
    success: false,
    error: lastError,
    attempts,
  }
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

interface CircuitBreakerOptions {
  failureThreshold?: number
  successThreshold?: number
  timeoutMs?: number
  resetTimeoutMs?: number
}

/**
 * Circuit breaker for preventing cascading failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED
  private failures = 0
  private successes = 0
  private lastFailureTime?: number
  
  constructor(
    private options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: 5,
      successThreshold: 2,
      timeoutMs: 60000, // 1 minute
      resetTimeoutMs: 30000, // 30 seconds
      ...options,
    }
  }
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      // Check if we should transition to half-open
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime > (this.options.resetTimeoutMs || 30000)) {
        this.state = CircuitState.HALF_OPEN
        this.successes = 0
      } else {
        throw new Error('Circuit breaker is OPEN - too many failures')
      }
    }
    
    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++
      if (this.successes >= (this.options.successThreshold || 2)) {
        this.state = CircuitState.CLOSED
      }
    }
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= (this.options.failureThreshold || 5)) {
      this.state = CircuitState.OPEN
    }
  }
  
  getState(): CircuitState {
    return this.state
  }
  
  reset(): void {
    this.state = CircuitState.CLOSED
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = undefined
  }
}

