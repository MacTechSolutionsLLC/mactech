/**
 * Pipeline Process API
 * 
 * POST /api/admin/pipeline/process
 * 
 * Processes contracts through pipeline stages. Can process single contract or batch.
 * Supports auto-processing high-scoring contracts.
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  processContractPipeline,
  processContractsPipeline,
  autoProcessHighScoringContracts,
  PipelineOptions,
} from '@/lib/services/unified-pipeline'

export const dynamic = 'force-dynamic'

interface ProcessRequestBody {
  contract_ids?: string[]
  auto_process?: boolean
  min_score?: number
  limit?: number
  force_scrape?: boolean
  force_enrichment?: boolean
  force_analysis?: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: ProcessRequestBody = await request.json()
    const {
      contract_ids,
      auto_process = false,
      min_score = 50,
      limit = 100,
      force_scrape = false,
      force_enrichment = false,
      force_analysis = false,
    } = body

    // Auto-process high-scoring contracts if requested
    if (auto_process) {
      console.log(`[Pipeline Process API] Auto-processing contracts with score >= ${min_score}`)
      
      const result = await autoProcessHighScoringContracts(min_score, limit)
      
      return NextResponse.json({
        success: true,
        message: `Auto-processed ${result.processed} contracts`,
        auto_processed: true,
        stats: {
          processed: result.processed,
          total: result.results.length,
          successful: result.results.filter(r => r.success).length,
          failed: result.results.filter(r => !r.success).length,
        },
        results: result.results,
      })
    }

    // Process specific contract IDs
    if (!contract_ids || contract_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No contract IDs provided and auto_process is false' },
        { status: 400 }
      )
    }

    const options: PipelineOptions = {
      forceScrape: force_scrape,
      forceEnrichment: force_enrichment,
      forceAnalysis: force_analysis,
      minScore: min_score,
    }

    console.log(`[Pipeline Process API] Processing ${contract_ids.length} contracts`)

    // Process in background for large batches
    if (contract_ids.length > 10) {
      processContractsPipeline(contract_ids, options).catch(error => {
        console.error('[Pipeline Process API] Background processing error:', error)
      })

      return NextResponse.json({
        success: true,
        message: `Started processing ${contract_ids.length} contracts in background`,
        processing: true,
        contract_count: contract_ids.length,
      })
    }

    // Process synchronously for small batches
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
  } catch (error) {
    console.error('[Pipeline Process API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

