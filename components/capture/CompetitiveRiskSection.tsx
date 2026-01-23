/**
 * Competitive Risk Section Component
 * Shell component for competitive landscape intelligence
 */

'use client'

interface CompetitiveRiskSectionProps {
  data?: {
    incumbentLockIn: boolean
    incumbentConcentrationScore: number | null
    recompeteLikelihood: number | null
  }
}

export default function CompetitiveRiskSection({ data }: CompetitiveRiskSectionProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Competitive Risk</h3>
        <p className="text-neutral-500 text-sm">Competitive risk data not yet calculated</p>
      </div>
    )
  }

  const getRiskLevel = (score: number | null) => {
    if (score === null) return { label: 'Unknown', color: 'text-neutral-500' }
    if (score >= 0.5) return { label: 'High Risk', color: 'text-red-600' }
    if (score >= 0.25) return { label: 'Moderate Risk', color: 'text-yellow-600' }
    return { label: 'Low Risk', color: 'text-green-600' }
  }

  const incumbentRisk = getRiskLevel(data.incumbentConcentrationScore)
  const recompeteRisk = getRiskLevel(data.recompeteLikelihood)

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Competitive Risk</h3>
      
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border-2 ${
          data.incumbentLockIn
            ? 'border-red-200 bg-red-50'
            : 'border-neutral-200 bg-neutral-50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-900">Incumbent Lock-In</span>
            {data.incumbentLockIn && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                High Risk
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-600">
            Concentration Score: {data.incumbentConcentrationScore !== null
              ? `${Math.round(data.incumbentConcentrationScore * 100)}%`
              : 'N/A'}
          </div>
          {data.incumbentConcentrationScore !== null && (
            <div className={`text-xs mt-1 ${incumbentRisk.color}`}>
              {incumbentRisk.label}
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-900">Recompete Likelihood</span>
            {data.recompeteLikelihood !== null && data.recompeteLikelihood > 0.6 && (
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                Likely
              </span>
            )}
          </div>
          <div className="text-sm text-neutral-600">
            Probability: {data.recompeteLikelihood !== null
              ? `${Math.round(data.recompeteLikelihood * 100)}%`
              : 'N/A'}
          </div>
          {data.recompeteLikelihood !== null && (
            <div className={`text-xs mt-1 ${recompeteRisk.color}`}>
              {recompeteRisk.label}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
