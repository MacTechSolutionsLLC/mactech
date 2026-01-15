'use client'

import OpportunityRow from './OpportunityRow'

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

interface OpportunityTableProps {
  opportunities: Opportunity[]
  loading: boolean
  onIgnore: (noticeId: string) => void
  onFlag: (noticeId: string, flagged: boolean) => void
}

export default function OpportunityTable({
  opportunities,
  loading,
  onIgnore,
  onFlag,
}: OpportunityTableProps) {
  if (loading) {
    return (
      <div className="card p-12 text-center">
        <div className="text-body-lg text-neutral-600">Loading opportunities...</div>
      </div>
    )
  }

  if (opportunities.length === 0) {
    return (
      <div className="card p-12 text-center">
        <div className="text-body-lg text-neutral-600 mb-2">No opportunities found</div>
        <div className="text-body-sm text-neutral-500">
          Run the ingestion pipeline to fetch opportunities from SAM.gov
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Title</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Agency</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">NAICS</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Set-Aside</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Days Remaining</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Score</th>
              <th className="px-6 py-3 text-left text-body-sm font-semibold text-neutral-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {opportunities.map((opportunity) => (
              <OpportunityRow
                key={opportunity.id}
                opportunity={opportunity}
                onIgnore={onIgnore}
                onFlag={onFlag}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

