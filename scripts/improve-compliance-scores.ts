/**
 * Improve compliance scores by addressing gaps
 * This script identifies specific actions needed to bring controls to 100%
 */

import { auditAllControls } from '../lib/compliance/control-audit'
import { parseSCTM } from '../lib/compliance/sctm-parser'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level1')
const EVIDENCE_ROOT = join(COMPLIANCE_ROOT, '05-evidence')
const POLICIES_ROOT = join(COMPLIANCE_ROOT, '02-policies-and-procedures')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

interface ImprovementAction {
  controlId: string
  requirement: string
  currentScore: number
  action: 'create_evidence' | 'update_sctm' | 'verify_code' | 'create_policy' | 'create_procedure'
  description: string
  target: string
  priority: 'high' | 'medium' | 'low'
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await import('fs/promises').then(fs => fs.access(path))
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('Analyzing compliance improvements needed...\n')

  try {
    const auditResults = await auditAllControls()
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)

    // Focus on implemented controls < 100%
    const implementedControls = auditResults.filter(a => 
      a.claimedStatus === 'implemented' && a.complianceScore < 100
    )

    const actions: ImprovementAction[] = []

    for (const audit of implementedControls) {
      const control = controls.find(c => c.id === audit.controlId)
      if (!control) continue

      // Check for missing evidence files (that are actual file references)
      audit.evidence.evidenceFiles.forEach(e => {
        if (!e.exists && e.reference !== '-' && 
            !e.reference.includes('System architecture') &&
            !e.reference.includes('Railway platform') &&
            !e.reference.includes('SSP Section') &&
            !e.reference.startsWith('/api/') &&
            !e.reference.startsWith('/admin/')) {
          
          // Check if it's a file reference we should create
          if (e.reference.includes('.md') || e.reference.startsWith('MAC-')) {
            actions.push({
              controlId: audit.controlId,
              requirement: audit.requirement,
              currentScore: audit.complianceScore,
              action: 'create_evidence',
              description: `Create evidence file: ${e.reference}`,
              target: e.reference,
              priority: audit.complianceScore < 50 ? 'high' : audit.complianceScore < 70 ? 'medium' : 'low'
            })
          }
        }
      })

      // Check for missing code verification (actual file paths)
      audit.evidence.codeVerification.forEach(c => {
        if (!c.exists && c.file && c.file !== '-' && 
            !c.file.includes('System architecture') &&
            !c.file.includes('Railway platform') &&
            !c.file.includes('Browser access') &&
            !c.file.includes('No local CUI') &&
            !c.file.includes('External APIs') &&
            !c.file.includes('Minimal features') &&
            !c.file.includes('Platform/app')) {
          
          if (c.file.includes('.ts') || c.file.includes('.tsx') || c.file.includes('/')) {
            actions.push({
              controlId: audit.controlId,
              requirement: audit.requirement,
              currentScore: audit.complianceScore,
              action: 'verify_code',
              description: `Verify code implementation exists: ${c.file}`,
              target: c.file,
              priority: audit.complianceScore < 50 ? 'high' : 'medium'
            })
          }
        }
      })
    }

    // Group actions by type
    const actionsByType = {
      create_evidence: actions.filter(a => a.action === 'create_evidence'),
      verify_code: actions.filter(a => a.action === 'verify_code'),
      create_policy: actions.filter(a => a.action === 'create_policy'),
      create_procedure: actions.filter(a => a.action === 'create_procedure'),
      update_sctm: actions.filter(a => a.action === 'update_sctm'),
    }

    console.log('='.repeat(80))
    console.log('COMPLIANCE IMPROVEMENT PLAN')
    console.log('='.repeat(80))
    console.log(`\nTotal Actions Needed: ${actions.length}`)
    console.log(`\nActions by Type:`)
    console.log(`  Create Evidence Files: ${actionsByType.create_evidence.length}`)
    console.log(`  Verify Code: ${actionsByType.verify_code.length}`)
    console.log(`  Create Policies: ${actionsByType.create_policy.length}`)
    console.log(`  Create Procedures: ${actionsByType.create_procedure.length}`)
    console.log(`  Update SCTM: ${actionsByType.update_sctm.length}`)

