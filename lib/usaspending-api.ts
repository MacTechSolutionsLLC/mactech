/**
 * USAspending.gov API Integration
 * 
 * Uses the official USAspending.gov API v2
 * Documentation: https://api.usaspending.gov/api/v2/
 * Base URL: https://api.usaspending.gov/api/v2/
 * 
 * No authentication required - public API
 * Status codes: 200 (success), 400 (malformed request), 500 (server error)
 */

const BASE_URL = 'https://api.usaspending.gov/api/v2'

/**
 * Award type codes
 * A = Procurement Contract, B = Grant, C = Direct Payment, D = Loan, IDV = Indefinite Delivery Vehicle
 */
export type AwardTypeCode = 'A' | 'B' | 'C' | 'D' | 'IDV' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11'

/**
 * Time period filter for fiscal year and period
 */
export interface TimePeriodFilter {
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  date_type?: 'action_date' | 'last_modified_date'
}

/**
 * Agency filter
 */
export interface AgencyFilter {
  type?: 'awarding' | 'funding'
  tier?: 'toptier' | 'subtier'
  name?: string
  toptier_agency_id?: string
  toptier_agency_name?: string
  subtier_agency_id?: string
  subtier_agency_name?: string
}

/**
 * Location filter for place of performance
 */
export interface LocationFilter {
  country?: string
  state?: string
  county?: string
  city?: string
  congressional_district?: string
  zip?: string
}

/**
 * Award amount filter
 */
export interface AwardAmountFilter {
  lower_bound?: number
  upper_bound?: number
}

/**
 * Main filters object for search endpoints
 */
export interface UsaSpendingFilters {
  award_type_codes?: AwardTypeCode[]
  agencies?: AgencyFilter[]
  // USAspending API accepts naics_codes as array of strings (not objects)
  naics_codes?: string[] | Array<{ code?: string; name?: string }>
  // USAspending API accepts psc_codes as array of strings (not objects)
  psc_codes?: string[] | Array<{ code?: string; name?: string }>
  recipient_search_text?: string
  recipient_id?: string
  recipient_uei?: string
  recipient_duns?: string
  time_period?: TimePeriodFilter[]
  place_of_performance_locations?: LocationFilter[]
  award_amounts?: AwardAmountFilter[]
  keywords?: string[]
  tas_codes?: string[]
  cfda_numbers?: string[]
  def_codes?: string[]
}

/**
 * Search parameters for spending_by_award endpoint
 */
export interface UsaSpendingSearchParams {
  filters: UsaSpendingFilters
  fields?: string[]
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  subawards?: boolean
}

/**
 * Award data structure
 */
export interface UsaSpendingAward {
  id?: string
  award_id?: string
  generated_unique_award_id?: string
  type?: string
  type_description?: string
  category?: string
  piid?: string
  fain?: string
  uri?: string
  total_obligation?: number
  total_outlay?: number
  total_subsidy_cost?: number
  awarding_agency?: {
    id?: string
    name?: string
    toptier_agency?: {
      name?: string
      abbreviation?: string
    }
    subtier_agency?: {
      name?: string
      abbreviation?: string
    }
  }
  funding_agency?: {
    id?: string
    name?: string
    toptier_agency?: {
      name?: string
      abbreviation?: string
    }
    subtier_agency?: {
      name?: string
      abbreviation?: string
    }
  }
  recipient?: {
    name?: string
    uei?: string
    duns?: string
    hash?: string
    recipient_id?: string
    location?: {
      address_line1?: string
      address_line2?: string
      city?: string
      state?: string
      zip?: string
      country?: string
      congressional_district?: string
    }
  }
  place_of_performance?: {
    state?: string
    county?: string
    city?: string
    zip?: string
    country?: string
    congressional_district?: string
    location?: {
      latitude?: number
      longitude?: number
    }
  }
  start_date?: string
  end_date?: string
  last_modified_date?: string
  awarding_date?: string
  period_of_performance?: {
    start_date?: string
    end_date?: string
    last_modified_date?: string
  }
  description?: string
  naics?: string
  naics_description?: string
  psc?: string
  psc_description?: string
  cfda_number?: string
  cfda_title?: string
  transaction_count?: number
  total_subaward_amount?: number
  subaward_count?: number
  [key: string]: any // Allow additional fields from API
}

/**
 * Search response for spending_by_award
 */
export interface UsaSpendingSearchResponse {
  page_metadata?: {
    page?: number
    has_next_page?: boolean
    has_previous_page?: boolean
    next?: string
    previous?: string
  }
  results?: UsaSpendingAward[]
  messages?: string[]
}

