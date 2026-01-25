/**
 * Verify all 110 CMMC Level 2 controls have no issues
 * Specifically checks for "Policy prohibition" and "owner identification requirements" issues
 */

import { auditAllControls } from '../lib/compliance/control-audit'

async function main() {
  console.log('Auditing all 110 CMMC Level 2 controls...\n')
  
  const results = await auditAllControls()
  
  // Filter for controls with issues
  const controlsWithIssues = results.filter(r => r.issues.length > 0)
  
  // Check for specific issues we're fixing
  const policyProhibitionIssues = results.filter(r => 
    r.issues.some(i => i.includes('Policy prohibition'))
  )
  
  const ownerIdIssues = results.filter(r => 
    r.issues.some(i => i.includes('owner identification requirements'))
  )
  
  console.log(`Total controls audited: ${results.length}`)
  console.log(`Controls with issues: ${controlsWithIssues.length}`)
  console.log(`Controls with "Policy prohibition" issues: ${policyProhibitionIssues.length}`)
  console.log(`Controls with "owner identification requirements" issues: ${ownerIdIssues.length}\n`)
  
  if (controlsWithIssues.length > 0) {
    console.log('Controls with issues:')
    controlsWithIssues.forEach(control => {
      console.log(`\nControl ${control.controlId}: ${control.requirement}`)
      control.issues.forEach(issue => {
        console.log(`  - ${issue}`)
      })
    })
  } else {
    console.log('✓ All controls have no issues!')
  }
  
  if (policyProhibitionIssues.length > 0) {
    console.log('\n⚠ Controls still with "Policy prohibition" issues:')
    policyProhibitionIssues.forEach(control => {
      console.log(`  - ${control.controlId}: ${control.issues.filter(i => i.includes('Policy prohibition')).join(', ')}`)
    })
  } else {
    console.log('\n✓ No "Policy prohibition" issues found')
  }
  
  if (ownerIdIssues.length > 0) {
    console.log('\n⚠ Controls still with "owner identification requirements" issues:')
    ownerIdIssues.forEach(control => {
      console.log(`  - ${control.controlId}: ${control.issues.filter(i => i.includes('owner identification requirements')).join(', ')}`)
    })
  } else {
    console.log('\n✓ No "owner identification requirements" issues found')
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  if (controlsWithIssues.length === 0) {
    console.log('✅ SUCCESS: All 110 controls have no issues!')
  } else {
    console.log(`⚠ WARNING: ${controlsWithIssues.length} controls still have issues`)
    process.exit(1)
  }
}

main().catch(console.error)
