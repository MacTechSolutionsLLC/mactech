#!/usr/bin/env tsx
/**
 * Railway Cron Job: Inactivity Account Disablement
 * Executes the inactivity disablement job when RUN_INACTIVITY_CRON=true
 * 
 * This script is called by Railway cron (via start-with-migration.js)
 * when the RUN_INACTIVITY_CRON environment variable is set to 'true'.
 * 
 * Railway cron starts the service on schedule, this script runs the job and exits.
 */

import { disableInactiveAccounts } from '../lib/inactivity-disable'

async function main() {
  console.log('🕐 Railway Cron: Inactivity Account Disablement Job')
  console.log('📅 Schedule: Daily at 02:00 UTC (0 2 * * *)')
  console.log('⏰ Started at:', new Date().toISOString())
  console.log('')

  try {
    const result = await disableInactiveAccounts()

    console.log('')
    console.log('📊 Job Results:')
    console.log(`   - Accounts checked: ${result.checked}`)
    console.log(`   - Accounts disabled: ${result.disabled}`)
    console.log(`   - Errors: ${result.errors.length}`)
    
    if (result.errors.length > 0) {
      console.log('')
      console.log('⚠️  Errors encountered:')
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`)
      })
    }

    console.log('')
    console.log('✅ Inactivity cron job completed successfully')
    console.log('⏰ Completed at:', new Date().toISOString())

    // Exit with error code if there were errors
    process.exit(result.errors.length > 0 ? 1 : 0)
  } catch (error: any) {
    console.error('')
    console.error('❌ Inactivity cron job failed:', error.message)
    console.error('⏰ Failed at:', new Date().toISOString())
    console.error('')
    process.exit(1)
  }
}

main()
