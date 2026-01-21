/**
 * POST /api/admin/capture/link-awards
 * 
 * AI-assisted linking between GovernmentContractDiscovery (bids) and UsaSpendingAward (historical awards).
 * Only creates links when ≥2 criteria match and confidence ≥ 0.7.
 */

import { NextRequest, NextResponse } from 'next/server'
import { linkAwardsToBids, linkBidToAwards } from '@/lib/services/award-linking.service'

export const dynamic = 'force-dynamic'

interface LinkAwardsRequestBody {
  bidId?: string // If provided, only link this specific bid
}

export async function POST(request: NextRequest) {
  try {
    const body: LinkAwardsRequestBody = await request.json().catch(() => ({}))

    if (body.bidId) {
      // Link specific bid
      const result = await linkBidToAwards(body.bidId)
      return NextResponse.json({
        success: true,
        linksCreated: result.linksCreated,
        links: result.links,
      })
    } else {
      // Link all active bids
      const result = await linkAwardsToBids()
      return NextResponse.json({
        success: true,
        linksCreated: result.linksCreated,
        links: result.links,
        errors: result.errors.length > 0 ? result.errors : undefined,
      })
    }
  } catch (error) {
    console.error('[Link Awards API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
