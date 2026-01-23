/**
 * Opportunity Row Component
 * Single decision unit representing one opportunity
 */

'use client'

import { OpportunitySummary, IntelligenceFlag } from '@/types/capture'
import { getSignalBadgeColor } from '@/lib/services/intelligence-signals'

interface OpportunityRowProps {
  opportunity: OpportunitySummary
  onViewIntel: () => void
  onFlag: () => void
  onIgnore: () => void
}

export default function OpportunityRow({
  opportunity,
  onViewIntel,
  onFlag,
  onIgnore,
}: OpportunityRowProps) {
  // Determine border color based on risk/opportunity
  const getBorderColor = () => {
    const hasHighRisk = opportunity.intelligenceFlags.some(f => f.severity === 'high' && f.type !== 'EARLY_STAGE_SHAPE')
    const hasEarlyStage = opportunity.intelligenceFlags.some(f => f.type === 'EARLY_STAGE_SHAPE')
    
    if (hasHighRisk) return 'border-l-4 border-red-500'
    if (hasEarlyStage) return 'border-l-4 border-green-500'
    if (opportunity.intelligenceFlags.some(f => f.severity === 'medium')) return 'border-l-4 border-yellow-500'
    return 'border-l-4 border-neutral-300'
  }

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null
    try {
      const date = new Date(deadline)
      const now = new Date()
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Past deadline'
      if (diffDays === 0) return 'Due today'
      if (diffDays <= 7) return `${diffDays}d left`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return deadline
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border border-neutral-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer ${getBorderColor()}`}
      onClick={onViewIntel}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title, Agency, Badges */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-2">
            <h3 className="text-lg font-semibold text-neutral-900 flex-1">
              {opportunity.title}
            </h3>
            {opportunity.flagged && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Flagged
              </span>
            )}
            {opportunity.ignored && (
              <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-600 rounded">
                Ignored
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {opportunity.agency && (
              <span className="text-sm text-neutral-600">{opportunity.agency}</span>
            )}
            {opportunity.naicsCodes.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded">
                NAICS: {opportunity.naicsCodes[0]}
              </span>
            )}
            {opportunity.setAside.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                {opportunity.setAside[0]}
              </span>
            )}
          </div>

          {/* Intelligence Flags */}
          {opportunity.intelligenceFlags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {opportunity.intelligenceFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-1 text-xs font-medium rounded border ${getSignalBadgeColor(flag.severity)}`}
                  title={flag.tooltip}
                >
                  {flag.message}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Score, Deadline, Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-2xl font-bold text-neutral-900">
              {opportunity.relevanceScore}
            </div>
            <div className="text-xs text-neutral-500">Score</div>
          </div>
          
          {opportunity.deadline && (
            <div className="text-right">
              <div className="text-sm font-medium text-neutral-700">
                {formatDeadline(opportunity.deadline)}
              </div>
              <div className="text-xs text-neutral-500">Deadline</div>
            </div>
          )}

          <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onViewIntel}
              className="px-3 py-1.5 text-sm font-medium text-accent-700 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
            >
              View Intel
            </button>
            <button
              onClick={onFlag}
              className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Flag
            </button>
            <button
              onClick={onIgnore}
              className="px-3 py-1.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
