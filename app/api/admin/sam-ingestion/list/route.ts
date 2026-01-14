/**
 * GET /api/admin/sam-ingestion/list
 * Returns shortlisted opportunities (score ≥ 50, not ignored)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllIgnored } from '@/lib/store/ignoredOpportunities'
import { MIN_SCORE_THRESHOLD } from '@/lib/scoring/scoringConstants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minScore = parseInt(searchParams.get('minScore') || String(MIN_SCORE_THRESHOLD), 10)
    const limit = parseInt(searchParams.get('limit') || '100', 10)
    const sort = searchParams.get('sort') || 'score'
    
    // Get ignored noticeIds
    const ignoredSet = await getAllIgnored()
    
    // Query opportunities
    const opportunities = await prisma.governmentContractDiscovery.findMany({
      where: {
        ingestion_source: 'sam-ingestion',
        relevance_score: {
          gte: minScore,
        },
        notice_id: {
          notIn: Array.from(ignoredSet),
        },
      },
      orderBy: sort === 'score' 
        ? { relevance_score: 'desc' }
        : { created_at: 'desc' },
      take: limit,
    })
    
    // Calculate days remaining for each opportunity
    const opportunitiesWithDaysRemaining = opportunities.map(opp => {
      let daysRemaining: number | null = null
      
      if (opp.deadline) {
        try {
          const deadlineDate = new Date(opp.deadline)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          deadlineDate.setHours(0, 0, 0, 0)
          
          const diffTime = deadlineDate.getTime() - today.getTime()
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        } catch {
          // Invalid date format
        }
      }
      
      return {
        id: opp.id,
        title: opp.title,
        agency: opp.agency,
        naicsCodes: JSON.parse(opp.naics_codes || '[]'),
        setAside: JSON.parse(opp.set_aside || '[]'),
        daysRemaining,
        score: opp.relevance_score,
        url: opp.url,
        noticeId: opp.notice_id,
        solicitationNumber: opp.solicitation_number,
        deadline: opp.deadline,
        flagged: opp.flagged,
        flaggedAt: opp.flagged_at?.toISOString() || null,
        createdAt: opp.created_at.toISOString(),
      }
    })
    
    return NextResponse.json({
      success: true,
      opportunities: opportunitiesWithDaysRemaining,
      count: opportunitiesWithDaysRemaining.length,
      minScore,
    })
  } catch (error) {
    console.error('[API] Error listing opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

