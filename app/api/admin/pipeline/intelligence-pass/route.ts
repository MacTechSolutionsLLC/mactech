/**
 * POST /api/admin/pipeline/intelligence-pass
 * Trigger intelligence pass for one or more opportunities
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { runIntelligencePass } from '@/lib/services/intelligence-pass'

interface RequestBody {
  opportunity_ids?: string[]
  force_recalculate?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json()
    const { opportunity_ids, force_recalculate = false } = body

    let opportunitiesToProcess: Array<{ id: string }> = []

    if (opportunity_ids && opportunity_ids.length > 0) {
      // Process specific opportunities
      const opportunities = await prisma.governmentContractDiscovery.findMany({
        where: {
          id: { in: opportunity_ids },
        },
        select: { id: true },
      })
      opportunitiesToProcess = opportunities
    } else {
      // Process all opportunities needing intelligence
      const where: any = {
        OR: [
          { intelligence_data: null },
          { intelligence_calculated_at: null },
        ],
      }

      if (force_recalculate) {
        // Force recalculate all
        where.OR = [{ id: { not: null } }]
      }

      const opportunities = await prisma.governmentContractDiscovery.findMany({
        where,
        select: { id: true },
        take: 100, // Limit to 100 at a time to avoid timeout
      })
      opportunitiesToProcess = opportunities
    }

    const results: Array<{
      opportunity_id: string
      intelligence_calculated: boolean
      signals_generated: string[]
      error?: string
    }> = []

    const errors: Array<{ opportunity_id: string; error: string }> = []

    for (const opp of opportunitiesToProcess) {
      try {
        // Run intelligence pass
        const intelligence = await runIntelligencePass(opp.id)

        // Get opportunity to check for signals
        const opportunity = await prisma.governmentContractDiscovery.findUnique({
          where: { id: opp.id },
          select: {
            incumbent_concentration_score: true,
            award_size_realism_ratio: true,
            recompete_likelihood: true,
            agency_behavior_profile: true,
            set_aside_enforcement_reality: true,
            lifecycle_stage_classification: true,
          },
        })

        // Generate signal list
        const signals: string[] = []

        if (opportunity?.incumbent_concentration_score !== null && opportunity.incumbent_concentration_score > 0.5) {
          signals.push('HIGH_INCUMBENT_LOCK_IN')
        }

        if (opportunity?.award_size_realism_ratio !== null && opportunity.award_size_realism_ratio > 2.0) {
          signals.push('SAM_VALUE_INFLATED')
        }

        if (opportunity?.recompete_likelihood !== null && opportunity.recompete_likelihood > 0.6) {
          signals.push('LIKELY_RECOMPETE')
        }

        if (opportunity?.lifecycle_stage_classification === 'SOURCES_SOUGHT') {
          signals.push('EARLY_STAGE_SHAPE')
        }

        let agencyBehavior: any = null
        if (opportunity?.agency_behavior_profile) {
          try {
            agencyBehavior = JSON.parse(opportunity.agency_behavior_profile)
          } catch {
            // Invalid JSON
          }
        }

        if (agencyBehavior?.new_vendor_acceptance_rate !== null && agencyBehavior.new_vendor_acceptance_rate < 0.2) {
          signals.push('AGENCY_RARELY_AWARDS_TO_NEW_VENDORS')
        }

        let setAsideReality: any = null
        if (opportunity?.set_aside_enforcement_reality) {
          try {
            setAsideReality = JSON.parse(opportunity.set_aside_enforcement_reality)
          } catch {
            // Invalid JSON
          }
        }

        if (setAsideReality?.enforcement_strength === 'WEAK') {
          signals.push('SET_ASIDE_ENFORCEMENT_WEAK')
        }

        results.push({
          opportunity_id: opp.id,
          intelligence_calculated: true,
          signals_generated: signals,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push({
          opportunity_id: opp.id,
          error: errorMessage,
        })
        results.push({
          opportunity_id: opp.id,
          intelligence_calculated: false,
          signals_generated: [],
          error: errorMessage,
        })
      }
    }

    return NextResponse.json({
      processed: results.length,
      errors,
      results,
    })
  } catch (error) {
    console.error('[Intelligence Pass API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
