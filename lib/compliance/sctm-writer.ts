/**
 * SCTM Writer Utility
 * Updates the System Control Traceability Matrix markdown file with control changes
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Control } from './sctm-parser'
import { NISTControlData } from './nist-control-parser'

// Map status types to emojis
const STATUS_EMOJI_MAP: Record<string, string> = {
  'implemented': '✅',
  'inherited': '🔄',
  'partially_satisfied': '⚠️',
  'not_implemented': '❌',
  'not_applicable': '🚫',
}

// Map status types to display text
const STATUS_TEXT_MAP: Record<string, string> = {
  'implemented': 'Implemented',
  'inherited': 'Inherited',
  'partially_satisfied': 'Partially Satisfied',
  'not_implemented': 'Not Implemented',
  'not_applicable': 'Not Applicable',
}

/**
 * Get the SCTM markdown file path
 */
function getSCTMFilePath(): string {
  return join(
    process.cwd(),
    'compliance',
    'cmmc',
    'level2',
    '04-self-assessment',
    'MAC-AUD-408_System_Control_Traceability_Matrix.md'
  )
}

/**
 * Format a cell value for markdown table (escape pipes and preserve formatting)
 */
function formatCell(value: string): string {
  // Trim whitespace but don't escape pipes here (we'll do it in the row construction)
  return value.trim()
}

/**
 * Update a control in the SCTM markdown file
 */
export async function updateControlInSCTM(
  controlId: string,
  updates: Partial<Control>
): Promise<void> {
  const filePath = getSCTMFilePath()
  
  // Read the markdown file
  const content = await readFile(filePath, 'utf-8')
  const lines = content.split('\n')
  
  let foundControl = false
  let controlLineIndex = -1
  
  // Find the control row
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check if this is a table row
    if (line.trim().startsWith('|') && line.includes('|')) {
      // Parse the row to check if it matches the control ID
      const cells = line
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map(cell => cell.trim())
      
      if (cells.length >= 8) {
        const [id] = cells
        // Check if this is the control we're looking for
        if (id.trim() === controlId) {
          foundControl = true
          controlLineIndex = i
          break
        }
      }
    }
  }
  
  if (!foundControl || controlLineIndex === -1) {
    throw new Error(`Control ${controlId} not found in SCTM`)
  }
  
  // Parse the existing row
  const existingLine = lines[controlLineIndex]
  const cells = existingLine
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
  
  if (cells.length < 8) {
    throw new Error(`Invalid control row format for ${controlId}`)
  }
  
  // Update cells based on updates object
  // Column order: Control ID, Requirement, Status, Policy, Procedure, Evidence, Implementation, SSP Section
  const [id, requirement, status, policy, procedure, evidence, implementation, sspSection] = cells
  
  // Update status (with emoji)
  let updatedStatus = status
  if (updates.status !== undefined) {
    const emoji = STATUS_EMOJI_MAP[updates.status] || ''
    const text = STATUS_TEXT_MAP[updates.status] || updates.status
    updatedStatus = `${emoji} ${text}`
  }
  
  // Update other fields
  const updatedPolicy = updates.policy !== undefined ? formatCell(updates.policy) : formatCell(policy)
  const updatedProcedure = updates.procedure !== undefined ? formatCell(updates.procedure) : formatCell(procedure)
  const updatedEvidence = updates.evidence !== undefined ? formatCell(updates.evidence) : formatCell(evidence)
  const updatedImplementation = updates.implementation !== undefined ? formatCell(updates.implementation) : formatCell(implementation)
  const updatedSspSection = updates.sspSection !== undefined ? formatCell(updates.sspSection) : formatCell(sspSection)
  
  // Reconstruct the row with proper spacing
  // Preserve the original spacing style (single space around pipes)
  // Escape any pipes in the content to preserve table structure
  const escapeCell = (cell: string) => cell.replace(/\|/g, '\\|')
  const updatedRow = `| ${escapeCell(id)} | ${escapeCell(requirement)} | ${escapeCell(updatedStatus)} | ${escapeCell(updatedPolicy)} | ${escapeCell(updatedProcedure)} | ${escapeCell(updatedEvidence)} | ${escapeCell(updatedImplementation)} | ${escapeCell(updatedSspSection)} |`
  
  // Replace the line
  lines[controlLineIndex] = updatedRow
  
  // Write back to file
  const updatedContent = lines.join('\n')
  await writeFile(filePath, updatedContent, 'utf-8')
}

