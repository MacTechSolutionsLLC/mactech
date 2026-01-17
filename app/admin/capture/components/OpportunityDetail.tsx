'use client'

import { useState, useEffect } from 'react'
import CaptureActions from './CaptureActions'

interface OpportunityDetailProps {
  opportunityId: string
  onBack: () => void
  onUpdate: () => void
}

interface Opportunity {
  id: string
  notice_id?: string
  title: string
  agency?: string
  description?: string
  relevance_score: number
  deadline?: string
  aiSummary?: string
  aiAnalysis?: any
  flagged: boolean
  ignored: boolean
  naics_codes: string
  set_aside: string
  usaspending_enrichment?: any
  competitive_landscape_summary?: string
}

export default function OpportunityDetail({
  opportunityId,
  onBack,
  onUpdate,
}: OpportunityDetailProps) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false)

  useEffect(() => {
    loadOpportunity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId])

  const loadOpportunity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/capture/opportunities/${opportunityId}`)
      const data = await response.json()
      if (data.success) {
        setOpportunity(data.opportunity)
      }
    } catch (error) {
      console.error('Error loading opportunity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAnalysis = async () => {
    setGeneratingAnalysis(true)
    try {
      const response = await fetch(
        `/api/admin/capture/opportunities/${opportunityId}/analyze`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (data.success) {
        await loadOpportunity()
        onUpdate()
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
    } finally {
      setGeneratingAnalysis(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center text-neutral-600">Loading opportunity details...</div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center text-red-600">Opportunity not found</div>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg"
        >
          Back
        </button>
      </div>
    )
  }

  const aiAnalysis = opportunity.aiAnalysis
    ? typeof opportunity.aiAnalysis === 'string'
      ? JSON.parse(opportunity.aiAnalysis)
      : opportunity.aiAnalysis
    : null

  const enrichment = opportunity.usaspending_enrichment
    ? typeof opportunity.usaspending_enrichment === 'string'
      ? JSON.parse(opportunity.usaspending_enrichment)
      : opportunity.usaspending_enrichment
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
          >
            ← Back to List
          </button>
          {!aiAnalysis && (
            <button
              onClick={handleGenerateAnalysis}
              disabled={generatingAnalysis}
              className="px-4 py-2 text-sm font-medium text-white bg-accent-700 rounded-lg hover:bg-accent-800 disabled:opacity-50"
            >
              {generatingAnalysis ? 'Generating...' : 'Generate AI Analysis'}
            </button>
          )}
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{opportunity.title}</h1>
        <div className="flex items-center gap-4 text-sm text-neutral-600">
          {opportunity.agency && <span>Agency: {opportunity.agency}</span>}
          <span>Score: {opportunity.relevance_score}</span>
          {opportunity.deadline && (
            <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {aiAnalysis && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">AI Summary</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Executive Summary</h3>
              <p className="text-sm text-neutral-600">{aiAnalysis.relevanceSummary || opportunity.aiSummary}</p>
            </div>
            {aiAnalysis.whyThisMatters && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Why This Matters</h3>
                <p className="text-sm text-neutral-600">{aiAnalysis.whyThisMatters}</p>
              </div>
            )}
            {aiAnalysis.relevanceScore !== undefined && (
              <div>
                <h3 className="text-sm font-medium text-neutral-700 mb-2">Relevance Score</h3>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-accent-700 h-2 rounded-full"
                      style={{ width: `${aiAnalysis.relevanceScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900">
                    {aiAnalysis.relevanceScore}/100
                  </span>
                </div>
                {aiAnalysis.relevanceReasoning && (
                  <p className="text-xs text-neutral-600 mt-2">{aiAnalysis.relevanceReasoning}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Competitive Intelligence */}
      {(enrichment || aiAnalysis?.competitiveLandscape) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">
            Competitive Intelligence
          </h2>
          {enrichment?.statistics && (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Similar Awards Found</div>
                  <div className="text-lg font-semibold text-neutral-900">
                    {enrichment.statistics.count}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Average Award Value</div>
                  <div className="text-lg font-semibold text-neutral-900">
                    {enrichment.statistics.average_obligation
                      ? `$${enrichment.statistics.average_obligation.toLocaleString()}`
                      : 'N/A'}
                  </div>
                </div>
              </div>
              {enrichment.statistics.unique_recipients && (
                <div>
                  <div className="text-sm text-neutral-600 mb-2">Previous Awardees</div>
                  <div className="text-sm text-neutral-900">
                    {enrichment.statistics.unique_recipients.slice(0, 5).join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
          {aiAnalysis?.competitiveLandscape && (
            <div className="space-y-2">
              {aiAnalysis.competitiveLandscape.likelyIncumbents && (
                <div>
                  <div className="text-sm font-medium text-neutral-700 mb-1">
                    Likely Incumbents
                  </div>
                  <div className="text-sm text-neutral-600">
                    {aiAnalysis.competitiveLandscape.likelyIncumbents.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Capture Actions */}
      <CaptureActions opportunityId={opportunityId} opportunity={opportunity} onUpdate={onUpdate} />
    </div>
  )
}

