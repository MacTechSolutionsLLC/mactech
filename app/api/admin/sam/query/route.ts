/**
 * POST /api/admin/sam/query
 * Run a single SAM.gov query independently
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildQuery } from '@/lib/sam/samQueries'
import { paginateQuery } from '@/lib/sam/samPaginator'
import { deduplicateOpportunities } from '@/lib/ingestion/dedupe'
import { normalizeOpportunity } from '@/lib/sam/samNormalizer'
import { applyHardFilters } from '@/lib/filters/hardFilters'
import { scoreOpportunity } from '@/lib/scoring/scoreOpportunity'
import { SourceQuery, AIAnalysisResult } from '@/lib/sam/samTypes'
import { SamGovOpportunity } from '@/lib/sam-gov-api-v2'
import { MIN_SCORE_THRESHOLD } from '@/lib/scoring/scoringConstants'
import { storeNormalizedOpportunities } from '@/lib/store/opportunityStore'
import { analyzeOpportunitiesBatch } from '@/lib/ai/analyzeOpportunity'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { queryId, params } = body

    if (!queryId || !['A', 'B', 'C', 'D', 'E'].includes(queryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid queryId. Must be A, B, C, D, or E' },
        { status: 400 }
      )
    }

    if (!params || !params.postedFrom || !params.postedTo) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: postedFrom, postedTo' },
        { status: 400 }
      )
    }

    console.log(`[Query API] Running Query ${queryId} with params:`, params)

    // Build query function
    const buildQueryFn = (offset: number) => {
      const searchParams = new URLSearchParams()
      
      if (params.ptype) {
        searchParams.append('ptype', params.ptype)
      }
      // Correct parameter name: naics (not ncode)
      if (params.naics) {
        searchParams.append('naics', params.naics)
      }
      if (params.typeOfSetAside) {
        searchParams.append('typeOfSetAside', params.typeOfSetAside)
      }
      if (params.keywords) {
        searchParams.append('keywords', params.keywords)
      }
      
      searchParams.append('postedFrom', params.postedFrom)
      searchParams.append('postedTo', params.postedTo)
      searchParams.append('limit', String(params.limit || 1000))
      searchParams.append('offset', String(offset))
      
      return searchParams
    }

    // Execute query with pagination
    const opportunities = await paginateQuery(
      buildQueryFn,
      queryId as SourceQuery,
      params.limit || 1000
    )

    console.log(`[Query API] Query ${queryId} fetched ${opportunities.length} opportunities`)

    if (opportunities.length === 0) {
      return NextResponse.json({
        success: true,
        queryId,
        fetched: 0,
        deduplicated: 0,
        passedFilters: 0,
        scoredAbove50: 0,
      })
    }

    // Simple deduplication of raw opportunities by noticeId
    const rawDeduplicatedMap = new Map<string, SamGovOpportunity>()
    for (const opp of opportunities) {
      if (opp.noticeId && !rawDeduplicatedMap.has(opp.noticeId)) {
        rawDeduplicatedMap.set(opp.noticeId, opp)
      }
    }
    const rawDeduplicated = Array.from(rawDeduplicatedMap.values())
    console.log(`[Query API] Query ${queryId} deduplicated to ${rawDeduplicated.length}`)

    // Normalize
    const batchId = `query-${queryId}-${Date.now()}`
    const ingestRunId = `run-${Date.now()}`
    const normalized = rawDeduplicated.map(opp => 
      normalizeOpportunity(opp, queryId as SourceQuery, batchId, ingestRunId)
    )

    // Apply hard filters (only needs raw opportunities)
    const filterResult = applyHardFilters(rawDeduplicated)
    const passedRaw = filterResult.passed
    
    // Map filtered raw opportunities back to normalized
    const passedNormalized = normalized.filter(norm => 
      passedRaw.some(raw => raw.noticeId === norm.noticeId)
    )

    console.log(`[Query API] Query ${queryId} passed filters: ${passedNormalized.length}`)

    // Score
    const scored: Array<{
      normalized: any
      score: number
      aiAnalysis: AIAnalysisResult | null
    }> = passedNormalized.map(normalized => {
      const rawOpp = passedRaw.find(raw => raw.noticeId === normalized.noticeId)
      if (!rawOpp) {
        return { normalized, score: 0, aiAnalysis: null }
      }
      
      const scoringResult = scoreOpportunity(rawOpp)
      normalized.rawScore = scoringResult.score
      
      if (scoringResult.score >= 70) {
        normalized.relevanceTier = 'high'
      } else if (scoringResult.score >= 40) {
        normalized.relevanceTier = 'medium'
      } else {
        normalized.relevanceTier = 'low'
      }
      
      return { normalized, score: scoringResult.score, aiAnalysis: null }
    })

    const scoredAbove50 = scored.filter(item => item.score >= MIN_SCORE_THRESHOLD).length

    // AI Analysis (non-blocking)
    console.log(`[Query API] Running AI analysis for ${passedNormalized.length} opportunities`)
    const aiAnalysisMap = await analyzeOpportunitiesBatch(passedNormalized)
    
    // Attach AI analysis to scored opportunities
    for (const item of scored) {
      const analysis = aiAnalysisMap.get(item.normalized.noticeId)
      if (analysis) {
        item.aiAnalysis = analysis
        item.normalized.aiTags = [
          ...analysis.capabilityMatch,
          analysis.recommendedAction,
        ]
      }
    }

    // Store in database
    console.log(`[Query API] Storing ${scored.length} opportunities in database`)
    const { created, updated } = await storeNormalizedOpportunities(scored, batchId)
    console.log(`[Query API] Stored: ${created} created, ${updated} updated`)

    return NextResponse.json({
      success: true,
      queryId,
      fetched: opportunities.length,
      deduplicated: rawDeduplicated.length,
      passedFilters: passedNormalized.length,
      scoredAbove50,
      stored: {
        created,
        updated,
      },
    })
  } catch (error) {
    console.error('[Query API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

