'use client'

import { useState, useEffect } from 'react'

interface IngestionStatusProps {
  onStatusChange?: () => void
}

interface Status {
  status: string
  batchId?: string
  samGovOutage: boolean
  outageReason?: string
  outageDetectedAt?: string
  lastRunStartedAt?: string
  lastRunCompletedAt?: string
  lastFetched?: number
  lastDeduplicated?: number
  lastPassedFilters?: number
  lastScoredAbove50?: number
  lastError?: string
}

export default function IngestionStatus({ onStatusChange }: IngestionStatusProps) {
  const [status, setStatus] = useState<Status | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/admin/capture/ingest')
      const data = await response.json()
      if (data.success) {
        setStatus(data)
        if (onStatusChange && data.status === 'completed') {
          onStatusChange()
        }
      }
    } catch (error) {
      console.error('Error loading status:', error)
    }
  }

  const handleRunIngest = async () => {
    setIsRunning(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/capture/ingest', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ingestion failed')
      }

      // Reload status
      await loadStatus()
      if (onStatusChange) {
        onStatusChange()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ingestion failed')
    } finally {
      setIsRunning(false)
    }
  }

  if (!status) {
    return null
  }

  return (
    <div className="bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
        {/* Outage Banner */}
        {status.samGovOutage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                  SAM.gov temporarily unavailable
                </h3>
                <p className="text-sm text-yellow-700">
                  {status.outageReason || 'SAM.gov API is currently suspended. Retrying automatically.'}
                </p>
                {status.outageDetectedAt && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Detected: {new Date(status.outageDetectedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-sm text-neutral-600">Status:</span>
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                  status.status === 'running'
                    ? 'bg-blue-100 text-blue-800'
                    : status.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : status.status === 'outage'
                    ? 'bg-yellow-100 text-yellow-800'
                    : status.status === 'failed'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </span>
            </div>

            {status.lastRunCompletedAt && (
              <div className="text-sm text-neutral-600">
                Last run: {new Date(status.lastRunCompletedAt).toLocaleString()}
              </div>
            )}

            {status.lastFetched !== undefined && status.status === 'completed' && (
              <div className="text-sm text-neutral-600">
                {status.lastFetched} fetched, {status.lastScoredAbove50} scored ≥ 50
              </div>
            )}
          </div>

          <button
            onClick={handleRunIngest}
            disabled={isRunning || status.status === 'running' || status.samGovOutage}
            className="px-6 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRunning ? 'Running...' : 'Run Ingest'}
          </button>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

