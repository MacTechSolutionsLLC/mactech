/**
 * Control Inheritance Reassessment Script
 * Analyzes current inheritance status and identifies overclaims
 */

import { parseSCTM, Control } from '../lib/compliance/sctm-parser'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const SCTM_PATH = join(process.cwd(), 'compliance', 'cmmc', 'level2', '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')
const REPORT_PATH = join(process.cwd(), 'compliance', 'cmmc', 'level2', '04-self-assessment', 'MAC-AUD-417_Control_Inheritance_Reassessment_Report.md')

interface InheritanceChange {
  controlId: string
  requirement: string
  currentStatus: string
  currentProvider?: string
  targetStatus: string
  targetProvider?: string
  justification: string
  priority: 'high' | 'medium' | 'low'
}

// Target inheritance matrix based on assessor-defensible guidance
const TARGET_INHERITANCE: Record<string, { status: string; provider?: string; notes: string }> = {
  // Google Cloud Compute Engine (CUI Vault Infrastructure)
  '3.10.1': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.10.2': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.10.3': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.10.4': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.10.5': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.10.6': { status: 'inherited', provider: 'GCP', notes: 'GCP data center physical security' },
  '3.13.1': { status: 'partially_satisfied', provider: 'GCP', notes: 'Cloud perimeter only; VM/network config is customer' },
  '3.13.5': { status: 'partially_satisfied', provider: 'GCP', notes: 'VPC/hypervisor separation' },
  '3.13.6': { status: 'partially_satisfied', provider: 'GCP', notes: 'Infrastructure routing only' },
  '3.13.9': { status: 'partially_satisfied', provider: 'GCP', notes: 'Fabric-level only' },
  
  // Railway (Main Application Hosting - non-CUI)
  '3.13.8': { status: 'partially_satisfied', provider: 'Railway', notes: 'Platform TLS only (non-CUI)' },
  
  // GitHub (Source Code Repository)
  '3.4.8': { status: 'partially_satisfied', provider: 'GitHub', notes: 'Branch protection' },
  '3.5.2': { status: 'partially_satisfied', provider: 'GitHub', notes: 'GitHub org-level MFA' },
}

// Controls that should be REMOVED from Railway inheritance (overclaims)
const RAILWAY_OVERCLAIMS = [
  '3.1.13', // Cryptographic remote access - Should be implemented (CUI vault uses GCP)
  '3.1.14', // Managed access control points - Should be partial from GCP
  '3.3.7',  // System clock synchronization - Should be implemented (VM-specific)
  '3.4.7',  // Restrict nonessential programs - Should be implemented (VM-specific)
  '3.8.6',  // Cryptographic protection on digital media - Should be implemented (CUI vault uses GCP encryption)
  '3.13.6', // Deny-by-default - Should be partial from GCP
  '3.13.15', // Protect authenticity - Should be partial from GCP
]

// Controls that should be changed from inherited to implemented
const SHOULD_BE_IMPLEMENTED = [
  { id: '3.1.13', reason: 'CUI vault uses GCP, not Railway. Customer implements cryptographic remote access.' },
  { id: '3.1.14', reason: 'Should be partial from GCP for CUI vault, not Railway' },
  { id: '3.3.7', reason: 'VM-specific implementation required (NTP sync on Google VM)' },
  { id: '3.4.7', reason: 'VM-specific implementation required (restrict programs on Google VM)' },
  { id: '3.8.6', reason: 'CUI vault uses GCP encryption, not Railway. Customer implements database encryption.' },
]

// Controls that should be changed from inherited to partial
const SHOULD_BE_PARTIAL = [
  { id: '3.1.14', targetProvider: 'GCP', reason: 'GCP VPC firewall rules, network access controls' },
  { id: '3.13.5', targetProvider: 'GCP', reason: 'VPC/hypervisor separation' },
  { id: '3.13.6', targetProvider: 'GCP', reason: 'Infrastructure routing only' },
  { id: '3.13.9', targetProvider: 'GCP', reason: 'Fabric-level only' },
  { id: '3.13.15', targetProvider: 'GCP', reason: 'TLS authentication at infrastructure level' },
]

function extractProvider(implementation: string): string | undefined {
  if (implementation.includes('Railway')) return 'Railway'
  if (implementation.includes('GCP') || implementation.includes('Google Cloud')) return 'GCP'
  if (implementation.includes('GitHub')) return 'GitHub'
  return undefined
}