/**
 * Control enrichment data structure
 */
export interface ControlEnrichment {
  controlId: string
  enhancedImplementation: string
  enhancedEvidence: string
  detailedInfo: NISTControlData
}

/**
 * Enhance implementation column with code file references from NIST data
 */
export function enhanceImplementationColumn(control: Control, nistData: NISTControlData): string {
  const existing = control.implementation || '-'
  
  // Extract code file references
  const codeFiles = nistData.implementation.codeFiles.map(f => {
    if (f.lines) {
      return `${f.file}:${f.lines}`
    }
    return f.file
  })
  
  // If no code files found, return existing
  if (codeFiles.length === 0) {
    return existing
  }
  
  // Check if code files are already mentioned in existing implementation
  const existingLower = existing.toLowerCase()
  const allFilesMentioned = codeFiles.every(file => {
    const fileName = file.split(':')[0].split('/').pop() || file
    return existingLower.includes(fileName.toLowerCase())
  })
  
  if (allFilesMentioned) {
    return existing
  }
  
  // Append code file references in parentheses
  const fileRefs = codeFiles.slice(0, 3).join(', ') // Limit to 3 files to keep column readable
  if (existing === '-' || existing.trim() === '') {
    return fileRefs
  }
  
  return `${existing} (${fileRefs})`
}

/**
 * Enhance evidence column with evidence file references from NIST data
 */
