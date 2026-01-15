/**
 * POST /api/admin/sam/ignore
 * Ignore an opportunity by noticeId
 */

import { NextRequest, NextResponse } from 'next/server'
import { ignoreOpportunity } from '@/lib/store/ignoredOpportunities'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noticeId, reason, ignoredBy } = body
    
    if (!noticeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'noticeId is required',
        },
        { status: 400 }
      )
    }
    
    await ignoreOpportunity(noticeId, reason, ignoredBy)
    
    return NextResponse.json({
      success: true,
      message: `Opportunity ${noticeId} ignored`,
    })
  } catch (error) {
    console.error('[API] Error ignoring opportunity:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

