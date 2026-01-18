'use client'

import { useEffect, useState } from 'react'

interface PipelineStatsData {
  total: number
  by_status: Record<string, number>
  auto_processed: number
  with_errors: number
}

export default function PipelineStats() {
  const [stats, setStats] = useState<PipelineStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/pipeline/status')
      const data = await response.json()
      if (data.success && data.stats) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading pipeline stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse">
            <div className="h-4 bg-neutral-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-neutral-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statusLabels: Record<string, string> = {
    discovered: 'Discovered',
    scraping: 'Scraping',
    scraped: 'Scraped',
    enriching: 'Enriching',
    enriched: 'Enriched',
    analyzing: 'Analyzing',
    analyzed: 'Analyzed',
    ready: 'Ready',
    flagged: 'Flagged',
    ignored: 'Ignored',
    error: 'Error',
  }

  const statusColors: Record<string, string> = {
    discovered: 'bg-blue-50 text-blue-700 border-blue-200',
    scraping: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    scraped: 'bg-green-50 text-green-700 border-green-200',
    enriching: 'bg-purple-50 text-purple-700 border-purple-200',
    enriched: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    analyzing: 'bg-pink-50 text-pink-700 border-pink-200',
    analyzed: 'bg-teal-50 text-teal-700 border-teal-200',
    ready: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    flagged: 'bg-orange-50 text-orange-700 border-orange-200',
    ignored: 'bg-neutral-50 text-neutral-700 border-neutral-200',
    error: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="text-sm text-neutral-600 mb-1">Total Contracts</div>
          <div className="text-2xl font-bold text-neutral-900">{stats.total.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="text-sm text-neutral-600 mb-1">Auto-Processed</div>
          <div className="text-2xl font-bold text-neutral-900">{stats.auto_processed.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="text-sm text-neutral-600 mb-1">With Errors</div>
          <div className="text-2xl font-bold text-red-600">{stats.with_errors.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
          <div className="text-sm text-neutral-600 mb-1">Ready</div>
          <div className="text-2xl font-bold text-emerald-600">
            {stats.by_status.ready || 0}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-neutral-900 mb-3">Pipeline Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {Object.entries(stats.by_status).map(([status, count]) => (
            <div
              key={status}
              className={`rounded-lg border p-2 ${statusColors[status] || 'bg-neutral-50 text-neutral-700 border-neutral-200'}`}
            >
              <div className="text-xs font-medium mb-1">{statusLabels[status] || status}</div>
              <div className="text-lg font-bold">{count.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