export function enhanceEvidenceColumn(control: Control, nistData: NISTControlData): string {
  const existing = control.evidence || '-'
  const existingRefs = existing === '-' ? [] : existing.split(',').map(r => r.trim()).filter(r => r)
  
  // Add new evidence files that aren't already present
  const newRefs: string[] = []
  for (const file of nistData.evidence.files) {
    const fileName = file.replace(/\.md$/, '')
    const isPresent = existingRefs.some(ref => 
      ref.includes(fileName) || ref.includes(file.replace(/^.*\//, ''))
    )
    if (!isPresent && fileName) {
      newRefs.push(fileName)
    }
  }
  
  if (newRefs.length === 0) {
    return existing
  }
  
  // Merge and deduplicate
  const allRefs = [...existingRefs, ...newRefs]
  return allRefs.join(', ')
}

/**
 * Add enrichment section to SCTM content
 */
export function addEnrichmentSection(
  sctmContent: string,
  enrichmentData: Map<string, ControlEnrichment>
): string {
  // Find where to insert the enrichment section (before "Related Documents" or "## 18" or at the end)
  const relatedDocsMatch = sctmContent.match(/\n##\s+(18\.\s+)?Related Documents/i)
  const insertIndex = relatedDocsMatch ? relatedDocsMatch.index! : sctmContent.length
  
  // Group enrichments by control family
  const byFamily = new Map<string, ControlEnrichment[]>()
  for (const enrichment of enrichmentData.values()) {
    const family = enrichment.detailedInfo.family || 'UNKNOWN'
    if (!byFamily.has(family)) {
      byFamily.set(family, [])
    }
    byFamily.get(family)!.push(enrichment)
  }
  
  // Generate enrichment section content
  let enrichmentSection = '\n\n---\n\n'
  enrichmentSection += '## 17.1. Control Implementation Details (Enriched from NIST Control Files)\n\n'
  enrichmentSection += 'This section provides detailed implementation information extracted from NIST SP 800-171 control assessment files.\n\n'
  
  // Sort families alphabetically
  const sortedFamilies = Array.from(byFamily.keys()).sort()
  
  for (const family of sortedFamilies) {
    const enrichments = byFamily.get(family)!
    // Sort by control ID
    enrichments.sort((a, b) => a.controlId.localeCompare(b.controlId))
    
    enrichmentSection += `### ${family} - ${enrichments.length} Controls\n\n`
    
    for (const enrichment of enrichments) {
      const { controlId, detailedInfo } = enrichment
      
      enrichmentSection += `<details>\n<summary><strong>${controlId}</strong> - ${detailedInfo.requirement}</summary>\n\n`
      
      // Implementation Details
      if (detailedInfo.implementation.codeFiles.length > 0 || detailedInfo.implementation.implementationSummary) {
        enrichmentSection += '#### Implementation Details\n\n'
        
        if (detailedInfo.implementation.codeFiles.length > 0) {
          enrichmentSection += '**Code Files:**\n'
          for (const file of detailedInfo.implementation.codeFiles) {
            enrichmentSection += `- \`${file.file}\`${file.lines ? ` (lines ${file.lines})` : ''}${file.description ? ` - ${file.description}` : ''}\n`
          }
          enrichmentSection += '\n'
        }
        
        if (detailedInfo.implementation.implementationSummary) {
          enrichmentSection += `**Summary:** ${detailedInfo.implementation.implementationSummary.substring(0, 300)}${detailedInfo.implementation.implementationSummary.length > 300 ? '...' : ''}\n\n`
        }
      }
      
      // Testing and Verification
      if (detailedInfo.testing.methods.length > 0 || detailedInfo.testing.results.length > 0) {
        enrichmentSection += '#### Testing and Verification\n\n'
        
        if (detailedInfo.testing.methods.length > 0) {
          enrichmentSection += '**Verification Methods:**\n'
          for (const method of detailedInfo.testing.methods) {
            enrichmentSection += `- ${method}\n`
          }
          enrichmentSection += '\n'
        }
        
        if (detailedInfo.testing.results.length > 0) {
          enrichmentSection += '**Test Results:**\n'
          for (const result of detailedInfo.testing.results) {
            enrichmentSection += `- ${result}\n`
          }
          enrichmentSection += '\n'
        }
        
        if (detailedInfo.testing.lastVerificationDate) {
          enrichmentSection += `**Last Verification Date:** ${detailedInfo.testing.lastVerificationDate}\n\n`
        }
      }
      
      // Assessment Notes
      if (detailedInfo.assessment.openItems.length > 0 || detailedInfo.assessment.assessorNotes) {
        enrichmentSection += '#### Assessment Notes\n\n'
        
        if (detailedInfo.assessment.openItems.length > 0) {
          enrichmentSection += '**Open Items:**\n'
          for (const item of detailedInfo.assessment.openItems) {
            enrichmentSection += `- ${item}\n`
          }
          enrichmentSection += '\n'
        }
        
        if (detailedInfo.assessment.assessorNotes) {
          enrichmentSection += `**Assessor Notes:** ${detailedInfo.assessment.assessorNotes.substring(0, 200)}${detailedInfo.assessment.assessorNotes.length > 200 ? '...' : ''}\n\n`
        }
      }
      
      // Evidence Files
      if (detailedInfo.evidence.files.length > 0) {
        enrichmentSection += '#### Evidence Files\n\n'
        for (const file of detailedInfo.evidence.files) {
          enrichmentSection += `- \`${file}\`\n`
        }
        enrichmentSection += '\n'
      }
      
      enrichmentSection += '</details>\n\n'
    }
  }
  
  enrichmentSection += '---\n\n'
  
  // Insert the enrichment section
  const before = sctmContent.substring(0, insertIndex)
  const after = sctmContent.substring(insertIndex)
  
  return before + enrichmentSection + after
}
