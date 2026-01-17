/**
 * POST /api/admin/capture/test-queries
 * Test endpoint to diagnose query duplication issue
 * 
 * Fetches a small sample from each query (A-E) and compares results
 * to identify why A, B, and E are returning the same count (7140)
 */

import { NextRequest, NextResponse } from 'next/server'
import { buildQuery } from '@/lib/sam/samQueries'
import { executeSamGovQuery } from '@/lib/sam/samClient'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { from, to } = {
      from: '01/01/2025',
      to: '12/31/2025',
    }
    
    const results: Record<string, any> = {}
    const queryIds: Array<'A' | 'B' | 'C' | 'D' | 'E'> = ['A', 'B', 'C', 'D', 'E']
    
    // Fetch first page (limit 10) from each query
    for (const queryId of queryIds) {
      try {
        const params = buildQuery(queryId, from, to, 10, 0)
        const response = await executeSamGovQuery(params)
        
        // Extract sample noticeIds
        const noticeIds = response.opportunitiesData
          .slice(0, 5)
          .map((opp: any) => opp.noticeId || opp.notice_id)
          .filter(Boolean)
        
        results[queryId] = {
          totalRecords: response.totalRecords,
          fetched: response.opportunitiesData.length,
          sampleNoticeIds: noticeIds,
          queryParams: Object.fromEntries(params.entries()),
          sampleTitles: response.opportunitiesData
            .slice(0, 3)
            .map((opp: any) => opp.title || opp.opportunityTitle)
            .filter(Boolean),
        }
      } catch (error) {
        results[queryId] = {
          error: error instanceof Error ? error.message : String(error),
        }
      }
    }
    
    // Analyze for duplicates
    const allNoticeIds = new Set<string>()
    const duplicates: Record<string, string[]> = {}
    
    for (const [queryId, data] of Object.entries(results)) {
      if (data.sampleNoticeIds) {
        for (const noticeId of data.sampleNoticeIds) {
          if (allNoticeIds.has(noticeId)) {
            if (!duplicates[noticeId]) {
              duplicates[noticeId] = []
            }
            duplicates[noticeId].push(queryId)
          } else {
            allNoticeIds.add(noticeId)
          }
        }
      }
    }
    
    // Check if queries are returning same totalRecords
    const totalRecords = Object.values(results)
      .map((r: any) => r.totalRecords)
      .filter((v): v is number => typeof v === 'number')
    
    const allSameTotal = totalRecords.length > 0 && 
      totalRecords.every((v) => v === totalRecords[0])
    
    return NextResponse.json({
      success: true,
      analysis: {
        queries: results,
        duplicateNoticeIds: duplicates,
        totalRecordsAnalysis: {
          values: totalRecords,
          allSame: allSameTotal,
          uniqueValues: [...new Set(totalRecords)],
        },
        diagnosis: allSameTotal
          ? '⚠️  All queries returning same totalRecords - filters may not be working correctly'
          : '✅ Queries returning different totalRecords - filters appear to be working',
      },
      recommendations: allSameTotal
        ? [
            'Check if SAM.gov API is applying filters correctly',
            'Verify query parameter names match API documentation',
            'Consider that totalRecords might reflect base query (date + ptype) not filtered results',
            'Check actual fetched results for differences (not just totalRecords)',
          ]
        : [
            'Queries appear to be working correctly',
            'If actual results are duplicates, check deduplication logic',
          ],
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

