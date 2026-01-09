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
  keywords?: string
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
 * VetCert-eligible set-aside phrases (exact phrases to target)
 * These are the contract terms that indicate VetCert-eligible opportunities
 */
export const VETCERT_SET_ASIDE_PHRASES = [
  // Government-wide (FAR 19.14)
  'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside',
  'Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source',
  'SDVOSB Set-Aside',
  'SDVOSB Sole Source',
  
  // VA "Veterans First" (VA-specific labels)
  'Veteran-Owned Small Business Set Aside, Department of Veterans Affairs',
  'Veteran-Owned Small Business Sole Source, Department of Veterans Affairs',
  'VOSB Set Aside, Department of Veterans Affairs',
  'VOSB Sole Source, Department of Veterans Affairs',
  
  // Certification language
  'SBA certified SDVOSB',
  'SBA certified VOSB',
  'listed in SBA certification database',
  'Veteran Small Business Certification Program',
  'VetCert',
  '13 CFR Part 128',
  'veterans.certify.sba.gov',
]

/**
 * VetCert abbreviations and variants
 */
export const VETCERT_VARIANTS = [
  'SDVOSB',
  'VOSB',
  'service disabled veteran owned',
  'veteran owned',
  'set aside',
  'set-aside',
  'sole source',
  'sole-source',
]

/**
 * Cyber/RMF NAICS codes for VetCert opportunities
 */
export const CYBER_RMF_NAICS_CODES = [
  '541512', // Computer Systems Design Services
  '541519', // Other Computer Related Services
  '541511', // Custom Computer Programming Services
]

/**
 * PSC codes that frequently capture RMF/cyber consulting
 */
export const RMF_CYBER_PSC_CODES = [
  'D310', // IT & Telecom: Cyber Security and Data Backup
  'D307', // IT & Telecom: IT Strategy and Architecture
  'D399', // IT & Telecom: Other IT and Telecommunications
]

/**
 * RMF role and artifact keywords (for 1-FTE style work)
 */
export const RMF_ROLE_KEYWORDS = [
  'ISSO', // Information System Security Officer
  'ISSM', // Information System Security Manager
  'ISSE', // Information System Security Engineer
  'SCA',  // Security Control Assessor
]

export const RMF_ARTIFACT_KEYWORDS = [
  'eMASS', // Enterprise Mission Assurance Support Service
  'ATO',   // Authorization to Operate
  'SSP',   // System Security Plan
  'SAP',   // Security Assessment Plan
  'SAR',   // Security Assessment Report
  'POA&M', // Plan of Action and Milestones
  'NIST 800-53',
  'continuous monitoring',
  'control assessment',
]

/**
 * GSA MAS HACS SIN for RMF services
 */
export const GSA_HACS_SIN = '54151HACS' // Highly Adaptive Cybersecurity Services (HACS)

/**
 * Service category keyword mappings
 */
