/**
 * SAM.gov Official API Integration
 * 
 * Uses the official SAM.gov Opportunities API v2
 * Documentation: https://open.gsa.gov/api/opportunities-api/
 * Endpoint: https://api.sam.gov/prod/opportunities/v2/search
 * 
 * Also incorporates patterns from SAM.gov Entity Management API
 * Documentation: https://open.gsa.gov/api/entity-api/
 * 
 * Updated based on SAM.gov API documentation patterns
 * Supports enhanced filtering with NAICS codes, PSC codes, and additional parameters
 * 
 * API Key Rate Limits (from Entity API patterns):
 * - Non-federal user (no role): 10 requests/day
 * - Non-federal user (with role): 1,000 requests/day
 * - Federal user: 1,000 requests/day
 * - Non-federal system: 1,000 requests/day
 * - Federal system: 10,000 requests/day
 */

import { DiscoveryResult, ServiceCategory } from './contract-discovery'

export interface SamGovSearchParams {
  keyword?: string
  postedFrom?: string // MM/DD/YYYY
  postedTo?: string // MM/DD/YYYY
  limit?: number
  offset?: number
  noticeType?: string // 'PRESOL', 'COMBINE', 'SRCSGT', 'SNOTE', 'SSALE', 'AWARD', 'JA', 'ITB', 'PRESOL', 'COMBINE', 'SRCSGT', 'SNOTE', 'SSALE', 'AWARD', 'JA', 'ITB'
  setAside?: string // 'SBA', '8A', 'HUBZONE', 'WOSB', 'EDWOSB', 'SDVOSB', 'VOSB', etc.
  naicsCode?: string
  classificationCode?: string // PSC code
  organizationType?: string
  // Additional parameters based on SAM.gov API documentation
  deptind?: string // Department/Independent Agency code
  officeAddress?: string // Office address filter
  placeOfPerformance?: string // Place of performance filter
  active?: boolean // Filter for active opportunities only
  awardAmountFrom?: number // Minimum award amount
  awardAmountTo?: number // Maximum award amount
  responseDeadlineFrom?: string // MM/DD/YYYY - Response deadline from
  responseDeadlineTo?: string // MM/DD/YYYY - Response deadline to
}

/**
 * Target NAICS codes for IT/cybersecurity services
 */
export const TARGET_NAICS_CODES = [
  '541512', // Computer Systems Design Services
  '541519', // Other Computer Related Services
  '541511', // Custom Computer Programming Services
  '541330', // Engineering Services
  '541690', // Other Scientific and Technical Consulting Services
]

/**
 * Target PSC codes for IT/cybersecurity services
 */
export const TARGET_PSC_CODES = [
  'D310', // IT & Telecom: Cyber Security and Data Backup
  'D307', // IT & Telecom: IT Strategy and Architecture
  'D399', // IT & Telecom: Other IT and Telecommunications
  'R499', // Support: Professional: Other
]

