/**
 * VetCert-focused query builder
 * Automatically injects SDVOSB/VOSB filters and optimizes NAICS/PSC codes
 */

import { ServiceCategory } from '../contract-discovery'
import { TARGET_NAICS_CODES, TARGET_PSC_CODES } from '../sam-gov-api'

export interface VetCertQueryParams {
  keywords: string[]
  serviceCategory?: ServiceCategory
  setAside?: string[]
  naicsCodes?: string[]
  pscCodes?: string[]
  location?: string
  agency?: string[]
  dateRange?: 'past_week' | 'past_month' | 'past_year'
}

export interface SamGovQuery {
  keyword?: string
  setAside?: string[]
  naicsCodes?: string[]
  pscCodes?: string[]
  dateRange?: 'past_week' | 'past_month' | 'past_year'
}

export interface GoogleQuery {
  query: string
  description: string
}

/**
 * VetCert set-aside terms for SAM.gov API
 */
export const VETCERT_SET_ASIDE_CODES = {
  SDVOSB: 'SDVOSB',
  VOSB: 'VOSB',
} as const

/**
 * VetCert set-aside terms for Google search
 */
export const VETCERT_GOOGLE_TERMS = [
  'Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside',
  'Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source',
  'SDVOSB Set-Aside',
  'SDVOSB Sole Source',
  'Veteran-Owned Small Business Set Aside, Department of Veterans Affairs',
  'Veteran-Owned Small Business Sole Source, Department of Veterans Affairs',
  'VOSB Set Aside, Department of Veterans Affairs',
  'VOSB Sole Source, Department of Veterans Affairs',
  'SBA certified SDVOSB',
  'SBA certified VOSB',
  'VetCert',
]

/**
 * Service category keyword mappings
 */
const SERVICE_KEYWORDS: Record<ServiceCategory, string[]> = {
  cybersecurity: [
    'RMF', 'Risk Management Framework', 'ATO', 'Authorization to Operate',
    'STIG', 'Security Technical Implementation Guide', 'ConMon', 'Continuous Monitoring',
    'SCA', 'Security Control Assessment', 'POA&M', 'Plan of Action',
    'SSP', 'System Security Plan', 'NIST 800-53', 'CMMC', 'cybersecurity',
    'ISSO', 'ISSM', 'ISSE', 'eMASS',
  ],
  infrastructure: [
    'data center', 'cloud migration', 'infrastructure as code', 'IaC',
    'network architecture', 'systems engineering', 'platform engineering',
    'Terraform', 'Ansible', 'AWS', 'Azure', 'infrastructure',
  ],
  compliance: [
    'ISO 9001', 'ISO 17025', 'ISO 27001', 'audit readiness',
    'quality management system', 'QMS', 'laboratory accreditation',
    'compliance consulting', 'process documentation',
  ],
  contracts: [
    'contract alignment', 'risk advisory', 'governance', 'contractual readiness',
    'vendor management', 'subcontractor agreement',
  ],
  general: [],
}

/**
 * Build SAM.gov API query with VetCert defaults
 * KEYWORD-FIRST APPROACH: NAICS/PSC codes are used for client-side ranking only
 * They are NOT sent as filters to the API to avoid excessive API calls
 */
export function buildSamGovQuery(params: VetCertQueryParams): SamGovQuery {
  // Always include VetCert set-asides (SDVOSB and VOSB)
  const setAside = params.setAside || [VETCERT_SET_ASIDE_CODES.SDVOSB, VETCERT_SET_ASIDE_CODES.VOSB]
  
  // NAICS/PSC codes are used for client-side ranking/filtering only
  // Only use codes if explicitly provided by user - no defaults
  // This allows keyword-based search to be broader and more flexible
  const naicsCodes = params.naicsCodes && params.naicsCodes.length > 0
    ? params.naicsCodes
    : [] // Empty by default - rely on keyword search only
  
  const pscCodes = params.pscCodes && params.pscCodes.length > 0
    ? params.pscCodes
    : [] // Empty by default - rely on keyword search only
  
  // Build keyword string from provided keywords and service category
  const keywordParts: string[] = []
  
  // Add user-provided keywords
  if (params.keywords && params.keywords.length > 0) {
    keywordParts.push(...params.keywords)
  }
  
  // Add service category keywords if specified
  if (params.serviceCategory && params.serviceCategory !== 'general') {
    const categoryKeywords = SERVICE_KEYWORDS[params.serviceCategory]
    if (categoryKeywords.length > 0) {
      // Add top 3 category keywords
      keywordParts.push(...categoryKeywords.slice(0, 3))
    }
  }
  
  // Remove duplicates and join
  const keyword = [...new Set(keywordParts)].join(' ').trim() || undefined
  
  return {
    keyword,
    setAside,
    naicsCodes,
    pscCodes,
    dateRange: params.dateRange || 'past_month',
  }
}

/**
 * Build Google search query with VetCert focus
 */
