/**
 * Intelligence Signal Generation
 * Helper functions to generate dashboard signals from intelligence data
 */

import { GovernmentContractDiscovery } from '@prisma/client'

export type IntelligenceSignal =
  | 'HIGH_INCUMBENT_LOCK_IN'
  | 'AGENCY_RARELY_AWARDS_TO_NEW_VENDORS'
  | 'SAM_VALUE_INFLATED'
  | 'EARLY_STAGE_SHAPE'
  | 'LIKELY_RECOMPETE'
  | 'SET_ASIDE_ENFORCEMENT_WEAK'
  | 'CAPABILITY_GAP_RISK'
  | 'SET_ASIDE_ADVANTAGE_REQUIRED'

export interface SignalInfo {
  signal: IntelligenceSignal
  severity: 'high' | 'medium' | 'low'
  message: string
  tooltip: string
}

/**
 * Generate intelligence signals for an opportunity
 */
export function generateIntelligenceSignals(
  opportunity: Partial<GovernmentContractDiscovery>
): SignalInfo[] {
  const signals: SignalInfo[] = []

  // High Incumbent Lock-In Risk
  const incumbentScore = opportunity.incumbent_concentration_score
  if (incumbentScore != null && incumbentScore > 0.5) {
    signals.push({
      signal: 'HIGH_INCUMBENT_LOCK_IN',
      severity: 'high',
      message: 'High Incumbent Lock-In Risk',
      tooltip: `Incumbent concentration score: ${(incumbentScore * 100).toFixed(1)}%. Market is dominated by a small number of vendors.`,
    })
  }

  // Agency Rarely Awards to New Vendors
  if (opportunity.agency_behavior_profile) {
    try {
      const profile = JSON.parse(opportunity.agency_behavior_profile)
      if (
        profile.new_vendor_acceptance_rate !== null &&
        profile.new_vendor_acceptance_rate < 0.2
      ) {
        signals.push({
          signal: 'AGENCY_RARELY_AWARDS_TO_NEW_VENDORS',
          severity: 'medium',
          message: 'Agency Rarely Awards to New Vendors',
          tooltip: `New vendor acceptance rate: ${(profile.new_vendor_acceptance_rate * 100).toFixed(1)}%. This agency typically awards to existing vendors.`,
        })
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  // SAM Value Inflated vs Historical Awards
  const realismRatio = opportunity.award_size_realism_ratio
  if (realismRatio != null && realismRatio > 2.0) {
    signals.push({
      signal: 'SAM_VALUE_INFLATED',
      severity: 'medium',
      message: 'SAM Value Inflated vs Historical Awards',
      tooltip: `Award size realism ratio: ${realismRatio.toFixed(2)}x historical average. SAM.gov value may be aspirational or include options.`,
    })
  }

  // Early-Stage Shape Opportunity
  if (opportunity.lifecycle_stage_classification === 'SOURCES_SOUGHT') {
    signals.push({
      signal: 'EARLY_STAGE_SHAPE',
      severity: 'low',
      message: 'Early-Stage Shape Opportunity',
      tooltip: 'This is a Sources Sought notice - an early-stage opportunity to shape requirements before formal solicitation.',
    })
  }

  // Likely Recompete
  const recompeteLikelihood = opportunity.recompete_likelihood
  if (recompeteLikelihood != null && recompeteLikelihood > 0.6) {
    signals.push({
      signal: 'LIKELY_RECOMPETE',
      severity: 'medium',
      message: 'Likely Recompete',
      tooltip: `Recompete likelihood: ${(recompeteLikelihood * 100).toFixed(1)}%. Same vendor has won recent awards for this agency+NAICS combination.`,
    })
  }

  // Set-Aside May Not Be Enforced
  if (opportunity.set_aside_enforcement_reality) {
    try {
      const reality = JSON.parse(opportunity.set_aside_enforcement_reality)
      if (reality.enforcement_strength === 'WEAK' && reality.compliance_rate != null) {
        signals.push({
          signal: 'SET_ASIDE_ENFORCEMENT_WEAK',
          severity: 'medium',
          message: 'Set-Aside May Not Be Enforced',
          tooltip: `Set-aside compliance rate: ${(reality.compliance_rate * 100).toFixed(1)}%. Historical awards show weak enforcement of stated set-aside requirements.`,
        })
      }
    } catch {
      // Invalid JSON, skip
    }
  }

  return signals
}

/**
 * Get signal badge color based on severity
 */
export function getSignalBadgeColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
  }
}
