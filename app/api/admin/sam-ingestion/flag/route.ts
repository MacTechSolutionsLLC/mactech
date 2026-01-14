/**
 * POST /api/admin/sam-ingestion/flag
 * Flags an opportunity for follow-up
 */

import { NextRequest, NextResponse } from 'next/server'
import { flagOpportunity, unflagOpportunity } from '@/lib/store/opportunityStore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noticeId, flagged } = body
    
    if (!noticeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'noticeId is required',
        },
        { status: 400 }
      )
    }
    
    if (flagged === false) {
      await unflagOpportunity(noticeId)
      return NextResponse.json({
        success: true,
        message: `Opportunity ${noticeId} has been unflagged`,
      })
    } else {
      await flagOpportunity(noticeId, 'admin')
      return NextResponse.json({
        success: true,
        message: `Opportunity ${noticeId} has been flagged`,
      })
    }
  } catch (error) {
    console.error('[API] Error flagging opportunity:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

