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
    console.log('[USAspending Capture Ingest] Discovering awards...')
    const discoveredAwards = await discoverAwards(body.filters, body.pagination)
    console.log(`[USAspending Capture Ingest] Discovered ${discoveredAwards.length} awards`)

    // Step 2: Save discovered awards (set enrichment_status = 'pending')
    let saved = 0
    let errors: string[] = []

    for (const discoveryAward of discoveredAwards) {
      const result = await saveDiscoveredAward(discoveryAward)
      if (result.saved) {
        saved++
      } else {
        errors.push(`Failed to save award ${discoveryAward['Award ID'] || 'unknown'}: ${result.error}`)
      }
    }

    console.log(`[USAspending Capture Ingest] Saved ${saved} awards to database`)

    // Step 3: Enrich awards (get full details)
    console.log('[USAspending Capture Ingest] Enriching awards...')
    let enriched = 0

    // Get all awards with pending enrichment status
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

    // Step 4: Get ranked awards (ordered by relevance_score DESC)
    const rankedAwards = await prisma.usaSpendingAward.findMany({
      where: {
        enrichment_status: 'completed',
        relevance_score: { not: null },
      },
      orderBy: {
        relevance_score: 'desc',
      },
      take: 1000, // Return top 1000
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
