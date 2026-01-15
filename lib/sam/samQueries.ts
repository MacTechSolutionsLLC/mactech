/**
 * SAM.gov Query Templates
 * Hard-coded query templates as specified in requirements
 */

import { SourceQuery } from './samTypes'

/**
 * Get date range helper
 * Default: Full year 2025 (01/01/2025 to 12/31/2025) per specification
 */
function getDateRange(): { from: string; to: string } {
  // Default to full year 2025 per exact specification
  return {
    from: '01/01/2025',
    to: '12/31/2025',
  }
}

/**
 * Query A - Broad Universe (Safety Net)
 * Exact specification: ptype=r,p,k,o, postedFrom=01/01/2025, postedTo=12/31/2025
 */
export function buildQueryA(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('ptype', 'r,p,k,o')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query B - Cyber / IT NAICS Core
 * Exact specification: ncode=541512,541511,541519,518210, ptype=r,p,o
 */
export function buildQueryB(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('ncode', '541512,541511,541519,518210')
  params.append('ptype', 'r,p,o')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query C - Small Business / SDVOSB Focused
 * Exact specification: typeOfSetAside=SBA,SDVOSBC, ptype=o
 */
export function buildQueryC(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
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
 * Exact specification: ptype=r
 */
export function buildQueryD(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
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
 * Query E - Keyword-Intent (NAICS-Agnostic)
 * Exact specification: keywords=cyber,rmf,stig,ato,zero trust,information assurance,security engineering, ptype=r,p,o
 */
export function buildQueryE(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange()
  
  const params = new URLSearchParams()
  params.append('keywords', 'cyber,rmf,stig,ato,zero trust,information assurance,security engineering')
  params.append('ptype', 'r,p,o')
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
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const builder = QUERY_BUILDERS[source]
  return builder(postedFrom, postedTo, limit, offset)
}

