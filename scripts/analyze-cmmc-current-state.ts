/**
 * Analyze CMMC Current State
 * 
 * Analyzes the current implementation state of all CMMC controls
 * and generates a report for updating documentation
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'
import { existsSync } from 'fs'

const SCTM_PATH = join(
  process.cwd(),
  'compliance',
  'cmmc',
  'level2',
  '04-self-assessment',
  'MAC-AUD-408_System_Control_Traceability_Matrix.md'
)

interface ControlStatus {
  implemented: number
  inherited: number
  partiallySatisfied: number
  notImplemented: number
  notApplicable: number
  total: number
}

interface FamilyStats {
  family: string
  total: number
  implemented: number
  inherited: number
  partiallySatisfied: number
  notImplemented: number
  notApplicable: number
  readinessPercentage: number
}

async function main() {
  console.log('Analyzing CMMC Level 2 Current State...\n')
  
  // Read SCTM
  const sctmContent = await readFile(SCTM_PATH, 'utf-8')
  const controls = parseSCTM(sctmContent)
  
  // Calculate overall stats
  const overallStats: ControlStatus = {
    implemented: 0,
    inherited: 0,
    partiallySatisfied: 0,
    notImplemented: 0,
    notApplicable: 0,
    total: controls.length,
  }
  
  // Calculate family stats
  const familyStatsMap = new Map<string, FamilyStats>()
  
  controls.forEach(control => {
    // Overall stats
    switch (control.status) {
      case 'implemented':
        overallStats.implemented++
        break
      case 'inherited':
        overallStats.inherited++
        break
      case 'partially_satisfied':
        overallStats.partiallySatisfied++
        break
      case 'not_implemented':
        overallStats.notImplemented++
        break
      case 'not_applicable':
        overallStats.notApplicable++
        break
    }
    
    // Family stats
    if (!familyStatsMap.has(control.family)) {
      familyStatsMap.set(control.family, {
        family: control.family,
        total: 0,
        implemented: 0,
        inherited: 0,
        partiallySatisfied: 0,
        notImplemented: 0,
        notApplicable: 0,
        readinessPercentage: 0,
      })
    }
    
    const familyStat = familyStatsMap.get(control.family)!
    familyStat.total++
    switch (control.status) {
      case 'implemented':
        familyStat.implemented++
        break
      case 'inherited':
        familyStat.inherited++
        break
      case 'partially_satisfied':
        familyStat.partiallySatisfied++
        break
      case 'not_implemented':
        familyStat.notImplemented++
        break
      case 'not_applicable':
        familyStat.notApplicable++
        break
    }
  })
  
  // Calculate readiness percentages
  const applicableControls = overallStats.total - overallStats.notApplicable
  const overallReadiness = applicableControls > 0
    ? Math.round(((overallStats.implemented + overallStats.inherited) / applicableControls) * 100)
    : 0
  
  familyStatsMap.forEach(familyStat => {
    const applicable = familyStat.total - familyStat.notApplicable
    familyStat.readinessPercentage = applicable > 0
      ? Math.round(((familyStat.implemented + familyStat.inherited) / applicable) * 100)
      : 0
  })
  
  // Generate report
  const reportPath = join(process.cwd(), 'compliance', 'cmmc', 'CURRENT_STATE_ANALYSIS.md')
  let report = `# CMMC Level 2 Current State Analysis\n\n`
  report += `Generated: ${new Date().toISOString()}\n\n`
  
  report += `## Overall Compliance Status\n\n`
  report += `**Total Controls:** ${overallStats.total}\n`
  report += `**Implemented:** ${overallStats.implemented} (${Math.round((overallStats.implemented / overallStats.total) * 100)}%)\n`
  report += `**Inherited:** ${overallStats.inherited} (${Math.round((overallStats.inherited / overallStats.total) * 100)}%)\n`
  report += `**Partially Satisfied:** ${overallStats.partiallySatisfied} (${Math.round((overallStats.partiallySatisfied / overallStats.total) * 100)}%)\n`
  report += `**Not Implemented:** ${overallStats.notImplemented} (${Math.round((overallStats.notImplemented / overallStats.total) * 100)}%)\n`
  report += `**Not Applicable:** ${overallStats.notApplicable} (${Math.round((overallStats.notApplicable / overallStats.total) * 100)}%)\n\n`
  report += `**Overall Readiness:** ${overallReadiness}% (Implemented + Inherited)\n\n`
  
  report += `## Control Family Breakdown\n\n`
  report += `| Family | Total | Implemented | Inherited | Partially | Not Implemented | Not Applicable | Readiness |\n`
  report += `|--------|-------|-------------|-----------|-----------|-----------------|----------------|-----------|\n`
  
  const familyNames: Record<string, string> = {
    'AC': 'Access Control',
    'AT': 'Awareness and Training',
    'AU': 'Audit and Accountability',
    'CM': 'Configuration Management',
    'IA': 'Identification and Authentication',
    'IR': 'Incident Response',
    'MA': 'Maintenance',
    'MP': 'Media Protection',
    'PS': 'Personnel Security',
    'PE': 'Physical Protection',
    'RA': 'Risk Assessment',
    'SA': 'Security Assessment',
    'SC': 'System and Communications Protection',
    'SI': 'System and Information Integrity',
  }
  
  Array.from(familyStatsMap.values())
    .sort((a, b) => a.family.localeCompare(b.family))
    .forEach(familyStat => {
      const familyName = familyNames[familyStat.family] || familyStat.family
      report += `| ${familyStat.family} (${familyName}) | ${familyStat.total} | ${familyStat.implemented} | ${familyStat.inherited} | ${familyStat.partiallySatisfied} | ${familyStat.notImplemented} | ${familyStat.notApplicable} | ${familyStat.readinessPercentage}% |\n`
    })
  
  report += `\n## Key Implementation Features\n\n`
  
  // Identify key features
  const keyFeatures: string[] = []
  
  // MFA
  const mfaControl = controls.find(c => c.id === '3.5.3')
  if (mfaControl && mfaControl.status === 'implemented') {
    keyFeatures.push('✅ Multi-Factor Authentication (MFA) for privileged accounts')
  }
  
  // Account Lockout
  const lockoutControl = controls.find(c => c.id === '3.1.8')
  if (lockoutControl && lockoutControl.status === 'implemented') {
    keyFeatures.push('✅ Account lockout after failed login attempts')
  }
  
  // Audit Logging
  const auditControl = controls.find(c => c.id === '3.3.1')
  if (auditControl && lockoutControl && auditControl.status === 'implemented') {
    keyFeatures.push('✅ Comprehensive audit logging with 90-day retention')
  }
  
  // CUI Handling
  const cuiControls = controls.filter(c => 
    c.id === '3.1.3' || c.id === '3.1.19' || c.id === '3.1.21' || c.id === '3.1.22'
  )
  if (cuiControls.every(c => c.status === 'implemented' || c.status === 'inherited')) {
    keyFeatures.push('✅ CUI file storage and protection with password protection')
  }
  
  // Separation of Duties
  const sodControl = controls.find(c => c.id === '3.1.4')
  if (sodControl && sodControl.status === 'implemented') {
    keyFeatures.push('✅ Separation of duties with role-based access control')
  }
  
  // POA&M
  const poamControl = controls.find(c => c.id === '3.12.2')
  if (poamControl && poamControl.status === 'implemented') {
    keyFeatures.push('✅ POA&M tracking and management system')
  }
  
  keyFeatures.forEach(feature => {
    report += `- ${feature}\n`
  })
  
  report += `\n## Controls Requiring Attention\n\n`
  
  const needsAttention = controls.filter(c => 
    c.status === 'not_implemented' || c.status === 'partially_satisfied'
  )
  
  if (needsAttention.length > 0) {
    report += `| Control ID | Requirement | Status |\n`
    report += `|-----------|-------------|--------|\n`
    needsAttention.forEach(control => {
      const statusEmoji = control.status === 'not_implemented' ? '❌' : '⚠️'
      report += `| ${control.id} | ${control.requirement.substring(0, 60)}... | ${statusEmoji} ${control.status} |\n`
    })
  } else {
    report += `All controls are either implemented or inherited.\n`
  }
  
  await require('fs/promises').writeFile(reportPath, report, 'utf-8')
  
  console.log('=== CMMC Level 2 Current State ===\n')
  console.log(`Total Controls: ${overallStats.total}`)
  console.log(`Implemented: ${overallStats.implemented} (${Math.round((overallStats.implemented / overallStats.total) * 100)}%)`)
  console.log(`Inherited: ${overallStats.inherited} (${Math.round((overallStats.inherited / overallStats.total) * 100)}%)`)
  console.log(`Partially Satisfied: ${overallStats.partiallySatisfied}`)
  console.log(`Not Implemented: ${overallStats.notImplemented}`)
  console.log(`Not Applicable: ${overallStats.notApplicable}`)
  console.log(`\nOverall Readiness: ${overallReadiness}%\n`)
  console.log(`\nAnalysis report written to: ${reportPath}`)
}

main().catch(console.error)
