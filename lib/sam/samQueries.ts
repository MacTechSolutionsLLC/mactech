/**
 * SAM.gov Query Templates
 * Hard-coded query templates as specified in requirements
 */

import { SourceQuery } from './samTypes'

/**
 * Get date range helper
 */
function getDateRange(daysBack: number = 365): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  })
  
  const fromDate = new Date(today.getTime() - daysBack * 24 * 60 * 60 * 1000)
  const from = fromDate.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  })
  
  return { from, to }
}

/**
 * Query A - Broad Universe (Safety Net)
 * ptype = r,p,k,o
 * postedFrom = rolling 365 days
 * postedTo = today
 */
export function buildQueryA(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange(365)
  
  const params = new URLSearchParams()
  params.append('ptype', 'r,p,k,o')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query B - Cyber / IT NAICS
 * ncode = 541512,541511,541519,518210
 * ptype = r,p,o
 */
export function buildQueryB(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange(365)
  
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
 * Query C - Small Business / SDVOSB
 * typeOfSetAside = SBA,SDVOSBC
 * ptype = o
 */
export function buildQueryC(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange(365)
  
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
 * ptype = r
 */
export function buildQueryD(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange(365)
  
  const params = new URLSearchParams()
  params.append('ptype', 'r')
  params.append('postedFrom', from)
  params.append('postedTo', to)
  params.append('limit', String(limit))
  params.append('offset', String(offset))
  
  return params
}

/**
 * Query E - Keyword Intent (NAICS-Agnostic)
 * keywords = cyber,rmf,stig,ato,zero trust,information assurance,security engineering
 * ptype = r,p,o
 */
export function buildQueryE(
  postedFrom?: string,
  postedTo?: string,
  limit: number = 50,
  offset: number = 0
): URLSearchParams {
  const { from, to } = postedFrom && postedTo 
    ? { from: postedFrom, to: postedTo }
    : getDateRange(365)
  
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

