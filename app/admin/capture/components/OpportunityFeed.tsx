'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import OpportunityDetail from './OpportunityDetail'

interface Opportunity {
  id: string
  notice_id?: string
  title: string
  agency?: string
  relevance_score: number
  deadline?: string
  aiSummary?: string
  flagged: boolean
  ignored: boolean
  capture_status?: string
  naics_codes: string
  set_aside: string
}

export default function OpportunityFeed() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    minScore: 50,
    agency: '',
    naics: '',
    setAside: '',
    status: 'all' as 'all' | 'flagged' | 'ignored' | 'pursuing',
  })
  const [sortBy, setSortBy] = useState<'score' | 'deadline' | 'date'>('score')

  useEffect(() => {
    loadOpportunities()
  }, [filters, sortBy])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        minScore: filters.minScore.toString(),
        sortBy,
        ...(filters.agency && { agency: filters.agency }),
        ...(filters.naics && { naics: filters.naics }),
        ...(filters.setAside && { setAside: filters.setAside }),
        ...(filters.status !== 'all' && { status: filters.status }),
      })

      const response = await fetch(`/api/admin/capture/opportunities?${params}`)
      const data = await response.json()

      if (data.success) {
        setOpportunities(data.opportunities || [])
      }
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlag = async (id: string) => {
    try {
      await fetch(`/api/admin/capture/opportunities/${id}/flag`, {
        method: 'POST',
      })
      loadOpportunities()
    } catch (error) {
      console.error('Error flagging opportunity:', error)
    }
  }

  const handleIgnore = async (id: string) => {
    try {
      await fetch(`/api/admin/capture/opportunities/${id}/ignore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User dismissed' }),
      })
      loadOpportunities()
    } catch (error) {
      console.error('Error ignoring opportunity:', error)
    }
  }

  if (selectedOpportunity) {
    return (
      <OpportunityDetail
        opportunityId={selectedOpportunity}
        onBack={() => setSelectedOpportunity(null)}
        onUpdate={loadOpportunities}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Min Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={filters.minScore}
              onChange={(e) =>
                setFilters({ ...filters, minScore: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Agency
            </label>
            <input
              type="text"
              value={filters.agency}
              onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
              placeholder="Filter by agency"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            >
              <option value="all">All</option>
              <option value="flagged">Flagged</option>
              <option value="ignored">Ignored</option>
              <option value="pursuing">Pursuing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            >
              <option value="score">Relevance Score</option>
              <option value="deadline">Deadline</option>
              <option value="date">Posted Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">Loading opportunities...</div>
        ) : opportunities.length === 0 ? (
          <div className="p-8 text-center text-neutral-600">No opportunities found</div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-6 hover:bg-neutral-50 transition-colors cursor-pointer"
                onClick={() => setSelectedOpportunity(opp.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          opp.relevance_score >= 70
                            ? 'bg-green-100 text-green-800'
                            : opp.relevance_score >= 50
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        Score: {opp.relevance_score}
                      </span>
                      {opp.flagged && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Flagged
                        </span>
                      )}
                      {opp.ignored && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-neutral-100 text-neutral-800">
                          Ignored
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-neutral-600 mb-2">
                      {opp.agency && <span>Agency: {opp.agency}</span>}
                      {opp.deadline && (
                        <span>Deadline: {new Date(opp.deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    {opp.aiSummary && (
                      <p className="text-sm text-neutral-700 line-clamp-2">{opp.aiSummary}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleFlag(opp.id)}
                      className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 rounded hover:bg-blue-100"
                    >
                      {opp.flagged ? 'Unflag' : 'Flag'}
                    </button>
                    <button
                      onClick={() => handleIgnore(opp.id)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-50 rounded hover:bg-neutral-100"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

