/**
 * Comprehensive Control Audit System
 * Verifies actual implementation status of CMMC Level 2 controls
 * against code, evidence files, policies, and procedures
 */

import { readFile, access } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { parseSCTM, Control } from './sctm-parser'

export interface ControlAuditResult {
  controlId: string
  requirement: string
  family: string
  claimedStatus: 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'
  verifiedStatus: 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'
  verificationStatus: 'verified' | 'discrepancy' | 'needs_review'
  issues: string[]
  evidence: {
    policies: EvidenceItem[]
    procedures: EvidenceItem[]
    evidenceFiles: EvidenceItem[]
    implementationFiles: EvidenceItem[]
    codeVerification: CodeVerification[]
  }
  complianceScore: number // 0-100
  lastVerified: Date
}

export interface EvidenceItem {
  reference: string
  exists: boolean
  path?: string
  lastModified?: Date
  issues?: string[]
}

export interface CodeVerification {
  file: string
  exists: boolean
  containsRelevantCode: boolean
  codeSnippets?: string[]
  issues?: string[]
}

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level1')
const EVIDENCE_ROOT = join(COMPLIANCE_ROOT, '05-evidence')
const POLICIES_ROOT = join(COMPLIANCE_ROOT, '02-policies-and-procedures')
const CODE_ROOT = process.cwd()

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Search for code patterns in a file
 */
async function searchCodePatterns(filePath: string, patterns: string[]): Promise<{ found: boolean; snippets: string[] }> {
  try {
    if (!existsSync(filePath)) {
      return { found: false, snippets: [] }
    }
    
    const content = await readFile(filePath, 'utf-8')
    const snippets: string[] = []
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i')
      const matches = content.match(regex)
      if (matches) {
        snippets.push(...matches.slice(0, 3)) // Limit to 3 matches
      }
    }
    
    return { found: snippets.length > 0, snippets }
  } catch {
    return { found: false, snippets: [] }
  }
}

/**
 * Verify policy file exists
 */
async function verifyPolicy(policyRef: string): Promise<EvidenceItem> {
  if (policyRef === '-' || !policyRef) {
    return {
      reference: policyRef || '-',
      exists: false,
      issues: ['No policy reference provided']
    }
  }
  
  const policyPath = join(POLICIES_ROOT, `${policyRef}.md`)
  const exists = await fileExists(policyPath)
  
  return {
    reference: policyRef,
    exists,
    path: exists ? policyPath : undefined,
    issues: exists ? [] : [`Policy file not found: ${policyPath}`]
  }
}

/**
 * Verify procedure file exists
 */
async function verifyProcedure(procedureRef: string): Promise<EvidenceItem> {
  if (procedureRef === '-' || !procedureRef) {
    return {
      reference: procedureRef || '-',
      exists: false,
      issues: ['No procedure reference provided']
    }
  }
  
  const procedurePath = join(POLICIES_ROOT, `${procedureRef}.md`)
  const exists = await fileExists(procedurePath)
  
  return {
    reference: procedureRef,
    exists,
    path: exists ? procedurePath : undefined,
    issues: exists ? [] : [`Procedure file not found: ${procedurePath}`]
  }
}

/**
 * Verify evidence file exists
 */
