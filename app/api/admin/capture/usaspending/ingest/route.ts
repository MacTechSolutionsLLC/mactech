/**
 * POST /api/admin/capture/usaspending/ingest
 * 
 * Discovers, enriches, scores, and signals USAspending awards.
 * Returns ranked awards ordered by relevance_score DESC.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  discoverAwards,
  enrichAward,
  fetchTransactions,
  calculateRelevanceScore,
  generateSignals,
  saveDiscoveredAward,
  updateAwardEnrichment,
  saveTransactions,
  updateAwardScoring,
  enrichAwardWithEntityApi,
  normalizeEntityData,
} from '@/lib/services/usaspending-capture.service'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface IngestRequestBody {
  filters?: {
    naicsCodes?: string[]
    awardTypeCodes?: string[]
    agencies?: Array<{ type: 'awarding' | 'funding'; tier: 'toptier' | 'subtier'; name: string }>
    timePeriod?: { startDate: string; endDate: string }
  }
  pagination?: {
    maxPages?: number
    limitPerPage?: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: IngestRequestBody = await request.json().catch(() => ({}))

    console.log('[USAspending Capture Ingest] Starting ingestion...')

    // Step 1: Discover awards
    // USAspending will intermittently 500 on heavy queries - discovery failures are non-fatal
    // discoverAwards never throws - it handles 500s internally and returns results
    // 
    // IMPORTANT: Client API shape ≠ USAspending API shape
    // All filters are normalized in discoverAwards() function
    // award_type_codes is MANDATORY and always enforced
    console.log('[USAspending Capture Ingest] Step 1: Discovering awards...')
    
    // Discovery never throws - it handles 500s internally and returns results
    // USAspending 500s are upstream conditions, not absence of data
    // Filters are automatically translated and baseline filters are enforced
    const discoveredAwards = await discoverAwards(body.filters, body.pagination)
    
    // DO NOT SAVE ZERO RESULTS AS AUTHORITATIVE if we encountered 500s
    // The discoverAwards function handles this internally, but we log the status
    if (discoveredAwards.length === 0) {
      console.warn(`[USAspending Capture Ingest] No awards discovered. This may indicate upstream API instability.`)
      console.log(`[USAspending Capture Ingest] Continuing with existing awards in database for enrichment...`)
    } else {
      console.log(`[USAspending Capture Ingest] Step 1 complete: Discovered ${discoveredAwards.length} awards`)
    }

    // Step 2: Save discovered awards (set enrichment_status = 'pending')
    // Only save if we have results - never overwrite with zero results from 500 errors
    console.log('[USAspending Capture Ingest] Step 2: Saving discovered awards...')
    let saved = 0
    let errors: string[] = []

    if (discoveredAwards.length > 0) {
      for (const discoveryAward of discoveredAwards) {
        const result = await saveDiscoveredAward(discoveryAward)
        if (result.saved) {
          saved++
        } else {
          errors.push(`Failed to save award ${discoveryAward['Award ID'] || 'unknown'}: ${result.error}`)
        }
      }
      console.log(`[USAspending Capture Ingest] Step 2 complete: Saved ${saved} awards to database`)
    } else {
      console.log(`[USAspending Capture Ingest] Step 2 skipped: No awards to save (upstream API may be unavailable)`)
    }

    // Step 3: Enrich awards (get full details via GET /awards/{generated_internal_id}/)
    // All enrichment, filtering, and AI scoring happens AFTER persistence
    // Discovery uses minimal filters, filtering happens in database after enrichment
    console.log('[USAspending Capture Ingest] Step 3: Enriching awards with detail data...')
    let enriched = 0

    // Get all awards with pending enrichment status
    // Filtering by NAICS/agency happens AFTER enrichment (in Step 5)
    const awardsToEnrich = await prisma.usaSpendingAward.findMany({
      where: {
        enrichment_status: 'pending',
        generated_internal_id: { not: null },
      },
      take: 100, // Process in batches to avoid overwhelming the API
    })

    console.log(`[USAspending Capture Ingest] Found ${awardsToEnrich.length} awards to enrich`)

    let entityEnriched = 0

    for (const award of awardsToEnrich) {
      if (!award.generated_internal_id) continue

      try {
        // STEP 1: Award Detail Enrichment (REQUIRED)
        // GET /api/v2/awards/{generated_internal_id}/ - stores full response in raw_data
        const enrichmentData = await enrichAward(award.generated_internal_id)
        
        // Update award with enrichment data (stores full response in raw_data)
        const updateResult = await updateAwardEnrichment(
          award.generated_internal_id,
          enrichmentData
        )

        if (!updateResult.success) {
          errors.push(`Failed to enrich award ${award.human_award_id || award.id}: ${updateResult.error}`)
          await prisma.usaSpendingAward.update({
            where: { id: award.id },
            data: { enrichment_status: 'failed' },
          })
          continue
        }

        enriched++

        // Reload award to get updated fields (human_award_id, award_type, etc.)
        const enrichedAward = await prisma.usaSpendingAward.findUnique({
          where: { id: award.id },
        })

        if (!enrichedAward) {
          errors.push(`Award ${award.id} not found after enrichment`)
          continue
        }

        // STEP 2: Transaction Activity (OPTIONAL BUT PREFERRED)
        // Fetch transactions for ALL awards (not just those with transaction_count > 0)
        let transactionCount = 0
        if (enrichedAward.human_award_id && enrichedAward.award_type) {
          try {
            const transactions = await fetchTransactions(
              enrichedAward.human_award_id,
              [enrichedAward.award_type]
            )

            if (transactions.length > 0) {
              await saveTransactions(award.id, transactions)
              transactionCount = transactions.length
              
              // Update transaction_count
              await prisma.usaSpendingAward.update({
                where: { id: award.id },
                data: { transaction_count: transactionCount },
              })
            }
          } catch (txError) {
            console.warn(`[USAspending Capture Ingest] Error fetching transactions for award ${award.id}: ${txError instanceof Error ? txError.message : 'Unknown error'}`)
            // Continue - transactions are optional
          }
        }

        // STEP 3: Scoring (BEFORE ENTITY API)
        // Calculate relevance score and signals
        const relevanceScore = calculateRelevanceScore(enrichedAward)
        
        // Get transactions for signal generation
        const awardTransactions = await prisma.usaSpendingTransaction.findMany({
          where: { award_id: award.id },
          take: 100,
        })

        // Convert transactions to format expected by generateSignals
        const txForSignals = awardTransactions.map(tx => ({
          'Issued Date': tx.action_date?.toISOString(),
          'Transaction Amount': tx.federal_action_obligation,
          'Mod': tx.transaction_id,
        }))

        const signals = generateSignals(txForSignals, enrichedAward)

        // Update award with scoring
        await updateAwardScoring(
          award.generated_internal_id,
          relevanceScore,
          signals
        )

        // Reload award to get updated score
        const scoredAward = await prisma.usaSpendingAward.findUnique({
          where: { id: award.id },
        })

        // STEP 4: SAM.gov Entity API enrichment (AFTER SCORING - SECONDARY, BEST-EFFORT)
        // Only if relevance_score >= 60 AND recipient_name exists
        const ENTITY_ENRICHMENT_THRESHOLD = 60

        if (scoredAward && 
            scoredAward.relevance_score !== null &&
            scoredAward.relevance_score >= ENTITY_ENRICHMENT_THRESHOLD &&
            scoredAward.recipient_name) {
          try {
            // Add timeout to prevent hanging (5 seconds max)
            const entityResult = await Promise.race([
              enrichAwardWithEntityApi(scoredAward),
              new Promise<{ success: false; entityData: null; error: string }>((resolve) =>
                setTimeout(() => resolve({ success: false, entityData: null, error: 'Timeout after 5 seconds' }), 5000)
              ),
            ])
            
            if (entityResult.success) {
              // Update award with entity data (null if empty results - VALID SUCCESS)
              await prisma.usaSpendingAward.update({
                where: { id: award.id },
                data: {
                  recipient_entity_data: entityResult.entityData 
                    ? JSON.stringify(normalizeEntityData(entityResult.entityData))
                    : null,  // Empty results stored as null (valid success case)
                  updated_at: new Date(),
                },
              })
              
              entityEnriched++
              
              // Log empty results at info level (not warning)
              if (!entityResult.entityData) {
                console.info(`[Entity API] No entity data found for award ${award.id} (vendor: ${scoredAward.recipient_name})`)
              }
            } else {
              // Log API error at warn level (API returned error response)
              console.warn(`[Entity API] Failed to enrich award ${award.id}: ${entityResult.error}`)
            }
          } catch (error) {
            // Log network/unexpected failure at error level
            console.error(`[Entity API] Error enriching award ${award.id}:`, error)
            // Continue pipeline - Entity API is best-effort
          }
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        console.error(`[USAspending Capture Ingest] Error processing award ${award.id}: ${errorMessage}`)
        errors.push(`Error processing award ${award.human_award_id || award.id}: ${errorMessage}`)
        
        // Mark as failed
        await prisma.usaSpendingAward.update({
          where: { id: award.id },
          data: { enrichment_status: 'failed' },
        })
      }
    }

    console.log(`[USAspending Capture Ingest] Step 3 complete: Enriched ${enriched} awards, ${entityEnriched} with Entity API data`)

    // Step 4: Get ranked awards (filtered by baseline criteria AFTER persistence)
    // NOTE: Awards may not have relevance_score >= 60, so they won't appear in ranked results
    // This is expected - the baseline filters are strict (NAICS + DoD agency)
    // All filtering and scoring happens AFTER persistence
    console.log('[USAspending Capture Ingest] Step 4: Fetching ranked awards...')
    
    // Baseline filters for final results (post-persistence filtering)
    const baselineNaicsCodes = ['541512', '541511', '541519']
    
    const rankedAwards = await prisma.usaSpendingAward.findMany({
      where: {
        enrichment_status: 'completed',
        relevance_score: { not: null },
        // Filter by baseline NAICS codes (post-persistence filtering)
        naics_code: { in: baselineNaicsCodes },
        // Filter by DoD agency (post-persistence filtering)
        awarding_agency_name: { contains: 'Defense', mode: 'insensitive' },
      },
      orderBy: {
        relevance_score: 'desc',
      },
      take: 100, // Return top 100
      select: {
        id: true,
        human_award_id: true,
        generated_internal_id: true,
        description: true,
        awarding_agency_name: true,
        total_obligation: true,
        start_date: true,
        end_date: true,
        relevance_score: true,
        signals: true,
        naics_code: true,
        recipient_name: true,
        transaction_count: true,
      },
    })

    // Parse signals JSON
    const awardsWithParsedSignals = rankedAwards.map(award => ({
      ...award,
      signals: award.signals ? JSON.parse(award.signals) : [],
    }))

    // USER FEEDBACK: Clear success message with filters used
    const timePeriod = body.filters?.timePeriod
    const filtersUsed = {
      dateRange: timePeriod 
        ? `${timePeriod.startDate} to ${timePeriod.endDate}`
        : 'Last 6 months (default)',
      awardTypes: body.filters?.awardTypeCodes || ['A'],
      dataSource: 'USAspending.gov',
    }

    return NextResponse.json({
      success: true,
      awards: awardsWithParsedSignals,
      total: saved,
      enriched,
      entityEnriched,
      discovered: discoveredAwards.length,
      filtersUsed,
      timestamp: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('[USAspending Capture Ingest] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
