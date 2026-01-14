/**
 * VetCert-focused Google query builder
 * Builds Google search queries for SAM.gov contract opportunities
 * Note: SAM.gov API queries are now handled directly in sam-gov-api-v2.ts
 */

export interface VetCertQueryParams {
  keywords: string[]
  setAside?: string[]
  naicsCodes?: string[]
  pscCodes?: string[]
  location?: string
  agency?: string[]
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
 * REMOVED: buildSamGovQuery - SAM.gov API queries are now handled directly
 * in sam-gov-api-v2.ts using the correct endpoint and parameters
 */

/**
 * Build Google search query with VetCert focus
 */
export function buildGoogleQuery(params: VetCertQueryParams): GoogleQuery {
  let query = 'site:sam.gov '
  
  // Exclude PDFs to focus on opportunity pages
  query += '-filetype:pdf -filetype:doc -filetype:docx -filetype:xls -filetype:xlsx '
  
  // Contract opportunity keywords
  query += '(contract opportunity OR solicitation OR notice) '
  
  // Build combined keyword group: user keywords + VetCert terms only
  // REMOVED: Service category keyword injection - only use user-provided keywords
  const keywordParts: string[] = []
  
  // Add user-provided keywords only
  if (params.keywords && params.keywords.length > 0) {
    params.keywords.forEach(kw => {
      const trimmed = kw.trim()
      if (trimmed.length > 0) {
        keywordParts.push(`"${trimmed}"`)
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
 * REMOVED: buildDualQueries and buildSamGovQueryOnly
 * SAM.gov API queries are now handled directly in sam-gov-api-v2.ts
 * This file now only handles Google query building
 */

