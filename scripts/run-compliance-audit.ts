/**
 * Run comprehensive compliance audit and generate report
 * This script audits all controls and generates a detailed report
 */

import { auditAllControls, generateAuditSummary } from '../lib/compliance/control-audit'
import { writeFile } from 'fs/promises'
import { join } from 'path'

async function main() {
  console.log('Starting comprehensive CMMC Level 2 compliance audit...\n')
  
  try {
    // Run audit on all controls
    console.log('Auditing all controls...')
    const results = await auditAllControls()
    console.log(`✓ Audited ${results.length} controls\n`)
    
    // Generate summary
    console.log('Generating audit summary...')
    const summary = generateAuditSummary(results)
    console.log('✓ Summary generated\n')
    
    // Print summary to console
    console.log('='.repeat(60))
    console.log('COMPLIANCE AUDIT SUMMARY')
    console.log('='.repeat(60))
    console.log(`Total Controls: ${summary.total}`)
    console.log(`Verified: ${summary.verified} (${Math.round((summary.verified / summary.total) * 100)}%)`)
    console.log(`Needs Review: ${summary.needsReview}`)
    console.log(`Discrepancies: ${summary.discrepancies}`)
    console.log(`Average Compliance Score: ${summary.averageComplianceScore}%`)
    console.log('\nStatus Breakdown:')
    for (const [status, counts] of Object.entries(summary.byStatus)) {
      const rate = counts.claimed > 0 ? Math.round((counts.verified / counts.claimed) * 100) : 0
      console.log(`  ${status}: ${counts.verified}/${counts.claimed} verified (${rate}%)`)
    }
    console.log('\nFamily Breakdown:')
    for (const [family, data] of Object.entries(summary.byFamily)) {
      console.log(`  ${family}: ${data.averageScore}% (${data.total} controls)`)
    }
    if (summary.criticalIssues.length > 0) {
      console.log(`\nCritical Issues: ${summary.criticalIssues.length}`)
      summary.criticalIssues.slice(0, 10).forEach(issue => {
        console.log(`  - Control ${issue.controlId}: ${issue.issue}`)
      })
    }
    console.log('='.repeat(60))
    
    // Generate detailed report
    const reportPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '04-self-assessment',
      'MAC-AUD-409_Compliance_Audit_Report.md'
    )
    
    const report = generateAuditReport(summary, results)
    await writeFile(reportPath, report, 'utf-8')
    console.log(`\n✓ Detailed report saved to: ${reportPath}`)
    
    // Generate JSON export
    const jsonPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '04-self-assessment',
      'compliance-audit-results.json'
    )
    
    await writeFile(
      jsonPath,
      JSON.stringify({ summary, results, generatedAt: new Date().toISOString() }, null, 2),
      'utf-8'
    )
    console.log(`✓ JSON export saved to: ${jsonPath}`)
    
    console.log('\n✓ Audit complete!')
    
  } catch (error) {
    console.error('Error running audit:', error)
    process.exit(1)
  }
}

function generateAuditReport(summary: any, results: any[]): string {
  const date = new Date().toISOString().split('T')[0]
  
  return `# Compliance Audit Report - CMMC Level 2

**Document Version:** 1.0  
**Date:** ${date}  
**Classification:** Internal Use  
**Compliance Framework:** CMMC 2.0 Level 2 (Advanced)  
**Reference:** NIST SP 800-171 Rev. 2 (All 110 Requirements)

---

## Executive Summary

This report provides a comprehensive audit of all 110 NIST SP 800-171 Rev. 2 controls implemented in the MacTech Solutions system. The audit verifies actual implementation status against code, evidence files, policies, and procedures.

**Key Findings:**
- **Total Controls:** ${summary.total}
- **Verified:** ${summary.verified} (${Math.round((summary.verified / summary.total) * 100)}%)
- **Needs Review:** ${summary.needsReview}
- **Discrepancies:** ${summary.discrepancies}
- **Average Compliance Score:** ${summary.averageComplianceScore}%

---

## Status Breakdown

| Status | Claimed | Verified | Verification Rate |
|--------|---------|----------|-------------------|
${Object.entries(summary.byStatus).map(([status, counts]: [string, any]) => 
  `| ${status.replace('_', ' ')} | ${counts.claimed} | ${counts.verified} | ${counts.claimed > 0 ? Math.round((counts.verified / counts.claimed) * 100) : 0}% |`
).join('\n')}

---

## Compliance by Control Family

| Family | Controls | Average Score |
|--------|----------|---------------|
${Object.entries(summary.byFamily).map(([family, data]: [string, any]) => 
  `| ${family} | ${data.total} | ${data.averageScore}% |`
).join('\n')}

---

## Critical Issues

${summary.criticalIssues.length > 0 ? summary.criticalIssues.map((issue: any) => 
  `- **Control ${issue.controlId}:** ${issue.issue}`
).join('\n') : 'No critical issues identified.'}

---

## Detailed Control Results

${results.map(result => `
### Control ${result.controlId}: ${result.requirement}

- **Claimed Status:** ${result.claimedStatus}
- **Verified Status:** ${result.verifiedStatus}
- **Verification Status:** ${result.verificationStatus}
- **Compliance Score:** ${result.complianceScore}%
- **Issues:** ${result.issues.length}

**Evidence Verification:**
- Policies: ${result.evidence.policies.filter((p: any) => p.exists).length}/${result.evidence.policies.length} found
- Procedures: ${result.evidence.procedures.filter((p: any) => p.exists).length}/${result.evidence.procedures.length} found
- Evidence Files: ${result.evidence.evidenceFiles.filter((e: any) => e.exists).length}/${result.evidence.evidenceFiles.length} found
- Code Implementation: ${result.evidence.codeVerification.filter((c: any) => c.exists && c.containsRelevantCode).length}/${result.evidence.codeVerification.length} verified

${result.issues.length > 0 ? `**Issues:**\n${result.issues.map((issue: string) => `- ${issue}`).join('\n')}` : ''}
`).join('\n---\n')}

---

## Recommendations

1. **Address Critical Issues:** ${summary.criticalIssues.length} controls require immediate attention
2. **Complete Evidence Collection:** Ensure all evidence files referenced in SCTM are present
3. **Verify Code Implementation:** Review controls with low compliance scores
4. **Update Documentation:** Update SCTM and related documentation to reflect verified status

---

## Document Control

**Prepared By:** Compliance Audit System  
**Generated:** ${new Date().toISOString()}  
**Next Review Date:** [To be scheduled]
`
}

main().catch(console.error)
