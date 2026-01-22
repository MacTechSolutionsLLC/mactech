/**
 * SAM.gov Opportunities API v2 - Clean Implementation
 * 
 * Uses the official SAM.gov Opportunities API v2
 * Documentation: https://open.gsa.gov/api/opportunities-api/
 * Endpoint: https://api.sam.gov/opportunities/v2/search
 * 
 * This is a clean, correct implementation based on official API documentation.
 */

import { DiscoveryResult } from './contract-discovery'

/**
 * Set-aside codes (exact codes from SAM.gov API)
 */
export const SET_ASIDE_CODES = {
  SDVOSB: 'SDVOSB',
  VOSB: 'VOSB',
  SB: 'SB', // Small Business
  '8A': '8A',
  HZC: 'HZC', // HUBZone
  NONE: 'NONE', // Full & Open
} as const

/**
 * Solicitation types (ptype parameter)
 */
export const SOLICITATION_TYPES = {
  RFI: 'RFI', // Request for Information
  PRESOL: 'PRESOL', // Presolicitation
  COMBINE: 'COMBINE', // Combined Synopsis/Solicitation
  SRCSGT: 'SRCSGT', // Sources Sought
  SNOTE: 'SNOTE', // Special Notice
  SSALE: 'SSALE', // Sale of Surplus Property
  AWARD: 'AWARD', // Award Notice
  JA: 'JA', // Justification and Approval
  ITB: 'ITB', // Invitation to Bid
} as const

/**
 * Search parameters for SAM.gov API
 */
export interface SamGovSearchParams {
  keywords?: string // Comma or space separated keywords
  naics?: string | string[] // NAICS code(s) - can be single code, comma-separated string, or array
  setAside?: string | string[] // Set-aside code(s) - SDVOSB, VOSB, etc.
  ptype?: string // Solicitation type - RFI, PRESOL, etc.
  postedFrom?: string // MM/DD/YYYY format
  postedTo?: string // MM/DD/YYYY format
  agency?: string // Agency code (e.g., 9700 for DoD)
  limit?: number // Results per page (default: 25, max: 100)
  offset?: number // Pagination offset (default: 0)
}

/**
 * SAM.gov API opportunity response structure
 */
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
  agency?: string
  office?: string
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
  attachments?: Array<{
    url?: string
    name?: string
    type?: string
  }>
}

/**
 * SAM.gov API response structure
 */
export interface SamGovApiResponse {
  totalRecords: number
  limit: number
  offset: number
  opportunitiesData: SamGovOpportunity[]
}

/**
 * Parse MM/DD/YYYY date string to Date object
 */
