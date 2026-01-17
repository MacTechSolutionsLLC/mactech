/**
 * GET /api/admin/capture/opportunities
 * Get opportunities with filters and sorting
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minScore = parseInt(searchParams.get('minScore') || '0')
    const sortBy = searchParams.get('sortBy') || 'score'
    const agency = searchParams.get('agency')
    const naics = searchParams.get('naics')
    const setAside = searchParams.get('setAside')
    const status = searchParams.get('status') || 'all'

    const where: any = {
      dismissed: false,
      relevance_score: { gte: minScore },
    }

    if (agency) {
      where.agency = { contains: agency, mode: 'insensitive' }
    }

    if (naics) {
      where.naics_codes = { contains: naics }
    }

    if (setAside) {
      where.set_aside = { contains: setAside }
    }

    if (status === 'flagged') {
      where.flagged = true
    } else if (status === 'ignored') {
      where.ignored = true
    } else if (status === 'pursuing') {
      where.capture_status = 'pursuing'
    }

    const orderBy: any = {}
    if (sortBy === 'score') {
      orderBy.relevance_score = 'desc'
    } else if (sortBy === 'deadline') {
      orderBy.deadline = 'asc'
    } else {
      orderBy.created_at = 'desc'
    }

    const opportunities = await prisma.governmentContractDiscovery.findMany({
      where,
      orderBy,
      take: 100,
      select: {
        id: true,
        notice_id: true,
        title: true,
        agency: true,
        relevance_score: true,
        deadline: true,
        aiSummary: true,
        flagged: true,
        ignored: true,
        capture_status: true,
        naics_codes: true,
        set_aside: true,
      },
    })

    return NextResponse.json({
      success: true,
      opportunities,
    })
  } catch (error) {
    console.error('[API] Error getting opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

