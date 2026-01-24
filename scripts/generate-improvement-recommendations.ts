/**
 * Generate specific improvement recommendations for each control
 * Creates actionable items to bring controls to 100%
 */

import { auditAllControls } from '../lib/compliance/control-audit'
import { parseSCTM } from '../lib/compliance/sctm-parser'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level1')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

interface Recommendation {
  controlId: string
  requirement: string
  currentScore: number
  action: string
  details: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedImpact: number // Points that could be gained
}

async function main() {
  console.log('Generating improvement recommendations...\n')

  try {
    const auditResults = await auditAllControls()
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)

    // Focus on implemented controls < 100%
    const implementedControls = auditResults.filter(a => 
      a.claimedStatus === 'implemented' && a.complianceScore < 100
    )

    const recommendations: Recommendation[] = []

    for (const audit of implementedControls) {
      const control = controls.find(c => c.id === audit.controlId)
      if (!control) continue

      let potentialGain = 0

      // Check policies
      const missingPolicies = audit.evidence.policies.filter(p => !p.exists && p.reference !== '-')
      if (missingPolicies.length > 0) {
        const existingPolicies = audit.evidence.policies.filter(p => p.exists).length
        const totalPolicies = audit.evidence.policies.length
        if (existingPolicies === 0) {
          potentialGain += 20 // Could gain full policy points
        } else {
          potentialGain += 10 // Could gain remaining policy points
        }
        
        recommendations.push({
          controlId: audit.controlId,
          requirement: audit.requirement,
          currentScore: audit.complianceScore,
          action: 'create_policies',
          details: `Create missing policy files: ${missingPolicies.map(p => p.reference).join(', ')}`,
          priority: audit.complianceScore < 50 ? 'critical' : audit.complianceScore < 70 ? 'high' : 'medium',
          estimatedImpact: potentialGain
        })
      }

      // Check procedures
      const missingProcedures = audit.evidence.procedures.filter(p => !p.exists && p.reference !== '-')
      if (missingProcedures.length > 0) {
        const existingProcedures = audit.evidence.procedures.filter(p => p.exists).length
        if (existingProcedures === 0) {
          potentialGain += 20
        } else {
          potentialGain += 10
        }
        
        recommendations.push({
          controlId: audit.controlId,
          requirement: audit.requirement,
          currentScore: audit.complianceScore,
          action: 'create_procedures',
          details: `Create missing procedure files: ${missingProcedures.map(p => p.reference).join(', ')}`,
          priority: audit.complianceScore < 50 ? 'critical' : audit.complianceScore < 70 ? 'high' : 'medium',
          estimatedImpact: potentialGain
        })
      }

      // Check evidence files (only actual file references)
      const missingEvidence = audit.evidence.evidenceFiles.filter(e => 
        !e.exists && 
        e.reference !== '-' &&
        (e.reference.includes('.md') || e.reference.startsWith('MAC-'))
      )
      if (missingEvidence.length > 0) {
        const existingEvidence = audit.evidence.evidenceFiles.filter(e => e.exists).length
        const totalEvidence = audit.evidence.evidenceFiles.filter(e => 
          e.reference.includes('.md') || e.reference.startsWith('MAC-')
        ).length
        
        if (totalEvidence > 0) {
          const pointsPerFile = 30 / totalEvidence
          potentialGain += Math.round(missingEvidence.length * pointsPerFile)
        } else {
          potentialGain += 30 // Could gain full evidence points
        }
        
        recommendations.push({
          controlId: audit.controlId,
          requirement: audit.requirement,
          currentScore: audit.complianceScore,
          action: 'create_evidence',
          details: `Create missing evidence files: ${missingEvidence.map(e => e.reference).slice(0, 3).join(', ')}${missingEvidence.length > 3 ? ` (+${missingEvidence.length - 3} more)` : ''}`,
          priority: audit.complianceScore < 50 ? 'critical' : audit.complianceScore < 70 ? 'high' : 'medium',
          estimatedImpact: potentialGain
        })
      }

      // Check code verification (only actual file references)
      const missingCode = audit.evidence.codeVerification.filter(c => 
        !c.exists && 
        c.file !== '-' &&
        (c.file.includes('.ts') || c.file.includes('.tsx') || c.file.includes('/'))
      )
      if (missingCode.length > 0) {
        const existingCode = audit.evidence.codeVerification.filter(c => c.exists && c.containsRelevantCode).length
        const totalCode = audit.evidence.codeVerification.filter(c => 
          c.file.includes('.ts') || c.file.includes('.tsx') || c.file.includes('/')
        ).length
        
        if (totalCode > 0) {
          const pointsPerFile = 30 / totalCode
          potentialGain += Math.round(missingCode.length * pointsPerFile)
        } else {
          potentialGain += 30 // Could gain full code points
        }
        
        recommendations.push({
          controlId: audit.controlId,
          requirement: audit.requirement,
          currentScore: audit.complianceScore,
          action: 'verify_code',
          details: `Verify code implementation: ${missingCode.map(c => c.file).slice(0, 2).join(', ')}${missingCode.length > 2 ? ` (+${missingCode.length - 2} more)` : ''}`,
          priority: audit.complianceScore < 50 ? 'critical' : audit.complianceScore < 70 ? 'high' : 'medium',
          estimatedImpact: potentialGain
        })
      }
    }

    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return b.estimatedImpact - a.estimatedImpact
    })

    console.log('='.repeat(80))
    console.log('IMPROVEMENT RECOMMENDATIONS')
    console.log('='.repeat(80))
    console.log(`\nTotal Recommendations: ${recommendations.length}`)
    
    const byPriority = {
      critical: recommendations.filter(r => r.priority === 'critical'),
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low'),
    }

    console.log(`\nBy Priority:`)
    console.log(`  Critical: ${byPriority.critical.length}`)
    console.log(`  High: ${byPriority.high.length}`)
    console.log(`  Medium: ${byPriority.medium.length}`)
    console.log(`  Low: ${byPriority.low.length}`)

    console.log(`\n\nTop 30 Recommendations:`)
    recommendations.slice(0, 30).forEach((rec, index) => {
      console.log(`\n${index + 1}. Control ${rec.controlId} (Current: ${rec.currentScore}%, Potential Gain: +${rec.estimatedImpact}%)`)
      console.log(`   Requirement: ${rec.requirement}`)
      console.log(`   Action: ${rec.action}`)
      console.log(`   Details: ${rec.details}`)
      console.log(`   Priority: ${rec.priority.toUpperCase()}`)
    })

    // Calculate total potential improvement
    const currentAvg = Math.round(implementedControls.reduce((sum, a) => sum + a.complianceScore, 0) / implementedControls.length)
    const totalPotentialGain = recommendations.reduce((sum, r) => sum + r.estimatedImpact, 0)
    const avgPotentialGain = Math.round(totalPotentialGain / implementedControls.length)
    const potentialAvg = Math.min(currentAvg + avgPotentialGain, 100)

    console.log(`\n\n${'='.repeat(80)}`)
    console.log('POTENTIAL IMPROVEMENT SUMMARY')
    console.log('='.repeat(80))
    console.log(`Current Average Score: ${currentAvg}%`)
    console.log(`Average Potential Gain: +${avgPotentialGain}%`)
    console.log(`Potential Average Score: ${potentialAvg}%`)
    console.log(`Total Improvement: +${potentialAvg - currentAvg}%`)

    console.log(`\n\n✅ Recommendations generated!`)
    console.log(`\nNext Steps:`)
    console.log(`1. Review critical and high priority recommendations`)
    console.log(`2. Create missing files and verify implementations`)
    console.log(`3. Re-run audit to verify improvements`)

  } catch (error) {
    console.error('Error generating recommendations:', error)
    process.exit(1)
  }
}

main().catch(console.error)
