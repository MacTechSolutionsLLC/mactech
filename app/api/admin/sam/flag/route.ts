/**
 * POST /api/admin/sam/flag
 * Flag or unflag an opportunity by noticeId
 */

import { NextRequest, NextResponse } from 'next/server'
import { setFlagged } from '@/lib/store/opportunityStore'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noticeId, flagged, flaggedBy } = body
    
    if (!noticeId || typeof flagged !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'noticeId and flagged (boolean) are required',
        },
        { status: 400 }
      )
    }
    
    await setFlagged(noticeId, flagged, flaggedBy)
    
    return NextResponse.json({
      success: true,
      message: `Opportunity ${noticeId} ${flagged ? 'flagged' : 'unflagged'}`,
    })
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

