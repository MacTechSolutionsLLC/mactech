'use client'

import { useState } from 'react'

interface RunIngestButtonProps {
  onIngestComplete?: () => void
}

export default function RunIngestButton({ onIngestComplete }: RunIngestButtonProps) {
  const [isIngesting, setIsIngesting] = useState(false)
  const [ingestionStats, setIngestionStats] = useState<{
    fetched: number
    deduplicated: number
    passedFilters: number
    scoredAbove50: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleIngest = async () => {
    try {
      setIsIngesting(true)
      setError(null)
      
      const response = await fetch('/api/admin/sam/ingest', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ingestion failed')
      }
      
      setIngestionStats({
        fetched: data.fetched,
        deduplicated: data.deduplicated,
        passedFilters: data.passedFilters,
        scoredAbove50: data.scoredAbove50,
      })
      
      // Trigger reload of opportunities
      if (onIngestComplete) {
        onIngestComplete()
      }
    } catch (err) {
      console.error('Error ingesting:', err)
      setError(err instanceof Error ? err.message : 'Ingestion failed')
    } finally {
      setIsIngesting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div>
          <h2 className="heading-3 mb-2">Ingestion Pipeline</h2>
          <p className="text-body-sm text-neutral-600">
            Run the ingestion pipeline to fetch, filter, score, and AI-analyze opportunities from SAM.gov
          </p>
        </div>
        <button
          onClick={handleIngest}
          disabled={isIngesting}
          className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isIngesting ? 'Ingesting...' : 'Run SAM Ingest'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-sm mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-body-sm font-semibold text-red-900 mb-1">Error</h3>
              <p className="text-body-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {ingestionStats && (
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
          <h3 className="text-body-sm font-semibold text-neutral-900 mb-2">Last Ingestion Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
            <div>
              <span className="text-neutral-600">Fetched:</span>
              <span className="ml-2 font-medium text-neutral-900">{ingestionStats.fetched.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-600">Deduplicated:</span>
              <span className="ml-2 font-medium text-neutral-900">{ingestionStats.deduplicated.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-600">Passed Filters:</span>
              <span className="ml-2 font-medium text-neutral-900">{ingestionStats.passedFilters.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-600">Scored ≥ 50:</span>
              <span className="ml-2 font-medium text-neutral-900">{ingestionStats.scoredAbove50.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