function parseDate(dateStr: string): Date {
  const [month, day, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Validate and adjust date range to ensure it's within SAM.gov API limits
 * API requires date ranges to be less than 1 year (364 days max)
 */
function validateDateRange(from: string, to: string): { from: string; to: string } {
  const fromDate = parseDate(from)
  const toDate = parseDate(to)
  const diffMs = toDate.getTime() - fromDate.getTime()
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
  
  // If range is 365 days or more, adjust to 364 days
  if (diffDays >= 365) {
    const adjustedFromDate = new Date(toDate.getTime() - 364 * 24 * 60 * 60 * 1000)
    const adjustedFrom = adjustedFromDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    console.warn(`[SAM.gov API v2] Date range adjusted from ${diffDays} days to 364 days to comply with API limits`)
    return { from: adjustedFrom, to }
  }
  
  return { from, to }
}

/**
 * Get date range helper
 * Note: SAM.gov API has a limit on date ranges - must be less than 1 year
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
      // SAM.gov API rejects exactly 1 year ranges, so use 364 days (just under 1 year)
      from = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000)
      break
    default:
      from = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) // Default to past month
  }
  
  const fromStr = from.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  return { from: fromStr, to }
}

/**
 * Search SAM.gov for contract opportunities
 * 
 * This is the clean, correct implementation using the official API endpoint and parameters.
 */
export async function searchSamGovV2(params: {
  keywords?: string
  naicsCodes?: string[]
  setAside?: string[]
  ptype?: string
  agency?: string
  dateRange?: 'past_week' | 'past_month' | 'past_year'
  postedFrom?: string
  postedTo?: string
  limit?: number
  offset?: number
}): Promise<SamGovApiResponse> {
  let { from, to } = params.postedFrom && params.postedTo
    ? { from: params.postedFrom, to: params.postedTo }
    : getDateRange(params.dateRange)
  
  // Validate and adjust date range if needed (API limit: less than 1 year)
  const validated = validateDateRange(from, to)
  from = validated.from
  to = validated.to
  
  // Build API URL - CORRECT endpoint (no /prod/)
  const apiUrl = new URL('https://api.sam.gov/opportunities/v2/search')
  
  // Add keywords parameter (correct name: "keywords" not "keyword")
  if (params.keywords && params.keywords.trim().length > 0) {
    // Clean and normalize keywords
    const cleanedKeywords = params.keywords
      .replace(/[&|{}^\\]/g, ' ') // Remove disallowed characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    if (cleanedKeywords) {
      apiUrl.searchParams.append('keywords', cleanedKeywords)
    }
  }
  
  // Add NAICS codes (correct parameter name: "naics" not "naicsCode")
  if (params.naicsCodes && params.naicsCodes.length > 0) {
    // API accepts comma-separated NAICS codes
    apiUrl.searchParams.append('naics', params.naicsCodes.join(','))
  }
  
  // Add set-aside codes (API supports multiple in one call)
  // Correct parameter name: typeOfSetAside (not setAside)
  if (params.setAside && params.setAside.length > 0) {
    // API accepts comma-separated set-aside codes
    apiUrl.searchParams.append('typeOfSetAside', params.setAside.join(','))
  }
  
  // Add solicitation type (ptype)
  if (params.ptype) {
    apiUrl.searchParams.append('ptype', params.ptype)
  }
  
  // Add agency code
  if (params.agency) {
    apiUrl.searchParams.append('agency', params.agency)
  }
  
  // Add date range
  apiUrl.searchParams.append('postedFrom', from)
  apiUrl.searchParams.append('postedTo', to)
  
  // Add pagination
  apiUrl.searchParams.append('limit', String(params.limit || 1000))
  apiUrl.searchParams.append('offset', String(params.offset || 0))
  
  // Get API key from environment
  const apiKey = process.env.SAM_GOV_API_KEY || process.env.SAM_API_KEY
  
  if (!apiKey) {
    throw new Error(
      'SAM.gov API key required. ' +
      'Please register at https://api.sam.gov/ and set SAM_GOV_API_KEY environment variable.'
    )
  }
  
  console.log(`[SAM.gov API v2] Searching: ${apiUrl.toString()}`)
  
  try {
    // CORRECT authentication: X-API-KEY header only
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'User-Agent': 'MacTech Contract Discovery/1.0',
      'X-API-KEY': apiKey, // Correct header name
    }
    
    const response = await fetch(apiUrl.toString(), {
      headers,
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      
      // Handle authentication errors
      if (response.status === 401) {
        throw new Error(
          `SAM.gov API authentication failed. ` +
          `Please verify your API key is correct. ` +
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
    
    console.log(`[SAM.gov API v2] Found ${data.totalRecords} total records, returning ${data.opportunitiesData.length}`)
    
    return data
  } catch (error) {
    console.error('[SAM.gov API v2] Error:', error)
    throw error
  }
}

/**
 * Transform SAM.gov opportunity to DiscoveryResult format
 * Includes keyword filtering and relevance scoring
 */
export function transformSamGovResultV2(
  opportunity: SamGovOpportunity,
  searchKeywords?: string[]
): DiscoveryResult {
  // Build URL to SAM.gov opportunity page
  const url = opportunity.uiLink || 
    (opportunity.noticeId ? `https://sam.gov/opp/${opportunity.noticeId}` : 'https://sam.gov')
  
  // Extract snippet from description
  const snippet = opportunity.description?.substring(0, 500) || ''
  
  // Extract agency
  const agency = opportunity.agency || 
    opportunity.organizationType || 
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
  const setAside: string[] = []
  if (opportunity.typeOfSetAside) {
    setAside.push(opportunity.typeOfSetAside)
  }
  
  // Detect keywords from title and description
  const text = `${opportunity.title} ${opportunity.description || ''}`.toUpperCase()
  const titleText = (opportunity.title || '').toUpperCase()
  const descriptionText = (opportunity.description || '').toUpperCase()
  const detectedKeywords: string[] = []
  
  // Check if search keywords are present (for filtering and scoring)
  let hasSearchKeywords = false
  let keywordMatchesInTitle = 0
  let keywordMatchesInDescription = 0
  
  if (searchKeywords && searchKeywords.length > 0) {
    searchKeywords.forEach(keyword => {
      const keywordUpper = keyword.trim().toUpperCase()
      if (keywordUpper.length === 0) return
      
      // Check if keyword appears in title
      const titleMatch = titleText.includes(keywordUpper)
      if (titleMatch) {
        keywordMatchesInTitle++
        hasSearchKeywords = true
      }
      
      // Check if keyword appears in description
      const descMatch = descriptionText.includes(keywordUpper)
      if (descMatch) {
        keywordMatchesInDescription++
        hasSearchKeywords = true
      }
    })
  }
  
  // Detect common keywords
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
  let detectedServiceCategory: 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general' = 'general'
  if (text.includes('RMF') || text.includes('ATO') || text.includes('CYBERSECURITY')) {
    detectedServiceCategory = 'cybersecurity'
  } else if (text.includes('DATA CENTER') || text.includes('INFRASTRUCTURE')) {
    detectedServiceCategory = 'infrastructure'
  } else if (text.includes('AUDIT') || text.includes('COMPLIANCE')) {
    detectedServiceCategory = 'compliance'
  }
  
  // Calculate relevance score
  let relevanceScore = 30 // Base score
  
  // Major boost for search keywords in title
  if (keywordMatchesInTitle > 0) {
    relevanceScore += 50 + (keywordMatchesInTitle * 20)
  }
  
  // Moderate boost for search keywords in description
  if (keywordMatchesInDescription > 0) {
    relevanceScore += 20 + (keywordMatchesInDescription * 10)
  }
  
  // Penalize results that don't contain any search keywords
  if (searchKeywords && searchKeywords.length > 0 && !hasSearchKeywords) {
    relevanceScore -= 40
  }
  
  // VetCert set-aside boost
  if (setAside.length > 0) relevanceScore += 30
  if (opportunity.typeOfSetAside === 'SDVOSB' || opportunity.typeOfSetAside === 'VOSB') relevanceScore += 25
  
  // Keyword relevance boost
  if (detectedKeywords.length > 0) relevanceScore += detectedKeywords.length * 5
  if (detectedKeywords.length > 3) relevanceScore += 15
  
  // Service category match boost
  if (detectedServiceCategory !== 'general') relevanceScore += 20
  
  // Extract SOW attachment URL
  let sowAttachmentUrl: string | undefined
  let sowAttachmentType: string | undefined
  
  if (opportunity.links && opportunity.links.length > 0) {
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
    description: opportunity.description,
    points_of_contact: pointsOfContact,
    deadline: deadline,
    place_of_performance: placeOfPerformance,
    posted_date: postedDate,
  }
}