async function verifyEvidenceFile(evidenceRef: string): Promise<EvidenceItem[]> {
  if (!evidenceRef || evidenceRef === '-') {
    return [{
      reference: evidenceRef || '-',
      exists: false,
      issues: ['No evidence reference provided']
    }]
  }
  
  const items: EvidenceItem[] = []
  const refs = evidenceRef.split(',').map(r => r.trim())
  
  for (const ref of refs) {
    // Check if it's a file reference (MAC-RPT-XXX) or code reference
    if (ref.includes('.ts') || ref.includes('.tsx') || ref.includes('.js')) {
      // Code file reference
      const codePath = join(CODE_ROOT, ref)
      const exists = await fileExists(codePath)
      items.push({
        reference: ref,
        exists,
        path: exists ? codePath : undefined,
        issues: exists ? [] : [`Code file not found: ${codePath}`]
      })
    } else if (ref.startsWith('MAC-RPT-') || ref.startsWith('MAC-')) {
      // Evidence report reference
      const evidencePath = join(EVIDENCE_ROOT, `${ref}.md`)
      const exists = await fileExists(evidencePath)
      
      // Also check subdirectories
      let foundPath = evidencePath
      if (!exists) {
        // Check common subdirectories
        const subdirs = ['audit-log-reviews', 'endpoint-verifications', 'incident-response', 
                         'personnel-screening', 'security-impact-analysis', 'training', 
                         'vulnerability-remediation']
        for (const subdir of subdirs) {
          const altPath = join(EVIDENCE_ROOT, subdir, `${ref}.md`)
          if (await fileExists(altPath)) {
            foundPath = altPath
            break
          }
        }
      }
      
      items.push({
        reference: ref,
        exists: exists || existsSync(foundPath),
        path: exists || existsSync(foundPath) ? foundPath : undefined,
        issues: (exists || existsSync(foundPath)) ? [] : [`Evidence file not found: ${evidencePath}`]
      })
    } else {
      // Generic reference
      items.push({
        reference: ref,
        exists: false,
        issues: [`Could not locate evidence: ${ref}`]
      })
    }
  }
  
  return items
}

/**
 * Verify implementation code exists and contains relevant patterns
 */
async function verifyImplementation(implementationRef: string, controlId: string): Promise<CodeVerification[]> {
  if (!implementationRef || implementationRef === '-') {
    return [{
      file: implementationRef || '-',
      exists: false,
      containsRelevantCode: false,
      issues: ['No implementation reference provided']
    }]
  }
  
  const verifications: CodeVerification[] = []
  const refs = implementationRef.split(',').map(r => r.trim())
  
  for (const ref of refs) {
    // Extract file path from reference
    let filePath: string
    if (ref.includes('/')) {
      filePath = join(CODE_ROOT, ref)
    } else if (ref.includes('.')) {
      // Assume it's a file in root or lib
      filePath = join(CODE_ROOT, ref)
    } else {
      // Generic reference (e.g., "NextAuth.js", "middleware")
      verifications.push({
        file: ref,
        exists: false,
        containsRelevantCode: false,
        issues: [`Generic implementation reference: ${ref} - cannot verify code`]
      })
      continue
    }
    
    const exists = await fileExists(filePath)
    
    if (!exists) {
      verifications.push({
        file: ref,
        exists: false,
        containsRelevantCode: false,
        issues: [`Implementation file not found: ${filePath}`]
      })
      continue
    }
    
    // Search for relevant code patterns based on control family
    const family = controlId.split('.')[0]
    const patterns = getCodePatternsForControl(controlId, family)
    const { found, snippets } = await searchCodePatterns(filePath, patterns)
    
    verifications.push({
      file: ref,
      exists: true,
      containsRelevantCode: found,
      codeSnippets: snippets.slice(0, 2),
      issues: found ? [] : [`No relevant code patterns found for control ${controlId}`]
    })
  }
  
  return verifications
}

/**
 * Get code patterns to search for based on control ID and family
 */
function getCodePatternsForControl(controlId: string, family: string): string[] {
  const patterns: string[] = []
  
  // Access Control patterns
  if (family === '3' || controlId.startsWith('3.1')) {
    patterns.push('auth', 'middleware', 'requireAuth', 'requireAdmin', 'role', 'permission')
  }
  
  // Audit patterns
  if (family === '5' || controlId.startsWith('3.3')) {
    patterns.push('logEvent', 'audit', 'AppEvent', 'logLogin', 'logAdminAction')
  }
  
  // Identification and Authentication patterns
  if (family === '7' || controlId.startsWith('3.5')) {
    patterns.push('bcrypt', 'password', 'mfa', 'MFA', 'authentication', 'signIn')
  }
  
  // Configuration Management patterns
  if (family === '6' || controlId.startsWith('3.4')) {
    patterns.push('config', 'baseline', 'change', 'version')
  }
  
  // System Integrity patterns
  if (family === '16' || controlId.startsWith('3.14')) {
    patterns.push('vulnerability', 'scan', 'monitor', 'alert', 'detect')
  }
  
  return patterns
}

