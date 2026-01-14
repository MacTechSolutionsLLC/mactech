/**
 * POST /api/admin/sam-ingestion/ingest
 * Triggers the SAM.gov ingestion pipeline
 */

import { NextRequest, NextResponse } from 'next/server'
import { ingestOpportunities } from '@/lib/sam-ingestion/ingest'
import { storeOpportunities } from '@/lib/store/opportunityStore'
import { getAllIgnored } from '@/lib/store/ignoredOpportunities'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting SAM.gov ingestion')
    
    // Run ingestion pipeline
    const result = await ingestOpportunities()
    
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
    
    // Filter out ignored opportunities before storing
    const ignoredSet = await getAllIgnored()
    const shortlisted = result.scoredOpportunities.filter(
      so => !so.opportunity.noticeId || !ignoredSet.has(so.opportunity.noticeId)
    )
    
    // Store shortlisted opportunities
    const { created, updated } = await storeOpportunities(shortlisted, result.batchId)
    
    console.log(`[API] Ingestion complete: ${shortlisted.length} shortlisted, ${created} created, ${updated} updated`)
    
    return NextResponse.json({
      success: true,
      batchId: result.batchId,
      ingested: result.ingested,
      filtered: result.filtered,
      shortlisted: shortlisted.length,
      stored: {
        created,
        updated,
      },
      stats: result.stats,
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

