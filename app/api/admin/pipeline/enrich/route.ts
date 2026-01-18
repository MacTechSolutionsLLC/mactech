/**
 * Unified Pipeline Enrichment API
 * 
 * POST /api/admin/pipeline/enrich
 * 
 * Processes contracts through the unified pipeline (scraping + enrichment + AI analysis)
 */

import { NextRequest, NextResponse } from 'next/server'
import { processContractsPipeline, processContractPipeline, PipelineOptions } from '@/lib/services/unified-pipeline'

export const dynamic = 'force-dynamic'

interface EnrichRequestBody {
  contract_ids: string[]
  force_scrape?: boolean
  force_enrichment?: boolean
  force_analysis?: boolean
  auto_process?: boolean
  min_score?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: EnrichRequestBody = await request.json()
    const {
      contract_ids,
      force_scrape = false,
      force_enrichment = false,
      force_analysis = false,
      auto_process = false,
      min_score = 0,
    } = body

    if (!contract_ids || contract_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contract IDs provided' },
        { status: 400 }
      )
    }

    console.log(`[Pipeline API] Processing ${contract_ids.length} contracts through pipeline`)

    const options: PipelineOptions = {
      forceScrape: force_scrape,
      forceEnrichment: force_enrichment,
      forceAnalysis: force_analysis,
      autoProcess: auto_process,
      minScore: min_score,
    }

    // Process contracts (in background for large batches)
    if (contract_ids.length > 10) {
      // For large batches, process in background and return immediately
      processContractsPipeline(contract_ids, options).catch(error => {
        console.error('[Pipeline API] Background processing error:', error)
      })

      return NextResponse.json({
        success: true,
        message: `Started processing ${contract_ids.length} contracts in background`,
        processing: true,
        contract_count: contract_ids.length,
      })
    } else {
      // For small batches, process synchronously
      const results = await processContractsPipeline(contract_ids, options)

      const successCount = results.filter(r => r.success).length
      const errorCount = results.filter(r => !r.success).length

      return NextResponse.json({
        success: true,
        message: `Processed ${successCount}/${contract_ids.length} contracts successfully`,
        results,
        stats: {
          total: contract_ids.length,
          successful: successCount,
          failed: errorCount,
        },
      })
    }
  } catch (error) {
    console.error('[Pipeline API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

