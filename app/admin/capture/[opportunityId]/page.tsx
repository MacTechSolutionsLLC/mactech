/**
 * Opportunity Detail Page
 * Deep dive into decision factors for a single opportunity
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import DecisionSummary from '@/components/capture/DecisionSummary'
import AgencyBehaviorSection from '@/components/capture/AgencyBehaviorSection'
import CompetitiveRiskSection from '@/components/capture/CompetitiveRiskSection'
import AwardRealismSection from '@/components/capture/AwardRealismSection'
import LifecycleTimingSection from '@/components/capture/LifecycleTimingSection'
import { OpportunityIntel } from '@/types/capture'

interface PageProps {
  params: Promise<{ opportunityId: string }> | { opportunityId: string }
}

export default function OpportunityDetailPage({ params }: PageProps) {
  const router = useRouter()
  const [opportunityId, setOpportunityId] = useState<string>('')
  const [opportunity, setOpportunity] = useState<any>(null)
  const [intel, setIntel] = useState<OpportunityIntel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await Promise.resolve(params)
      setOpportunityId(resolved.opportunityId)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity()
      loadIntelligence()
    }
  }, [opportunityId])

  const loadOpportunity = async () => {
    try {
      const response = await fetch(`/api/admin/capture/opportunities/${opportunityId}`)
      const data = await response.json()
      if (data.success) {
        setOpportunity(data.opportunity)
      }
    } catch (error) {
      console.error('Error loading opportunity:', error)
    }
  }

  const loadIntelligence = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/opportunity/${opportunityId}/intelligence`)
      const data = await response.json()

      if (response.ok && data.signals) {
        // Build verdict label from signals
        const hasHighRisk = data.signals.competitive_risk?.incumbent_lock_in || 
                           (data.signals.competitive_risk?.incumbent_concentration_score ?? 0) > 0.5
        const hasHighFit = data.signals.bid_no_bid?.recommendation === 'BID'
        const recommendation = data.signals.bid_no_bid?.recommendation || 'MONITOR'
        
        let verdictLabel = 'MEDIUM RISK'
        if (hasHighFit && !hasHighRisk) {
          verdictLabel = 'HIGH FIT'
        } else if (hasHighRisk && recommendation === 'NO_BID') {
          verdictLabel = 'HIGH RISK'
        } else if (hasHighFit && hasHighRisk) {
          verdictLabel = 'HIGH FIT / MEDIUM RISK'
        }

        // Transform API response to OpportunityIntel format
        const transformed: OpportunityIntel = {
          opportunityId,
          verdict: {
            label: verdictLabel,
            explanation: (data.signals.bid_no_bid?.reasoning || []).join(' ') || 'No specific explanation available.',
            recommendedAction: recommendation as 'BID' | 'NO_BID' | 'MONITOR' | 'INVESTIGATE',
            confidence: data.signals.bid_no_bid?.confidence || 0.5,
            reasoning: data.signals.bid_no_bid?.reasoning || [],
          },
          agencyBehavior: {
            newVendorAcceptanceRate: data.signals.agency_behavior?.new_vendor_acceptance_rate ?? null,
            typicalAwardSizeAvg: data.signals.agency_behavior?.typical_award_size_avg ?? null,
            setAsideEnforcementStrength: data.signals.agency_behavior?.set_aside_enforcement_strength ?? null,
          },
          competitiveRisk: {
            incumbentLockIn: data.signals.competitive_risk?.incumbent_lock_in ?? false,
            incumbentConcentrationScore: data.signals.competitive_risk?.incumbent_concentration_score ?? null,
            recompeteLikelihood: data.signals.competitive_risk?.recompete_likelihood ?? null,
          },
          awardRealism: {
            samValue: data.signals.award_realism?.sam_value ?? null,
            historicalAvg: data.signals.award_realism?.historical_avg ?? null,
            realismRatio: data.signals.award_realism?.realism_ratio ?? null,
          },
        }

        setIntel(transformed)
      }
    } catch (error) {
      console.error('Error loading intelligence:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'BID' | 'NO_BID' | 'MONITOR' | 'INVESTIGATE') => {
    // Placeholder handler - would integrate with backend
    console.log(`Action: ${action} for opportunity ${opportunityId}`)
    // Could navigate to a form or call an API endpoint
  }

  const handleFlag = async () => {
    try {
      await fetch(`/api/admin/capture/opportunities/${opportunityId}/flag`, {
        method: 'POST',
      })
      loadOpportunity()
    } catch (error) {
      console.error('Error flagging opportunity:', error)
    }
  }

  const handleIgnore = async () => {
    try {
      await fetch(`/api/admin/capture/opportunities/${opportunityId}/ignore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User dismissed' }),
      })
      router.push('/admin/capture')
    } catch (error) {
      console.error('Error ignoring opportunity:', error)
    }
  }

  // Calculate days until deadline
  const calculateDaysUntilDeadline = (deadline?: string): number | null => {
    if (!deadline) return null
    try {
      const deadlineDate = new Date(deadline)
      const now = new Date()
      const diffTime = deadlineDate.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading opportunity intelligence...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
            <p className="text-neutral-600 mb-4">Opportunity not found</p>
            <Link
              href="/admin/capture"
              className="text-accent-700 hover:text-accent-800 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Add lifecycle timing data if intel exists
  const lifecycleTiming = intel ? {
    stage: (opportunity.lifecycle_stage_classification || 'UNKNOWN') as 'SOURCES_SOUGHT' | 'PRE_SOLICITATION' | 'SOLICITATION' | 'AWARD' | 'UNKNOWN',
    daysUntilDeadline: calculateDaysUntilDeadline(opportunity.deadline),
  } : undefined

  const fullIntel: OpportunityIntel | null = intel ? {
    ...intel,
    lifecycleTiming,
  } : null

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />

      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Link
                href="/admin/capture"
                className="text-sm text-neutral-600 hover:text-neutral-900 mb-2 inline-block"
              >
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                {opportunity.title}
              </h1>
              <div className="flex flex-wrap gap-2 text-sm text-neutral-600">
                {opportunity.agency && <span>{opportunity.agency}</span>}
                {opportunity.solicitation_number && (
                  <span>• {opportunity.solicitation_number}</span>
                )}
                {opportunity.notice_id && <span>• Notice ID: {opportunity.notice_id}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFlag}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {opportunity.flagged ? 'Unflag' : 'Flag'}
              </button>
              <button
                onClick={handleIgnore}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
              >
                Ignore
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Summary */}
      {fullIntel && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <DecisionSummary intel={fullIntel} onAction={handleAction} />
        </section>
      )}

      {/* Intelligence Sections */}
      {fullIntel && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-8 space-y-6">
          <AgencyBehaviorSection data={fullIntel.agencyBehavior} />
          <CompetitiveRiskSection data={fullIntel.competitiveRisk} />
          <AwardRealismSection data={fullIntel.awardRealism} />
          <LifecycleTimingSection data={fullIntel.lifecycleTiming} />
        </section>
      )}

      {/* Fallback if intelligence not calculated */}
      {!fullIntel && (
        <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <p className="text-neutral-600 mb-4">
              Intelligence data not yet calculated for this opportunity.
            </p>
            <button
              onClick={loadIntelligence}
              className="px-4 py-2 text-sm font-medium text-accent-700 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
            >
              Calculate Intelligence
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
