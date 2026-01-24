/**
 * Analyze compliance gaps for controls marked as "implemented" but scoring < 100%
 * Identifies what's missing and provides recommendations
 */

import { auditAllControls, ControlAuditResult } from '../lib/compliance/control-audit'
import { parseSCTM } from '../lib/compliance/sctm-parser'
import { readFile } from 'fs/promises'
import { join } from 'path'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level1')
const SCTM_PATH = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')

interface GapAnalysis {
  controlId: string
  requirement: string
  claimedStatus: string
  complianceScore: number
  missingPolicies: string[]
  missingProcedures: string[]
  missingEvidence: string[]
  missingCodeVerification: string[]
  recommendations: string[]
}

function analyzeGaps(audit: ControlAuditResult): GapAnalysis {
  const gaps: GapAnalysis = {
    controlId: audit.controlId,
    requirement: audit.requirement,
    claimedStatus: audit.claimedStatus,
    complianceScore: audit.complianceScore,
    missingPolicies: [],
    missingProcedures: [],
    missingEvidence: [],
    missingCodeVerification: [],
    recommendations: [],
  }

  // Check policies
  audit.evidence.policies.forEach(p => {
    if (!p.exists && p.reference !== '-') {
      gaps.missingPolicies.push(p.reference)
    }
  })

  // Check procedures
  audit.evidence.procedures.forEach(p => {
    if (!p.exists && p.reference !== '-') {
      gaps.missingProcedures.push(p.reference)
    }
  })

  // Check evidence files
  audit.evidence.evidenceFiles.forEach(e => {
    if (!e.exists && e.reference !== '-') {
      gaps.missingEvidence.push(e.reference)
    }
  })

  // Check code verification
  audit.evidence.codeVerification.forEach(c => {
    if (!c.exists || !c.containsRelevantCode) {
      if (c.file && c.file !== '-') {
        gaps.missingCodeVerification.push(c.file)
      }
    }
  })

  // Generate recommendations
  if (gaps.missingPolicies.length > 0) {
    gaps.recommendations.push(`Create missing policy files: ${gaps.missingPolicies.join(', ')}`)
  }
  if (gaps.missingProcedures.length > 0) {
    gaps.recommendations.push(`Create missing procedure files: ${gaps.missingProcedures.join(', ')}`)
  }
  if (gaps.missingEvidence.length > 0) {
    gaps.recommendations.push(`Create missing evidence files: ${gaps.missingEvidence.join(', ')}`)
  }
  if (gaps.missingCodeVerification.length > 0) {
    gaps.recommendations.push(`Verify code implementation: ${gaps.missingCodeVerification.join(', ')}`)
  }

  // If no specific gaps but score is low, provide general recommendations
  if (gaps.complianceScore < 100 && gaps.recommendations.length === 0) {
    gaps.recommendations.push('Review control implementation and ensure all evidence is properly documented')
  }

  return gaps
}

