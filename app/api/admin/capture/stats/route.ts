/**
 * GET /api/admin/capture/stats
 * Get dashboard statistics
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [total, flagged, highPriority, ignored] = await Promise.all([
      prisma.governmentContractDiscovery.count({
        where: {
          dismissed: false,
        },
      }),
      prisma.governmentContractDiscovery.count({
        where: {
          flagged: true,
          dismissed: false,
        },
      }),
      prisma.governmentContractDiscovery.count({
        where: {
          relevance_score: { gte: 70 },
          dismissed: false,
        },
      }),
      prisma.governmentContractDiscovery.count({
        where: {
          ignored: true,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        total,
        flagged,
        highPriority,
        ignored,
      },
    })
  } catch (error) {
    console.error('[API] Error getting stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

