/**
 * Unified Pipeline Service
 * 
 * Handles the complete contract processing pipeline:
 * 1. Scraping contract pages
 * 2. Enriching with USAspending data
 * 3. Running AI analysis
 * 
 * Updates pipeline_status at each stage and handles errors gracefully.
 */

import { prisma } from '../prisma'
import { scrapeContractPage, saveScrapedContract, ScrapeResult } from '../contract-scraper'
import { enrichOpportunity, EnrichmentResult } from '../services/award-enrichment'
import { analyzeEnrichmentComplete, EnrichmentAnalysisResult } from '../ai/enrichment-analysis'

export type PipelineStatus = 
  | 'discovered' 
  | 'scraping' 
  | 'scraped' 
  | 'enriching' 
  | 'enriched' 
  | 'analyzing' 
  | 'analyzed' 
  | 'ready' 
  | 'flagged' 
  | 'ignored'
  | 'error'

export interface PipelineResult {
  contractId: string
  success: boolean
  stages: {
    scraping: { completed: boolean; error?: string }
    enrichment: { completed: boolean; error?: string }
    analysis: { completed: boolean; error?: string }
  }
  finalStatus: PipelineStatus
  error?: string
}

export interface PipelineOptions {
  forceScrape?: boolean // Force re-scraping even if already scraped
  forceEnrichment?: boolean // Force re-enrichment even if already enriched
  forceAnalysis?: boolean // Force re-analysis even if already analyzed
  autoProcess?: boolean // Mark as auto-processed
  minScore?: number // Only process contracts with score >= minScore
}

/**
 * Process a single contract through the unified pipeline
 */
