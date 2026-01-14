'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import OpportunityTable from './components/OpportunityTable'
import FilterControls from './components/FilterControls'

interface Opportunity {
  id: string
  title: string
  agency: string | null
  naicsCodes: string[]
  setAside: string[]
  daysRemaining: number | null
  score: number
  url: string
  noticeId: string | null
  solicitationNumber: string | null
  deadline: string | null
  flagged: boolean
  flaggedAt: string | null
  createdAt: string
}

export default function SamCapturePage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isIngesting, setIsIngesting] = useState(false)
  const [ingestionStats, setIngestionStats] = useState<{
    ingested: number
    filtered: number
    shortlisted: number
  } | null>(null)
  const [minScore, setMinScore] = useState(50)
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        minScore: String(minScore),
        sort: sortBy,
        limit: '100',
      })
      
      const response = await fetch(`/api/admin/sam-ingestion/list?${params.toString()}`)
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load opportunities')
      }
      
      setOpportunities(data.opportunities || [])
    } catch (err) {
      console.error('Error loading opportunities:', err)
      setError(err instanceof Error ? err.message : 'Failed to load opportunities')
    } finally {
      setLoading(false)
    }
  }

  const handleIngest = async () => {
    try {
      setIsIngesting(true)
      setError(null)
      
      const response = await fetch('/api/admin/sam-ingestion/ingest', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Ingestion failed')
      }
      
      setIngestionStats({
        ingested: data.ingested,
        filtered: data.filtered,
        shortlisted: data.shortlisted,
      })
      
      // Reload opportunities after ingestion
      await loadOpportunities()
    } catch (err) {
      console.error('Error ingesting:', err)
      setError(err instanceof Error ? err.message : 'Ingestion failed')
    } finally {
      setIsIngesting(false)
    }
  }

  const handleIgnore = async (noticeId: string) => {
    try {
      const response = await fetch('/api/admin/sam-ingestion/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to ignore opportunity')
      }
      
      // Reload opportunities
      await loadOpportunities()
    } catch (err) {
      console.error('Error ignoring opportunity:', err)
      alert(err instanceof Error ? err.message : 'Failed to ignore opportunity')
    }
  }

  const handleFlag = async (noticeId: string, flagged: boolean) => {
    try {
      const response = await fetch('/api/admin/sam-ingestion/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId, flagged }),
      })
      
      const data = await response.json()
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to flag opportunity')
      }
      
      // Reload opportunities
      await loadOpportunities()
    } catch (err) {
      console.error('Error flagging opportunity:', err)
      alert(err instanceof Error ? err.message : 'Failed to flag opportunity')
    }
  }

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        minScore: String(minScore),
      })
      
      const response = await fetch(`/api/admin/sam-ingestion/export?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }
      
      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sam-opportunities-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        const data = await response.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sam-opportunities-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (err) {
      console.error('Error exporting:', err)
      alert('Failed to export opportunities')
    }
  }

  useEffect(() => {
    loadOpportunities()
  }, [minScore, sortBy])

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">SAM.gov Capture</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
            Automated ingestion pipeline for SAM.gov opportunities. Opportunities are filtered and scored
            to surface only actionable opportunities (score ≥ 50).
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="btn-secondary">
              Admin Portal
            </Link>
            <Link href="/admin/contract-discovery" className="btn-secondary">
              Contract Discovery
            </Link>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="section-container bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 lg:p-12 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div>
                <h2 className="heading-3 mb-2">Ingestion Pipeline</h2>
                <p className="text-body-sm text-neutral-600">
                  Run the ingestion pipeline to fetch, filter, and score opportunities from SAM.gov
                </p>
              </div>
              <button
                onClick={handleIngest}
                disabled={isIngesting}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isIngesting ? 'Ingesting...' : 'Run Ingestion'}
              </button>
            </div>

            {ingestionStats && (
              <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                <h3 className="text-body-sm font-semibold text-neutral-900 mb-2">Last Ingestion Results</h3>
                <div className="grid grid-cols-3 gap-4 text-body-sm">
                  <div>
                    <span className="text-neutral-600">Ingested:</span>
                    <span className="ml-2 font-medium text-neutral-900">{ingestionStats.ingested.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Passed Filters:</span>
                    <span className="ml-2 font-medium text-neutral-900">{ingestionStats.filtered.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-600">Shortlisted:</span>
                    <span className="ml-2 font-medium text-neutral-900">{ingestionStats.shortlisted.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <FilterControls
            minScore={minScore}
            setMinScore={setMinScore}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onExport={handleExport}
            opportunityCount={opportunities.length}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm mb-8">
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

          <OpportunityTable
            opportunities={opportunities}
            loading={loading}
            onIgnore={handleIgnore}
            onFlag={handleFlag}
          />
        </div>
      </section>
    </div>
  )
}

