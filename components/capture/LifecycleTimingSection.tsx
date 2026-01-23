/**
 * Lifecycle Timing Section Component
 * Shell component for lifecycle and timing intelligence
 */

'use client'

interface LifecycleTimingSectionProps {
  data?: {
    stage: 'SOURCES_SOUGHT' | 'PRE_SOLICITATION' | 'SOLICITATION' | 'AWARD' | 'UNKNOWN'
    daysUntilDeadline: number | null
  }
}

export default function LifecycleTimingSection({ data }: LifecycleTimingSectionProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lifecycle Timing</h3>
        <p className="text-neutral-500 text-sm">Lifecycle timing data not yet calculated</p>
      </div>
    )
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      'SOURCES_SOUGHT': 'Sources Sought',
      'PRE_SOLICITATION': 'Pre-Solicitation',
      'SOLICITATION': 'Solicitation',
      'AWARD': 'Award',
      'UNKNOWN': 'Unknown',
    }
    return labels[stage] || stage
  }

  const getStageColor = (stage: string) => {
    if (stage === 'SOURCES_SOUGHT') return 'bg-green-100 text-green-800 border-green-300'
    if (stage === 'PRE_SOLICITATION') return 'bg-blue-100 text-blue-800 border-blue-300'
    if (stage === 'SOLICITATION') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-neutral-100 text-neutral-800 border-neutral-300'
  }

  const getDeadlineUrgency = (days: number | null) => {
    if (days === null) return { label: 'Unknown', color: 'text-neutral-500' }
    if (days < 0) return { label: 'Past Deadline', color: 'text-red-600' }
    if (days === 0) return { label: 'Due Today', color: 'text-red-600' }
    if (days <= 7) return { label: 'Urgent', color: 'text-red-600' }
    if (days <= 14) return { label: 'Soon', color: 'text-yellow-600' }
    return { label: 'Upcoming', color: 'text-green-600' }
  }

  const urgency = getDeadlineUrgency(data.daysUntilDeadline)

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lifecycle Timing</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-sm text-neutral-600 mb-2">Current Stage</div>
          <div className={`inline-block px-4 py-2 text-lg font-semibold rounded-lg border ${getStageColor(data.stage)}`}>
            {getStageLabel(data.stage)}
          </div>
          {data.stage === 'SOURCES_SOUGHT' && (
            <p className="text-sm text-green-700 mt-2">
              Early-stage opportunity - ideal time to shape requirements
            </p>
          )}
        </div>

        <div>
          <div className="text-sm text-neutral-600 mb-2">Response Deadline</div>
          <div className={`text-2xl font-bold ${urgency.color}`}>
            {data.daysUntilDeadline !== null
              ? data.daysUntilDeadline < 0
                ? 'Past'
                : data.daysUntilDeadline === 0
                ? 'Today'
                : `${data.daysUntilDeadline} days`
              : 'N/A'}
          </div>
          <div className={`text-xs mt-1 ${urgency.color}`}>
            {urgency.label}
          </div>
        </div>
      </div>
    </div>
  )
}
