/**
 * Enrich SCTM with NIST SP 800-171 Exact Text
 * 
 * This script:
 * 1. Parses NIST SP 800-171 document to extract exact requirement text and DISCUSSION sections
 * 2. Updates SCTM table to add two new columns:
 *    - "NIST Requirement (Exact Text)" - verbatim requirement from NIST
 *    - "NIST Discussion / Guidance" - verbatim DISCUSSION section
 * 3. Adds section 17.2 with complete DISCUSSION text for all controls
 * 4. Preserves all existing columns and data
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'
import { parseNISTSP800171, formatForMarkdownCell, getDiscussionPreview } from '../lib/compliance/nist-sp-800-171-parser'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')
const NIST_DOCUMENT_PATH = join(process.cwd(), 'app', 'admin', 'compliance', 'document', 'NIST-SP-800-171')

interface EnrichmentStats {
  totalControls: number
  controlsWithNISTData: number
  controlsWithRequirement: number
  controlsWithDiscussion: number
  controlsMissingNIST: string[]
}

/**
 * Escape markdown table cell content
 */
function escapeCell(content: string): string {
  return content
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format NIST requirement for table cell (truncate if too long)
 */
function formatNISTRequirement(requirement: string, maxLength: number = 150): string {
  if (!requirement) return ''
  const formatted = formatForMarkdownCell(requirement, maxLength)
  return escapeCell(formatted)
}

/**
 * Format NIST discussion for table cell (preview with reference to full text)
 */
function formatNISTDiscussion(discussion: string, controlId: string, maxLength: number = 200): string {
  if (!discussion) return ''
  
  const preview = getDiscussionPreview(discussion, maxLength)
  if (discussion.length > maxLength) {
    return `${preview} [See full DISCUSSION in section 17.2]`
  }
  return escapeCell(preview)
}

/**
 * Update SCTM table with NIST text columns
 */
async function enrichSCTMTable() {
  console.log('='.repeat(80))
  console.log('SCTM Enrichment with NIST SP 800-171 Exact Text')
  console.log('='.repeat(80))
  console.log()

  // Step 1: Parse NIST SP 800-171 document
  console.log('Step 1: Parsing NIST SP 800-171 document...')
  const nistControls = await parseNISTSP800171(NIST_DOCUMENT_PATH)
  console.log(`✓ Extracted ${nistControls.size} controls from NIST document`)
  console.log()

  // Step 2: Read and parse SCTM
  console.log('Step 2: Reading SCTM...')
  const sctmContent = await readFile(SCTM_PATH, 'utf-8')
  const controls = parseSCTM(sctmContent)
  console.log(`✓ Found ${controls.length} controls in SCTM`)
  console.log()

  // Step 3: Match controls and collect statistics
  console.log('Step 3: Matching controls with NIST data...')
  const stats: EnrichmentStats = {
    totalControls: controls.length,
    controlsWithNISTData: 0,
    controlsWithRequirement: 0,
    controlsWithDiscussion: 0,
    controlsMissingNIST: [],
  }

  const enrichedControls = new Map<string, { control: Control; nistData: { requirement: string; discussion: string } | null }>()

  for (const control of controls) {
    const nistData = nistControls.get(control.id)
    
    if (nistData) {
      stats.controlsWithNISTData++
      if (nistData.requirement) stats.controlsWithRequirement++
      if (nistData.discussion) stats.controlsWithDiscussion++
      
      enrichedControls.set(control.id, {
        control,
        nistData: {
          requirement: nistData.requirement,
          discussion: nistData.discussion,
        },
      })
    } else {
      stats.controlsMissingNIST.push(control.id)
      enrichedControls.set(control.id, {
        control,
        nistData: null,
      })
    }
  }

  console.log(`✓ Matched ${stats.controlsWithNISTData}/${stats.totalControls} controls`)
  console.log(`  - Controls with requirement text: ${stats.controlsWithRequirement}`)
  console.log(`  - Controls with discussion text: ${stats.controlsWithDiscussion}`)
  if (stats.controlsMissingNIST.length > 0) {
    console.log(`  ⚠ Controls missing NIST data: ${stats.controlsMissingNIST.join(', ')}`)
  }
  console.log()

  // Step 4: Update SCTM table
  console.log('Step 4: Updating SCTM table with NIST columns...')
  let updatedContent = sctmContent
  const lines = updatedContent.split('\n')
  const updatedLines: string[] = []
  let inTable = false
  let headerUpdated = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Check for table header row
    if (trimmed.startsWith('|') && trimmed.includes('Control ID') && trimmed.includes('Requirement')) {
      inTable = true
      
      // Check if already has NIST columns
      if (trimmed.includes('NIST Requirement')) {
        console.log('  ℹ SCTM table already has NIST columns, skipping header update')
        headerUpdated = true
        updatedLines.push(line)
        continue
      }
      
      // Update header to add NIST columns after "Requirement"
      const headerCells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
      
      if (headerCells.length >= 8) {
        // Insert NIST columns after "Requirement" (index 1)
        const newHeader = [
          headerCells[0], // Control ID
          headerCells[1], // Requirement
          'NIST Requirement (Exact Text)', // New column
          'NIST Discussion / Guidance', // New column
          ...headerCells.slice(2), // Status, Policy, Procedure, Evidence, Implementation, SSP Section
        ]
        
        updatedLines.push(`| ${newHeader.join(' | ')} |`)
        headerUpdated = true
        continue
      }
    }

    // Check for table separator row (---)
    if (trimmed.startsWith('|') && trimmed.match(/\|[\s-]+\|/)) {
      if (headerUpdated && !trimmed.includes('NIST')) {
        // Update separator row to match new column count
        const separatorCells = trimmed
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim())
        
        if (separatorCells.length >= 8) {
          const newSeparator = [
            separatorCells[0], // Control ID separator
            separatorCells[1], // Requirement separator
            '---', // NIST Requirement separator
            '---', // NIST Discussion separator
            ...separatorCells.slice(2), // Rest of separators
          ]
          updatedLines.push(`| ${newSeparator.join(' | ')} |`)
          continue
        }
      }
    }

    // Check for control table rows
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
      
      // Check if this is a control row (starts with control ID pattern)
      if (cells.length >= 8 && cells[0].match(/^\d+\.\d+\.\d+$/)) {
        const controlId = cells[0]
        const enriched = enrichedControls.get(controlId)
        
        if (enriched) {
          // Check if already has NIST columns
          if (cells.length >= 10) {
            // Check if NIST columns are empty and need to be populated
            // Column 2 should be NIST Requirement, Column 3 should be NIST Discussion
            const currentNISTReq = cells[2]?.trim() || ''
            const currentNISTDisc = cells[3]?.trim() || ''
            // Check if NIST columns need enrichment (empty, "---", or contain short requirement text)
            const shortReq = cells[1]?.trim() || ''
            const needsEnrichment = (currentNISTReq === '---' || currentNISTReq === '' || currentNISTReq === shortReq) || 
                                   (currentNISTDisc === '---' || currentNISTDisc === '')
            
            if (needsEnrichment && enriched.nistData && enriched.nistData.requirement) {
              // Find the status column dynamically
              let statusIndex = -1
              for (let i = 0; i < cells.length; i++) {
                const cell = cells[i].trim()
                if (cell.match(/^[✅🔄⚠️❌🚫]/) || 
                    cell.toLowerCase().includes('implemented') ||
                    cell.toLowerCase().includes('inherited') ||
                    cell.toLowerCase().includes('partially') ||
                    cell.toLowerCase().includes('not implemented') ||
                    cell.toLowerCase().includes('not applicable')) {
                  statusIndex = i
                  break
                }
              }
              
              // Update NIST columns (indices 2 and 3) regardless of status position
              const nistRequirement = enriched.nistData.requirement
                ? formatNISTRequirement(enriched.nistData.requirement)
                : (currentNISTReq === '---' ? '' : currentNISTReq)
              const nistDiscussion = enriched.nistData.discussion
                ? formatNISTDiscussion(enriched.nistData.discussion, controlId)
                : (currentNISTDisc === '---' ? '' : currentNISTDisc)
              
              // Create updated cells array
              const updatedCells = [...cells]
              updatedCells[2] = nistRequirement || '---'
              updatedCells[3] = nistDiscussion || '---'
              
              // Reconstruct the row with updated NIST columns
              updatedLines.push(`| ${updatedCells.join(' | ')} |`)
              continue
            }
            
            // Already enriched, just keep as is
            updatedLines.push(line)
            continue
          }
          
          // Add NIST columns after "Requirement" (index 1)
          const nistRequirement = enriched.nistData 
            ? formatNISTRequirement(enriched.nistData.requirement)
            : ''
          const nistDiscussion = enriched.nistData
            ? formatNISTDiscussion(enriched.nistData.discussion, controlId)
            : ''
          
          const newRow = [
            cells[0], // Control ID
            cells[1], // Requirement
            nistRequirement, // NIST Requirement (Exact Text)
            nistDiscussion, // NIST Discussion / Guidance
            cells[2], // Status
            cells[3], // Policy
            cells[4], // Procedure
            cells[5], // Evidence
            cells[6], // Implementation
            cells[7], // SSP Section
          ]
          
          updatedLines.push(`| ${newRow.join(' | ')} |`)
          continue
        }
      }
    }

    // Keep all other lines as-is
    updatedLines.push(line)
  }

  updatedContent = updatedLines.join('\n')
  console.log(`✓ Updated SCTM table with NIST columns`)
  console.log()

  // Step 5: Add section 17.2 with full DISCUSSION text
  console.log('Step 5: Adding section 17.2 with complete DISCUSSION text...')
  
  // Find where to insert section 17.2 (after section 17.1)
  const section171Match = updatedContent.match(/(## 17\.1[^\n]*\n[^#]*)/)
  let discussionSection = '\n\n---\n\n## 17.2. NIST SP 800-171 Discussion Sections (Complete Text)\n\n'
  discussionSection += 'This section provides the complete verbatim DISCUSSION text from NIST SP 800-171 Rev. 2 for all controls. '
  discussionSection += 'The DISCUSSION sections provide technical guidance and interpretation to facilitate implementation and assessment.\n\n'
  discussionSection += '**Reference:** NIST SP 800-171 Rev. 2, Protecting Controlled Unclassified Information in Nonfederal Systems and Organizations\n\n'
  
  // Organize by control family
  const familyOrder = ['AC', 'AT', 'AU', 'CM', 'IA', 'IR', 'MA', 'MP', 'PS', 'PE', 'RA', 'CA', 'SC', 'SI']
  const controlsByFamily = new Map<string, Array<{ control: Control; nistData: { requirement: string; discussion: string } | null }>>()
  
  enrichedControls.forEach((enriched) => {
    const family = enriched.control.family
    if (!controlsByFamily.has(family)) {
      controlsByFamily.set(family, [])
    }
    controlsByFamily.get(family)!.push(enriched)
  })
  
  // Sort controls within each family by control ID
  for (const family of familyOrder) {
    const familyControls = controlsByFamily.get(family)
    if (!familyControls || familyControls.length === 0) continue
    
    familyControls.sort((a, b) => a.control.id.localeCompare(b.control.id))
    
    discussionSection += `### ${family} - ${getFamilyName(family)}\n\n`
    
    for (const { control, nistData } of familyControls) {
      if (!nistData || !nistData.discussion) {
        continue // Skip controls without discussion
      }
      
      discussionSection += `<details>\n`
      discussionSection += `<summary><strong>${control.id}</strong> - ${control.requirement}</summary>\n\n`
      discussionSection += `**NIST SP 800-171 Rev. 2, Section ${control.id}**\n\n`
      discussionSection += `**Requirement:**\n${nistData.requirement}\n\n`
      discussionSection += `**DISCUSSION:**\n\n${nistData.discussion}\n\n`
      discussionSection += `</details>\n\n`
    }
  }
  
  // Insert section 17.2 after section 17.1
  if (section171Match) {
    const insertPosition = section171Match.index! + section171Match[0].length
    updatedContent = 
      updatedContent.substring(0, insertPosition) + 
      discussionSection + 
      updatedContent.substring(insertPosition)
    console.log('✓ Added section 17.2 with complete DISCUSSION text')
  } else {
    // Append at end if section 17.1 not found
    updatedContent += discussionSection
    console.log('✓ Added section 17.2 at end of document')
  }
  console.log()

  // Step 6: Update document header with attribution
  console.log('Step 6: Updating document header with NIST attribution...')
  const attributionNote = '\n**NIST SP 800-171 Text:** The "NIST Requirement (Exact Text)" and "NIST Discussion / Guidance" columns contain verbatim text from NIST SP 800-171 Rev. 2. This text is provided for assessor reference and does not modify or extend the requirements.\n'
  
  // Find the "## 2. Matrix Structure" section and add note after it
  const matrixStructureMatch = updatedContent.match(/(## 2\. Matrix Structure[^\n]*\n[^#]*)/)
  if (matrixStructureMatch) {
    const insertPosition = matrixStructureMatch.index! + matrixStructureMatch[0].length
    updatedContent = 
      updatedContent.substring(0, insertPosition) + 
      attributionNote + 
      updatedContent.substring(insertPosition)
    console.log('✓ Added NIST attribution note')
  }
  console.log()

  // Step 7: Write updated SCTM
  console.log('Step 7: Writing updated SCTM...')
  await writeFile(SCTM_PATH, updatedContent, 'utf-8')
  console.log(`✓ SCTM updated: ${SCTM_PATH}`)
  console.log()

  // Final summary
  console.log('='.repeat(80))
  console.log('Enrichment Complete!')
  console.log('='.repeat(80))
  console.log()
  console.log('Summary:')
  console.log(`  ✓ Total controls: ${stats.totalControls}`)
  console.log(`  ✓ Controls with NIST data: ${stats.controlsWithNISTData}`)
  console.log(`  ✓ Controls with requirement text: ${stats.controlsWithRequirement}`)
  console.log(`  ✓ Controls with discussion text: ${stats.controlsWithDiscussion}`)
  if (stats.controlsMissingNIST.length > 0) {
    console.log(`  ⚠ Controls missing NIST data: ${stats.controlsMissingNIST.length}`)
  }
  console.log(`  ✓ SCTM table updated with 2 new columns`)
  console.log(`  ✓ Section 17.2 added with complete DISCUSSION text`)
  console.log()
}

/**
 * Get family name from code
 */
function getFamilyName(familyCode: string): string {
  const familyNames: Record<string, string> = {
    'AC': 'Access Control',
    'AT': 'Awareness and Training',
    'AU': 'Audit and Accountability',
    'CM': 'Configuration Management',
    'IA': 'Identification and Authentication',
    'IR': 'Incident Response',
    'MA': 'Maintenance',
    'MP': 'Media Protection',
    'PS': 'Personnel Security',
    'PE': 'Physical Protection',
    'RA': 'Risk Assessment',
    'CA': 'Security Assessment',
    'SC': 'System and Communications Protection',
    'SI': 'System and Information Integrity',
  }
  return familyNames[familyCode] || familyCode
}

// Run the enrichment
if (require.main === module) {
  enrichSCTMTable()
    .then(() => {
      console.log('Enrichment completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error during enrichment:', error)
      process.exit(1)
    })
}

export { enrichSCTMTable }
