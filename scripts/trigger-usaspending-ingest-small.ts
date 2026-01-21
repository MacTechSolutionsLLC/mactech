/**
 * Script to trigger USAspending ingestion with a smaller, lighter query
 * This uses a smaller date range to avoid 500 errors from heavy queries
 * 
 * Usage:
 *   npx tsx scripts/trigger-usaspending-ingest-small.ts
 */

async function triggerSmallIngest() {
  const SMALL_INGEST_API_URL = process.env.API_URL || (process.env.RAILWAY_PUBLIC_DOMAIN 
    ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
    : 'http://localhost:3000')
  const SMALL_INGEST_ENDPOINT = `${SMALL_INGEST_API_URL}/api/admin/capture/usaspending/ingest`
  
  console.log('🚀 Starting USAspending ingestion with smaller query...')
  console.log(`📡 Endpoint: ${SMALL_INGEST_ENDPOINT}`)
  console.log('')

  // Use a smaller date range (last 6 months) to avoid 500 errors
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const today = new Date()
  
  const body = {
    filters: {
      timePeriod: {
        startDate: sixMonthsAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
      }
    },
    pagination: {
      maxPages: 2,  // Only 2 pages
      limitPerPage: 50,  // 50 per page = max 100 awards
    }
  }

  console.log('📋 Query parameters:')
  console.log(`   • Date Range: ${body.filters.timePeriod.startDate} to ${body.filters.timePeriod.endDate}`)
  console.log(`   • Max Pages: ${body.pagination.maxPages}`)
  console.log(`   • Limit Per Page: ${body.pagination.limitPerPage}`)
  console.log('')

  try {
    const startTime = Date.now()
    const response = await fetch(SMALL_INGEST_ENDPOINT, {
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

triggerSmallIngest().catch(console.error)
