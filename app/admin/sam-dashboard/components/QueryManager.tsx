'use client'

import { useState } from 'react'

interface QueryManagerProps {
  onQueryComplete?: () => void
}

interface QueryConfig {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  name: string
  description: string
  params: {
    ptype?: string
    naics?: string
    typeOfSetAside?: string
    keywords?: string
    postedFrom: string
    postedTo: string
    limit: number
  }
}

interface QueryResult {
  queryId: string
  fetched: number
  deduplicated: number
  passedFilters: number
  scoredAbove50: number
  error?: string
  timestamp: string
}

// Helper to get rolling date range (45 days back from today)
function getDefaultDateRange(): { from: string; to: string } {
  const today = new Date()
  const to = today.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  const fromDate = new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000)
  const from = fromDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  
  return { from, to }
}

export default function QueryManager({ onQueryComplete }: QueryManagerProps = {}) {
  const defaultDates = getDefaultDateRange()
  
  const [queries, setQueries] = useState<QueryConfig[]>([
    {
      id: 'A',
      name: 'Broad Universe (Safety Net)',
      description: 'All opportunity types to ensure nothing is missed (removed k=Combined Synopsis/Solicitation)',
      params: {
        ptype: 'r,p,o',
        postedFrom: defaultDates.from,
        postedTo: defaultDates.to,
        limit: 1000,
      },
    },
    {
      id: 'B',
      name: 'Cyber / IT NAICS Core',
      description: 'Primary cyber & IT consulting lane',
      params: {
        naics: '541512,541511,541519,518210',
        ptype: 'r,p,o',
        postedFrom: defaultDates.from,
        postedTo: defaultDates.to,
        limit: 1000,
      },
    },
    {
      id: 'C',
      name: 'Small Business / SDVOSB Focused',
      description: 'High-probability awards for MacTech Solutions',
      params: {
        typeOfSetAside: 'SBA,SDVOSBC',
        ptype: 'o',
        postedFrom: defaultDates.from,
        postedTo: defaultDates.to,
        limit: 1000,
      },
    },
    {
      id: 'D',
      name: 'Sources Sought (Early Capture)',
      description: 'Shape requirements before solicitations drop',
      params: {
        ptype: 'r',
        postedFrom: defaultDates.from,
        postedTo: defaultDates.to,
        limit: 1000,
      },
    },
    {
      id: 'E',
      name: 'Keyword-Intent (NAICS-Agnostic)',
      description: 'Simplified to "cyber security" - let AI handle RMF, STIG, ATO, etc.',
      params: {
        keywords: 'cyber security',
        ptype: 'r,p,o',
        postedFrom: defaultDates.from,
        postedTo: defaultDates.to,
        limit: 1000,
      },
    },
  ])

  const [results, setResults] = useState<Map<string, QueryResult>>(new Map())
  const [running, setRunning] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpanded = (queryId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(queryId)) {
        next.delete(queryId)
      } else {
        next.add(queryId)
      }
      return next
    })
  }

  const handleRunQuery = async (query: QueryConfig) => {
    setRunning(prev => new Set(prev).add(query.id))
    
    try {
      const response = await fetch('/api/admin/sam/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queryId: query.id,
          params: query.params,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Query failed')
      }

      const result: QueryResult = {
        queryId: query.id,
        fetched: data.fetched || 0,
        deduplicated: data.deduplicated || 0,
        passedFilters: data.passedFilters || 0,
        scoredAbove50: data.scoredAbove50 || 0,
        timestamp: new Date().toISOString(),
      }

      setResults(prev => new Map(prev).set(query.id, result))
      
      // Refresh dashboard if callback provided
      if (onQueryComplete) {
        onQueryComplete()
      }
    } catch (error) {
      const result: QueryResult = {
        queryId: query.id,
        fetched: 0,
        deduplicated: 0,
        passedFilters: 0,
        scoredAbove50: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
      setResults(prev => new Map(prev).set(query.id, result))
    } finally {
      setRunning(prev => {
        const next = new Set(prev)
        next.delete(query.id)
        return next
      })
    }
  }

  const updateQuery = (queryId: string, field: string, value: string | number) => {
    setQueries(prev => prev.map(q => {
      if (q.id === queryId) {
        return {
          ...q,
          params: {
            ...q.params,
            [field]: value,
          },
        }
      }
      return q
    }))
  }

  return (
    <div className="card p-6 mb-8">
      <h2 className="heading-3 mb-6">Query Management</h2>
      <p className="text-body-sm text-neutral-600 mb-6">
        View, edit, and run individual SAM.gov queries independently. Each query can be customized and executed separately.
      </p>

      <div className="space-y-4">
        {queries.map(query => {
          const isExpanded = expanded.has(query.id)
          const isRunning = running.has(query.id)
          const result = results.get(query.id)

          return (
            <div key={query.id} className="border border-neutral-200 rounded-sm">
              {/* Query Header */}
              <div className="p-4 bg-neutral-50 border-b border-neutral-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="heading-4">Query {query.id}: {query.name}</h3>
                      {result && (
                        <span className={`text-body-xs px-2 py-1 rounded ${
                          result.error 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {result.error ? 'Failed' : 'Completed'}
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-neutral-600">{query.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleExpanded(query.id)}
                      className="btn-secondary text-body-sm px-4 py-2"
                    >
                      {isExpanded ? 'Hide' : 'Edit'}
                    </button>
                    <button
                      onClick={() => handleRunQuery(query)}
                      disabled={isRunning}
                      className="btn-primary text-body-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRunning ? 'Running...' : 'Run Query'}
                    </button>
                  </div>
                </div>

                {/* Result Summary */}
                {result && (
                  <div className="mt-4 pt-4 border-t border-neutral-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-body-sm">
                      <div>
                        <span className="text-neutral-600">Fetched:</span>
                        <span className="ml-2 font-medium text-neutral-900">{result.fetched.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Deduplicated:</span>
                        <span className="ml-2 font-medium text-neutral-900">{result.deduplicated.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Passed Filters:</span>
                        <span className="ml-2 font-medium text-neutral-900">{result.passedFilters.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-neutral-600">Scored ≥ 50:</span>
                        <span className="ml-2 font-medium text-neutral-900">{result.scoredAbove50.toLocaleString()}</span>
                      </div>
                    </div>
                    {result.error && (
                      <div className="mt-3 text-body-sm text-red-700 bg-red-50 p-2 rounded">
                        Error: {result.error}
                      </div>
                    )}
                    {!result.error && result.scoredAbove50 > 0 && (
                      <div className="mt-3 text-body-sm text-green-700 bg-green-50 p-2 rounded">
                        ✓ {result.scoredAbove50} opportunities stored in database and available in dashboard
                      </div>
                    )}
                    <div className="mt-2 text-body-xs text-neutral-500">
                      Run at: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Query Parameters Editor */}
              {isExpanded && (
                <div className="p-4 space-y-4">
                  {/* Date Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Posted From (MM/DD/YYYY)
                      </label>
                      <input
                        type="text"
                        value={query.params.postedFrom}
                        onChange={(e) => updateQuery(query.id, 'postedFrom', e.target.value)}
                        placeholder="01/01/2025"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Posted To (MM/DD/YYYY)
                      </label>
                      <input
                        type="text"
                        value={query.params.postedTo}
                        onChange={(e) => updateQuery(query.id, 'postedTo', e.target.value)}
                        placeholder="12/31/2025"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                    </div>
                  </div>

                  {/* Query-Specific Parameters */}
                  {query.params.ptype && (
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Opportunity Types (ptype)
                      </label>
                      <input
                        type="text"
                        value={query.params.ptype}
                        onChange={(e) => updateQuery(query.id, 'ptype', e.target.value)}
                        placeholder="r,p,k,o"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                      <p className="text-body-xs text-neutral-500 mt-1">
                        Comma-separated: r=Sources Sought, p=Presolicitation, o=Other (k=Combined removed per spec)
                      </p>
                    </div>
                  )}

                  {query.params.naics && (
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        NAICS Codes (naics)
                      </label>
                      <input
                        type="text"
                        value={query.params.naics}
                        onChange={(e) => updateQuery(query.id, 'naics', e.target.value)}
                        placeholder="541512,541511,541519,518210"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                      <p className="text-body-xs text-neutral-500 mt-1">
                        Comma-separated NAICS codes (correct parameter name: naics, not ncode)
                      </p>
                    </div>
                  )}

                  {query.params.typeOfSetAside && (
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Set-Aside Types
                      </label>
                      <input
                        type="text"
                        value={query.params.typeOfSetAside}
                        onChange={(e) => updateQuery(query.id, 'typeOfSetAside', e.target.value)}
                        placeholder="SBA,SDVOSBC"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                      <p className="text-body-xs text-neutral-500 mt-1">
                        Comma-separated: SBA, SDVOSBC, etc.
                      </p>
                    </div>
                  )}

                  {query.params.keywords && (
                    <div>
                      <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Keywords
                      </label>
                      <input
                        type="text"
                        value={query.params.keywords}
                        onChange={(e) => updateQuery(query.id, 'keywords', e.target.value)}
                        placeholder="cyber,rmf,stig,ato"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                      />
                      <p className="text-body-xs text-neutral-500 mt-1">
                        Simplified to &quot;cyber security&quot; - let AI handle RMF, STIG, ATO, Zero Trust, etc.
                      </p>
                    </div>
                  )}

                  {/* Limit */}
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Limit per Page
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={query.params.limit}
                      onChange={(e) => updateQuery(query.id, 'limit', parseInt(e.target.value, 10) || 100)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
                    />
                      <p className="text-body-xs text-neutral-500 mt-1">
                        Maximum 1000 per page (default: 1000)
                      </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

