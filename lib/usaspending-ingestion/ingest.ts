/**
 * USAspending.gov Ingestion Pipeline
 * 
 * Ingests historical award data from USAspending.gov API
 * Supports incremental updates and full backfill
 */

import { 
  searchAwards, 
  UsaSpendingSearchParams, 
  UsaSpendingFilters,
  UsaSpendingAward 
} from '../usaspending-api'
import { prisma } from '../prisma'
import { IngestionResult, IngestionBatch, IngestionFilters } from './types'

/**
 * Generate batch ID for this ingestion run
 */
function generateBatchId(): string {
  return `usaspending-batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Convert award data to database format
 */
function normalizeAward(award: UsaSpendingAward): any {
  return {
    award_id: award.award_id || award.id,
    generated_unique_award_id: award.generated_unique_award_id,
    award_type: award.type,
    award_type_description: award.type_description,
    category: award.category,
    piid: award.piid,
    fain: award.fain,
    uri: award.uri,
    total_obligation: award.total_obligation,
    total_outlay: award.total_outlay,
    total_subsidy_cost: award.total_subsidy_cost,
    awarding_agency: award.awarding_agency ? JSON.stringify(award.awarding_agency) : null,
    funding_agency: award.funding_agency ? JSON.stringify(award.funding_agency) : null,
    awarding_agency_name: award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name,
    funding_agency_name: award.funding_agency?.name || award.funding_agency?.toptier_agency?.name,
    awarding_agency_id: award.awarding_agency?.id,
    funding_agency_id: award.funding_agency?.id,
    recipient_name: award.recipient?.name,
    recipient_uei: award.recipient?.uei,
    recipient_duns: award.recipient?.duns,
    recipient_hash: award.recipient?.hash,
    recipient_id: award.recipient?.recipient_id,
    recipient_location: award.recipient?.location ? JSON.stringify(award.recipient.location) : null,
    place_of_performance: award.place_of_performance ? JSON.stringify(award.place_of_performance) : null,
    pop_state: award.place_of_performance?.state,
    pop_country: award.place_of_performance?.country,
    start_date: award.start_date ? new Date(award.start_date) : award.period_of_performance?.start_date ? new Date(award.period_of_performance.start_date) : null,
    end_date: award.end_date ? new Date(award.end_date) : award.period_of_performance?.end_date ? new Date(award.period_of_performance.end_date) : null,
    last_modified_date: award.last_modified_date ? new Date(award.last_modified_date) : award.period_of_performance?.last_modified_date ? new Date(award.period_of_performance.last_modified_date) : null,
    awarding_date: award.awarding_date ? new Date(award.awarding_date) : null,
    period_of_performance: award.period_of_performance ? JSON.stringify(award.period_of_performance) : null,
    naics_code: award.naics,
    naics_description: award.naics_description,
    psc_code: award.psc,
    psc_description: award.psc_description,
    cfda_number: award.cfda_number,
    cfda_title: award.cfda_title,
    description: award.description,
    transaction_count: award.transaction_count || 0,
    total_subaward_amount: award.total_subaward_amount,
    subaward_count: award.subaward_count || 0,
    raw_data: JSON.stringify(award),
  }
}

/**
 * Save award to database (upsert)
 */
async function saveAward(award: UsaSpendingAward, batchId: string): Promise<{ saved: boolean; skipped: boolean }> {
  try {
    const normalized = normalizeAward(award)
    const awardId = award.award_id || award.id || award.generated_unique_award_id
    
    if (!awardId) {
      return { saved: false, skipped: true }
    }

    // Try to find existing award
    const existing = await prisma.usaSpendingAward.findFirst({
      where: {
        OR: [
          { award_id: awardId },
          { generated_unique_award_id: award.generated_unique_award_id },
        ].filter(Boolean),
      },
    })

    if (existing) {
      // Update existing award
      await prisma.usaSpendingAward.update({
        where: { id: existing.id },
        data: {
          ...normalized,
          ingestion_batch_id: batchId,
          updated_at: new Date(),
        },
      })
      return { saved: true, skipped: false }
    } else {
      // Create new award
      await prisma.usaSpendingAward.create({
        data: {
          ...normalized,
          ingestion_batch_id: batchId,
        },
      })
      return { saved: true, skipped: false }
    }
  } catch (error) {
    console.error(`[Ingest] Error saving award ${award.award_id || award.id}:`, error)
    return { saved: false, skipped: false }
  }
}

/**
 * Build filters from ingestion options
 */
function buildFilters(filters?: IngestionFilters): UsaSpendingFilters {
  const usaspendingFilters: UsaSpendingFilters = {}

  if (filters?.naicsCodes && filters.naicsCodes.length > 0) {
    usaspendingFilters.naics_codes = filters.naicsCodes.map(code => ({ code }))
  }

  if (filters?.pscCodes && filters.pscCodes.length > 0) {
    usaspendingFilters.psc_codes = filters.pscCodes.map(code => ({ code }))
  }

  if (filters?.agencies && filters.agencies.length > 0) {
    usaspendingFilters.agencies = filters.agencies.map(agencyId => ({
      toptier_agency_id: agencyId,
    }))
  }

  if (filters?.awardTypes && filters.awardTypes.length > 0) {
    usaspendingFilters.award_type_codes = filters.awardTypes as any[]
  }

  if (filters?.startDate || filters?.endDate) {
    // Only include time_period if at least one date is provided
    // The API may require both, so we'll use a reasonable default if one is missing
    const startDate = filters.startDate || '2000-01-01' // Default to early date if missing
    const endDate = filters.endDate || new Date().toISOString().split('T')[0] // Default to today if missing
    usaspendingFilters.time_period = [{
      start_date: startDate,
      end_date: endDate,
      date_type: 'action_date',
    }]
  }

  if (filters?.minAmount !== undefined || filters?.maxAmount !== undefined) {
    usaspendingFilters.award_amounts = [{
      lower_bound: filters.minAmount,
      upper_bound: filters.maxAmount,
    }]
  }

  return usaspendingFilters
}

/**
 * Ingest awards with pagination
 */
async function ingestAwardsPage(
  filters: UsaSpendingFilters,
  page: number,
  limit: number,
  batchId: string
): Promise<{ awards: UsaSpendingAward[]; hasMore: boolean }> {
  const searchParams: UsaSpendingSearchParams = {
    filters,
    page,
    limit: Math.min(limit, 500), // Max 500 per page
    sort: 'awarding_date',
    order: 'desc',
  }

  const response = await searchAwards(searchParams)
  const awards = response.results || []

  return {
    awards,
    hasMore: awards.length === limit && (response.page_metadata?.has_next_page ?? false),
  }
}

/**
 * Main ingestion function
 */
export async function ingestAwards(
  filters?: IngestionFilters,
  options?: {
    maxPages?: number
    limitPerPage?: number
  }
): Promise<IngestionResult> {
  const batchId = generateBatchId()
  const startTime = Date.now()
  const maxPages = options?.maxPages ?? 100 // Safety limit
  const limitPerPage = options?.limitPerPage ?? 100

  console.log(`[USAspending Ingest] Starting ingestion batch: ${batchId}`)

  const errors: string[] = []
  let totalFetched = 0
  let totalSaved = 0
  let totalSkipped = 0

  try {
    const usaspendingFilters = buildFilters(filters)
    
    console.log(`[USAspending Ingest] Filters:`, JSON.stringify(usaspendingFilters, null, 2))

    let page = 1
    let hasMore = true

    while (hasMore && page <= maxPages) {
      try {
        console.log(`[USAspending Ingest] Fetching page ${page}...`)
        
        const { awards, hasMore: more } = await ingestAwardsPage(
          usaspendingFilters,
          page,
          limitPerPage,
          batchId
        )

        totalFetched += awards.length
        console.log(`[USAspending Ingest] Fetched ${awards.length} awards from page ${page} (total: ${totalFetched})`)

        // Save each award
        for (const award of awards) {
          const result = await saveAward(award, batchId)
          if (result.saved) {
            totalSaved++
          } else if (result.skipped) {
            totalSkipped++
          } else {
            errors.push(`Failed to save award ${award.award_id || award.id}`)
          }
        }

        hasMore = more
        page++

        // Small delay to avoid overwhelming the API
        if (hasMore) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`[USAspending Ingest] Error on page ${page}:`, error)
        errors.push(`Page ${page}: ${errorMessage}`)
        
        // Continue with next page if we have some results
        if (totalFetched === 0) {
          throw error
        }
        hasMore = false
      }
    }

    const duration = Date.now() - startTime
    console.log(`[USAspending Ingest] Ingestion completed in ${duration}ms`)
    console.log(`[USAspending Ingest] Total: ${totalFetched} fetched, ${totalSaved} saved, ${totalSkipped} skipped`)

    return {
      success: true,
      batchId,
      ingested: totalFetched,
      saved: totalSaved,
      skipped: totalSkipped,
      errors,
      stats: {
        batchId,
        ingestedAt: new Date(),
        totalFetched,
        totalSaved,
        totalSkipped,
        errors,
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`[USAspending Ingest] Ingestion failed:`, error)
    errors.push(errorMessage)

    return {
      success: false,
      batchId,
      ingested: totalFetched,
      saved: totalSaved,
      skipped: totalSkipped,
      errors,
      stats: {
        batchId,
        ingestedAt: new Date(),
        totalFetched,
        totalSaved,
        totalSkipped,
        errors,
      },
    }
  }
}

/**
 * Ingest recent awards (last N days)
 */
export async function ingestRecentAwards(days: number = 30): Promise<IngestionResult> {
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

  return ingestAwards({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  })
}

/**
 * Ingest awards by fiscal year
 */
export async function ingestFiscalYear(fiscalYear: number): Promise<IngestionResult> {
  // Fiscal year starts October 1
  const startDate = new Date(fiscalYear - 1, 9, 1) // October 1 of previous year
  const endDate = new Date(fiscalYear, 8, 30) // September 30 of fiscal year

  return ingestAwards({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  })
}

