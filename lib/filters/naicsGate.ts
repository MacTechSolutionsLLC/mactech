/**
 * NAICS Gate Filter
 * Filters opportunities based on NAICS code allowlist
 * 
 * Logic:
 * - If NAICS is in allowlist → pass
 * - If NAICS is missing:
 *   - Apply -40 score penalty (handled in scoring stage)
 *   - Exception: If title+description strongly match intent keywords AND ptype is Sources Sought → allow through (no penalty)
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { NAICS_ALLOWLIST, STRONG_INTENT_KEYWORDS } from './filterConstants'

export interface NaicsGateResult {
  passed: boolean
  reason?: string
  missingNaics?: boolean
  sourcesSoughtException?: boolean
}

/**
 * Check if opportunity has a valid NAICS code in the allowlist
 */
function hasValidNaics(opportunity: SamGovOpportunity): boolean {
  const naicsCodes: string[] = []
  
  if (opportunity.naicsCode) {
    naicsCodes.push(opportunity.naicsCode)
  }
  if (opportunity.naicsCodes) {
    naicsCodes.push(...opportunity.naicsCodes)
  }
  
  return naicsCodes.some(code => NAICS_ALLOWLIST.includes(code as any))
}

/**
 * Check if title and description strongly match intent keywords
 */
function hasStrongIntentMatch(opportunity: SamGovOpportunity): boolean {
  const title = (opportunity.title || '').toLowerCase()
  const description = (opportunity.description || '').toLowerCase()
  const combined = `${title} ${description}`
  
  return STRONG_INTENT_KEYWORDS.some(keyword => 
    combined.includes(keyword.toLowerCase())
  )
}

/**
 * Check if opportunity is Sources Sought
 */
function isSourcesSought(opportunity: SamGovOpportunity): boolean {
  const type = (opportunity.type || '').toUpperCase()
  const baseType = (opportunity.baseType || '').toUpperCase()
  
  return type.includes('SRCSGT') || 
         baseType.includes('SRCSGT') ||
         type.includes('SOURCES SOUGHT') ||
         baseType.includes('SOURCES SOUGHT')
}

/**
 * Filter opportunity by NAICS gate
 * 
 * @param opportunity - SAM.gov opportunity to filter
 * @returns Filter result with pass/fail and reason
 */
export function filterByNaics(opportunity: SamGovOpportunity): NaicsGateResult {
  // If NAICS is in allowlist, pass
  if (hasValidNaics(opportunity)) {
    return {
      passed: true,
      reason: 'NAICS code in allowlist',
    }
  }
  
  // Check if NAICS is missing
  const hasNaics = !!(opportunity.naicsCode || (opportunity.naicsCodes && opportunity.naicsCodes.length > 0))
  
  if (!hasNaics) {
    // Missing NAICS - check for Sources Sought exception
    if (isSourcesSought(opportunity) && hasStrongIntentMatch(opportunity)) {
      return {
        passed: true,
        reason: 'Missing NAICS but Sources Sought with strong intent match - exception granted',
        missingNaics: true,
        sourcesSoughtException: true,
      }
    }
    
    // Missing NAICS without exception - will get -40 penalty in scoring
    return {
      passed: true, // Pass through to scoring where penalty will be applied
      reason: 'Missing NAICS - will apply -40 score penalty',
      missingNaics: true,
    }
  }
  
  // NAICS exists but not in allowlist
  return {
    passed: false,
    reason: `NAICS code not in allowlist: ${opportunity.naicsCode || opportunity.naicsCodes?.join(', ') || 'unknown'}`,
  }
}

