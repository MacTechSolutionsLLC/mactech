/**
 * POST /api/admin/usaspending/ingest
 * Fetch and store USAspending.gov awards with optional filters
 * 
 * Default filters:
 * - Date range: 2024-01-01 to 2024-12-31
 * - NAICS codes: IT/cybersecurity services (541512, 541511, 541519, 541513, 541330, 518210)
 * - Award types: Contracts only (A)
 * - Limit: ~1,000 awards (10 pages × 100 per page)
 */

import { NextRequest, NextResponse } from 'next/server'
import { ingestAwards, IngestionFilters } from '@/lib/usaspending-ingestion/ingest'
import { batchLookupEntities } from '@/lib/sam-gov-entity-api'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface IngestRequestBody {
  filters?: {
    naicsCodes?: string[]
    pscCodes?: string[]
    agencies?: string[]
    awardTypes?: string[]
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    minAmount?: number
    maxAmount?: number
  }
  options?: {
    maxPages?: number
    limitPerPage?: number
  }
  enrichWithEntityApi?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequestBody = await request.json().catch(() => ({}))
    
    // Default filters: 2024, NAICS codes, contracts only
    const defaultFilters: IngestionFilters = {
      naicsCodes: ['541512', '541511', '541519', '541513', '541330', '518210'],
      awardTypes: ['A'], // Contracts only
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    }

    // Merge user-provided filters with defaults
    const filters: IngestionFilters = {
      ...defaultFilters,
      ...(body.filters || {}),
    }

    // Default options: 10 pages × 100 per page = ~1,000 awards
    const options = {
      maxPages: body.options?.maxPages ?? 10,
      limitPerPage: body.options?.limitPerPage ?? 100,
    }

    console.log('[USAspending Ingest API] Starting ingestion with filters:', JSON.stringify(filters, null, 2))
    console.log('[USAspending Ingest API] Options:', JSON.stringify(options, null, 2))

    // Run ingestion
    const result = await ingestAwards(filters, options)

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ingestion failed',
          result,
        },
        { status: 500 }
      )
    }

    let entityEnrichmentStats = {
      enriched: 0,
      failed: 0,
      skipped: 0,
    }

    // Enrich with Entity API if requested (default: true)
    if (body.enrichWithEntityApi !== false) {
      try {
        console.log('[USAspending Ingest API] Starting Entity API enrichment...')
        
        // Get all awards from this batch that have recipient UEIs
        const awardsToEnrich = await prisma.usaSpendingAward.findMany({
          where: {
            ingestion_batch_id: result.batchId,
            recipient_uei: { not: null },
            recipient_entity_data: null, // Only enrich if not already enriched
          },
          select: {
            id: true,
            recipient_uei: true,
          },
        })

        console.log(`[USAspending Ingest API] Found ${awardsToEnrich.length} awards to enrich with Entity API`)

        if (awardsToEnrich.length > 0) {
          // Extract unique UEIs
          const uniqueUeis = [...new Set(
            awardsToEnrich
              .map(a => a.recipient_uei)
              .filter((uei): uei is string => uei !== null)
          )]

          console.log(`[USAspending Ingest API] Enriching ${uniqueUeis.length} unique vendors...`)

          // Batch lookup entities
          const entityData = await batchLookupEntities(uniqueUeis)

          // Update awards with entity data
          for (const [uei, entityInfo] of entityData.entries()) {
            try {
              const awardsWithUei = awardsToEnrich.filter(a => a.recipient_uei === uei)
              
              for (const award of awardsWithUei) {
                await prisma.usaSpendingAward.update({
                  where: { id: award.id },
                  data: {
                    recipient_entity_data: JSON.stringify(entityInfo),
                  },
                })
                entityEnrichmentStats.enriched++
              }
            } catch (error) {
              console.error(`[USAspending Ingest API] Error updating award with UEI ${uei}:`, error)
              entityEnrichmentStats.failed++
            }
          }

          // Count skipped (awards without UEI or already enriched)
          entityEnrichmentStats.skipped = awardsToEnrich.length - entityEnrichmentStats.enriched - entityEnrichmentStats.failed
        }

        console.log(`[USAspending Ingest API] Entity API enrichment complete: ${entityEnrichmentStats.enriched} enriched, ${entityEnrichmentStats.failed} failed, ${entityEnrichmentStats.skipped} skipped`)
      } catch (error) {
        console.error('[USAspending Ingest API] Error during Entity API enrichment:', error)
        // Don't fail the whole request if enrichment fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'USAspending ingestion completed',
      result: {
        ...result,
        entityEnrichment: entityEnrichmentStats,
      },
    })
  } catch (error) {
    console.error('[USAspending Ingest API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

