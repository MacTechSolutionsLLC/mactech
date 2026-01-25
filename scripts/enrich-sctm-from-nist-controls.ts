/**
 * Enrich SCTM with NIST Control Information
 * 
 * This script extracts comprehensive information from all 110 NIST SP 800-171 control
 * assessment files and enriches the System Control Traceability Matrix (SCTM) by:
 * 1. Enhancing existing Implementation and Evidence columns
 * 2. Adding a detailed enrichment section with comprehensive information
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'
import { parseAllNISTControls, NISTControlData } from '../lib/compliance/nist-control-parser'
import {
  enhanceImplementationColumn,
  enhanceEvidenceColumn,
  addEnrichmentSection,
  ControlEnrichment,
} from '../lib/compliance/sctm-writer'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2')
const NIST_CONTROLS_DIR = join(COMPLIANCE_ROOT, '07-nist-controls')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

interface EnrichmentStats {
  totalControls: number
  controlsWithNISTData: number
  controlsWithEnhancedImplementation: number
  controlsWithEnhancedEvidence: number
  controlsWithTestingInfo: number
  controlsWithAssessmentNotes: number
  controlsWithCodeFiles: number
}

/**
 * Main enrichment function
 */
async function enrichSCTM() {
  console.log('='.repeat(80))
  console.log('SCTM Enrichment from NIST Control Files')
  console.log('='.repeat(80))
  console.log()

  // Step 1: Read and parse SCTM
  console.log('Step 1: Reading SCTM...')
  const sctmContent = await readFile(SCTM_PATH, 'utf-8')
  const controls = parseSCTM(sctmContent)
  console.log(`✓ Found ${controls.length} controls in SCTM`)
  console.log()

  // Step 2: Parse all NIST control files
  console.log('Step 2: Parsing NIST control files...')
  const nistControls = await parseAllNISTControls(NIST_CONTROLS_DIR)
  console.log(`✓ Parsed ${nistControls.size} NIST control files`)
  console.log()

  // Step 3: Match and enrich controls
  console.log('Step 3: Matching controls and extracting enrichment data...')
  const enrichmentData = new Map<string, ControlEnrichment>()
  const stats: EnrichmentStats = {
    totalControls: controls.length,
    controlsWithNISTData: 0,
    controlsWithEnhancedImplementation: 0,
    controlsWithEnhancedEvidence: 0,
    controlsWithTestingInfo: 0,
    controlsWithAssessmentNotes: 0,
    controlsWithCodeFiles: 0,
  }

  for (const control of controls) {
    const nistData = nistControls.get(control.id)
    
    if (!nistData) {
      console.log(`  ⚠ Control ${control.id} not found in NIST files`)
      continue
    }

    stats.controlsWithNISTData++

    // Enhance columns
    const enhancedImplementation = enhanceImplementationColumn(control, nistData)
    const enhancedEvidence = enhanceEvidenceColumn(control, nistData)

    // Track enhancements
    if (enhancedImplementation !== control.implementation) {
      stats.controlsWithEnhancedImplementation++
    }
    if (enhancedEvidence !== control.evidence) {
      stats.controlsWithEnhancedEvidence++
    }
    if (nistData.testing.methods.length > 0 || nistData.testing.results.length > 0) {
      stats.controlsWithTestingInfo++
    }
    if (nistData.assessment.openItems.length > 0 || nistData.assessment.assessorNotes) {
      stats.controlsWithAssessmentNotes++
    }
    if (nistData.implementation.codeFiles.length > 0) {
      stats.controlsWithCodeFiles++
    }

    // Store enrichment data
    enrichmentData.set(control.id, {
      controlId: control.id,
      enhancedImplementation,
      enhancedEvidence,
      detailedInfo: nistData,
    })

    console.log(`  ✓ Processed control ${control.id}`)
  }

  console.log()
  console.log('Enrichment Statistics:')
  console.log(`  Total controls: ${stats.totalControls}`)
  console.log(`  Controls with NIST data: ${stats.controlsWithNISTData}`)
  console.log(`  Controls with enhanced implementation: ${stats.controlsWithEnhancedImplementation}`)
  console.log(`  Controls with enhanced evidence: ${stats.controlsWithEnhancedEvidence}`)
  console.log(`  Controls with testing info: ${stats.controlsWithTestingInfo}`)
  console.log(`  Controls with assessment notes: ${stats.controlsWithAssessmentNotes}`)
  console.log(`  Controls with code files: ${stats.controlsWithCodeFiles}`)
  console.log()

  // Step 4: Update SCTM table columns
  console.log('Step 4: Updating SCTM table columns...')
  let updatedContent = sctmContent
  const lines = updatedContent.split('\n')
  let updatedLines: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this is a control table row
    if (line.trim().startsWith('|') && line.includes('|')) {
      const cells = line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
      
      if (cells.length >= 8) {
        const [id] = cells
        // Check if this is a control ID (format: X.Y.Z)
        if (id.match(/^\d+\.\d+\.\d+$/)) {
          const enrichment = enrichmentData.get(id)
          
          if (enrichment) {
            // Update Implementation column (index 6) and Evidence column (index 5)
            const [controlId, requirement, status, policy, procedure, evidence, implementation, sspSection] = cells
            
            // Escape pipes in cell content
            const escapeCell = (cell: string) => cell.replace(/\|/g, '\\|')
            
            const updatedRow = `| ${escapeCell(controlId)} | ${escapeCell(requirement)} | ${escapeCell(status)} | ${escapeCell(policy)} | ${escapeCell(procedure)} | ${escapeCell(enrichment.enhancedEvidence)} | ${escapeCell(enrichment.enhancedImplementation)} | ${escapeCell(sspSection)} |`
            updatedLines.push(updatedRow)
            continue
          }
        }
      }
    }
    
    updatedLines.push(line)
  }

  updatedContent = updatedLines.join('\n')
  console.log(`✓ Updated ${stats.controlsWithEnhancedImplementation + stats.controlsWithEnhancedEvidence} control columns`)
  console.log()

  // Step 5: Add enrichment section
  console.log('Step 5: Adding enrichment section...')
  updatedContent = addEnrichmentSection(updatedContent, enrichmentData)
  console.log('✓ Added enrichment section with detailed information')
  console.log()

  // Step 6: Write updated SCTM
  console.log('Step 6: Writing updated SCTM...')
  await writeFile(SCTM_PATH, updatedContent, 'utf-8')
  console.log(`✓ SCTM updated: ${SCTM_PATH}`)
  console.log()

  // Final summary
  console.log('='.repeat(80))
  console.log('Enrichment Complete!')
  console.log('='.repeat(80))
  console.log()
  console.log('Summary:')
  console.log(`  ✓ Enhanced ${stats.controlsWithEnhancedImplementation} implementation columns`)
  console.log(`  ✓ Enhanced ${stats.controlsWithEnhancedEvidence} evidence columns`)
  console.log(`  ✓ Added detailed enrichment section for ${enrichmentData.size} controls`)
  console.log(`  ✓ SCTM file updated successfully`)
  console.log()
}

// Run the enrichment
if (require.main === module) {
  enrichSCTM()
    .then(() => {
      console.log('Enrichment completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error during enrichment:', error)
      process.exit(1)
    })
}

export { enrichSCTM }
