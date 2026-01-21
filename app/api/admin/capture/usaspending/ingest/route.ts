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
    console.log('[USAspending Capture Ingest] Discovering awards...')
    
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
      console.log(`[USAspending Capture Ingest] Discovered ${discoveredAwards.length} awards`)
    }

    // Step 2: Save discovered awards (set enrichment_status = 'pending')
    // Only save if we have results - never overwrite with zero results from 500 errors
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
      console.log(`[USAspending Capture Ingest] Saved ${saved} awards to database`)
    } else {
      console.log(`[USAspending Capture Ingest] No awards to save (upstream API may be unavailable)`)
    }

    // Step 3: Enrich awards (get full details)
    // All enrichment, filtering, and AI scoring happens AFTER persistence
    // Discovery uses minimal filters, filtering happens in database after enrichment
    console.log('[USAspending Capture Ingest] Enriching awards...')
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

    for (const award of awardsToEnrich) {
      if (!award.generated_internal_id) continue

      try {
        // Enrich award
        const enrichmentData = await enrichAward(award.generated_internal_id)
        
        // Update award with enrichment data
        const updateResult = await updateAwardEnrichment(
          award.generated_internal_id,
          enrichmentData
        )

        if (updateResult.success) {
          enriched++

          // Fetch transactions if award has transaction_count > 0
          if (award.transaction_count && award.transaction_count > 0 && award.human_award_id && award.award_type) {
            try {
              const transactions = await fetchTransactions(
                award.human_award_id,
                [award.award_type]
              )

              if (transactions.length > 0) {
                await saveTransactions(award.id, transactions)
                
                // Update transaction_count
                await prisma.usaSpendingAward.update({
                  where: { id: award.id },
                  data: { transaction_count: transactions.length },
                })
              }
            } catch (txError) {
              console.error(`[USAspending Capture Ingest] Error fetching transactions for award ${award.id}:`, txError)
              // Continue - transactions are optional
            }
          }

          // Calculate relevance score and signals
          const updatedAward = await prisma.usaSpendingAward.findUnique({
            where: { id: award.id },
          })

          if (updatedAward) {
            const relevanceScore = calculateRelevanceScore(updatedAward)
            
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

            const signals = generateSignals(txForSignals, updatedAward)

            // Update award with scoring
            await updateAwardScoring(
              award.generated_internal_id,
              relevanceScore,
              signals
            )

            // Step 6: SAM.gov Entity API enrichment (SECONDARY, BEST-EFFORT)
            // Treat SAM.gov Entity API as secondary, best-effort context only
            // Only for awards with relevanceScore >= threshold AND recipient_name exists
            const ENTITY_ENRICHMENT_THRESHOLD = 60 // Configurable, default 60

            if (updatedAward.relevance_score !== null &&
                updatedAward.relevance_score >= ENTITY_ENRICHMENT_THRESHOLD &&
                updatedAward.recipient_name) {
              try {
                const entityResult = await enrichAwardWithEntityApi(updatedAward)
                
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
                  
                  // Log empty results at info level (not warning)
                  if (!entityResult.entityData) {
                    console.info(`[Entity API] No entity data found for award ${award.id} (vendor: ${updatedAward.recipient_name})`)
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
          }
        } else {
          errors.push(`Failed to enrich award ${award.human_award_id || award.id}: ${updateResult.error}`)
          
          // Mark as failed
          await prisma.usaSpendingAward.update({
            where: { id: award.id },
            data: { enrichment_status: 'failed' },
          })
        }

        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        console.error(`[USAspending Capture Ingest] Error enriching award ${award.id}:`, error)
        errors.push(`Error enriching award ${award.human_award_id || award.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        
        // Mark as failed
        await prisma.usaSpendingAward.update({
          where: { id: award.id },
          data: { enrichment_status: 'failed' },
        })
      }
    }

    console.log(`[USAspending Capture Ingest] Enriched ${enriched} awards`)

    // Step 5: Get ranked awards (filtered by baseline criteria AFTER persistence)
    // All filtering and scoring happens AFTER persistence
    console.log('[USAspending Capture Ingest] Fetching ranked awards...')
    
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

    return NextResponse.json({
      success: true,
      awards: awardsWithParsedSignals,
      total: saved,
      enriched,
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
