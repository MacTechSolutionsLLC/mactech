/**
 * SCTM Parser Utility
 * Parses the System Control Traceability Matrix markdown file and extracts structured control data
 */

export interface Control {
  id: string                    // e.g., "3.1.1"
  requirement: string           // Full requirement text (short summary)
  nistRequirement?: string      // NIST SP 800-171 exact requirement text (verbatim)
  nistDiscussion?: string       // NIST SP 800-171 DISCUSSION section (verbatim)
  status: 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'
  family: string                // AC, AT, AU, CM, etc.
  policy: string                // MAC-POL-XXX
  procedure: string             // MAC-SOP-XXX or "-"
  evidence: string              // Evidence references
  implementation: string        // Implementation details
  sspSection: string            // SSP section references
}

export interface SummaryStats {
  total: number
  implemented: number
  inherited: number
  partiallySatisfied: number
  notImplemented: number
  notApplicable: number
  readinessPercentage: number  // (implemented + inherited) / (total - notApplicable) * 100
  familyCounts: Record<string, number>
}

// Map status emojis to status types
const STATUS_MAP: Record<string, 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'> = {
  '✅': 'implemented',
  '🔄': 'inherited',
  '⚠️': 'partially_satisfied',
  '❌': 'not_implemented',
  '🚫': 'not_applicable',
}

// Map section numbers to control families
const FAMILY_MAP: Record<number, string> = {
  3: 'AC',   // Access Control
  4: 'AT',   // Awareness and Training
  5: 'AU',   // Audit and Accountability
  6: 'CM',   // Configuration Management
  7: 'IA',   // Identification and Authentication
  8: 'IR',   // Incident Response
  9: 'MA',   // Maintenance
  10: 'MP',  // Media Protection
  11: 'PS',  // Personnel Security
  12: 'PE',  // Physical Protection
  13: 'RA',  // Risk Assessment
  14: 'CA',  // Security Assessment
  15: 'SC',  // System and Communications Protection
  16: 'SI',  // System and Information Integrity
}

/**
 * Parse status from markdown table cell
 * Handles combined statuses like "🔄 Inherited / ✅ Implemented"
 * Priority: implemented > inherited > partially_satisfied > not_implemented > not_applicable
 */
function parseStatus(statusCell: string): 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable' {
  const trimmed = statusCell.trim()
  
  // Check for multiple statuses (combined statuses)
  const foundStatuses: Array<'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'> = []
  
  // Check for emojis first
  for (const [emoji, status] of Object.entries(STATUS_MAP)) {
    if (trimmed.includes(emoji)) {
      foundStatuses.push(status)
    }
  }
  
  // If no emojis found, check text
  if (foundStatuses.length === 0) {
    const lower = trimmed.toLowerCase()
    if (lower.includes('implemented') && !lower.includes('not')) {
      foundStatuses.push('implemented')
    }
    if (lower.includes('inherited')) {
      foundStatuses.push('inherited')
    }
    if (lower.includes('partially')) {
      foundStatuses.push('partially_satisfied')
    }
    if (lower.includes('not implemented') || lower.includes('not_implemented')) {
      foundStatuses.push('not_implemented')
    }
    if (lower.includes('not applicable') || lower.includes('not_applicable')) {
      foundStatuses.push('not_applicable')
    }
  }
  
  // Priority order: implemented > inherited > partially_satisfied > not_implemented > not_applicable
  if (foundStatuses.includes('implemented')) return 'implemented'
  if (foundStatuses.includes('inherited')) return 'inherited'
  if (foundStatuses.includes('partially_satisfied')) return 'partially_satisfied'
  if (foundStatuses.includes('not_implemented')) return 'not_implemented'
  if (foundStatuses.includes('not_applicable')) return 'not_applicable'
  
  // Default to not_implemented if unclear
  return 'not_implemented'
}

/**
 * Extract control family from section header
 */
function extractFamily(sectionNumber: number): string {
  return FAMILY_MAP[sectionNumber] || 'UNKNOWN'
}

/**
 * Parse a markdown table row into a Control object
 * Supports both 8-column (legacy) and 10-column (with NIST text) formats
 */