export async function processContractPipeline(
  contractId: string,
  options: PipelineOptions = {}
): Promise<PipelineResult> {
  const {
    forceScrape = false,
    forceEnrichment = false,
    forceAnalysis = false,
    autoProcess = false,
    minScore = 0,
  } = options

  const result: PipelineResult = {
    contractId,
    success: false,
    stages: {
      scraping: { completed: false },
      enrichment: { completed: false },
      analysis: { completed: false },
    },
    finalStatus: 'discovered',
  }

  try {
    // Get the contract
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      result.error = 'Contract not found'
      result.finalStatus = 'error'
      return result
    }

    // Check minimum score requirement
    if (contract.relevance_score < minScore) {
      result.error = `Contract score ${contract.relevance_score} is below minimum ${minScore}`
      result.finalStatus = 'discovered'
      return result
    }

    // Initialize pipeline status
    const pipelineErrors: string[] = []
    let currentStatus: PipelineStatus = contract.pipeline_status as PipelineStatus || 'discovered'

    // Update pipeline started timestamp if starting fresh
    if (currentStatus === 'discovered') {
      await prisma.governmentContractDiscovery.update({
        where: { id: contractId },
        data: {
          pipeline_started_at: new Date(),
          auto_processed: autoProcess,
        },
      })
    }

    // Stage 1: Scraping
    if (!contract.scraped || forceScrape) {
      try {
        currentStatus = 'scraping'
        await updatePipelineStatus(contractId, currentStatus, 'scraping', [])

        console.log(`[Pipeline] Scraping contract ${contractId}: ${contract.title.substring(0, 60)}...`)
        
        const scrapeResult = await scrapeContractPage(contract.url, {
          description: contract.description || undefined,
          title: contract.title,
        })

        if (scrapeResult.success) {
          await saveScrapedContract(contractId, scrapeResult)
          currentStatus = 'scraped'
          result.stages.scraping.completed = true
          await updatePipelineStatus(contractId, currentStatus, 'scraped', [])
          console.log(`[Pipeline] ✓ Scraped contract ${contractId}`)
        } else {
          throw new Error(scrapeResult.error || 'Scraping failed')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown scraping error'
        console.error(`[Pipeline] ✗ Scraping failed for ${contractId}:`, errorMessage)
        pipelineErrors.push(`Scraping: ${errorMessage}`)
        result.stages.scraping.error = errorMessage
        
        // If scraping fails, we can still try enrichment if we have basic data
        if (!contract.scraped && !forceScrape) {
          // Don't fail completely if scraping fails and we haven't scraped before
          currentStatus = 'scraped' // Mark as scraped to continue pipeline
        }
      }
    } else {
      result.stages.scraping.completed = true
      currentStatus = 'scraped'
    }

    // Stage 2: Enrichment with USAspending
    if (!contract.usaspending_enrichment || forceEnrichment) {
      try {
        currentStatus = 'enriching'
        await updatePipelineStatus(contractId, currentStatus, 'enriching', pipelineErrors)

        console.log(`[Pipeline] Enriching contract ${contractId} with USAspending data...`)
        
        const enrichment = await enrichOpportunity(contractId, {
          limit: 20,
          useDatabase: true,
          createLinks: true,
        })

        if (enrichment) {
          const enrichmentData = {
            enriched_at: new Date().toISOString(),
            similar_awards_count: enrichment.statistics.count,
            statistics: enrichment.statistics,
            similar_awards: enrichment.similar_awards.slice(0, 10),
            trends: enrichment.trends,
          }

          await prisma.governmentContractDiscovery.update({
            where: { id: contractId },
            data: {
              usaspending_enrichment: JSON.stringify(enrichmentData),
              usaspending_enriched_at: new Date(),
              usaspending_enrichment_status: 'completed',
            },
          })

          currentStatus = 'enriched'
          result.stages.enrichment.completed = true
          await updatePipelineStatus(contractId, currentStatus, 'enriched', pipelineErrors)
          console.log(`[Pipeline] ✓ Enriched contract ${contractId}`)
        } else {
          throw new Error('No enrichment data returned')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown enrichment error'
        console.error(`[Pipeline] ✗ Enrichment failed for ${contractId}:`, errorMessage)
        pipelineErrors.push(`Enrichment: ${errorMessage}`)
        result.stages.enrichment.error = errorMessage
        
        // Update enrichment status to failed
        await prisma.governmentContractDiscovery.update({
          where: { id: contractId },
          data: {
            usaspending_enrichment_status: 'failed',
          },
        })
      }
    } else {
      result.stages.enrichment.completed = true
      currentStatus = 'enriched'
    }

    // Stage 3: AI Analysis
    if (!contract.aiAnalysis || forceAnalysis) {
      try {
        currentStatus = 'analyzing'
        await updatePipelineStatus(contractId, currentStatus, 'analyzing', pipelineErrors)

        console.log(`[Pipeline] Running AI analysis for contract ${contractId}...`)
        
        // Get enrichment data for analysis
        const contractForAnalysis = await prisma.governmentContractDiscovery.findUnique({
          where: { id: contractId },
        })

        if (!contractForAnalysis?.usaspending_enrichment) {
          throw new Error('Enrichment data required for AI analysis')
        }

        const enrichmentData = JSON.parse(contractForAnalysis.usaspending_enrichment)
        const aiAnalysis = await analyzeEnrichmentComplete(contractId, enrichmentData)

        if (aiAnalysis) {
          // Update enrichment data with AI analysis
          const updatedEnrichmentData = {
            ...enrichmentData,
            ai_analysis: aiAnalysis,
          }

          await prisma.governmentContractDiscovery.update({
            where: { id: contractId },
            data: {
              usaspending_enrichment: JSON.stringify(updatedEnrichmentData),
              aiAnalysis: JSON.stringify(aiAnalysis),
              aiAnalysisGeneratedAt: new Date(),
            },
          })

          currentStatus = 'analyzed'
          result.stages.analysis.completed = true
          await updatePipelineStatus(contractId, currentStatus, 'analyzed', pipelineErrors)
          console.log(`[Pipeline] ✓ Analyzed contract ${contractId}`)
        } else {
          throw new Error('AI analysis returned no results')
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown analysis error'
        console.error(`[Pipeline] ✗ AI analysis failed for ${contractId}:`, errorMessage)
        pipelineErrors.push(`Analysis: ${errorMessage}`)
        result.stages.analysis.error = errorMessage
      }
    } else {
      result.stages.analysis.completed = true
      currentStatus = 'analyzed'
    }

    // Final status: ready if all stages completed successfully
    if (
      result.stages.scraping.completed &&
      result.stages.enrichment.completed &&
      result.stages.analysis.completed
    ) {
      currentStatus = 'ready'
      result.success = true
      await updatePipelineStatus(contractId, currentStatus, 'ready', pipelineErrors, true)
      console.log(`[Pipeline] ✓ Pipeline completed for contract ${contractId}`)
    } else if (pipelineErrors.length > 0) {
      currentStatus = 'error'
      await updatePipelineStatus(contractId, currentStatus, 'error', pipelineErrors)
    } else {
      await updatePipelineStatus(contractId, currentStatus, currentStatus, pipelineErrors)
    }

    result.finalStatus = currentStatus
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown pipeline error'
    console.error(`[Pipeline] ✗ Pipeline failed for ${contractId}:`, errorMessage)
    
    result.error = errorMessage
    result.finalStatus = 'error'
    
    await updatePipelineStatus(contractId, 'error', 'error', [errorMessage])
    
    return result
  }
}

/**
 * Process multiple contracts through the pipeline
 */
export async function processContractsPipeline(
  contractIds: string[],
  options: PipelineOptions = {}
): Promise<PipelineResult[]> {
  const results: PipelineResult[] = []
  
  for (const contractId of contractIds) {
    try {
      const result = await processContractPipeline(contractId, options)
      results.push(result)
      
      // Add a small delay between contracts to avoid overwhelming the system
      if (contractIds.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error(`[Pipeline] Error processing contract ${contractId}:`, error)
      results.push({
        contractId,
        success: false,
        stages: {
          scraping: { completed: false },
          enrichment: { completed: false },
          analysis: { completed: false },
        },
        finalStatus: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }
  
  return results
}

/**
 * Auto-process contracts with score >= minScore
 */
export async function autoProcessHighScoringContracts(
  minScore: number = 50,
  limit: number = 100
): Promise<{ processed: number; results: PipelineResult[] }> {
  console.log(`[Pipeline] Auto-processing contracts with score >= ${minScore}`)
  
  const contracts = await prisma.governmentContractDiscovery.findMany({
    where: {
      relevance_score: { gte: minScore },
      OR: [
        { pipeline_status: 'discovered' },
        { pipeline_status: null },
        { auto_processed: false },
      ],
    },
    take: limit,
    orderBy: {
      relevance_score: 'desc',
    },
    select: {
      id: true,
    },
  })

  console.log(`[Pipeline] Found ${contracts.length} contracts to auto-process`)

  const results = await processContractsPipeline(
    contracts.map(c => c.id),
    {
      autoProcess: true,
      minScore,
    }
  )

  const processed = results.filter(r => r.success).length
  console.log(`[Pipeline] Auto-processed ${processed}/${contracts.length} contracts successfully`)

  return { processed, results }
}

/**
 * Update pipeline status in database
 */
async function updatePipelineStatus(
  contractId: string,
  status: PipelineStatus,
  stage: string,
  errors: string[],
  completed: boolean = false
): Promise<void> {
  const updateData: any = {
    pipeline_status: status,
    pipeline_stage: stage,
    pipeline_errors: JSON.stringify(errors),
  }

  if (completed) {
    updateData.pipeline_completed_at = new Date()
  }

  await prisma.governmentContractDiscovery.update({
    where: { id: contractId },
    data: updateData,
  })
}

/**
 * Get pipeline status for a contract
 */
export async function getPipelineStatus(contractId: string): Promise<{
  status: PipelineStatus
  stage: string | null
  errors: string[]
  startedAt: Date | null
  completedAt: Date | null
  autoProcessed: boolean
} | null> {
  const contract = await prisma.governmentContractDiscovery.findUnique({
    where: { id: contractId },
    select: {
      pipeline_status: true,
      pipeline_stage: true,
      pipeline_errors: true,
      pipeline_started_at: true,
      pipeline_completed_at: true,
      auto_processed: true,
    },
  })

  if (!contract) {
    return null
  }

  let errors: string[] = []
  try {
    errors = JSON.parse(contract.pipeline_errors || '[]')
  } catch (e) {
    // Ignore parse errors
  }

  return {
    status: (contract.pipeline_status as PipelineStatus) || 'discovered',
    stage: contract.pipeline_stage || null,
    errors,
    startedAt: contract.pipeline_started_at || null,
    completedAt: contract.pipeline_completed_at || null,
    autoProcessed: contract.auto_processed || false,
  }
}

