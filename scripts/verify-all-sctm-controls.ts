/**
 * Comprehensive SCTM Verification Script
 * Verifies all 81 "Implemented" controls against codebase
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'

const SCTM_PATH = join(
  process.cwd(),
  'compliance',
  'cmmc',
  'level2',
  '04-self-assessment',
  'MAC-AUD-408_System_Control_Traceability_Matrix.md'
)

interface VerificationResult {
  controlId: string
  requirement: string
  status: 'verified' | 'needs_review' | 'not_found' | 'documentation_only'
  codeFiles: string[]
  evidenceFiles: string[]
  notes: string[]
}

async function verifyControl(control: Control): Promise<VerificationResult> {
  const result: VerificationResult = {
    controlId: control.id,
    requirement: control.requirement,
    status: 'needs_review',
    codeFiles: [],
    evidenceFiles: [],
    notes: [],
  }

  // Extract implementation references from SCTM
  const implementation = control.implementation || ''
  const evidence = control.evidence || ''
  
  // Check code files mentioned
  const codeRefs = [
    ...implementation.split(',').map(s => s.trim()),
    ...evidence.split(',').map(s => s.trim()),
  ].filter(ref => 
    ref.includes('.ts') || 
    ref.includes('.tsx') || 
    ref.includes('.js') || 
    ref.includes('middleware') ||
    ref.includes('lib/') ||
    ref.includes('app/') ||
    ref.includes('components/')
  )

  for (const ref of codeRefs) {
    // Clean up references
    let filePath = ref
      .replace(/^`/, '')
      .replace(/`$/, '')
      .replace(/^\.\//, '')
      .trim()

    // Handle common patterns
    if (filePath.includes('(') || filePath.includes(')')) {
      filePath = filePath.split('(')[0].split(')')[0].trim()
    }
    if (filePath.includes(' ')) {
      filePath = filePath.split(' ')[0]
    }

    // Check if file exists
    if (filePath && !filePath.includes('Evidence') && !filePath.includes('Policy')) {
      const fullPath = join(process.cwd(), filePath)
      if (existsSync(fullPath)) {
        result.codeFiles.push(filePath)
      } else {
        // Try common variations
        const variations = [
          filePath,
          filePath.replace(/^lib\//, 'lib/'),
          filePath.replace(/^app\//, 'app/'),
          filePath.replace(/^components\//, 'components/'),
        ]
        let found = false
        for (const variant of variations) {
          const variantPath = join(process.cwd(), variant)
          if (existsSync(variantPath)) {
            result.codeFiles.push(variant)
            found = true
            break
          }
        }
        if (!found && filePath.length > 0) {
          result.notes.push(`Code reference not found: ${ref}`)
        }
      }
    }
  }

  // Check evidence files
  const evidenceRefs = [
    ...evidence.split(',').map(s => s.trim()),
    ...implementation.split(',').map(s => s.trim()),
  ].filter(ref => 
    ref.includes('.md') || 
    ref.includes('Evidence') ||
    ref.includes('MAC-RPT') ||
    ref.includes('MAC-POL') ||
    ref.includes('MAC-SOP')
  )

  for (const ref of evidenceRefs) {
    let filePath = ref
      .replace(/^`/, '')
      .replace(/`$/, '')
      .replace(/^\.\.\//, 'compliance/cmmc/level2/')
      .trim()

    if (filePath.includes('(') || filePath.includes(')')) {
      filePath = filePath.split('(')[0].split(')')[0].trim()
    }

    const fullPath = join(process.cwd(), filePath)
    if (existsSync(fullPath)) {
      result.evidenceFiles.push(filePath)
    } else {
      // Try to find in evidence directory
      const evidencePath = join(process.cwd(), 'compliance', 'cmmc', 'level2', '05-evidence', filePath.split('/').pop() || '')
      if (existsSync(evidencePath)) {
        result.evidenceFiles.push(evidencePath.replace(process.cwd() + '/', ''))
      } else {
        result.notes.push(`Evidence reference may not exist: ${ref}`)
      }
    }
  }

  // Determine status
  if (result.codeFiles.length > 0) {
    result.status = 'verified'
  } else if (result.evidenceFiles.length > 0 && control.family === 'AT') {
    // Awareness and Training may be documentation-only
    result.status = 'documentation_only'
  } else if (result.evidenceFiles.length > 0) {
    result.status = 'needs_review'
    result.notes.push('Has evidence but code references need verification')
  } else {
    result.status = 'not_found'
    result.notes.push('No code or evidence files found')
  }

  return result
}

async function main() {
  console.log('Comprehensive SCTM Verification - All 81 Implemented Controls\n')
  
  const sctmContent = await readFile(SCTM_PATH, 'utf-8')
  const controls = parseSCTM(sctmContent)
  
  // Filter to only "Implemented" controls
  const implementedControls = controls.filter(c => c.status === 'implemented')
  
  console.log(`Found ${implementedControls.length} "Implemented" controls\n`)
  console.log('Verifying each control...\n')
  
  const results: VerificationResult[] = []
  
  for (const control of implementedControls) {
    const result = await verifyControl(control)
    results.push(result)
    
    const statusIcon = result.status === 'verified' ? '✅' : 
                      result.status === 'documentation_only' ? '📄' :
                      result.status === 'needs_review' ? '⚠️' : '❌'
    console.log(`${statusIcon} ${control.id}: ${control.requirement.substring(0, 60)}...`)
  }
  
  // Generate report
  const verified = results.filter(r => r.status === 'verified').length
  const needsReview = results.filter(r => r.status === 'needs_review').length
  const documentationOnly = results.filter(r => r.status === 'documentation_only').length
  const notFound = results.filter(r => r.status === 'not_found').length
  
  let report = `# Comprehensive SCTM Verification Report - All 81 Implemented Controls\n\n`
  report += `**Date:** ${new Date().toISOString()}\n\n`
  report += `## Summary\n\n`
  report += `**Total Controls Verified:** ${implementedControls.length}\n\n`
  report += `**Verification Results:**\n`
  report += `- ✅ **Verified (Code Found):** ${verified} (${Math.round((verified/implementedControls.length)*100)}%)\n`
  report += `- 📄 **Documentation Only (Expected):** ${documentationOnly} (${Math.round((documentationOnly/implementedControls.length)*100)}%)\n`
  report += `- ⚠️ **Needs Review:** ${needsReview} (${Math.round((needsReview/implementedControls.length)*100)}%)\n`
  report += `- ❌ **Not Found:** ${notFound} (${Math.round((notFound/implementedControls.length)*100)}%)\n\n`
  
  report += `## Detailed Results\n\n`
  
  // Group by status
  const byStatus = {
    verified: results.filter(r => r.status === 'verified'),
    documentation_only: results.filter(r => r.status === 'documentation_only'),
    needs_review: results.filter(r => r.status === 'needs_review'),
    not_found: results.filter(r => r.status === 'not_found'),
  }
  
  for (const [status, controls] of Object.entries(byStatus)) {
    if (controls.length === 0) continue
    
    const statusLabel = status === 'verified' ? '✅ Verified' :
                       status === 'documentation_only' ? '📄 Documentation Only' :
                       status === 'needs_review' ? '⚠️ Needs Review' : '❌ Not Found'
    
    report += `### ${statusLabel} (${controls.length} controls)\n\n`
    
    for (const result of controls) {
      report += `#### ${result.controlId}: ${result.requirement}\n\n`
      
      if (result.codeFiles.length > 0) {
        report += `**Code Files:**\n`
        for (const file of result.codeFiles) {
          report += `- \`${file}\`\n`
        }
        report += `\n`
      }
      
      if (result.evidenceFiles.length > 0) {
        report += `**Evidence Files:**\n`
        for (const file of result.evidenceFiles) {
          report += `- \`${file}\`\n`
        }
        report += `\n`
      }
      
      if (result.notes.length > 0) {
        report += `**Notes:**\n`
        for (const note of result.notes) {
          report += `- ${note}\n`
        }
        report += `\n`
      }
      
      report += `---\n\n`
    }
  }
  
  const reportPath = join(process.cwd(), 'compliance', 'cmmc', 'COMPREHENSIVE_SCTM_VERIFICATION.md')
  await require('fs/promises').writeFile(reportPath, report, 'utf-8')
  
  console.log(`\n=== Verification Complete ===\n`)
  console.log(`✅ Verified: ${verified}`)
  console.log(`📄 Documentation Only: ${documentationOnly}`)
  console.log(`⚠️ Needs Review: ${needsReview}`)
  console.log(`❌ Not Found: ${notFound}`)
  console.log(`\nReport written to: ${reportPath}`)
}

main().catch(console.error)
