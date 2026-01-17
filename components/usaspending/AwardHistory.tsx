'use client'

import { useState, useEffect } from 'react'

interface EnrichmentResult {
  similar_awards: any[]
  statistics: {
    count: number
    average_obligation: number | null
    min_obligation: number | null
    max_obligation: number | null
    unique_recipients: string[]
    unique_agencies: string[]
  }
}

interface AwardHistoryProps {
  opportunityId: string
}

export default function AwardHistory({ opportunityId }: AwardHistoryProps) {
  const [enrichment, setEnrichment] = useState<EnrichmentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEnrichment() {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/usaspending/enrich-opportunity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ opportunity_id: opportunityId }),
        })

        const data = await response.json()

        if (data.success) {
          setEnrichment({
            similar_awards: data.similar_awards || [],
            statistics: data.statistics || {
              count: 0,
              average_obligation: null,
              min_obligation: null,
              max_obligation: null,
              unique_recipients: [],
              unique_agencies: [],
            },
          })
        } else {
          setError(data.error || 'Failed to load historical awards')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (opportunityId) {
      fetchEnrichment()
    }
  }, [opportunityId])

  const formatCurrency = (amount?: number | null) => {
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Awards</h3>
        <p className="text-gray-500">Loading similar historical awards...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Awards</h3>
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (!enrichment || enrichment.similar_awards.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Historical Awards</h3>
        <p className="text-gray-500">No similar historical awards found.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Historical Awards</h3>
      <p className="text-sm text-gray-600 mb-4">
        Found {enrichment.statistics.count} similar historical awards
      </p>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <p className="text-xs text-gray-600 mb-1">Average Award</p>
          <p className="text-sm font-semibold">
            {formatCurrency(enrichment.statistics.average_obligation)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Min Award</p>
          <p className="text-sm font-semibold">
            {formatCurrency(enrichment.statistics.min_obligation)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Max Award</p>
          <p className="text-sm font-semibold">
            {formatCurrency(enrichment.statistics.max_obligation)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Unique Recipients</p>
          <p className="text-sm font-semibold">
            {enrichment.statistics.unique_recipients.length}
          </p>
        </div>
      </div>

      {/* Similar Awards List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700 mb-2">Similar Past Awards</h4>
        {enrichment.similar_awards.slice(0, 5).map((award, index) => (
          <div
            key={award.id || award.award_id || index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {award.award_type_description || award.category || 'Award'}
                </p>
                <p className="text-xs text-gray-500">
                  {award.awarding_agency?.name || award.awarding_agency?.toptier_agency?.name || 'Unknown Agency'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">
                  {formatCurrency(award.total_obligation)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div>
                <span className="font-medium">Recipient:</span>{' '}
                {award.recipient_name || award.recipient?.name || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Date:</span>{' '}
                {formatDate(award.awarding_date || award.start_date)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {enrichment.statistics.unique_recipients.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Past Winners:</p>
          <div className="flex flex-wrap gap-2">
            {enrichment.statistics.unique_recipients.slice(0, 5).map((recipient, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {recipient}
              </span>
            ))}
            {enrichment.statistics.unique_recipients.length > 5 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{enrichment.statistics.unique_recipients.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

