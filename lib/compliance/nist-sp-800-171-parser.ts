/**
 * NIST SP 800-171 Parser
 * Extracts exact requirement text and DISCUSSION sections from NIST SP 800-171 Rev. 2 document
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

export interface NISTControlText {
  controlId: string
  requirement: string  // Full requirement text (verbatim)
  discussion: string   // Complete DISCUSSION section (verbatim)
}

/**
 * Parse NIST SP 800-171 document and extract all control requirements and DISCUSSION sections
 */
export async function parseNISTSP800171(
  documentPath?: string
): Promise<Map<string, NISTControlText>> {
  const defaultPath = join(
    process.cwd(),
    'app',
    'admin',
    'compliance',
    'document',
    'NIST-SP-800-171'
  )
  
  const filePath = documentPath || defaultPath
  const content = await readFile(filePath, 'utf-8')
  const lines = content.split('\n')
  
  const controls = new Map<string, NISTControlText>()
  let currentControlId: string | null = null
  let currentState: 'requirement' | 'discussion' | 'none' = 'none'
  let requirementLines: string[] = []
  let discussionLines: string[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Skip empty lines (but preserve in discussion for paragraph breaks)
    if (trimmed === '') {
      if (currentState === 'discussion') {
        discussionLines.push('') // Preserve paragraph breaks
      }
      continue
    }
    
    // Check for control ID pattern FIRST (before DISCUSSION check)
    // This ensures we save previous control before starting new one
    const controlMatch = trimmed.match(/^(3\.\d+\.\d+)\s+(.+)$/)
    
    if (controlMatch) {
      // Save previous control if exists (this handles discussion that was accumulated)
      if (currentControlId) {
        const requirement = requirementLines.join(' ').trim()
        const discussion = discussionLines.join('\n').trim()
        const existing = controls.get(currentControlId)
        // Don't overwrite an existing control that has discussion with one that doesn't (e.g. duplicate in appendix/table)
        if (!existing?.discussion || discussion) {
          controls.set(currentControlId, {
            controlId: currentControlId,
            requirement: requirement || existing?.requirement || '',
            discussion: discussion || existing?.discussion || '',
          })
        }
      }
      
      // Start new control
      currentControlId = controlMatch[1]
      requirementLines = [controlMatch[2]] // Start with text after control ID
      discussionLines = []
      currentState = 'requirement'
      continue
    }
    
    // Check for DISCUSSION keyword (after control check)
    if (trimmed === 'DISCUSSION' && currentControlId && currentState === 'requirement') {
      currentState = 'discussion'
      // Don't include the keyword itself
      continue
    }
    
    // Skip page markers and formatting (unless we're in discussion)
    if (currentState !== 'discussion' && (
        trimmed.match(/^SP 800-171, REVISION 2/) ||
        trimmed.match(/^CHAPTER THREE PAGE/) ||
        trimmed.match(/^This publication is available/) ||
        trimmed.match(/^________________________________________________________________/) ||
        trimmed.match(/^TABLE \d+:/) ||
        trimmed.match(/^FIGURE \d+:/))) {
      continue
    }
    
    // Process based on current state
    if (currentState === 'requirement' && currentControlId) {
      // We're accumulating requirement text
      // Stop accumulating if we hit section markers (these appear between requirement and DISCUSSION)
      // But keep currentState as 'requirement' to wait for DISCUSSION keyword
      if (trimmed === 'Derived Security Requirements' ||
          trimmed === 'Basic Security Requirements' ||
          trimmed.match(/^THE MEANING OF/) ||
          trimmed.match(/^SP 800-171/) ||
          trimmed.match(/^CHAPTER THREE/)) {
        // These appear between requirement and DISCUSSION - stop accumulating requirement
        // But keep currentState as 'requirement' to wait for DISCUSSION keyword
        continue
      }
      
      // Continue accumulating requirement (only if we haven't hit section markers)
      requirementLines.push(trimmed)
    } else if (currentState === 'discussion' && currentControlId) {
      // We're accumulating discussion text
      // Note: Control matching is handled above, so we don't need to check here
      
      // Stop if we hit a section header (but not a control)
      // Section headers like "3.1 Access Control" indicate end of discussion
      if (trimmed.match(/^3\.\d+\s+[A-Z]/) && !trimmed.match(/^3\.\d+\.\d+/)) {
        // Save current control
        const requirement = requirementLines.join(' ').trim()
        const discussion = discussionLines.join('\n').trim()
        const existing = controls.get(currentControlId!)
        if (!existing?.discussion || discussion) {
          controls.set(currentControlId!, {
            controlId: currentControlId!,
            requirement: requirement || existing?.requirement || '',
            discussion: discussion || existing?.discussion || '',
          })
        }
        currentControlId = null
        currentState = 'none'
        requirementLines = []
        discussionLines = []
        continue
      }
      
      // Stop if we hit "Derived Security Requirements" or "Basic Security Requirements"
      // These markers appear BETWEEN controls and signal end of discussion (don't add to discussion)
      if (trimmed === 'Derived Security Requirements' || trimmed === 'Basic Security Requirements') {
        const requirement = requirementLines.join(' ').trim()
        const discussion = discussionLines.join('\n').trim()
        const existing = controls.get(currentControlId!)
        if (!existing?.discussion || discussion) {
          controls.set(currentControlId!, {
            controlId: currentControlId!,
            requirement: requirement || existing?.requirement || '',
            discussion: discussion || existing?.discussion || '',
          })
        }
        currentControlId = null
        currentState = 'none'
        requirementLines = []
        discussionLines = []
        continue
      }
      
      // Skip page markers in discussion
      if (trimmed.match(/^SP 800-171, REVISION 2/) ||
          trimmed.match(/^CHAPTER THREE PAGE/) ||
          trimmed.match(/^This publication is available/) ||
          trimmed.match(/^________________________________________________________________/)) {
        continue
      }
      
      // Add to discussion
      discussionLines.push(trimmed)
    }
  }
  
  // Save last control
  if (currentControlId) {
    const requirement = requirementLines.join(' ').trim()
    const discussion = discussionLines.join('\n').trim()
    const existing = controls.get(currentControlId)
    if (!existing?.discussion || discussion) {
      controls.set(currentControlId, {
        controlId: currentControlId,
        requirement: requirement || existing?.requirement || '',
        discussion: discussion || existing?.discussion || '',
      })
    }
  }
  
  return controls
}