    // Show high priority actions
    const highPriority = actions.filter(a => a.priority === 'high')
    console.log(`\n\nHigh Priority Actions (${highPriority.length}):`)
    highPriority.slice(0, 20).forEach((action, index) => {
      console.log(`\n${index + 1}. Control ${action.controlId} (Score: ${action.currentScore}%)`)
      console.log(`   Action: ${action.description}`)
      console.log(`   Requirement: ${action.requirement}`)
    })

    // Explain scoring system
    console.log(`\n\n${'='.repeat(80)}`)
    console.log('UNDERSTANDING THE SCORING SYSTEM')
    console.log('='.repeat(80))
    console.log(`
A control marked as "implemented" can still score < 100% because the compliance
score measures how well-documented and verified the implementation is, not just
whether it's claimed to be implemented.

Scoring Breakdown (100 points total):
- Policies: 20 points (all must exist for full points)
- Procedures: 20 points (all must exist for full points)
- Evidence Files: 30 points (all must exist for full points)
- Code Verification: 30 points (all must be verified for full points)

Why "Implemented" Controls Score < 100%:
1. Missing Evidence Files: Controls may be implemented but lack documentation
2. Generic References: Some references are descriptive (e.g., "System architecture")
   rather than actual files, which reduces the score
3. Code Not Verified: Implementation exists but code patterns aren't verified
4. Incomplete Documentation: Policies/procedures exist but not all referenced

To reach 100%:
- Ensure all referenced evidence files exist
- Replace generic references with actual file references where possible
- Verify code implementations match control requirements
- Complete all policy and procedure documentation
`)

    // Generate improvement recommendations
    console.log(`\n\n${'='.repeat(80)}`)
    console.log('RECOMMENDATIONS TO IMPROVE SCORES')
    console.log('='.repeat(80))

    // Count unique evidence files needed
    const uniqueEvidence = new Set(actionsByType.create_evidence.map(a => a.target))
    console.log(`\n1. Create ${uniqueEvidence.size} Missing Evidence Files`)
    console.log(`   These are actual file references that need to be created:`)
    Array.from(uniqueEvidence).slice(0, 15).forEach(e => {
      console.log(`   - ${e}`)
    })
    if (uniqueEvidence.size > 15) {
      console.log(`   ... and ${uniqueEvidence.size - 15} more`)
    }

    // Count code verification needed
    const uniqueCode = new Set(actionsByType.verify_code.map(a => a.target))
    console.log(`\n2. Verify ${uniqueCode.size} Code Implementations`)
    console.log(`   These code files need to be verified or created:`)
    Array.from(uniqueCode).slice(0, 10).forEach(c => {
      console.log(`   - ${c}`)
    })
    if (uniqueCode.size > 10) {
      console.log(`   ... and ${uniqueCode.size - 10} more`)
    }

    // Explain generic references
    console.log(`\n3. Address Generic References`)
    console.log(`   Many controls use descriptive references like:`)
    console.log(`   - "System architecture" (architectural documentation)`)
    console.log(`   - "Railway platform" (inherited platform controls)`)
    console.log(`   - "Browser access" (descriptive, not a file)`)
    console.log(`   - "External APIs" (descriptive, not a file)`)
    console.log(`   `)
    console.log(`   These reduce scores because they're not verifiable files.`)
    console.log(`   Options:`)
    console.log(`   a) Create actual evidence files documenting these`)
    console.log(`   b) Update SCTM to reference specific documentation files`)
    console.log(`   c) Accept lower scores for descriptive-only references`)

    // Calculate potential improvement
    const currentAvg = Math.round(implementedControls.reduce((sum, a) => sum + a.complianceScore, 0) / implementedControls.length)
    const potentialAvg = 100 // If all gaps addressed
    console.log(`\n\nPotential Score Improvement:`)
    console.log(`  Current Average: ${currentAvg}%`)
    console.log(`  Potential Average: ${potentialAvg}%`)
    console.log(`  Improvement: +${potentialAvg - currentAvg}%`)

    console.log(`\n\n✅ Analysis complete!`)
    console.log(`\nNext Steps:`)
    console.log(`1. Review high-priority actions (controls < 50%)`)
    console.log(`2. Create missing evidence files`)
    console.log(`3. Verify code implementations`)
    console.log(`4. Update SCTM with specific file references where possible`)
    console.log(`5. Re-run audit to verify improvements`)

  } catch (error) {
    console.error('Error analyzing improvements:', error)
    process.exit(1)
  }
}

main().catch(console.error)
