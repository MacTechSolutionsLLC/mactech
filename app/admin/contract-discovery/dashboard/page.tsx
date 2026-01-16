'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import RunIngestButton from '@/app/admin/sam-dashboard/components/RunIngestButton'
import QueryManager from '@/app/admin/sam-dashboard/components/QueryManager'
import FiltersPanel from '@/app/admin/sam-dashboard/components/FiltersPanel'
import ScoreBadge from '@/app/admin/sam-dashboard/components/ScoreBadge'

interface Contract {
  id: string
  title: string
  url: string
  notice_id?: string
  solicitation_number?: string
  agency?: string
  naics_codes: string[]
  set_aside: string[]
  detected_keywords: string[]
  relevance_score: number
  detected_service_category?: string
  ingestion_status: string
  ingestion_source?: string | null
  verified: boolean
  verified_at?: string | null
  scraped: boolean
  scraped_at?: string | null
  sow_attachment_url?: string
  sow_attachment_type?: string
  sow_scraped: boolean
  sow_scraped_at?: string | null
  analysis_summary?: string
  analysis_confidence?: number
  dismissed: boolean
  dismissed_at?: string | null
  created_at: string
  deadline?: string | null
  daysRemaining?: number | null
  description?: string
  estimated_value?: string
  period_of_performance?: string
  place_of_performance?: string
  points_of_contact?: Array<{
    name?: string
    email?: string
    phone?: string
    role?: string
  }>
  aiAnalysis?: any
  aiSummary?: string
  aiKeyRequirements?: string[]
  flagged?: boolean
  flagged_at?: string | null
  source_queries?: string[]
}

