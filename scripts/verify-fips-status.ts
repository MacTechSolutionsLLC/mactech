#!/usr/bin/env tsx
/**
 * FIPS Status Verification Script
 * Verifies FIPS-validated cryptography status for compliance reporting
 * 
 * Usage: npx tsx scripts/verify-fips-status.ts
 */

import { verifyFIPSStatus, getFIPSVerificationReport } from '../lib/fips-verification'

async function main() {
  console.log('FIPS Validation Status Verification')
  console.log('=====================================\n')
  
  const result = verifyFIPSStatus()
  
  console.log(getFIPSVerificationReport())
  
  console.log('\nDetailed Results:')
  console.log(JSON.stringify(result, null, 2))
  
  console.log('\n---')
  console.log('CMVP Certificate Information:')
  if (result.cmvpCertificate) {
    console.log(`Certificate #${result.cmvpCertificate}: OpenSSL FIPS Provider 3.0.8`)
    console.log('Status: Validated (FIPS 140-2)')
    console.log('Sunset Date: September 21, 2026')
  } else {
    console.log('No matching CMVP certificate found for current runtime version')
  }
  
  console.log('\n---')
  console.log('Next Steps:')
  if (result.validationStatus === 'not-validated') {
    console.log('1. Review migration plan: compliance/cmmc/level2/05-evidence/MAC-RPT-124_FIPS_Migration_Plan.md')
    console.log('2. Select migration approach (downgrade to OpenSSL 3.0.8 recommended)')
    console.log('3. Implement migration')
    console.log('4. Verify FIPS mode is configured and active after migration')
  } else if (result.validationStatus === 'validated') {
    console.log('1. Verify FIPS mode is configured and active')
    console.log('2. Document FIPS mode configuration evidence')
    console.log('3. Verify operational environment matches certificate')
    console.log('4. Update compliance documentation')
  }
  
  process.exit(result.validationStatus === 'validated' ? 0 : 1)
}

main().catch((error) => {
  console.error('Error verifying FIPS status:', error)
  process.exit(1)
})
