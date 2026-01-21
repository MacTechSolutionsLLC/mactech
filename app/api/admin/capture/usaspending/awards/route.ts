/**
 * GET /api/admin/capture/usaspending/awards
 * 
 * Get USAspending awards with filters and sorting by relevance_score.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minScore = parseFloat(searchParams.get('minScore') || '0')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = {
      enrichment_status: 'completed',
      relevance_score: { gte: minScore },
    }

    const awards = await prisma.usaSpendingAward.findMany({
      where,
      orderBy: {
        relevance_score: 'desc',
      },
      take: limit,
      select: {
        id: true,
        human_award_id: true,
        generated_internal_id: true,
        description: true,
        awarding_agency_name: true,
        total_obligation: true,
        start_date: true,
        end_date: true,
        relevance_score: true,
        signals: true,
        naics_code: true,
        recipient_name: true,
        transaction_count: true,
        subaward_count: true,
      },
    })

    // Parse signals JSON
    const awardsWithParsedSignals = awards.map(award => ({
      ...award,
      signals: award.signals ? JSON.parse(award.signals) : [],
    }))

    return NextResponse.json({
      success: true,
      awards: awardsWithParsedSignals,
      total: awardsWithParsedSignals.length,
    })
  } catch (error) {
    console.error('[API] Error getting awards:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
