'use client'

import { useState, useEffect } from 'react'
import AdminNavigation from '@/components/admin/AdminNavigation'
import PipelineStats from '@/components/admin/dashboard/PipelineStats'

interface IngestionStatus {
  status: string
  batch_id?: string
  sam_gov_outage: boolean
  last_run_started_at?: string
  last_run_completed_at?: string
  last_fetched: number
  last_deduplicated: number
  last_passed_filters: number
  last_scored_above_50: number
  error_count: number
  last_error?: string
}

export default function PipelineMonitoringPage() {
  const [ingestionStatus, setIngestionStatus] = useState<IngestionStatus | null>(null)
  const [pipelineStats, setPipelineStats] = useState<any>(null)
  const [isIngesting, setIsIngesting] = useState(false)
  const [isAutoProcessing, setIsAutoProcessing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      // Load ingestion status
      const ingestionResponse = await fetch('/api/admin/sam-ingestion/list?limit=0')
      const ingestionData = await ingestionResponse.json()
      
      // Try to get ingestion status from IngestionStatus model
      // For now, we'll use a simplified approach
      if (ingestionData.success) {
        // Extract status info if available
        setIngestionStatus({
          status: 'completed',
          sam_gov_outage: false,
          last_fetched: ingestionData.opportunities?.length || 0,
          last_deduplicated: 0,
          last_passed_filters: 0,
          last_scored_above_50: 0,
          error_count: 0,
        })
      }

      // Load pipeline stats
      const pipelineResponse = await fetch('/api/admin/pipeline/status')
      const pipelineData = await pipelineResponse.json()
      if (pipelineData.success && pipelineData.stats) {
        setPipelineStats(pipelineData.stats)
      }
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunIngestion = async () => {
    if (!confirm('Run SAM.gov ingestion pipeline? This may take several minutes.')) {
      return
    }

    setIsIngesting(true)
    try {
      const response = await fetch('/api/admin/sam-ingestion/ingest', {
        method: 'POST',
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Ingestion started! Processing ${data.ingested || 0} opportunities.`)
        setTimeout(loadStatus, 5000)
      } else {
        alert(data.error || 'Failed to start ingestion')
      }
    } catch (error) {
      console.error('Error starting ingestion:', error)
      alert('Failed to start ingestion')
    } finally {
      setIsIngesting(false)
    }
  }

  const handleAutoProcess = async () => {
    if (!confirm('Auto-process all contracts with score >= 50? This may take a while.')) {
      return
    }

    setIsAutoProcessing(true)
    try {
      const response = await fetch('/api/admin/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_process: true,
          min_score: 50,
          limit: 100,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Started auto-processing ${data.stats?.total || 0} contracts.`)
        setTimeout(loadStatus, 5000)
      } else {
        alert(data.error || 'Failed to start auto-processing')
      }
    } catch (error) {
      console.error('Error starting auto-processing:', error)
      alert('Failed to start auto-processing')
    } finally {
      setIsAutoProcessing(false)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pipeline Monitoring</h1>
            <p className="text-base text-neutral-600">
              Monitor ingestion status, pipeline processing, and system health
            </p>
          </div>
        </div>
      </section>

      {/* Pipeline Statistics */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        <PipelineStats />
      </section>

      {/* Manual Triggers */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Manual Triggers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* SAM.gov Ingestion */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">SAM.gov Ingestion</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Run the ingestion pipeline to fetch, filter, and score opportunities from SAM.gov
              </p>
              {ingestionStatus && (
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className={`font-medium ${
                      ingestionStatus.status === 'running' ? 'text-yellow-600' :
                      ingestionStatus.status === 'completed' ? 'text-green-600' :
                      'text-neutral-600'
                    }`}>
                      {ingestionStatus.status}
                    </span>
                  </div>
                  {ingestionStatus.last_fetched > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Last Fetched:</span>
                      <span className="font-medium text-neutral-900">
                        {ingestionStatus.last_fetched.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {ingestionStatus.error_count > 0 && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600">Errors:</span>
                      <span className="font-medium text-red-600">
                        {ingestionStatus.error_count}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleRunIngestion}
                disabled={isIngesting}
                className="w-full px-4 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isIngesting ? 'Running Ingestion...' : 'Run SAM.gov Ingestion'}
              </button>
            </div>

            {/* Auto-Process Pipeline */}
            <div className="border border-neutral-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Auto-Process Pipeline</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Automatically process contracts with score ≥ 50 through scraping, enrichment, and AI analysis
              </p>
              {pipelineStats && (
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Total Contracts:</span>
                    <span className="font-medium text-neutral-900">
                      {pipelineStats.total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Ready:</span>
                    <span className="font-medium text-emerald-600">
                      {(pipelineStats.by_status?.ready || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">With Errors:</span>
                    <span className="font-medium text-red-600">
                      {pipelineStats.with_errors.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={handleAutoProcess}
                disabled={isAutoProcessing}
                className="w-full px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAutoProcessing ? 'Processing...' : 'Auto-Process (≥50)'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* System Health */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">System Health</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-neutral-600 mt-4">Loading system status...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Pipeline Status</div>
                  <div className="text-lg font-semibold text-green-900">Operational</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">API Status</div>
                  <div className="text-lg font-semibold text-blue-900">Connected</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Database</div>
                  <div className="text-lg font-semibold text-purple-900">Healthy</div>
                </div>
              </div>

              {ingestionStatus?.sam_gov_outage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-red-600 text-xl">⚠️</div>
                    <div>
                      <div className="text-sm font-semibold text-red-900 mb-1">SAM.gov Outage Detected</div>
                      <div className="text-sm text-red-700">
                        The SAM.gov API appears to be experiencing issues. Ingestion may be delayed.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

