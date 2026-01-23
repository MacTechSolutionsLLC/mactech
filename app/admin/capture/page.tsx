'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavigation from '@/components/admin/AdminNavigation'
import IngestionStatus from './components/IngestionStatus'
import UsaSpendingIngest from './components/UsaSpendingIngest'
import OpportunityQueue from '@/components/capture/OpportunityQueue'
import IntentFiltersComponent from '@/components/capture/IntentFilters'
import { OpportunitySummary, DashboardKPIs, IntentFilters } from '@/types/capture'
import { generateIntelligenceSignals } from '@/lib/services/intelligence-signals'

export default function CaptureDashboardPage() {
  const router = useRouter()
  const [opportunities, setOpportunities] = useState<OpportunitySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardKPIs | null>(null)
  const [intentFilters, setIntentFilters] = useState<IntentFilters>({})

  useEffect(() => {
    loadStats()
    loadOpportunities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentFilters])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/capture/stats')
      const data = await response.json()
      if (data.success) {
        // Transform to DashboardKPIs format
        const apiStats = data.stats
        setStats({
          totalOpportunities: apiStats.total || 0,
          flaggedCount: apiStats.flagged || 0,
          highPriorityCount: apiStats.highPriority || 0,
          earlyStageCount: 0, // Will be calculated from opportunities
          highRiskCount: 0, // Will be calculated from opportunities
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      // Build query params with intent filters
      const params = new URLSearchParams({
        minScore: '50',
        sortBy: 'score',
      })

      // Map intent filters to API params
      const intelligenceSignals: string[] = []
      if (intentFilters.shapeableOnly) {
        intelligenceSignals.push('EARLY_STAGE_SHAPE')
      }
      if (intentFilters.highIncumbentRisk) {
        intelligenceSignals.push('HIGH_INCUMBENT_LOCK_IN')
      }
      if (intentFilters.newVendorFriendly) {
        // This requires post-processing, handled in OpportunityQueue
      }
      if (intentFilters.earlyLifecycleOnly) {
        intelligenceSignals.push('EARLY_STAGE_SHAPE')
      }

      if (intelligenceSignals.length > 0) {
        params.append('intelligence_signals', intelligenceSignals.join(','))
      }

      const response = await fetch(`/api/admin/capture/opportunities?${params}`)
      const data = await response.json()

      if (data.success) {
        // Transform API response to OpportunitySummary format
        const transformed: OpportunitySummary[] = (data.opportunities || []).map((opp: any) => {
          // Generate intelligence flags
          const signals = generateIntelligenceSignals(opp)
          const intelligenceFlags = signals.map(s => ({
            type: s.signal,
            severity: s.severity,
            message: s.message,
            tooltip: s.tooltip,
          }))

          // Parse JSON fields
          let naicsCodes: string[] = []
          try {
            naicsCodes = typeof opp.naics_codes === 'string' 
              ? JSON.parse(opp.naics_codes || '[]')
              : opp.naics_codes || []
          } catch {
            naicsCodes = []
          }

          let setAside: string[] = []
          try {
            setAside = typeof opp.set_aside === 'string'
              ? JSON.parse(opp.set_aside || '[]')
              : opp.set_aside || []
          } catch {
            setAside = []
          }

          return {
            id: opp.id,
            noticeId: opp.notice_id,
            title: opp.title,
            agency: opp.agency,
            naicsCodes,
            setAside,
            deadline: opp.deadline,
            relevanceScore: opp.relevance_score || 0,
            pipelineStatus: opp.pipeline_status || 'discovered',
            intelligenceFlags,
            solicitationNumber: opp.solicitation_number,
            estimatedValue: opp.estimated_value,
            flagged: opp.flagged || false,
            ignored: opp.ignored || false,
          }
        })

        setOpportunities(transformed)

        // Update stats with calculated values
        setStats(prevStats => {
          if (!prevStats) return prevStats
          return {
            ...prevStats,
            earlyStageCount: transformed.filter(o => 
              o.intelligenceFlags.some(f => f.type === 'EARLY_STAGE_SHAPE')
            ).length,
            highRiskCount: transformed.filter(o =>
              o.intelligenceFlags.some(f => f.severity === 'high')
            ).length,
          }
        })
      }
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpportunityClick = (id: string) => {
    router.push(`/admin/capture/${id}`)
  }

  const handleFlag = async (id: string) => {
    try {
      await fetch(`/api/admin/capture/opportunities/${id}/flag`, {
        method: 'POST',
      })
      loadOpportunities()
      loadStats()
    } catch (error) {
      console.error('Error flagging opportunity:', error)
    }
  }

  const handleIgnore = async (id: string) => {
    try {
      await fetch(`/api/admin/capture/opportunities/${id}/ignore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User dismissed' }),
      })
      loadOpportunities()
      loadStats()
    } catch (error) {
      console.error('Error ignoring opportunity:', error)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Federal Capture Dashboard
            </h1>
            <p className="text-base text-neutral-600">
              Discover opportunities, analyze incumbents, and prepare to bid on federal contracts
            </p>
          </div>
        </div>
      </section>

      {/* Ingestion Status Banner */}
      <IngestionStatus onStatusChange={loadStats} />

      {/* KPI Summary Cards */}
      {stats && (
        <section className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <div className="text-sm text-neutral-600 mb-1">Total Opportunities</div>
                <div className="text-2xl font-bold text-neutral-900">{stats.totalOpportunities.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-600 mb-1">Flagged</div>
                <div className="text-2xl font-bold text-blue-900">{stats.flaggedCount.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-1">High Priority</div>
                <div className="text-2xl font-bold text-green-900">{stats.highPriorityCount.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-600 mb-1">Early Stage</div>
                <div className="text-2xl font-bold text-green-900">{stats.earlyStageCount.toLocaleString()}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm text-red-600 mb-1">High Risk</div>
                <div className="text-2xl font-bold text-red-900">{stats.highRiskCount.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* USAspending Ingestion */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <UsaSpendingIngest onIngestComplete={loadStats} />
        </div>
      </section>

      {/* Intent Filters */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <IntentFiltersComponent filters={intentFilters} onChange={setIntentFilters} />
        </div>
      </section>

      {/* Opportunity Queue */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <OpportunityQueue
          opportunities={opportunities}
          loading={loading}
          onOpportunityClick={handleOpportunityClick}
          onFlag={handleFlag}
          onIgnore={handleIgnore}
          filters={intentFilters}
        />
      </section>
    </div>
  )
}

