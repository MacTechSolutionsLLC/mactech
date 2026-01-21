/**
 * Script to trigger USAspending and SAM.gov Entity API ingestion
 * 
 * Usage:
 *   npx tsx scripts/trigger-usaspending-ingest.ts
 * 
 * Or with custom filters:
 *   npx tsx scripts/trigger-usaspending-ingest.ts --maxPages 3 --limitPerPage 50
 * 
 * Note: Uses built-in fetch (Node.js 18+)
 */

const API_URL = process.env.API_URL || 'http://localhost:3000'
const INGEST_ENDPOINT = `${API_URL}/api/admin/capture/usaspending/ingest`

interface IngestOptions {
  maxPages?: number
  limitPerPage?: number
  timePeriod?: {
    startDate: string
    endDate: string
  }
}

async function triggerIngest(options: IngestOptions = {}) {
  console.log('🚀 Starting USAspending and SAM.gov Entity API ingestion...')
  console.log(`📡 Endpoint: ${INGEST_ENDPOINT}`)
  console.log('')

  const body: any = {}
  
  if (options.maxPages || options.limitPerPage) {
    body.pagination = {}
    if (options.maxPages) body.pagination.maxPages = options.maxPages
    if (options.limitPerPage) body.pagination.limitPerPage = options.limitPerPage
  }
  
  if (options.timePeriod) {
    body.filters = {
      timePeriod: options.timePeriod
    }
  }

  try {
    const startTime = Date.now()
    const response = await fetch(INGEST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    if (!response.ok || !data.success) {
      console.error('❌ Ingestion failed:')
      console.error(JSON.stringify(data, null, 2))
      process.exit(1)
    }

    console.log('✅ Ingestion completed successfully!')
    console.log(`⏱️  Duration: ${duration}s`)
    console.log('')
    console.log('📊 Results:')
    console.log(`   • Total Saved: ${data.total || 0} awards`)
    console.log(`   • Enriched: ${data.enriched || 0} awards`)
    console.log(`   • Awards Returned: ${data.awards?.length || 0} awards`)
    
    // Note: Entity enrichment happens during enrichment step, stats may not be in response
    if (data.entityEnrichment) {
      console.log('')
      console.log('🏢 SAM.gov Entity API Enrichment:')
      console.log(`   • Enriched: ${data.entityEnrichment.enriched || 0} vendors`)
      console.log(`   • Failed: ${data.entityEnrichment.failed || 0}`)
      console.log(`   • Skipped: ${data.entityEnrichment.skipped || 0}`)
    }
    
    if (data.errors && data.errors.length > 0) {
      console.log('')
      console.log('⚠️  Warnings/Errors:')
      data.errors.slice(0, 5).forEach((error: string) => {
        console.log(`   • ${error}`)
      })
      if (data.errors.length > 5) {
        console.log(`   ... and ${data.errors.length - 5} more`)
      }
    }

    console.log('')
    console.log('🎉 Ingestion complete! Check the admin portal to view the awards.')
  } catch (error) {
    console.error('❌ Error triggering ingestion:')
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const options: IngestOptions = {}

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--maxPages' && args[i + 1]) {
    options.maxPages = parseInt(args[i + 1], 10)
    i++
  } else if (args[i] === '--limitPerPage' && args[i + 1]) {
    options.limitPerPage = parseInt(args[i + 1], 10)
    i++
  } else if (args[i] === '--startDate' && args[i + 1] && args[i + 2] === '--endDate' && args[i + 3]) {
    options.timePeriod = {
      startDate: args[i + 1],
      endDate: args[i + 3],
    }
    i += 3
  }
}

// Run ingestion
triggerIngest(options).catch(console.error)
