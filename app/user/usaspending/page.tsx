'use client'

import { useState, useEffect } from 'react'
import UserNavigation from '@/components/user/UserNavigation'

interface UsaSpendingAward {
  id?: string
  award_id?: string
  generated_unique_award_id?: string
  award_type?: string
  award_type_description?: string
  category?: string
  total_obligation?: number
  total_outlay?: number
  awarding_agency?: any
  funding_agency?: any
  recipient?: any
  recipient_name?: string
  recipient_uei?: string
  recipient_duns?: string
  place_of_performance?: any
  start_date?: string
  end_date?: string
  awarding_date?: string
  naics_code?: string
  naics_description?: string
  psc_code?: string
  psc_description?: string
  description?: string
  transaction_count?: number
  subaward_count?: number
  [key: string]: any
}

export default function UsaSpendingPage() {
  // Search state
  const [naicsCodes, setNaicsCodes] = useState('')
  const [pscCodes, setPscCodes] = useState('')
  const [agencies, setAgencies] = useState('')
  const [awardTypes, setAwardTypes] = useState<string[]>([])
  const [recipientSearch, setRecipientSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [useDatabase, setUseDatabase] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(50)

  // Auto-load awards from database on mount
  useEffect(() => {
    if (useDatabase && !hasSearched) {
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Results state
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<UsaSpendingAward[]>([])
  const [pageMetadata, setPageMetadata] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setIsSearching(true)
    setError(null)

    try {
      const body: any = {
        page,
        limit,
        use_database: useDatabase,
      }

      if (naicsCodes.trim()) {
        body.naics_codes = naicsCodes.split(',').map((c: string) => c.trim()).filter(Boolean)
      }

      if (pscCodes.trim()) {
        body.psc_codes = pscCodes.split(',').map((c: string) => c.trim()).filter(Boolean)
      }

      if (agencies.trim()) {
        body.agencies = agencies.split(',').map((a: string) => a.trim()).filter(Boolean)
      }

      if (awardTypes.length > 0) {
        body.award_types = awardTypes
      }

      if (recipientSearch.trim()) {
        body.recipient_search = recipientSearch.trim()
      }

      if (startDate) {
        body.start_date = startDate
      }

      if (endDate) {
        body.end_date = endDate
      }

      if (minAmount) {
        body.min_amount = parseFloat(minAmount)
      }

      if (maxAmount) {
        body.max_amount = parseFloat(maxAmount)
      }

      const response = await fetch('/api/admin/usaspending/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results || [])
        setPageMetadata(data.page_metadata)
        setHasSearched(true)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsSearching(false)
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date?: string | Date) => {
    if (!date) return 'N/A'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <UserNavigation />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
      <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-neutral-900">USAspending.gov Historical Awards</h1>
          <p className="text-neutral-600">
          Search historical award data from USAspending.gov to analyze past contracts, winners, and spending patterns.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Awards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NAICS Codes (comma-separated)
            </label>
            <input
              type="text"
              value={naicsCodes}
              onChange={(e) => setNaicsCodes(e.target.value)}
              placeholder="541512, 541519"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PSC Codes (comma-separated)
            </label>
            <input
              type="text"
              value={pscCodes}
              onChange={(e) => setPscCodes(e.target.value)}
              placeholder="D310, D307"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Agency IDs (comma-separated)
            </label>
            <input
              type="text"
              value={agencies}
              onChange={(e) => setAgencies(e.target.value)}
              placeholder="9700, 1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Search
            </label>
            <input
              type="text"
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
              placeholder="Company name or UEI"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount ($)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount ($)
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="100000000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Award Types
          </label>
          <div className="flex flex-wrap gap-2">
            {['A', 'B', 'C', 'D', 'IDV'].map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={awardTypes.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setAwardTypes([...awardTypes, type])
                    } else {
                      setAwardTypes(awardTypes.filter((t) => t !== type))
                    }
                  }}
                  className="mr-2"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={useDatabase}
              onChange={(e) => setUseDatabase(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Search database (unchecked = search API directly)</span>
          </label>
        </div>

        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSearching ? 'Searching...' : 'Search Awards'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Showing {results.length} of {pageMetadata?.total || 0} results
            {pageMetadata && (
              <span className="ml-2">
                (Page {pageMetadata.page} of {pageMetadata.total_pages || 1})
              </span>
            )}
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        {results.map((award) => (
          <div
            key={award.id || award.award_id || award.generated_unique_award_id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {award.award_type_description || award.category || 'Award'}
                </h3>
                <p className="text-sm text-gray-600">
                  Award ID: {award.award_id || award.generated_unique_award_id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(award.total_obligation)}
                </p>
                <p className="text-xs text-gray-500">Total Obligation</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Awarding Agency</p>
                <p className="text-gray-600">
                  {award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Recipient</p>
                <p className="text-gray-600">{award.recipient_name || award.recipient?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Award Date</p>
                <p className="text-gray-600">{formatDate(award.awarding_date || award.start_date)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">NAICS</p>
                <p className="text-gray-600">
                  {award.naics_code || 'N/A'}
                  {award.naics_description && (
                    <span className="text-xs block text-gray-500">{award.naics_description}</span>
                  )}
                </p>
              </div>
            </div>

            {award.description && (
              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-2">{award.description}</p>
              </div>
            )}

            <div className="flex gap-2 text-sm">
              {award.transaction_count !== undefined && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {award.transaction_count} transactions
                </span>
              )}
              {award.subaward_count !== undefined && award.subaward_count > 0 && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {award.subaward_count} subawards
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pageMetadata && pageMetadata.total_pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              setPage(page - 1)
              handleSearch()
            }}
            disabled={!pageMetadata.has_previous_page || isSearching}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pageMetadata.page} of {pageMetadata.total_pages}
          </span>
          <button
            onClick={() => {
              setPage(page + 1)
              handleSearch()
            }}
            disabled={!pageMetadata.has_next_page || isSearching}
            className="px-4 py-2 border border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {results.length === 0 && !isSearching && !error && !hasSearched && (
        <div className="text-center py-12">
          <p className="text-neutral-600 mb-4">Click &quot;Search Awards&quot; to view ingested awards from the database.</p>
          <p className="text-sm text-neutral-500">The database search is enabled by default. Uncheck &quot;Search database&quot; to search the API directly instead.</p>
        </div>
      )}
      {results.length === 0 && !isSearching && !error && hasSearched && (
        <div className="text-center py-12 text-neutral-500">
          <p>No results found. Try adjusting your search criteria or check if awards have been ingested.</p>
        </div>
      )}
      </div>
    </div>
  )
}

