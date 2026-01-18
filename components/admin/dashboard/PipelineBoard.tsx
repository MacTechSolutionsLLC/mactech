'use client'

import { useState, useEffect, useMemo } from 'react'
import StageColumn from './StageColumn'

interface Contract {
  id: string
  title: string
  agency?: string | null
  relevance_score: number
  pipeline_status: string
  pipeline_stage?: string | null
  scraped: boolean
  usaspending_enrichment_status?: string | null
  aiAnalysis?: string | null
  flagged: boolean
  ignored: boolean
  created_at: string
  url: string
}

interface PipelineBoardProps {
  contracts: Contract[]
  onFlag?: (id: string, flagged: boolean) => void
  onIgnore?: (id: string) => void
  onProcess?: (id: string) => void
  onRefresh?: () => void
}

const STAGES = [
  { key: 'discovered', label: 'Discovered', color: 'bg-blue-50', borderColor: 'border-blue-300' },
  { key: 'scraping', label: 'Scraping', color: 'bg-yellow-50', borderColor: 'border-yellow-300' },
  { key: 'scraped', label: 'Scraped', color: 'bg-green-50', borderColor: 'border-green-300' },
  { key: 'enriching', label: 'Enriching', color: 'bg-purple-50', borderColor: 'border-purple-300' },
  { key: 'enriched', label: 'Enriched', color: 'bg-indigo-50', borderColor: 'border-indigo-300' },
  { key: 'analyzing', label: 'Analyzing', color: 'bg-pink-50', borderColor: 'border-pink-300' },
  { key: 'analyzed', label: 'Analyzed', color: 'bg-teal-50', borderColor: 'border-teal-300' },
  { key: 'ready', label: 'Ready', color: 'bg-emerald-50', borderColor: 'border-emerald-300' },
  { key: 'flagged', label: 'Flagged', color: 'bg-orange-50', borderColor: 'border-orange-300' },
  { key: 'ignored', label: 'Ignored', color: 'bg-neutral-50', borderColor: 'border-neutral-300' },
  { key: 'error', label: 'Error', color: 'bg-red-50', borderColor: 'border-red-300' },
]

export default function PipelineBoard({
  contracts,
  onFlag,
  onIgnore,
  onProcess,
  onRefresh,
}: PipelineBoardProps) {
  const [filter, setFilter] = useState<'all' | 'flagged' | 'ignored'>('all')
  const [minScore, setMinScore] = useState(0)

  // Filter contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      if (filter === 'flagged' && !contract.flagged) return false
      if (filter === 'ignored' && !contract.ignored) return false
      if (contract.relevance_score < minScore) return false
      return true
    })
  }, [contracts, filter, minScore])

  // Group contracts by stage
  const contractsByStage = useMemo(() => {
    const grouped: Record<string, Contract[]> = {}
    
    STAGES.forEach(stage => {
      grouped[stage.key] = []
    })

    filteredContracts.forEach(contract => {
      const status = contract.pipeline_status || 'discovered'
      if (grouped[status]) {
        grouped[status].push(contract)
      } else {
        grouped['discovered'].push(contract)
      }
    })

    // Sort contracts within each stage by relevance score
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => b.relevance_score - a.relevance_score)
    })

    return grouped
  }, [filteredContracts])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'flagged' | 'ignored')}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            >
              <option value="all">All</option>
              <option value="flagged">Flagged</option>
              <option value="ignored">Ignored</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-neutral-700">Min Score:</label>
            <input
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-3 py-1.5 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 w-20"
            />
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-auto px-4 py-1.5 text-sm bg-accent-700 text-white rounded-lg hover:bg-accent-800 transition-colors"
            >
              Refresh
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max pb-4">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              className={`flex-shrink-0 w-80 ${stage.borderColor} border-2 rounded-lg`}
            >
              <StageColumn
                stage={stage.key}
                label={stage.label}
                contracts={contractsByStage[stage.key] || []}
                onFlag={onFlag}
                onIgnore={onIgnore}
                onProcess={onProcess}
                color={stage.color}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

