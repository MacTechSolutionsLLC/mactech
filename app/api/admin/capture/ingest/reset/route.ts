/**
 * POST /api/admin/capture/ingest/reset
 * Reset stuck ingestion status (for admin use when ingestion is stuck)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Find current status
    const currentStatus = await prisma.ingestionStatus.findFirst({
      orderBy: { updated_at: 'desc' },
    })

    if (!currentStatus) {
      return NextResponse.json({
        success: true,
        message: 'No status to reset',
      })
    }

    // Only reset if status is 'running' (stuck)
    if (currentStatus.status === 'running') {
      await prisma.ingestionStatus.update({
        where: { id: currentStatus.id },
        data: {
          status: 'idle',
          updated_at: new Date(),
        },
      })

      console.log('[API] Reset stuck ingestion status to idle')
      return NextResponse.json({
        success: true,
        message: 'Ingestion status reset to idle',
      })
    }

    return NextResponse.json({
      success: true,
      message: `Status is ${currentStatus.status}, no reset needed`,
    })
  } catch (error) {
    console.error('[API] Error resetting ingestion status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

