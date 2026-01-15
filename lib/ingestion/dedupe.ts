/**
 * Deduplication Utility
 * Deduplicates opportunities by noticeId (strict equality)
 * Merges sourceQuery arrays when duplicates are found
 */

import { NormalizedOpportunity, SourceQuery } from '../sam/samTypes'
import { mergeNormalizedOpportunities } from '../sam/samNormalizer'

/**
 * Deduplicate opportunities by noticeId
 * 
 * @param opportunities - Array of normalized opportunities
 * @returns Deduplicated array with merged metadata
 */
export function deduplicateOpportunities(
  opportunities: NormalizedOpportunity[]
): NormalizedOpportunity[] {
  const seen = new Map<string, NormalizedOpportunity>()
  const originalCount = opportunities.length
  
  for (const opp of opportunities) {
    const noticeId = opp.noticeId
    
    if (!noticeId) {
      // Skip opportunities without noticeId (shouldn't happen, but handle gracefully)
      console.warn('[Dedup] Skipping opportunity without noticeId')
      continue
    }
    
    if (seen.has(noticeId)) {
      // Duplicate found - merge sourceQueries
      const existing = seen.get(noticeId)!
      const merged = mergeNormalizedOpportunities(existing, opp)
      seen.set(noticeId, merged)
    } else {
      // New opportunity
      seen.set(noticeId, opp)
    }
  }
  
  const deduplicated = Array.from(seen.values())
  const deduplicatedCount = deduplicated.length
  
  console.log(
    `[Dedup] Reduced ${originalCount} to ${deduplicatedCount} unique notices ` +
    `(${originalCount - deduplicatedCount} duplicates removed)`
  )
  
  return deduplicated
}