function getStatusEmoji(status: string): string {
  switch (status) {
    case 'implemented': return '✅'
    case 'inherited': return '🔄'
    case 'partially_satisfied': return '⚠️'
    case 'not_implemented': return '❌'
    case 'not_applicable': return '🚫'
    default: return '❓'
  }
}

async function main() {
  console.log('Analyzing control inheritance status...\n')

  try {
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)
    
    const changes: InheritanceChange[] = []
    
    // Find all currently inherited controls
    const inheritedControls = controls.filter(c => c.status === 'inherited')
    console.log(`Found ${inheritedControls.length} currently inherited controls\n`)
    
    // Check for Railway overclaims
    for (const control of inheritedControls) {
      const currentProvider = extractProvider(control.implementation)
      
      if (RAILWAY_OVERCLAIMS.includes(control.id)) {
        const shouldBeImplemented = SHOULD_BE_IMPLEMENTED.find(s => s.id === control.id)
        const shouldBePartial = SHOULD_BE_PARTIAL.find(s => s.id === control.id)
        
        if (shouldBeImplemented) {
          changes.push({
            controlId: control.id,
            requirement: control.requirement,
            currentStatus: 'inherited',
            currentProvider: currentProvider || 'Railway',
            targetStatus: 'implemented',
            justification: shouldBeImplemented.reason,
            priority: 'high'
          })
        } else if (shouldBePartial) {
          changes.push({
            controlId: control.id,
            requirement: control.requirement,
            currentStatus: 'inherited',
            currentProvider: currentProvider || 'Railway',
            targetStatus: 'partially_satisfied',
            targetProvider: shouldBePartial.targetProvider,
            justification: shouldBePartial.reason,
            priority: 'high'
          })
        }
      }
    }
    
    // Check for missing GCP inheritance (PE controls)
    const peControls = controls.filter(c => c.id.startsWith('3.10.'))
    for (const control of peControls) {
      if (control.status !== 'inherited' && TARGET_INHERITANCE[control.id]) {
        changes.push({
          controlId: control.id,
          requirement: control.requirement,
          currentStatus: control.status,
          targetStatus: 'inherited',
          targetProvider: 'GCP',
          justification: TARGET_INHERITANCE[control.id].notes,
          priority: 'high'
        })
      }
    }
    
    // Check for missing GitHub inheritance
    const githubControls = ['3.4.8', '3.5.2']
    for (const controlId of githubControls) {
      const control = controls.find(c => c.id === controlId)
      if (control && TARGET_INHERITANCE[controlId]) {
        const target = TARGET_INHERITANCE[controlId]
        if (control.status !== target.status) {
          changes.push({
            controlId: control.id,
            requirement: control.requirement,
            currentStatus: control.status,
            targetStatus: target.status,
            targetProvider: target.provider,
            justification: target.notes,
            priority: 'medium'
          })
        }
      }
    }
    
    // Check for missing partial status on SC controls
    const scControls = controls.filter(c => c.id.startsWith('3.13.'))
    for (const control of scControls) {
      if (TARGET_INHERITANCE[control.id] && control.status !== TARGET_INHERITANCE[control.id].status) {
        const target = TARGET_INHERITANCE[control.id]
        changes.push({
          controlId: control.id,
          requirement: control.requirement,
          currentStatus: control.status,
          targetStatus: target.status,
          targetProvider: target.provider,
          justification: target.notes,
          priority: 'high'
        })
      }
    }
    
    // Generate report
    const report = generateReport(controls, changes)
    await writeFile(REPORT_PATH, report, 'utf-8')
    
    console.log('='.repeat(80))
    console.log('CONTROL INHERITANCE REASSESSMENT REPORT')
    console.log('='.repeat(80))
    console.log(`\nTotal Controls Analyzed: ${controls.length}`)
    console.log(`Currently Inherited: ${inheritedControls.length}`)
    console.log(`Changes Required: ${changes.length}\n`)
    
    const highPriority = changes.filter(c => c.priority === 'high')
    const mediumPriority = changes.filter(c => c.priority === 'medium')
    const lowPriority = changes.filter(c => c.priority === 'low')
    
    console.log(`High Priority Changes: ${highPriority.length}`)
    highPriority.forEach(change => {
      console.log(`  - ${change.controlId}: ${change.currentStatus} → ${change.targetStatus}`)
      console.log(`    Reason: ${change.justification}`)
    })
    
    if (mediumPriority.length > 0) {
      console.log(`\nMedium Priority Changes: ${mediumPriority.length}`)
      mediumPriority.forEach(change => {
        console.log(`  - ${change.controlId}: ${change.currentStatus} → ${change.targetStatus}`)
      })
    }
    
    console.log(`\n✅ Report generated: ${REPORT_PATH}`)
    console.log('\nNext Steps:')
    console.log('1. Review the detailed report')
    console.log('2. Update SCTM with corrected control statuses')
    console.log('3. Update inherited controls documentation')
    
  } catch (error) {
    console.error('Error analyzing inheritance:', error)
    process.exit(1)
  }
}

