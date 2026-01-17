/**
 * POST /api/admin/capture/opportunities/[id]/flag
 * Flag or unflag an opportunity
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    const body = await request.json().catch(() => ({}))
    const { flagged = true, notes } = body

    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id },
    })

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    await prisma.governmentContractDiscovery.update({
      where: { id },
      data: {
        flagged,
        flagged_at: flagged ? new Date() : null,
        flagged_by: flagged ? 'system' : null,
        capture_status: flagged ? 'flagged' : 'monitoring',
      },
    })

    return NextResponse.json({
      success: true,
      flagged,
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

