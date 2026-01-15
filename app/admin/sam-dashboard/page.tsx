'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import OpportunityTable from './components/OpportunityTable'
import RunIngestButton from './components/RunIngestButton'
import FiltersPanel from './components/FiltersPanel'
import QueryManager from './components/QueryManager'

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
  postedDate: string
  aiAnalysis: any
  sourceQueries: string[]
}

export default function SamDashboardPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(50)
  const [sortBy, setSortBy] = useState<'score' | 'deadline' | 'date'>('score')
  const [showLowScore, setShowLowScore] = useState(false)
  const [naicsFilter, setNaicsFilter] = useState<string[]>([])
  const [setAsideFilter, setSetAsideFilter] = useState<string[]>([])

  const loadOpportunities = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        minScore: String(minScore),
        sort: sortBy,
        limit: '100',
        showLowScore: String(showLowScore),
      })
      
      if (naicsFilter.length > 0) {
        params.append('naics', naicsFilter.join(','))
      }
      
      if (setAsideFilter.length > 0) {
        params.append('setAside', setAsideFilter.join(','))
      }
      
      const response = await fetch(`/api/admin/sam/list?${params.toString()}`)
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

  const handleIgnore = async (noticeId: string) => {
    try {
      const response = await fetch('/api/admin/sam/ignore', {
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
      const response = await fetch('/api/admin/sam/flag', {
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

  useEffect(() => {
    loadOpportunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore, sortBy, showLowScore, naicsFilter, setAsideFilter])

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">SAM.gov Dashboard</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
            Automated ingestion pipeline for SAM.gov opportunities. Opportunities are filtered, scored,
            and AI-analyzed to surface only actionable opportunities.
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
            <RunIngestButton onIngestComplete={loadOpportunities} />
          </div>

          <QueryManager onQueryComplete={loadOpportunities} />

          <FiltersPanel
            minScore={minScore}
            setMinScore={setMinScore}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showLowScore={showLowScore}
            setShowLowScore={setShowLowScore}
            naicsFilter={naicsFilter}
            setNaicsFilter={setNaicsFilter}
            setAsideFilter={setAsideFilter}
            setSetAsideFilter={setSetAsideFilter}
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