export function buildGoogleQuery(params: VetCertQueryParams): GoogleQuery {
  let query = 'site:sam.gov '
  
  // Exclude PDFs to focus on opportunity pages
  query += '-filetype:pdf -filetype:doc -filetype:docx -filetype:xls -filetype:xlsx '
  
  // Contract opportunity keywords
  query += '(contract opportunity OR solicitation OR notice) '
  
  // Build combined keyword group: user keywords + VetCert terms + service category keywords
  // This prioritizes user keywords while still including VetCert filtering
  const keywordParts: string[] = []
  
  // Add user-provided keywords first (highest priority)
  if (params.keywords && params.keywords.length > 0) {
    params.keywords.forEach(kw => {
      const trimmed = kw.trim()
      if (trimmed.length > 0) {
        keywordParts.push(`"${trimmed}"`)
      }
    })
  }
  
  // Add service category keywords only if not already covered by user keywords
  if (params.serviceCategory && params.serviceCategory !== 'general') {
    const categoryKeywords = SERVICE_KEYWORDS[params.serviceCategory]
    const userKeywordsLower = (params.keywords || []).map(k => k.toLowerCase().trim())
    
    // Only add category keywords that aren't already in user keywords
    categoryKeywords.forEach(catKw => {
      const catKwLower = catKw.toLowerCase()
      const alreadyIncluded = userKeywordsLower.some(uk => 
        uk === catKwLower || 
        uk.includes(catKwLower) || 
        catKwLower.includes(uk)
      )
      
      if (!alreadyIncluded) {
        keywordParts.push(`"${catKw}"`)
      }
    })
  }
  
  // Add VetCert set-aside terms (integrated with keywords, not separate)
  const vetCertTerms = VETCERT_GOOGLE_TERMS.map(term => `"${term}"`)
  keywordParts.push(...vetCertTerms)
  
  // Combine all keywords in a single OR group
  if (keywordParts.length > 0) {
    query += `(${keywordParts.join(' OR ')}) `
  }
  
  // NAICS codes - only if explicitly provided by user (no defaults)
  if (params.naicsCodes && params.naicsCodes.length > 0) {
    const naicsQueries = params.naicsCodes.map(code => `"NAICS ${code}"`).join(' OR ')
    query += `(${naicsQueries}) `
  }
  
  // Location
  if (params.location) {
    query += `"${params.location}" `
  }
  
  // Agency
  if (params.agency && params.agency.length > 0) {
    const agencyQueries = params.agency.map(a => {
      if (a.includes('.gov') || a.includes('.mil')) {
        return `site:${a}`
      }
      return `"${a}"`
    }).join(' OR ')
    query += `(${agencyQueries}) `
  }
  
  const trimmedQuery = query.trim()
  
  return {
    query: trimmedQuery,
    description: `VetCert-focused search for ${params.serviceCategory || 'general'} opportunities with ${params.keywords?.length || 0} keywords`,
  }
}

/**
 * Parse comma-separated keywords into array
 */
export function parseKeywords(keywords: string): string[] {
  return keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0)
}

/**
 * Expand keywords with VetCert-related terms
 */
export function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>(keywords)
  
  // Add VetCert variants if any veteran-related keywords found
  const hasVetTerm = keywords.some(kw => 
    kw.toLowerCase().includes('vet') || 
    kw.toLowerCase().includes('veteran') ||
    kw.toLowerCase().includes('sdvosb') ||
    kw.toLowerCase().includes('vosb')
  )
  
  if (hasVetTerm) {
    expanded.add('SDVOSB')
    expanded.add('VOSB')
    expanded.add('VetCert')
  }
  
  // Add RMF-related terms if cybersecurity keywords found
  const hasCyberTerm = keywords.some(kw =>
    kw.toLowerCase().includes('rmf') ||
    kw.toLowerCase().includes('ato') ||
    kw.toLowerCase().includes('cyber') ||
    kw.toLowerCase().includes('security')
  )
  
  if (hasCyberTerm) {
    expanded.add('RMF')
    expanded.add('ATO')
    expanded.add('cybersecurity')
  }
  
  return Array.from(expanded)
}

/**
 * Build both SAM.gov API and Google queries from comma-separated keywords
 */
export function buildDualQueries(
  keywords: string,
  options: {
    serviceCategory?: ServiceCategory
    location?: string
    agency?: string[]
    dateRange?: 'past_week' | 'past_month' | 'past_year'
    naicsCodes?: string[]
    pscCodes?: string[]
  } = {}
): {
  samGov: SamGovQuery
  google: GoogleQuery
  parsedKeywords: string[]
} {
  // Parse and expand keywords
  const parsedKeywords = parseKeywords(keywords)
  const expandedKeywords = expandKeywords(parsedKeywords)
  
  // Build query params
  const params: VetCertQueryParams = {
    keywords: expandedKeywords,
    serviceCategory: options.serviceCategory || 'cybersecurity',
    location: options.location,
    agency: options.agency,
    dateRange: options.dateRange || 'past_month',
    naicsCodes: options.naicsCodes,
    pscCodes: options.pscCodes,
  }
  
  // Build both queries
  const samGov = buildSamGovQuery(params)
  const google = buildGoogleQuery(params)
  
  return {
    samGov,
    google,
    parsedKeywords: expandedKeywords,
  }
}

/**
 * Build only SAM.gov API query (no Google query)
 * Used when Google query generation is separated from API workflow
 */
export function buildSamGovQueryOnly(
  keywords: string,
  options: {
    serviceCategory?: ServiceCategory
    location?: string
    agency?: string[]
    dateRange?: 'past_week' | 'past_month' | 'past_year'
    naicsCodes?: string[]
    pscCodes?: string[]
  } = {}
): {
  samGov: SamGovQuery
  parsedKeywords: string[]
} {
  // Parse and expand keywords
  const parsedKeywords = parseKeywords(keywords)
  const expandedKeywords = expandKeywords(parsedKeywords)
  
  // Build query params
  const params: VetCertQueryParams = {
    keywords: expandedKeywords,
    serviceCategory: options.serviceCategory || 'cybersecurity',
    location: options.location,
    agency: options.agency,
    dateRange: options.dateRange || 'past_month',
    naicsCodes: options.naicsCodes,
    pscCodes: options.pscCodes,
  }
  
  // Build only SAM.gov query
  const samGov = buildSamGovQuery(params)
  
  return {
    samGov,
    parsedKeywords: expandedKeywords,
  }
}

