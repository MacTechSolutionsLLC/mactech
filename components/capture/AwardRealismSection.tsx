/**
 * Award Realism Section Component
 * Shell component for award size realism intelligence
 */

'use client'

interface AwardRealismSectionProps {
  data?: {
    samValue: number | null
    historicalAvg: number | null
    realismRatio: number | null
  }
}

export default function AwardRealismSection({ data }: AwardRealismSectionProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Award Reality</h3>
        <p className="text-neutral-500 text-sm">Award realism data not yet calculated</p>
      </div>
    )
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const getRealismLabel = (ratio: number | null) => {
    if (ratio === null) return { label: 'Unknown', color: 'text-neutral-500' }
    if (ratio > 2.0) return { label: 'Inflated', color: 'text-red-600' }
    if (ratio < 0.5) return { label: 'Below Average', color: 'text-yellow-600' }
    return { label: 'Realistic', color: 'text-green-600' }
  }

  const realism = getRealismLabel(data.realismRatio)

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Award Reality</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-neutral-600 mb-1">SAM.gov Estimated Value</div>
          <div className="text-2xl font-bold text-neutral-900">
            {formatCurrency(data.samValue)}
          </div>
        </div>

        <div>
          <div className="text-sm text-neutral-600 mb-1">Historical Average</div>
          <div className="text-2xl font-bold text-neutral-900">
            {formatCurrency(data.historicalAvg)}
          </div>
        </div>

        <div>
          <div className="text-sm text-neutral-600 mb-1">Realism Ratio</div>
          <div className={`text-2xl font-bold ${realism.color}`}>
            {data.realismRatio !== null
              ? `${data.realismRatio.toFixed(2)}x`
              : 'N/A'}
          </div>
          {data.realismRatio !== null && (
            <div className={`text-xs mt-1 ${realism.color}`}>
              {realism.label}
            </div>
          )}
        </div>
      </div>

      {data.realismRatio !== null && data.realismRatio > 2.0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            SAM.gov value is significantly higher than historical averages. This may indicate aspirational pricing or includes options.
          </p>
        </div>
      )}
    </div>
  )
}
