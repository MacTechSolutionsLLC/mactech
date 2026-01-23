/**
 * Opportunity Queue Component
 * Reusable priority-sorted feed of opportunities
 */

'use client'

import { OpportunitySummary, IntentFilters } from '@/types/capture'
import OpportunityRow from './OpportunityRow'

interface OpportunityQueueProps {
  opportunities: OpportunitySummary[]
  loading?: boolean
  onOpportunityClick: (id: string) => void
  onFlag: (id: string) => void
  onIgnore: (id: string) => void
  filters?: IntentFilters
}

export default function OpportunityQueue({
  opportunities,
  loading = false,
  onOpportunityClick,
  onFlag,
  onIgnore,
  filters,
}: OpportunityQueueProps) {
  // Apply intent filters
  const filteredOpportunities = opportunities.filter(opp => {
    if (!filters) return true

    if (filters.shapeableOnly) {
      const hasShapeable = opp.intelligenceFlags.some(f => f.type === 'EARLY_STAGE_SHAPE')
      if (!hasShapeable) return false
    }

    if (filters.highIncumbentRisk) {
      const hasHighRisk = opp.intelligenceFlags.some(
        f => f.type === 'HIGH_INCUMBENT_LOCK_IN' && f.severity === 'high'
      )
      if (!hasHighRisk) return false
    }

    if (filters.newVendorFriendly) {
      const hasNewVendorFriendly = opp.intelligenceFlags.some(
        f => f.type === 'AGENCY_RARELY_AWARDS_TO_NEW_VENDORS'
      )
      // Invert: if agency rarely awards, it's NOT new vendor friendly
      if (hasNewVendorFriendly) return false
    }

    if (filters.earlyLifecycleOnly) {
      const hasEarlyStage = opp.intelligenceFlags.some(
        f => f.type === 'EARLY_STAGE_SHAPE'
      )
      const isPreSolicitation = opp.pipelineStatus === 'discovered' || opp.pipelineStatus === 'scraping'
      if (!hasEarlyStage && !isPreSolicitation) return false
    }

    return true
  })

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse"
          >
            <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (filteredOpportunities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
        <p className="text-neutral-600 mb-2">No opportunities match your filters</p>
        <p className="text-sm text-neutral-500">
          Try adjusting your intent filters or check back later
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredOpportunities.map(opportunity => (
        <OpportunityRow
          key={opportunity.id}
          opportunity={opportunity}
          onViewIntel={() => onOpportunityClick(opportunity.id)}
          onFlag={() => onFlag(opportunity.id)}
          onIgnore={() => onIgnore(opportunity.id)}
        />
      ))}
    </div>
  )
}
