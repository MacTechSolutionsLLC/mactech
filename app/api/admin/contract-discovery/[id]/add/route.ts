import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Add contract to verified list (mark as verified/approved)
 * POST /api/admin/contract-discovery/[id]/add
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id
    const body = await request.json().catch(() => ({}))
    const verifiedBy = body.verifiedBy || 'admin'

    // Update contract status
    const contract = await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        verified: true,
        verified_at: new Date(),
        verified_by: verifiedBy,
        ingestion_status: 'verified',
        dismissed: false, // Clear dismissal if it was dismissed
        dismissed_at: null,
        dismissed_by: null,
        dismissal_reason: null,
        updated_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        verified: contract.verified,
        verified_at: contract.verified_at,
      },
    })
  } catch (error) {
    console.error('Error adding contract:', error)
    return NextResponse.json(
      {
        error: 'Failed to add contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

