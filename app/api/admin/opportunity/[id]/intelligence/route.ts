/**
 * GET /api/admin/opportunity/[id]/intelligence
 * Expose computed intelligence signals for a single opportunity
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import {
  calculateIncumbentConcentration,
  calculateAwardSizeRealism,
  calculateRecompeteLikelihood,
} from '../../../../../lib/services/intelligence-pass'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params)

    const opportunity = await prisma.governmentContractDiscovery.findUnique({
      where: { id },
      select: {
        id: true,
        agency: true,
        naics_codes: true,
        set_aside: true,
        estimated_value: true,
        incumbent_concentration_score: true,
        award_size_realism_ratio: true,
        recompete_likelihood: true,
        agency_behavior_profile: true,
        set_aside_enforcement_reality: true,
        intelligence_data: true,
        intelligence_calculated_at: true,
        usaspending_enrichment: true,
      },
    })

    if (!opportunity) {
      return NextResponse.json(
        { success: false, error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Parse enrichment data to get intelligence metrics
    let enrichmentIntelligence: {
      incumbent_concentration_score?: number | null
      award_size_realism_ratio?: number | null
      recompete_likelihood?: number | null
    } = {}

    if (opportunity.usaspending_enrichment) {
      try {
        const enrichment = JSON.parse(opportunity.usaspending_enrichment)
        enrichmentIntelligence = enrichment.intelligence || {}
      } catch {
        // Invalid JSON, use database fields
      }
    }

    // Parse agency behavior profile
    let agencyBehavior: any = null
    if (opportunity.agency_behavior_profile) {
      try {
        agencyBehavior = JSON.parse(opportunity.agency_behavior_profile)
      } catch {
        // Invalid JSON
      }
    }

    // Parse set-aside enforcement reality
    let setAsideReality: any = null
    if (opportunity.set_aside_enforcement_reality) {
      try {
        setAsideReality = JSON.parse(opportunity.set_aside_enforcement_reality)
      } catch {
        // Invalid JSON
      }
    }

    // Get intelligence metrics (prefer database fields, fallback to enrichment)
    const incumbentConcentration =
      opportunity.incumbent_concentration_score ??
      enrichmentIntelligence.incumbent_concentration_score ??
      null

    const awardSizeRealism =
      opportunity.award_size_realism_ratio ??
      enrichmentIntelligence.award_size_realism_ratio ??
      null

    const recompeteLikelihood =
      opportunity.recompete_likelihood ??
      enrichmentIntelligence.recompete_likelihood ??
      null

    // Generate bid/no-bid recommendation
    const signals: string[] = []
    let recommendation: 'BID' | 'NO_BID' | 'MONITOR' = 'MONITOR'
    let confidence = 0.5
    const reasoning: string[] = []

    // High incumbent lock-in risk
    if (incumbentConcentration !== null && incumbentConcentration > 0.5) {
      signals.push('HIGH_INCUMBENT_LOCK_IN')
      reasoning.push(`Incumbent concentration score: ${(incumbentConcentration * 100).toFixed(1)}%`)
      recommendation = 'NO_BID'
      confidence = 0.7
    }

    // Agency rarely awards to new vendors
    if (agencyBehavior?.new_vendor_acceptance_rate !== null && agencyBehavior.new_vendor_acceptance_rate < 0.2) {
      signals.push('AGENCY_RARELY_AWARDS_TO_NEW_VENDORS')
      reasoning.push(`New vendor acceptance rate: ${(agencyBehavior.new_vendor_acceptance_rate * 100).toFixed(1)}%`)
      if (recommendation !== 'NO_BID') {
        recommendation = 'MONITOR'
        confidence = 0.6
      }
    }

    // SAM value inflated
    if (awardSizeRealism !== null && awardSizeRealism > 2.0) {
      signals.push('SAM_VALUE_INFLATED')
      reasoning.push(`Award size realism ratio: ${awardSizeRealism.toFixed(2)}x historical average`)
    }

    // Early-stage shape opportunity
    // This would come from lifecycle_stage_classification field
    // For now, we'll check if it's a Sources Sought (would need to query that field)

    // Likely recompete
    if (recompeteLikelihood !== null && recompeteLikelihood > 0.6) {
      signals.push('LIKELY_RECOMPETE')
      reasoning.push(`Recompete likelihood: ${(recompeteLikelihood * 100).toFixed(1)}%`)
      if (recommendation === 'MONITOR') {
        recommendation = 'NO_BID'
        confidence = 0.65
      }
    }

    // Set-aside enforcement weak
    if (setAsideReality?.enforcement_strength === 'WEAK') {
      signals.push('SET_ASIDE_ENFORCEMENT_WEAK')
      reasoning.push(`Set-aside compliance rate: ${(setAsideReality.compliance_rate * 100).toFixed(1)}%`)
    }

    // If no negative signals and good agency behavior, recommend BID
    if (signals.length === 0 && agencyBehavior?.new_vendor_acceptance_rate !== null && agencyBehavior.new_vendor_acceptance_rate >= 0.3) {
      recommendation = 'BID'
      confidence = 0.6
      reasoning.push('No significant risk signals detected')
    }

    const response = {
      opportunity_id: id,
      signals: {
        bid_no_bid: {
          recommendation,
          confidence,
          reasoning,
        },
        competitive_risk: {
          incumbent_lock_in: incumbentConcentration !== null && incumbentConcentration > 0.5,
          incumbent_concentration_score: incumbentConcentration,
          recompete_likelihood: recompeteLikelihood,
        },
        agency_behavior: {
          new_vendor_acceptance_rate: agencyBehavior?.new_vendor_acceptance_rate ?? null,
          typical_award_size_avg: agencyBehavior?.typical_award_size_avg ?? null,
          set_aside_enforcement_strength: setAsideReality?.enforcement_strength ?? null,
        },
        award_realism: {
          sam_value: opportunity.estimated_value ? parseFloat(opportunity.estimated_value.replace(/[$,\s]/g, '')) : null,
          historical_avg: agencyBehavior?.typical_award_size_avg ?? null,
          realism_ratio: awardSizeRealism,
        },
      },
      calculated_at: opportunity.intelligence_calculated_at?.toISOString() ?? null,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[Intelligence API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