/**
 * Award count response
 */
export interface UsaSpendingAwardCountResponse {
  contracts?: number
  idvs?: number
  loans?: number
  direct_payments?: number
  grants?: number
  other?: number
}

/**
 * Autocomplete response
 */
export interface UsaSpendingAutocompleteResponse {
  results?: Array<{
    text?: string
    value?: string
    [key: string]: any
  }>
}

/**
 * Reference data response
 */
export interface UsaSpendingReferenceResponse {
  results?: any[]
  [key: string]: any
}

/**
 * Transaction data
 */
export interface UsaSpendingTransaction {
  id?: string
  transaction_id?: string
  award_id?: string
  action_date?: string
  action_type?: string
  federal_action_obligation?: number
  total_obligation?: number
  total_outlay?: number
  awarding_agency?: any
  funding_agency?: any
  recipient?: any
  [key: string]: any
}

/**
 * Rate limiter - simple implementation to avoid overwhelming the API
 */
class RateLimiter {
  private requests: number[] = []
  private maxRequests = 10
  private windowMs = 1000 // 1 second window

  async waitIfNeeded(): Promise<void> {
    const now = Date.now()
    // Remove requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests)
      const waitTime = this.windowMs - (now - oldestRequest)
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime))
      }
    }
    
    this.requests.push(Date.now())
  }
}

const rateLimiter = new RateLimiter()

