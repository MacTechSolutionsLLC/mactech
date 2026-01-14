'use client'

interface FilterControlsProps {
  minScore: number
  setMinScore: (score: number) => void
  sortBy: 'score' | 'date'
  setSortBy: (sort: 'score' | 'date') => void
  onExport: (format: 'csv' | 'json') => void
  opportunityCount: number
}

export default function FilterControls({
  minScore,
  setMinScore,
  sortBy,
  setSortBy,
  onExport,
  opportunityCount,
}: FilterControlsProps) {
  return (
    <div className="card p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div>
            <label htmlFor="min-score" className="block text-body-sm font-medium text-neutral-900 mb-2">
              Minimum Score
            </label>
            <input
              id="min-score"
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value, 10) || 50)}
              className="w-24 px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
            />
          </div>

          <div>
            <label htmlFor="sort-by" className="block text-body-sm font-medium text-neutral-900 mb-2">
              Sort By
            </label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
              className="px-3 py-2 border border-neutral-300 rounded-sm text-body-sm"
            >
              <option value="score">Score (High to Low)</option>
              <option value="date">Date (Newest First)</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="text-body-sm text-neutral-600">
              <span className="font-medium text-neutral-900">{opportunityCount}</span> opportunities
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onExport('csv')}
            className="btn-secondary text-body-sm"
          >
            Export CSV
          </button>
          <button
            onClick={() => onExport('json')}
            className="btn-secondary text-body-sm"
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  )
}