const SERVICE_KEYWORDS: Record<ServiceCategory, string[]> = {
  cybersecurity: [
    'RMF', 'Risk Management Framework', 'ATO', 'Authorization to Operate',
    'STIG', 'Security Technical Implementation Guide', 'ConMon', 'Continuous Monitoring',
    'SCA', 'Security Control Assessment', 'POA&M', 'Plan of Action',
    'SSP', 'System Security Plan', 'NIST 800-53', 'CMMC', 'cybersecurity',
    // RMF roles
    ...RMF_ROLE_KEYWORDS,
    // RMF artifacts
    ...RMF_ARTIFACT_KEYWORDS,
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
 * Focused on SAM.gov opportunity listings (HTML pages, not PDFs)
 */
export function buildSearchQuery(request: SearchRequest): string {
  let query = ''

  // Focus on SAM.gov only - opportunity listings (HTML pages)
  // Exclude PDFs to get the actual opportunity page, not attached documents
  const sites = request.filters?.site || ['sam.gov']
  query += `site:${sites[0]} `
  
  // Exclude PDFs and common file types to focus on opportunity listing pages
  query += `-filetype:pdf -filetype:doc -filetype:docx -filetype:xls -filetype:xlsx `

  // Target SAM.gov opportunity pages - look for contract opportunity keywords
  const opportunityKeywords = [
    'contract opportunity',
    'solicitation',
    'notice',
    'opportunity',
    'procurement'
  ]
  query += `(${opportunityKeywords.join(' OR ')}) `

  // Service category keywords
  if (request.service_category && request.service_category !== 'general') {
    const keywords = SERVICE_KEYWORDS[request.service_category]
    if (keywords.length > 0) {
      query += `(${keywords.slice(0, 5).join(' OR ')}) `
    }
  }

  // Custom keywords
  if (request.keywords) {
    // Split by comma or space and add as quoted terms
    const keywordList = request.keywords.split(/[,\s]+/).filter(k => k.trim().length > 0)
    if (keywordList.length > 0) {
      query += `(${keywordList.map(k => `"${k.trim()}"`).join(' OR ')}) `
    }
  }

  // Custom query override
  if (request.query) {
    query = request.query
    // Ensure SAM.gov focus if not already specified
    if (!query.includes('site:sam.gov') && !query.includes('site:')) {
      query = `site:sam.gov ${query}`
    }
    // Date filtering handled via SerpAPI tbs parameter, not in query
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
  
  // PSC codes (if we add PSC code support to SearchRequest in the future)
  // For now, PSC codes can be added via custom keywords

  return query.trim()
}

/**
 * Check if a result is likely a SAM.gov contract opportunity listing
 * Focuses on opportunity pages, not PDF attachments
 */
function isLikelySOW(result: any): boolean {
  const title = (result.title || '').toLowerCase()
  const snippet = (result.snippet || '').toLowerCase()
  const url = (result.link || result.url || '').toLowerCase()
  const text = `${title} ${snippet} ${url}`

  // Must be from SAM.gov
  if (!url.includes('sam.gov')) {
    return false
  }

  // Exclude PDFs and document downloads - we want the opportunity page
  if (url.includes('.pdf') || url.includes('.doc') || url.includes('.docx') || 
      url.includes('.xls') || url.includes('.xlsx') || url.includes('download')) {
    return false
  }

  // Strong indicators of contract opportunity listings
  const strongIndicators = [
    'contract opportunity',
    'solicitation',
    'notice id',
    'opportunity',
    'procurement',
    'acquisition',
    'request for proposal',
    'rfp',
    'request for quotation',
    'rfq',
    'sources sought',
    'presolicitation',
    'combined synopsis',
  ]

  // URL patterns that indicate opportunity pages
  const opportunityUrlPatterns = [
    '/opportunities/',
    '/view/',
    '/opportunity/',
    '/solicitation/',
    '/notice/',
    'noticeid=',
    'opportunityid=',
  ]

  // Check if URL matches opportunity page patterns
  const hasOpportunityUrl = opportunityUrlPatterns.some(pattern => url.includes(pattern))

  // Count strong indicators
  const strongCount = strongIndicators.filter(indicator => text.includes(indicator)).length

  // If URL pattern matches and has at least one indicator, it's likely
  if (hasOpportunityUrl && strongCount >= 1) {
    return true
  }

  // If multiple strong indicators, very likely
  if (strongCount >= 2) {
    return true
  }

  // Exclude common non-opportunity pages
  const excludeTerms = [
    'entity registration',
    'entity checklist',
    'sam.gov registration',
    'uei number',
    'cage code',
    'vendor guide',
    'user guide',
    'help document',
    'faq',
    'training',
    'tutorial',
    'handbook',
    'manual',
    'policy',
    'regulation',
    'directive',
    'instruction',
    'memorandum',
    'memo',
    'newsletter',
    'announcement',
    'press release',
    'home page',
    'login',
    'register',
  ]

  // Check exclusions
  for (const exclude of excludeTerms) {
    if (text.includes(exclude)) {
      return false
    }
  }

  // If we have opportunity URL pattern, it's likely
  if (hasOpportunityUrl) {
    return true
  }

  return false
}

/**
 * Extract information from search result
 */
export function processSearchResult(result: any, request: SearchRequest): DiscoveryResult | null {
  // Filter out results that are clearly not SOW documents
  if (!isLikelySOW(result)) {
    return null
  }
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
    url,
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
  
  // Set-aside extraction - Enhanced for VetCert
  const setAsidePatterns = [
    // VetCert-specific patterns (exact phrases)
    /(SERVICE-DISABLED VETERAN-OWNED SMALL BUSINESS \(SDVOSB\) SET-ASIDE)/i,
    /(SERVICE-DISABLED VETERAN-OWNED SMALL BUSINESS \(SDVOSB\) SOLE SOURCE)/i,
    /(VETERAN-OWNED SMALL BUSINESS SET ASIDE, DEPARTMENT OF VETERANS AFFAIRS)/i,
    /(VETERAN-OWNED SMALL BUSINESS SOLE SOURCE, DEPARTMENT OF VETERANS AFFAIRS)/i,
    /(SBA CERTIFIED SDVOSB)/i,
    /(SBA CERTIFIED VOSB)/i,
    /(LISTED IN SBA CERTIFICATION DATABASE)/i,
    /(VETERAN SMALL BUSINESS CERTIFICATION PROGRAM)/i,
    /(VETCERT)/i,
    /(13 CFR PART 128)/i,
    /(VETERANS\.CERTIFY\.SBA\.GOV)/i,
    
    // Standard patterns
    /(SDVOSB|SERVICE-DISABLED VETERAN-OWNED)/i,
    /(VOSB|VETERAN-OWNED SMALL BUSINESS)/i,
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
  
  // Also check for VetCert variants in text
  VETCERT_VARIANTS.forEach(variant => {
    if (text.includes(variant.toUpperCase())) {
      const normalized = variant.toUpperCase()
      if (!setAsides.some(sa => sa.toUpperCase().includes(normalized))) {
        setAsides.push(variant)
      }
    }
  })
  
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
  
  // Check for VetCert set-aside phrases
  VETCERT_SET_ASIDE_PHRASES.forEach(phrase => {
    if (text.includes(phrase.toUpperCase())) {
      keywords.push(phrase)
    }
  })
  
  // Check for VetCert variants
  VETCERT_VARIANTS.forEach(variant => {
    if (text.includes(variant.toUpperCase())) {
      keywords.push(variant)
    }
  })
  
  // Check for RMF roles
  RMF_ROLE_KEYWORDS.forEach(role => {
    if (text.includes(role.toUpperCase())) {
      keywords.push(role)
    }
  })
  
  // Check for RMF artifacts
  RMF_ARTIFACT_KEYWORDS.forEach(artifact => {
    if (text.includes(artifact.toUpperCase())) {
      keywords.push(artifact)
    }
  })
  
  // Check for cyber/RMF NAICS codes
  CYBER_RMF_NAICS_CODES.forEach(naics => {
    if (text.includes(`NAICS ${naics}`) || text.includes(naics)) {
      keywords.push(`NAICS ${naics}`)
    }
  })
  
  // Check for PSC codes
  RMF_CYBER_PSC_CODES.forEach(psc => {
    if (text.includes(`PSC ${psc}`) || text.includes(psc)) {
      keywords.push(`PSC ${psc}`)
    }
  })
  
  // Check for GSA HACS
  if (text.includes(GSA_HACS_SIN) || text.includes('HACS') || text.includes('HIGHLY ADAPTIVE CYBERSECURITY')) {
    keywords.push('GSA HACS', GSA_HACS_SIN)
  }
  
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
  url: string
  domain: string
  document_type?: string
  detected_keywords: string[]
  detected_service_category?: ServiceCategory
  location_mentions: string[]
  request: SearchRequest
}): number {
  let score = 0
  const { title, snippet, url, domain, document_type, detected_keywords, detected_service_category, location_mentions, request } = params
  
  const text = `${title} ${snippet}`.toUpperCase()
  
  // Title contains keywords
  if (detected_keywords.some(kw => title.toUpperCase().includes(kw.toUpperCase()))) {
    score += 10
  }
  
  // Snippet contains keywords
  if (detected_keywords.some(kw => snippet.toUpperCase().includes(kw.toUpperCase()))) {
    score += 5
  }
  
  // Domain is sam.gov (high priority for opportunity listings)
  if (domain.includes('sam.gov')) {
    score += 15 // Significant boost for SAM.gov opportunity pages
  }
  
  // URL indicates opportunity listing page (not PDF)
  if (url.includes('/opportunities/') || url.includes('/view/') || url.includes('noticeid=')) {
    score += 10
  }
  
  // Exclude PDFs - we want opportunity pages
  if (url.includes('.pdf') || url.includes('download')) {
    score -= 20 // Heavy penalty for PDFs
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
  
  // VetCert-eligible boost (high priority)
  const isVetCertEligible = VETCERT_SET_ASIDE_PHRASES.some(phrase => 
    text.includes(phrase.toUpperCase())
  ) || VETCERT_VARIANTS.some(variant => 
    text.includes(variant.toUpperCase()) && 
    (text.includes('SET-ASIDE') || text.includes('SOLE SOURCE') || text.includes('SET ASIDE'))
  )
  
  if (isVetCertEligible) {
    score += 15 // Significant boost for VetCert-eligible opportunities
  }
  
  // RMF role/artifact boost (indicates 1-FTE style work)
  const hasRmfRole = RMF_ROLE_KEYWORDS.some(role => text.includes(role))
  const hasRmfArtifact = RMF_ARTIFACT_KEYWORDS.some(artifact => text.includes(artifact.toUpperCase()))
  
  if (hasRmfRole) {
    score += 8 // RMF roles indicate specific expertise needed
  }
  if (hasRmfArtifact) {
    score += 5 // RMF artifacts indicate RMF-specific work
  }
  
  // Cyber/RMF NAICS code boost
  if (CYBER_RMF_NAICS_CODES.some(naics => text.includes(naics))) {
    score += 5
  }
  
  // PSC code boost
  if (RMF_CYBER_PSC_CODES.some(psc => text.includes(psc))) {
    score += 3
  }
  
  // GSA HACS boost
  if (text.includes(GSA_HACS_SIN) || text.includes('HACS') || text.includes('HIGHLY ADAPTIVE CYBERSECURITY')) {
    score += 5
  }
  
  // Service category match
  if (request.service_category && detected_service_category === request.service_category) {
    score += 5
  }
  
  return score
}

/**
 * Get preset queries for service categories
 * Focused on SAM.gov opportunity listings
 */
export function getPresetQuery(category: ServiceCategory, location?: string, agency?: string[]): string {
  const baseQuery = buildSearchQuery({
    service_category: category,
    location,
    agency,
    filters: {
      site: ['sam.gov']
    }
  })
  
  return baseQuery
}

/**
 * Build optimized VetCert-eligible query for cyber/RMF opportunities
 * Combines VetCert set-aside terms with cyber/RMF keywords and NAICS codes
 * Focused on SAM.gov opportunity listings (HTML pages, not PDFs)
 */
export function buildVetCertCyberQuery(options: {
  setAsideType?: 'SDVOSB' | 'VOSB' | 'both'
  includeSoleSource?: boolean
  includeRmfRoles?: boolean
  includeRmfArtifacts?: boolean
  naicsCodes?: string[]
  location?: string
  agency?: string[]
}): string {
  const {
    setAsideType = 'both',
    includeSoleSource = true,
    includeRmfRoles = true,
    includeRmfArtifacts = true,
    naicsCodes = CYBER_RMF_NAICS_CODES,
    location,
    agency
  } = options

  let query = 'site:sam.gov -filetype:pdf -filetype:doc -filetype:docx '
  query += '(contract opportunity OR solicitation OR notice) '

  // VetCert set-aside terms
  const setAsideTerms: string[] = []
  if (setAsideType === 'SDVOSB' || setAsideType === 'both') {
    setAsideTerms.push('"Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside"')
    if (includeSoleSource) {
      setAsideTerms.push('"Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source"')
    }
    setAsideTerms.push('"SDVOSB Set-Aside"', '"SBA certified SDVOSB"')
  }
  if (setAsideType === 'VOSB' || setAsideType === 'both') {
    setAsideTerms.push('"Veteran-Owned Small Business Set Aside, Department of Veterans Affairs"')
    if (includeSoleSource) {
      setAsideTerms.push('"Veteran-Owned Small Business Sole Source, Department of Veterans Affairs"')
    }
    setAsideTerms.push('"VOSB Set Aside"', '"SBA certified VOSB"')
  }
  // Add variants
  setAsideTerms.push('"SDVOSB"', '"VOSB"', '"Service-Disabled Veteran"', '"veteran-owned"')
  
  query += `(${setAsideTerms.join(' OR ')}) `

  // Cyber/RMF keywords
  const cyberTerms: string[] = ['"RMF"', '"Risk Management Framework"', '"cybersecurity"', '"ATO"', '"Authorization to Operate"']
  
  if (includeRmfRoles) {
    cyberTerms.push(...RMF_ROLE_KEYWORDS.map(role => `"${role}"`))
  }
  
  if (includeRmfArtifacts) {
    cyberTerms.push(...RMF_ARTIFACT_KEYWORDS.map(artifact => `"${artifact}"`))
  }
  
  query += `(${cyberTerms.join(' OR ')}) `

  // NAICS codes
  if (naicsCodes && naicsCodes.length > 0) {
    query += `(${naicsCodes.map(n => `"NAICS ${n}"`).join(' OR ')}) `
  }

  // Location
  if (location) {
    query += `"${location}" `
  }

  // Agency
  if (agency && agency.length > 0) {
    const agencyQueries = agency.map(a => {
      if (a.includes('.gov') || a.includes('.mil')) {
        return `site:${a}`
      }
      return `"${a}"`
    })
    query += `(${agencyQueries.join(' OR ')}) `
  }

  return query.trim()
}

