/**
 * Intent-based filter component
 * Toggle buttons for decision-oriented filtering
 */

'use client'

import { IntentFilters } from '@/types/capture'

interface IntentFiltersComponentProps {
  filters: IntentFilters
  onChange: (filters: IntentFilters) => void
}

export default function IntentFiltersComponent({ filters, onChange }: IntentFiltersComponentProps) {
  const toggleFilter = (key: keyof IntentFilters) => {
    onChange({
      ...filters,
      [key]: !filters[key],
    })
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => toggleFilter('shapeableOnly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            filters.shapeableOnly
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          Shapeable Opportunities
        </button>
        
        <button
          onClick={() => toggleFilter('highIncumbentRisk')}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            filters.highIncumbentRisk
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          High Incumbent Risk
        </button>
        
        <button
          onClick={() => toggleFilter('newVendorFriendly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            filters.newVendorFriendly
              ? 'bg-blue-50 text-blue-800 border-blue-300'
              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          New Vendor Friendly
        </button>
        
        <button
          onClick={() => toggleFilter('earlyLifecycleOnly')}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
            filters.earlyLifecycleOnly
              ? 'bg-green-50 text-green-800 border-green-300'
              : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
          }`}
        >
          Early Lifecycle Only
        </button>
      </div>
    </div>
  )
}
