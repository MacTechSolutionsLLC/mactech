'use client'

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
    </div>
  )
}

