/**
 * Rate limiter using token bucket algorithm
 * Supports distributed rate limiting with Redis (optional)
 */

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  keyPrefix?: string
}

interface TokenBucket {
  tokens: number
  lastRefill: number
  capacity: number
  refillRate: number // tokens per millisecond
}

/**
 * In-memory rate limiter using token bucket algorithm
 */
class MemoryRateLimiter {
  private buckets = new Map<string, TokenBucket>()
  private cleanupInterval?: NodeJS.Timeout
  
  constructor() {
    // Cleanup old buckets every 10 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 10 * 60 * 1000)
  }
  
  async checkLimit(key: string, maxRequests: number, windowMs: number): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
  }> {
    const bucket = this.getOrCreateBucket(key, maxRequests, windowMs)
    const now = Date.now()
    
    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill
    const tokensToAdd = timePassed * bucket.refillRate
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd)
    bucket.lastRefill = now
    
    // Check if request is allowed
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt: now + windowMs,
      }
    }
    
    // Calculate when next token will be available
    const tokensNeeded = 1 - bucket.tokens
    const waitTime = tokensNeeded / bucket.refillRate
    const resetAt = now + waitTime
    
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    }
  }
  
  private getOrCreateBucket(key: string, maxRequests: number, windowMs: number): TokenBucket {
    if (!this.buckets.has(key)) {
      const refillRate = maxRequests / windowMs // tokens per millisecond
      this.buckets.set(key, {
        tokens: maxRequests,
        lastRefill: Date.now(),
        capacity: maxRequests,
        refillRate,
      })
    }
    
    return this.buckets.get(key)!
  }
  
  private cleanup(): void {
    const now = Date.now()
    const maxAge = 60 * 60 * 1000 // 1 hour
    
    for (const [key, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(key)
      }
    }
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.buckets.clear()
  }
}

// Singleton instance
const memoryRateLimiter = new MemoryRateLimiter()

/**
 * Rate limiter interface
 */
export interface RateLimiter {
  checkLimit(key: string, maxRequests: number, windowMs: number): Promise<{
    allowed: boolean
    remaining: number
    resetAt: number
  }>
}

/**
 * Get rate limiter instance
 */
export function getRateLimiter(): RateLimiter {
  // TODO: Add Redis support when available
  // if (process.env.REDIS_URL) {
  //   return new RedisRateLimiter(process.env.REDIS_URL)
  // }
  return memoryRateLimiter
}

/**
 * Rate limit decorator for functions
 */
export function rateLimited<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: RateLimitOptions & { keyGenerator?: (...args: Parameters<T>) => string }
): T {
  const limiter = getRateLimiter()
  const keyGen = options.keyGenerator || (() => 'default')
  
  return (async (...args: Parameters<T>) => {
    const key = keyGen(...args)
    const limit = await limiter.checkLimit(
      key,
      options.maxRequests,
      options.windowMs
    )
    
    if (!limit.allowed) {
      const waitMs = Math.ceil(limit.resetAt - Date.now())
      throw new RateLimitError(
        `Rate limit exceeded. Try again in ${Math.ceil(waitMs / 1000)} seconds.`,
        waitMs
      )
    }
    
    return fn(...args)
  }) as T
}

/**
 * Rate limit error
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfterMs: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

/**
 * SAM.gov API rate limits (from documentation)
 */
export const SAM_GOV_RATE_LIMITS = {
  // Free tier: 10 requests/day (no role)
  // With role: 1,000 requests/day
  // System account: 1,000-10,000 requests/day
  FREE_TIER: {
    maxRequests: 10,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  STANDARD_TIER: {
    maxRequests: 1000,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  SYSTEM_TIER: {
    maxRequests: 10000,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
}

/**
 * Get rate limit config based on API key type
 */
export function getSamGovRateLimit(): RateLimitOptions {
  // Check if we have a system account (higher limits)
  const isSystemAccount = !!process.env.SAM_GOV_SYSTEM_USERNAME
  
  if (isSystemAccount) {
    return SAM_GOV_RATE_LIMITS.SYSTEM_TIER
  }
  
  // Default to standard tier (assumes API key with role)
  return SAM_GOV_RATE_LIMITS.STANDARD_TIER
}

