/**
 * GET /api/admin/capture/incumbents
 * Get incumbent intelligence data
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const agency = searchParams.get('agency')
    const naics = searchParams.get('naics')
    const minAmount = searchParams.get('minAmount')

    const where: any = {}

    if (agency) {
      where.awarding_agency_name = { contains: agency, mode: 'insensitive' }
    }

    if (naics) {
      where.naics_code = naics
    }

    if (minAmount) {
      where.total_obligation = { gte: parseFloat(minAmount) }
    }

    const awards = await prisma.usaSpendingAward.findMany({
      where,
      orderBy: { total_obligation: 'desc' },
      take: 100,
      select: {
        id: true,
        recipient_name: true,
        awarding_agency_name: true,
        total_obligation: true,
        naics_code: true,
        awarding_date: true,
      },
    })

    return NextResponse.json({
      success: true,
      awards,
    })
  } catch (error) {
    console.error('[API] Error getting incumbents:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

