'use client'

import { useState } from 'react'
import Link from 'next/link'

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

interface ContractCardProps {
  contract: Contract
  onFlag?: (id: string, flagged: boolean) => void
  onIgnore?: (id: string) => void
  onProcess?: (id: string) => void
}

export default function ContractCard({ contract, onFlag, onIgnore, onProcess }: ContractCardProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const statusColors: Record<string, string> = {
    discovered: 'bg-blue-100 text-blue-800',
    scraping: 'bg-yellow-100 text-yellow-800',
    scraped: 'bg-green-100 text-green-800',
    enriching: 'bg-purple-100 text-purple-800',
    enriched: 'bg-indigo-100 text-indigo-800',
    analyzing: 'bg-pink-100 text-pink-800',
    analyzed: 'bg-teal-100 text-teal-800',
    ready: 'bg-emerald-100 text-emerald-800',
    flagged: 'bg-orange-100 text-orange-800',
    ignored: 'bg-neutral-100 text-neutral-800',
    error: 'bg-red-100 text-red-800',
  }

  const handleProcess = async () => {
    if (!onProcess) return
    
    setIsProcessing(true)
    try {
      await onProcess(contract.id)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`bg-white rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all ${
      contract.flagged ? 'border-orange-300 bg-orange-50' :
      contract.ignored ? 'border-neutral-300 bg-neutral-50 opacity-60' :
      'border-neutral-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-neutral-900 line-clamp-2 mb-1">
            {contract.title}
          </h4>
          {contract.agency && (
            <p className="text-xs text-neutral-600">{contract.agency}</p>
          )}
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          statusColors[contract.pipeline_status] || 'bg-neutral-100 text-neutral-800'
        }`}>
          {contract.pipeline_status}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600">Score:</span>
            <div className="flex-1 bg-neutral-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  contract.relevance_score >= 70 ? 'bg-green-500' :
                  contract.relevance_score >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${contract.relevance_score}%` }}
              />
            </div>
            <span className="text-xs font-medium text-neutral-900 w-8">
              {contract.relevance_score}
            </span>
          </div>
        </div>
      </div>

      {/* Pipeline Stage Indicators */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {contract.scraped && (
          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded">
            ✓ Scraped
          </span>
        )}
        {contract.usaspending_enrichment_status === 'completed' && (
          <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded">
            ✓ Enriched
          </span>
        )}
        {contract.aiAnalysis && (
          <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-800 rounded">
            ✓ Analyzed
          </span>
        )}
        {contract.pipeline_status === 'ready' && (
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
            Ready
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
        <Link
          href={`/admin/opportunities/${contract.id}`}
          className="text-xs px-2 py-1 bg-accent-50 text-accent-700 rounded hover:bg-accent-100 transition-colors"
        >
          View
        </Link>
        {onProcess && contract.pipeline_status !== 'ready' && (
          <button
            onClick={handleProcess}
            disabled={isProcessing}
            className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {isProcessing ? 'Processing...' : 'Process'}
          </button>
        )}
        {onFlag && (
          <button
            onClick={() => onFlag(contract.id, !contract.flagged)}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              contract.flagged
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            {contract.flagged ? 'Unflag' : 'Flag'}
          </button>
        )}
        {onIgnore && !contract.ignored && (
          <button
            onClick={() => onIgnore(contract.id)}
            className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
          >
            Ignore
          </button>
        )}
      </div>
    </div>
  )
}