/**
 * Get NIST requirement text for a specific control
 */
export async function getNISTControlText(
  controlId: string,
  documentPath?: string
): Promise<NISTControlText | null> {
  const allControls = await parseNISTSP800171(documentPath)
  return allControls.get(controlId) || null
}

/**
 * Format text for markdown table cell (escape pipes and handle newlines)
 */
export function formatForMarkdownCell(text: string, maxLength?: number): string {
  // Escape pipes
  let formatted = text.replace(/\|/g, '\\|')
  
  // Replace newlines with spaces for table cells
  formatted = formatted.replace(/\n+/g, ' ')
  
  // Collapse multiple spaces
  formatted = formatted.replace(/\s+/g, ' ').trim()
  
  // Truncate if needed
  if (maxLength && formatted.length > maxLength) {
    formatted = formatted.substring(0, maxLength - 3) + '...'
  }
  
  return formatted
}

/**
 * Get first paragraph of DISCUSSION for table display
 */
export function getDiscussionPreview(discussion: string, maxLength: number = 400): string {
  if (!discussion) return ''
  
  // Get first paragraph (up to first double newline or first sentence)
  const firstParagraph = discussion.split('\n\n')[0] || 
                         discussion.split('. ')[0] + (discussion.includes('. ') ? '.' : '')
  
  let preview = firstParagraph.trim()
  
  // Truncate if needed
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength - 3) + '...'
  }
  
  return formatForMarkdownCell(preview)
}
