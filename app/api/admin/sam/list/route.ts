/**
 * GET /api/admin/sam/list
 * List opportunities with filtering, sorting, and pagination
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
    const sort = searchParams.get('sort') || 'score' // 'score' | 'deadline' | 'date'
    const naicsFilter = searchParams.get('naics') // Comma-separated NAICS codes
    const setAsideFilter = searchParams.get('setAside') // Comma-separated set-aside codes
    const showLowScore = searchParams.get('showLowScore') === 'true'
    
    // Get ignored noticeIds
    const ignoredSet = await getAllIgnored()
    
    // Build where clause
    const where: any = {
      ingestion_source: 'sam-ingestion',
      notice_id: {
        notIn: Array.from(ignoredSet),
      },
    }
    
    // Score filter
    if (!showLowScore) {
      where.relevance_score = {
        gte: minScore,
      }
    }
    
    // NAICS filter - check if any of the filtered NAICS codes are in the opportunity's NAICS codes
    if (naicsFilter) {
      const naicsCodes = naicsFilter.split(',').map(c => c.trim()).filter(c => c)
      if (naicsCodes.length > 0) {
        // Use OR to match any of the selected NAICS codes
        const naicsConditions = naicsCodes.map(code => ({
          naics_codes: {
            contains: code,
          },
        }))
        
        if (naicsConditions.length === 1) {
          where.naics_codes = naicsConditions[0].naics_codes
        } else {
          // Wrap existing conditions in AND, add NAICS OR
          const baseConditions: any = {
            ingestion_source: 'sam-ingestion',
            notice_id: {
              notIn: Array.from(ignoredSet),
            },
          }
          
          if (!showLowScore) {
            baseConditions.relevance_score = {
              gte: minScore,
            }
          }
          
          where.AND = [
            baseConditions,
            { OR: naicsConditions },
          ]
        }
      }
    }
    
    // Set-aside filter
    if (setAsideFilter) {
      const setAsides = setAsideFilter.split(',').map(s => s.trim()).filter(s => s)
      if (setAsides.length > 0) {
        const setAsideConditions = setAsides.map(setAside => ({
          set_aside: {
            contains: setAside,
          },
        }))
        
        if (setAsideConditions.length === 1) {
          where.set_aside = setAsideConditions[0].set_aside
        } else {
          // Add to existing AND or create new structure
          if (where.AND) {
            where.AND.push({ OR: setAsideConditions })
          } else if (where.OR) {
            // Convert existing structure
            const baseConditions: any = {
              ingestion_source: 'sam-ingestion',
              notice_id: {
                notIn: Array.from(ignoredSet),
              },
            }
            
            if (!showLowScore) {
              baseConditions.relevance_score = {
                gte: minScore,
              }
            }
            
            where.AND = [
              baseConditions,
              { OR: where.OR },
              { OR: setAsideConditions },
            ]
            delete where.OR
          } else {
            where.OR = setAsideConditions
          }
        }
      }
    }
    
    // Build orderBy
    let orderBy: any = {}
    if (sort === 'score') {
      orderBy = { relevance_score: 'desc' }
    } else if (sort === 'deadline') {
      orderBy = { deadline: 'asc' }
    } else if (sort === 'date') {
      orderBy = { created_at: 'desc' }
    } else {
      orderBy = { relevance_score: 'desc' }
    }
    
    // Query opportunities
    const opportunities = await prisma.governmentContractDiscovery.findMany({
      where,
      orderBy,
      take: limit,
    })
    
    // Calculate days remaining and parse fields
    const opportunitiesWithDetails = opportunities.map(opp => {
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
      
      // Parse AI analysis if available
      let aiAnalysis = null
      if (opp.aiAnalysis) {
        try {
          aiAnalysis = JSON.parse(opp.aiAnalysis)
        } catch {
          // Invalid JSON
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
        postedDate: opp.created_at.toISOString(), // Use created_at as posted date proxy
        aiAnalysis,
        sourceQueries: JSON.parse(opp.source_queries || '[]'),
      }
    })
    
    return NextResponse.json({
      success: true,
      opportunities: opportunitiesWithDetails,
      count: opportunitiesWithDetails.length,
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

