/**
 * Decision Summary Component
 * Above-the-fold decision explanation on detail page
 */

'use client'

import { OpportunityIntel } from '@/types/capture'

interface DecisionSummaryProps {
  intel: OpportunityIntel
  onAction?: (action: 'BID' | 'NO_BID' | 'MONITOR' | 'INVESTIGATE') => void
}

export default function DecisionSummary({ intel, onAction }: DecisionSummaryProps) {
  const getVerdictColor = () => {
    const action = intel.verdict.recommendedAction
    if (action === 'BID') return 'bg-green-100 text-green-800 border-green-300'
    if (action === 'NO_BID') return 'bg-red-100 text-red-800 border-red-300'
    if (action === 'MONITOR') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-blue-100 text-blue-800 border-blue-300'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-green-600'
    if (confidence >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm p-6 mb-6">
      {/* Verdict Badge */}
      <div className="mb-4">
        <div className={`inline-block px-4 py-2 text-lg font-bold rounded-lg border ${getVerdictColor()}`}>
          {intel.verdict.label}
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <p className="text-neutral-700 leading-relaxed">{intel.verdict.explanation}</p>
      </div>

      {/* Reasoning Points */}
      {intel.verdict.reasoning.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-neutral-900 mb-2">Key Factors:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-neutral-600">
            {intel.verdict.reasoning.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Action & Confidence */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-sm text-neutral-600">Recommended Action: </span>
            <span className="text-sm font-semibold text-neutral-900">
              {intel.verdict.recommendedAction}
            </span>
          </div>
          <div>
            <span className="text-sm text-neutral-600">Confidence: </span>
            <span className={`text-sm font-semibold ${getConfidenceColor(intel.verdict.confidence)}`}>
              {Math.round(intel.verdict.confidence * 100)}%
            </span>
          </div>
        </div>

        {onAction && (
          <button
            onClick={() => onAction(intel.verdict.recommendedAction)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              intel.verdict.recommendedAction === 'BID'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : intel.verdict.recommendedAction === 'NO_BID'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : intel.verdict.recommendedAction === 'MONITOR'
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {intel.verdict.recommendedAction === 'BID' && 'Proceed to Bid'}
            {intel.verdict.recommendedAction === 'NO_BID' && 'Mark as No-Bid'}
            {intel.verdict.recommendedAction === 'MONITOR' && 'Add to Monitor List'}
            {intel.verdict.recommendedAction === 'INVESTIGATE' && 'Investigate Further'}
          </button>
        )}
      </div>
    </div>
  )
}
