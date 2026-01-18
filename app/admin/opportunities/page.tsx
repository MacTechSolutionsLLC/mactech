'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'

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
  pipeline_status: string
  pipeline_stage?: string | null
  ingestion_status: string
  ingestion_source?: string | null
  verified: boolean
  scraped: boolean
  scraped_at?: string | null
  usaspending_enrichment_status?: string | null
  aiAnalysis?: string | null
  flagged: boolean
  ignored: boolean
  dismissed: boolean
  created_at: string
  deadline?: string | null
}

export default function OpportunitiesPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set())
  
  // Filters
  const [filter, setFilter] = useState<'all' | 'verified' | 'scraped' | 'dismissed' | 'flagged' | 'ready'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'sam-ingestion' | 'discovery'>('all')
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState<string>('all')
  const [minScore, setMinScore] = useState(0)
  const [sortBy, setSortBy] = useState<'score' | 'deadline' | 'date'>('score')

  useEffect(() => {
    loadContracts()
  }, [filter, minScore, sortBy, sourceFilter, pipelineStatusFilter])

  const loadContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      
      const status = filter === 'all' ? undefined : 
                    filter === 'verified' ? 'verified' :
                    filter === 'dismissed' ? 'ignored' : 
                    filter === 'flagged' ? 'flagged' :
                    filter === 'ready' ? 'ready' : 'discovered'
      if (status) params.append('status', status)
      if (filter === 'scraped') params.append('scraped', 'true')
      
      params.append('minScore', String(minScore))
      params.append('sort', sortBy)
      params.append('limit', '500')
      
      if (sourceFilter !== 'all') {
        params.append('source', sourceFilter)
      }
      
      const response = await fetch(`/api/admin/contract-discovery/unified-list?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        let contractsList = data.opportunities || data.contracts || []
        
        // Filter by pipeline status if specified
        if (pipelineStatusFilter !== 'all') {
          contractsList = contractsList.filter((c: Contract) => 
            c.pipeline_status === pipelineStatusFilter
          )
        }
        
        setContracts(contractsList)
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

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const matchesSearch = (
          contract.title.toLowerCase().includes(search) ||
          contract.agency?.toLowerCase().includes(search) ||
          contract.notice_id?.toLowerCase().includes(search) ||
          contract.detected_keywords.some(kw => kw.toLowerCase().includes(search))
        )
        if (!matchesSearch) return false
      }
      return true
    })
  }, [contracts, searchTerm])

  const handleBulkProcess = async () => {
    if (selectedContracts.size === 0) {
      alert('Please select contracts to process')
      return
    }

    if (!confirm(`Process ${selectedContracts.size} contracts through the pipeline?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/pipeline/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_ids: Array.from(selectedContracts),
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Started processing ${selectedContracts.size} contracts`)
        setTimeout(loadContracts, 3000)
      } else {
        alert(data.error || 'Failed to start processing')
      }
    } catch (error) {
      console.error('Error processing contracts:', error)
      alert('Failed to process contracts')
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
      
      if (response.ok) {
        await loadContracts()
      }
    } catch (error) {
      console.error('Error flagging contract:', error)
    }
  }

  const handleIgnore = async (noticeId: string | null | undefined) => {
    if (!noticeId || !confirm('Ignore this opportunity?')) return
    
    try {
      const response = await fetch('/api/admin/sam/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId }),
      })
      
      if (response.ok) {
        await loadContracts()
      }
    } catch (error) {
      console.error('Error ignoring contract:', error)
    }
  }

  const handleProcess = async (contractId: string) => {
    try {
      const response = await fetch('/api/admin/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_ids: [contractId],
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        setTimeout(loadContracts, 2000)
      } else {
        alert(data.error || 'Failed to process contract')
      }
    } catch (error) {
      console.error('Error processing contract:', error)
      alert('Failed to process contract')
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Opportunities</h1>
              <p className="text-base text-neutral-600">
                Unified view of all contract opportunities from SAM.gov ingestion and discovery
              </p>
            </div>
            <Link
              href="/admin/discovery"
              className="px-6 py-3 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors shadow-md shadow-accent-700/20"
            >
              Search New Contracts
            </Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div className="space-y-4">
            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'verified', 'scraped', 'flagged', 'ready', 'dismissed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filter === f
                      ? 'bg-accent-700 text-white shadow-md'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as 'all' | 'sam-ingestion' | 'discovery')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="all">All Sources</option>
                  <option value="sam-ingestion">SAM Ingestion</option>
                  <option value="discovery">Discovery</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Pipeline Status</label>
                <select
                  value={pipelineStatusFilter}
                  onChange={(e) => setPipelineStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="discovered">Discovered</option>
                  <option value="scraped">Scraped</option>
                  <option value="enriched">Enriched</option>
                  <option value="analyzed">Analyzed</option>
                  <option value="ready">Ready</option>
                  <option value="flagged">Flagged</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Min Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedContracts.size > 0 && (
              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-900">
                  {selectedContracts.size} contract{selectedContracts.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={handleBulkProcess}
                  className="px-4 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors"
                >
                  Process Selected
                </button>
                <button
                  onClick={() => setSelectedContracts(new Set())}
                  className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-300 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contracts Table */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {loading ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center">
            <div className="animate-spin h-10 w-10 border-3 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-neutral-600 mt-6 font-medium">Loading contracts...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-lg border border-red-200 p-6">
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center">
            <p className="text-lg font-semibold text-neutral-600 mb-2">No contracts found</p>
            <p className="text-sm text-neutral-500 mb-6">
              Try adjusting your filters or search for new contracts
            </p>
            <Link
              href="/admin/discovery"
              className="inline-block px-6 py-3 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors"
            >
              Search for Contracts
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900 w-12">
                      <input
                        type="checkbox"
                        checked={selectedContracts.size === filteredContracts.length && filteredContracts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContracts(new Set(filteredContracts.map(c => c.id)))
                          } else {
                            setSelectedContracts(new Set())
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Title</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Agency</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Pipeline Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredContracts.map((contract) => (
                    <tr
                      key={contract.id}
                      className={`hover:bg-neutral-50 ${
                        contract.flagged ? 'bg-orange-50' :
                        contract.ignored ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedContracts.has(contract.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedContracts)
                            if (e.target.checked) {
                              newSelected.add(contract.id)
                            } else {
                              newSelected.delete(contract.id)
                            }
                            setSelectedContracts(newSelected)
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="max-w-md">
                          <p className="text-sm font-medium text-neutral-900 mb-1 line-clamp-2">
                            {contract.title}
                          </p>
                          {contract.notice_id && (
                            <p className="text-xs text-neutral-500">Notice: {contract.notice_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-neutral-700">{contract.agency || '-'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          contract.relevance_score >= 70 ? 'bg-green-100 text-green-800' :
                          contract.relevance_score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {contract.relevance_score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          contract.pipeline_status === 'ready' ? 'bg-emerald-100 text-emerald-800' :
                          contract.pipeline_status === 'enriched' ? 'bg-indigo-100 text-indigo-800' :
                          contract.pipeline_status === 'scraped' ? 'bg-green-100 text-green-800' :
                          contract.pipeline_status === 'flagged' ? 'bg-orange-100 text-orange-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {contract.pipeline_status || 'discovered'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={contract.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-accent-50 text-accent-700 rounded hover:bg-accent-100 transition-colors"
                          >
                            View
                          </a>
                          {contract.pipeline_status !== 'ready' && (
                            <button
                              onClick={() => handleProcess(contract.id)}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                            >
                              Process
                            </button>
                          )}
                          <button
                            onClick={() => handleFlag(contract.notice_id, !contract.flagged)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              contract.flagged
                                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                            }`}
                          >
                            {contract.flagged ? 'Unflag' : 'Flag'}
                          </button>
                          {!contract.ignored && (
                            <button
                              onClick={() => handleIgnore(contract.notice_id)}
                              className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                            >
                              Ignore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

