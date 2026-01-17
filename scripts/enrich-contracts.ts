/**
 * Enrich Contracts Script
 * Scrapes and enriches all contracts with relevance_score >= 50
 * Fetches HTML/text content from each contract URL and updates the database
 */

import { prisma } from '../lib/prisma'
import { scrapeContractPage, saveScrapedContract } from '../lib/contract-scraper'

async function enrichContracts() {
  console.log('[Enrich] Starting contract enrichment process...')
  
  try {
    // Find all contracts with relevance_score >= 50 that haven't been scraped recently
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

    console.log(`[Enrich] Found ${contracts.length} contracts to enrich`)

    if (contracts.length === 0) {
      console.log('[Enrich] No contracts need enrichment')
      return
    }

    let successCount = 0
    let errorCount = 0
    const errors: Array<{ id: string; title: string; error: string }> = []

    // Process contracts in batches to avoid overwhelming the server
    const batchSize = 10
    for (let i = 0; i < contracts.length; i += batchSize) {
      const batch = contracts.slice(i, i + batchSize)
      console.log(`[Enrich] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contracts.length / batchSize)} (${batch.length} contracts)`)

      // Process batch in parallel (but limit concurrency)
      const batchPromises = batch.map(async (contract) => {
        try {
          console.log(`[Enrich] Scraping: ${contract.title.substring(0, 60)}... (${contract.url})`)
          
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

          console.log(`[Enrich] ✓ Successfully enriched: ${contract.title.substring(0, 60)}...`)
          successCount++
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error(`[Enrich] ✗ Error enriching ${contract.id} (${contract.title.substring(0, 60)}...):`, errorMessage)
          errors.push({
            id: contract.id,
            title: contract.title,
            error: errorMessage,
          })
          errorCount++
        }
      })

      // Wait for batch to complete
      await Promise.all(batchPromises)

      // Add a small delay between batches to be respectful to the server
      if (i + batchSize < contracts.length) {
        console.log('[Enrich] Waiting 2 seconds before next batch...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    console.log('\n[Enrich] ========================================')
    console.log(`[Enrich] Enrichment complete!`)
    console.log(`[Enrich] Successfully enriched: ${successCount}`)
    console.log(`[Enrich] Errors: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\n[Enrich] Errors encountered:')
      errors.forEach(({ title, error }) => {
        console.log(`  - ${title.substring(0, 60)}...: ${error}`)
      })
    }
    
    console.log('[Enrich] ========================================\n')
  } catch (error) {
    console.error('[Enrich] Fatal error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run if called directly
if (require.main === module) {
  enrichContracts()
    .then(() => {
      console.log('[Enrich] Script completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('[Enrich] Script failed:', error)
      process.exit(1)
    })
}

export { enrichContracts }

