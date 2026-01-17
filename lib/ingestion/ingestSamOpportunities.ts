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
import { prisma } from '../prisma'
import { isSamGovOutage } from '../sam/samClient'
import { enrichOpportunity } from '../services/award-enrichment'

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
 * Get date range for queries
 * Default: Full year 2025 (01/01/2025 to 12/31/2025) per exact specification
 */
function getDateRange(): { from: string; to: string } {
  // Default to full year 2025 per exact specification
  return {
    from: '01/01/2025',
    to: '12/31/2025',
  }
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
        return buildQuery(sourceQuery, from, to, 100, offset)
      }
      
      const opportunities = await paginateQuery(buildQueryFn, sourceQuery, 100)
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
 * Update ingestion status in database
 */
async function updateIngestionStatus(
  status: 'running' | 'completed' | 'paused' | 'failed' | 'outage',
  options: {
    batchId?: string
    samGovOutage?: boolean
    outageReason?: string
    error?: string
    metrics?: {
      fetched?: number
      deduplicated?: number
      passedFilters?: number
      scoredAbove50?: number
    }
  } = {}
): Promise<void> {
  try {
    // Get or create status record
    let statusRecord = await prisma.ingestionStatus.findFirst()
    
    const updateData: any = {
      status,
      batch_id: options.batchId,
      updated_at: new Date(),
    }

    if (options.samGovOutage !== undefined) {
      updateData.sam_gov_outage = options.samGovOutage
      if (options.samGovOutage) {
        updateData.sam_gov_outage_detected_at = new Date()
        updateData.sam_gov_outage_reason = options.outageReason
      } else {
        updateData.sam_gov_outage_resolved_at = new Date()
      }
    }

    if (status === 'running') {
      updateData.last_run_started_at = new Date()
    }

    if (status === 'completed' || status === 'failed') {
      updateData.last_run_completed_at = new Date()
      if (options.metrics) {
        updateData.last_fetched = options.metrics.fetched || 0
        updateData.last_deduplicated = options.metrics.deduplicated || 0
        updateData.last_passed_filters = options.metrics.passedFilters || 0
        updateData.last_scored_above_50 = options.metrics.scoredAbove50 || 0
      }
    }

    if (status === 'failed') {
      updateData.last_error = options.error
      updateData.error_count = { increment: 1 }
    }

    if (status === 'completed') {
      const startTime = statusRecord?.last_run_started_at?.getTime()
      if (startTime) {
        updateData.last_run_duration_ms = Date.now() - startTime
      }
    }

    if (statusRecord) {
      await prisma.ingestionStatus.update({
        where: { id: statusRecord.id },
        data: updateData,
      })
    } else {
      await prisma.ingestionStatus.create({
        data: {
          ...updateData,
          status,
          batch_id: options.batchId,
        },
      })
    }
  } catch (error) {
    console.error('[Ingest] Error updating status:', error)
    // Don't throw - status tracking is non-blocking
  }
}

/**
 * Main ingestion function
 */
export async function ingestSamOpportunities(): Promise<IngestionResult> {
  const batchId = generateBatchId()
  const ingestRunId = generateIngestRunId()
  const startTime = Date.now()
  
  console.log(`[Ingest] Starting ingestion batch: ${batchId}`)
  
  // Update status to running
  await updateIngestionStatus('running', { batchId })
  
  try {
    // Stage 1: Execute all 5 queries with full pagination
    console.log(`[Ingest] Stage 1: Executing all queries`)
    let queryResults: Map<SourceQueryType, SamGovOpportunity[]>
    
    try {
      queryResults = await executeAllQueries()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check for outage
      if (isSamGovOutage(errorMessage)) {
        console.warn(`[Ingest] SAM.gov outage detected: ${errorMessage}`)
        await updateIngestionStatus('outage', {
          batchId,
          samGovOutage: true,
          outageReason: errorMessage,
        })
        throw new Error(`SAM.gov API outage: ${errorMessage}`)
      }
      
      // Other errors - mark as failed
      await updateIngestionStatus('failed', {
        batchId,
        error: errorMessage,
      })
      throw error
    }
    
    // Clear outage status if we got here
    await updateIngestionStatus('running', {
      batchId,
      samGovOutage: false,
    })
    
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
    
    // Stage 8: Automatic USAspending enrichment for high-scoring opportunities (score ≥ 70)
    console.log(`[Ingest] Stage 8: Auto-enriching high-scoring opportunities (score ≥ 70)`)
    const highScoringOpportunities = scoredOpportunities.filter(item => item.score >= 70)
    let enrichedCount = 0
    
    for (const item of highScoringOpportunities) {
      try {
        // Find the stored opportunity record
        const opportunity = await prisma.governmentContractDiscovery.findFirst({
          where: { notice_id: item.normalized.noticeId },
        })
        
        if (opportunity && !opportunity.usaspending_enrichment) {
          try {
            const enrichment = await enrichOpportunity(opportunity.id, {
              limit: 10,
              useDatabase: false, // Call USAspending API directly for turnkey solution
              createLinks: true,
            })
            
            if (enrichment) {
              // Store enrichment result
              await prisma.governmentContractDiscovery.update({
                where: { id: opportunity.id },
                data: {
                  usaspending_enrichment: JSON.stringify(enrichment),
                  usaspending_enriched_at: new Date(),
                  usaspending_enrichment_status: 'completed',
                },
              })
              enrichedCount++
            }
          } catch (enrichError) {
            console.error(`[Ingest] Error enriching opportunity ${item.normalized.noticeId}:`, enrichError)
            // Continue with next opportunity
          }
        }
      } catch (error) {
        console.error(`[Ingest] Error processing enrichment for opportunity:`, error)
        // Continue with next opportunity
      }
    }
    
    console.log(`[Ingest] Auto-enriched ${enrichedCount} high-scoring opportunities`)
    
    const duration = Date.now() - startTime
    console.log(`[Ingest] Ingestion completed in ${duration}ms`)
    
    // Update status to completed
    await updateIngestionStatus('completed', {
      batchId,
      metrics: {
        fetched: totalFetched,
        deduplicated: normalizedOpportunities.length,
        passedFilters: filterResult.stats.passed,
        scoredAbove50,
      },
    })
    
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
    
    // Check if it's an outage
    const isOutage = isSamGovOutage(errorMessage)
    
    // Update status
    await updateIngestionStatus(isOutage ? 'outage' : 'failed', {
      batchId,
      samGovOutage: isOutage,
      outageReason: isOutage ? errorMessage : undefined,
      error: errorMessage,
    })
    
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

