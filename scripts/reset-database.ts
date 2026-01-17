/**
 * Database Reset Script
 * Resets the database for a fresh ingestion run with 3-tier API enrichment
 * 
 * Usage: DATABASE_URL=... npx tsx scripts/reset-database.ts
 * Or: npx tsx scripts/reset-database.ts (if DATABASE_URL is in environment)
 */

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL environment variable is not set')
  console.error('   Please set DATABASE_URL before running this script')
  console.error('   Example: DATABASE_URL=postgresql://... npx tsx scripts/reset-database.ts')
  process.exit(1)
}

import { prisma } from '../lib/prisma'

async function resetDatabase() {
  console.log('🔄 Starting database reset...\n')

  try {
    // Step 1: Reset IngestionStatus to 'idle' (kill stuck running status)
    console.log('1️⃣  Resetting ingestion status...')
    const statusResult = await prisma.ingestionStatus.updateMany({
      data: {
        status: 'idle',
        sam_gov_outage: false,
        sam_gov_outage_reason: null,
        sam_gov_outage_detected_at: null,
        sam_gov_outage_resolved_at: null,
        last_error: null,
      },
    })
    console.log(`   ✅ Reset ${statusResult.count} ingestion status record(s)\n`)

    // Step 2: Delete OpportunityAwardLink records (cascades automatically, but explicit for clarity)
    console.log('2️⃣  Deleting opportunity-award links...')
    const linksResult = await prisma.opportunityAwardLink.deleteMany({})
    console.log(`   ✅ Deleted ${linksResult.count} opportunity-award link(s)\n`)

    // Step 3: Delete IgnoredOpportunity records
    console.log('3️⃣  Deleting ignored opportunities...')
    const ignoredResult = await prisma.ignoredOpportunity.deleteMany({})
    console.log(`   ✅ Deleted ${ignoredResult.count} ignored opportunity record(s)\n`)

    // Step 4: Delete all GovernmentContractDiscovery records
    console.log('4️⃣  Deleting all contracts...')
    const contractsResult = await prisma.governmentContractDiscovery.deleteMany({})
    console.log(`   ✅ Deleted ${contractsResult.count} contract record(s)\n`)

    // Step 5: Verify UsaSpendingAward records are preserved
    console.log('5️⃣  Verifying USAspending awards (preserved)...')
    const awardsCount = await prisma.usaSpendingAward.count()
    console.log(`   ✅ Preserved ${awardsCount} USAspending award record(s)\n`)

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ Database reset complete!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   • Ingestion status: Reset to 'idle'`)
    console.log(`   • Contracts deleted: ${contractsResult.count}`)
    console.log(`   • Links deleted: ${linksResult.count}`)
    console.log(`   • Ignored opportunities deleted: ${ignoredResult.count}`)
    console.log(`   • USAspending awards preserved: ${awardsCount}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log('🚀 Database is ready for 3-tier API ingestion:')
    console.log('   1. SAM.gov Opportunities API')
    console.log('   2. USAspending.gov API (auto-enrichment)')
    console.log('   3. SAM.gov Entity API (vendor metadata)\n')
    console.log('💡 Next step: Click "Run Ingest" in the dashboard\n')

  } catch (error) {
    console.error('❌ Error resetting database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('✅ Reset script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Reset script failed:', error)
    process.exit(1)
  })

