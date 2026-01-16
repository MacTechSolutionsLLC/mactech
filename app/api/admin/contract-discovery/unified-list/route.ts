import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllIgnored } from '@/lib/store/ignoredOpportunities'
import { MIN_SCORE_THRESHOLD } from '@/lib/scoring/scoringConstants'

export const dynamic = 'force-dynamic'

/**
 * Safely parse JSON with fallback
 */
function safeJsonParse(jsonString: string | null | undefined, fallback: any = []): any {
  if (!jsonString || jsonString.trim() === '') {
    return fallback
  }
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.warn('Failed to parse JSON:', { jsonString, error })
    return fallback
  }
}

/**
 * Unified list endpoint that returns opportunities from both sources
 * GET /api/admin/contract-discovery/unified-list
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Contract discovery filters
    const status = searchParams.get('status') // discovered, verified, ignored
    const scraped = searchParams.get('scraped') // true, false
    const dismissed = searchParams.get('dismissed') // true, false
    
    // SAM dashboard filters
    const minScore = parseInt(searchParams.get('minScore') || String(MIN_SCORE_THRESHOLD), 10)
    const sort = searchParams.get('sort') || 'score' // 'score' | 'deadline' | 'date'
    const naicsFilter = searchParams.get('naics') // Comma-separated NAICS codes
    const setAsideFilter = searchParams.get('setAside') // Comma-separated set-aside codes
    const showLowScore = searchParams.get('showLowScore') === 'true'
    const sourceFilter = searchParams.get('source') // 'sam-ingestion', 'discovery', or 'all' (default)
    
    const limit = parseInt(searchParams.get('limit') || '200', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    
    // Get ignored noticeIds
    const ignoredSet = await getAllIgnored()
    
    // Build where clause
    const where: any = {
      notice_id: {
        notIn: Array.from(ignoredSet),
      },
    }
    
    // Source filter
    if (sourceFilter === 'sam-ingestion') {
      where.ingestion_source = 'sam-ingestion'
    } else if (sourceFilter === 'discovery') {
      where.ingestion_source = {
        not: 'sam-ingestion',
      }
    }
    // If 'all' or not specified, don't filter by source
    
    // Contract discovery status filters
    if (status) {
      where.ingestion_status = status
    }
    
    if (scraped === 'true') {
      where.scraped = true
    } else if (scraped === 'false') {
      where.scraped = false
    }
    
    if (dismissed === 'true') {
      where.dismissed = true
    } else if (dismissed === 'false') {
      where.dismissed = false
    }
    
    // Score filter (for SAM ingestion opportunities)
    if (!showLowScore) {
      where.relevance_score = {
        gte: minScore,
      }
    }
    
    // NAICS filter
    if (naicsFilter) {
      const naicsCodes = naicsFilter.split(',').map(c => c.trim()).filter(c => c)
      if (naicsCodes.length > 0) {
        const naicsConditions = naicsCodes.map(code => ({
          naics_codes: {
            contains: code,
          },
        }))
        
        if (naicsConditions.length === 1) {
          where.naics_codes = naicsConditions[0].naics_codes
        } else {
          const baseConditions = { ...where }
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
          if (where.AND) {
            where.AND.push({ OR: setAsideConditions })
          } else {
            const baseConditions = { ...where }
            where.AND = [
              baseConditions,
              { OR: setAsideConditions },
            ]
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
      skip: offset,
    })
    
    // Parse and enrich opportunities
    const enrichedOpportunities = opportunities.map(opp => {
      // Calculate days remaining
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
      
      // Parse AI analysis
      let aiAnalysis = null
      if (opp.aiAnalysis) {
        try {
          aiAnalysis = JSON.parse(opp.aiAnalysis)
        } catch {
          // Invalid JSON
        }
      }
      
      // Parse points of contact
      let pointsOfContact: any[] = []
      if (opp.points_of_contact) {
        try {
          pointsOfContact = JSON.parse(opp.points_of_contact)
        } catch {
          // Invalid JSON
        }
      }
      
      return {
        id: opp.id,
        title: opp.title,
        url: opp.url,
        notice_id: opp.notice_id,
        solicitation_number: opp.solicitation_number,
        agency: opp.agency,
        naics_codes: safeJsonParse(opp.naics_codes, []),
        set_aside: safeJsonParse(opp.set_aside, []),
        detected_keywords: safeJsonParse(opp.detected_keywords, []),
        relevance_score: opp.relevance_score,
        detected_service_category: opp.service_category,
        ingestion_status: opp.ingestion_status,
        ingestion_source: opp.ingestion_source,
        verified: opp.verified,
        verified_at: opp.verified_at?.toISOString() || null,
        scraped: opp.scraped,
        scraped_at: opp.scraped_at?.toISOString() || null,
        sow_attachment_url: opp.sow_attachment_url,
        sow_attachment_type: opp.sow_attachment_type,
        sow_scraped: opp.sow_scraped,
        sow_scraped_at: opp.sow_scraped_at?.toISOString() || null,
        analysis_summary: opp.analysis_summary,
        analysis_confidence: opp.analysis_confidence,
        dismissed: opp.dismissed,
        dismissed_at: opp.dismissed_at?.toISOString() || null,
        created_at: opp.created_at.toISOString(),
        updated_at: opp.updated_at.toISOString(),
        deadline: opp.deadline,
        daysRemaining,
        description: opp.description,
        estimated_value: opp.estimated_value,
        period_of_performance: opp.period_of_performance,
        place_of_performance: opp.place_of_performance,
        points_of_contact: pointsOfContact,
        aiAnalysis,
        aiSummary: opp.aiSummary,
        aiKeyRequirements: safeJsonParse(opp.aiKeyRequirements, []),
        flagged: opp.flagged,
        flagged_at: opp.flagged_at?.toISOString() || null,
        source_queries: safeJsonParse(opp.source_queries, []),
      }
    })
    
    // Get total count
    const total = await prisma.governmentContractDiscovery.count({ where })
    
    return NextResponse.json({
      success: true,
      opportunities: enrichedOpportunities,
      contracts: enrichedOpportunities, // Alias for backward compatibility
      total,
      count: enrichedOpportunities.length,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[API] Error listing unified opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