export interface SamGovOpportunity {
  noticeId: string
  title: string
  solicitationNumber?: string
  postedDate: string
  type: string
  baseType: string
  archiveType?: string
  archiveDate?: string
  typeOfSetAside?: string
  typeOfSetAsideDescription?: string
  responseDeadLine?: string
  naicsCode?: string
  naicsCodes?: string[]
  classificationCode?: string
  active?: boolean
  _relevanceBoost?: number // Internal field for client-side relevance boosting
  award?: {
    awardDate?: string
    awardAmount?: number
    awardee?: {
      name?: string
      duns?: string
      location?: {
        streetAddress?: string
        city?: string
        state?: string
        zip?: string
        country?: string
      }
    }
  }
  pointOfContact?: Array<{
    type?: string
    email?: string
    phone?: string
    fax?: string
    fullName?: string
    title?: string
  }>
  placeOfPerformance?: {
    streetAddress?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  description?: string
  organizationType?: string
  officeAddress?: {
    streetAddress?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  additionalInfoLink?: string
  uiLink?: string
  links?: Array<{
    rel?: string
    href?: string
    type?: string
  }>
  // Additional fields that may be in API response
  attachments?: Array<{
    url?: string
    name?: string
    type?: string
  }>
  resources?: Array<{
    url?: string
    title?: string
    type?: string
  }>
}

export interface SamGovApiResponse {
  totalRecords: number
  limit: number
  offset: number
  opportunitiesData: SamGovOpportunity[]
}

/**
 * Get date range for SAM.gov API
 */
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

/**
 * Clean Google search syntax from keywords for SAM.gov API
 */
function cleanGoogleSyntax(keywords: string): string {
  // Remove Google-specific operators
  let cleaned = keywords
    .replace(/site:\S+/gi, '') // Remove site: operators
    .replace(/-filetype:\S+/gi, '') // Remove -filetype: operators
    .replace(/filetype:\S+/gi, '') // Remove filetype: operators
    .replace(/\(/g, ' ') // Remove parentheses
    .replace(/\)/g, ' ')
    .replace(/"/g, '') // Remove quotes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
  
  // Remove common Google operators
  const operators = ['OR', 'AND', 'NOT']
  operators.forEach(op => {
    cleaned = cleaned.replace(new RegExp(`\\b${op}\\b`, 'gi'), ' ')
  })
  
  return cleaned.replace(/\s+/g, ' ').trim()
}

/**
 * Detect if a search is cybersecurity-focused based on keywords or service category
 */
function isCybersecuritySearch(keywords?: string, serviceCategory?: ServiceCategory): boolean {
  if (serviceCategory === 'cybersecurity') return true
  
  if (!keywords) return false
  
  const upperKeywords = keywords.toUpperCase()
  const cyberTerms = [
    'ATO', 'AUTHORIZATION TO OPERATE',
    'RMF', 'RISK MANAGEMENT FRAMEWORK',
    'CYBERSECURITY', 'CYBER SECURITY',
    'STIG', 'SECURITY TECHNICAL IMPLEMENTATION GUIDE',
    'NIST', 'NIST 800-53',
    'ISSO', 'ISSM', 'ISSE',
    'SCA', 'SECURITY CONTROL ASSESSMENT',
    'CONMON', 'CONTINUOUS MONITORING',
    'POA&M', 'PLAN OF ACTION',
    'SSP', 'SYSTEM SECURITY PLAN',
    'CMMC', 'EMMASS', 'XACTA'
  ]
  
  return cyberTerms.some(term => upperKeywords.includes(term))
}

/**
 * Expand ambiguous abbreviations to full terms for better matching
 * For cybersecurity searches, prioritize full phrases over abbreviations
 */
function expandKeywords(keywords: string, isCyberSearch: boolean = false): string {
  const expansions: Record<string, string> = {
    'ATO': 'Authorization to Operate',
    'RMF': 'Risk Management Framework',
    'STIG': 'Security Technical Implementation Guide',
    'SCA': 'Security Control Assessment',
    'ConMon': 'Continuous Monitoring',
    'POA&M': 'Plan of Action and Milestones',
    'SSP': 'System Security Plan',
    'RAR': 'Risk Assessment Report',
  }
  
  let expanded = keywords
  const upperKeywords = keywords.toUpperCase()
  
  // For cybersecurity searches, replace abbreviations with full terms to avoid false matches
  // This prevents "ATO" from matching part numbers like "30--CYLINDER ASSEMBLY,A"
  if (isCyberSearch) {
    for (const [abbr, full] of Object.entries(expansions)) {
      // Use word boundaries to match whole words only
      const abbrRegex = new RegExp(`\\b${abbr}\\b`, 'gi')
      if (abbrRegex.test(keywords)) {
        // Replace abbreviation with full term, keeping original if it's part of a larger word
        expanded = expanded.replace(abbrRegex, full)
      }
    }
  } else {
    // For non-cybersecurity searches, add expansions alongside abbreviations
    for (const [abbr, full] of Object.entries(expansions)) {
      if (upperKeywords.includes(abbr.toUpperCase()) && !upperKeywords.includes(full.toUpperCase())) {
        expanded += ` ${full}`
      }
    }
  }
  
  return expanded
}

/**
 * Build keyword query from search request
 */
function buildKeywordQuery(
  keywords?: string,
  serviceCategory?: ServiceCategory,
  customKeywords?: string,
  isCyberSearch?: boolean
): string {
  const keywordParts: string[] = []
  
  // Clean Google syntax from keywords if present
  let cleanedKeywords = keywords ? cleanGoogleSyntax(keywords) : undefined
  
  // Expand abbreviations for better matching (pass isCyberSearch flag for aggressive expansion)
  if (cleanedKeywords) {
    cleanedKeywords = expandKeywords(cleanedKeywords, isCyberSearch || false)
  }
  
  // Only add service category keywords if no explicit keywords provided
  // This makes searches less restrictive when user provides specific keywords
  if (serviceCategory && !cleanedKeywords) {
    const categoryKeywords: Record<ServiceCategory, string[]> = {
      cybersecurity: ['RMF', 'ATO', 'cybersecurity', 'ISSO', 'ISSM', 'STIG', 'NIST 800-53'],
      infrastructure: ['data center', 'infrastructure', 'cloud', 'network'],
      compliance: ['audit readiness', 'compliance', 'ISO', 'QMS'],
      contracts: ['contract management', 'governance'],
      general: [],
    }
    
    if (categoryKeywords[serviceCategory].length > 0) {
      keywordParts.push(...categoryKeywords[serviceCategory].slice(0, 3))
    }
  }
  
  // Add custom keywords
  if (customKeywords) {
    keywordParts.push(customKeywords)
  }
  
  // Add explicit keywords (cleaned and expanded) - prioritize user-provided keywords
  if (cleanedKeywords) {
    keywordParts.push(cleanedKeywords)
  }
  
  return keywordParts.join(' ')
}

/**
 * Map SAM.gov set-aside codes to our format
 */
function mapSetAside(setAside?: string): string[] {
  if (!setAside) return []
  
  const mapping: Record<string, string> = {
    'SDVOSB': 'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside',
    'VOSB': 'Veteran-Owned Small Business Set Aside, Department of Veterans Affairs',
    '8A': '8(a)',
    'WOSB': 'Woman-Owned Small Business',
    'EDWOSB': 'Economically Disadvantaged Woman-Owned Small Business',
    'HUBZONE': 'HUBZone',
  }
  
  return [mapping[setAside] || setAside]
}

/**
 * Search SAM.gov for contract opportunities
 * Supports multiple NAICS codes by making multiple API calls if needed
 */
export async function searchSamGov(params: {
  keywords?: string
  serviceCategory?: ServiceCategory
  dateRange?: 'past_week' | 'past_month' | 'past_year'
  setAside?: string[]
  naicsCodes?: string[]
  pscCodes?: string[]
  limit?: number
  offset?: number
  useTargetCodes?: boolean // If true, use TARGET_NAICS_CODES and TARGET_PSC_CODES as defaults
}): Promise<SamGovApiResponse> {
  const { from, to } = getDateRange(params.dateRange)
  
  // Use target codes ONLY if explicitly requested - default to empty for broader searches
  const naicsCodes = params.useTargetCodes && (!params.naicsCodes || params.naicsCodes.length === 0)
    ? TARGET_NAICS_CODES
    : (params.naicsCodes || [])
  
  const pscCodes = params.useTargetCodes && (!params.pscCodes || params.pscCodes.length === 0)
    ? TARGET_PSC_CODES
    : (params.pscCodes || [])
  
  // Detect if this is a cybersecurity search (before building keyword query)
  const isCyberSearch = isCybersecuritySearch(params.keywords, params.serviceCategory)
  
  // Build keyword query - prioritize explicit keywords over service category
  // Only add service category keywords if no explicit keywords provided
  const keyword = params.keywords && params.keywords.trim().length > 0
    ? buildKeywordQuery(params.keywords, undefined, undefined, isCyberSearch) // Use only explicit keywords, pass isCyberSearch flag
    : buildKeywordQuery(undefined, params.serviceCategory, undefined, isCyberSearch) // Fall back to category keywords if no explicit keywords
  
  // For cybersecurity searches, automatically use IT/cybersecurity NAICS and PSC codes as API filters
  // This prevents matching hardware/manufacturing opportunities
  const apiNaicsCodes = isCyberSearch && naicsCodes.length === 0
    ? TARGET_NAICS_CODES
    : naicsCodes
  
  const apiPscCodes = isCyberSearch && pscCodes.length === 0
    ? TARGET_PSC_CODES
    : pscCodes
  
  // Normalize set-aside types (SDVOSB, VOSB)
  const setAsideTypes = (params.setAside || [])
    .map(sa => {
      if (sa.includes('SDVOSB') || sa.includes('Service-Disabled Veteran')) return 'SDVOSB'
      if (sa.includes('VOSB') || sa.includes('Veteran-Owned')) return 'VOSB'
      return sa
    })
    .filter((sa, index, arr) => arr.indexOf(sa) === index) // Remove duplicates
  
  // For cybersecurity searches, use NAICS/PSC codes as API filters to narrow results
  // For other searches, use codes only for client-side ranking if explicitly provided
  
  // Use codes for ranking (always available for client-side filtering)
  const rankingNaicsCodes = apiNaicsCodes.length > 0 ? apiNaicsCodes : []
  const rankingPscCodes = apiPscCodes.length > 0 ? apiPscCodes : []
  
  const results: SamGovOpportunity[] = []
  const seenNoticeIds = new Set<string>()
  let totalRecords = 0
  
  // Track failed searches to determine if we should throw errors
  const failedSearches: Array<{ setAside: string | undefined; error: Error }> = []
  let successfulSearches = 0
  
  // If no set-aside types specified, make one call without set-aside filter
  const setAsidesToSearch = setAsideTypes.length > 0 ? setAsideTypes : [undefined]
  
  // For cybersecurity searches with multiple NAICS codes, make separate API calls for each NAICS code
  // This ensures we get results for all relevant IT service categories
  const naicsCodesToSearch = isCyberSearch && apiNaicsCodes.length > 0 
    ? apiNaicsCodes 
    : (apiNaicsCodes.length > 0 ? [apiNaicsCodes[0]] : [undefined]) // For non-cyber, use first code only
  
  // Calculate limit per API call - if we have multiple NAICS codes, divide limit among them
  // This prevents getting too many results and helps with rate limiting
  const baseLimit = params.limit || 30
  const limitPerCall = naicsCodesToSearch.length > 1 && naicsCodesToSearch[0] !== undefined
    ? Math.max(10, Math.ceil(baseLimit / naicsCodesToSearch.length)) // At least 10 per call
    : baseLimit
  
  for (const setAsideType of setAsidesToSearch) {
    for (const naicsCode of naicsCodesToSearch) {
      try {
        // For cybersecurity searches, use NAICS/PSC filters in API call to narrow results
        // Make separate calls for each NAICS code to ensure we get all relevant results
        const singleResult = await searchSamGovSingle({
          keywords: params.keywords,
          serviceCategory: params.serviceCategory,
          dateRange: params.dateRange,
          setAside: setAsideType ? [setAsideType] : undefined,
          naicsCodes: naicsCode ? [naicsCode] : undefined, // Use single NAICS code per call
          pscCodes: isCyberSearch && apiPscCodes.length > 0 ? [apiPscCodes[0]] : undefined, // Use first PSC code
          limit: limitPerCall,
          offset: params.offset || 0,
          keyword,
          from,
          to,
        })
      
      // Deduplicate by noticeId, filter irrelevant results, and apply NAICS/PSC relevance boosting
      const irrelevantNaics = [
        '325920', '237990', '339112', '332912', '322230', '333996', '236220', '562910', 
        '325120', '311991', '334514', '336413', '332510', '541380', '332911', '336412', 
        '336611', '335931', '332999', '333998', '332994', '333618', '334417', '334220',
        '333611', '333612', '333613', '333519', '333914', '332722', '335314', '339991',
        '336390', '336360', '334290', '336320', '332119', '326122', '335999'
      ]
      
      // Define IT/cybersecurity NAICS codes that are relevant
      const relevantNaics = ['541512', '541519', '541511', '541330', '541690']
      
      singleResult.opportunitiesData.forEach(opp => {
        if (!seenNoticeIds.has(opp.noticeId)) {
          const oppNaicsCodes = [
            opp.naicsCode,
            ...(opp.naicsCodes || [])
          ].filter(Boolean) as string[]
          
          // For cybersecurity searches, aggressively filter out irrelevant results
          if (isCyberSearch) {
            // Skip if any NAICS code is in the irrelevant list
            if (oppNaicsCodes.some(code => irrelevantNaics.includes(code))) {
              return // Skip this result
            }
            
            // For cybersecurity searches, prefer results with relevant NAICS codes
            // If no relevant NAICS code, check if title/description has cybersecurity keywords
            const hasRelevantNaics = oppNaicsCodes.some(code => relevantNaics.includes(code))
            const titleDesc = `${opp.title} ${opp.description || ''}`.toUpperCase()
            const hasCyberKeywords = /(RMF|RISK MANAGEMENT FRAMEWORK|ATO|AUTHORIZATION TO OPERATE|CYBERSECURITY|STIG|NIST|ISSO|ISSM|SCA|SECURITY CONTROL|CONMON|CONTINUOUS MONITORING)/i.test(titleDesc)
            
            // If no relevant NAICS AND no cybersecurity keywords, skip
            if (!hasRelevantNaics && !hasCyberKeywords) {
              return // Skip this result
            }
          }
          
          seenNoticeIds.add(opp.noticeId)
          
          // Boost relevance for matching NAICS codes (client-side ranking)
          if (rankingNaicsCodes.length > 0 && opp.naicsCode) {
            if (rankingNaicsCodes.includes(opp.naicsCode)) {
              // Mark as high relevance - will be used in transformSamGovResult
              opp._relevanceBoost = (opp._relevanceBoost || 0) + 20
            }
          }
          
          // Boost relevance for matching PSC codes (client-side ranking)
          if (rankingPscCodes.length > 0 && opp.classificationCode) {
            if (rankingPscCodes.includes(opp.classificationCode)) {
              opp._relevanceBoost = (opp._relevanceBoost || 0) + 15
            }
          }
          
          results.push(opp)
        }
      })
      
        totalRecords += singleResult.totalRecords
        successfulSearches++
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error(String(error))
        const isRateLimit = errorObj.message.includes('rate limit') || errorObj.message.includes('429')
        
        console.error(`[SAM.gov API] Error searching set-aside ${setAsideType || 'none'}, NAICS ${naicsCode || 'none'}:`, errorObj.message)
        
        failedSearches.push({
          setAside: setAsideType,
          error: errorObj,
        })
        
        // If this is a rate limit error and we have no successful searches yet, continue to check others
        // We'll throw if ALL searches fail with rate limits
      }
    }
  }
  
  // If all searches failed, throw the error (especially if it's a rate limit)
  if (successfulSearches === 0 && failedSearches.length > 0) {
    const firstError = failedSearches[0].error
    const allRateLimits = failedSearches.every(f => 
      f.error.message.includes('rate limit') || f.error.message.includes('429')
    )
    
    // If all failures are rate limits, throw the rate limit error
    if (allRateLimits) {
      throw firstError
    }
    
    // Otherwise throw the first error
    throw firstError
  }
  
  // Sort by postedDate (newest first) and limit results
  results.sort((a, b) => {
    const dateA = new Date(a.postedDate).getTime()
    const dateB = new Date(b.postedDate).getTime()
    return dateB - dateA
  })
  
  const limit = params.limit || 30
  const limitedResults = results.slice(0, limit)
  
  return {
    totalRecords: Math.max(totalRecords, limitedResults.length),
    limit,
    offset: params.offset || 0,
    opportunitiesData: limitedResults,
  }
}

/**
 * Internal function to make a single SAM.gov API call
 */
async function searchSamGovSingle(params: {
  keywords?: string
  serviceCategory?: ServiceCategory
  dateRange?: 'past_week' | 'past_month' | 'past_year'
  setAside?: string[]
  naicsCodes?: string[]
  pscCodes?: string[]
  limit?: number
  offset?: number
  keyword?: string
  from?: string
  to?: string
  active?: boolean
  // Additional optional parameters
  deptind?: string
  officeAddress?: string
  placeOfPerformance?: string
  awardAmountFrom?: number
  awardAmountTo?: number
  responseDeadlineFrom?: string
  responseDeadlineTo?: string
}): Promise<SamGovApiResponse> {
  const { from, to } = params.from && params.to 
    ? { from: params.from, to: params.to }
    : getDateRange(params.dateRange)
  
  const keyword = params.keyword || buildKeywordQuery(
    params.keywords,
    params.serviceCategory
  )
  
  // Build API URL
  const apiUrl = new URL('https://api.sam.gov/prod/opportunities/v2/search')
  
  // Add query parameters
  // Note: SAM.gov APIs support AND (&), OR (~), NOT (!) operators in some contexts
  // For keyword searches, we use simple space-separated terms
  if (keyword) {
    // Clean keyword to remove special characters that might break API
    // Entity API docs note: & | { } ^ \ are not allowed in parameter values
    const cleanedKeyword = keyword
      .replace(/[&|{}^\\]/g, ' ') // Remove disallowed characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    if (cleanedKeyword) {
      apiUrl.searchParams.append('keyword', cleanedKeyword)
    }
  }
  
  apiUrl.searchParams.append('postedFrom', from)
  apiUrl.searchParams.append('postedTo', to)
  apiUrl.searchParams.append('limit', String(params.limit || 25))
  apiUrl.searchParams.append('offset', String(params.offset || 0))
  
  // Add set-aside filter (SAM.gov uses specific codes)
  if (params.setAside && params.setAside.length > 0) {
    // Map our set-aside terms to SAM.gov codes
    const samSetAside = params.setAside
      .map(sa => {
        if (sa.includes('SDVOSB') || sa.includes('Service-Disabled Veteran')) return 'SDVOSB'
        if (sa.includes('VOSB') || sa.includes('Veteran-Owned')) return 'VOSB'
        return null
      })
      .filter(Boolean)[0]
    
    if (samSetAside) {
      apiUrl.searchParams.append('setAside', samSetAside)
    }
  }
  
  // Add NAICS code filter - only if explicitly provided
  if (params.naicsCodes && params.naicsCodes.length > 0) {
    apiUrl.searchParams.append('naicsCode', params.naicsCodes[0])
  }
  
  // Add PSC code filter (classificationCode) - only if explicitly provided
  if (params.pscCodes && params.pscCodes.length > 0) {
    apiUrl.searchParams.append('classificationCode', params.pscCodes[0])
  }
  
  // Add additional optional filters if provided
  // Note: These parameters may vary by API version - adjust based on actual SAM.gov API documentation
  if (params.active !== undefined) {
    apiUrl.searchParams.append('active', String(params.active))
  }
  
  if (params.deptind) {
    apiUrl.searchParams.append('deptind', params.deptind)
  }
  
  if (params.officeAddress) {
    apiUrl.searchParams.append('officeAddress', params.officeAddress)
  }
  
  if (params.placeOfPerformance) {
    apiUrl.searchParams.append('placeOfPerformance', params.placeOfPerformance)
  }
  
  if (params.awardAmountFrom !== undefined) {
    apiUrl.searchParams.append('awardAmountFrom', String(params.awardAmountFrom))
  }
  
  if (params.awardAmountTo !== undefined) {
    apiUrl.searchParams.append('awardAmountTo', String(params.awardAmountTo))
  }
  
  if (params.responseDeadlineFrom) {
    apiUrl.searchParams.append('responseDeadlineFrom', params.responseDeadlineFrom)
  }
  
  if (params.responseDeadlineTo) {
    apiUrl.searchParams.append('responseDeadlineTo', params.responseDeadlineTo)
  }
  
  // Get API key from environment (optional but recommended)
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  // Add API key to query params (Opportunities API pattern)
  if (apiKey) {
    apiUrl.searchParams.append('api_key', apiKey)
  }
  
  console.log(`[SAM.gov API] Searching: ${apiUrl.toString().replace(/api_key=[^&]+/, 'api_key=***')}`)
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'MacTech Contract Discovery/1.0',
    }
    
    // SAM.gov APIs support API key in headers (Entity API pattern uses x-api-key)
    // Opportunities API may accept both query param and header
    if (apiKey) {
      // Try both header formats for compatibility
      headers['X-Api-Key'] = apiKey
      headers['x-api-key'] = apiKey // Entity API uses lowercase
    }
    
    const response = await fetch(apiUrl.toString(), {
      headers,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Provide helpful error message for missing/invalid API key
      if (response.status === 401) {
        throw new Error(
          `SAM.gov API requires an API key. ` +
          `Please register at https://api.sam.gov/ and set SAM_GOV_API_KEY environment variable. ` +
          `Error: ${errorText.substring(0, 200)}`
        )
      }
      
      // Handle rate limiting (429)
      if (response.status === 429) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sam-gov-api.ts:542',message:'Rate limit 429 error received',data:{status:429,errorText:errorText.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        let nextAccessTime: string | null = null
        try {
          const errorJson = JSON.parse(errorText)
          nextAccessTime = errorJson.nextAccessTime || errorJson.description?.match(/after (.+?)(?:\s|$)/)?.[1] || null
        } catch {
          // If JSON parsing fails, try to extract from text
          const timeMatch = errorText.match(/after (.+?)(?:\s|UTC|$)/i)
          if (timeMatch) {
            nextAccessTime = timeMatch[1]
          }
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/97777cf7-cafd-467f-87c0-0332e36c479c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sam-gov-api.ts:555',message:'Throwing rate limit error (should NOT be retried)',data:{nextAccessTime,rateLimitMessage:`SAM.gov API rate limit exceeded. You can try again after ${nextAccessTime || 'later'}. The free tier has daily request limits.`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        const rateLimitMessage = nextAccessTime 
          ? `SAM.gov API rate limit exceeded. You can try again after ${nextAccessTime}. The free tier has daily request limits.`
          : `SAM.gov API rate limit exceeded. The free tier has daily request limits. Please try again later.`
        
        throw new Error(rateLimitMessage)
      }
      
      throw new Error(`SAM.gov API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`)
    }
    
    const data: SamGovApiResponse = await response.json()
    
    console.log(`[SAM.gov API] Found ${data.totalRecords} total records, returning ${data.opportunitiesData.length}`)
    
    return data
  } catch (error) {
    console.error('[SAM.gov API] Error:', error)
    throw error
  }
}

/**
 * Transform SAM.gov opportunity to DiscoveryResult format
 */
export function transformSamGovResult(opportunity: SamGovOpportunity): DiscoveryResult {
  // Build URL to SAM.gov opportunity page
  const url = opportunity.uiLink || 
    (opportunity.noticeId ? `https://sam.gov/opp/${opportunity.noticeId}` : 'https://sam.gov')
  
  // Extract snippet from description
  const snippet = opportunity.description?.substring(0, 500) || ''
  
  // Extract agency from office address or organization type
  const agency = opportunity.organizationType || 
    opportunity.officeAddress?.city || 
    'Unknown Agency'
  
  // Extract NAICS codes
  const naicsCodes: string[] = []
  if (opportunity.naicsCode) {
    naicsCodes.push(opportunity.naicsCode)
  }
  if (opportunity.naicsCodes) {
    naicsCodes.push(...opportunity.naicsCodes)
  }
  
  // Extract set-aside information
  const setAside = mapSetAside(opportunity.typeOfSetAside)
  
  // Detect keywords from title and description
  const text = `${opportunity.title} ${opportunity.description || ''}`.toUpperCase()
  const detectedKeywords: string[] = []
  
  const keywordPatterns = [
    { pattern: /RMF|RISK MANAGEMENT FRAMEWORK/gi, keyword: 'RMF' },
    { pattern: /ATO|AUTHORIZATION TO OPERATE/gi, keyword: 'ATO' },
    { pattern: /ISSO|INFORMATION SYSTEM SECURITY OFFICER/gi, keyword: 'ISSO' },
    { pattern: /ISSM|INFORMATION SYSTEM SECURITY MANAGER/gi, keyword: 'ISSM' },
    { pattern: /STIG|SECURITY TECHNICAL IMPLEMENTATION GUIDE/gi, keyword: 'STIG' },
    { pattern: /NIST\s*800-53/gi, keyword: 'NIST 800-53' },
    { pattern: /CYBERSECURITY/gi, keyword: 'Cybersecurity' },
    { pattern: /AUDIT\s*READINESS/gi, keyword: 'Audit Readiness' },
    { pattern: /SDVOSB|SERVICE-DISABLED VETERAN/gi, keyword: 'SDVOSB' },
    { pattern: /VOSB|VETERAN-OWNED/gi, keyword: 'VOSB' },
  ]
  
  keywordPatterns.forEach(({ pattern, keyword }) => {
    if (pattern.test(text)) {
      detectedKeywords.push(keyword)
    }
  })
  
  // Detect service category
  let detectedServiceCategory: ServiceCategory = 'general'
  if (text.includes('RMF') || text.includes('ATO') || text.includes('CYBERSECURITY')) {
    detectedServiceCategory = 'cybersecurity'
  } else if (text.includes('DATA CENTER') || text.includes('INFRASTRUCTURE')) {
    detectedServiceCategory = 'infrastructure'
  } else if (text.includes('AUDIT') || text.includes('COMPLIANCE')) {
    detectedServiceCategory = 'compliance'
  }
  
  // Calculate relevance score
  let relevanceScore = 30 // Base score
  
  // Apply client-side relevance boost from NAICS/PSC matching (set during search)
  if (opportunity._relevanceBoost) {
    relevanceScore += opportunity._relevanceBoost
  }
  
  // VetCert set-aside boost
  if (setAside.length > 0) relevanceScore += 30
  if (opportunity.typeOfSetAside === 'SDVOSB' || opportunity.typeOfSetAside === 'VOSB') relevanceScore += 25
  
  // Keyword relevance boost
  if (detectedKeywords.length > 0) relevanceScore += detectedKeywords.length * 5
  if (detectedKeywords.length > 3) relevanceScore += 15
  
  // Service category match boost
  if (detectedServiceCategory !== 'general') relevanceScore += 20
  
  // Penalize and filter out irrelevant NAICS codes (hardware, manufacturing, etc.)
  // Expanded list of manufacturing/hardware NAICS codes that are NOT IT/cybersecurity services
  const irrelevantNaics = [
    '325920', '237990', '339112', '332912', '322230', '333996', '236220', '562910', 
    '325120', '311991', '334514', '336413', '332510', '541380', '332911', '336412', 
    '336611', '335931', '332999', '333998', '332994', '333618', '334417', '334220',
    '333611', '333612', '333613', '333519', '333914', '332722', '335314', '339991',
    '336390', '336360', '334290', '336320', '332119', '326122', '335999', '333611',
    '336413', '332510', '332999', '333996', '334417', '334220', '333998', '332994'
  ]
  
  const hasIrrelevantNaics = naicsCodes.some(code => irrelevantNaics.includes(code))
  if (hasIrrelevantNaics) {
    relevanceScore -= 100 // Very heavy penalty - should filter out these results
  }
  
  // For cybersecurity searches, require minimum relevance score
  const isCyberSearch = detectedServiceCategory === 'cybersecurity' || 
                       detectedKeywords.some(kw => ['RMF', 'ATO', 'STIG', 'NIST', 'ISSO', 'ISSM'].includes(kw))
  
  if (isCyberSearch && hasIrrelevantNaics) {
    relevanceScore -= 50 // Additional penalty for cybersecurity searches with irrelevant NAICS
  }
  
  // Note: NAICS/PSC code boosting is now only applied if codes were explicitly provided
  // in the search query (handled in searchSamGov function via _relevanceBoost)
  
  // Extract SOW attachment URL from API links if available
  let sowAttachmentUrl: string | undefined
  let sowAttachmentType: string | undefined
  
  if (opportunity.links && opportunity.links.length > 0) {
    // Look for SOW-related links
    const sowKeywords = ['sow', 'statement of work', 'pws', 'work statement', 'attachment', 'document']
    const sowLink = opportunity.links.find(link => {
      const href = (link.href || '').toLowerCase()
      const rel = (link.rel || '').toLowerCase()
      const type = (link.type || '').toLowerCase()
      const combined = `${href} ${rel} ${type}`
      return sowKeywords.some(keyword => combined.includes(keyword)) ||
             /\.(pdf|docx?)$/i.test(href)
    })
    
    if (sowLink?.href) {
      sowAttachmentUrl = sowLink.href
      // Determine type from extension
      if (sowLink.href.match(/\.pdf$/i)) {
        sowAttachmentType = 'PDF'
      } else if (sowLink.href.match(/\.docx?$/i)) {
        sowAttachmentType = 'DOCX'
      } else if (sowLink.href.match(/\.xlsx?$/i)) {
        sowAttachmentType = 'XLSX'
      } else {
        sowAttachmentType = 'HTML'
      }
    }
  }
  
  // Also check additionalInfoLink and attachments
  if (!sowAttachmentUrl && opportunity.additionalInfoLink) {
    if (/\.(pdf|docx?)$/i.test(opportunity.additionalInfoLink)) {
      sowAttachmentUrl = opportunity.additionalInfoLink
      sowAttachmentType = opportunity.additionalInfoLink.match(/\.pdf$/i) ? 'PDF' : 'DOCX'
    }
  }
  
  if (!sowAttachmentUrl && opportunity.attachments && opportunity.attachments.length > 0) {
    const sowAttachment = opportunity.attachments.find(att => {
      const name = (att.name || '').toLowerCase()
      return name.includes('sow') || name.includes('statement of work') || name.includes('pws')
    })
    if (sowAttachment?.url) {
      sowAttachmentUrl = sowAttachment.url
      sowAttachmentType = sowAttachment.type || 'PDF'
    }
  }

  // Extract points of contact
  const pointsOfContact = opportunity.pointOfContact?.map(poc => ({
    name: poc.fullName || '',
    email: poc.email || '',
    phone: poc.phone || '',
    role: poc.type || poc.title || '',
  })).filter(poc => poc.name || poc.email || poc.phone) || []

  // Extract place of performance
  const placeOfPerformance = opportunity.placeOfPerformance
    ? `${opportunity.placeOfPerformance.streetAddress || ''} ${opportunity.placeOfPerformance.city || ''} ${opportunity.placeOfPerformance.state || ''} ${opportunity.placeOfPerformance.zip || ''}`.trim()
    : undefined

  // Extract deadline
  const deadline = opportunity.responseDeadLine || undefined

  // Extract posted date
  const postedDate = opportunity.postedDate || undefined

  return {
    title: opportunity.title,
    url,
    domain: 'sam.gov',
    snippet,
    document_type: opportunity.type,
    notice_id: opportunity.noticeId,
    solicitation_number: opportunity.solicitationNumber,
    agency,
    naics_codes: [...new Set(naicsCodes)],
    set_aside: setAside,
    location_mentions: opportunity.placeOfPerformance ? [
      `${opportunity.placeOfPerformance.city || ''} ${opportunity.placeOfPerformance.state || ''}`.trim()
    ] : [],
    detected_keywords: [...new Set(detectedKeywords)],
    relevance_score: relevanceScore,
    detected_service_category: detectedServiceCategory,
    // Store API data for scraper to use
    sow_attachment_url: sowAttachmentUrl,
    sow_attachment_type: sowAttachmentType,
    api_data: {
      description: opportunity.description,
      links: opportunity.links,
      additionalInfoLink: opportunity.additionalInfoLink,
      title: opportunity.title,
      pointOfContact: opportunity.pointOfContact,
      placeOfPerformance: opportunity.placeOfPerformance,
      responseDeadLine: opportunity.responseDeadLine,
      postedDate: opportunity.postedDate,
      organizationType: opportunity.organizationType,
      officeAddress: opportunity.officeAddress,
    },
    // Additional contract details
    description: opportunity.description,
    points_of_contact: pointsOfContact,
    deadline: deadline,
    place_of_performance: placeOfPerformance,
    posted_date: postedDate,
  }
}

