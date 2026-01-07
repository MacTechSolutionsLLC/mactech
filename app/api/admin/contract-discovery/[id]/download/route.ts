import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Mark contract discovery result as downloaded
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add admin authentication check

    const { id } = await params

    const updated = await prisma.governmentContractDiscovery.update({
      where: { id },
      data: {
        downloaded: true,
        downloaded_at: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      result: updated,
    })
  } catch (error) {
    console.error('Error marking as downloaded:', error)
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

