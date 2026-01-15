'use client'

import { useState } from 'react'
import ScoreBadge from './ScoreBadge'

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
  postedDate: string
  aiAnalysis: any
  sourceQueries: string[]
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
  const [showAIAnalysis, setShowAIAnalysis] = useState(false)

  const handleIgnore = () => {
    if (opportunity.noticeId && confirm('Are you sure you want to ignore this opportunity?')) {
      onIgnore(opportunity.noticeId)
    }
  }

  const handleFlag = () => {
    if (opportunity.noticeId) {
      onFlag(opportunity.noticeId, !opportunity.flagged)
    }
  }

  return (
    <>
      <tr className="hover:bg-neutral-50">
        <td className="px-6 py-4">
          <a
            href={opportunity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-body-sm font-medium text-accent-700 hover:text-accent-800"
          >
            {opportunity.title}
          </a>
        </td>
        <td className="px-6 py-4 text-body-sm text-neutral-700">
          {opportunity.agency || 'Unknown'}
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-wrap gap-1">
            {opportunity.naicsCodes.slice(0, 2).map((naics) => (
              <span
                key={naics}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {naics}
              </span>
            ))}
            {opportunity.naicsCodes.length > 2 && (
              <span className="text-xs text-neutral-500">+{opportunity.naicsCodes.length - 2}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4">
          {opportunity.setAside.length > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
              {opportunity.setAside[0]}
            </span>
          ) : (
            <span className="text-body-sm text-neutral-400">None</span>
          )}
        </td>
        <td className="px-6 py-4 text-body-sm text-neutral-700">
          {opportunity.daysRemaining !== null ? (
            <span className={opportunity.daysRemaining < 7 ? 'text-red-600 font-medium' : ''}>
              {opportunity.daysRemaining} days
            </span>
          ) : (
            <span className="text-neutral-400">N/A</span>
          )}
        </td>
        <td className="px-6 py-4">
          <ScoreBadge score={opportunity.score} />
        </td>
        <td className="px-6 py-4">
          <div className="flex gap-2">
            <button
              onClick={handleFlag}
              className={`text-body-xs px-2 py-1 rounded ${
                opportunity.flagged
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
              title={opportunity.flagged ? 'Unflag' : 'Flag'}
            >
              {opportunity.flagged ? '★' : '☆'}
            </button>
            <button
              onClick={handleIgnore}
              className="text-body-xs px-2 py-1 rounded bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              title="Ignore"
            >
              ×
            </button>
            {opportunity.aiAnalysis && (
              <button
                onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                className="text-body-xs px-2 py-1 rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                title="View AI Analysis"
              >
                AI
              </button>
            )}
          </div>
        </td>
      </tr>
      {showAIAnalysis && opportunity.aiAnalysis && (
        <tr>
          <td colSpan={7} className="px-6 py-4 bg-blue-50">
            <div className="space-y-2">
              <h4 className="text-body-sm font-semibold text-neutral-900">AI Analysis</h4>
              <p className="text-body-sm text-neutral-700">
                <strong>Summary:</strong> {opportunity.aiAnalysis.relevanceSummary}
              </p>
              <p className="text-body-sm text-neutral-700">
                <strong>Recommended Action:</strong>{' '}
                <span className="font-medium">{opportunity.aiAnalysis.recommendedAction}</span>
              </p>
              {opportunity.aiAnalysis.capabilityMatch && opportunity.aiAnalysis.capabilityMatch.length > 0 && (
                <div>
                  <strong className="text-body-sm text-neutral-700">Capability Match:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {opportunity.aiAnalysis.capabilityMatch.map((cap: string, idx: number) => (
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
              {opportunity.aiAnalysis.risks && opportunity.aiAnalysis.risks.length > 0 && (
                <div>
                  <strong className="text-body-sm text-neutral-700">Risks:</strong>
                  <ul className="list-disc list-inside text-body-sm text-neutral-700 mt-1">
                    {opportunity.aiAnalysis.risks.map((risk: string, idx: number) => (
                      <li key={idx}>{risk}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

