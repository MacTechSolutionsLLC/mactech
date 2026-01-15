/**
 * SAM.gov Ingestion Orchestrator
 * Orchestrates the complete ingestion pipeline:
 * 1. Execute all 5 queries (A-E) with full pagination
 * 2. Deduplicate by noticeId
 * 3. Normalize all opportunities
 * 4. Apply hard filters
 * 5. Score all filtered opportunities
 * 6. AI analyze opportunities that passed filters (async, non-blocking)
 * 7. Store in database
 * 8. Return summary stats
 */

import { paginateQuery } from '../sam/samPaginator'
import { buildQuery } from '../sam/samQueries'
import { deduplicateOpportunities } from './dedupe'
import { normalizeOpportunity } from '../sam/samNormalizer'
import { applyHardFilters } from '../filters/hardFilters'
import { scoreOpportunity } from '../scoring/scoreOpportunity'
import { analyzeOpportunitiesBatch } from '../ai/analyzeOpportunity'
import { storeNormalizedOpportunities } from '../store/opportunityStore'
import { MIN_SCORE_THRESHOLD } from '../scoring/scoringConstants'
import { NormalizedOpportunity, IngestionResult, IngestionBatch, SourceQuery as SourceQueryType, AIAnalysisResult } from '../sam/samTypes'
import { SamGovOpportunity } from '../sam-gov-api-v2'

/**
 * Generate batch ID for this ingestion run
 */
function generateBatchId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate ingest run ID
 */
function generateIngestRunId(): string {
  return `run-${Date.now()}`
}

/**
 * Get date range for queries (365 days back)
 */
function getDateRange(): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  })
  
  const fromDate = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
  const from = fromDate.toLocaleDateString('en-US', { 
    month: '2-digit', 
    day: '2-digit', 
    year: 'numeric' 
  })
  
  return { from, to }
}

/**
 * Execute all 5 queries with full pagination
 */
async function executeAllQueries(): Promise<Map<SourceQueryType, SamGovOpportunity[]>> {
  const { from, to } = getDateRange()
  const results = new Map<SourceQueryType, SamGovOpportunity[]>()
  
  const queries: SourceQueryType[] = ['A', 'B', 'C', 'D', 'E']
  
  for (const sourceQuery of queries) {
    try {
      console.log(`[Ingest] Starting Query ${sourceQuery}`)
      
      const buildQueryFn = (offset: number) => {
        return buildQuery(sourceQuery, from, to, 50, offset)
      }
      
      const opportunities = await paginateQuery(buildQueryFn, sourceQuery, 50)
      results.set(sourceQuery, opportunities)
      
      console.log(`[Ingest] Query ${sourceQuery} fetched ${opportunities.length} opportunities`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`[Ingest] Query ${sourceQuery} failed:`, errorMessage)
      // Continue with other queries even if one fails
      results.set(sourceQuery, [])
    }
  }
  
  return results
}

/**
 * Main ingestion function
 */
