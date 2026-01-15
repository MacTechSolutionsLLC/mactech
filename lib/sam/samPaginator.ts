/**
 * SAM.gov Paginator
 * Fully paginates all results from a query template
 * Never misses records - continues until offset >= totalRecords
 */

import { executeSamGovQuery } from './samClient'
import { SamGovOpportunity } from './samTypes'
import { SourceQuery } from './samTypes'

/**
 * Sleep utility for rate limiting between pages
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Paginate a query template fully
 * 
 * @param buildQueryFn - Function that builds query params for given offset
 * @param sourceQuery - Source query identifier for logging
 * @param limit - Results per page (default 50, max 1000)
 * @returns All opportunities from all pages
 */
export async function paginateQuery(
  buildQueryFn: (offset: number) => URLSearchParams,
  sourceQuery: SourceQuery,
  limit: number = 50
): Promise<SamGovOpportunity[]> {
  const allOpportunities: SamGovOpportunity[] = []
  let offset = 0
  let totalRecords = 0
  let hasMore = true
  let pageCount = 0
  
  // Enforce max limit per API
  const effectiveLimit = Math.min(limit, 1000)
  
  console.log(`[Ingest] Query ${sourceQuery} starting pagination (limit=${effectiveLimit})`)
  
  while (hasMore) {
    try {
      pageCount++
      const params = buildQueryFn(offset)
      
      // Update limit in params
      params.set('limit', String(effectiveLimit))
      params.set('offset', String(offset))
      
      const response = await executeSamGovQuery(params)
      
      // First page - capture totalRecords
      if (pageCount === 1) {
        totalRecords = response.totalRecords
        console.log(`[Ingest] Query ${sourceQuery} total records: ${totalRecords}`)
      }
      
      allOpportunities.push(...response.opportunitiesData)
      
      const fetched = allOpportunities.length
      console.log(
        `[Ingest] Query ${sourceQuery} fetched ${response.opportunitiesData.length} records ` +
        `(offset ${offset}, total so far: ${fetched}/${totalRecords})`
      )
      
      // Check if we've fetched all available records
      if (response.opportunitiesData.length < effectiveLimit || 
          offset + effectiveLimit >= totalRecords ||
          fetched >= totalRecords) {
        hasMore = false
      } else {
        offset += effectiveLimit
        
        // Small delay between pages to be respectful of API
        if (pageCount % 10 === 0) {
          // Every 10 pages, wait a bit longer
          await sleep(1000)
        } else {
          await sleep(200)
        }
      }
      
      // Safety limit: don't fetch more than 50,000 records in a single query
      if (allOpportunities.length >= 50000) {
        console.warn(
          `[Ingest] Query ${sourceQuery} reached safety limit of 50,000 records, stopping pagination`
        )
        hasMore = false
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(
        `[Ingest] Query ${sourceQuery} error at offset ${offset}:`,
        errorMessage
      )
      
      // If we have some results, continue with what we have
      if (allOpportunities.length > 0) {
        console.warn(
          `[Ingest] Query ${sourceQuery} continuing with ${allOpportunities.length} opportunities despite error`
        )
        hasMore = false
      } else {
        // No results yet - throw the error
        throw error
      }
    }
  }
  
  console.log(
    `[Ingest] Query ${sourceQuery} fetched ${allOpportunities.length} total opportunities ` +
    `(${pageCount} pages)`
  )
  
  return allOpportunities
}