/**
 * Calculate compliance score for a control
 */
function calculateComplianceScore(audit: Partial<ControlAuditResult>): number {
  let score = 0
  let maxScore = 0
  
  // Policy verification (20 points)
  maxScore += 20
  if (audit.evidence?.policies && audit.evidence.policies.length > 0) {
    const policyScore = audit.evidence.policies.every(p => p.exists) ? 20 : 
                       audit.evidence.policies.some(p => p.exists) ? 10 : 0
    score += policyScore
  }
  
  // Procedure verification (20 points)
  maxScore += 20
  if (audit.evidence?.procedures && audit.evidence.procedures.length > 0) {
    const procedureScore = audit.evidence.procedures.every(p => p.exists) ? 20 : 
                          audit.evidence.procedures.some(p => p.exists) ? 10 : 0
    score += procedureScore
  }
  
  // Evidence files (30 points)
  maxScore += 30
  if (audit.evidence?.evidenceFiles && audit.evidence.evidenceFiles.length > 0) {
    const evidenceCount = audit.evidence.evidenceFiles.filter(e => e.exists).length
    const evidenceScore = evidenceCount === audit.evidence.evidenceFiles.length ? 30 :
                          evidenceCount > 0 ? 15 : 0
    score += evidenceScore
  }
  
  // Code implementation (30 points)
  maxScore += 30
  if (audit.evidence?.codeVerification && audit.evidence.codeVerification.length > 0) {
    const codeCount = audit.evidence.codeVerification.filter(c => c.exists && c.containsRelevantCode).length
    const codeScore = codeCount === audit.evidence.codeVerification.length ? 30 :
                      codeCount > 0 ? 15 : 0
    score += codeScore
  }
  
  // Adjust for status
  if (audit.claimedStatus === 'not_applicable') {
    return 100 // N/A controls are fully compliant
  }
  
  if (audit.claimedStatus === 'inherited') {
    return Math.min(score + 20, 100) // Inherited controls get bonus
  }
  
  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
}

/**
 * Audit a single control
 */
export async function auditControl(control: Control): Promise<ControlAuditResult> {
  const issues: string[] = []
  
  // Verify policies
  const policyRefs = control.policy.split(',').map(p => p.trim())
  const policies = await Promise.all(policyRefs.map(ref => verifyPolicy(ref)))
  
  // Verify procedures
  const procedureRefs = control.procedure === '-' ? [] : control.procedure.split(',').map(p => p.trim())
  const procedures = procedureRefs.length > 0 
    ? await Promise.all(procedureRefs.map(ref => verifyProcedure(ref)))
    : []
  
  // Verify evidence files
  const evidenceFiles = await verifyEvidenceFile(control.evidence)
  
  // Verify implementation
  const codeVerification = await verifyImplementation(control.implementation, control.id)
  
  // Collect issues
  policies.forEach(p => { if (p.issues) issues.push(...p.issues) })
  procedures.forEach(p => { if (p.issues) issues.push(...p.issues) })
  evidenceFiles.forEach(e => { if (e.issues) issues.push(...e.issues) })
  codeVerification.forEach(c => { if (c.issues) issues.push(...c.issues) })
  
  // Determine verified status
  let verifiedStatus = control.status
  let verificationStatus: 'verified' | 'discrepancy' | 'needs_review' = 'verified'
  
  // If claimed implemented but missing evidence, mark as needs review
  if (control.status === 'implemented') {
    const hasEvidence = evidenceFiles.some(e => e.exists) || codeVerification.some(c => c.exists && c.containsRelevantCode)
    if (!hasEvidence && issues.length > 0) {
      verificationStatus = 'needs_review'
      if (issues.length > 3) {
        verifiedStatus = 'partially_satisfied'
      }
    }
  }
  
  // If claimed inherited but no justification, mark as needs review
  if (control.status === 'inherited' && !control.implementation.includes('Railway') && !control.implementation.includes('platform')) {
    verificationStatus = 'needs_review'
  }
  
  // Calculate compliance score
  const evidence = {
    policies,
    procedures,
    evidenceFiles,
    implementationFiles: codeVerification.map(c => ({
      reference: c.file,
      exists: c.exists,
      path: c.exists ? c.file : undefined,
      issues: c.issues
    })),
    codeVerification
  }
  
  const complianceScore = calculateComplianceScore({ evidence, claimedStatus: control.status })
  
  return {
    controlId: control.id,
    requirement: control.requirement,
    family: control.family,
    claimedStatus: control.status,
    verifiedStatus,
    verificationStatus,
    issues,
    evidence,
    complianceScore,
    lastVerified: new Date()
  }
}

