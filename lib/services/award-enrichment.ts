/**
 * Award Enrichment Service
 * Links SAM.gov opportunities to similar historical awards from USAspending.gov
 */

import { prisma } from '../prisma'
import { searchAwards, UsaSpendingFilters } from '../usaspending-api'

export interface EnrichmentResult {
  similar_awards: any[]
  statistics: {
    count: number
    average_obligation: number | null
    min_obligation: number | null
    max_obligation: number | null
    unique_recipients: string[]
    unique_agencies: string[]
  }
}

/**
 * Enrich a SAM.gov opportunity with similar historical awards
 */
export async function enrichOpportunity(
  opportunityId: string,
  options?: {
    limit?: number
    useDatabase?: boolean
  }
): Promise<EnrichmentResult | null> {
  const limit = options?.limit ?? 10
  const useDatabase = options?.useDatabase ?? false

  try {
    // Get the opportunity
    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id: opportunityId },
    })

    if (!opportunity) {
      return null
    }

    // Build filters based on opportunity
    const filters: UsaSpendingFilters = {
      award_type_codes: ['A', 'B', 'C', 'D', 'IDV'], // Contracts and IDVs
    }

    // Parse NAICS codes from opportunity
    try {
      const naicsCodes = JSON.parse(opportunity.naics_codes || '[]')
      if (Array.isArray(naicsCodes) && naicsCodes.length > 0) {
        filters.naics_codes = naicsCodes.map((code: string) => ({ code }))
      }
    } catch (e) {
      // Ignore parse errors
    }

    // Try to extract agency information (this is approximate)
    if (opportunity.agency) {
      // In a real implementation, you'd want an agency name to ID mapping
      // For now, we'll search by agency name in the description
      filters.recipient_search_text = opportunity.agency
    }

    if (useDatabase) {
      // Search database
      const where: any = {}

      try {
        const naicsCodes = JSON.parse(opportunity.naics_codes || '[]')
        if (Array.isArray(naicsCodes) && naicsCodes.length > 0) {
          where.naics_code = { in: naicsCodes }
        }
      } catch (e) {
        // Ignore
      }

      const awards = await prisma.usaSpendingAward.findMany({
        where,
        take: limit,
        orderBy: { total_obligation: 'desc' },
      })

      const obligations = awards
        .map(a => a.total_obligation)
        .filter((v): v is number => v !== null && v !== undefined)

      const recipients = new Set(
        awards
          .map(a => a.recipient_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      const agencies = new Set(
        awards
          .map(a => a.awarding_agency_name)
          .filter((v): v is string => v !== null && v !== undefined)
      )

      return {
        similar_awards: awards.map(award => ({
          ...award,
          awarding_agency: award.awarding_agency ? JSON.parse(award.awarding_agency) : null,
          funding_agency: award.funding_agency ? JSON.parse(award.funding_agency) : null,
          recipient_location: award.recipient_location ? JSON.parse(award.recipient_location) : null,
          place_of_performance: award.place_of_performance ? JSON.parse(award.place_of_performance) : null,
        })),
        statistics: {
          count: awards.length,
          average_obligation: obligations.length > 0
            ? obligations.reduce((a, b) => a + b, 0) / obligations.length
            : null,
          min_obligation: obligations.length > 0 ? Math.min(...obligations) : null,
          max_obligation: obligations.length > 0 ? Math.max(...obligations) : null,
          unique_recipients: Array.from(recipients),
          unique_agencies: Array.from(agencies),
        },
      }
    } else {
      // Search API
      const response = await searchAwards({
        filters,
        limit,
        sort: 'total_obligation',
        order: 'desc',
      })

      const similarAwards = response.results || []

      const obligations = similarAwards
        .map(a => a.total_obligation)
        .filter((v): v is number => v !== undefined && v !== null)

      const recipients = new Set(
        similarAwards
          .map(a => a.recipient?.name)
          .filter((v): v is string => v !== undefined && v !== null)
      )

      const agencies = new Set(
        similarAwards
          .map(a => a.awarding_agency?.name || a.awarding_agency?.toptier_agency?.name)
          .filter((v): v is string => v !== undefined && v !== null)
      )

      return {
        similar_awards: similarAwards,
        statistics: {
          count: similarAwards.length,
          average_obligation: obligations.length > 0
            ? obligations.reduce((a, b) => a + b, 0) / obligations.length
            : null,
          min_obligation: obligations.length > 0 ? Math.min(...obligations) : null,
          max_obligation: obligations.length > 0 ? Math.max(...obligations) : null,
          unique_recipients: Array.from(recipients),
          unique_agencies: Array.from(agencies),
        },
      }
    }
  } catch (error) {
    console.error('[Award Enrichment] Error:', error)
    return null
  }
}

