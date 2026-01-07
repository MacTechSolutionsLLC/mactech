/**
 * Government Contract Discovery Utility Functions
 * 
 * This module provides utilities for building Google search queries,
 * processing search results, and calculating relevance scores for
 * government contract opportunities.
 * 
 * LEGAL NOTE: This is a discovery-only tool. We use Google search results
 * to identify publicly available government contract documents. All results
 * are marked as UNVERIFIED until manually validated. We do not scrape
 * SAM.gov directly or use any unauthorized access methods.
 */

export type ServiceCategory = 
  | 'cybersecurity' 
  | 'infrastructure' 
  | 'compliance' 
  | 'contracts'
  | 'general'

export type DocumentType = 'SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other'

export interface SearchFilters {
  filetype?: string
  site?: string[]
  date_range?: 'past_week' | 'past_month' | 'past_year'
  location?: string
  agency?: string[]
  naics_codes?: string[]
  document_types?: DocumentType[]
  set_aside?: string[]
}

export interface SearchRequest {
  query?: string
  service_category?: ServiceCategory
  location?: string
  agency?: string[]
  naics_codes?: string[]
  document_types?: DocumentType[]
  num_results?: number
  filters?: SearchFilters
  set_aside?: string[]
}

export interface DiscoveryResult {
  title: string
  url: string
  domain: string
  snippet?: string
  document_type?: string
  notice_id?: string
  solicitation_number?: string
  agency?: string
  naics_codes?: string[]
  set_aside?: string[]
  location_mentions?: string[]
  detected_keywords?: string[]
  relevance_score?: number
  detected_service_category?: ServiceCategory
}

/**
 * Service category keyword mappings
 */
const SERVICE_KEYWORDS: Record<ServiceCategory, string[]> = {
  cybersecurity: [
    'RMF', 'Risk Management Framework', 'ATO', 'Authorization to Operate',
    'STIG', 'Security Technical Implementation Guide', 'ConMon', 'Continuous Monitoring',
    'SCA', 'Security Control Assessment', 'POA&M', 'Plan of Action',
    'SSP', 'System Security Plan', 'NIST 800-53', 'CMMC', 'cybersecurity'
  ],
  infrastructure: [
    'data center', 'cloud migration', 'infrastructure as code', 'IaC',
    'network architecture', 'systems engineering', 'platform engineering',
    'Terraform', 'Ansible', 'AWS', 'Azure', 'infrastructure'
  ],
  compliance: [
    'ISO 9001', 'ISO 17025', 'ISO 27001', 'audit readiness',
    'quality management system', 'QMS', 'laboratory accreditation',
    'compliance consulting', 'process documentation'
  ],
  contracts: [
    'contract alignment', 'risk advisory', 'governance', 'contractual readiness',
    'vendor management', 'subcontractor agreement'
  ],
  general: []
}

/**
 * Build Google search query from search request
 */
export function buildSearchQuery(request: SearchRequest): string {
  let query = ''

  // Base filetype and site filters
  const filetype = request.filters?.filetype || 'pdf'
  const sites = request.filters?.site || ['sam.gov', '.gov', '.mil']
  
  query += `filetype:${filetype} `
  query += `(${sites.map(s => `site:${s}`).join(' OR ')}) `

  // Document type keywords
  const docTypes = request.document_types || ['SOW', 'PWS']
  const docTypeQuery = docTypes.map(dt => {
    switch (dt) {
      case 'SOW': return '"Statement of Work"'
      case 'PWS': return '"Performance Work Statement"'
      case 'RFQ': return '"Request for Quotation"'
      case 'RFP': return '"Request for Proposal"'
      case 'Sources Sought': return '"Sources Sought"'
      default: return `"${dt}"`
    }
  }).join(' OR ')
  query += `(${docTypeQuery}) `

  // Service category keywords
  if (request.service_category && request.service_category !== 'general') {
    const keywords = SERVICE_KEYWORDS[request.service_category]
    if (keywords.length > 0) {
      query += `(${keywords.slice(0, 5).join(' OR ')}) `
    }
  }

  // Custom query override
  if (request.query) {
    query = request.query
  }

  // Location filter
  if (request.location) {
    query += `"${request.location}" `
  }

  // Agency filter
  if (request.agency && request.agency.length > 0) {
    const agencyQueries = request.agency.map(a => {
      if (a.includes('.gov') || a.includes('.mil')) {
        return `site:${a}`
      }
      return `"${a}"`
    })
    query += `(${agencyQueries.join(' OR ')}) `
  }

  // NAICS codes
  if (request.naics_codes && request.naics_codes.length > 0) {
    query += `(${request.naics_codes.map(n => `"NAICS ${n}"`).join(' OR ')}) `
  }

  // Set-aside
  if (request.set_aside && request.set_aside.length > 0) {
    query += `(${request.set_aside.map(s => `"${s}"`).join(' OR ')}) `
  }

  return query.trim()
}

