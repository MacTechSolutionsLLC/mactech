/**
 * GET /api/admin/capture/opportunities
 * Get opportunities with filters and sorting
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateSmartSortScoresBatch, OpportunityWithEnrichment } from '@/lib/ai/smartSort'

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
    }
    // Note: capture_status filter removed until migration is applied
    // else if (status === 'pursuing') {
    //   where.capture_status = 'pursuing'
    // }

    const orderBy: any = {}
    if (sortBy === 'score') {
      orderBy.relevance_score = 'desc'
    } else if (sortBy === 'deadline') {
      // Enhanced deadline sort: consider parsed deadline data and urgency
      orderBy.deadline = 'asc'
    } else if (sortBy === 'smart') {
      // Smart sort: use smart_sort_score if available, otherwise calculate on-demand
      orderBy.smart_sort_score = 'desc'
    } else {
      orderBy.created_at = 'desc'
    }

    let opportunities = await prisma.governmentContractDiscovery.findMany({
      where,
      orderBy: sortBy === 'smart' ? { relevance_score: 'desc' } : orderBy, // Fetch by relevance first, then apply smart sort
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
        naics_codes: true,
        set_aside: true,
        // Explicit information fields
        points_of_contact: true,
        description: true,
        url: true,
        solicitation_number: true,
        created_at: true, // Posted date
        deadline: true,
        period_of_performance: true,
        place_of_performance: true,
        estimated_value: true,
        resource_links: true, // All links and attachments
        // Enriched data fields
        scraped: true,
        scraped_at: true,
        scraped_text_content: true,
        aiParsedData: true,
        aiParsedAt: true,
        usaspending_enrichment: true,
        usaspending_enriched_at: true,
        usaspending_enrichment_status: true,
        incumbent_vendors: true,
        competitive_landscape_summary: true,
        requirements: true,
        sow_attachment_url: true,
        sow_attachment_type: true,
        smart_sort_score: true,
        smart_sort_reasoning: true,
      },
    })

    // Apply smart sort if requested
    if (sortBy === 'smart') {
      // Check if opportunities have cached smart sort scores
      const hasCachedScores = opportunities.some(opp => opp.smart_sort_score !== null)
      
      if (!hasCachedScores || opportunities.length < 50) {
        // Calculate smart sort scores for opportunities without cached scores
        const opportunitiesToScore = opportunities.filter(
          opp => opp.smart_sort_score === null
        ) as OpportunityWithEnrichment[]
        
        if (opportunitiesToScore.length > 0) {
          const smartSortResults = await calculateSmartSortScoresBatch(opportunitiesToScore)
          
          // Update opportunities with calculated scores
          opportunities = opportunities.map(opp => {
            const result = smartSortResults.get(opp.id)
            if (result) {
              return {
                ...opp,
                smart_sort_score: result.smartScore,
                smart_sort_reasoning: result.reasoning,
              }
            }
            return opp
          })
        }
      }
      
      // Sort by smart sort score (cached or calculated)
      opportunities.sort((a, b) => {
        const scoreA = a.smart_sort_score ?? a.relevance_score
        const scoreB = b.smart_sort_score ?? b.relevance_score
        return scoreB - scoreA
      })
    }

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