function generateReport(controls: Control[], changes: InheritanceChange[]): string {
  const timestamp = new Date().toISOString().split('T')[0]
  
  let report = `# Control Inheritance Reassessment Report - CMMC Level 2

**Document Version:** 1.0  
**Date:** ${timestamp}  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2

**Applies to:** CMMC 2.0 Level 2 (FCI and CUI system)

---

## 1. Purpose

This report documents the reassessment of control inheritance status to align with the assessor-defensible inheritance matrix. The goal is to avoid overclaim findings by ensuring controls are correctly attributed to the appropriate third-party providers (Google Cloud, Railway, GitHub) or marked as implemented/N/A where appropriate.

---

## 2. Executive Summary

**Total Controls Analyzed:** ${controls.length}  
**Currently Inherited Controls:** ${controls.filter(c => c.status === 'inherited').length}  
**Changes Required:** ${changes.length}

**Key Findings:**
- ${changes.filter(c => c.priority === 'high').length} high-priority changes (overclaims that must be corrected)
- ${changes.filter(c => c.priority === 'medium').length} medium-priority changes (missing inheritance)
- ${changes.filter(c => c.priority === 'low').length} low-priority changes (documentation improvements)

---

## 3. Current State Analysis

### 3.1 Currently Inherited Controls

| Control ID | Requirement | Current Provider | Implementation Notes |
|------------|-------------|------------------|----------------------|
${controls.filter(c => c.status === 'inherited').map(c => {
  const provider = extractProvider(c.implementation) || 'Unknown'
  return `| ${c.id} | ${c.requirement.substring(0, 50)}... | ${provider} | ${c.implementation.substring(0, 60)}... |`
}).join('\n')}

---

## 4. Required Changes

### 4.1 High Priority Changes (Overclaims)

These controls are incorrectly marked as inherited and must be corrected to avoid assessor findings:

${changes.filter(c => c.priority === 'high').map((change, idx) => `
#### ${idx + 1}. Control ${change.controlId}: ${change.requirement}

**Current Status:** ${getStatusEmoji(change.currentStatus)} ${change.currentStatus} (${change.currentProvider || 'Unknown provider'})  
**Target Status:** ${getStatusEmoji(change.targetStatus)} ${change.targetStatus}${change.targetProvider ? ` (${change.targetProvider})` : ''}

**Justification:**  
${change.justification}

**Action Required:**  
Update SCTM to change status from "${change.currentStatus}" to "${change.targetStatus}"${change.targetProvider ? ` with provider "${change.targetProvider}"` : ''}.
`).join('\n')}

### 4.2 Medium Priority Changes (Missing Inheritance)

These controls should be marked as inherited/partial but are currently not:

${changes.filter(c => c.priority === 'medium').map((change, idx) => `
#### ${idx + 1}. Control ${change.controlId}: ${change.requirement}

**Current Status:** ${getStatusEmoji(change.currentStatus)} ${change.currentStatus}  
**Target Status:** ${getStatusEmoji(change.targetStatus)} ${change.targetStatus} (${change.targetProvider})

**Justification:**  
${change.justification}

**Action Required:**  
Update SCTM to change status to "${change.targetStatus}" with provider "${change.targetProvider}".
`).join('\n')}

${changes.filter(c => c.priority === 'low').length > 0 ? `
### 4.3 Low Priority Changes (Documentation)

${changes.filter(c => c.priority === 'low').map((change, idx) => `
#### ${idx + 1}. Control ${change.controlId}: ${change.requirement}

**Current Status:** ${getStatusEmoji(change.currentStatus)} ${change.currentStatus}  
**Target Status:** ${getStatusEmoji(change.targetStatus)} ${change.targetStatus}${change.targetProvider ? ` (${change.targetProvider})` : ''}

**Justification:**  
${change.justification}
`).join('\n')}
` : ''}

---

## 5. Provider-Specific Recommendations

### 5.1 Google Cloud Platform (CUI Vault Infrastructure)

**Controls to Mark as Inherited:**
- 3.10.1-3.10.6 (PE - Physical Protection) - ✅ Fully Inherited from GCP data centers

**Controls to Mark as Partial:**
- 3.13.1 (SC - Boundary Protection) - ⚠️ Partial (Cloud perimeter only; VM/network config is customer)
- 3.13.5 (SC - Network Segmentation) - ⚠️ Partial (VPC/hypervisor separation)
- 3.13.6 (SC - Default Deny) - ⚠️ Partial (Infrastructure routing only)
- 3.13.9 (SC - Session Termination) - ⚠️ Partial (Fabric-level only)

**Controls NOT Inherited from GCP:**
- AC, AU, IA (OS users), FIPS crypto, logging, patching, sshd, database security, CUI handling - These are customer-implemented

### 5.2 Railway (Main Application Hosting - non-CUI)

**Controls to Mark as Partial:**
- 3.13.8 (SC - TLS/Transport Security) - ⚠️ Partial (Platform TLS only, non-CUI)

**Controls to REMOVE from Railway Inheritance:**
${RAILWAY_OVERCLAIMS.map(id => {
  const control = controls.find(c => c.id === id)
  return `- ${id}${control ? ` - ${control.requirement}` : ''}`
}).join('\n')}

**Important Constraint:**
- No CUI is stored or processed on Railway
- No FIPS claims are inherited from Railway

### 5.3 GitHub (Source Code Repository)

**Controls to Mark as Inherited:**
- 3.10.1-3.10.6 (PE - Physical Protection) - ✅ Fully Inherited from GitHub facilities

**Controls to Mark as Partial:**
- 3.13.1 (SC - Boundary Protection) - ⚠️ Partial (Platform edge security)
- 3.5.2 (IA - MFA for Platform Accounts) - ⚠️ Partial (GitHub org-level MFA)
- 3.4.8 (CM - Repo Integrity) - ⚠️ Partial (Branch protection)

**Controls NOT Inherited from GitHub:**
- Code quality, secrets handling, secure development practices, CI/CD security decisions

---

## 6. Implementation Plan

1. **Update SCTM Control Statuses**
   - Change status from "Inherited" to "Implemented" for overclaimed controls
   - Change status from "Inherited" to "Partial" where appropriate
   - Add GCP and GitHub inheritance where missing
   - Update implementation notes to reflect correct provider

2. **Update Inherited Controls Documentation**
   - File: \`compliance/cmmc/level2/03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md\`
   - Add GCP section
   - Update Railway section (remove CUI-related claims)
   - Add GitHub section
   - Add assessor-grade summary statement

3. **Update System Security Plan**
   - Update external service provider sections
   - Add inheritance justification statements

4. **Recalculate Summary Statistics**
   - Update inherited vs. implemented counts
   - Update control family breakdowns

---

## 7. Assessor-Grade Summary Statement

> **MacTech Solutions implements the majority of CMMC Level 2 controls internally.
> Limited infrastructure-level controls are inherited from Google Cloud Platform, Railway, and GitHub under the shared responsibility model.
> No cryptographic, identity, access control, logging, or CUI handling controls are inherited from third-party providers.**

This statement prevents overclaim failures.

---

## 8. Related Documents

- System Control Traceability Matrix: \`MAC-AUD-408_System_Control_Traceability_Matrix.md\`
- Inherited Controls Appendix: \`../03-control-responsibility/MAC-RPT-312_Inherited_Controls_Appendix.md\`
- System Security Plan: \`../01-system-scope/MAC-IT-304_System_Security_Plan.md\`

---

## 9. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Reviewed By:** [To be completed]  
**Approved By:** [To be completed]  
**Next Review Date:** ${new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]}

**Change History:**
- Version 1.0 (${timestamp}): Initial control inheritance reassessment report
`

  return report
}

main().catch(console.error)
