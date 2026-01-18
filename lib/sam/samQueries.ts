/**
 * SAM.gov Query Templates
 * Hard-coded query templates as specified in requirements
 */

import { SourceQuery } from './samTypes'

/**
 * Get date range helper
 * Default: Rolling 45 days (approximately 30-60 day window)
 */
function getDateRange(): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  // 45 days ago (rolling window)
  const fromDate = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)
  const from = fromDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  return { from, to }
}

/**
 * Query A - Awards Only (Broad Universe)
 * Changed to ptype=o only to avoid overlap with other queries
 * This captures all awards regardless of NAICS/keywords
 */
export function buildQueryA(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('ptype', 'o') // Awards only - distinct from other queries
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query B - Cyber / IT NAICS Core (Presolicitations & Awards)
 * Focused on cyber/IT NAICS codes with presolicitations and awards only
 * This avoids overlap with Query A (awards only) and Query D (sources sought)
 */
export function buildQueryB(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('naics', '541512,541511,541519,518210')
  params.append('ptype', 'p,o') // Presolicitations and awards - distinct from Query A (o only) and Query D (r only)
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query C - Small Business / SDVOSB Focused
 * Revised: typeOfSetAside=SBA,SDVOSBC (correct param name), rolling 30-60 days, limit=1000
 */
export function buildQueryC(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('typeOfSetAside', 'SBA,SDVOSBC')
  params.append('ptype', 'o')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query D - Sources Sought (Early Capture)
 * Revised: rolling 30-60 days, limit=1000
 */
export function buildQueryD(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('ptype', 'r')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query E - Keyword-Intent (Presolicitations & Awards)
 * Focused keyword search on presolicitations and awards only
 * Uses broader keyword to capture related opportunities
 * Distinct from Query A (all awards), Query B (NAICS-specific), Query D (sources sought)
 */
export function buildQueryE(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('keywords', 'cyber security information technology cybersecurity')
  params.append('ptype', 'p,o') // Presolicitations and awards - distinct from other queries
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query builder map
 */
export const QUERY_BUILDERS: Record<SourceQuery, typeof buildQueryA> = {
  A: buildQueryA,
  B: buildQueryB,
  C: buildQueryC,
  D: buildQueryD,
  E: buildQueryE,
}

/**
 * Build query by source identifier
 */
export function buildQuery(
  source: SourceQuery,
  postedFrom?: string,
  postedTo?: string,
  limit: number = 1000,
  offset: number = 0
): URLSearchParams {
  const builder = QUERY_BUILDERS[source]
  return builder(postedFrom, postedTo, limit, offset)
}

