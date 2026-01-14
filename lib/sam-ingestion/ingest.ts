/**
 * SAM.gov Ingestion Orchestrator
 * 
 * Orchestrates the complete ingestion pipeline:
 * 1. Raw Ingest - Fetch from SAM.gov API
 * 2. Hard Filters - Apply deterministic gates
 * 3. Relevance Scoring - Score opportunities 0-100
 * 4. Shortlist - Filter by score threshold
 * 
 * Uses FROZEN canonical query:
 * - ptype = r,p,k
 * - postedFrom = today - 30 days
 * - postedTo = today
 * - limit = 100
 * - offset = pagination
 */

import { searchSamGovV2, SamGovOpportunity } from '../sam-gov-api-v2'
import { applyHardFilters, HardFilterResult } from '../filters/hardFilter'
import { scoreOpportunity, ScoringResult } from '../scoring/scoreOpportunity'
import { MIN_SCORE_THRESHOLD } from '../scoring/scoringConstants'
import { ScoredOpportunity, IngestionResult, IngestionBatch } from './samTypes'

/**
 * Generate batch ID for this ingestion run
 */
function generateBatchId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get date range for canonical query (30-day rolling window)
 */
function getDateRange(): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  const fromDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  const from = fromDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  return { from, to }
}

/**
 * Ingest raw opportunities from SAM.gov API
 * Uses FROZEN canonical query with pagination support
 */
async function ingestRawOpportunities(): Promise<SamGovOpportunity[]> {
  const { from, to } = getDateRange()
  const allOpportunities: SamGovOpportunity[] = []
  let offset = 0
  const limit = 100
  let hasMore = true
  
  console.log(`[Ingest] Starting raw ingestion: postedFrom=${from}, postedTo=${to}, ptype=r,p,k`)
  
  while (hasMore) {
    try {
      // FROZEN QUERY: ptype=r,p,k (Request for Information, Presolicitation, Combined Synopsis/Solicitation)
      // This query must not be changed - all improvements happen downstream
      const response = await searchSamGovV2({
        ptype: 'r,p,k',
        postedFrom: from,
        postedTo: to,
        limit,
        offset,
      })
      
      allOpportunities.push(...response.opportunitiesData)
      
      console.log(`[Ingest] Fetched ${response.opportunitiesData.length} opportunities (offset ${offset}, total so far: ${allOpportunities.length})`)
      
      // Check if we've fetched all available records
      if (response.opportunitiesData.length < limit || allOpportunities.length >= response.totalRecords) {
        hasMore = false
      } else {
        offset += limit
      }
      
      // Safety limit: don't fetch more than 10,000 records in a single run
      if (allOpportunities.length >= 10000) {
        console.warn(`[Ingest] Reached safety limit of 10,000 records, stopping pagination`)
        hasMore = false
      }
    } catch (error) {
      console.error(`[Ingest] Error fetching opportunities at offset ${offset}:`, error)
      // If we have some results, continue with what we have
      if (allOpportunities.length > 0) {
        console.warn(`[Ingest] Continuing with ${allOpportunities.length} opportunities despite error`)
        hasMore = false
      } else {
        throw error
      }
    }
  }
  
  console.log(`[Ingest] Fetched ${allOpportunities.length} raw opportunities`)
  return allOpportunities
}

/**
 * Score all opportunities that passed hard filters
 */
function scoreOpportunities(opportunities: SamGovOpportunity[]): ScoredOpportunity[] {
  console.log(`[Scoring] Scoring ${opportunities.length} opportunities`)
  
  const scored: ScoredOpportunity[] = []
  let aboveThreshold = 0
  let belowThreshold = 0
  
  for (const opportunity of opportunities) {
    const scoringResult: ScoringResult = scoreOpportunity(opportunity)
    
    scored.push({
      opportunity,
      score: scoringResult.score,
      breakdown: scoringResult.breakdown,
      passed: scoringResult.passed,
    })
    
    if (scoringResult.passed) {
      aboveThreshold++
    } else {
      belowThreshold++
    }
  }
  
  console.log(`[Scoring] ${aboveThreshold} opportunities scored ≥ ${MIN_SCORE_THRESHOLD} (${belowThreshold} below threshold)`)
  
  return scored
}

/**
 * Main ingestion function
 * Orchestrates the complete pipeline: ingest → filter → score → shortlist
 */
export async function ingestOpportunities(): Promise<IngestionResult> {
  const batchId = generateBatchId()
  const startTime = Date.now()
  
  console.log(`[Ingest] Starting ingestion batch: ${batchId}`)
  
  try {
    // Stage 1: Raw Ingest
    const rawOpportunities = await ingestRawOpportunities()
    
    if (rawOpportunities.length === 0) {
      return {
        success: true,
        batchId,
        ingested: 0,
        filtered: 0,
        shortlisted: 0,
        scoredOpportunities: [],
        discarded: [],
        stats: {
          batchId,
          ingestedAt: new Date(),
          totalFetched: 0,
          totalPassedFilters: 0,
          totalScored: 0,
          totalShortlisted: 0,
          filterStats: {
            psc: 0,
            naics: 0,
            title: 0,
          },
        },
      }
    }
    
    // Stage 2: Hard Filters
    const filterResult: HardFilterResult = applyHardFilters(rawOpportunities)
    
    console.log(`[Hard Filters] ${filterResult.stats.passed} opportunities passed filters`)
    console.log(`  Discarded:`)
    console.log(`    - NAICS gate: ${filterResult.stats.discarded.naics}`)
    console.log(`    - PSC gate: ${filterResult.stats.discarded.psc}`)
    console.log(`    - Title gate: ${filterResult.stats.discarded.title}`)
    console.log(`  Total discarded: ${filterResult.stats.total - filterResult.stats.passed}`)
    
    // Stage 3: Scoring
    const scoredOpportunities = scoreOpportunities(filterResult.passed)
    
    // Stage 4: Shortlist (score ≥ threshold)
    const shortlisted = scoredOpportunities.filter(so => so.passed)
    
    console.log(`[Admin Pane] ${shortlisted.length} opportunities shortlisted (score ≥ ${MIN_SCORE_THRESHOLD})`)
    
    const duration = Date.now() - startTime
    console.log(`[Ingest] Ingestion completed in ${duration}ms`)
    
    return {
      success: true,
      batchId,
      ingested: rawOpportunities.length,
      filtered: filterResult.stats.passed,
      shortlisted: shortlisted.length,
      scoredOpportunities,
      discarded: filterResult.discarded,
      stats: {
        batchId,
        ingestedAt: new Date(),
        totalFetched: rawOpportunities.length,
        totalPassedFilters: filterResult.stats.passed,
        totalScored: scoredOpportunities.length,
        totalShortlisted: shortlisted.length,
        filterStats: filterResult.stats.discarded,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Ingest] Ingestion failed:`, error)
    
    return {
      success: false,
      batchId,
      ingested: 0,
      filtered: 0,
      shortlisted: 0,
      scoredOpportunities: [],
      discarded: [],
      stats: {
        batchId,
        ingestedAt: new Date(),
        totalFetched: 0,
        totalPassedFilters: 0,
        totalScored: 0,
        totalShortlisted: 0,
        filterStats: {
          psc: 0,
          naics: 0,
          title: 0,
        },
      },
      error: errorMessage,
    }
  }
}

