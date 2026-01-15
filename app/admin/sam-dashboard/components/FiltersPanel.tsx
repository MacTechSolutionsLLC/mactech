'use client'

const NAICS_OPTIONS = [
  { code: '541512', name: 'Computer Systems Design Services' },
  { code: '541511', name: 'Custom Computer Programming Services' },
  { code: '541519', name: 'Other Computer Related Services' },
  { code: '541513', name: 'Computer Facilities Management Services' },
  { code: '541330', name: 'Engineering Services' },
  { code: '518210', name: 'Data Processing, Hosting, and Related Services' },
] as const

interface FiltersPanelProps {
  minScore: number
  setMinScore: (score: number) => void
  sortBy: 'score' | 'deadline' | 'date'
  setSortBy: (sort: 'score' | 'deadline' | 'date') => void
  showLowScore: boolean
  setShowLowScore: (show: boolean) => void
  naicsFilter: string[]
  setNaicsFilter: (naics: string[]) => void
  setAsideFilter: string[]
  setSetAsideFilter: (setAside: string[]) => void
  opportunityCount: number
}

export default function FiltersPanel({
  minScore,
  setMinScore,
  sortBy,
  setSortBy,
  showLowScore,
  setShowLowScore,
  naicsFilter,
  setNaicsFilter,
  setAsideFilter,
  setSetAsideFilter,
  opportunityCount,
}: FiltersPanelProps) {
  return (
    <div className="card p-6 mb-8">
      <div className="space-y-6">
        {/* First Row: Score, Sort, Show Low Score */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex-1">
            <label className="block text-body-sm font-medium text-neutral-900 mb-2">
              Min Score: {minScore}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-900 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'deadline' | 'date')}
              className="block w-full rounded-sm border-neutral-300 text-body-sm"
            >
              <option value="score">Score (High to Low)</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="date">Posted Date (Newest)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showLowScore"
              checked={showLowScore}
              onChange={(e) => setShowLowScore(e.target.checked)}
              className="rounded border-neutral-300"
            />
            <label htmlFor="showLowScore" className="text-body-sm text-neutral-700">
              Show low-score
            </label>
          </div>

          <div className="text-body-sm text-neutral-600">
            {opportunityCount} opportunities
          </div>
        </div>

        {/* Second Row: NAICS Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-body-sm font-medium text-neutral-900">
              Filter by NAICS Code
            </label>
            {naicsFilter.length > 0 && (
              <button
                type="button"
                onClick={() => setNaicsFilter([])}
                className="text-body-xs text-accent-700 hover:text-accent-800 underline"
              >
                Clear Selection
              </button>
            )}
          </div>
          <select
            multiple
            value={naicsFilter}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value)
              setNaicsFilter(selected)
            }}
            className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-body-sm min-h-[120px]"
            size={6}
          >
            {NAICS_OPTIONS.map(option => (
              <option key={option.code} value={option.code}>
                {option.code} - {option.name}
              </option>
            ))}
          </select>
          <p className="text-body-xs text-neutral-500 mt-1">
            Hold Ctrl/Cmd to select multiple codes. {naicsFilter.length > 0 && `Selected: ${naicsFilter.join(', ')}`}
          </p>
        </div>
      </div>
    </div>
  )
}

