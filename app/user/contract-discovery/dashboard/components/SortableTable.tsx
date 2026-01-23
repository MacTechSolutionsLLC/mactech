'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import ScoreBadge from '@/app/admin/sam-dashboard/components/ScoreBadge'

interface Contract {
  id: string
  title: string
  url: string
  notice_id?: string
  solicitation_number?: string
  agency?: string
  naics_codes: string[]
  set_aside: string[]
  detected_keywords: string[]
  relevance_score: number
  detected_service_category?: string
  ingestion_status: string
  ingestion_source?: string | null
  verified: boolean
  verified_at?: string | null
  scraped: boolean
  scraped_at?: string | null
  sow_attachment_url?: string
  sow_attachment_type?: string
  sow_scraped: boolean
  sow_scraped_at?: string | null
  analysis_summary?: string
  analysis_confidence?: number
  dismissed: boolean
  dismissed_at?: string | null
  created_at: string
  deadline?: string | null
  daysRemaining?: number | null
  description?: string
  estimated_value?: string
  period_of_performance?: string
  place_of_performance?: string
  points_of_contact?: Array<{
    name?: string
    email?: string
    phone?: string
    role?: string
  }>
  aiAnalysis?: any
  aiSummary?: string
  aiKeyRequirements?: string[]
  flagged?: boolean
  flagged_at?: string | null
  source_queries?: string[]
}

type SortColumn = 'score' | 'deadline' | 'date' | 'agency' | 'naics' | 'setAside' | null
type SortDirection = 'asc' | 'desc'

interface SortableTableProps {
  contracts: Contract[]
  onScrape: (id: string) => void
  onScrapeSOW: (id: string) => void
  onAdd: (id: string) => void
  onDismiss: (id: string) => void
  onDelete: (id: string) => void
  onFlag: (noticeId: string | null | undefined, flagged: boolean) => void
  onIgnore: (noticeId: string | null | undefined) => void
  expandedAI: Set<string>
  onToggleAI: (id: string) => void
}