/**
 * Extract information from search result
 */
export function processSearchResult(result: any, request: SearchRequest): DiscoveryResult {
  const title = result.title || ''
  const url = result.link || ''
  const snippet = result.snippet || ''
  const domain = extractDomain(url)
  
  // Detect document type
  const document_type = detectDocumentType(url, title)
  
  // Extract SAM.gov information
  const samInfo = extractSamGovInfo(url, title, snippet)
  
  // Detect keywords
  const detected_keywords = detectKeywords(title, snippet, request.service_category)
  
  // Detect service category
  const detected_service_category = detectServiceCategory(title, snippet, detected_keywords)
  
  // Extract location mentions
  const location_mentions = extractLocations(title, snippet)
  
  // Calculate relevance score
  const relevance_score = calculateRelevanceScore({
    title,
    snippet,
    domain,
    document_type,
    detected_keywords,
    detected_service_category,
    location_mentions,
    request
  })

  return {
    title,
    url,
    domain,
    snippet,
    document_type,
    ...samInfo,
    detected_keywords,
    detected_service_category,
    location_mentions,
    relevance_score
  }
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    return url.split('/')[2]?.replace('www.', '') || url
  }
}

/**
 * Detect document type from URL and title
 */
function detectDocumentType(url: string, title: string): string {
  const lowerUrl = url.toLowerCase()
  const lowerTitle = title.toLowerCase()
  
  if (lowerUrl.endsWith('.pdf') || lowerTitle.includes('.pdf')) return 'pdf'
  if (lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx')) return 'doc'
  if (lowerUrl.endsWith('.html') || lowerUrl.endsWith('.htm')) return 'html'
  
  return 'unknown'
}

/**
 * Extract SAM.gov information using regex patterns
 */
function extractSamGovInfo(url: string, title: string, snippet: string): Partial<DiscoveryResult> {
  const info: Partial<DiscoveryResult> = {}
  const text = `${url} ${title} ${snippet}`.toUpperCase()
  
  // Notice ID patterns (e.g., FA1234-24-R-0001, W912BU-24-R-0001)
  const noticeIdPatterns = [
    /(FA\d{4}-\d{2}-[A-Z]-\d{4,6})/,
    /(W\d{2}[A-Z]{2}-\d{2}-[A-Z]-\d{4,6})/,
    /(N\d{6}-\d{2}-[A-Z]-\d{4,6})/,
    /(M\d{4}-\d{2}-[A-Z]-\d{4,6})/,
  ]
  
  for (const pattern of noticeIdPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.notice_id = match[1]
      break
    }
  }
  
  // Solicitation number patterns
  const solicitationPatterns = [
    /SOLICITATION[:\s]+([A-Z0-9-]+)/i,
    /SOL[:\s]+([A-Z0-9-]+)/i,
    /SOLICITATION\s+NUMBER[:\s]+([A-Z0-9-]+)/i,
  ]
  
  for (const pattern of solicitationPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.solicitation_number = match[1]
      break
    }
  }
  
  // Agency extraction
  const agencyPatterns = [
    /(DEPARTMENT OF DEFENSE|DOD)/i,
    /(AIR FORCE|USAF)/i,
    /(NAVY|USN)/i,
    /(ARMY|USA)/i,
    /(DEPARTMENT OF HOMELAND SECURITY|DHS)/i,
    /(GENERAL SERVICES ADMINISTRATION|GSA)/i,
    /(DEPARTMENT OF ENERGY|DOE)/i,
  ]
  
  for (const pattern of agencyPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.agency = match[1]
      break
    }
  }
  
  // NAICS code extraction
  const naicsMatch = text.match(/NAICS[:\s]+(\d{6})/i)
  if (naicsMatch) {
    info.naics_codes = [naicsMatch[1]]
  }
  
  // Set-aside extraction
  const setAsidePatterns = [
    /(SDVOSB|SERVICE-DISABLED VETERAN-OWNED)/i,
    /(8\(A\)|8A)/i,
    /(WOSB|WOMAN-OWNED)/i,
    /(HUBZONE)/i,
    /(EDWOSB)/i,
  ]
  
  const setAsides: string[] = []
  for (const pattern of setAsidePatterns) {
    const match = text.match(pattern)
    if (match) {
      setAsides.push(match[1])
    }
  }
  if (setAsides.length > 0) {
    info.set_aside = setAsides
  }
  
  return info
}

/**
 * Detect keywords in title and snippet
 */
