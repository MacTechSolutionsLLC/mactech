/**
 * POST /api/admin/contract-discovery/enrich
 * Enriches all contracts with relevance_score >= 50 by scraping their URLs
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scrapeContractPage, saveScrapedContract } from '@/lib/contract-scraper'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Starting contract enrichment')
    
    // Find all contracts with relevance_score >= 50 that need scraping
    const contracts = await prisma.governmentContractDiscovery.findMany({
      where: {
        relevance_score: {
          gte: 50,
        },
        // Only scrape if not scraped or scraped more than 24 hours ago
        OR: [
          { scraped: false },
          { scraped_at: null },
          {
            scraped_at: {
              lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        url: true,
        notice_id: true,
        description: true,
        scraped: true,
        scraped_at: true,
      },
      orderBy: {
        relevance_score: 'desc', // Process highest scores first
      },
    })

    console.log(`[API] Found ${contracts.length} contracts to enrich`)

    if (contracts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No contracts need enrichment',
        enriched: 0,
        total: 0,
      })
    }

    // Run enrichment in background (don't await to avoid timeout)
    const enrichmentPromise = (async () => {
      let successCount = 0
      let errorCount = 0

      // Process contracts in batches to avoid overwhelming the server
      const batchSize = 5
      for (let i = 0; i < contracts.length; i += batchSize) {
        const batch = contracts.slice(i, i + batchSize)
        console.log(`[API] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contracts.length / batchSize)} (${batch.length} contracts)`)

        // Process batch in parallel (but limit concurrency)
        const batchPromises = batch.map(async (contract) => {
          try {
            console.log(`[API] Scraping: ${contract.title.substring(0, 60)}... (${contract.url})`)
            
            // Try to reconstruct API data from stored fields if available
            const apiData = contract.description
              ? {
                  description: contract.description,
                  title: contract.title,
                }
              : undefined

            // Scrape the contract page
            const scrapeResult = await scrapeContractPage(contract.url, apiData)

            if (!scrapeResult.success) {
              throw new Error(scrapeResult.error || 'Scraping failed')
            }

            // Save scraped data to database
            await saveScrapedContract(contract.id, scrapeResult)

            console.log(`[API] ✓ Successfully enriched: ${contract.title.substring(0, 60)}...`)
            successCount++
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            console.error(`[API] ✗ Error enriching ${contract.id} (${contract.title.substring(0, 60)}...):`, errorMessage)
            errorCount++
          }
        })

        // Wait for batch to complete
        await Promise.all(batchPromises)

        // Add a small delay between batches to be respectful to the server
        if (i + batchSize < contracts.length) {
          console.log('[API] Waiting 2 seconds before next batch...')
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log(`[API] Enrichment complete! Successfully enriched: ${successCount}, Errors: ${errorCount}`)
    })()

    // Don't await - let it run in background
    enrichmentPromise.catch((error) => {
      console.error('[API] Contract enrichment failed:', error)
    })
    
    // Return immediately
    return NextResponse.json({
      success: true,
      message: `Contract enrichment started in background. Processing ${contracts.length} contracts. Check logs for progress.`,
      total: contracts.length,
      started: true,
    })
  } catch (error) {
    console.error('[API] Error starting enrichment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