async function main() {
  console.log('Analyzing compliance gaps for implemented controls...\n')

  try {
    const auditResults = await auditAllControls()
    const sctmContent = await readFile(SCTM_PATH, 'utf-8')
    const controls = parseSCTM(sctmContent)

    // Filter to implemented controls with scores < 100%
    const implementedControls = auditResults.filter(a => 
      a.claimedStatus === 'implemented' && a.complianceScore < 100
    )

    console.log('='.repeat(80))
    console.log('COMPLIANCE GAP ANALYSIS')
    console.log('='.repeat(80))
    console.log(`\nTotal Controls: ${auditResults.length}`)
    console.log(`Implemented Controls: ${auditResults.filter(a => a.claimedStatus === 'implemented').length}`)
    console.log(`Implemented but < 100%: ${implementedControls.length}`)
    console.log(`Average Score (all): ${Math.round(auditResults.reduce((sum, a) => sum + a.complianceScore, 0) / auditResults.length)}%`)
    console.log(`Average Score (implemented < 100%): ${Math.round(implementedControls.reduce((sum, a) => sum + a.complianceScore, 0) / implementedControls.length)}%`)

    // Group by score ranges
    const scoreRanges = {
      '90-99%': implementedControls.filter(a => a.complianceScore >= 90 && a.complianceScore < 100),
      '80-89%': implementedControls.filter(a => a.complianceScore >= 80 && a.complianceScore < 90),
      '70-79%': implementedControls.filter(a => a.complianceScore >= 70 && a.complianceScore < 79),
      '60-69%': implementedControls.filter(a => a.complianceScore >= 60 && a.complianceScore < 70),
      '50-59%': implementedControls.filter(a => a.complianceScore >= 50 && a.complianceScore < 60),
      '< 50%': implementedControls.filter(a => a.complianceScore < 50),
    }

    console.log(`\n\nScore Distribution (Implemented < 100%):`)
    for (const [range, controls] of Object.entries(scoreRanges)) {
      if (controls.length > 0) {
        console.log(`  ${range}: ${controls.length} controls`)
      }
    }

    // Analyze gaps
    const gapAnalyses = implementedControls.map(analyzeGaps)
    
    // Group by gap type
    const gapsByType = {
      missingPolicies: gapAnalyses.filter(g => g.missingPolicies.length > 0),
      missingProcedures: gapAnalyses.filter(g => g.missingProcedures.length > 0),
      missingEvidence: gapAnalyses.filter(g => g.missingEvidence.length > 0),
      missingCode: gapAnalyses.filter(g => g.missingCodeVerification.length > 0),
    }

    console.log(`\n\nGap Types (Implemented < 100%):`)
    console.log(`  Missing Policies: ${gapsByType.missingPolicies.length} controls`)
    console.log(`  Missing Procedures: ${gapsByType.missingProcedures.length} controls`)
    console.log(`  Missing Evidence: ${gapsByType.missingEvidence.length} controls`)
    console.log(`  Missing Code Verification: ${gapsByType.missingCode.length} controls`)

    // Show top 20 controls with lowest scores
    console.log(`\n\nTop 20 Controls Needing Improvement (Lowest Scores):`)
    const sortedByScore = gapAnalyses.sort((a, b) => a.complianceScore - b.complianceScore)
    sortedByScore.slice(0, 20).forEach((gap, index) => {
      console.log(`\n${index + 1}. Control ${gap.controlId}: ${gap.requirement}`)
      console.log(`   Score: ${gap.complianceScore}%`)
      console.log(`   Status: ${gap.claimedStatus}`)
      if (gap.missingPolicies.length > 0) {
        console.log(`   Missing Policies: ${gap.missingPolicies.join(', ')}`)
      }
      if (gap.missingProcedures.length > 0) {
        console.log(`   Missing Procedures: ${gap.missingProcedures.join(', ')}`)
      }
      if (gap.missingEvidence.length > 0) {
        console.log(`   Missing Evidence: ${gap.missingEvidence.slice(0, 3).join(', ')}${gap.missingEvidence.length > 3 ? ` (+${gap.missingEvidence.length - 3} more)` : ''}`)
      }
      if (gap.missingCodeVerification.length > 0) {
        console.log(`   Missing Code: ${gap.missingCodeVerification.slice(0, 2).join(', ')}${gap.missingCodeVerification.length > 2 ? ` (+${gap.missingCodeVerification.length - 2} more)` : ''}`)
      }
      if (gap.recommendations.length > 0) {
        console.log(`   Recommendations:`)
        gap.recommendations.slice(0, 3).forEach(rec => {
          console.log(`     - ${rec}`)
        })
      }
    })

    // Generate improvement plan
    console.log(`\n\n${'='.repeat(80)}`)
    console.log('IMPROVEMENT PLAN')
    console.log('='.repeat(80))

    // Count what needs to be created
    const allMissingPolicies = new Set<string>()
    const allMissingProcedures = new Set<string>()
    const allMissingEvidence = new Set<string>()

    gapAnalyses.forEach(gap => {
      gap.missingPolicies.forEach(p => allMissingPolicies.add(p))
      gap.missingProcedures.forEach(p => allMissingProcedures.add(p))
      gap.missingEvidence.forEach(e => allMissingEvidence.add(e))
    })

    console.log(`\n1. Create Missing Policies (${allMissingPolicies.size} unique):`)
    Array.from(allMissingPolicies).slice(0, 10).forEach(p => console.log(`   - ${p}`))
    if (allMissingPolicies.size > 10) {
      console.log(`   ... and ${allMissingPolicies.size - 10} more`)
    }

    console.log(`\n2. Create Missing Procedures (${allMissingProcedures.size} unique):`)
    Array.from(allMissingProcedures).slice(0, 10).forEach(p => console.log(`   - ${p}`))
    if (allMissingProcedures.size > 10) {
      console.log(`   ... and ${allMissingProcedures.size - 10} more`)
    }

    console.log(`\n3. Create Missing Evidence Files (${allMissingEvidence.size} unique):`)
    Array.from(allMissingEvidence).slice(0, 10).forEach(e => console.log(`   - ${e}`))
    if (allMissingEvidence.size > 10) {
      console.log(`   ... and ${allMissingEvidence.size - 10} more`)
    }

    // Calculate potential score improvement
    const currentAvg = Math.round(implementedControls.reduce((sum, a) => sum + a.complianceScore, 0) / implementedControls.length)
    console.log(`\n\nCurrent Average Score (Implemented < 100%): ${currentAvg}%`)
    console.log(`Potential Improvement: By addressing all gaps, scores could reach 100%`)
    console.log(`Estimated Improvement: +${100 - currentAvg}% average score`)

    // Save detailed report
    const reportPath = join(
      COMPLIANCE_ROOT,
      '04-self-assessment',
      'MAC-AUD-413_Compliance_Gap_Analysis_Report.md'
    )

    const reportContent = `# Compliance Gap Analysis Report

**Document Version:** 1.0  
**Date:** ${new Date().toISOString().split('T')[0]}  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)

---

## Executive Summary

This report analyzes compliance gaps for controls marked as "implemented" but scoring less than 100% compliance. The analysis identifies missing policies, procedures, evidence files, and code verification issues.

---

## Analysis Summary

**Total Controls Audited:** ${auditResults.length}  
**Implemented Controls:** ${auditResults.filter(a => a.claimedStatus === 'implemented').length}  
**Implemented but < 100%:** ${implementedControls.length}  
**Average Score (All Controls):** ${Math.round(auditResults.reduce((sum, a) => sum + a.complianceScore, 0) / auditResults.length)}%  
**Average Score (Implemented < 100%):** ${currentAvg}%

---

## Score Distribution

${Object.entries(scoreRanges).map(([range, controls]) => 
  controls.length > 0 ? `- **${range}:** ${controls.length} controls` : ''
).filter(Boolean).join('\n')}

---

## Gap Analysis by Type

- **Missing Policies:** ${gapsByType.missingPolicies.length} controls
- **Missing Procedures:** ${gapsByType.missingProcedures.length} controls
- **Missing Evidence Files:** ${gapsByType.missingEvidence.length} controls
- **Missing Code Verification:** ${gapsByType.missingCode.length} controls

---

## Detailed Gap Analysis

${sortedByScore.map((gap, index) => `
### ${index + 1}. Control ${gap.controlId}

**Requirement:** ${gap.requirement}  
**Claimed Status:** ${gap.claimedStatus}  
**Compliance Score:** ${gap.complianceScore}%

**Missing Components:**
${gap.missingPolicies.length > 0 ? `- Policies: ${gap.missingPolicies.join(', ')}` : ''}
${gap.missingProcedures.length > 0 ? `- Procedures: ${gap.missingProcedures.join(', ')}` : ''}
${gap.missingEvidence.length > 0 ? `- Evidence: ${gap.missingEvidence.slice(0, 5).join(', ')}${gap.missingEvidence.length > 5 ? ` (+${gap.missingEvidence.length - 5} more)` : ''}` : ''}
${gap.missingCodeVerification.length > 0 ? `- Code Verification: ${gap.missingCodeVerification.slice(0, 3).join(', ')}${gap.missingCodeVerification.length > 3 ? ` (+${gap.missingCodeVerification.length - 3} more)` : ''}` : ''}

**Recommendations:**
${gap.recommendations.map(r => `- ${r}`).join('\n')}
`).join('\n')}

---

## Improvement Plan

### 1. Missing Policies (${allMissingPolicies.size} unique)

${Array.from(allMissingPolicies).map(p => `- ${p}`).join('\n')}

### 2. Missing Procedures (${allMissingProcedures.size} unique)

${Array.from(allMissingProcedures).map(p => `- ${p}`).join('\n')}

### 3. Missing Evidence Files (${allMissingEvidence.size} unique)

${Array.from(allMissingEvidence).map(e => `- ${e}`).join('\n')}

---

## Next Steps

1. Prioritize controls with scores < 50% for immediate attention
2. Create missing policy and procedure files
3. Generate evidence documentation for controls lacking evidence
4. Verify code implementations match control requirements
5. Re-run audit after improvements to verify score increases

---

## Document Control

**Prepared By:** Compliance Audit System  
**Generated:** ${new Date().toISOString()}  
**Next Review Date:** [To be scheduled]
`

    await import('fs/promises').then(fs => fs.writeFile(reportPath, reportContent, 'utf-8'))
    console.log(`\n\n✓ Detailed report saved to: ${reportPath}`)

    console.log(`\n\n✅ Gap analysis complete!`)

  } catch (error) {
    console.error('Error analyzing gaps:', error)
    process.exit(1)
  }
}

main().catch(console.error)
