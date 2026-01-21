'use client'

import { useState, useEffect } from 'react'

interface UsaSpendingIngestProps {
  onIngestComplete?: () => void
}

interface IngestionResult {
  success: boolean
  message?: string
  result?: {
    batchId: string
    ingested: number
    saved: number
    skipped: number
    errors: string[]
    entityEnrichment?: {
      enriched: number
      failed: number
      skipped: number
    }
  }
  error?: string
}

export default function UsaSpendingIngest({ onIngestComplete }: UsaSpendingIngestProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<IngestionResult | null>(null)
  const [awardCount, setAwardCount] = useState<number | null>(null)

  useEffect(() => {
    loadAwardCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAwardCount = async () => {
    try {
      const response = await fetch('/api/admin/usaspending/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          use_database: true,
          limit: 1,
        }),
      })
      const data = await response.json()
      if (data.success && data.page_metadata?.total !== undefined) {
        setAwardCount(data.page_metadata.total)
      }
    } catch (error) {
      console.error('Error loading award count:', error)
    }
  }

  const handleFetchAwards = async () => {
    setIsRunning(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/capture/usaspending/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ingestion failed')
      }

      setResult({
        success: true,
        result: {
          batchId: `batch-${Date.now()}`,
          ingested: data.total || 0,
          saved: data.total || 0,
          skipped: 0,
          errors: data.errors || [],
        },
      })
      
      // Reload award count
      await loadAwardCount()
      
      if (onIngestComplete) {
        onIngestComplete()
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Ingestion failed',
      })
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">
            USAspending.gov Awards
          </h2>
          <p className="text-sm text-neutral-600">
            Fetch historical award data to populate the dashboard
          </p>
        </div>
        <button
          onClick={handleFetchAwards}
          disabled={isRunning}
          className="px-6 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? 'Fetching...' : 'Fetch USAspending Awards'}
        </button>
      </div>

      {/* Current Statistics */}
      {awardCount !== null && (
        <div className="mb-4 p-4 bg-neutral-50 rounded-lg">
          <div className="text-sm text-neutral-600 mb-1">Current Awards in Database</div>
          <div className="text-2xl font-bold text-neutral-900">{awardCount.toLocaleString()}</div>
        </div>
      )}

      {/* Default Filters Info */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <div className="text-sm font-medium text-blue-900 mb-2">Default Filters:</div>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Date Range: Last 12 months (to avoid API overload)</li>
          <li>• NAICS Codes: 541512, 541511, 541519</li>
          <li>• Award Types: Contracts and Grants (A, B)</li>
          <li>• Agency: Department of Defense</li>
          <li>• Limit: 25 awards per page (max 5 pages = 125 awards)</li>
          <li>• Features: Relevance scoring, signal generation, SAM.gov Entity API enrichment</li>
        </ul>
      </div>

      {/* Results */}
      {result && (
        <div
          className={`p-4 rounded-lg border ${
            result.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {result.success ? (
              <svg
                className="w-5 h-5 text-green-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <div className="flex-1">
              <h3
                className={`text-sm font-semibold mb-2 ${
                  result.success ? 'text-green-900' : 'text-red-900'
                }`}
              >
                {result.success ? 'Ingestion Completed' : 'Ingestion Failed'}
              </h3>
              {result.success && result.result && (
                <div className="space-y-2 text-sm">
                  <div className="text-neutral-700">
                    <span className="font-medium">Fetched:</span> {result.result.ingested.toLocaleString()} awards
                  </div>
                  <div className="text-neutral-700">
                    <span className="font-medium">Saved:</span> {result.result.saved.toLocaleString()} awards
                  </div>
                  {result.result.skipped > 0 && (
                    <div className="text-neutral-700">
                      <span className="font-medium">Skipped:</span> {result.result.skipped.toLocaleString()} awards
                    </div>
                  )}
                  {result.result.entityEnrichment && (
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="font-medium text-green-900 mb-1">Entity API Enrichment:</div>
                      <div className="text-green-700">
                        <span className="font-medium">Enriched:</span> {result.result.entityEnrichment.enriched.toLocaleString()} vendors
                      </div>
                      {result.result.entityEnrichment.failed > 0 && (
                        <div className="text-green-700">
                          <span className="font-medium">Failed:</span> {result.result.entityEnrichment.failed.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                  {result.result.errors && result.result.errors.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-yellow-200">
                      <div className="text-xs text-yellow-700">
                        <span className="font-medium">Warnings:</span> {result.result.errors.length} errors occurred
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!result.success && result.error && (
                <p className="text-sm text-red-700">{result.error}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div className="text-sm text-blue-700">
              Fetching awards from USAspending.gov and enriching with Entity API...
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

