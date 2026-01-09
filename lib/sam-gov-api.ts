/**
 * SAM.gov Official API Integration
 * 
 * Uses the official SAM.gov Opportunities API v2
 * Documentation: https://open.gsa.gov/api/opportunities-api/
 * Endpoint: https://api.sam.gov/prod/opportunities/v2/search
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
  organizationType?: string
}

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
 * Build keyword query from search request
 */
function buildKeywordQuery(
  keywords?: string,
  serviceCategory?: ServiceCategory,
  customKeywords?: string
): string {
  const keywordParts: string[] = []
  
  // Clean Google syntax from keywords if present
  let cleanedKeywords = keywords ? cleanGoogleSyntax(keywords) : undefined
  
  // Add service category keywords
  if (serviceCategory) {
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
  
  // Add explicit keywords (cleaned)
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
 */
export async function searchSamGov(params: {
  keywords?: string
  serviceCategory?: ServiceCategory
  dateRange?: 'past_week' | 'past_month' | 'past_year'
  setAside?: string[]
  naicsCodes?: string[]
  limit?: number
  offset?: number
}): Promise<SamGovApiResponse> {
  const { from, to } = getDateRange(params.dateRange)
  
  // Build keyword query
  const keyword = buildKeywordQuery(
    params.keywords,
    params.serviceCategory
  )
  
  // Build API URL
  const apiUrl = new URL('https://api.sam.gov/prod/opportunities/v2/search')
  
  // Add query parameters
  if (keyword) {
    apiUrl.searchParams.append('keyword', keyword)
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
  
  // Add NAICS code filter
  if (params.naicsCodes && params.naicsCodes.length > 0) {
    apiUrl.searchParams.append('naicsCode', params.naicsCodes[0])
  }
  
  // Get API key from environment (optional but recommended)
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  // Add API key to query params if available
  if (apiKey) {
    apiUrl.searchParams.append('api_key', apiKey)
  }
  
  console.log(`[SAM.gov API] Searching: ${apiUrl.toString().replace(/api_key=[^&]+/, 'api_key=***')}`)
  
  try {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'MacTech Contract Discovery/1.0',
    }
    
    // Some SAM.gov endpoints also accept API key in headers
    if (apiKey) {
      headers['X-Api-Key'] = apiKey
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
  
  // VetCert set-aside boost
  if (setAside.length > 0) relevanceScore += 30
  if (opportunity.typeOfSetAside === 'SDVOSB' || opportunity.typeOfSetAside === 'VOSB') relevanceScore += 25
  
  // Keyword relevance boost
  if (detectedKeywords.length > 0) relevanceScore += detectedKeywords.length * 5
  if (detectedKeywords.length > 3) relevanceScore += 15
  
  // Service category match boost
  if (detectedServiceCategory !== 'general') relevanceScore += 20
  
  // Penalize irrelevant NAICS codes (hardware, manufacturing, etc.)
  const irrelevantNaics = ['325920', '237990', '339112', '332912', '322230', '333996', '236220', '562910', '325120', '311991', '334514', '336413', '332510', '541380', '332911', '336412', '336611', '335931', '332999', '333998', '332994', '333618', '334417', '334220']
  if (naicsCodes.some(code => irrelevantNaics.includes(code))) {
    relevanceScore -= 40 // Heavy penalty for irrelevant NAICS
  }
  
  // Boost for cybersecurity NAICS codes
  const cyberNaics = ['541512', '541519', '541511']
  if (naicsCodes.some(code => cyberNaics.includes(code))) {
    relevanceScore += 30
  }
  
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
  }
}

