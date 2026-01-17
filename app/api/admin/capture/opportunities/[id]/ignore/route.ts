/**
 * POST /api/admin/capture/opportunities/[id]/ignore
 * Ignore an opportunity
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
    const { reason } = body

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
        ignored: true,
        capture_status: 'ignored',
        dismissal_reason: reason || 'User dismissed',
      },
    })

    return NextResponse.json({
      success: true,
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

