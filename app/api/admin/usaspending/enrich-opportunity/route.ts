import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichOpportunity } from '@/lib/services/award-enrichment'

export const dynamic = 'force-dynamic'

interface EnrichRequestBody {
  opportunity_id: string // GovernmentContractDiscovery ID
  limit?: number
  use_database?: boolean
}

/**
 * Enrich opportunity with USAspending data and Entity API
 * This uses the proper enrichOpportunity function that includes Entity API enrichment
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequestBody = await request.json()
    const { opportunity_id, limit = 10, use_database = false } = body

    // Get the opportunity from database
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunity_id },
    })

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Use the proper enrichment function that includes Entity API
    const enrichment = await enrichOpportunity(opportunity_id, {
      limit,
      useDatabase: use_database,
      createLinks: true,
    })

    if (!enrichment) {
      return NextResponse.json(
        { success: false, error: 'Failed to enrich opportunity' },
        { status: 500 }
      )
    }

    // Store enrichment result in database
    await prisma.governmentContractDiscovery.update({
      where: { id: opportunity_id },
      data: {
        usaspending_enrichment: JSON.stringify(enrichment),
        usaspending_enriched_at: new Date(),
        usaspending_enrichment_status: 'completed',
      },
    })

    return NextResponse.json({
      success: true,
      opportunity_id,
      enrichment: {
        similar_awards: enrichment.similar_awards,
        statistics: enrichment.statistics,
      },
    })
  } catch (error) {
    console.error('[USAspending Enrich] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