export default function SortableTable({
  contracts,
  onScrape,
  onScrapeSOW,
  onAdd,
  onDismiss,
  onDelete,
  onFlag,
  onIgnore,
  expandedAI,
  onToggleAI,
}: SortableTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const sortedContracts = useMemo(() => {
    if (!sortColumn) return contracts

    return [...contracts].sort((a, b) => {
      let comparison = 0

      switch (sortColumn) {
        case 'score':
          comparison = a.relevance_score - b.relevance_score
          break
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          break
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'agency':
          const agencyA = a.agency || ''
          const agencyB = b.agency || ''
          comparison = agencyA.localeCompare(agencyB)
          break
        case 'naics':
          const naicsA = a.naics_codes[0] || ''
          const naicsB = b.naics_codes[0] || ''
          comparison = naicsA.localeCompare(naicsB)
          break
        case 'setAside':
          const setAsideA = a.set_aside[0] || ''
          const setAsideB = b.set_aside[0] || ''
          comparison = setAsideA.localeCompare(setAsideB)
          break
        default:
          return 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [contracts, sortColumn, sortDirection])

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) {
      return (
        <span className="inline-block ml-2 text-neutral-300 group-hover:text-neutral-400 transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      )
    }
    return (
      <span className="inline-block ml-2 text-accent-600">
        {sortDirection === 'asc' ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-neutral-200/50 border border-neutral-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100">
              <th 
                className="px-8 py-5 text-left"
                onClick={() => handleSort(null)}
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Contract</span>
                </div>
              </th>
              <th 
                className="px-8 py-5 text-left cursor-pointer group"
                onClick={() => handleSort('agency')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Agency</span>
                  <SortIcon column="agency" />
                </div>
              </th>
              <th 
                className="px-8 py-5 text-left cursor-pointer group"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Dates</span>
                  <SortIcon column="deadline" />
                </div>
              </th>
              <th 
                className="px-8 py-5 text-left cursor-pointer group"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Score</span>
                  <SortIcon column="score" />
                </div>
              </th>
              <th className="px-8 py-5 text-left">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Status</span>
              </th>
              <th className="px-8 py-5 text-left">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">SOW</span>
              </th>
              <th className="px-8 py-5 text-left">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {sortedContracts.map((contract, index) => {
              const isAIExpanded = expandedAI.has(contract.id)
              const primaryPOC = contract.points_of_contact && contract.points_of_contact.length > 0 
                ? contract.points_of_contact[0] 
                : null
              
              return (
                <>
                  <tr 
                    key={contract.id} 
                    className={`
                      transition-all duration-200 ease-out
                      hover:bg-gradient-to-r hover:from-neutral-50/50 hover:to-white
                      ${contract.dismissed ? 'opacity-60' : ''}
                      ${contract.verified ? 'bg-emerald-50/30' : ''}
                      ${contract.flagged ? 'bg-amber-50/30' : ''}
                    `}
                    onClick={() => window.location.href = `/user/contract-discovery/${contract.id}`}
                  >
                    <td className="px-8 py-6">
                      <div className="max-w-md">
                        <Link
                          href={`/user/contract-discovery/${contract.id}`}
                          className="text-sm font-semibold text-neutral-900 hover:text-accent-700 mb-3 block leading-snug transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contract.title}
                        </Link>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {contract.set_aside.slice(0, 2).map((sa, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-medium rounded-full"
                            >
                              {sa}
                            </span>
                          ))}
                          {contract.detected_keywords.slice(0, 3).map((kw, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-1 bg-accent-50 text-accent-700 text-xs font-medium rounded-full"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-neutral-500 space-y-1">
                          {contract.notice_id && (
                            <p className="font-mono">Notice: {contract.notice_id}</p>
                          )}
                          {contract.solicitation_number && (
                            <p className="font-mono">Solicitation: {contract.solicitation_number}</p>
                          )}
                          {contract.naics_codes.length > 0 && (
                            <p>NAICS: {contract.naics_codes.slice(0, 2).join(', ')}{contract.naics_codes.length > 2 ? '...' : ''}</p>
                          )}
                          {contract.ingestion_source && (
                            <p className="text-accent-600 font-medium">
                              {contract.ingestion_source === 'sam-ingestion' ? '📥 SAM Ingestion' : '🔍 Discovery'}
                            </p>
                          )}
                        </div>
                        <a
                          href={contract.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-accent-600 hover:text-accent-700 mt-2 inline-block font-medium transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on SAM.gov →
                        </a>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        {contract.agency && (
                          <p className="text-sm font-medium text-neutral-900">{contract.agency}</p>
                        )}
                        {primaryPOC && (
                          <div className="text-xs text-neutral-600">
                            {primaryPOC.name && <p className="font-medium">POC: {primaryPOC.name}</p>}
                            {primaryPOC.email && (
                              <a 
                                href={`mailto:${primaryPOC.email}`}
                                className="text-accent-600 hover:text-accent-700 break-all transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {primaryPOC.email}
                              </a>
                            )}
                            {primaryPOC.phone && <p>📞 {primaryPOC.phone}</p>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5 text-xs">
                        {contract.deadline && (
                          <p className={contract.daysRemaining != null && contract.daysRemaining < 7 ? 'text-red-600 font-semibold' : 'text-neutral-700 font-medium'}>
                            Deadline: {contract.deadline}
                            {contract.daysRemaining != null && (
                              <span className="ml-1.5">({contract.daysRemaining} days)</span>
                            )}
                          </p>
                        )}
                        {contract.period_of_performance && (
                          <p className="text-neutral-600">POP: {contract.period_of_performance}</p>
                        )}
                        {contract.created_at && (
                          <p className="text-neutral-500">Posted: {new Date(contract.created_at).toLocaleDateString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <ScoreBadge score={contract.relevance_score} />
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                          contract.verified 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : contract.dismissed
                            ? 'bg-red-100 text-red-800'
                            : contract.scraped
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {contract.verified ? '✓ Verified' : 
                           contract.dismissed ? '✗ Dismissed' : 
                           contract.scraped ? 'Scraped' : 'Discovered'}
                        </span>
                        {contract.aiSummary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleAI(contract.id)
                            }}
                            className="block text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            {isAIExpanded ? 'Hide' : 'Show'} AI Analysis
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {contract.sow_attachment_url ? (
                        <div className="space-y-2">
                          <a
                            href={contract.sow_attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-700 font-medium transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>📄</span>
                            <span>Download SOW</span>
                            {contract.sow_attachment_type && (
                              <span className="text-xs text-neutral-500">
                                ({contract.sow_attachment_type})
                              </span>
                            )}
                          </a>
                          {!contract.sow_scraped && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onScrapeSOW(contract.id)
                              }}
                              className="block text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors"
                            >
                              Scrape SOW Content
                            </button>
                          )}
                          {contract.sow_scraped && (
                            <span className="text-xs text-emerald-600 font-semibold">✓ Content Scraped</span>
                          )}
                        </div>
                      ) : contract.scraped ? (
                        <span className="text-xs text-neutral-500">No SOW found</span>
                      ) : (
                        <span className="text-xs text-neutral-400">Not scraped yet</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!contract.scraped && (
                          <button
                            onClick={() => onScrape(contract.id)}
                            className="px-3 py-1.5 bg-accent-700 text-white text-xs font-medium rounded-lg hover:bg-accent-800 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            Scrape
                          </button>
                        )}
                        {contract.notice_id && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => onFlag(contract.notice_id, !contract.flagged)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                                contract.flagged
                                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                              title={contract.flagged ? 'Unflag' : 'Flag'}
                            >
                              {contract.flagged ? '★' : '☆'}
                            </button>
                            <button
                              onClick={() => onIgnore(contract.notice_id)}
                              className="px-2.5 py-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 text-xs font-medium transition-all duration-200"
                              title="Ignore"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        {!contract.verified && !contract.dismissed && (
                          <button
                            onClick={() => onAdd(contract.id)}
                            className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            Add
                          </button>
                        )}
                        {!contract.dismissed && (
                          <button
                            onClick={() => onDismiss(contract.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm hover:shadow"
                          >
                            Dismiss
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(contract.id)}
                          className="px-3 py-1.5 bg-neutral-600 text-white text-xs font-medium rounded-lg hover:bg-neutral-700 transition-all duration-200 shadow-sm hover:shadow"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isAIExpanded && contract.aiAnalysis && (
                    <tr>
                      <td colSpan={7} className="px-8 py-6 bg-blue-50/50">
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-neutral-900">AI Analysis</h4>
                          {contract.aiAnalysis.relevanceSummary && (
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              <strong className="font-semibold">Summary:</strong> {contract.aiAnalysis.relevanceSummary}
                            </p>
                          )}
                          {contract.aiAnalysis.recommendedAction && (
                            <p className="text-sm text-neutral-700 leading-relaxed">
                              <strong className="font-semibold">Recommended Action:</strong>{' '}
                              <span className="font-medium">{contract.aiAnalysis.recommendedAction}</span>
                            </p>
                          )}
                          {contract.aiAnalysis.capabilityMatch && contract.aiAnalysis.capabilityMatch.length > 0 && (
                            <div>
                              <strong className="text-sm text-neutral-700 font-semibold">Capability Match:</strong>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {contract.aiAnalysis.capabilityMatch.map((cap: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800 font-medium"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {contract.aiAnalysis.risks && contract.aiAnalysis.risks.length > 0 && (
                            <div>
                              <strong className="text-sm text-neutral-700 font-semibold">Risks:</strong>
                              <ul className="list-disc list-inside text-sm text-neutral-700 mt-2 space-y-1">
                                {contract.aiAnalysis.risks.map((risk: string, idx: number) => (
                                  <li key={idx}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {contract.aiSummary && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <strong className="text-sm text-neutral-700 font-semibold">Full Summary:</strong>
                              <p className="text-sm text-neutral-700 mt-2 leading-relaxed">{contract.aiSummary}</p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
