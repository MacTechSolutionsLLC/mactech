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
    <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 p-8 mb-8">
      <div className="space-y-8">
        {/* Header with Count */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">Filters</h3>
            <p className="text-sm text-neutral-500">Refine your contract search</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-neutral-900">{opportunityCount.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 uppercase tracking-wider">Opportunities</div>
          </div>
        </div>

        {/* First Row: Score, Sort, Show Low Score */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Minimum Score: <span className="text-accent-700 font-semibold">{minScore}%</span>
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer accent-accent-700"
                style={{
                  background: `linear-gradient(to right, rgb(29 78 216) 0%, rgb(29 78 216) ${minScore}%, rgb(229 231 235) ${minScore}%, rgb(229 231 235) 100%)`
                }}
              />
              <div className="flex justify-between mt-1 text-xs text-neutral-500">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-3">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'deadline' | 'date')}
              className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all appearance-none cursor-pointer hover:border-neutral-300"
            >
              <option value="score">Score (High to Low)</option>
              <option value="deadline">Deadline (Soonest)</option>
              <option value="date">Posted Date (Newest)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Set-Aside and NAICS Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-700">
                Set-Aside Type
              </label>
              {setAsideFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSetAsideFilter([])}
                  className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
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
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm min-h-[140px] transition-all hover:border-neutral-300"
              size={6}
            >
              {SET_ASIDE_OPTIONS.map(option => (
                <option key={option.value} value={option.value} className="py-2">
                  {option.label}
                </option>
              ))}
            </select>
            {setAsideFilter.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                Selected: <span className="font-medium text-neutral-700">{setAsideFilter.join(', ')}</span>
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-1.5">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-neutral-700">
                NAICS Code
              </label>
              {naicsFilter.length > 0 && (
                <button
                  type="button"
                  onClick={() => setNaicsFilter([])}
                  className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
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
              className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-accent-500 text-sm min-h-[140px] transition-all hover:border-neutral-300"
              size={6}
            >
              {NAICS_OPTIONS.map(option => (
                <option key={option.code} value={option.code} className="py-2">
                  {option.code} - {option.name}
                </option>
              ))}
            </select>
            {naicsFilter.length > 0 && (
              <p className="text-xs text-neutral-500 mt-2">
                Selected: <span className="font-medium text-neutral-700">{naicsFilter.join(', ')}</span>
              </p>
            )}
            <p className="text-xs text-neutral-400 mt-1.5">
              Hold Ctrl/Cmd to select multiple
            </p>
          </div>
        </div>

        {/* Third Row: Toggles */}
        <div className="flex items-center gap-8 pt-4 border-t border-neutral-100">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showLowScore"
              checked={showLowScore}
              onChange={(e) => setShowLowScore(e.target.checked)}
              className="w-5 h-5 rounded-md border-neutral-300 text-accent-700 focus:ring-2 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer transition-all"
            />
            <label htmlFor="showLowScore" className="text-sm font-medium text-neutral-700 cursor-pointer">
              Show low-score contracts
            </label>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="soleSourceFilter"
              checked={soleSourceFilter}
              onChange={(e) => setSoleSourceFilter(e.target.checked)}
              className="w-5 h-5 rounded-md border-neutral-300 text-accent-700 focus:ring-2 focus:ring-accent-500 focus:ring-offset-0 cursor-pointer transition-all"
            />
            <label htmlFor="soleSourceFilter" className="text-sm font-medium text-neutral-700 cursor-pointer">
              Show only Sole Source contracts
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
