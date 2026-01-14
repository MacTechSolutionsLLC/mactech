/**
 * Title Intent Gate Filter
 * Filters opportunities based on title/description intent keywords
 * 
 * Opportunities must contain at least one intent keyword in title or description
 */

import { SamGovOpportunity } from '../sam-gov-api-v2'
import { TITLE_INTENT_KEYWORDS } from './filterConstants'

export interface TitleGateResult {
  passed: boolean
  reason?: string
}

/**
 * Check if title or description contains at least one intent keyword
 */
function hasIntentKeyword(opportunity: SamGovOpportunity): boolean {
  const title = (opportunity.title || '').toLowerCase()
  const description = (opportunity.description || '').toLowerCase()
  const combined = `${title} ${description}`
  
  return TITLE_INTENT_KEYWORDS.some(keyword => 
    combined.includes(keyword.toLowerCase())
  )
}

/**
 * Filter opportunity by title intent gate
 * 
 * @param opportunity - SAM.gov opportunity to filter
 * @returns Filter result with pass/fail and reason
 */
export function filterByTitleIntent(opportunity: SamGovOpportunity): TitleGateResult {
  if (hasIntentKeyword(opportunity)) {
    return {
      passed: true,
      reason: 'Title/description contains intent keyword',
    }
  }
  
  return {
    passed: false,
    reason: 'Title/description missing intent keywords',
  }
}

