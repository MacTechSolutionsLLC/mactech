/**
 * GET /api/admin/capture/usaspending/award/[generatedInternalId]
 * 
 * Returns enriched award with signals, relevance score, and transaction summary.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  enrichAward,
  fetchTransactions,
  calculateRelevanceScore,
  generateSignals,
  updateAwardEnrichment,
  saveTransactions,
  updateAwardScoring,
} from '@/lib/services/usaspending-capture.service'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generatedInternalId: string }> | { generatedInternalId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { generatedInternalId } = resolvedParams

    if (!generatedInternalId) {
      return NextResponse.json(
        { success: false, error: 'generatedInternalId is required' },
        { status: 400 }
      )
    }

    // Find award in database
    let award = await prisma.usaSpendingAward.findUnique({
      where: { generated_internal_id: generatedInternalId },
      include: {
        transactions: {
          orderBy: { action_date: 'desc' },
          take: 100,
        },
      },
    })

    // If award doesn't exist or needs enrichment, enrich it
    if (!award || award.enrichment_status !== 'completed') {
      try {
        const enrichmentData = await enrichAward(generatedInternalId)
        
        if (!award) {
          // Award doesn't exist - create it
          award = await prisma.usaSpendingAward.create({
            data: {
              generated_internal_id: generatedInternalId,
              enrichment_status: 'pending',
            },
          })
        }

        // Update with enrichment data
        await updateAwardEnrichment(generatedInternalId, enrichmentData)

        // Reload award
        award = await prisma.usaSpendingAward.findUnique({
          where: { generated_internal_id: generatedInternalId },
          include: {
            transactions: {
              orderBy: { action_date: 'desc' },
              take: 100,
            },
          },
        })

        if (!award) {
          return NextResponse.json(
            { success: false, error: 'Award not found after enrichment' },
            { status: 404 }
          )
        }

        // Fetch and save transactions
        if (award.human_award_id && award.award_type) {
          const transactions = await fetchTransactions(
            award.human_award_id,
            [award.award_type]
          )

          if (transactions.length > 0) {
            await saveTransactions(award.id, transactions)
            
            // Reload to get transactions
            award = await prisma.usaSpendingAward.findUnique({
              where: { generated_internal_id: generatedInternalId },
              include: {
                transactions: {
                  orderBy: { action_date: 'desc' },
                  take: 100,
                },
              },
            })
          }
        }

        // Calculate and update scoring
        const relevanceScore = calculateRelevanceScore(award)
        const txForSignals = (award?.transactions || []).map(tx => ({
          'Issued Date': tx.action_date?.toISOString(),
          'Transaction Amount': tx.federal_action_obligation,
          'Mod': tx.transaction_id,
        }))
        const signals = generateSignals(txForSignals, award)

        await updateAwardScoring(generatedInternalId, relevanceScore, signals)

        // Reload one more time to get updated scoring
        award = await prisma.usaSpendingAward.findUnique({
          where: { generated_internal_id: generatedInternalId },
          include: {
            transactions: {
              orderBy: { action_date: 'desc' },
              take: 100,
            },
          },
        })
      } catch (error) {
        console.error(`[USAspending Capture] Error enriching award ${generatedInternalId}:`, error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to enrich award: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          { status: 500 }
        )
      }
    }

    if (!award) {
      return NextResponse.json(
        { success: false, error: 'Award not found' },
        { status: 404 }
      )
    }

    // Parse signals
    const signals = award.signals ? JSON.parse(award.signals) : []

    // Generate transaction summary (not raw rows)
    const transactionSummary = {
      total: award.transactions.length,
      recent: award.transactions.filter(tx => {
        if (!tx.action_date) return false
        const daysSince = (Date.now() - tx.action_date.getTime()) / (1000 * 60 * 60 * 24)
        return daysSince < 180
      }).length,
      totalAmount: award.transactions.reduce((sum, tx) => sum + (tx.federal_action_obligation || 0), 0),
      lastActivity: award.transactions[0]?.action_date || null,
    }

    // Recompete indicator
    const recompeteIndicator = award.end_date
      ? (() => {
          const endDate = new Date(award.end_date)
          const now = new Date()
          const monthsUntilEnd = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)
          return monthsUntilEnd > 0 && monthsUntilEnd <= 24
        })()
      : false

    // Incumbent info
    const incumbent = award.recipient_name
      ? {
          name: award.recipient_name,
          uei: award.recipient_uei,
          duns: award.recipient_duns,
        }
      : null

    return NextResponse.json({
      success: true,
      award: {
        id: award.id,
        humanAwardId: award.human_award_id,
        generatedInternalId: award.generated_internal_id,
        title: award.description?.substring(0, 200) || 'Untitled Award',
        description: award.description,
        agency: award.awarding_agency_name,
        subAgency: award.awarding_agency ? (() => {
          try {
            const agency = JSON.parse(award.awarding_agency)
            return agency.subtier_agency?.name
          } catch {
            return null
          }
        }
        })() : null,
        amount: award.total_obligation,
        popStart: award.start_date,
        popEnd: award.end_date,
        naics: award.naics_code,
        psc: award.psc_code,
        recipient: award.recipient_name,
        subawardCount: award.subaward_count,
        transactionCount: award.transaction_count,
      },
      signals,
      relevanceScore: award.relevance_score,
      transactionSummary,
      incumbent,
      recompeteIndicator,
    })
  } catch (error) {
    console.error('[USAspending Capture] Error fetching award:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
