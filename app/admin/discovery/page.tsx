'use client'

import { useState } from 'react'
import AdminNavigation from '@/components/admin/AdminNavigation'
import Link from 'next/link'

// NAICS Codes for contract search
const NAICS_OPTIONS = [
  { code: '541690', name: 'Other Scientific And Technical Consulting Services' },
  { code: '541330', name: 'Engineering Services' },
  { code: '541380', name: 'Testing Laboratories And Services' },
  { code: '541512', name: 'Computer Systems Design Services' },
  { code: '541519', name: 'Other Computer Related Services' },
  { code: '541611', name: 'Administrative Management And General Management Consulting Services' },
  { code: '541620', name: 'Environmental Consulting Services' },
  { code: '541715', name: 'Research And Development In The Physical, Engineering, And Life Sciences (Except Nanotechnology And Biotechnology)' },
] as const

interface DiscoveryResult {
  id: string
  title: string
  url: string
  agency?: string
  notice_id?: string
  relevance_score: number
  set_aside?: string[]
  naics_codes?: string[]
  detected_keywords?: string[]
  pipeline_status?: string
  scraped?: boolean
  usaspending_enrichment_status?: string | null
}

export default function DiscoveryPage() {
  const [keywords, setKeywords] = useState('')
  const [selectedNaicsCodes, setSelectedNaicsCodes] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<'past_week' | 'past_month' | 'past_year'>('past_month')
  const [location, setLocation] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [naicsCodes, setNaicsCodes] = useState('')
  const [pscCodes, setPscCodes] = useState('')
  const [ptype, setPtype] = useState('')
  const [agency, setAgency] = useState('')
  
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [searchStats, setSearchStats] = useState<{
    total: number
    valid: number
    invalid: number
    duplicates: number
    unique: number
    cached: boolean
    duration: number
  } | null>(null)

  const handleSearch = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords for the search')
      return
    }
    
    setIsSearching(true)
    setError(null)
    setResults([])
    setSearchStats(null)
    
    try {
      const allNaicsCodes = [
        ...selectedNaicsCodes,
        ...(naicsCodes.trim() ? naicsCodes.split(',').map(c => c.trim()).filter(c => c) : [])
      ].filter((code, index, arr) => arr.indexOf(code) === index)
      
      const requestBody = {
        keywords: keywords.trim(),
        date_range: dateRange,
        location: location.trim() || undefined,
        naics_codes: allNaicsCodes.length > 0 ? allNaicsCodes : undefined,
        set_aside: ['SDVOSB', 'VOSB'],
        ptype: ptype.trim() || undefined,
        agency: agency.trim() || undefined,
        limit: 30,
      }
      
      const response = await fetch('/api/admin/contract-discovery/search-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Search failed')
      }
      
      if (data.success) {
        setResults(data.results || [])
        setSearchStats(data.stats || null)
        
        if (data.results && data.results.length === 0) {
          setError('No results found. Try different keywords or adjust the date range.')
        } else {
          setError(null)
        }
      } else {
        throw new Error(data.error || data.message || 'Search failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddToPipeline = async (result: DiscoveryResult) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${result.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'admin' }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Update result to show it's been added
        setResults(prev => prev.map(r => 
          r.id === result.id 
            ? { ...r, pipeline_status: 'discovered' }
            : r
        ))
      } else {
        alert(data.error || 'Failed to add contract to pipeline')
      }
    } catch (err) {
      console.error('Error adding contract:', err)
      alert('Failed to add contract to pipeline')
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">Contract Discovery</h1>
            <p className="text-base text-neutral-600">
              Search for VetCert-eligible contract opportunities on SAM.gov. All searches automatically filter for SDVOSB/VOSB set-asides.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Search SAM.gov Opportunities</h2>
            
            {/* VetCert Notice */}
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <div className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    VetCert-Focused Search
                  </p>
                  <p className="text-sm text-green-800">
                    All searches automatically filter for Service-Disabled Veteran-Owned Small Business (SDVOSB) 
                    and Veteran-Owned Small Business (VOSB) opportunities.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Search Form */}
            <div className="space-y-4">
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-neutral-900 mb-2">
                  Keywords <span className="text-red-500">*</span>
                </label>
                <input
                  id="keywords"
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g., RMF, ATO, ISSO, cybersecurity, NIST 800-53"
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSearching) {
                      handleSearch()
                    }
                  }}
                />
              </div>
              
              <div>
                <label htmlFor="naics-select" className="block text-sm font-medium text-neutral-900 mb-2">
                  NAICS Codes
                </label>
                <select
                  id="naics-select"
                  multiple
                  value={selectedNaicsCodes}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value)
                    setSelectedNaicsCodes(selected)
                  }}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 min-h-[140px]"
                  size={6}
                >
                  {NAICS_OPTIONS.map(option => (
                    <option key={option.code} value={option.code}>
                      {option.code} - {option.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-1">
                  Hold Ctrl/Cmd to select multiple codes.
                </p>
              </div>
              
              <div>
                <label htmlFor="date-range" className="block text-sm font-medium text-neutral-900 mb-2">
                  Date Range
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'past_week' | 'past_month' | 'past_year')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="past_week">Past Week</option>
                  <option value="past_month">Past Month (Recommended)</option>
                  <option value="past_year">Past Year</option>
                </select>
              </div>
              
              {/* Advanced Filters */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm font-medium text-accent-700 hover:text-accent-800"
                >
                  {showAdvanced ? '▼' : '▶'} Advanced Filters
                </button>
                
                {showAdvanced && (
                  <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-200">
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-neutral-900 mb-2">
                        Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Virginia, Washington DC"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="naics-codes" className="block text-sm font-medium text-neutral-900 mb-2">
                        Additional NAICS Codes (comma-separated)
                      </label>
                      <input
                        id="naics-codes"
                        type="text"
                        value={naicsCodes}
                        onChange={(e) => setNaicsCodes(e.target.value)}
                        placeholder="e.g., 541512, 541519"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="ptype" className="block text-sm font-medium text-neutral-900 mb-2">
                        Solicitation Type
                      </label>
                      <select
                        id="ptype"
                        value={ptype}
                        onChange={(e) => setPtype(e.target.value)}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      >
                        <option value="">All Types</option>
                        <option value="RFI">RFI - Request for Information</option>
                        <option value="PRESOL">PRESOL - Presolicitation</option>
                        <option value="COMBINE">COMBINE - Combined Synopsis/Solicitation</option>
                        <option value="SRCSGT">SRCSGT - Sources Sought</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="agency" className="block text-sm font-medium text-neutral-900 mb-2">
                        Agency Code
                      </label>
                      <input
                        id="agency"
                        type="text"
                        value={agency}
                        onChange={(e) => setAgency(e.target.value)}
                        placeholder="e.g., 9700 for DoD"
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSearch}
                disabled={isSearching || !keywords.trim()}
                className="w-full px-6 py-3 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search Contracts'}
              </button>
            </div>
            
            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800 font-semibold mb-2">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {/* Search Stats */}
            {searchStats && (
              <div className="mt-4 text-sm text-neutral-600">
                Found {searchStats.unique} unique results ({searchStats.valid} valid, {searchStats.duplicates} duplicates filtered)
                {searchStats.cached && <span className="ml-2 text-green-600">(cached)</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results.length > 0 && (
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-neutral-900">
                Opportunities Found ({results.length})
              </h2>
              <Link
                href="/admin/opportunities"
                className="text-sm text-accent-700 hover:text-accent-800 font-medium"
              >
                View All Opportunities →
              </Link>
            </div>
            
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-neutral-900 mb-2">
                        {result.title}
                      </h3>
                      {result.agency && (
                        <p className="text-sm text-neutral-600 mb-2">{result.agency}</p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {result.set_aside && result.set_aside.map((sa, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded"
                          >
                            {sa}
                          </span>
                        ))}
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                          Score: {result.relevance_score}
                        </span>
                        {result.pipeline_status && (
                          <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded">
                            {result.pipeline_status}
                          </span>
                        )}
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-accent-700 hover:text-accent-800"
                      >
                        View on SAM.gov →
                      </a>
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      {result.pipeline_status ? (
                        <Link
                          href="/admin/opportunities"
                          className="px-4 py-2 bg-accent-50 text-accent-700 rounded-lg text-sm font-medium hover:bg-accent-100 transition-colors"
                        >
                          View in Pipeline
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAddToPipeline(result)}
                          className="px-4 py-2 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors"
                        >
                          Add to Pipeline
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

