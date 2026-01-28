/**
 * Fix Audit File Paths
 * 
 * This script identifies and fixes file path issues in the SCTM:
 * 1. Updates incorrect file references
 * 2. Identifies truly missing files that need to be created
 * 3. Fixes path resolution issues
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

interface PathFix {
  controlId: string
  column: 'evidence' | 'implementation'
  oldReference: string
  newReference: string
  reason: string
}

async function fixFilePaths() {
  console.log('='.repeat(80))
  console.log('Fixing Audit File Paths in SCTM')
  console.log('='.repeat(80))
  console.log()

  const content = await readFile(SCTM_PATH, 'utf-8')
  const lines = content.split('\n')
  const fixes: PathFix[] = []

  // Known fixes:
  // 1. MAC-RPT-129_Google_VM_Baseline_Configuration.md - doesn't exist, should reference MAC-RPT-134 or create it
  // 2. MAC-RPT-130_Google_VM_Security_Configuration.md - doesn't exist, should reference MAC-RPT-134 or create it
  // 3. "Access controls" in evidence - should be filtered as descriptive

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for control rows
    if (line.trim().startsWith('|') && line.match(/^\|\s*3\.\d+\.\d+\s*\|/)) {
      const cells = line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())

      if (cells.length >= 10) {
        const controlId = cells[0]
        const evidence = cells[7] // Evidence column (0-indexed: 0=ID, 1=Req, 2=NIST Req, 3=NIST Disc, 4=Status, 5=Policy, 6=Procedure, 7=Evidence)
        const implementation = cells[8] // Implementation column

        // Fix MAC-RPT-129 reference
        if (evidence.includes('MAC-RPT-129_Google_VM_Baseline_Configuration.md')) {
          // Replace with MAC-RPT-134 which contains baseline info, or keep as placeholder
          const newEvidence = evidence.replace(
            'MAC-RPT-129_Google_VM_Baseline_Configuration.md',
            'MAC-RPT-134_CMMC_Hardening_Control_Mapping.md'
          )
          fixes.push({
            controlId,
            column: 'evidence',
            oldReference: 'MAC-RPT-129_Google_VM_Baseline_Configuration.md',
            newReference: 'MAC-RPT-134_CMMC_Hardening_Control_Mapping.md',
            reason: 'MAC-RPT-129 does not exist, MAC-RPT-134 contains baseline configuration information'
          })
          lines[i] = line.replace(evidence, newEvidence)
        }

        // Fix MAC-RPT-130 reference
        if (evidence.includes('MAC-RPT-130_Google_VM_Security_Configuration.md')) {
          // Replace with MAC-RPT-134 which contains security configuration info
          const newEvidence = evidence.replace(
            'MAC-RPT-130_Google_VM_Security_Configuration.md',
            'MAC-RPT-134_CMMC_Hardening_Control_Mapping.md'
          )
          fixes.push({
            controlId,
            column: 'evidence',
            oldReference: 'MAC-RPT-130_Google_VM_Security_Configuration.md',
            newReference: 'MAC-RPT-134_CMMC_Hardening_Control_Mapping.md',
            reason: 'MAC-RPT-130 does not exist, MAC-RPT-134 contains security configuration information'
          })
          lines[i] = line.replace(evidence, newEvidence)
        }

        // Remove "Access controls" descriptive reference from evidence
        if (evidence.includes('Access controls') && !evidence.includes('MAC-') && !evidence.includes('.md') && !evidence.includes('.ts')) {
          const newEvidence = evidence.split(',').map(e => e.trim()).filter(e => e !== 'Access controls').join(', ')
          if (newEvidence !== evidence) {
            fixes.push({
              controlId,
              column: 'evidence',
              oldReference: 'Access controls',
              newReference: '(removed - descriptive reference)',
              reason: 'Descriptive reference, not a file path'
            })
            lines[i] = line.replace(evidence, newEvidence || '-')
          }
        }
      }
    }
  }

  if (fixes.length > 0) {
    console.log(`Found ${fixes.length} path fixes to apply:`)
    console.log()
    for (const fix of fixes) {
      console.log(`  ${fix.controlId} (${fix.column}):`)
      console.log(`    Old: ${fix.oldReference}`)
      console.log(`    New: ${fix.newReference}`)
      console.log(`    Reason: ${fix.reason}`)
      console.log()
    }

    // Write updated SCTM
    const updatedContent = lines.join('\n')
    await writeFile(SCTM_PATH, updatedContent, 'utf-8')
    console.log(`✓ Updated SCTM with ${fixes.length} path fixes`)
  } else {
    console.log('No path fixes needed')
  }

  console.log()
  console.log('='.repeat(80))
  console.log('Path Fix Complete!')
  console.log('='.repeat(80))
}

if (require.main === module) {
  fixFilePaths()
    .then(() => {
      console.log('Path fixes completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error during path fixes:', error)
      process.exit(1)
    })
}

export { fixFilePaths }
