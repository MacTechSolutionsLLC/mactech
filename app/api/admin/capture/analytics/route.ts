/**
 * GET /api/admin/capture/analytics
 * Get comprehensive analytics data for the capture dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authz'

export const dynamic = 'force-dynamic'

interface TimeSeriesData {
  date: string
  count: number
  value?: number
  fetched?: number
  scored?: number
}

interface DistributionData {
  name: string
  count: number
  value?: number
}

interface ScoreRange {
  range: string
  count: number
}

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get all opportunities
    const opportunities = await prisma.governmentContractDiscovery.findMany({
      where: {
        dismissed: false,
      },
      select: {
        id: true,
        created_at: true,
        relevance_score: true,
        agency: true,
        naics_codes: true,
        estimated_value: true,
        flagged: true,
        ignored: true,
        pipeline_status: true,
        aiFitScore: true,
        aiAwardLikelihood: true,
        smart_sort_score: true,
      },
    })

    // Get awards for time series (using user-selected date range)
    const awards = await prisma.usaSpendingAward.findMany({
      where: {
        awarding_date: {
          gte: startDate,
        },
      },
      select: {
        id: true,
        awarding_date: true,
        total_obligation: true,
        recipient_name: true,
        awarding_agency_name: true,
        naics_code: true,
      },
    })
    
    // Get awards for competitive analysis (use longer time window - 365 days for meaningful statistics)
    const competitiveStartDate = new Date()
    competitiveStartDate.setDate(competitiveStartDate.getDate() - 365)
    
    const competitiveAwards = await prisma.usaSpendingAward.findMany({
      where: {
        awarding_date: {
          gte: competitiveStartDate,
        },
      },
      select: {
        id: true,
        awarding_date: true,
        total_obligation: true,
        recipient_name: true,
        awarding_agency_name: true,
        naics_code: true,
      },
    })
    
    // Also get awards linked to opportunities (via OpportunityAwardLink) for more comprehensive competitor data
    // First get opportunity IDs that aren't dismissed
    const activeOpportunityIds = opportunities.map(opp => opp.id)
    
    const linkedAwards = await prisma.opportunityAwardLink.findMany({
      where: {
        opportunity_id: {
          in: activeOpportunityIds,
        },
      },
      include: {
        award: {
          select: {
            id: true,
            awarding_date: true,
            total_obligation: true,
            recipient_name: true,
            awarding_agency_name: true,
            naics_code: true,
          },
        },
      },
    })
    
    // Combine competitive awards from both sources, deduplicating by award ID
    const allAwardsMap = new Map<string, typeof competitiveAwards[0]>()
    competitiveAwards.forEach(award => {
      if (award.id && award.recipient_name) {
        allAwardsMap.set(award.id, award)
      }
    })
    linkedAwards.forEach(link => {
      if (link.award?.id && link.award.recipient_name) {
        allAwardsMap.set(link.award.id, link.award)
      }
    })
    const allAwards = Array.from(allAwardsMap.values())

    // Get ingestion status
    const ingestionStatus = await prisma.ingestionStatus.findFirst({
      orderBy: { updated_at: 'desc' },
    })

    // Time Series: Opportunities discovered over time
    const opportunitiesByDate = new Map<string, number>()
    opportunities.forEach((opp) => {
      if (opp.created_at >= startDate) {
        const dateKey = opp.created_at.toISOString().split('T')[0]
        opportunitiesByDate.set(dateKey, (opportunitiesByDate.get(dateKey) || 0) + 1)
      }
    })
    const timeSeriesOpportunities: TimeSeriesData[] = Array.from(opportunitiesByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Time Series: Awards over time
    const awardsByDate = new Map<string, { count: number; value: number }>()
    awards.forEach((award) => {
      if (award.awarding_date) {
        const dateKey = award.awarding_date.toISOString().split('T')[0]
        const existing = awardsByDate.get(dateKey) || { count: 0, value: 0 }
        awardsByDate.set(dateKey, {
          count: existing.count + 1,
          value: existing.value + (award.total_obligation || 0),
        })
      }
    })
    const timeSeriesAwards: TimeSeriesData[] = Array.from(awardsByDate.entries())
      .map(([date, data]) => ({ date, count: data.count, value: data.value }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Distribution: Agencies
    const agencyCounts = new Map<string, number>()
    opportunities.forEach((opp) => {
      if (opp.agency) {
        agencyCounts.set(opp.agency, (agencyCounts.get(opp.agency) || 0) + 1)
      }
    })
    const agencyDistribution: DistributionData[] = Array.from(agencyCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Distribution: NAICS codes
    const naicsCounts = new Map<string, number>()
    opportunities.forEach((opp) => {
      if (opp.naics_codes) {
        try {
          const naicsArray = JSON.parse(opp.naics_codes) as string[]
          naicsArray.forEach((code) => {
            naicsCounts.set(code, (naicsCounts.get(code) || 0) + 1)
          })
        } catch {
          // Invalid JSON, skip
        }
      }
    })
    const naicsDistribution: DistributionData[] = Array.from(naicsCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Distribution: Score ranges
    const scoreRanges: ScoreRange[] = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ]
    opportunities.forEach((opp) => {
      const score = opp.relevance_score || 0
      if (score <= 20) scoreRanges[0].count++
      else if (score <= 40) scoreRanges[1].count++
      else if (score <= 60) scoreRanges[2].count++
      else if (score <= 80) scoreRanges[3].count++
      else scoreRanges[4].count++
    })

    // Distribution: Pipeline status
    const pipelineStatusCounts = new Map<string, number>()
    opportunities.forEach((opp) => {
      const status = opp.pipeline_status || 'discovered'
      pipelineStatusCounts.set(status, (pipelineStatusCounts.get(status) || 0) + 1)
    })
    const pipelineStatusDistribution: DistributionData[] = Array.from(
      pipelineStatusCounts.entries()
    ).map(([name, count]) => ({ name, count }))

    // Financial metrics
    let totalOpportunityValue = 0
    let opportunityValueCount = 0
    opportunities.forEach((opp) => {
      if (opp.estimated_value) {
        try {
          // Try to parse as number or extract from string
          const value = typeof opp.estimated_value === 'string'
            ? parseFloat(opp.estimated_value.replace(/[^0-9.]/g, ''))
            : opp.estimated_value
          if (!isNaN(value) && value > 0) {
            totalOpportunityValue += value
            opportunityValueCount++
          }
        } catch {
          // Skip invalid values
        }
      }
    })
    const averageOpportunityValue =
      opportunityValueCount > 0 ? totalOpportunityValue / opportunityValueCount : 0

    const totalAwardValue = awards.reduce((sum, award) => sum + (award.total_obligation || 0), 0)
    const averageAwardValue = awards.length > 0 ? totalAwardValue / awards.length : 0

    // Competitive intelligence: Top vendors
    // Use allAwards which includes both recent awards and awards linked to opportunities
    const vendorStats = new Map<
      string,
      { name: string; count: number; value: number }
    >()
    allAwards.forEach((award) => {
      if (award.recipient_name && award.recipient_name.trim() !== '') {
        const existing = vendorStats.get(award.recipient_name) || {
          name: award.recipient_name,
          count: 0,
          value: 0,
        }
        vendorStats.set(award.recipient_name, {
          ...existing,
          count: existing.count + 1,
          value: existing.value + (award.total_obligation || 0),
        })
      }
    })
    const topVendors: DistributionData[] = Array.from(vendorStats.values())
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((v) => ({ name: v.name, count: v.count, value: v.value }))

    // Market share calculation
    const totalMarketValue = topVendors.reduce((sum, v) => sum + (v.value || 0), 0)
    const marketShare = topVendors.map((vendor) => ({
      vendor: vendor.name,
      percentage: totalMarketValue > 0 ? ((vendor.value || 0) / totalMarketValue) * 100 : 0,
    }))

    // AI Metrics: Fit score distribution
    const fitScoreRanges: ScoreRange[] = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ]
    let fitScoreSum = 0
    let fitScoreCount = 0
    opportunities.forEach((opp) => {
      const score = opp.aiFitScore || opp.smart_sort_score || 0
      if (score > 0) {
        fitScoreSum += score
        fitScoreCount++
        if (score <= 20) fitScoreRanges[0].count++
        else if (score <= 40) fitScoreRanges[1].count++
        else if (score <= 60) fitScoreRanges[2].count++
        else if (score <= 80) fitScoreRanges[3].count++
        else fitScoreRanges[4].count++
      }
    })
    const averageFitScore = fitScoreCount > 0 ? fitScoreSum / fitScoreCount : 0

    // AI Metrics: Award likelihood distribution
    const awardLikelihoodRanges: ScoreRange[] = [
      { range: '0-20', count: 0 },
      { range: '21-40', count: 0 },
      { range: '41-60', count: 0 },
      { range: '61-80', count: 0 },
      { range: '81-100', count: 0 },
    ]
    opportunities.forEach((opp) => {
      const likelihood = opp.aiAwardLikelihood || 0
      if (likelihood > 0) {
        if (likelihood <= 20) awardLikelihoodRanges[0].count++
        else if (likelihood <= 40) awardLikelihoodRanges[1].count++
        else if (likelihood <= 60) awardLikelihoodRanges[2].count++
        else if (likelihood <= 80) awardLikelihoodRanges[3].count++
        else awardLikelihoodRanges[4].count++
      }
    })

    // Status breakdowns
    const flaggedCount = opportunities.filter((opp) => opp.flagged).length
    const ignoredCount = opportunities.filter((opp) => opp.ignored).length
    const highPriorityCount = opportunities.filter((opp) => opp.relevance_score >= 70).length

    // Ingestion metrics
    const ingestionMetrics = ingestionStatus
      ? {
          lastRun: {
            status: ingestionStatus.status,
            startedAt: ingestionStatus.last_run_started_at,
            completedAt: ingestionStatus.last_run_completed_at,
            durationMs: ingestionStatus.last_run_duration_ms,
            fetched: ingestionStatus.last_fetched,
            deduplicated: ingestionStatus.last_deduplicated,
            passedFilters: ingestionStatus.last_passed_filters,
            scoredAbove50: ingestionStatus.last_scored_above_50,
            error: ingestionStatus.last_error,
          },
          successRate:
            ingestionStatus.error_count > 0
              ? Math.max(
                  0,
                  100 - (ingestionStatus.error_count / (ingestionStatus.error_count + 1)) * 100
                )
              : 100,
          averageProcessingTime: ingestionStatus.last_run_duration_ms || 0,
          samGovOutage: ingestionStatus.sam_gov_outage,
        }
      : {
          lastRun: null,
          successRate: 100,
          averageProcessingTime: 0,
          samGovOutage: false,
        }

    return NextResponse.json({
      success: true,
      data: {
        timeSeries: {
          opportunities: timeSeriesOpportunities,
          awards: timeSeriesAwards,
        },
        distributions: {
          agencies: agencyDistribution,
          naics: naicsDistribution,
          scores: scoreRanges,
          pipelineStatus: pipelineStatusDistribution,
        },
        financial: {
          totalOpportunityValue,
          averageOpportunityValue,
          totalAwardValue,
          averageAwardValue,
        },
        competitive: {
          topVendors,
          marketShare,
        },
        aiMetrics: {
          fitScoreDistribution: fitScoreRanges,
          averageFitScore,
          awardLikelihoodDistribution: awardLikelihoodRanges,
        },
        ingestion: ingestionMetrics,
        statusBreakdowns: {
          total: opportunities.length,
          flagged: flaggedCount,
          ignored: ignoredCount,
          highPriority: highPriorityCount,
        },
      },
    })
  } catch (error) {
    console.error('[API] Error getting analytics:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
