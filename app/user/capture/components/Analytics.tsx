'use client'

import { useState, useEffect, useMemo, useCallback, lazy, Suspense, memo } from 'react'
import MetricCard from '@/components/analytics/MetricCard'
import {
  TimeSeriesChart,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
  Histogram,
} from '@/components/analytics/ChartComponents'

// Memoize chart components for performance
const MemoizedTimeSeriesChart = memo(TimeSeriesChart)
const MemoizedBarChart = memo(BarChartComponent)
const MemoizedPieChart = memo(PieChartComponent)
const MemoizedHistogram = memo(Histogram)

interface AnalyticsData {
  timeSeries: {
    opportunities: Array<{ date: string; count: number }>
    awards: Array<{ date: string; count: number; value: number }>
  }
  distributions: {
    agencies: Array<{ name: string; count: number }>
    naics: Array<{ name: string; count: number }>
    scores: Array<{ range: string; count: number }>
    pipelineStatus: Array<{ name: string; count: number }>
  }
  financial: {
    totalOpportunityValue: number
    averageOpportunityValue: number
    totalAwardValue: number
    averageAwardValue: number
  }
  competitive: {
    topVendors: Array<{ name: string; count: number; value: number }>
    marketShare: Array<{ vendor: string; percentage: number }>
  }
  aiMetrics: {
    fitScoreDistribution: Array<{ range: string; count: number }>
    averageFitScore: number
    awardLikelihoodDistribution: Array<{ range: string; count: number }>
  }
  ingestion: {
    lastRun: {
      status: string
      startedAt: string | null
      completedAt: string | null
      durationMs: number | null
      fetched: number
      deduplicated: number
      passedFilters: number
      scoredAbove50: number
      error: string | null
    } | null
    successRate: number
    averageProcessingTime: number
    samGovOutage: boolean
  }
  statusBreakdowns: {
    total: number
    flagged: number
    ignored: number
    highPriority: number
  }
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)

  const loadAnalytics = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const response = await fetch(`/api/admin/capture/analytics?days=${days}`)
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [days])

  useEffect(() => {
    loadAnalytics()
  }, [loadAnalytics])

  const formatDuration = useCallback((ms: number | null) => {
    if (!ms) return 'N/A'
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }, [])

  // Memoize chart data to prevent unnecessary re-renders
  const chartSkeleton = useMemo(
    () => (
      <div className="animate-pulse">
        <div className="h-64 bg-neutral-200 rounded"></div>
      </div>
    ),
    []
  )

  // Memoize competitive data transformations
  const topVendorsData = useMemo(
    () =>
      data?.competitive.topVendors.map((v) => ({
        name: v.name,
        count: v.count,
        value: v.value,
      })) || [],
    [data?.competitive.topVendors]
  )

  const marketShareData = useMemo(
    () =>
      data?.competitive.marketShare.map((m) => ({
        name: m.vendor,
        count: m.percentage,
      })) || [],
    [data?.competitive.marketShare]
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="h-10 bg-neutral-200 rounded w-1/4"></div>
          </div>
        </div>
        {/* Metrics skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-neutral-200 rounded w-1/3 mb-4"></div>
                <div className="h-64 bg-neutral-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading analytics</div>
          <div className="text-sm text-neutral-600 mb-4">{error}</div>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-8">
        <div className="text-center text-neutral-600">No data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-3 py-2 border border-neutral-300 rounded-lg text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={180}>Last 6 months</option>
            </select>
            <button
              onClick={() => loadAnalytics(true)}
              disabled={refreshing}
              className="px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Opportunities"
          value={data.statusBreakdowns.total}
          subtitle="Active opportunities"
        />
        <MetricCard
          title="Flagged"
          value={data.statusBreakdowns.flagged}
          subtitle="High priority items"
        />
        <MetricCard
          title="High Priority"
          value={data.statusBreakdowns.highPriority}
          subtitle="Score ≥ 70"
        />
        <MetricCard
          title="Total Opportunity Value"
          value={data.financial.totalOpportunityValue}
          subtitle={`Avg: $${data.financial.averageOpportunityValue.toLocaleString()}`}
        />
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedTimeSeriesChart
            data={data.timeSeries.opportunities}
            title="Opportunities Discovered Over Time"
            height={300}
          />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedTimeSeriesChart
            data={data.timeSeries.awards}
            title="Awards Over Time"
            height={300}
            showValue={true}
          />
        </div>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedBarChart
            data={data.distributions.agencies}
            title="Top Agencies by Opportunity Count"
            height={300}
            horizontal={true}
          />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedPieChart
            data={data.distributions.naics}
            title="Top NAICS Codes"
            height={300}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedHistogram
            data={data.distributions.scores}
            title="Relevance Score Distribution"
            height={300}
          />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedPieChart
            data={data.distributions.pipelineStatus}
            title="Pipeline Status Breakdown"
            height={300}
          />
        </div>
      </div>

      {/* Financial Dashboard */}
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Financial Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Opportunity Value"
            value={data.financial.totalOpportunityValue}
          />
          <MetricCard
            title="Average Opportunity Value"
            value={data.financial.averageOpportunityValue}
          />
          <MetricCard title="Total Award Value" value={data.financial.totalAwardValue} />
          <MetricCard
            title="Average Award Value"
            value={data.financial.averageAwardValue}
          />
        </div>
      </div>

      {/* Competitive Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedBarChart
            data={topVendorsData}
            title="Top Vendors by Award Value"
            height={300}
            horizontal={true}
            showValue={true}
          />
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedPieChart
            data={marketShareData}
            title="Market Share by Vendor"
            height={300}
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedHistogram
            data={data.aiMetrics.fitScoreDistribution}
            title="AI Fit Score Distribution"
            height={300}
          />
          <div className="mt-4 text-center">
            <div className="text-sm text-neutral-600">Average Fit Score</div>
            <div className="text-2xl font-bold text-neutral-900">
              {data.aiMetrics.averageFitScore.toFixed(1)}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <MemoizedHistogram
            data={data.aiMetrics.awardLikelihoodDistribution}
            title="Award Likelihood Distribution"
            height={300}
          />
        </div>
      </div>

      {/* Ingestion Health */}
      {data.ingestion.lastRun && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ingestion Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Last Run Status"
              value={data.ingestion.lastRun.status}
              subtitle={
                data.ingestion.lastRun.completedAt
                  ? new Date(data.ingestion.lastRun.completedAt).toLocaleDateString()
                  : 'Never'
              }
            />
            <MetricCard
              title="Success Rate"
              value={`${data.ingestion.successRate.toFixed(1)}%`}
            />
            <MetricCard
              title="Processing Time"
              value={formatDuration(data.ingestion.averageProcessingTime)}
            />
            <MetricCard
              title="Last Fetched"
              value={data.ingestion.lastRun.fetched}
              subtitle={`${data.ingestion.lastRun.scoredAbove50} scored above 50`}
            />
          </div>
          {data.ingestion.samGovOutage && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-800">
                SAM.gov Outage Detected
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
