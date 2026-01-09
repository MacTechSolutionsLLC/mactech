/**
 * SAM.gov Search Helper
 * 
 * Extracts search parameters from templates and converts them to SAM.gov API format
 */

import { ServiceCategory } from './contract-discovery'

export interface TemplateSearchParams {
  keywords?: string[]
  setAside?: string[]
  naicsCodes?: string[]
  serviceCategory?: ServiceCategory
  isVetCert?: boolean
  isSoleSource?: boolean
}

/**
 * Extract keywords from a Google search query string
 */
export function extractKeywordsFromQuery(query: string): string[] {
  const keywords: string[] = []
  
  // Remove Google-specific syntax
  let cleaned = query
    .replace(/site:\S+/gi, '')
    .replace(/-filetype:\S+/gi, '')
    .replace(/filetype:\S+/gi, '')
    .replace(/\(/g, ' ')
    .replace(/\)/g, ' ')
    .replace(/"/g, '')
    .replace(/\b(OR|AND|NOT)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  
  // Extract meaningful keywords (skip common words)
  const stopWords = new Set([
    'contract', 'opportunity', 'solicitation', 'notice', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ])
  
  const words = cleaned.split(' ')
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
  
  // Prioritize technical terms
  const technicalTerms = words.filter(w => 
    /^(RMF|ATO|ISSO|ISSM|ISSE|STIG|NIST|SCA|eMASS|POA&M|SSP|SAR|ConMon|cybersecurity|infrastructure|compliance|audit|readiness)$/i.test(w) ||
    w.length > 5
  )
  
  return [...new Set([...technicalTerms, ...words])].slice(0, 10)
}

/**
 * Extract set-aside type from query
 */
export function extractSetAsideFromQuery(query: string): { setAside: string; isSoleSource: boolean } | null {
  const upperQuery = query.toUpperCase()
  
  // Check for SDVOSB
  if (upperQuery.includes('SDVOSB') || upperQuery.includes('SERVICE-DISABLED VETERAN')) {
    const isSoleSource = upperQuery.includes('SOLE SOURCE')
    return { setAside: 'SDVOSB', isSoleSource }
  }
  
  // Check for VOSB
  if (upperQuery.includes('VOSB') || upperQuery.includes('VETERAN-OWNED') && upperQuery.includes('VETERANS AFFAIRS')) {
    const isSoleSource = upperQuery.includes('SOLE SOURCE')
    return { setAside: 'VOSB', isSoleSource }
  }
  
  return null
}

/**
 * Extract service category from query
 */
export function extractServiceCategoryFromQuery(query: string): ServiceCategory {
  const upperQuery = query.toUpperCase()
  
  if (upperQuery.includes('RMF') || upperQuery.includes('ATO') || upperQuery.includes('CYBERSECURITY') || 
      upperQuery.includes('ISSO') || upperQuery.includes('ISSM') || upperQuery.includes('STIG') ||
      upperQuery.includes('NIST')) {
    return 'cybersecurity'
  }
  
  if (upperQuery.includes('DATA CENTER') || upperQuery.includes('INFRASTRUCTURE') || 
      upperQuery.includes('CLOUD') || upperQuery.includes('NETWORK')) {
    return 'infrastructure'
  }
  
  if (upperQuery.includes('AUDIT') || upperQuery.includes('COMPLIANCE') || 
      upperQuery.includes('ISO') || upperQuery.includes('QMS')) {
    return 'compliance'
  }
  
  return 'general'
}

/**
 * Get NAICS codes for service category
 */
export function getNaicsCodesForCategory(category: ServiceCategory): string[] {
  const naicsMapping: Record<ServiceCategory, string[]> = {
    cybersecurity: ['541512', '541519', '541511'], // Computer systems design, other computer services, custom programming
    infrastructure: ['541330', '541511', '518210'], // Engineering, programming, data processing
    compliance: ['541211', '541219', '541690'], // Accounting, auditing, consulting
    contracts: ['541611', '541612'], // Management consulting
    general: [],
  }
  
  return naicsMapping[category] || []
}

/**
 * Parse template query into SAM.gov search parameters
 */
export function parseTemplateQuery(query: string): TemplateSearchParams {
  const keywords = extractKeywordsFromQuery(query)
  const setAsideInfo = extractSetAsideFromQuery(query)
  const serviceCategory = extractServiceCategoryFromQuery(query)
  const naicsCodes = getNaicsCodesForCategory(serviceCategory)
  
  return {
    keywords,
    setAside: setAsideInfo ? [setAsideInfo.setAside] : undefined,
    naicsCodes: naicsCodes.length > 0 ? naicsCodes : undefined,
    serviceCategory,
    isVetCert: !!setAsideInfo,
    isSoleSource: setAsideInfo?.isSoleSource || false,
  }
}

/**
 * Build SAM.gov keyword string from extracted keywords
 */
export function buildSamGovKeywordString(keywords: string[], serviceCategory?: ServiceCategory): string {
  // Prioritize service-specific keywords
  const priorityKeywords: string[] = []
  const otherKeywords: string[] = []
  
  keywords.forEach(kw => {
    const upper = kw.toUpperCase()
    if (upper.includes('RMF') || upper.includes('ATO') || upper.includes('ISSO') || 
        upper.includes('ISSM') || upper.includes('STIG') || upper.includes('NIST') ||
        upper.includes('CYBERSECURITY') || upper.includes('AUDIT') || 
        upper.includes('COMPLIANCE') || upper.includes('INFRASTRUCTURE')) {
      priorityKeywords.push(kw)
    } else {
      otherKeywords.push(kw)
    }
  })
  
  // Combine priority keywords first, then others
  const allKeywords = [...priorityKeywords, ...otherKeywords].slice(0, 5)
  
  return allKeywords.join(' ')
}

