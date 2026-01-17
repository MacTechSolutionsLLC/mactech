/**
 * POST /api/admin/capture/opportunities/[id]/analyze
 * Generate AI summary on-demand for any opportunity
 * Includes USAspending enrichment if not already done
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeOpportunity } from '@/lib/ai/analyzeOpportunity'
import { enrichOpportunity } from '@/lib/services/award-enrichment'
import { normalizeOpportunity } from '@/lib/sam/samNormalizer'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)
    
    // Get the opportunity
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id },
    })

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Check if we need to enrich with USAspending data first
    let enrichmentDone = false
    if (!opportunity.usaspending_enrichment || opportunity.usaspending_enrichment_status !== 'completed') {
      console.log(`[API] Enriching opportunity ${id} with USAspending data`)
      
      try {
        const enrichment = await enrichOpportunity(id, {
          limit: 10,
          useDatabase: true,
          createLinks: true,
        })

        if (enrichment) {
          await prisma.governmentContractDiscovery.update({
            where: { id },
            data: {
              usaspending_enrichment: JSON.stringify(enrichment),
              usaspending_enriched_at: new Date(),
              usaspending_enrichment_status: 'completed',
            },
          })
          enrichmentDone = true
        }
      } catch (enrichError) {
        console.error(`[API] Error enriching opportunity:`, enrichError)
        // Continue with analysis even if enrichment fails
      }
    } else {
      enrichmentDone = true
    }

    // Normalize the opportunity for AI analysis
    // We need to reconstruct the raw payload from stored data
    const rawPayload = opportunity.raw_payload
      ? JSON.parse(opportunity.raw_payload)
      : {
          title: opportunity.title,
          description: opportunity.description,
          noticeId: opportunity.notice_id,
          agency: opportunity.agency,
          naicsCode: JSON.parse(opportunity.naics_codes || '[]')[0],
          typeOfSetAside: JSON.parse(opportunity.set_aside || '[]')[0],
          postedDate: opportunity.created_at?.toISOString(),
          responseDeadLine: opportunity.deadline,
        }

    const normalized = normalizeOpportunity(
      rawPayload,
      'A', // Default source query
      opportunity.ingestion_batch_id || 'manual',
      'manual'
    )

    // Generate AI analysis
    console.log(`[API] Generating AI analysis for opportunity ${id}`)
    const analysis = await analyzeOpportunity(normalized, true)

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI analysis failed. Check OpenAI configuration.',
        },
        { status: 500 }
      )
    }

    // Store the analysis
    await prisma.governmentContractDiscovery.update({
      where: { id },
      data: {
        aiAnalysis: JSON.stringify(analysis),
        aiSummary: analysis.relevanceSummary,
        aiAnalysisGeneratedAt: new Date(),
        ...(analysis.relevanceScore !== undefined && {
          relevance_score: Math.round(analysis.relevanceScore),
        }),
        competitive_landscape_summary: analysis.competitiveLandscape
          ? JSON.stringify(analysis.competitiveLandscape)
          : null,
      },
    })

    return NextResponse.json({
      success: true,
      analysis,
      enrichmentDone,
      dataSources: analysis.dataSources || ['SAM.gov'],
    })
  } catch (error) {
    console.error('[API] Error generating AI analysis:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

