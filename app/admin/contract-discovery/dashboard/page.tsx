'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import RunIngestButton from '@/app/admin/sam-dashboard/components/RunIngestButton'
import QueryManager from '@/app/admin/sam-dashboard/components/QueryManager'
import ContractFilters from './components/ContractFilters'
import SortableTable from './components/SortableTable'

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

type Tab = 'contracts' | 'search'

export default function ContractDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('contracts')
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
  const [soleSourceFilter, setSoleSourceFilter] = useState(false)
  
  // AI Analysis expansion
  const [expandedAI, setExpandedAI] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (activeTab === 'contracts') {
      loadContracts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, minScore, sortBy, showLowScore, naicsFilter, setAsideFilter, sourceFilter, activeTab])

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

  // Sole source detection: check if any string in set_aside array contains "Sole Source" (case-insensitive)
  const isSoleSource = (contract: Contract): boolean => {
    return contract.set_aside.some(sa => 
      sa.toLowerCase().includes('sole source')
    )
  }

  // Filter contracts based on all filters including sole source
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      // Text search filter
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

      // Sole source filter
      if (soleSourceFilter && !isSoleSource(contract)) {
        return false
      }

      return true
    })
  }, [contracts, searchTerm, soleSourceFilter])

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

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">Contract Dashboard</h1>
              <p className="text-base text-neutral-600">
                Unified view of all contract opportunities from SAM.gov ingestion pipeline and contract discovery
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin" className="px-6 py-2.5 bg-transparent text-accent-700 border border-accent-700 rounded-xl text-sm font-medium hover:bg-accent-50 transition-all">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'contracts'
                  ? 'border-accent-700 text-accent-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                activeTab === 'search'
                  ? 'border-accent-700 text-accent-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Search Contracts
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      {activeTab === 'contracts' && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* Status and Source Filters - Apple Style */}
            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {(['all', 'verified', 'scraped', 'dismissed'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        filter === f
                          ? 'bg-accent-700 text-white shadow-md shadow-accent-700/20'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-neutral-700">Source:</label>
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value as 'all' | 'sam-ingestion' | 'discovery')}
                      className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all hover:border-neutral-300"
                    >
                      <option value="all">All Sources</option>
                      <option value="sam-ingestion">SAM Ingestion</option>
                      <option value="discovery">Contract Discovery</option>
                    </select>
                  </div>
                  <div className="flex-1 lg:flex-initial">
                    <input
                      type="text"
                      placeholder="Search contracts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full lg:w-64 px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all hover:border-neutral-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <ContractFilters
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
              soleSourceFilter={soleSourceFilter}
              setSoleSourceFilter={setSoleSourceFilter}
              opportunityCount={filteredContracts.length}
            />

            {loading ? (
              <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-16 text-center">
                <div className="animate-spin h-10 w-10 border-3 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-neutral-600 mt-6 font-medium">Loading contracts...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6 shadow-sm">
                <p className="text-sm text-red-800 font-medium">{error}</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-16 text-center">
                <p className="text-lg font-semibold text-neutral-600 mb-2">No contracts found</p>
                <p className="text-sm text-neutral-500 mb-6">
                  Try adjusting your filters or search for new contracts
                </p>
                <Link href="/admin/contract-discovery" className="inline-block px-6 py-3 bg-accent-700 text-white rounded-xl text-sm font-medium hover:bg-accent-800 transition-all shadow-md shadow-accent-700/20">
                  Search for Contracts
                </Link>
              </div>
            ) : (
              <SortableTable
                contracts={filteredContracts}
                onScrape={handleScrape}
                onScrapeSOW={handleScrapeSOW}
                onAdd={handleAdd}
                onDismiss={handleDismiss}
                onDelete={handleDelete}
                onFlag={handleFlag}
                onIgnore={handleIgnore}
                expandedAI={expandedAI}
                onToggleAI={toggleAIExpansion}
              />
            )}
          </div>
        </section>
      )}

      {activeTab === 'search' && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {/* API Actions Section */}
            <div className="mb-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-2">Contract Management</h2>
                <p className="text-base text-neutral-600">
                  Manage contract ingestion, enrichment, and data processing
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6">
                  <RunIngestButton onIngestComplete={loadContracts} />
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6">
                  <QueryManager onQueryComplete={loadContracts} />
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Enrich High-Score Contracts</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Scrape and enrich all contracts with relevance score ≥ 50% to populate their summary pages with full HTML/text content
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('This will scrape all contracts with score ≥ 50%. This may take a while. Continue?')) {
                          return
                        }
                        
                        try {
                          const response = await fetch('/api/admin/contract-discovery/enrich', {
                            method: 'POST',
                          })
                          const data = await response.json()
                          
                          if (data.success) {
                            alert(`Enrichment started! Processing ${data.total} contracts. Check server logs for progress.`)
                            setTimeout(() => {
                              loadContracts()
                            }, 5000)
                          } else {
                            alert(data.error || 'Failed to start enrichment')
                          }
                        } catch (err) {
                          console.error('Error starting enrichment:', err)
                          alert('Failed to start enrichment')
                        }
                      }}
                      className="px-6 py-3 bg-accent-700 text-white rounded-xl text-sm font-medium hover:bg-accent-800 transition-all shadow-md shadow-accent-700/20 whitespace-nowrap"
                    >
                      Enrich Contracts (≥50%)
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">Clean Content with AI</h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Re-process already-scraped contracts with AI to clean verbose content, remove strange characters, and extract structured data
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('This will re-process all scraped contracts (score ≥ 50%) with AI cleaning. This may take a while. Continue?')) {
                          return
                        }
                        
                        try {
                          const response = await fetch('/api/admin/contract-discovery/clean-content?minScore=50', {
                            method: 'POST',
                          })
                          const data = await response.json()
                          
                          if (data.success) {
                            alert(`AI cleaning started! Processing ${data.total} contracts. Check server logs for progress.`)
                            setTimeout(() => {
                              loadContracts()
                            }, 5000)
                          } else {
                            alert(data.error || 'Failed to start AI cleaning')
                          }
                        } catch (err) {
                          console.error('Error starting AI cleaning:', err)
                          alert('Failed to start AI cleaning')
                        }
                      }}
                      className="px-6 py-3 bg-accent-700 text-white rounded-xl text-sm font-medium hover:bg-accent-800 transition-all shadow-md shadow-accent-700/20 whitespace-nowrap"
                    >
                      Clean with AI (≥50%)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Page Link */}
            <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 mb-4">Search for New Contracts</h2>
                <p className="text-base text-neutral-600 mb-6">
                  Use the dedicated search page to find new contract opportunities on SAM.gov
                </p>
                <Link href="/admin/contract-discovery" className="inline-block px-6 py-3 bg-accent-700 text-white rounded-xl text-sm font-medium hover:bg-accent-800 transition-all shadow-md shadow-accent-700/20">
                  Go to Search Page
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
