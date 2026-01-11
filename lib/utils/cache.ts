/**
 * Caching layer with TTL support
 * Uses in-memory cache with optional Redis backend for distributed systems
 */

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  keyPrefix?: string
}

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

/**
 * In-memory cache implementation
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval?: NodeJS.Timeout
  
  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }
  
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }
    
    return entry.value as T
  }
  
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const expiresAt = Date.now() + ttlMs
    this.cache.set(key, { value, expiresAt })
  }
  
  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }
  
  async clear(): Promise<void> {
    this.cache.clear()
  }
  
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
  
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Singleton instance
const memoryCache = new MemoryCache()

/**
 * Cache interface for abstraction
 */
export interface Cache {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlMs: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * Get cache instance (currently in-memory, can be extended to Redis)
 */
export function getCache(): Cache {
  // TODO: Add Redis support when available
  // if (process.env.REDIS_URL) {
  //   return new RedisCache(process.env.REDIS_URL)
  // }
  return memoryCache
}

/**
 * Generate cache key with prefix
 */
export function generateCacheKey(prefix: string, ...parts: (string | number)[]): string {
  return `${prefix}:${parts.join(':')}`
}

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: CacheOptions & { keyGenerator?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = getCache()
  const ttl = options.ttl || 5 * 60 * 1000 // Default 5 minutes
  const prefix = options.keyPrefix || 'cache'
  const keyGen = options.keyGenerator || ((...args: any[]) => 
    generateCacheKey(prefix, ...args.map(a => String(a)))
  )
  
  return (async (...args: Parameters<T>) => {
    const key = keyGen(...args)
    
    // Try cache first
    const cached = await cache.get<ReturnType<T>>(key)
    if (cached !== null) {
      return cached
    }
    
    // Execute function
    const result = await fn(...args)
    
    // Cache result
    await cache.set(key, result, ttl)
    
    return result
  }) as T
}

