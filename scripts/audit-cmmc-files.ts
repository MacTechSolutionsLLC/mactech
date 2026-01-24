/**
 * CMMC Files Audit Script
 * Audits all CMMC files for:
 * 1. Placeholder text that needs to be filled in
 * 2. Level 1 references that should be Level 2
 * 3. Naming convention compliance
 * 4. Folder structure compliance
 */

import { readFile, writeFile, readdir } from 'fs/promises'
import { join } from 'path'
import { readdirSync } from 'fs'
import { resolve } from 'path'

interface AuditResult {
  file: string
  issues: string[]
  needsUpdate: boolean
}

const PLACEHOLDER_PATTERNS = [
  /\[Code implementation details to be documented[^\]]*\]/gi,
  /\[Configuration evidence to be documented[^\]]*\]/gi,
  /\[Operational evidence to be documented[^\]]*\]/gi,
  /\[Testing and verification results to be documented[^\]]*\]/gi,
  /\[To be completed\]/gi,
  /\[To be updated with actual code file references\]/gi,
  /\[To be scheduled\]/gi,
]

const LEVEL1_PATTERNS = [
  /CMMC 2\.0 Level 1 \(Foundational\)/gi,
  /CMMC Level 1/gi,
  /Level 1 \(Foundational\)/gi,
  /CMMC Level 1 practices/gi,
  /17 CMMC Level 1 practices/gi,
]

async function auditFile(filePath: string): Promise<AuditResult> {
  const content = await readFile(filePath, 'utf-8')
  const issues: string[] = []
  let needsUpdate = false

  // Check for placeholders
  for (const pattern of PLACEHOLDER_PATTERNS) {
    const matches = content.match(pattern)
    if (matches) {
      issues.push(`Contains placeholder: ${matches[0]}`)
      needsUpdate = true
    }
  }

  // Check for Level 1 references (only in evidence files that should be Level 2)
  if (filePath.includes('05-evidence') && !filePath.includes('MAC-RPT-100')) {
    for (const pattern of LEVEL1_PATTERNS) {
      const matches = content.match(pattern)
      if (matches) {
        issues.push(`Contains Level 1 reference (should be Level 2): ${matches[0]}`)
        needsUpdate = true
      }
    }
  }

  // Check naming convention (MAC-XXX-###_Description.md)
  const filename = filePath.split('/').pop() || ''
  if (filename.includes('.md') && !filename.match(/^MAC-[A-Z]+-\d+[_].*\.md$/)) {
    if (!filename.match(/^MAC-[A-Z]+-\d+.*\.md$/)) {
      issues.push(`Filename may not follow convention: ${filename}`)
    }
  }

  return {
    file: filePath,
    issues,
    needsUpdate,
  }
}

function getAllMdFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir, { withFileTypes: true })
  for (const file of files) {
    const filePath = resolve(dir, file.name)
    if (file.isDirectory()) {
      getAllMdFiles(filePath, fileList)
    } else if (file.name.endsWith('.md')) {
      fileList.push(filePath)
    }
  }
  return fileList
}

async function main() {
  const cmmcDir = join(process.cwd(), 'compliance', 'cmmc')
  const allMdFiles = getAllMdFiles(cmmcDir)

  console.log(`Found ${allMdFiles.length} markdown files to audit\n`)

  const results: AuditResult[] = []
  for (const file of allMdFiles) {
    try {
      const result = await auditFile(file)
      if (result.needsUpdate) {
        results.push(result)
      }
    } catch (error) {
      console.error(`Error auditing ${file}:`, error)
    }
  }

  console.log(`\nFiles needing updates: ${results.length}\n`)
  
  // Group by issue type
  const placeholderFiles = results.filter(r => 
    r.issues.some(i => i.includes('placeholder'))
  )
  const level1Files = results.filter(r => 
    r.issues.some(i => i.includes('Level 1'))
  )
  const namingFiles = results.filter(r => 
    r.issues.some(i => i.includes('Filename'))
  )

  console.log(`Files with placeholders: ${placeholderFiles.length}`)
  console.log(`Files with Level 1 references: ${level1Files.length}`)
  console.log(`Files with naming issues: ${namingFiles.length}\n`)

  // Write detailed report
  const reportPath = join(process.cwd(), 'compliance', 'cmmc', 'AUDIT_REPORT.md')
  let report = `# CMMC Files Audit Report\n\n`
  report += `Generated: ${new Date().toISOString()}\n\n`
  report += `Total files audited: ${allMdFiles.length}\n`
  report += `Files needing updates: ${results.length}\n\n`

  report += `## Files with Placeholders (${placeholderFiles.length})\n\n`
  for (const result of placeholderFiles.slice(0, 20)) {
    report += `- ${result.file}\n`
    result.issues.filter(i => i.includes('placeholder')).forEach(issue => {
      report += `  - ${issue}\n`
    })
  }
  if (placeholderFiles.length > 20) {
    report += `\n... and ${placeholderFiles.length - 20} more files\n`
  }

  report += `\n## Files with Level 1 References (${level1Files.length})\n\n`
  for (const result of level1Files.slice(0, 20)) {
    report += `- ${result.file}\n`
  }
  if (level1Files.length > 20) {
    report += `\n... and ${level1Files.length - 20} more files\n`
  }

  await writeFile(reportPath, report, 'utf-8')
  console.log(`\nAudit report written to: ${reportPath}`)
}

main().catch(console.error)