export default function ContractDashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Contract discovery filters
  const [filter, setFilter] = useState<'all' | 'verified' | 'scraped' | 'dismissed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sam-ingestion' | 'discovery'>('all')
  
  // SAM dashboard filters
  const [minScore, setMinScore] = useState(50)
  const [sortBy, setSortBy] = useState<'score' | 'deadline' | 'date'>('score')
  const [showLowScore, setShowLowScore] = useState(false)
  const [naicsFilter, setNaicsFilter] = useState<string[]>([])
  const [setAsideFilter, setSetAsideFilter] = useState<string[]>([])
  
  // AI Analysis expansion
  const [expandedAI, setExpandedAI] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadContracts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, minScore, sortBy, showLowScore, naicsFilter, setAsideFilter, sourceFilter])

  const loadContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      
      // Contract discovery filters
      const status = filter === 'all' ? undefined : 
                    filter === 'verified' ? 'verified' :
                    filter === 'dismissed' ? 'ignored' : 'discovered'
      if (status) params.append('status', status)
      if (filter === 'scraped') params.append('scraped', 'true')
      if (filter === 'dismissed') params.append('dismissed', 'true')
      
      // SAM dashboard filters
      params.append('minScore', String(minScore))
      params.append('sort', sortBy)
      params.append('limit', '200')
      params.append('showLowScore', String(showLowScore))
      if (sourceFilter !== 'all') {
        params.append('source', sourceFilter)
      }
      
      if (naicsFilter.length > 0) {
        params.append('naics', naicsFilter.join(','))
      }
      
      if (setAsideFilter.length > 0) {
        params.append('setAside', setAsideFilter.join(','))
      }
      
      const response = await fetch(`/api/admin/contract-discovery/unified-list?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setContracts(data.opportunities || data.contracts || [])
        setError(null)
      } else {
        setError(data.error || data.message || 'Failed to load contracts')
      }
    } catch (err) {
      console.error('Error loading contracts:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contracts'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/scrape`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to scrape contract')
      }
    } catch (err) {
      console.error('Error scraping contract:', err)
      alert('Failed to scrape contract')
    }
  }

  const handleScrapeSOW = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/scrape-sow`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to scrape SOW')
      }
    } catch (err) {
      console.error('Error scraping SOW:', err)
      alert('Failed to scrape SOW')
    }
  }

  const handleAdd = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'admin' }),
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to add contract')
      }
    } catch (err) {
      console.error('Error adding contract:', err)
      alert('Failed to add contract')
    }
  }

  const handleDismiss = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissedBy: 'admin', reason: 'Not relevant' }),
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to dismiss contract')
      }
    } catch (err) {
      console.error('Error dismissing contract:', err)
      alert('Failed to dismiss contract')
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm('Are you sure you want to permanently delete this contract?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/delete`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to delete contract')
      }
    } catch (err) {
      console.error('Error deleting contract:', err)
      alert('Failed to delete contract')
    }
  }

  const handleFlag = async (noticeId: string | null | undefined, flagged: boolean) => {
    if (!noticeId) return
    
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
      
      await loadContracts()
    } catch (err) {
      console.error('Error flagging opportunity:', err)
      alert(err instanceof Error ? err.message : 'Failed to flag opportunity')
    }
  }

  const handleIgnore = async (noticeId: string | null | undefined) => {
    if (!noticeId || !confirm('Are you sure you want to ignore this opportunity?')) {
      return
    }
    
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
      
      await loadContracts()
    } catch (err) {
      console.error('Error ignoring opportunity:', err)
      alert(err instanceof Error ? err.message : 'Failed to ignore opportunity')
    }
  }

  const toggleAIExpansion = (contractId: string) => {
    setExpandedAI(prev => {
      const next = new Set(prev)
      if (next.has(contractId)) {
        next.delete(contractId)
      } else {
        next.add(contractId)
      }
      return next
    })
  }

  const filteredContracts = contracts.filter(contract => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      contract.title.toLowerCase().includes(search) ||
      contract.agency?.toLowerCase().includes(search) ||
      contract.notice_id?.toLowerCase().includes(search) ||
      contract.detected_keywords.some(kw => kw.toLowerCase().includes(search))
    )
  })

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-hero mb-2">Contract Dashboard</h1>
              <p className="text-body text-neutral-600">
                Unified view of all contract opportunities from SAM.gov ingestion pipeline and contract discovery
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/contract-discovery" className="btn-secondary">
                Search Contracts
              </Link>
              <Link href="/admin" className="btn-secondary">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ingestion Controls */}
      <section className="section-container bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="card p-8 lg:p-12 mb-8">
            <RunIngestButton onIngestComplete={loadContracts} />
          </div>

          <QueryManager onQueryComplete={loadContracts} />
        </div>
      </section>

      {/* Filters and Search */}
      <section className="section-container bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Source and Status Filters */}
          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'verified', 'scraped', 'dismissed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-accent-700 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 items-center">
                <label className="text-body-sm font-medium text-neutral-700 mr-2">Source:</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as 'all' | 'sam-ingestion' | 'discovery')}
                  className="px-3 py-2 border border-neutral-300 rounded-sm text-body-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="all">All Sources</option>
                  <option value="sam-ingestion">SAM Ingestion</option>
                  <option value="discovery">Contract Discovery</option>
                </select>
              </div>
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 w-full md:w-64"
              />
            </div>
          </div>

          {/* Advanced Filters Panel */}
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
            opportunityCount={filteredContracts.length}
          />

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-body-sm text-neutral-600 mt-4">Loading contracts...</p>
            </div>
          ) : error ? (
            <div className="card p-6 bg-red-50 border border-red-200">
              <p className="text-body-sm text-red-800">{error}</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-body-lg text-neutral-600">No contracts found</p>
              <Link href="/admin/contract-discovery" className="btn-primary mt-4 inline-block">
                Search for Contracts
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Contract</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Agency/Office</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Dates</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Score</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Status</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">SOW</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredContracts.map((contract) => {
                      const isAIExpanded = expandedAI.has(contract.id)
                      const primaryPOC = contract.points_of_contact && contract.points_of_contact.length > 0 
                        ? contract.points_of_contact[0] 
                        : null
                      
                      return (
                        <>
                          <tr 
                            key={contract.id} 
                            className={`hover:bg-neutral-50 cursor-pointer ${
                              contract.dismissed ? 'opacity-50' : ''
                            } ${contract.verified ? 'bg-green-50' : ''} ${contract.flagged ? 'bg-yellow-50' : ''}`}
                            onClick={() => window.location.href = `/admin/contract-discovery/${contract.id}`}
                          >
                            <td className="px-4 py-3">
                              <div className="max-w-md">
                                <Link
                                  href={`/admin/contract-discovery/${contract.id}`}
                                  className="text-body-sm font-medium text-accent-700 hover:text-accent-900 mb-1 block"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {contract.title}
                                </Link>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {contract.set_aside.slice(0, 2).map((sa, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-body-xs rounded"
                                    >
                                      {sa}
                                    </span>
                                  ))}
                                  {contract.detected_keywords.slice(0, 3).map((kw, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 bg-accent-50 text-accent-700 text-body-xs rounded"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                                <div className="text-body-xs text-neutral-500 space-y-1">
                                  {contract.notice_id && <p>Notice: {contract.notice_id}</p>}
                                  {contract.solicitation_number && <p>Solicitation: {contract.solicitation_number}</p>}
                                  {contract.naics_codes.length > 0 && (
                                    <p>NAICS: {contract.naics_codes.slice(0, 2).join(', ')}{contract.naics_codes.length > 2 ? '...' : ''}</p>
                                  )}
                                  {contract.ingestion_source && (
                                    <p className="text-accent-700 font-medium">
                                      {contract.ingestion_source === 'sam-ingestion' ? '📥 SAM Ingestion' : '🔍 Discovery'}
                                    </p>
                                  )}
                                </div>
                                <a
                                  href={contract.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-body-xs text-accent-700 hover:text-accent-800 mt-1 inline-block break-all"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View on SAM.gov →
                                </a>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                {contract.agency && (
                                  <p className="text-body-sm font-medium text-neutral-900">{contract.agency}</p>
                                )}
                                {primaryPOC && (
                                  <div className="text-body-xs text-neutral-600">
                                    {primaryPOC.name && <p>POC: {primaryPOC.name}</p>}
                                    {primaryPOC.email && (
                                      <a 
                                        href={`mailto:${primaryPOC.email}`}
                                        className="text-accent-700 hover:text-accent-800"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {primaryPOC.email}
                                      </a>
                                    )}
                                    {primaryPOC.phone && <p>📞 {primaryPOC.phone}</p>}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1 text-body-xs">
                                {contract.deadline && (
                                  <p className={contract.daysRemaining != null && contract.daysRemaining < 7 ? 'text-red-600 font-medium' : ''}>
                                    Deadline: {contract.deadline}
                                    {contract.daysRemaining != null && (
                                      <span className="ml-1">({contract.daysRemaining} days)</span>
                                    )}
                                  </p>
                                )}
                                {contract.period_of_performance && (
                                  <p className="text-neutral-600">POP: {contract.period_of_performance}</p>
                                )}
                                {contract.created_at && (
                                  <p className="text-neutral-500">Posted: {new Date(contract.created_at).toLocaleDateString()}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <ScoreBadge score={contract.relevance_score} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1">
                                <span className={`inline-block px-2 py-0.5 text-body-xs rounded ${
                                  contract.verified 
                                    ? 'bg-green-100 text-green-800' 
                                    : contract.dismissed
                                    ? 'bg-red-100 text-red-800'
                                    : contract.scraped
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-neutral-100 text-neutral-700'
                                }`}>
                                  {contract.verified ? '✓ Verified' : 
                                   contract.dismissed ? '✗ Dismissed' : 
                                   contract.scraped ? 'Scraped' : 'Discovered'}
                                </span>
                                {contract.aiSummary && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleAIExpansion(contract.id)
                                    }}
                                    className="block text-body-xs text-blue-700 hover:text-blue-800 underline mt-1"
                                  >
                                    {isAIExpanded ? 'Hide' : 'Show'} AI Analysis
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {contract.sow_attachment_url ? (
                                <div className="space-y-2">
                                  <a
                                    href={contract.sow_attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-body-sm text-accent-700 hover:text-accent-800 underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>📄</span>
                                    <span>Download SOW</span>
                                    {contract.sow_attachment_type && (
                                      <span className="text-body-xs text-neutral-500">
                                        ({contract.sow_attachment_type})
                                      </span>
                                    )}
                                  </a>
                                  {!contract.sow_scraped && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleScrapeSOW(contract.id)
                                      }}
                                      className="block text-body-xs text-accent-700 hover:text-accent-800 underline"
                                    >
                                      Scrape SOW Content
                                    </button>
                                  )}
                                  {contract.sow_scraped && (
                                    <span className="text-body-xs text-green-600">✓ Content Scraped</span>
                                  )}
                                </div>
                              ) : contract.scraped ? (
                                <span className="text-body-xs text-neutral-500">No SOW found</span>
                              ) : (
                                <span className="text-body-xs text-neutral-400">Not scraped yet</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                {!contract.scraped && (
                                  <button
                                    onClick={() => handleScrape(contract.id)}
                                    className="btn-primary text-body-sm px-3 py-1.5"
                                  >
                                    Scrape
                                  </button>
                                )}
                                {contract.notice_id && (
                                  <>
                                    <button
                                      onClick={() => handleFlag(contract.notice_id, !contract.flagged)}
                                      className={`text-body-xs px-2 py-1 rounded ${
                                        contract.flagged
                                          ? 'bg-yellow-100 text-yellow-800'
                                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                      }`}
                                      title={contract.flagged ? 'Unflag' : 'Flag'}
                                    >
                                      {contract.flagged ? '★' : '☆'}
                                    </button>
                                    <button
                                      onClick={() => handleIgnore(contract.notice_id)}
                                      className="text-body-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                      title="Ignore"
                                    >
                                      ×
                                    </button>
                                  </>
                                )}
                                {!contract.verified && !contract.dismissed && (
                                  <button
                                    onClick={() => handleAdd(contract.id)}
                                    className="text-body-sm px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    Add
                                  </button>
                                )}
                                {!contract.dismissed && (
                                  <button
                                    onClick={() => handleDismiss(contract.id)}
                                    className="text-body-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Dismiss
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(contract.id)}
                                  className="text-body-sm px-3 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isAIExpanded && contract.aiAnalysis && (
                            <tr>
                              <td colSpan={7} className="px-6 py-4 bg-blue-50">
                                <div className="space-y-2">
                                  <h4 className="text-body-sm font-semibold text-neutral-900">AI Analysis</h4>
                                  {contract.aiAnalysis.relevanceSummary && (
                                    <p className="text-body-sm text-neutral-700">
                                      <strong>Summary:</strong> {contract.aiAnalysis.relevanceSummary}
                                    </p>
                                  )}
                                  {contract.aiAnalysis.recommendedAction && (
                                    <p className="text-body-sm text-neutral-700">
                                      <strong>Recommended Action:</strong>{' '}
                                      <span className="font-medium">{contract.aiAnalysis.recommendedAction}</span>
                                    </p>
                                  )}
                                  {contract.aiAnalysis.capabilityMatch && contract.aiAnalysis.capabilityMatch.length > 0 && (
                                    <div>
                                      <strong className="text-body-sm text-neutral-700">Capability Match:</strong>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {contract.aiAnalysis.capabilityMatch.map((cap: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                                          >
                                            {cap}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {contract.aiAnalysis.risks && contract.aiAnalysis.risks.length > 0 && (
                                    <div>
                                      <strong className="text-body-sm text-neutral-700">Risks:</strong>
                                      <ul className="list-disc list-inside text-body-sm text-neutral-700 mt-1">
                                        {contract.aiAnalysis.risks.map((risk: string, idx: number) => (
                                          <li key={idx}>{risk}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {contract.aiSummary && (
                                    <div className="mt-2 pt-2 border-t border-blue-200">
                                      <strong className="text-body-sm text-neutral-700">Full Summary:</strong>
                                      <p className="text-body-sm text-neutral-700 mt-1">{contract.aiSummary}</p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
