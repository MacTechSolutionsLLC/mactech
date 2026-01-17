import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichBatch, getDetailedEnrichment, BatchEnrichmentResult } from '@/lib/services/award-enrichment'
import { analyzeEnrichmentComplete, EnrichmentAnalysisResult } from '@/lib/ai/enrichment-analysis'

export const dynamic = 'force-dynamic'

interface EnrichRequestBody {
  contract_ids: string[]
  use_database?: boolean
  include_trends?: boolean
  run_ai_analysis?: boolean
}

interface EnrichmentProgress {
  contractId: string
  stage: 'enriching' | 'analyzing' | 'completed' | 'failed'
  progress?: number
  message?: string
}

/**
 * Enrich and analyze selected contracts
 */
export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequestBody = await request.json()
    const {
      contract_ids,
      use_database = false,
      include_trends = true,
      run_ai_analysis = true,
    } = body

    if (!contract_ids || contract_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contract IDs provided' },
        { status: 400 }
      )
    }

    console.log(`[Enrichment API] Starting enrichment for ${contract_ids.length} contracts`)

    const results: Array<{
      contractId: string
      success: boolean
      enrichment?: any
      ai_analysis?: EnrichmentAnalysisResult
      error?: string
    }> = []

    // Process each contract
    for (let i = 0; i < contract_ids.length; i++) {
      const contractId = contract_ids[i]
      console.log(`[Enrichment API] Processing contract ${i + 1}/${contract_ids.length}: ${contractId}`)

      try {
        // Stage 1: Enrich with historical awards
        const enrichment = await getDetailedEnrichment(contractId, {
          limit: 20,
          useDatabase: use_database,
          includeTrends: include_trends,
        })

        if (!enrichment) {
          results.push({
            contractId,
            success: false,
            error: 'No enrichment data found',
          })
          continue
        }

        // Stage 2: Run AI analysis if requested
        let aiAnalysis: EnrichmentAnalysisResult | null = null
        if (run_ai_analysis) {
          console.log(`[Enrichment API] Running AI analysis for ${contractId}`)
          aiAnalysis = await analyzeEnrichmentComplete(contractId, enrichment)
        }

        // Stage 3: Combine and save to database
        const enrichmentData = {
          enriched_at: new Date().toISOString(),
          similar_awards_count: enrichment.statistics.count,
          statistics: enrichment.statistics,
          similar_awards: enrichment.similar_awards.slice(0, 10), // Store top 10
          trends: enrichment.trends,
          ai_analysis: aiAnalysis || undefined,
        }

        // Update contract with enrichment data
        await prisma.governmentContractDiscovery.update({
          where: { id: contractId },
          data: {
            usaspending_enrichment: JSON.stringify(enrichmentData),
            usaspending_enriched_at: new Date(),
            usaspending_enrichment_status: 'completed',
          },
        })

        results.push({
          contractId,
          success: true,
          enrichment: {
            statistics: enrichment.statistics,
            trends: enrichment.trends,
            similar_awards_count: enrichment.similar_awards.length,
          },
          ai_analysis: aiAnalysis || undefined,
        })

        console.log(`[Enrichment API] Completed enrichment for ${contractId}`)
      } catch (error) {
        console.error(`[Enrichment API] Error enriching ${contractId}:`, error)
        
        // Update status to failed
        try {
          await prisma.governmentContractDiscovery.update({
            where: { id: contractId },
            data: {
              usaspending_enrichment_status: 'failed',
            },
          })
        } catch (updateError) {
          // Ignore update errors
        }

        results.push({
          contractId,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }

      // Small delay between contracts to avoid overwhelming APIs
      if (i < contract_ids.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Enriched ${successCount} of ${contract_ids.length} contracts`,
      results,
      summary: {
        total: contract_ids.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error('[Enrichment API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * Get enrichment status for contracts
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const contractIds = searchParams.get('contract_ids')?.split(',') || []

    if (contractIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contract IDs provided' },
        { status: 400 }
      )
    }

    const contracts = await prisma.governmentContractDiscovery.findMany({
      where: {
        id: { in: contractIds },
      },
      select: {
        id: true,
        usaspending_enrichment_status: true,
        usaspending_enriched_at: true,
      },
    })

    return NextResponse.json({
      success: true,
      contracts: contracts.map(c => ({
        id: c.id,
        status: c.usaspending_enrichment_status || 'not_enriched',
        enriched_at: c.usaspending_enriched_at,
      })),
    })
  } catch (error) {
    console.error('[Enrichment API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

