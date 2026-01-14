/**
 * GET /api/admin/sam-ingestion/export
 * Exports shortlisted opportunities as CSV or JSON
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllIgnored } from '@/lib/store/ignoredOpportunities'
import { MIN_SCORE_THRESHOLD } from '@/lib/scoring/scoringConstants'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'
    const minScore = parseInt(searchParams.get('minScore') || String(MIN_SCORE_THRESHOLD), 10)
    
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
      orderBy: { relevance_score: 'desc' },
    })
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Title',
        'Agency',
        'NAICS',
        'Set-Aside',
        'Score',
        'Days Remaining',
        'URL',
        'Notice ID',
        'Deadline',
        'Flagged',
      ]
      
      const rows = opportunities.map(opp => {
        const naicsCodes = JSON.parse(opp.naics_codes || '[]')
        const setAside = JSON.parse(opp.set_aside || '[]')
        
        let daysRemaining = ''
        if (opp.deadline) {
          try {
            const deadlineDate = new Date(opp.deadline)
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            deadlineDate.setHours(0, 0, 0, 0)
            
            const diffTime = deadlineDate.getTime() - today.getTime()
            const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            daysRemaining = String(days)
          } catch {
            // Invalid date
          }
        }
        
        return [
          `"${(opp.title || '').replace(/"/g, '""')}"`,
          `"${(opp.agency || '').replace(/"/g, '""')}"`,
          `"${naicsCodes.join(', ')}"`,
          `"${setAside.join(', ')}"`,
          String(opp.relevance_score),
          daysRemaining,
          `"${opp.url}"`,
          `"${opp.notice_id || ''}"`,
          `"${opp.deadline || ''}"`,
          opp.flagged ? 'Yes' : 'No',
        ].join(',')
      })
      
      const csv = [headers.join(','), ...rows].join('\n')
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="sam-opportunities-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } else {
      // Return JSON
      const opportunitiesData = opportunities.map(opp => {
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
            // Invalid date
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
          createdAt: opp.created_at.toISOString(),
        }
      })
      
      return NextResponse.json({
        success: true,
        opportunities: opportunitiesData,
        count: opportunitiesData.length,
        exportedAt: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error('[API] Error exporting opportunities:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

