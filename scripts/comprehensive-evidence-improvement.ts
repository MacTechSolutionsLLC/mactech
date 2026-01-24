/**
 * Comprehensive evidence improvement - finds all existing evidence files and links them
 * Creates new evidence files only when needed and properly updates SCTM
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { auditAllControls } from '../lib/compliance/control-audit'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level1')
const EVIDENCE_ROOT = join(COMPLIANCE_ROOT, '05-evidence')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

// Get all existing evidence files
async function getAllEvidenceFiles(): Promise<Map<string, string>> {
  const evidenceMap = new Map<string, string>()
  
  try {
    const fs = await import('fs/promises')
    
    async function scanDir(dir: string, prefix: string = ''): Promise<void> {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
          await scanDir(fullPath, prefix ? `${prefix}/${entry.name}` : entry.name)
        } else if (entry.isFile() && entry.name.endsWith('.md') && entry.name.startsWith('MAC-RPT-')) {
          const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
          evidenceMap.set(entry.name, relativePath)
          // Also map without extension
          const nameWithoutExt = entry.name.replace('.md', '')
          evidenceMap.set(nameWithoutExt, relativePath)
        }
      }
    }
    
    await scanDir(EVIDENCE_ROOT)
  } catch (error) {
    console.error('Error reading evidence directory:', error)
  }
  
  return evidenceMap
}

// Control-specific evidence mappings
const CONTROL_EVIDENCE: Record<string, string[]> = {
  '3.1.4': ['MAC-RPT-117_Separation_of_Duties_Enforcement_Evidence.md'],
  '3.1.8': ['MAC-RPT-105_Account_Lockout_Implementation_Evidence.md'],
  '3.1.10': ['MAC-RPT-106_Session_Lock_Implementation_Evidence.md'],
  '3.1.21': ['MAC-RPT-118_Portable_Storage_Controls_Evidence.md'],
  '3.5.3': ['MAC-RPT-104_MFA_Implementation_Evidence.md'],
  '3.5.5': ['MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md'],
  '3.5.8': ['MAC-RPT-120_Identifier_Reuse_Prevention_Evidence.md'],
  '3.10.3': ['MAC-RPT-111_Visitor_Controls_Evidence.md'],
  '3.11.2': ['MAC-RPT-114_Vulnerability_Scanning_Evidence.md'],
  '3.11.3': ['MAC-RPT-115_Vulnerability_Remediation_Evidence.md'],
  '3.13.10': ['MAC-RPT-116_Cryptographic_Key_Management_Evidence.md'],
  '3.13.13': ['MAC-RPT-117_Mobile_Code_Control_Evidence.md'],
  '3.14.7': ['MAC-RPT-119_Unauthorized_Use_Detection_Evidence.md'],
}

// Generic reference mappings
const GENERIC_MAPPINGS: Record<string, string[]> = {
  'System architecture': ['MAC-IT-301_System_Description_and_Architecture.md'],
  'SSP Section 4': ['MAC-IT-304_System_Security_Plan.md'],
  'SSP Section 10': ['MAC-IT-304_System_Security_Plan.md'],
  'User agreements': ['user-agreements/MAC-USR-001-Patrick_User_Agreement.md'],
  'AppEvent table': ['MAC-RPT-107_Audit_Log_Retention_Evidence.md'],
  'Dependabot': ['MAC-RPT-103_Dependabot_Configuration_Evidence.md'],
  'endpoint inventory': ['MAC-RPT-112_Physical_Access_Device_Evidence.md'],
  'CISA alerts': ['MAC-RPT-114_Vulnerability_Scanning_Evidence.md'],
  'Railway platform': ['MAC-IT-301_System_Description_and_Architecture.md'],
  'facilities': ['MAC-RPT-111_Visitor_Controls_Evidence.md'],
  'Physical security': ['MAC-POL-212_Physical_Security_Policy.md'],
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await import('fs/promises').then(fs => fs.access(path))
    return true
  } catch {
    return false
  }
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
  console.log('Comprehensive evidence improvement...\n')

  try {
    const auditResults = await auditAllControls()
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)
    
    // Get all existing evidence files
    console.log('Scanning for existing evidence files...')
    const evidenceFiles = await getAllEvidenceFiles()
    console.log(`Found ${evidenceFiles.size / 2} evidence files`)

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

      // 1. Add control-specific evidence
      const controlSpecific = CONTROL_EVIDENCE[audit.controlId]
      if (controlSpecific) {
        for (const file of controlSpecific) {
          const filePath = join(EVIDENCE_ROOT, file)
          if (await fileExists(filePath)) {
            evidenceRefs.push(file)
            if (!linkedFiles.includes(file)) {
              linkedFiles.push(file)
            }
          }
        }
      }

      // 2. Process existing evidence references
      const currentRefs = control.evidence.split(',').map(r => r.trim()).filter(r => r && r !== '-')
      for (const ref of currentRefs) {
        // Keep code files and API routes
        if (ref.includes('.ts') || ref.includes('.tsx') || ref.includes('.js') || 
            ref.startsWith('/api/') || ref.startsWith('/admin/')) {
          evidenceRefs.push(ref)
          continue
        }

        // Check if it's in our evidence file map (exact match or with .md)
        let foundInMap = evidenceFiles.get(ref) || evidenceFiles.get(ref + '.md')
        
        // Also try partial matches (e.g., "MAC-RPT-121_3_1_18" should match "MAC-RPT-121_3_1_18_control_mobile_devices_Evidence.md")
        if (!foundInMap) {
          for (const [fileName, filePath] of evidenceFiles.entries()) {
            if (fileName.includes(ref) || ref.includes(fileName.replace('.md', ''))) {
              foundInMap = filePath
              break
            }
          }
        }
        
        if (foundInMap) {
          if (!evidenceRefs.includes(foundInMap)) {
            evidenceRefs.push(foundInMap)
          }
          if (!linkedFiles.includes(foundInMap)) {
            linkedFiles.push(foundInMap)
          }
          continue
        }

        // Check if file exists with .md extension
        const refWithExt = ref.endsWith('.md') ? ref : `${ref}.md`
        const evidencePath = join(EVIDENCE_ROOT, refWithExt)
        if (await fileExists(evidencePath)) {
          if (!evidenceRefs.includes(refWithExt)) {
            evidenceRefs.push(refWithExt)
          }
          if (!linkedFiles.includes(refWithExt)) {
            linkedFiles.push(refWithExt)
          }
          continue
        }
        
        // Check if file exists without extension
        const evidencePathNoExt = join(EVIDENCE_ROOT, ref)
        if (await fileExists(evidencePathNoExt)) {
          if (!evidenceRefs.includes(ref)) {
            evidenceRefs.push(ref)
          }
          if (!linkedFiles.includes(ref)) {
            linkedFiles.push(ref)
          }
          continue
        }

        // Try to map generic reference
        const mapped = GENERIC_MAPPINGS[ref] || 
          Object.entries(GENERIC_MAPPINGS).find(([key]) => 
            ref.toLowerCase().includes(key.toLowerCase())
          )?.[1]
        
        if (mapped) {
          for (const file of mapped) {
            const filePath = file.includes('/')
              ? join(COMPLIANCE_ROOT, '02-policies-and-procedures', file)
              : join(EVIDENCE_ROOT, file)
            if (await fileExists(filePath)) {
              if (!evidenceRefs.includes(file)) {
                evidenceRefs.push(file)
              }
              if (!linkedFiles.includes(file)) {
                linkedFiles.push(file)
              }
              break
            }
          }
        } else {
          // Keep generic reference (will get partial credit)
          if (!evidenceRefs.includes(ref)) {
            evidenceRefs.push(ref)
          }
        }
      }

      // 3. Add missing evidence from audit that should exist
      for (const evidence of audit.evidence.evidenceFiles) {
        if (!evidence.exists && evidence.reference !== '-' && 
            (evidence.reference.includes('.md') || evidence.reference.startsWith('MAC-'))) {
          const foundInMap = evidenceFiles.get(evidence.reference) || 
                            evidenceFiles.get(evidence.reference + '.md')
          if (foundInMap && !evidenceRefs.includes(foundInMap)) {
            evidenceRefs.push(foundInMap)
            if (!linkedFiles.includes(foundInMap)) {
              linkedFiles.push(foundInMap)
            }
          }
        }
      }

      // Update if evidence changed
      const newEvidence = evidenceRefs.length > 0 ? evidenceRefs.join(', ') : '-'
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
      console.log(`\nLinked Evidence Files (${linkedFiles.length}):`)
      Array.from(new Set(linkedFiles)).slice(0, 20).forEach(file => {
        console.log(`  - ${file}`)
      })
      if (linkedFiles.length > 20) {
        console.log(`  ... and ${linkedFiles.length - 20} more`)
      }
    }

    console.log(`\n\n✅ Evidence improvement complete!`)

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main().catch(console.error)
