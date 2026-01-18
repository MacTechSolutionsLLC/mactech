import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { searchAwards, UsaSpendingFilters } from '@/lib/usaspending-api'

export const dynamic = 'force-dynamic'

interface SearchRequestBody {
  naics_codes?: string[]
  psc_codes?: string[]
  agencies?: string[]
  award_types?: string[]
  recipient_search?: string
  start_date?: string // YYYY-MM-DD
  end_date?: string // YYYY-MM-DD
  min_amount?: number
  max_amount?: number
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  use_database?: boolean // If true, search database; if false, search API directly
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequestBody = await request.json()

    const {
      naics_codes,
      psc_codes,
      agencies,
      award_types,
      recipient_search,
      start_date,
      end_date,
      min_amount,
      max_amount,
      page = 1,
      limit = 50,
      sort = 'awarding_date',
      order = 'desc',
      use_database = false,
    } = body

    // Build filters
    const filters: UsaSpendingFilters = {}

    if (naics_codes && naics_codes.length > 0) {
      // USAspending API expects naics_codes as array of strings, not objects
      filters.naics_codes = naics_codes as any
    }

    if (psc_codes && psc_codes.length > 0) {
      // USAspending API expects psc_codes as array of strings, not objects
      filters.psc_codes = psc_codes as any
    }

    if (agencies && agencies.length > 0) {
      filters.agencies = agencies.map(agencyId => ({
        toptier_agency_id: agencyId,
      }))
    }

    if (award_types && award_types.length > 0) {
      filters.award_type_codes = award_types as any[]
    }

    if (recipient_search) {
      filters.recipient_search_text = recipient_search
    }

    if (start_date || end_date) {
      filters.time_period = [{
        start_date: start_date,
        end_date: end_date,
        date_type: 'action_date',
      }]
    }

    if (min_amount !== undefined || max_amount !== undefined) {
      filters.award_amounts = [{
        lower_bound: min_amount,
        upper_bound: max_amount,
      }]
    }

    if (use_database) {
      // Search database
      const where: any = {}

      if (naics_codes && naics_codes.length > 0) {
        where.naics_code = { in: naics_codes }
      }

      if (psc_codes && psc_codes.length > 0) {
        where.psc_code = { in: psc_codes }
      }

      if (agencies && agencies.length > 0) {
        where.OR = [
          { awarding_agency_id: { in: agencies } },
          { funding_agency_id: { in: agencies } },
        ]
      }

      if (award_types && award_types.length > 0) {
        where.award_type = { in: award_types }
      }

      if (recipient_search) {
        where.OR = [
          ...(where.OR || []),
          { recipient_name: { contains: recipient_search, mode: 'insensitive' } },
          { recipient_uei: { contains: recipient_search, mode: 'insensitive' } },
          { recipient_duns: { contains: recipient_search, mode: 'insensitive' } },
        ]
      }

      if (start_date || end_date) {
        where.OR = [
          ...(where.OR || []),
          {
            awarding_date: {
              ...(start_date ? { gte: new Date(start_date) } : {}),
              ...(end_date ? { lte: new Date(end_date) } : {}),
            },
          },
        ]
      }

      if (min_amount !== undefined || max_amount !== undefined) {
        where.total_obligation = {
          ...(min_amount !== undefined ? { gte: min_amount } : {}),
          ...(max_amount !== undefined ? { lte: max_amount } : {}),
        }
      }

      const skip = (page - 1) * limit
      const orderBy: any = {}
      if (sort) {
        orderBy[sort] = order
      } else {
        orderBy.awarding_date = 'desc'
      }

      const [awards, total] = await Promise.all([
        prisma.usaSpendingAward.findMany({
          where,
          skip,
          take: limit,
          orderBy,
        }),
        prisma.usaSpendingAward.count({ where }),
      ])

      return NextResponse.json({
        success: true,
        results: awards.map(award => ({
          ...award,
          awarding_agency: award.awarding_agency ? JSON.parse(award.awarding_agency) : null,
          funding_agency: award.funding_agency ? JSON.parse(award.funding_agency) : null,
          recipient_location: award.recipient_location ? JSON.parse(award.recipient_location) : null,
          place_of_performance: award.place_of_performance ? JSON.parse(award.place_of_performance) : null,
          period_of_performance: award.period_of_performance ? JSON.parse(award.period_of_performance) : null,
          raw_data: award.raw_data ? JSON.parse(award.raw_data) : null,
        })),
        page_metadata: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit),
          has_next_page: skip + limit < total,
          has_previous_page: page > 1,
        },
      })
    } else {
      // Search API directly
      const response = await searchAwards({
        filters,
        page,
        limit,
        sort,
        order,
      })

      return NextResponse.json({
        success: true,
        results: response.results || [],
        page_metadata: response.page_metadata,
      })
    }
  } catch (error) {
    console.error('[USAspending Search] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

