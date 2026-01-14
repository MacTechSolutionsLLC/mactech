/**
 * PSC Gate Filter
 * Hard drop filter for PSC code blacklist
 * 
 * This is a HARD DROP - opportunities matching PSC blacklist are discarded immediately
 * and never reach scoring. PSC is more reliable than NAICS for excluding:
 * - Facilities
 * - Medical
 * - Hardware
 * - Furniture
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { PSC_BLACKLIST_PREFIXES } from './filterConstants'

export interface PscGateResult {
  passed: boolean
  reason?: string
}

/**
 * Check if PSC code matches any blacklist prefix
 */
function matchesBlacklistPrefix(pscCode: string): boolean {
  if (!pscCode) return false
  
  const codeUpper = pscCode.toUpperCase().trim()
  
  return PSC_BLACKLIST_PREFIXES.some(prefix => 
    codeUpper.startsWith(prefix)
  )
}

/**
 * Filter opportunity by PSC gate (HARD DROP)
 * 
 * @param opportunity - SAM.gov opportunity to filter
 * @returns Filter result - if passed is false, opportunity is discarded immediately
 */
export function filterByPsc(opportunity: SamGovOpportunity): PscGateResult {
  const pscCode = opportunity.classificationCode
  
  if (!pscCode) {
    // No PSC code - pass through (let other filters handle it)
    return {
      passed: true,
      reason: 'No PSC code',
    }
  }
  
  if (matchesBlacklistPrefix(pscCode)) {
    // HARD DROP - discard immediately
    return {
      passed: false,
      reason: `PSC code matches blacklist prefix: ${pscCode}`,
    }
  }
  
  // PSC code exists and doesn't match blacklist
  return {
    passed: true,
    reason: 'PSC code not in blacklist',
  }
}

