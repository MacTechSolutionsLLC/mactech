/**
 * SCTM Writer Utility
 * Updates the System Control Traceability Matrix markdown file with control changes
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { Control } from './sctm-parser'

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
