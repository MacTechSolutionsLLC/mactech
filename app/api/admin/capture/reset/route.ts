/**
 * POST /api/admin/capture/reset
 * Reset database for fresh ingestion with 3-tier API enrichment
 * 
 * This endpoint:
 * 1. Resets IngestionStatus to 'idle' (kills stuck running status)
 * 2. Deletes all contracts from GovernmentContractDiscovery
 * 3. Deletes all OpportunityAwardLink records
 * 4. Deletes all IgnoredOpportunity records
 * 5. Preserves UsaSpendingAward records (historical data)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting database reset...')

    // Step 1: Reset IngestionStatus to 'idle' (kill stuck running status)
    console.log('[API] Resetting ingestion status...')
    const statusResult = await prisma.ingestionStatus.updateMany({
      data: {
        status: 'idle',
        sam_gov_outage: false,
        sam_gov_outage_reason: null,
        sam_gov_outage_detected_at: null,
        sam_gov_outage_resolved_at: null,
        last_error: null,
      },
    })
    console.log(`[API] Reset ${statusResult.count} ingestion status record(s)`)

    // Step 2: Delete OpportunityAwardLink records (cascades automatically, but explicit for clarity)
    console.log('[API] Deleting opportunity-award links...')
    const linksResult = await prisma.opportunityAwardLink.deleteMany({})
    console.log(`[API] Deleted ${linksResult.count} opportunity-award link(s)`)

    // Step 3: Delete IgnoredOpportunity records
    console.log('[API] Deleting ignored opportunities...')
    const ignoredResult = await prisma.ignoredOpportunity.deleteMany({})
    console.log(`[API] Deleted ${ignoredResult.count} ignored opportunity record(s)`)

    // Step 4: Delete all GovernmentContractDiscovery records
    console.log('[API] Deleting all contracts...')
    const contractsResult = await prisma.governmentContractDiscovery.deleteMany({})
    console.log(`[API] Deleted ${contractsResult.count} contract record(s)`)

    // Step 5: Verify UsaSpendingAward records are preserved
    const awardsCount = await prisma.usaSpendingAward.count()
    console.log(`[API] Preserved ${awardsCount} USAspending award record(s)`)

    console.log('[API] Database reset complete!')

    return NextResponse.json({
      success: true,
      message: 'Database reset complete',
      statistics: {
        ingestionStatusReset: statusResult.count,
        contractsDeleted: contractsResult.count,
        linksDeleted: linksResult.count,
        ignoredDeleted: ignoredResult.count,
        awardsPreserved: awardsCount,
      },
    })
  } catch (error) {
    console.error('[API] Error resetting database:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

