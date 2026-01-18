'use client'

import ContractCard from './ContractCard'

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

interface StageColumnProps {
  stage: string
  label: string
  contracts: Contract[]
  onFlag?: (id: string, flagged: boolean) => void
  onIgnore?: (id: string) => void
  onProcess?: (id: string) => void
  color?: string
}

export default function StageColumn({
  stage,
  label,
  contracts,
  onFlag,
  onIgnore,
  onProcess,
  color = 'bg-blue-50',
}: StageColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`${color} rounded-t-lg border-b-2 border-neutral-300 p-3 sticky top-0 z-10`}>
        <h3 className="text-sm font-semibold text-neutral-900 mb-1">{label}</h3>
        <div className="text-xs text-neutral-600">
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Contracts List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-neutral-50 rounded-b-lg min-h-[400px]">
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-500">
            No contracts in this stage
          </div>
        ) : (
          contracts.map((contract) => (
            <ContractCard
              key={contract.id}
              contract={contract}
              onFlag={onFlag}
              onIgnore={onIgnore}
              onProcess={onProcess}
            />
          ))
        )}
      </div>
    </div>
  )
}

