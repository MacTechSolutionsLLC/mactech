import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchAwards, UsaSpendingFilters } from '@/lib/usaspending-api'

export const dynamic = 'force-dynamic'

interface EnrichRequestBody {
  opportunity_id: string // GovernmentContractDiscovery ID
  naics_codes?: string[]
  psc_codes?: string[]
  agency?: string
  limit?: number
}

/**
 * Find similar historical awards for a SAM.gov opportunity
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequestBody = await request.json()
    const { opportunity_id, naics_codes, psc_codes, agency, limit = 10 } = body

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

    // Build filters based on opportunity
    const filters: UsaSpendingFilters = {
      award_type_codes: ['A', 'B', 'C', 'D', 'IDV'], // Contracts and IDVs
    }

    // Use provided NAICS codes or parse from opportunity
    if (naics_codes && naics_codes.length > 0) {
      filters.naics_codes = naics_codes.map(code => ({ code }))
    } else {
      try {
        const oppNaics = JSON.parse(opportunity.naics_codes || '[]')
        if (Array.isArray(oppNaics) && oppNaics.length > 0) {
          filters.naics_codes = oppNaics.map((code: string) => ({ code }))
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Use provided PSC codes or try to extract from opportunity
    if (psc_codes && psc_codes.length > 0) {
      filters.psc_codes = psc_codes.map(code => ({ code }))
    }

    // Use provided agency or extract from opportunity
    if (agency) {
      filters.agencies = [{ toptier_agency_id: agency }]
    } else if (opportunity.agency) {
      // Try to match agency name (this is approximate)
      // In a real implementation, you'd want an agency name to ID mapping
      filters.agencies = [{ name: opportunity.agency }]
    }

    // Search for similar awards
    const response = await searchAwards({
      filters,
      limit,
      sort: 'total_obligation',
      order: 'desc',
    })

    const similarAwards = response.results || []

    // Calculate statistics
    const obligations = similarAwards
      .map(a => a.total_obligation)
      .filter((v): v is number => v !== undefined && v !== null)
    
    const avgObligation = obligations.length > 0
      ? obligations.reduce((a, b) => a + b, 0) / obligations.length
      : null
    
    const minObligation = obligations.length > 0 ? Math.min(...obligations) : null
    const maxObligation = obligations.length > 0 ? Math.max(...obligations) : null

    // Get unique recipients
    const recipients = new Set(
      similarAwards
        .map(a => a.recipient?.name)
        .filter((v): v is string => v !== undefined && v !== null)
    )

    // Get unique agencies
    const agencies = new Set(
      similarAwards
        .map(a => a.awarding_agency?.name || a.awarding_agency?.toptier_agency?.name)
        .filter((v): v is string => v !== undefined && v !== null)
    )

    return NextResponse.json({
      success: true,
      opportunity_id,
      similar_awards: similarAwards,
      statistics: {
        count: similarAwards.length,
        average_obligation: avgObligation,
        min_obligation: minObligation,
        max_obligation: maxObligation,
        unique_recipients: Array.from(recipients),
        unique_agencies: Array.from(agencies),
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

