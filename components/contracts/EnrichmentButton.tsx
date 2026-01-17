'use client'

import { useState } from 'react'

interface EnrichmentButtonProps {
  contractIds: string[]
  onComplete?: (results: any) => void
}

export default function EnrichmentButton({ contractIds, onComplete }: EnrichmentButtonProps) {
  const [isEnriching, setIsEnriching] = useState(false)
  const [progress, setProgress] = useState<{
    stage: 'idle' | 'enriching' | 'analyzing' | 'completed' | 'failed'
    current?: number
    total?: number
    message?: string
  }>({ stage: 'idle' })
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEnrich = async () => {
    if (contractIds.length === 0) {
      setError('Please select at least one contract')
      return
    }

    setIsEnriching(true)
    setError(null)
    setResults(null)
    setProgress({ stage: 'enriching', current: 0, total: contractIds.length, message: 'Fetching historical awards...' })

    try {
      const response = await fetch('/api/admin/contracts/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_ids: contractIds,
          use_database: false,
          include_trends: true,
          run_ai_analysis: true,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setProgress({ stage: 'completed', message: `Successfully enriched ${data.summary.successful} of ${data.summary.total} contracts` })
        setResults(data)
        if (onComplete) {
          onComplete(data)
        }
      } else {
        setProgress({ stage: 'failed', message: data.error || 'Enrichment failed' })
        setError(data.error || 'Enrichment failed')
      }
    } catch (err) {
      setProgress({ stage: 'failed', message: 'Network error' })
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsEnriching(false)
    }
  }

  const getStageLabel = () => {
    switch (progress.stage) {
      case 'enriching':
        return 'Stage 1: Fetching historical awards from USAspending...'
      case 'analyzing':
        return 'Stage 2: Running AI analysis...'
      case 'completed':
        return 'Completed'
      case 'failed':
        return 'Failed'
      default:
        return 'Ready'
    }
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleEnrich}
        disabled={isEnriching || contractIds.length === 0}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnriching ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Enriching & Analyzing...
          </>
        ) : (
          <>
            <span className="mr-2">✨</span>
            Enrich & Analyze Selected Contracts ({contractIds.length})
          </>
        )}
      </button>

      {progress.stage !== 'idle' && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">{getStageLabel()}</p>
            {progress.current !== undefined && progress.total !== undefined && (
              <p className="text-xs text-blue-700">
                {progress.current} / {progress.total}
              </p>
            )}
          </div>
          {progress.current !== undefined && progress.total !== undefined && (
            <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          )}
          {progress.message && (
            <p className="text-xs text-blue-700">{progress.message}</p>
          )}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">Error: {error}</p>
        </div>
      )}

      {results && results.summary && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-900 mb-2">Enrichment Complete</h4>
          <div className="space-y-1 text-sm text-green-800">
            <p>✅ Successfully enriched: {results.summary.successful}</p>
            {results.summary.failed > 0 && (
              <p>❌ Failed: {results.summary.failed}</p>
            )}
            <p>Total: {results.summary.total}</p>
          </div>
          {results.results && results.results.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-green-900 mb-1">Results:</p>
              <div className="space-y-1 text-xs text-green-700">
                {results.results.slice(0, 5).map((r: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span>{r.success ? '✅' : '❌'}</span>
                    <span>Contract {r.contractId.substring(0, 8)}...</span>
                    {r.enrichment && (
                      <span className="text-green-600">
                        ({r.enrichment.similar_awards_count || 0} awards)
                      </span>
                    )}
                  </div>
                ))}
                {results.results.length > 5 && (
                  <p className="text-green-600">...and {results.results.length - 5} more</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


