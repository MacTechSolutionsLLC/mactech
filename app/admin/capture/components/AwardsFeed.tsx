'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Award {
  id: string
  human_award_id: string | null
  generated_internal_id: string
  description: string | null
  awarding_agency_name: string | null
  total_obligation: number | null
  start_date: string | null
  end_date: string | null
  relevance_score: number | null
  signals: string[]
  naics_code: string | null
  recipient_name: string | null
  transaction_count: number | null
  subaward_count: number | null
}

export default function AwardsFeed() {
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)
  const [minScore, setMinScore] = useState(50)

  useEffect(() => {
    loadAwards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScore])

  const loadAwards = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/capture/usaspending/awards?minScore=${minScore}`)
      const data = await response.json()

      if (data.success) {
        setAwards(data.awards || [])
      }
    } catch (error) {
      console.error('Error loading awards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalBadgeColor = (signal: string) => {
    switch (signal) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'STABLE':
        return 'bg-blue-100 text-blue-800'
      case 'DECLINING':
        return 'bg-yellow-100 text-yellow-800'
      case 'RECOMPETE_WINDOW':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Data Source Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Historical Awards</h2>
            <p className="text-sm text-neutral-600 mt-1">Data source: USAspending.gov</p>
          </div>
          <div className="text-sm text-neutral-500">
            {awards.length} award{awards.length !== 1 ? 's' : ''} displayed
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Awards Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Min Relevance Score
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Awards List */}
      <div className="bg-white rounded-lg border border-neutral-200">
        {loading ? (
          <div className="p-8 text-center text-neutral-600">Loading awards...</div>
        ) : awards.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-neutral-600 mb-2">No awards found</div>
            <div className="text-xs text-neutral-500">Data source: USAspending.gov</div>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200">
            {awards.map((award) => (
              <div
                key={award.id}
                className="p-6 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {award.relevance_score !== null && (
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            award.relevance_score >= 70
                              ? 'bg-green-100 text-green-800'
                              : award.relevance_score >= 50
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-neutral-100 text-neutral-800'
                          }`}
                        >
                          Score: {award.relevance_score}
                        </span>
                      )}
                      {award.signals.map((signal) => (
                        <span
                          key={signal}
                          className={`px-2 py-1 rounded text-xs font-medium ${getSignalBadgeColor(signal)}`}
                        >
                          {signal}
                        </span>
                      ))}
                    </div>
                    <Link
                      href={`/admin/capture/award/${award.generated_internal_id}`}
                      className="text-lg font-semibold text-neutral-900 hover:text-accent-700 mb-2 block"
                    >
                      {award.description?.substring(0, 200) || 'Untitled Award'}
                    </Link>
                    
                    <div className="space-y-2 mb-3">
                      {award.awarding_agency_name && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">Agency:</span> {award.awarding_agency_name}
                        </div>
                      )}
                      {award.total_obligation && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">Amount:</span> ${(award.total_obligation / 1_000_000).toFixed(2)}M
                        </div>
                      )}
                      {award.end_date && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">PoP End:</span> {new Date(award.end_date).toLocaleDateString()}
                        </div>
                      )}
                      {award.recipient_name && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">Recipient:</span> {award.recipient_name}
                        </div>
                      )}
                      {award.naics_code && (
                        <div className="text-sm text-neutral-600">
                          <span className="font-medium">NAICS:</span> {award.naics_code}
                        </div>
                      )}
                    </div>
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