/**
 * Make API request with error handling and retry logic
 */
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<T> {
  await rateLimiter.waitIfNeeded()
  
  const url = `${BASE_URL}${endpoint}`
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        // Try to get error details from response
        let errorData: any = {}
        try {
          const text = await response.text()
          if (text) {
            errorData = JSON.parse(text)
          }
        } catch (e) {
          // If parsing fails, use empty object
        }

        if (response.status === 400) {
          throw new Error(`Bad request: ${JSON.stringify(errorData)}`)
        }
        if (response.status === 422) {
          const requestBody = options.body ? (typeof options.body === 'string' ? options.body.substring(0, 1000) : JSON.stringify(options.body).substring(0, 1000)) : 'N/A'
          throw new Error(`Validation error (422): ${JSON.stringify(errorData)} - Request: ${requestBody}`)
        }
        if (response.status === 500) {
          if (attempt < retries - 1) {
            // Retry on server errors
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
            continue
          }
          throw new Error(`Server error: ${response.status} ${response.statusText}`)
        }
        throw new Error(`HTTP error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
      }

      return await response.json()
    } catch (error) {
      if (attempt === retries - 1) {
        throw error
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * Calculate cosine similarity between two text strings
 * Used for title similarity matching
 */
export function calculateTitleSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0
  
  // Normalize text: lowercase, remove punctuation, split into words
  const normalize = (text: string): string[] => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0)
  }
  
  const words1 = normalize(text1)
  const words2 = normalize(text2)
  
  if (words1.length === 0 || words2.length === 0) return 0
  
  // Create word frequency maps
  const freq1 = new Map<string, number>()
  const freq2 = new Map<string, number>()
  
  words1.forEach(word => freq1.set(word, (freq1.get(word) || 0) + 1))
  words2.forEach(word => freq2.set(word, (freq2.get(word) || 0) + 1))
  
  // Get all unique words
  const allWords = new Set([...freq1.keys(), ...freq2.keys()])
  
  // Calculate dot product and magnitudes
  let dotProduct = 0
  let magnitude1 = 0
  let magnitude2 = 0
  
  allWords.forEach(word => {
    const count1 = freq1.get(word) || 0
    const count2 = freq2.get(word) || 0
    
    dotProduct += count1 * count2
    magnitude1 += count1 * count1
    magnitude2 += count2 * count2
  })
  
  // Cosine similarity
  const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2)
  return magnitude > 0 ? dotProduct / magnitude : 0
}

/**
 * Normalize agency name for deterministic matching
 * Removes common variations and standardizes format
 */
export function normalizeAgencyName(agencyName: string): string {
  if (!agencyName) return ''
  
  return agencyName
    .toUpperCase()
    .trim()
    // Remove common prefixes/suffixes
    .replace(/^(DEPARTMENT OF|DEPT OF|DOD|DHS|DOE|HHS|VA|GSA|NASA|NSF)\s+/i, '')
    .replace(/\s+(DEPARTMENT|DEPT|ADMINISTRATION|ADMIN|AGENCY|SERVICE|BUREAU|OFFICE)$/i, '')
    // Remove punctuation
    .replace(/[^\w\s]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Match awards by title similarity
 * Returns awards with similarity score above threshold
 */
export function matchAwardsByTitle(
  awards: UsaSpendingAward[],
  targetTitle: string,
  threshold: number = 0.3
): Array<{ award: UsaSpendingAward; similarity: number }> {
  if (!targetTitle || !awards || awards.length === 0) {
    return []
  }
  
  const matches: Array<{ award: UsaSpendingAward; similarity: number }> = []
  
  for (const award of awards) {
    const awardTitle = award.description || ''
    const similarity = calculateTitleSimilarity(targetTitle, awardTitle)
    
    if (similarity >= threshold) {
      matches.push({ award, similarity })
    }
  }
  
  // Sort by similarity (descending)
  matches.sort((a, b) => b.similarity - a.similarity)
  
  return matches
}

/**
 * Search awards by filters with optional title similarity matching
 */
export async function searchAwards(
  params: UsaSpendingSearchParams & {
    titleSimilarity?: {
      targetTitle: string
      threshold?: number
      maxResults?: number
    }
  }
): Promise<UsaSpendingSearchResponse & {
  titleSimilarityMatches?: Array<{ award: UsaSpendingAward; similarity: number }>
}> {
  const {
    filters,
    fields,
    page = 1,
    limit = 100,
    sort,
    order = 'desc',
    subawards = false,
    titleSimilarity,
  } = params

  // Default fields if none provided - API requires fields parameter
  // Note: If sort is specified, the sort field name (display name) must also be in this array
  // This is a known API limitation/issue
  const defaultFields = [
    'award_id',
    'generated_unique_award_id',
    'type',
    'type_description',
    'category',
    'piid',
    'fain',
    'uri',
    'total_obligation',
    'total_outlay',
    'total_subsidy_cost',
    'awarding_agency',
    'funding_agency',
    'recipient',
    'place_of_performance',
    'start_date',
    'end_date',
    'awarding_date',
    'last_modified_date',
    'period_of_performance',
    'description',
    'naics',
    'naics_description',
    'psc',
    'psc_description',
    'cfda_number',
    'cfda_title',
    'transaction_count',
    'subaward_count',
    'total_subaward_amount',
  ]
  
  // Don't add sort field to fields array - it causes API to return empty objects
  // The API validation is broken, so we'll just use the default fields
  const fieldsToUse = fields && fields.length > 0 ? fields : defaultFields

  const body: any = {
    filters,
    page,
    limit: Math.min(limit, 500), // Max 500 per page
    subawards,
    fields: fieldsToUse,
  }

  // Only include sort and order if sort is explicitly provided
  // This prevents API from defaulting to invalid sort when order is present
  if (sort) {
    body.sort = sort
    body.order = order
  }

  const response = await makeRequest<UsaSpendingSearchResponse>('/search/spending_by_award/', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  
  // Debug logging for first page to see actual API response structure
  if (page === 1 && response.results && response.results.length > 0) {
    console.log(`[USAspending API] Sample response structure (first result):`)
    console.log(`[USAspending API] - Keys:`, Object.keys(response.results[0]))
    console.log(`[USAspending API] - Full object (first 3000 chars):`, JSON.stringify(response.results[0], null, 2).substring(0, 3000))
  }
  
  // If title similarity matching is requested, calculate similarities
  if (titleSimilarity && response.results) {
    const matches = matchAwardsByTitle(
      response.results,
      titleSimilarity.targetTitle,
      titleSimilarity.threshold || 0.3
    )
    
    // Limit results if specified
    const limitedMatches = titleSimilarity.maxResults
      ? matches.slice(0, titleSimilarity.maxResults)
      : matches
    
    return {
      ...response,
      titleSimilarityMatches: limitedMatches,
    }
  }
  
  return response
}

/**
 * Get award count by type
 */
export async function getAwardCount(
  filters: UsaSpendingFilters
): Promise<UsaSpendingAwardCountResponse> {
  return makeRequest<UsaSpendingAwardCountResponse>('/search/spending_by_award_count/', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}

/**
 * Get specific award details
 */
export async function getAward(awardId: string): Promise<UsaSpendingAward> {
  return makeRequest<UsaSpendingAward>(`/awards/${awardId}/`, {
    method: 'GET',
  })
}

/**
 * Search transactions for an award
 */
export async function searchTransactions(
  filters: { award_id?: string; [key: string]: any }
): Promise<{ results?: UsaSpendingTransaction[]; [key: string]: any }> {
  return makeRequest('/transactions/', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}

/**
 * Search subawards
 */
export async function searchSubawards(
  filters: { award_id?: string; [key: string]: any }
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/subawards/', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  })
}

/**
 * Autocomplete recipients
 */
export async function autocompleteRecipient(
  searchText: string,
  limit = 10
): Promise<UsaSpendingAutocompleteResponse> {
  return makeRequest<UsaSpendingAutocompleteResponse>('/autocomplete/recipient/', {
    method: 'POST',
    body: JSON.stringify({
      search_text: searchText,
      limit,
    }),
  })
}

/**
 * Autocomplete NAICS codes
 */
export async function autocompleteNaics(
  searchText: string,
  limit = 10
): Promise<UsaSpendingAutocompleteResponse> {
  return makeRequest<UsaSpendingAutocompleteResponse>('/autocomplete/naics/', {
    method: 'POST',
    body: JSON.stringify({
      search_text: searchText,
      limit,
    }),
  })
}

/**
 * Autocomplete PSC codes
 */
export async function autocompletePsc(
  searchText: string,
  limit = 10
): Promise<UsaSpendingAutocompleteResponse> {
  return makeRequest<UsaSpendingAutocompleteResponse>('/autocomplete/psc/', {
    method: 'POST',
    body: JSON.stringify({
      search_text: searchText,
      limit,
    }),
  })
}

/**
 * Autocomplete awarding agencies
 */
export async function autocompleteAwardingAgency(
  searchText: string,
  limit = 10
): Promise<UsaSpendingAutocompleteResponse> {
  return makeRequest<UsaSpendingAutocompleteResponse>('/autocomplete/awarding_agency/', {
    method: 'POST',
    body: JSON.stringify({
      search_text: searchText,
      limit,
    }),
  })
}

/**
 * Autocomplete funding agencies
 */
export async function autocompleteFundingAgency(
  searchText: string,
  limit = 10
): Promise<UsaSpendingAutocompleteResponse> {
  return makeRequest<UsaSpendingAutocompleteResponse>('/autocomplete/funding_agency/', {
    method: 'POST',
    body: JSON.stringify({
      search_text: searchText,
      limit,
    }),
  })
}

/**
 * Get top-tier agencies reference data
 */
export async function getTopTierAgencies(): Promise<UsaSpendingReferenceResponse> {
  return makeRequest<UsaSpendingReferenceResponse>('/references/toptier_agencies/', {
    method: 'GET',
  })
}

/**
 * Get NAICS reference data
 */
export async function getNaicsReference(naicsCode?: string): Promise<UsaSpendingReferenceResponse> {
  const endpoint = naicsCode 
    ? `/references/naics/${naicsCode}/`
    : '/references/naics/'
  return makeRequest<UsaSpendingReferenceResponse>(endpoint, {
    method: 'GET',
  })
}

/**
 * Get award types reference
 */
export async function getAwardTypes(): Promise<UsaSpendingReferenceResponse> {
  return makeRequest<UsaSpendingReferenceResponse>('/references/award_types/', {
    method: 'GET',
  })
}

/**
 * Search spending by category (NAICS)
 */
export async function searchSpendingByNaics(
  filters: UsaSpendingFilters,
  page = 1,
  limit = 100
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/search/spending_by_category/naics/', {
    method: 'POST',
    body: JSON.stringify({
      filters,
      page,
      limit,
    }),
  })
}

/**
 * Search spending by category (PSC)
 */
export async function searchSpendingByPsc(
  filters: UsaSpendingFilters,
  page = 1,
  limit = 100
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/search/spending_by_category/psc/', {
    method: 'POST',
    body: JSON.stringify({
      filters,
      page,
      limit,
    }),
  })
}

/**
 * Search spending by category (recipient)
 */
export async function searchSpendingByRecipient(
  filters: UsaSpendingFilters,
  page = 1,
  limit = 100
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/search/spending_by_category/recipient/', {
    method: 'POST',
    body: JSON.stringify({
      filters,
      page,
      limit,
    }),
  })
}

/**
 * Search spending by category (awarding agency)
 */
export async function searchSpendingByAwardingAgency(
  filters: UsaSpendingFilters,
  page = 1,
  limit = 100
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/search/spending_by_category/awarding_agency/', {
    method: 'POST',
    body: JSON.stringify({
      filters,
      page,
      limit,
    }),
  })
}

/**
 * Search spending over time
 */
export async function searchSpendingOverTime(
  filters: UsaSpendingFilters,
  group?: string
): Promise<{ results?: any[]; [key: string]: any }> {
  return makeRequest('/search/spending_over_time/', {
    method: 'POST',
    body: JSON.stringify({
      filters,
      group,
    }),
  })
}

