/**
 * POST /api/admin/sam/ingest
 * Triggers the SAM.gov ingestion pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { ingestSamOpportunities } from '@/lib/ingestion/ingestSamOpportunities'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting SAM.gov ingestion')
    
    // Run ingestion pipeline
    const result = await ingestSamOpportunities()
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Ingestion failed',
          batchId: result.batchId,
        },
        { status: 500 }
      )
    }
    
    console.log(`[API] Ingestion complete: ${result.fetched} fetched, ${result.deduplicated} deduplicated, ${result.passedFilters} passed filters, ${result.scoredAbove50} scored ≥ 50`)
    
    return NextResponse.json({
      success: true,
      fetched: result.fetched,
      deduplicated: result.deduplicated,
      passedFilters: result.passedFilters,
      scoredAbove50: result.scoredAbove50,
      batchId: result.batchId,
      batch: result.batch,
    })
  } catch (error) {
    console.error('[API] Ingestion error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

