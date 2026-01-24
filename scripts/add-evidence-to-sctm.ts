/**
 * Add evidence files to SCTM controls that need them
 * This script actively adds evidence references to controls with missing or generic evidence
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { auditAllControls } from '../lib/compliance/control-audit'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2')
const EVIDENCE_ROOT = join(COMPLIANCE_ROOT, '05-evidence')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

// Map controls to their evidence files (including newly created ones)
const CONTROL_EVIDENCE_MAP: Record<string, string[]> = {
  '3.1.4': ['MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md'],
  '3.1.8': ['MAC-RPT-105_Account_Lockout_Implementation_Evidence.md'],
  '3.1.9': ['user-agreements/MAC-USR-001-Patrick_User_Agreement.md'],
  '3.1.10': ['MAC-RPT-106_Session_Lock_Implementation_Evidence.md'],
  '3.1.18': ['MAC-IT-301_System_Description_and_Architecture.md', 'MAC-RPT-121_3_1_18_control_mobile_devices_Evidence.md'],
  '3.1.19': ['MAC-IT-301_System_Description_and_Architecture.md', 'MAC-RPT-121_3_1_19_encrypt_cui_on_mobile_devices_Evidence.md'],
  '3.1.20': ['MAC-IT-304_System_Security_Plan.md', 'MAC-RPT-121_3_1_20_verify_external_systems_Evidence.md'],
  '3.1.21': ['MAC-RPT-118_Portable_Storage_Controls_Evidence.md', 'MAC-IT-301_System_Description_and_Architecture.md'],
  '3.1.22': ['middleware.ts', 'MAC-RPT-121_3_1_22_control_cui_on_public_systems_Evidence.md'],
  '3.2.1': ['training/security-awareness-training-content.md', 'training/training-completion-log.md'],
  '3.2.2': ['training/training-completion-log.md', 'training/security-awareness-training-content.md'],
  '3.2.3': ['training/training-completion-log.md', 'training/security-awareness-training-content.md'],
  '3.3.1': ['MAC-RPT-107_Audit_Log_Retention_Evidence.md', 'lib/audit.ts'],
  '3.3.3': ['audit-log-reviews/audit-log-review-log.md'],
  '3.4.1': ['MAC-CMP-001_Configuration_Management_Plan.md', 'MAC-RPT-108_Configuration_Baseline_Evidence.md'],
  '3.4.2': ['MAC-RPT-108_Configuration_Baseline_Evidence.md', 'next.config.js', 'middleware.ts'],
  '3.4.3': ['MAC-RPT-109_Change_Control_Evidence.md'],
  '3.4.4': ['security-impact-analysis/security-impact-analysis-template.md'],
  '3.4.5': ['MAC-CMP-001_Configuration_Management_Plan.md', 'MAC-RPT-109_Change_Control_Evidence.md'],
  '3.4.6': ['MAC-IT-301_System_Description_and_Architecture.md'],
  '3.4.8': ['MAC-POL-226_Software_Restriction_Policy.md', 'package.json'],
  '3.5.3': ['MAC-RPT-104_MFA_Implementation_Evidence.md', 'lib/mfa.ts', 'app/auth/mfa/'],
  '3.5.5': ['MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md', 'prisma/schema.prisma'],
  '3.5.8': ['MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md'],
  '3.6.1': ['MAC-IRP-001_Incident_Response_Plan.md'],
  '3.6.2': ['MAC-IRP-001_Incident_Response_Plan.md'],
  '3.7.1': ['MAC-IT-301_System_Description_and_Architecture.md', 'MAC-IT-304_System_Security_Plan.md'],
  '3.7.5': ['MAC-RPT-110_Maintenance_MFA_Evidence.md', 'MAC-IT-301_System_Description_and_Architecture.md'],
  '3.9.2': ['personnel-screening/screening-completion-log.md', 'personnel-screening/screening-records-template.md'],
  '3.10.1': ['MAC-IT-301_System_Description_and_Architecture.md', 'MAC-RPT-121_3_10_1_limit_physical_access_Evidence.md'],
  '3.10.2': ['MAC-POL-212_Physical_Security_Policy.md'],
  '3.10.3': ['MAC-RPT-111_Visitor_Controls_Evidence.md'],
  '3.10.4': ['/admin/physical-access-logs'],
  '3.11.1': ['MAC-AUD-404_Risk_Assessment_Report.md'],
  '3.11.2': ['MAC-RPT-114_Vulnerability_Scanning_Evidence.md', 'MAC-RPT-103_Dependabot_Configuration_Evidence.md'],
  '3.11.3': ['MAC-RPT-115_Vulnerability_Remediation_Evidence.md'],
  '3.12.1': ['MAC-AUD-401_Internal_Cybersecurity_Self-Assessment.md', 'MAC-AUD-406_Security_Control_Assessment_Report.md', 'MAC-AUD-408_System_Control_Traceability_Matrix.md'],
  '3.12.2': ['MAC-AUD-405_POA&M_Tracking_Log.md'],
  '3.12.3': ['MAC-AUD-407_Continuous_Monitoring_Log.md'],
  '3.12.4': ['MAC-IT-304_System_Security_Plan.md'],
  '3.13.2': ['MAC-IT-301_System_Description_and_Architecture.md'],
  '3.13.10': ['MAC-RPT-116_Cryptographic_Key_Management_Evidence.md'],
  '3.13.13': ['MAC-RPT-117_Mobile_Code_Control_Evidence.md'],
  '3.14.1': ['MAC-RPT-103_Dependabot_Configuration_Evidence.md'],
  '3.14.2': ['MAC-RPT-112_Physical_Access_Device_Evidence.md'],
  '3.14.3': ['MAC-RPT-114_Vulnerability_Scanning_Evidence.md'],
  '3.14.7': ['MAC-RPT-119_Unauthorized_Use_Detection_Evidence.md'],
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await import('fs/promises').then(fs => fs.access(path))
    return true
  } catch {
    return false
  }
}

async function verifyEvidenceFile(ref: string): Promise<string | null> {
  // Check evidence root
  const evidencePath = join(EVIDENCE_ROOT, ref)
  if (await fileExists(evidencePath)) {
    return ref
  }
  
  // Check with .md extension
  const refWithExt = ref.endsWith('.md') ? ref : `${ref}.md`
  const evidencePathExt = join(EVIDENCE_ROOT, refWithExt)
  if (await fileExists(evidencePathExt)) {
    return refWithExt
  }
  
  // Check subdirectories
  const subdirs = ['audit-log-reviews', 'endpoint-verifications', 'incident-response', 
                   'personnel-screening', 'security-impact-analysis', 'training', 
                   'vulnerability-remediation']
  for (const subdir of subdirs) {
    const subdirPath = join(EVIDENCE_ROOT, subdir, refWithExt)
    if (await fileExists(subdirPath)) {
      return `${subdir}/${refWithExt}`
    }
  }
  
  // Check policies and system scope
  if (ref.includes('MAC-IT-') || ref.includes('MAC-POL-') || ref.includes('user-agreements')) {
    const policyPath = join(COMPLIANCE_ROOT, '02-policies-and-procedures', refWithExt)
    if (await fileExists(policyPath)) {
      return refWithExt
    }
    const systemScopePath = join(COMPLIANCE_ROOT, '01-system-scope', refWithExt)
    if (await fileExists(systemScopePath)) {
      return refWithExt
    }
  }
  
  return null
}

async function updateSCTM(updates: Map<string, string>): Promise<void> {
  const sctmContent = await readFile(SCTM_PATH, 'utf-8')
  const lines = sctmContent.split('\n')
  const updatedLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('|') && line.includes('|')) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c)
      
      if (cells.length >= 8 && cells[0].match(/^\d+\.\d+\.\d+/)) {
        const controlId = cells[0]
        const newEvidence = updates.get(controlId)
        
        if (newEvidence !== undefined) {
          cells[5] = newEvidence // Evidence column
          updatedLines.push('| ' + cells.join(' | ') + ' |')
          continue
        }
      }
    }
    
    updatedLines.push(line)
  }

  await writeFile(SCTM_PATH, updatedLines.join('\n'), 'utf-8')
}

async function main() {
  console.log('Adding evidence files to SCTM controls...\n')

  try {
    const auditResults = await auditAllControls()
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)

    const evidenceUpdates = new Map<string, string>()
    const linkedFiles: string[] = []

    // Process each implemented control
    for (const audit of auditResults) {
      if (audit.claimedStatus !== 'implemented') {
        continue
      }

      const control = controls.find(c => c.id === audit.controlId)
      if (!control) continue

      const evidenceRefs: string[] = []

      // 1. Get control-specific evidence
      const controlEvidence = CONTROL_EVIDENCE_MAP[audit.controlId] || []
      for (const ref of controlEvidence) {
        const verified = await verifyEvidenceFile(ref)
        if (verified) {
          if (!evidenceRefs.includes(verified)) {
            evidenceRefs.push(verified)
          }
          if (!linkedFiles.includes(verified)) {
            linkedFiles.push(verified)
          }
        } else if (ref.includes('.ts') || ref.includes('.tsx') || ref.includes('.js') || 
                   ref.startsWith('/api/') || ref.startsWith('/admin/')) {
          // Code files and API routes - keep as-is
          if (!evidenceRefs.includes(ref)) {
            evidenceRefs.push(ref)
          }
        }
      }

      // 2. Keep existing valid evidence references
      const currentRefs = control.evidence.split(',').map(r => r.trim()).filter(r => r && r !== '-')
      for (const ref of currentRefs) {
        // Keep code files and API routes
        if (ref.includes('.ts') || ref.includes('.tsx') || ref.includes('.js') || 
            ref.startsWith('/api/') || ref.startsWith('/admin/')) {
          if (!evidenceRefs.includes(ref)) {
            evidenceRefs.push(ref)
          }
          continue
        }

        // Verify file exists
        const verified = await verifyEvidenceFile(ref)
        if (verified) {
          if (!evidenceRefs.includes(verified)) {
            evidenceRefs.push(verified)
          }
        } else if (!ref.includes('System architecture') && !ref.includes('Railway platform') && 
                   !ref.includes('Browser access') &&
                   !ref.includes('External APIs') && !ref.includes('Minimal features')) {
          // Remove invalid file references (but keep generic descriptive ones)
          // They'll be replaced by control-specific evidence above
        }
      }

      // Update if evidence changed or if we have new evidence to add
      const newEvidence = evidenceRefs.length > 0 ? evidenceRefs.join(', ') : (control.evidence === '-' ? '-' : control.evidence)
      if (newEvidence !== control.evidence) {
        evidenceUpdates.set(audit.controlId, newEvidence)
      }
    }

    // Update SCTM
    console.log(`\nUpdating SCTM with ${evidenceUpdates.size} evidence updates...`)
    await updateSCTM(evidenceUpdates)
    console.log(`✓ Updated SCTM: ${SCTM_PATH}`)

    console.log(`\n${'='.repeat(80)}`)
    console.log('SUMMARY')
    console.log('='.repeat(80))
    console.log(`Controls updated: ${evidenceUpdates.size}`)
    console.log(`Evidence files linked: ${linkedFiles.length}`)

    if (linkedFiles.length > 0) {
      console.log(`\nLinked Evidence Files:`)
      Array.from(new Set(linkedFiles)).forEach(file => {
        console.log(`  - ${file}`)
      })
    }

    console.log(`\n\n✅ Evidence addition complete!`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(console.error)
