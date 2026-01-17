/**
 * POST /api/admin/capture/ingest
 * Manual "Run Ingest" endpoint for the capture dashboard
 * Includes status tracking, outage detection, and progress monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { ingestSamOpportunities } from '@/lib/ingestion/ingestSamOpportunities'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Get current ingestion status
 */
export async function GET() {
  try {
    const status = await prisma.ingestionStatus.findFirst({
      orderBy: { updated_at: 'desc' },
    })

    if (!status) {
      return NextResponse.json({
        success: true,
        status: 'idle',
        message: 'No ingestion runs yet',
      })
    }

    return NextResponse.json({
      success: true,
      status: status.status,
      batchId: status.batch_id,
      samGovOutage: status.sam_gov_outage,
      outageReason: status.sam_gov_outage_reason,
      outageDetectedAt: status.sam_gov_outage_detected_at,
      outageResolvedAt: status.sam_gov_outage_resolved_at,
      lastRunStartedAt: status.last_run_started_at,
      lastRunCompletedAt: status.last_run_completed_at,
      lastRunDurationMs: status.last_run_duration_ms,
      lastFetched: status.last_fetched,
      lastDeduplicated: status.last_deduplicated,
      lastPassedFilters: status.last_passed_filters,
      lastScoredAbove50: status.last_scored_above_50,
      lastError: status.last_error,
      errorCount: status.error_count,
      retryCount: status.retry_count,
      nextRetryAt: status.next_retry_at,
    })
  } catch (error) {
    console.error('[API] Error getting ingestion status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Trigger manual ingestion
 */
export async function POST(request: NextRequest) {
  try {
    // Check current status
    const currentStatus = await prisma.ingestionStatus.findFirst({
      orderBy: { updated_at: 'desc' },
    })

    // Don't allow concurrent runs
    if (currentStatus?.status === 'running') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingestion is already running',
          status: 'running',
        },
        { status: 409 }
      )
    }

    // Check for active outage
    if (currentStatus?.sam_gov_outage && currentStatus.status === 'outage') {
      return NextResponse.json(
        {
          success: false,
          error: 'SAM.gov API is currently unavailable',
          status: 'outage',
          outageReason: currentStatus.sam_gov_outage_reason,
          outageDetectedAt: currentStatus.sam_gov_outage_detected_at,
        },
        { status: 503 }
      )
    }

    console.log('[API] Starting manual SAM.gov ingestion')

    // Run ingestion pipeline (this is async and will update status)
    // We'll return immediately and let the ingestion run in the background
    // In production, you might want to use a job queue
    
    // For now, we'll run it synchronously but this could be moved to a background job
    const result = await ingestSamOpportunities()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Ingestion failed',
          batchId: result.batchId,
          status: result.error?.includes('outage') ? 'outage' : 'failed',
        },
        { status: 500 }
      )
    }

    console.log(
      `[API] Ingestion complete: ${result.fetched} fetched, ` +
      `${result.deduplicated} deduplicated, ${result.passedFilters} passed filters, ` +
      `${result.scoredAbove50} scored ≥ 50`
    )

    return NextResponse.json({
      success: true,
      fetched: result.fetched,
      deduplicated: result.deduplicated,
      passedFilters: result.passedFilters,
      scoredAbove50: result.scoredAbove50,
      batchId: result.batchId,
      batch: result.batch,
      status: 'completed',
    })
  } catch (error) {
    console.error('[API] Ingestion error:', error)
    
    // Check if it's an outage
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isOutage = errorMessage.includes('outage') || errorMessage.includes('SUSPENDED')

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        status: isOutage ? 'outage' : 'failed',
      },
      { status: 500 }
    )
  }
}

