'use client'

import { useState } from 'react'

interface CaptureActionsProps {
  opportunityId: string
  opportunity: any
  onUpdate: () => void
}

export default function CaptureActions({
  opportunityId,
  opportunity,
  onUpdate,
}: CaptureActionsProps) {
  const [exporting, setExporting] = useState(false)
  const [generatingBriefing, setGeneratingBriefing] = useState(false)

  const handleExport = async (format: 'csv' | 'pdf') => {
    setExporting(true)
    try {
      // TODO: Implement export functionality
      alert(`Export to ${format.toUpperCase()} coming soon`)
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleGenerateBriefing = async () => {
    setGeneratingBriefing(true)
    try {
      const response = await fetch(
        `/api/admin/capture/opportunities/${opportunityId}/briefing`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (data.success && data.url) {
        window.open(data.url, '_blank')
      }
    } catch (error) {
      console.error('Error generating briefing:', error)
    } finally {
      setGeneratingBriefing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h2 className="text-lg font-semibold text-neutral-900 mb-4">Capture Actions</h2>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleExport('csv')}
          disabled={exporting}
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting}
          className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 disabled:opacity-50"
        >
          Export PDF
        </button>
        <button
          onClick={handleGenerateBriefing}
          disabled={generatingBriefing}
          className="px-4 py-2 text-sm font-medium text-white bg-accent-700 rounded-lg hover:bg-accent-800 disabled:opacity-50"
        >
          {generatingBriefing ? 'Generating...' : 'Generate Briefing'}
        </button>
      </div>
    </div>
  )
}

