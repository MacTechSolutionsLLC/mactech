import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Dismiss a contract (mark as not relevant)
 * POST /api/admin/contract-discovery/[id]/dismiss
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id
    const body = await request.json().catch(() => ({}))
    const dismissedBy = body.dismissedBy || 'admin'
    const reason = body.reason || null

    // Update contract status
    const contract = await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        dismissed: true,
        dismissed_at: new Date(),
        dismissed_by: dismissedBy,
        dismissal_reason: reason,
        ingestion_status: 'ignored',
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        dismissed: contract.dismissed,
        dismissed_at: contract.dismissed_at,
      },
    })
  } catch (error) {
    console.error('Error dismissing contract:', error)
    return NextResponse.json(
      {
        error: 'Failed to dismiss contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

