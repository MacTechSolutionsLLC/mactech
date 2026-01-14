'use client'

import { useState } from 'react'

interface Opportunity {
  id: string
  title: string
  agency: string | null
  naicsCodes: string[]
  setAside: string[]
  daysRemaining: number | null
  score: number
  url: string
  noticeId: string | null
  solicitationNumber: string | null
  deadline: string | null
  flagged: boolean
  flaggedAt: string | null
  createdAt: string
}

interface OpportunityRowProps {
  opportunity: Opportunity
  onIgnore: (noticeId: string) => void
  onFlag: (noticeId: string, flagged: boolean) => void
}

export default function OpportunityRow({
  opportunity,
  onIgnore,
  onFlag,
}: OpportunityRowProps) {
  const [isIgnoring, setIsIgnoring] = useState(false)
  const [isFlagging, setIsFlagging] = useState(false)

  const handleIgnore = async () => {
    if (!opportunity.noticeId) {
      alert('Cannot ignore: noticeId is missing')
      return
    }

    if (confirm('Are you sure you want to ignore this opportunity? It will not appear in future results.')) {
      setIsIgnoring(true)
      try {
        await onIgnore(opportunity.noticeId)
      } finally {
        setIsIgnoring(false)
      }
    }
  }

  const handleFlag = async () => {
    if (!opportunity.noticeId) {
      alert('Cannot flag: noticeId is missing')
      return
    }

    setIsFlagging(true)
    try {
      await onFlag(opportunity.noticeId, !opportunity.flagged)
    } finally {
      setIsFlagging(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-700 bg-green-50'
    if (score >= 65) return 'text-blue-700 bg-blue-50'
    if (score >= 50) return 'text-yellow-700 bg-yellow-50'
    return 'text-neutral-700 bg-neutral-50'
  }

  const getDaysRemainingColor = (days: number | null) => {
    if (days === null) return 'text-neutral-600'
    if (days < 0) return 'text-red-600'
    if (days < 7) return 'text-red-600 font-semibold'
    if (days < 14) return 'text-yellow-600'
    return 'text-neutral-600'
  }

  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm font-medium text-accent-700 hover:text-accent-800 hover:underline"
          >
            {opportunity.title}
          </a>
          {opportunity.solicitationNumber && (
            <div className="text-body-xs text-neutral-500 mt-1">
              {opportunity.solicitationNumber}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-body-sm text-neutral-700">
        {opportunity.agency || '—'}
      </td>
      <td className="px-6 py-4 text-body-sm text-neutral-700">
        {opportunity.naicsCodes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {opportunity.naicsCodes.map((code) => (
              <span key={code} className="px-2 py-1 bg-neutral-100 rounded text-body-xs">
                {code}
              </span>
            ))}
          </div>
        ) : (
          '—'
        )}
      </td>
      <td className="px-6 py-4 text-body-sm text-neutral-700">
        {opportunity.setAside.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {opportunity.setAside.map((sa) => (
              <span key={sa} className="px-2 py-1 bg-accent-50 text-accent-700 rounded text-body-xs">
                {sa}
              </span>
            ))}
          </div>
        ) : (
          '—'
        )}
      </td>
      <td className="px-6 py-4 text-body-sm">
        <span className={getDaysRemainingColor(opportunity.daysRemaining)}>
          {opportunity.daysRemaining !== null
            ? opportunity.daysRemaining < 0
              ? `${Math.abs(opportunity.daysRemaining)} days overdue`
              : `${opportunity.daysRemaining} days`
            : '—'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 rounded text-body-sm font-medium ${getScoreColor(opportunity.score)}`}>
          {opportunity.score}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={handleFlag}
            disabled={isFlagging || !opportunity.noticeId}
            className={`text-body-xs px-3 py-1 rounded transition-colors ${
              opportunity.flagged
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={opportunity.flagged ? 'Unflag' : 'Flag'}
          >
            {isFlagging ? '...' : opportunity.flagged ? '★ Flagged' : '☆ Flag'}
          </button>
          <button
            onClick={handleIgnore}
            disabled={isIgnoring || !opportunity.noticeId}
            className="text-body-xs px-3 py-1 bg-neutral-100 text-neutral-700 rounded hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ignore this opportunity"
          >
            {isIgnoring ? '...' : 'Ignore'}
          </button>
        </div>
      </td>
    </tr>
  )
}

