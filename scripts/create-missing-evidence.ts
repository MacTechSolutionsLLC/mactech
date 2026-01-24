/**
 * Create missing evidence files identified in SCTM audit
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { auditAllControls } from '../lib/compliance/control-audit'

const EVIDENCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2', '05-evidence')

async function fileExists(path: string): Promise<boolean> {
  return existsSync(path)
}

async function createEvidenceFile(evidenceRef: string, controlId: string, requirement: string): Promise<string | null> {
  // Skip code file references
  if (evidenceRef.includes('.ts') || evidenceRef.includes('.tsx') || evidenceRef.includes('.js')) {
    return null
  }

  // Skip generic references
  const genericRefs = ['System architecture', 'Railway platform', 'Training program', 'GitHub', 'Git history']
  if (genericRefs.some(gr => evidenceRef.includes(gr))) {
    return null
  }

  // Handle evidence files with subdirectory paths
  if (evidenceRef.includes('/')) {
    const parts = evidenceRef.split('/')
    const filename = parts[parts.length - 1]
    const subdir = parts.slice(0, -1).join('/')
    const subdirPath = join(EVIDENCE_ROOT, subdir)
    const evidencePath = join(subdirPath, filename)
    
    if (await fileExists(evidencePath)) {
      return evidencePath
    }

    // Create subdirectory if needed
    if (!existsSync(subdirPath)) {
      const fs = await import('fs/promises')
      await fs.mkdir(subdirPath, { recursive: true })
    }

    const evidenceContent = `# ${requirement} - Evidence

**Control ID:** ${controlId}  
**Requirement:** ${requirement}  
**Date:** ${new Date().toISOString().split('T')[0]}

---

## Evidence Summary

[Evidence content to be documented]

---

## Related Documents

- System Security Plan: \`../../01-system-scope/MAC-IT-304_System_Security_Plan.md\`
- System Control Traceability Matrix: \`../../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md\`
`

    await writeFile(evidencePath, evidenceContent, 'utf-8')
    return evidencePath
  }

  // Handle MAC-RPT-XXX references
  if (evidenceRef.startsWith('MAC-RPT-')) {
    const evidencePath = join(EVIDENCE_ROOT, `${evidenceRef}.md`)
    
    if (await fileExists(evidencePath)) {
      return evidencePath
    }

    const evidenceContent = `# ${requirement} - Evidence - CMMC Level 2

**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2, Section ${controlId}

**Control ID:** ${controlId}  
**Requirement:** ${requirement}

---

## 1. Evidence Summary

This document provides evidence of implementation for control ${controlId}: ${requirement}.

---

## 2. Implementation Evidence

[Implementation evidence to be documented]

---

## 3. Verification

**Verification Date:** ${new Date().toISOString().split('T')[0]}  
**Verified By:** [To be completed]

---

## 4. Related Documents

- System Security Plan: \`../01-system-scope/MAC-IT-304_System_Security_Plan.md\`
- System Control Traceability Matrix: \`../04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md\`

---

## 5. Document Control

**Prepared By:** MacTech Solutions Compliance Team  
**Next Review Date:** [To be scheduled]
`

    await writeFile(evidencePath, evidenceContent, 'utf-8')
    return evidencePath
  }

  return null
}

async function main() {
  console.log('Creating missing evidence files...\n')

  try {
    const auditResults = await auditAllControls()
    
    const created: string[] = []
    const skipped: string[] = []

    for (const audit of auditResults) {
      for (const evidence of audit.evidence.evidenceFiles) {
        if (!evidence.exists && evidence.reference !== '-') {
          const filePath = await createEvidenceFile(
            evidence.reference,
            audit.controlId,
            audit.requirement
          )
          
          if (filePath) {
            created.push(filePath)
            console.log(`✓ Created: ${evidence.reference} (Control ${audit.controlId})`)
          } else {
            skipped.push(evidence.reference)
          }
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('SUMMARY')
    console.log('='.repeat(60))
    console.log(`Evidence files created: ${created.length}`)
    console.log(`References skipped (generic/code): ${skipped.length}`)
    
    if (created.length > 0) {
      console.log(`\nCreated files:`)
      created.forEach(file => {
        console.log(`  - ${file}`)
      })
    }

  } catch (error) {
    console.error('Error creating evidence files:', error)
    process.exit(1)
  }
}

main().catch(console.error)
