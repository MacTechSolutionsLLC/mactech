/**
 * Unified contract search service
 * Orchestrates SAM.gov API searches with rate limiting, caching, and retry logic
 */

import { searchSamGov, transformSamGovResult, SamGovApiResponse } from '../sam-gov-api'

// Helper to get date range (duplicated from sam-gov-api for use here)
function getDateRange(dateRange?: 'past_week' | 'past_month' | 'past_year'): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  let from: Date
  switch (dateRange) {
    case 'past_week':
      from = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'past_month':
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case 'past_year':
      from = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
      break
    default:
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // Default to past month
  }
  
  const fromStr = from.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  return { from: fromStr, to }
}
import { DiscoveryResult, ServiceCategory } from '../contract-discovery'
import { buildSamGovQueryOnly, SamGovQuery, GoogleQuery } from './vetcert-query-builder'
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

export interface ApiCallDetails {
  keyword: string | undefined
  setAside: string[]
  dateRange: string
  postedFrom: string
  postedTo: string
  limit: number
  offset: number
  naicsCodes?: string[]
  pscCodes?: string[]
  apiUrl?: string // The actual API URL that would be called
}

export interface SearchResponse {
  success: boolean
  results: DiscoveryResult[]
  samGovQuery: SamGovQuery
  apiCallDetails: ApiCallDetails
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
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:73',message:'Internal rate limit check',data:{rateLimitKey,allowed:limitCheck.allowed,maxRequests:rateLimit.maxRequests,windowMs:rateLimit.windowMs,requestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
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
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:116',message:'Checking if error is retryable',data:{errorMessage:error.message,errorMessageLower:error.message.toLowerCase()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          // DO NOT retry on rate limits - fail fast to avoid wasting API quota
          // Retry only on network errors, timeouts, and server errors (not 429)
          const errorMsg = error.message.toLowerCase()
          const isRateLimit = errorMsg.includes('rate limit') || 
                             errorMsg.includes('429') ||
                             errorMsg.includes('daily request limits') ||
                             errorMsg.includes('rate limit exceeded')
          
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:125',message:'Retry decision',data:{isRateLimit,willRetry:!isRateLimit && (errorMsg.includes('timeout') || errorMsg.includes('network') || errorMsg.includes('503') || errorMsg.includes('502') || errorMsg.includes('500'))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          
          if (isRateLimit) {
            return false // Never retry rate limit errors
          }
          
          // Retry on network errors, timeouts, and server errors
          return errorMsg.includes('timeout') ||
                 errorMsg.includes('network') ||
                 errorMsg.includes('econnreset') ||
                 errorMsg.includes('etimedout') ||
                 errorMsg.includes('enotfound') ||
                 errorMsg.includes('503') ||
                 errorMsg.includes('502') ||
                 errorMsg.includes('500')
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
    // Build SAM.gov API query only (Google query generation moved to separate button)
    const { samGov, parsedKeywords } = buildSamGovQueryOnly(request.keywords, {
      serviceCategory: request.serviceCategory,
      location: request.location,
      agency: request.agency,
      dateRange: request.dateRange,
      naicsCodes: request.naicsCodes,
      pscCodes: request.pscCodes,
    })
    
    logger.debug('Built SAM.gov query', {
      requestId,
      samGovKeywords: samGov.keyword,
      parsedKeywords,
    })
    
    // Check cache if enabled
    const useCache = request.useCache !== false
    const cacheKey = generateSearchCacheKey(request)
    let cached = false
    let apiResponse: SamGovApiResponse | null = null
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:168',message:'Checking cache before API call',data:{cacheKey,useCache,requestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (useCache) {
      const cachedResult = await cache.get<SamGovApiResponse>(cacheKey)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:172',message:'Cache lookup result',data:{cacheKey,hasCachedResult:!!cachedResult,requestId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (cachedResult) {
        logger.debug('Cache hit', { requestId, cacheKey })
        apiResponse = cachedResult
        cached = true
      }
    }
    
    // Execute search if not cached
    if (!apiResponse) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:178',message:'Executing API search (not cached)',data:{requestId,query:samGov.keyword},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      apiResponse = await executeSamGovSearch(samGov, request.limit || 30, requestId)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'contract-search-service.ts:181',message:'API search completed',data:{requestId,success:!!apiResponse,totalRecords:apiResponse?.totalRecords},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
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
    
    // Build API call details for display
    const { from, to } = getDateRange(samGov.dateRange || 'past_month')
    const apiCallDetails: ApiCallDetails = {
      keyword: samGov.keyword,
      setAside: samGov.setAside || [],
      dateRange: samGov.dateRange || 'past_month',
      postedFrom: from,
      postedTo: to,
      limit: request.limit || 30,
      offset: 0,
      naicsCodes: samGov.naicsCodes,
      pscCodes: samGov.pscCodes,
    }
    
    // Build API URL for display (without API key)
    const apiUrl = new URL('https://api.sam.gov/prod/opportunities/v2/search')
    if (apiCallDetails.keyword) {
      apiUrl.searchParams.append('keyword', apiCallDetails.keyword)
    }
    if (apiCallDetails.setAside.length > 0) {
      apiCallDetails.setAside.forEach(sa => apiUrl.searchParams.append('setAside', sa))
    }
    apiUrl.searchParams.append('postedFrom', apiCallDetails.postedFrom)
    apiUrl.searchParams.append('postedTo', apiCallDetails.postedTo)
    apiUrl.searchParams.append('limit', String(apiCallDetails.limit))
    apiUrl.searchParams.append('offset', String(apiCallDetails.offset))
    apiCallDetails.apiUrl = apiUrl.toString()
    
    return {
      success: true,
      results,
      samGovQuery: samGov,
      apiCallDetails,
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
    
    // Build empty API call details for error case
    const emptyApiCallDetails: ApiCallDetails = {
      keyword: undefined,
      setAside: [],
      dateRange: request.dateRange || 'past_month',
      postedFrom: '',
      postedTo: '',
      limit: request.limit || 30,
      offset: 0,
    }
    
    const { from, to } = getDateRange(request.dateRange)
    
    return {
      success: false,
      results: [],
      samGovQuery: {
        keyword: undefined,
        setAside: [],
        naicsCodes: [],
        pscCodes: [],
      },
      apiCallDetails: {
        keyword: undefined,
        setAside: [],
        dateRange: request.dateRange || 'past_month',
        postedFrom: from,
        postedTo: to,
        limit: request.limit || 30,
        offset: 0,
        naicsCodes: request.naicsCodes,
        pscCodes: request.pscCodes,
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