export async function ingestSamOpportunities(): Promise<IngestionResult> {
  const batchId = generateBatchId()
  const ingestRunId = generateIngestRunId()
  const startTime = Date.now()
  
  console.log(`[Ingest] Starting ingestion batch: ${batchId}`)
  
  try {
    // Stage 1: Execute all 5 queries with full pagination
    console.log(`[Ingest] Stage 1: Executing all queries`)
    const queryResults = await executeAllQueries()
    
    // Combine all results
    const allRawOpportunities: SamGovOpportunity[] = []
    const queryStats: Record<SourceQueryType, number> = {
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    }
    
    for (const [sourceQuery, opportunities] of queryResults.entries()) {
      allRawOpportunities.push(...opportunities)
      queryStats[sourceQuery] = opportunities.length
      console.log(`[Ingest] Query ${sourceQuery} fetched ${opportunities.length}`)
    }
    
    const totalFetched = allRawOpportunities.length
    console.log(`[Ingest] Total fetched: ${totalFetched}`)
    
    if (totalFetched === 0) {
      return {
        success: true,
        batchId,
        fetched: 0,
        deduplicated: 0,
        passedFilters: 0,
        scoredAbove50: 0,
        batch: {
          batchId,
          ingestedAt: new Date(),
          totalFetched: 0,
          totalDeduplicated: 0,
          totalPassedFilters: 0,
          totalScored: 0,
          totalScoredAbove50: 0,
          queryStats,
        },
      }
    }
    
    // Stage 2: Build source query map before deduplication
    const sourceQueryMap = new Map<string, SourceQueryType[]>()
    for (const [sourceQuery, opportunities] of queryResults.entries()) {
      for (const opp of opportunities) {
        if (opp.noticeId) {
          const existing = sourceQueryMap.get(opp.noticeId) || []
          if (!existing.includes(sourceQuery)) {
            existing.push(sourceQuery)
          }
          sourceQueryMap.set(opp.noticeId, existing)
        }
      }
    }
    
    // Deduplicate by noticeId (simple deduplication of raw opportunities)
    console.log(`[Ingest] Stage 2: Deduplicating`)
    const seenNoticeIds = new Map<string, SamGovOpportunity>()
    for (const opp of allRawOpportunities) {
      if (opp.noticeId && !seenNoticeIds.has(opp.noticeId)) {
        seenNoticeIds.set(opp.noticeId, opp)
      }
    }
    const deduplicatedRaw = Array.from(seenNoticeIds.values())
    const deduplicatedCount = deduplicatedRaw.length
    console.log(
      `[Dedup] Reduced ${totalFetched} to ${deduplicatedCount} unique notices ` +
      `(${totalFetched - deduplicatedCount} duplicates removed)`
    )
    
    // Stage 3: Normalize all opportunities
    console.log(`[Ingest] Stage 3: Normalizing`)
    const normalizedOpportunities: NormalizedOpportunity[] = []
    
    // Normalize each deduplicated opportunity
    for (const rawOpp of deduplicatedRaw) {
      const sourceQueries = sourceQueryMap.get(rawOpp.noticeId || '') || ['A'] // Default to A if not found
      const normalized = normalizeOpportunity(
        rawOpp,
        sourceQueries[0], // Use first source query as primary
        batchId,
        ingestRunId
      )
      // Merge source queries
      normalized.sourceQueries = sourceQueries
      normalizedOpportunities.push(normalized)
    }
    
    console.log(`[Ingest] Normalized ${normalizedOpportunities.length} opportunities`)
    
    // Stage 4: Apply hard filters
    console.log(`[Ingest] Stage 4: Applying hard filters`)
    const filterResult = applyHardFilters(deduplicatedRaw)
    const passedRaw = filterResult.passed
    
    // Map filtered raw opportunities back to normalized
    const passedNormalized = normalizedOpportunities.filter(norm => 
      passedRaw.some(raw => raw.noticeId === norm.noticeId)
    )
    
    console.log(`[Filter] ${filterResult.stats.passed} opportunities passed filters`)
    console.log(`  Discarded:`)
    console.log(`    - NAICS gate: ${filterResult.stats.discarded.naics}`)
    console.log(`    - PSC gate: ${filterResult.stats.discarded.psc}`)
    console.log(`    - Title gate: ${filterResult.stats.discarded.title}`)
    
    // Stage 5: Score all filtered opportunities
    console.log(`[Ingest] Stage 5: Scoring`)
    const scoredOpportunities: Array<{
      normalized: NormalizedOpportunity
      score: number
      aiAnalysis: AIAnalysisResult | null
    }> = passedNormalized.map(normalized => {
      // Find corresponding raw opportunity for scoring
      const rawOpp = passedRaw.find(raw => raw.noticeId === normalized.noticeId)
      if (!rawOpp) {
        // Shouldn't happen, but handle gracefully
        return { normalized, score: 0, aiAnalysis: null }
      }
      
      const scoringResult = scoreOpportunity(rawOpp)
      normalized.rawScore = scoringResult.score
      
      // Determine relevance tier
      if (scoringResult.score >= 70) {
        normalized.relevanceTier = 'high'
      } else if (scoringResult.score >= 40) {
        normalized.relevanceTier = 'medium'
      } else {
        normalized.relevanceTier = 'low'
      }
      
      return {
        normalized,
        score: scoringResult.score,
        aiAnalysis: null as AIAnalysisResult | null, // Will be populated in next stage
      }
    })
    
    const scoredAbove50 = scoredOpportunities.filter(item => item.score >= MIN_SCORE_THRESHOLD).length
    console.log(`[Score] ${scoredAbove50} opportunities scored ≥ ${MIN_SCORE_THRESHOLD}`)
    
    // Stage 6: AI analyze opportunities that passed filters (async, non-blocking)
    console.log(`[Ingest] Stage 6: AI analysis (non-blocking)`)
    const aiAnalysisMap = await analyzeOpportunitiesBatch(passedNormalized)
    
    // Attach AI analysis to scored opportunities
    for (const item of scoredOpportunities) {
      const analysis = aiAnalysisMap.get(item.normalized.noticeId)
      if (analysis) {
        item.aiAnalysis = analysis
        // Extract tags from AI analysis
        item.normalized.aiTags = [
          ...analysis.capabilityMatch,
          analysis.recommendedAction,
        ]
      }
    }
    
    // Stage 7: Store in database
    console.log(`[Ingest] Stage 7: Storing in database`)
    const { created, updated } = await storeNormalizedOpportunities(scoredOpportunities, batchId)
    console.log(`[Ingest] Stored: ${created} created, ${updated} updated`)
    
    const duration = Date.now() - startTime
    console.log(`[Ingest] Ingestion completed in ${duration}ms`)
    
    return {
      success: true,
      batchId,
      fetched: totalFetched,
      deduplicated: normalizedOpportunities.length,
      passedFilters: filterResult.stats.passed,
      scoredAbove50,
      batch: {
        batchId,
        ingestedAt: new Date(),
        totalFetched,
        totalDeduplicated: normalizedOpportunities.length,
        totalPassedFilters: filterResult.stats.passed,
        totalScored: scoredOpportunities.length,
        totalScoredAbove50: scoredAbove50,
        queryStats,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[Ingest] Ingestion failed:`, error)
    
    return {
      success: false,
      batchId,
      fetched: 0,
      deduplicated: 0,
      passedFilters: 0,
      scoredAbove50: 0,
      error: errorMessage,
      batch: {
        batchId,
        ingestedAt: new Date(),
        totalFetched: 0,
        totalDeduplicated: 0,
        totalPassedFilters: 0,
        totalScored: 0,
        totalScoredAbove50: 0,
        queryStats: {
          A: 0,
          B: 0,
          C: 0,
          D: 0,
          E: 0,
        },
      },
    }
  }
}