/**
 * Audit all controls from SCTM
 */
export async function auditAllControls(): Promise<ControlAuditResult[]> {
  const sctmPath = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')
  const content = await readFile(sctmPath, 'utf-8')
  const controls = parseSCTM(content)
  
  const results = await Promise.all(controls.map(control => auditControl(control)))
  
  return results
}

/**
 * Generate audit summary statistics
 */
export interface AuditSummary {
  total: number
  verified: number
  needsReview: number
  discrepancies: number
  averageComplianceScore: number
  byStatus: Record<string, { claimed: number; verified: number }>
  byFamily: Record<string, { total: number; averageScore: number }>
  criticalIssues: Array<{ controlId: string; issue: string }>
}

export function generateAuditSummary(results: ControlAuditResult[]): AuditSummary {
  const summary: AuditSummary = {
    total: results.length,
    verified: 0,
    needsReview: 0,
    discrepancies: 0,
    averageComplianceScore: 0,
    byStatus: {},
    byFamily: {},
    criticalIssues: []
  }
  
  let totalScore = 0
  
  for (const result of results) {
    // Count verification status
    if (result.verificationStatus === 'verified') summary.verified++
    if (result.verificationStatus === 'needs_review') summary.needsReview++
    if (result.verificationStatus === 'discrepancy') summary.discrepancies++
    
    // Track by status
    const statusKey = result.claimedStatus
    if (!summary.byStatus[statusKey]) {
      summary.byStatus[statusKey] = { claimed: 0, verified: 0 }
    }
    summary.byStatus[statusKey].claimed++
    if (result.verificationStatus === 'verified') {
      summary.byStatus[statusKey].verified++
    }
    
    // Track by family
    if (!summary.byFamily[result.family]) {
      summary.byFamily[result.family] = { total: 0, averageScore: 0 }
    }
    summary.byFamily[result.family].total++
    
    // Accumulate scores
    totalScore += result.complianceScore
    
    // Collect critical issues (controls with low scores or many issues)
    if (result.complianceScore < 50 || result.issues.length > 5) {
      summary.criticalIssues.push({
        controlId: result.controlId,
        issue: `Compliance score: ${result.complianceScore}%, ${result.issues.length} issues`
      })
    }
  }
  
  // Calculate averages
  summary.averageComplianceScore = Math.round(totalScore / results.length)
  
  // Calculate family averages
  for (const family in summary.byFamily) {
    const familyResults = results.filter(r => r.family === family)
    const familyScore = familyResults.reduce((sum, r) => sum + r.complianceScore, 0)
    summary.byFamily[family].averageScore = Math.round(familyScore / familyResults.length)
  }
  
  return summary
}
