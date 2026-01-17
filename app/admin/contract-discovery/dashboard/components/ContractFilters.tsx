'use client'

const NAICS_OPTIONS = [
  { code: '541512', name: 'Computer Systems Design Services' },
  { code: '541511', name: 'Custom Computer Programming Services' },
  { code: '541519', name: 'Other Computer Related Services' },
  { code: '541513', name: 'Computer Facilities Management Services' },
  { code: '541330', name: 'Engineering Services' },
  { code: '518210', name: 'Data Processing, Hosting, and Related Services' },
] as const

const SET_ASIDE_OPTIONS = [
  { value: 'SDVOSB', label: 'SDVOSB - Service-Disabled Veteran-Owned Small Business' },
  { value: 'VOSB', label: 'VOSB - Veteran-Owned Small Business' },
  { value: '8(a)', label: '8(a) - Small Disadvantaged Business' },
  { value: 'HUBZone', label: 'HUBZone - Historically Underutilized Business Zone' },
  { value: 'WOSB', label: 'WOSB - Women-Owned Small Business' },
  { value: 'Small Business Set-Aside', label: 'Small Business Set-Aside' },
] as const

interface ContractFiltersProps {
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
  soleSourceFilter: boolean
  setSoleSourceFilter: (soleSource: boolean) => void
  opportunityCount: number
}

export default function ContractFilters({
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
  soleSourceFilter,
  setSoleSourceFilter,
  opportunityCount,
}: ContractFiltersProps) {
  return (
    <div className="card p-6 mb-6 shadow-sm">
      <div className="space-y-6">
        {/* First Row: Score, Sort, Show Low Score, Count */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2">
            <label className="block text-body-sm font-medium text-neutral-900 mb-2">
              Min Score: {minScore}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-accent-700"
            />
          </div>

          <div>
            <label className="block text-body-sm font-medium text-neutral-900 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'deadline' | 'date')}
              className="block w-full px-3 py-2 border border-neutral-300 rounded-sm text-body-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="score">Score (High to Low)</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="date">Posted Date (Newest)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showLowScore"
              checked={showLowScore}
              onChange={(e) => setShowLowScore(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 text-accent-700 focus:ring-accent-500"
            />
            <label htmlFor="showLowScore" className="text-body-sm text-neutral-700">
              Show low-score
            </label>
          </div>
        </div>

        {/* Second Row: Set-Aside and Sole Source Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-body-sm font-medium text-neutral-900">
                Filter by Set-Aside
              </label>
              {setAsideFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSetAsideFilter([])}
                  className="text-body-xs text-accent-700 hover:text-accent-800 underline"
                >
                  Clear
                </button>
              )}
            </div>
            <select
              multiple
              value={setAsideFilter}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setSetAsideFilter(selected)
              }}
              className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-body-sm min-h-[120px]"
              size={6}
            >
              {SET_ASIDE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-body-xs text-neutral-500 mt-1">
              Hold Ctrl/Cmd to select multiple. {setAsideFilter.length > 0 && `Selected: ${setAsideFilter.join(', ')}`}
            </p>
          </div>

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
                  Clear
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

        {/* Third Row: Sole Source Toggle */}
        <div className="flex items-center gap-3 pt-2 border-t border-neutral-200">
          <input
            type="checkbox"
            id="soleSourceFilter"
            checked={soleSourceFilter}
            onChange={(e) => setSoleSourceFilter(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 text-accent-700 focus:ring-accent-500 cursor-pointer"
          />
          <label htmlFor="soleSourceFilter" className="text-body-sm font-medium text-neutral-900 cursor-pointer">
            Show only Sole Source contracts
          </label>
        </div>

        {/* Count Display */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <div className="text-body-sm text-neutral-600">
            <span className="font-semibold text-neutral-900">{opportunityCount}</span> opportunities found
          </div>
        </div>
      </div>
    </div>
  )
}

