/**
 * Unified contract search service
 * Orchestrates SAM.gov API searches with rate limiting, caching, and retry logic
 */

import { searchSamGov, transformSamGovResult, SamGovApiResponse } from '../sam-gov-api'
import { DiscoveryResult, ServiceCategory } from '../contract-discovery'
import { buildDualQueries, SamGovQuery, GoogleQuery } from './vetcert-query-builder'
import { retry, CircuitBreaker } from '../utils/retry'
import { getCache, generateCacheKey } from '../utils/cache'
import { getRateLimiter, getSamGovRateLimit, RateLimitError } from '../utils/rate-limiter'
import { createLogger, recordSearchMetrics } from './contract-metrics'

const logger = createLogger('ContractSearchService')
const cache = getCache()
const rateLimiter = getRateLimiter()
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  resetTimeoutMs: 30000,
})

export interface SearchRequest {
  keywords: string // Comma-separated keywords
  serviceCategory?: ServiceCategory
  location?: string
  agency?: string[]
  dateRange?: 'past_week' | 'past_month' | 'past_year'
  naicsCodes?: string[]
  pscCodes?: string[]
  limit?: number
  useCache?: boolean
}

export interface SearchResponse {
  success: boolean
  results: DiscoveryResult[]
  googleQuery: GoogleQuery
  samGovQuery: SamGovQuery
  totalRecords: number
  cached: boolean
  duration: number
  error?: string
  requestId: string
}

/**
 * Generate cache key for search request
 */
function generateSearchCacheKey(request: SearchRequest): string {
  return generateCacheKey(
    'contract-search',
    request.keywords,
    request.serviceCategory || 'general',
    request.dateRange || 'past_month',
    request.limit || 30
  )
}

/**
 * Execute SAM.gov API search with rate limiting and retry
 */
async function executeSamGovSearch(
  query: SamGovQuery,
  limit: number,
  requestId: string
): Promise<SamGovApiResponse> {
  // Check rate limit
  const rateLimit = getSamGovRateLimit()
  const rateLimitKey = 'sam-gov-api'
  
  try {
    const limitCheck = await rateLimiter.checkLimit(
      rateLimitKey,
      rateLimit.maxRequests,
      rateLimit.windowMs
    )
    
    if (!limitCheck.allowed) {
      throw new RateLimitError(
        `SAM.gov API rate limit exceeded. Try again in ${Math.ceil((limitCheck.resetAt - Date.now()) / 1000)} seconds.`,
        limitCheck.resetAt - Date.now()
      )
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      throw error
    }
    logger.warn('Rate limit check failed, proceeding anyway', { error })
  }
  
  // Execute search with circuit breaker and retry
  const result = await circuitBreaker.execute(async () => {
    return retry(
      async () => {
        logger.debug('Executing SAM.gov API search', { query, limit })
        return await searchSamGov({
          keywords: query.keyword,
          serviceCategory: query.naicsCodes?.length ? undefined : 'cybersecurity', // Default if no NAICS
          dateRange: query.dateRange || 'past_month',
          setAside: query.setAside,
          naicsCodes: query.naicsCodes,
          pscCodes: query.pscCodes,
          limit,
          offset: 0,
        })
      },
      {
        maxRetries: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        retryableErrors: (error) => {
          // Retry on rate limits, network errors, timeouts
          return error.message.includes('rate limit') ||
                 error.message.includes('timeout') ||
                 error.message.includes('network') ||
                 error.message.includes('429') ||
                 error.message.includes('503')
        },
      }
    )
  })
  
  if (!result.success || !result.data) {
    throw result.error || new Error('Search failed after retries')
  }
  
  return result.data
}

/**
 * Search for contracts using unified interface
 */
export async function searchContracts(request: SearchRequest): Promise<SearchResponse> {
  const requestId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  const startTime = Date.now()
  
  logger.info('Starting contract search', {
    requestId,
    keywords: request.keywords,
    serviceCategory: request.serviceCategory,
  })
  
  try {
    // Build dual queries (SAM.gov API + Google)
    const { samGov, google, parsedKeywords } = buildDualQueries(request.keywords, {
      serviceCategory: request.serviceCategory,
      location: request.location,
      agency: request.agency,
      dateRange: request.dateRange,
      naicsCodes: request.naicsCodes,
      pscCodes: request.pscCodes,
    })
    
    logger.debug('Built queries', {
      requestId,
      samGovKeywords: samGov.keyword,
      googleQueryLength: google.query.length,
      parsedKeywords,
    })
    
    // Check cache if enabled
    const useCache = request.useCache !== false
    const cacheKey = generateSearchCacheKey(request)
    let cached = false
    let apiResponse: SamGovApiResponse | null = null
    
    if (useCache) {
      const cachedResult = await cache.get<SamGovApiResponse>(cacheKey)
      if (cachedResult) {
        logger.debug('Cache hit', { requestId, cacheKey })
        apiResponse = cachedResult
        cached = true
      }
    }
    
    // Execute search if not cached
    if (!apiResponse) {
      apiResponse = await executeSamGovSearch(samGov, request.limit || 30, requestId)
      
      // Cache result (5 minute TTL)
      if (useCache && apiResponse) {
        await cache.set(cacheKey, apiResponse, 5 * 60 * 1000)
      }
    }
    
    // Transform results
    const results = apiResponse.opportunitiesData
      .map(opportunity => {
        try {
          return transformSamGovResult(opportunity)
        } catch (error) {
          logger.warn('Error transforming result', {
            requestId,
            noticeId: opportunity.noticeId,
            error: error instanceof Error ? error.message : String(error),
          })
          return null
        }
      })
      .filter((result): result is DiscoveryResult => result !== null)
    
    // Sort by relevance score
    results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
    
    const duration = Date.now() - startTime
    
    // Record metrics
    recordSearchMetrics({
      searchId: requestId,
      query: request.keywords,
      method: 'api',
      duration,
      resultsCount: results.length,
      timestamp: Date.now(),
    })
    
    logger.info('Search completed', {
      requestId,
      resultsCount: results.length,
      duration,
      cached,
    })
    
    return {
      success: true,
      results,
      googleQuery: google,
      samGovQuery: samGov,
      totalRecords: apiResponse.totalRecords,
      cached,
      duration,
      requestId,
    }
  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    logger.error('Search failed', {
      requestId,
      error: error instanceof Error ? error : new Error(String(error)),
      duration,
    })
    
    // Record error metrics
    recordSearchMetrics({
      searchId: requestId,
      query: request.keywords,
      method: 'api',
      duration,
      resultsCount: 0,
      error: errorMessage,
      timestamp: Date.now(),
    })
    
    return {
      success: false,
      results: [],
      googleQuery: {
        query: '',
        description: 'Query generation failed',
      },
      samGovQuery: {
        keyword: undefined,
        setAside: [],
        naicsCodes: [],
        pscCodes: [],
      },
      totalRecords: 0,
      cached: false,
      duration,
      error: errorMessage,
      requestId,
    }
  }
}

/**
 * Deduplicate results by URL
 */
export function deduplicateResults(results: DiscoveryResult[]): DiscoveryResult[] {
  const seen = new Set<string>()
  const deduplicated: DiscoveryResult[] = []
  
  for (const result of results) {
    if (!seen.has(result.url)) {
      seen.add(result.url)
      deduplicated.push(result)
    }
  }
  
  return deduplicated
}

/**
 * Filter results by relevance score
 */
export function filterByRelevance(
  results: DiscoveryResult[],
  minScore: number = 50
): DiscoveryResult[] {
  return results.filter(result => (result.relevance_score || 0) >= minScore)
}