function parseTableRow(row: string, family: string): Control | null {
  // Remove leading/trailing pipe and split by pipe
  const cells = row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim())
  
  // Support both 8-column (legacy) and 10-column (enriched) formats
  if (cells.length < 8) {
    return null
  }
  
  // Skip header rows
  const id = cells[0]
  if (id === 'Control ID' || id.includes('---') || !id.match(/^\d+\.\d+\.\d+/)) {
    return null
  }
  
  // Handle 10-column format (with NIST text)
  // Note: Some rows may have malformed structure with extra "---" placeholders
  // We need to detect the actual column positions by looking for status emoji/status text
  if (cells.length >= 10) {
    // Find the status column (contains emoji or status text)
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
    
    // If we found status, reconstruct columns from there
    if (statusIndex > 0) {
      // Expected order after status: Policy, Procedure, Evidence, Implementation, SSP Section
      const controlId = cells[0].trim()
      const requirement = cells[1].trim()
      const nistRequirement = cells[2]?.trim() === '---' ? undefined : cells[2]?.trim()
      const nistDiscussion = cells[3]?.trim() === '---' ? undefined : cells[3]?.trim()
      const status = cells[statusIndex].trim()
      const policy = statusIndex + 1 < cells.length ? cells[statusIndex + 1].trim() : '-'
      const procedure = statusIndex + 2 < cells.length ? cells[statusIndex + 2].trim() : '-'
      const evidence = statusIndex + 3 < cells.length ? cells[statusIndex + 3].trim() : '-'
      const implementation = statusIndex + 4 < cells.length ? cells[statusIndex + 4].trim() : '-'
      const sspSection = statusIndex + 5 < cells.length ? cells[statusIndex + 5].trim() : '-'
      
      // Clean up policy and procedure references (remove "(to be created)" text)
      const cleanPolicy = policy.replace(/\s*\(to be created\)/gi, '').trim() || '-'
      const cleanProcedure = procedure.replace(/\s*\(to be created\)/gi, '').trim() || '-'
      
      return {
        id: controlId,
        requirement: requirement,
        nistRequirement: nistRequirement,
        nistDiscussion: nistDiscussion,
        status: parseStatus(status),
        family,
        policy: cleanPolicy,
        procedure: cleanProcedure,
        evidence: evidence || '-',
        implementation: implementation || '-',
        sspSection: sspSection || '-',
      }
    }
    
    // Fallback: try standard 10-column parsing
    const [controlId, requirement, nistRequirement, nistDiscussion, status, policy, procedure, evidence, implementation, sspSection] = cells
    
    // Clean up policy and procedure references (remove "(to be created)" text)
    const cleanPolicy = policy.trim().replace(/\s*\(to be created\)/gi, '').trim() || '-'
    const cleanProcedure = procedure.trim().replace(/\s*\(to be created\)/gi, '').trim() || '-'
    
    return {
      id: controlId.trim(),
      requirement: requirement.trim(),
      nistRequirement: nistRequirement?.trim() === '---' ? undefined : nistRequirement?.trim(),
      nistDiscussion: nistDiscussion?.trim() === '---' ? undefined : nistDiscussion?.trim(),
      status: parseStatus(status),
      family,
      policy: cleanPolicy,
      procedure: cleanProcedure,
      evidence: evidence.trim() || '-',
      implementation: implementation.trim() || '-',
      sspSection: sspSection.trim() || '-',
    }
  }
  
  // Handle 8-column format (legacy)
  const [controlId, requirement, status, policy, procedure, evidence, implementation, sspSection] = cells
  
  // Clean up policy and procedure references (remove "(to be created)" text)
  const cleanPolicy = policy.trim().replace(/\s*\(to be created\)/gi, '').trim() || '-'
  const cleanProcedure = procedure.trim().replace(/\s*\(to be created\)/gi, '').trim() || '-'
  
  return {
    id: controlId.trim(),
    requirement: requirement.trim(),
    status: parseStatus(status),
    family,
    policy: cleanPolicy,
    procedure: cleanProcedure,
    evidence: evidence.trim() || '-',
    implementation: implementation.trim() || '-',
    sspSection: sspSection.trim() || '-',
  }
}

/**
 * Parse the SCTM markdown content and extract all controls
 */
export function parseSCTM(content: string): Control[] {
  const controls: Control[] = []
  const lines = content.split('\n')
  
  let currentFamily = 'UNKNOWN'
  let currentSectionNumber = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for section headers (e.g., "## 3. Access Control (AC) - 22 Requirements")
    const sectionMatch = line.match(/^##\s+(\d+)\.\s+[^(]+\(([A-Z]+)\)/)
    if (sectionMatch) {
      currentSectionNumber = parseInt(sectionMatch[1], 10)
      currentFamily = sectionMatch[2] || extractFamily(currentSectionNumber)
      continue
    }
    
    // Check for table rows (start with |)
    if (line.trim().startsWith('|') && line.includes('|')) {
      const control = parseTableRow(line, currentFamily)
      if (control) {
        controls.push(control)
      }
    }
  }
  
  return controls
}

/**
 * Calculate summary statistics from controls
 */
export function calculateSummaryStats(controls: Control[]): SummaryStats {
  const stats: SummaryStats = {
    total: controls.length,
    implemented: 0,
    inherited: 0,
    partiallySatisfied: 0,
    notImplemented: 0,
    notApplicable: 0,
    readinessPercentage: 0,
    familyCounts: {},
  }
  
  // Count by status
  for (const control of controls) {
    switch (control.status) {
      case 'implemented':
        stats.implemented++
        break
      case 'inherited':
        stats.inherited++
        break
      case 'partially_satisfied':
        stats.partiallySatisfied++
        break
      case 'not_implemented':
        stats.notImplemented++
        break
      case 'not_applicable':
        stats.notApplicable++
        break
    }
    
    // Count by family
    stats.familyCounts[control.family] = (stats.familyCounts[control.family] || 0) + 1
  }
  
  // Calculate readiness percentage
  // Readiness = (Implemented + Inherited) / (Total - Not Applicable) * 100
  const applicableControls = stats.total - stats.notApplicable
  if (applicableControls > 0) {
    stats.readinessPercentage = Math.round(
      ((stats.implemented + stats.inherited) / applicableControls) * 100
    )
  }
  
  return stats
}
