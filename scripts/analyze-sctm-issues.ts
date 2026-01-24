/**
 * Analyze SCTM issues in detail to understand what needs to be resolved
 */

import { auditAllControls } from '../lib/compliance/control-audit'

async function main() {
  console.log('Analyzing SCTM control issues...\n')

  try {
    const auditResults = await auditAllControls()
    
    const issuesByType: Record<string, number> = {}
    const issuesByControl: Array<{ controlId: string; issues: string[] }> = []
    
    for (const audit of auditResults) {
      if (audit.issues.length > 0) {
        issuesByControl.push({
          controlId: audit.controlId,
          issues: audit.issues,
        })
        
        for (const issue of audit.issues) {
          const issueType = issue.includes('Policy') ? 'Policy' :
                           issue.includes('Procedure') ? 'Procedure' :
                           issue.includes('Evidence') ? 'Evidence' :
                           issue.includes('Implementation') ? 'Implementation' :
                           issue.includes('code') ? 'Code' :
                           'Other'
          issuesByType[issueType] = (issuesByType[issueType] || 0) + 1
        }
      }
    }
    
    console.log('='.repeat(60))
    console.log('ISSUE ANALYSIS')
    console.log('='.repeat(60))
    console.log(`\nTotal Controls with Issues: ${issuesByControl.length}`)
    console.log(`Total Issues: ${issuesByControl.reduce((sum, c) => sum + c.issues.length, 0)}`)
    
    console.log(`\nIssues by Type:`)
    for (const [type, count] of Object.entries(issuesByType).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${type}: ${count}`)
    }
    
    console.log(`\nTop 20 Controls with Most Issues:`)
    issuesByControl
      .sort((a, b) => b.issues.length - a.issues.length)
      .slice(0, 20)
      .forEach(({ controlId, issues }) => {
        console.log(`\n  Control ${controlId}: ${issues.length} issue(s)`)
        issues.slice(0, 3).forEach(issue => {
          console.log(`    - ${issue.substring(0, 80)}${issue.length > 80 ? '...' : ''}`)
        })
        if (issues.length > 3) {
          console.log(`    ... and ${issues.length - 3} more`)
        }
      })
    
    // Group by issue category
    const policyIssues = issuesByControl.filter(c => c.issues.some(i => i.includes('Policy')))
    const procedureIssues = issuesByControl.filter(c => c.issues.some(i => i.includes('Procedure')))
    const evidenceIssues = issuesByControl.filter(c => c.issues.some(i => i.includes('Evidence')))
    const codeIssues = issuesByControl.filter(c => c.issues.some(i => i.includes('code') || i.includes('Implementation')))
    
    console.log(`\n\nSummary by Category:`)
    console.log(`  Controls with Policy issues: ${policyIssues.length}`)
    console.log(`  Controls with Procedure issues: ${procedureIssues.length}`)
    console.log(`  Controls with Evidence issues: ${evidenceIssues.length}`)
    console.log(`  Controls with Code/Implementation issues: ${codeIssues.length}`)
    
  } catch (error) {
    console.error('Error analyzing issues:', error)
    process.exit(1)
  }
}

main().catch(console.error)
