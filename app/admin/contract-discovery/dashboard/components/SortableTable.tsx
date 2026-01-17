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
        <span className="inline-block ml-1 text-neutral-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </span>
      )
    }
    return (
      <span className="inline-block ml-1 text-accent-700">
        {sortDirection === 'asc' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </span>
    )
  }

  return (
    <div className="card overflow-hidden p-0 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b-2 border-neutral-200">
            <tr>
              <th 
                className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[30%] cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort(null)}
              >
                Contract
              </th>
              <th 
                className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[15%] cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('agency')}
              >
                <div className="flex items-center">
                  Agency/Office
                  <SortIcon column="agency" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[12%] cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('deadline')}
              >
                <div className="flex items-center">
                  Dates
                  <SortIcon column="deadline" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[8%] cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => handleSort('score')}
              >
                <div className="flex items-center">
                  Score
                  <SortIcon column="score" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[10%]">
                Status
              </th>
              <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[10%]">
                SOW
              </th>
              <th className="px-6 py-4 text-left text-body-sm font-semibold text-neutral-900 w-[15%]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white">
            {sortedContracts.map((contract) => {
              const isAIExpanded = expandedAI.has(contract.id)
              const primaryPOC = contract.points_of_contact && contract.points_of_contact.length > 0 
                ? contract.points_of_contact[0] 
                : null
              
              return (
                <>
                  <tr 
                    key={contract.id} 
                    className={`hover:bg-neutral-50 transition-colors ${
                      contract.dismissed ? 'opacity-60' : ''
                    } ${contract.verified ? 'bg-green-50/50' : ''} ${contract.flagged ? 'bg-yellow-50/50' : ''}`}
                    onClick={() => window.location.href = `/admin/contract-discovery/${contract.id}`}
                  >
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <Link
                          href={`/admin/contract-discovery/${contract.id}`}
                          className="text-body-sm font-semibold text-accent-700 hover:text-accent-900 mb-2 block line-clamp-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {contract.title}
                        </Link>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {contract.set_aside.slice(0, 2).map((sa, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-body-xs rounded font-medium"
                            >
                              {sa}
                            </span>
                          ))}
                          {contract.detected_keywords.slice(0, 3).map((kw, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 bg-accent-50 text-accent-700 text-body-xs rounded"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                        <div className="text-body-xs text-neutral-500 space-y-0.5">
                          {contract.notice_id && <p>Notice: {contract.notice_id}</p>}
                          {contract.solicitation_number && <p>Solicitation: {contract.solicitation_number}</p>}
                          {contract.naics_codes.length > 0 && (
                            <p>NAICS: {contract.naics_codes.slice(0, 2).join(', ')}{contract.naics_codes.length > 2 ? '...' : ''}</p>
                          )}
                          {contract.ingestion_source && (
                            <p className="text-accent-700 font-medium">
                              {contract.ingestion_source === 'sam-ingestion' ? '📥 SAM Ingestion' : '🔍 Discovery'}
                            </p>
                          )}
                        </div>
                        <a
                          href={contract.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-body-xs text-accent-700 hover:text-accent-800 mt-2 inline-block break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View on SAM.gov →
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {contract.agency && (
                          <p className="text-body-sm font-medium text-neutral-900">{contract.agency}</p>
                        )}
                        {primaryPOC && (
                          <div className="text-body-xs text-neutral-600">
                            {primaryPOC.name && <p className="font-medium">POC: {primaryPOC.name}</p>}
                            {primaryPOC.email && (
                              <a 
                                href={`mailto:${primaryPOC.email}`}
                                className="text-accent-700 hover:text-accent-800 break-all"
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
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-body-xs">
                        {contract.deadline && (
                          <p className={contract.daysRemaining != null && contract.daysRemaining < 7 ? 'text-red-600 font-semibold' : 'text-neutral-700'}>
                            Deadline: {contract.deadline}
                            {contract.daysRemaining != null && (
                              <span className="ml-1">({contract.daysRemaining} days)</span>
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
                    <td className="px-6 py-4">
                      <ScoreBadge score={contract.relevance_score} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className={`inline-block px-2.5 py-1 text-body-xs rounded font-medium ${
                          contract.verified 
                            ? 'bg-green-100 text-green-800' 
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
                            className="block text-body-xs text-blue-700 hover:text-blue-800 underline"
                          >
                            {isAIExpanded ? 'Hide' : 'Show'} AI Analysis
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {contract.sow_attachment_url ? (
                        <div className="space-y-2">
                          <a
                            href={contract.sow_attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-body-sm text-accent-700 hover:text-accent-800 underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>📄</span>
                            <span>Download SOW</span>
                            {contract.sow_attachment_type && (
                              <span className="text-body-xs text-neutral-500">
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
                              className="block text-body-xs text-accent-700 hover:text-accent-800 underline"
                            >
                              Scrape SOW Content
                            </button>
                          )}
                          {contract.sow_scraped && (
                            <span className="text-body-xs text-green-600 font-medium">✓ Content Scraped</span>
                          )}
                        </div>
                      ) : contract.scraped ? (
                        <span className="text-body-xs text-neutral-500">No SOW found</span>
                      ) : (
                        <span className="text-body-xs text-neutral-400">Not scraped yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {!contract.scraped && (
                          <button
                            onClick={() => onScrape(contract.id)}
                            className="btn-primary text-body-xs px-3 py-1.5"
                          >
                            Scrape
                          </button>
                        )}
                        {contract.notice_id && (
                          <>
                            <button
                              onClick={() => onFlag(contract.notice_id, !contract.flagged)}
                              className={`text-body-xs px-2 py-1 rounded transition-colors ${
                                contract.flagged
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                              }`}
                              title={contract.flagged ? 'Unflag' : 'Flag'}
                            >
                              {contract.flagged ? '★' : '☆'}
                            </button>
                            <button
                              onClick={() => onIgnore(contract.notice_id)}
                              className="text-body-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                              title="Ignore"
                            >
                              ×
                            </button>
                          </>
                        )}
                        {!contract.verified && !contract.dismissed && (
                          <button
                            onClick={() => onAdd(contract.id)}
                            className="text-body-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Add
                          </button>
                        )}
                        {!contract.dismissed && (
                          <button
                            onClick={() => onDismiss(contract.id)}
                            className="text-body-xs px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Dismiss
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(contract.id)}
                          className="text-body-xs px-3 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isAIExpanded && contract.aiAnalysis && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 bg-blue-50">
                        <div className="space-y-3">
                          <h4 className="text-body-sm font-semibold text-neutral-900">AI Analysis</h4>
                          {contract.aiAnalysis.relevanceSummary && (
                            <p className="text-body-sm text-neutral-700">
                              <strong>Summary:</strong> {contract.aiAnalysis.relevanceSummary}
                            </p>
                          )}
                          {contract.aiAnalysis.recommendedAction && (
                            <p className="text-body-sm text-neutral-700">
                              <strong>Recommended Action:</strong>{' '}
                              <span className="font-medium">{contract.aiAnalysis.recommendedAction}</span>
                            </p>
                          )}
                          {contract.aiAnalysis.capabilityMatch && contract.aiAnalysis.capabilityMatch.length > 0 && (
                            <div>
                              <strong className="text-body-sm text-neutral-700">Capability Match:</strong>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {contract.aiAnalysis.capabilityMatch.map((cap: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800"
                                  >
                                    {cap}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {contract.aiAnalysis.risks && contract.aiAnalysis.risks.length > 0 && (
                            <div>
                              <strong className="text-body-sm text-neutral-700">Risks:</strong>
                              <ul className="list-disc list-inside text-body-sm text-neutral-700 mt-1">
                                {contract.aiAnalysis.risks.map((risk: string, idx: number) => (
                                  <li key={idx}>{risk}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {contract.aiSummary && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <strong className="text-body-sm text-neutral-700">Full Summary:</strong>
                              <p className="text-body-sm text-neutral-700 mt-1">{contract.aiSummary}</p>
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