function detectKeywords(title: string, snippet: string, category?: ServiceCategory): string[] {
  const text = `${title} ${snippet}`.toUpperCase()
  const keywords: string[] = []
  
  // Check all service categories
  Object.values(SERVICE_KEYWORDS).flat().forEach(keyword => {
    if (text.includes(keyword.toUpperCase())) {
      keywords.push(keyword)
    }
  })
  
  // Common contract keywords
  const commonKeywords = ['SOW', 'PWS', 'RFQ', 'RFP', 'RFP', 'SOURCES SOUGHT', 'SAM.GOV']
  commonKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  })
  
  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Detect service category from content
 */
function detectServiceCategory(
  title: string, 
  snippet: string, 
  keywords: string[]
): ServiceCategory {
  const text = `${title} ${snippet}`.toUpperCase()
  
  // Count matches per category
  const scores: Record<ServiceCategory, number> = {
    cybersecurity: 0,
    infrastructure: 0,
    compliance: 0,
    contracts: 0,
    general: 0
  }
  
  Object.entries(SERVICE_KEYWORDS).forEach(([category, categoryKeywords]) => {
    categoryKeywords.forEach(keyword => {
      if (text.includes(keyword.toUpperCase()) || keywords.includes(keyword)) {
        scores[category as ServiceCategory]++
      }
    })
  })
  
  // Find category with highest score
  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'general'
  
  const topCategory = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0]
  return (topCategory as ServiceCategory) || 'general'
}

/**
 * Extract location mentions
 */
function extractLocations(title: string, snippet: string): string[] {
  const text = `${title} ${snippet}`
  const locations: string[] = []
  
  // Common location patterns
  const locationPatterns = [
    /\b(Boston|Massachusetts|MA)\b/gi,
    /\b(Washington|DC|District of Columbia)\b/gi,
    /\b(New York|NY)\b/gi,
    /\b(California|CA|Los Angeles|San Francisco)\b/gi,
    /\b(Texas|TX|Dallas|Houston|Austin)\b/gi,
    /\b(Virginia|VA|Arlington|Alexandria)\b/gi,
    /\b(Maryland|MD|Baltimore|Bethesda)\b/gi,
    /\b(Colorado|CO|Denver|Colorado Springs)\b/gi,
    /\b(Florida|FL|Tampa|Orlando)\b/gi,
    /\b(Ohio|OH|Columbus|Dayton)\b/gi,
  ]
  
  locationPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) {
      locations.push(...matches.map(m => m.trim()))
    }
  })
  
  return [...new Set(locations)]
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(params: {
  title: string
  snippet: string
  domain: string
  document_type?: string
  detected_keywords: string[]
  detected_service_category?: ServiceCategory
  location_mentions: string[]
  request: SearchRequest
}): number {
  let score = 0
  const { title, snippet, domain, document_type, detected_keywords, detected_service_category, location_mentions, request } = params
  
  const text = `${title} ${snippet}`.toUpperCase()
  
  // Title contains keywords
  if (detected_keywords.some(kw => title.toUpperCase().includes(kw.toUpperCase()))) {
    score += 10
  }
  
  // Snippet contains keywords
  if (detected_keywords.some(kw => snippet.toUpperCase().includes(kw.toUpperCase()))) {
    score += 5
  }
  
  // Domain is sam.gov
  if (domain.includes('sam.gov')) {
    score += 5
  }
  
  // Document type is PDF
  if (document_type === 'pdf') {
    score += 3
  }
  
  // Location matches filter
  if (request.location && location_mentions.some(loc => 
    loc.toUpperCase().includes(request.location!.toUpperCase()) ||
    request.location!.toUpperCase().includes(loc.toUpperCase())
  )) {
    score += 5
  }
  
  // Agency matches filter
  if (request.agency && request.agency.some(agency => 
    text.includes(agency.toUpperCase())
  )) {
    score += 5
  }
  
  // NAICS matches
  if (request.naics_codes && request.naics_codes.length > 0) {
    // Check if any NAICS codes are mentioned
    const naicsMentioned = request.naics_codes.some(naics => text.includes(naics))
    if (naicsMentioned) {
      score += 5
    }
  }
  
  // Set-aside matches
  if (request.set_aside && request.set_aside.length > 0) {
    const setAsideMentioned = request.set_aside.some(sa => 
      text.includes(sa.toUpperCase())
    )
    if (setAsideMentioned) {
      score += 3
    }
  }
  
  // Service category match
  if (request.service_category && detected_service_category === request.service_category) {
    score += 5
  }
  
  return score
}

/**
 * Get preset queries for service categories
 */
export function getPresetQuery(category: ServiceCategory, location?: string, agency?: string[]): string {
  const baseQuery = buildSearchQuery({
    service_category: category,
    location,
    agency,
    document_types: ['SOW', 'PWS'],
    filters: {
      filetype: 'pdf',
      site: ['sam.gov', '.gov', '.mil']
    }
  })
  
  return baseQuery
}

