'use client'

import { useState, useEffect } from 'react'

interface Award {
  id: string
  recipient_name?: string
  awarding_agency_name?: string
  total_obligation?: number
  naics_code?: string
  awarding_date?: Date
}

export default function IncumbentIntelligence() {
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    agency: '',
    naics: '',
    minAmount: '',
  })

  useEffect(() => {
    loadAwards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const loadAwards = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.agency) params.append('agency', filters.agency)
      if (filters.naics) params.append('naics', filters.naics)
      if (filters.minAmount) params.append('minAmount', filters.minAmount)

      const response = await fetch(`/api/admin/capture/incumbents?${params}`)
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

  // Group by recipient for vendor dominance
  const vendorDominance = awards.reduce((acc, award) => {
    if (award.recipient_name) {
      if (!acc[award.recipient_name]) {
        acc[award.recipient_name] = {
          name: award.recipient_name,
          count: 0,
          totalValue: 0,
        }
      }
      acc[award.recipient_name].count++
      acc[award.recipient_name].totalValue += award.total_obligation || 0
    }
    return acc
  }, {} as Record<string, { name: string; count: number; totalValue: number }>)

  const topVendors = Object.values(vendorDominance)
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              NAICS Code
            </label>
            <input
              type="text"
              value={filters.naics}
              onChange={(e) => setFilters({ ...filters, naics: e.target.value })}
              placeholder="Filter by NAICS"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Min Amount
            </label>
            <input
              type="number"
              value={filters.minAmount}
              onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              placeholder="Minimum award value"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Vendor Dominance */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Top Vendors</h2>
        {loading ? (
          <div className="text-center text-neutral-600 py-8">Loading...</div>
        ) : topVendors.length === 0 ? (
          <div className="text-center text-neutral-600 py-8">No data available</div>
        ) : (
          <div className="space-y-3">
            {topVendors.map((vendor, index) => (
              <div key={vendor.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-neutral-600">#{index + 1}</span>
                  <span className="text-sm font-medium text-neutral-900">{vendor.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-neutral-900">
                    ${vendor.totalValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-600">{vendor.count} awards</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Awards */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Awards</h2>
        {loading ? (
          <div className="text-center text-neutral-600 py-8">Loading...</div>
        ) : awards.length === 0 ? (
          <div className="text-center text-neutral-600 py-8">No awards found</div>
        ) : (
          <div className="space-y-3">
            {awards.slice(0, 20).map((award) => (
              <div key={award.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-neutral-900 mb-1">
                      {award.recipient_name || 'Unknown'}
                    </div>
                    <div className="text-xs text-neutral-600">
                      {award.awarding_agency_name || 'Unknown Agency'}
                      {award.naics_code && ` • NAICS: ${award.naics_code}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-neutral-900">
                      {award.total_obligation
                        ? `$${award.total_obligation.toLocaleString()}`
                        : 'N/A'}
                    </div>
                    {award.awarding_date && (
                      <div className="text-xs text-neutral-600">
                        {new Date(award.awarding_date).toLocaleDateString()}
                      </div>
                    )}
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

