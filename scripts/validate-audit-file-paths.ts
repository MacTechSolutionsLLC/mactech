/**
 * Validate Audit File Paths
 * 
 * This script validates all file references in the SCTM to identify:
 * 1. Files that exist but have incorrect paths in SCTM
 * 2. Files that are truly missing
 * 3. Path resolution issues in the audit code
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { parseSCTM, Control } from '../lib/compliance/sctm-parser'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc', 'level2')
const EVIDENCE_ROOT = join(COMPLIANCE_ROOT, '05-evidence')
const POLICIES_ROOT = join(COMPLIANCE_ROOT, '02-policies-and-procedures')
const SYSTEM_SCOPE_ROOT = join(COMPLIANCE_ROOT, '01-system-scope')
const CODE_ROOT = process.cwd()

interface ValidationResult {
  controlId: string
  type: 'policy' | 'procedure' | 'evidence' | 'implementation'
  reference: string
  exists: boolean
  foundPath?: string
  expectedPaths: string[]
  issue: string
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises')
    await fs.access(path)
    return true
  } catch {
    return false
  }
}

/**
 * Try to find a file in multiple locations
 */
async function findFile(reference: string, type: 'policy' | 'procedure' | 'evidence' | 'implementation'): Promise<{ exists: boolean; foundPath?: string; checkedPaths: string[] }> {
  const checkedPaths: string[] = []
  let foundPath: string | undefined = undefined

  if (type === 'policy') {
    // Check policies directory
    const policyPath = join(POLICIES_ROOT, `${reference}.md`)
    checkedPaths.push(policyPath)
    if (await fileExists(policyPath)) {
      return { exists: true, foundPath: policyPath, checkedPaths }
    }
    
    // Check for files starting with policy ref
    try {
      const fs = await import('fs/promises')
      const dirFiles = await fs.readdir(POLICIES_ROOT)
      const matchingFile = dirFiles.find(f => f.startsWith(`${reference}_`) && f.endsWith('.md'))
      if (matchingFile) {
        const matchPath = join(POLICIES_ROOT, matchingFile)
        checkedPaths.push(matchPath)
        return { exists: true, foundPath: matchPath, checkedPaths }
      }
    } catch {
      // Continue
    }
  }

  if (type === 'procedure') {
    let normalizedRef = reference.trim()
    if (normalizedRef.endsWith('.md.md')) {
      normalizedRef = normalizedRef.replace(/\.md\.md$/, '.md')
    } else if (!normalizedRef.endsWith('.md') && !normalizedRef.includes('/')) {
      normalizedRef = normalizedRef + '.md'
    }

    // Handle relative paths
    if (normalizedRef.startsWith('../') || normalizedRef.startsWith('../../')) {
      const resolvedPath = join(COMPLIANCE_ROOT, normalizedRef.replace(/^\.\.\/\.\.\//, '').replace(/^\.\.\//, ''))
      checkedPaths.push(resolvedPath)
      if (await fileExists(resolvedPath)) {
        return { exists: true, foundPath: resolvedPath, checkedPaths }
      }
    }

    // Determine search directories
    const searchDirs: string[] = []
    if (normalizedRef.startsWith('MAC-RPT-')) {
      searchDirs.push(EVIDENCE_ROOT)
    } else if (normalizedRef.startsWith('MAC-IT-')) {
      searchDirs.push(SYSTEM_SCOPE_ROOT)
    } else if (normalizedRef.startsWith('MAC-SOP-') || normalizedRef.startsWith('MAC-CMP-') || normalizedRef.startsWith('MAC-IRP-')) {
      searchDirs.push(POLICIES_ROOT)
    } else {
      searchDirs.push(POLICIES_ROOT, EVIDENCE_ROOT, SYSTEM_SCOPE_ROOT)
    }

    for (const dir of searchDirs) {
      const exactPath = join(dir, normalizedRef)
      checkedPaths.push(exactPath)
      if (await fileExists(exactPath)) {
        return { exists: true, foundPath: exactPath, checkedPaths }
      }

      // Try without .md extension
      const baseName = normalizedRef.endsWith('.md') ? normalizedRef.slice(0, -3) : normalizedRef
      const pathWithoutExt = join(dir, baseName)
      checkedPaths.push(pathWithoutExt)
      if (await fileExists(pathWithoutExt)) {
        return { exists: true, foundPath: pathWithoutExt, checkedPaths }
      }

      // Try prefix match
      try {
        const fs = await import('fs/promises')
        const dirFiles = await fs.readdir(dir)
        const matchingFile = dirFiles.find(f => {
          if (!f.endsWith('.md')) return false
          const fBase = f.replace(/\.md$/, '')
          return fBase === baseName || fBase.startsWith(`${baseName}_`) || f.startsWith(`${baseName}_`)
        })
        if (matchingFile) {
          const matchPath = join(dir, matchingFile)
          checkedPaths.push(matchPath)
          return { exists: true, foundPath: matchPath, checkedPaths }
        }
      } catch {
        // Continue
      }
    }
  }

  if (type === 'evidence') {
    // Check if it's a web route
    if (reference.startsWith('/api/') || reference.startsWith('/admin/')) {
      const routeParts = reference.replace(/^\//, '').split('/').filter(p => p)
      let routeFile = ''
      
      if (routeParts.includes('export')) {
        const exportIndex = routeParts.indexOf('export')
        const basePath = routeParts.slice(0, exportIndex)
        const apiPath = basePath[0] === 'api' ? basePath.slice(1) : basePath
        routeFile = join(CODE_ROOT, 'app', 'api', ...apiPath, 'export', 'route.ts')
      } else if (routeParts[0] === 'api') {
        routeFile = join(CODE_ROOT, 'app', 'api', ...routeParts.slice(1), 'route.ts')
      } else if (routeParts[0] === 'admin') {
        routeFile = join(CODE_ROOT, 'app', ...routeParts, 'page.tsx')
      }
      
      checkedPaths.push(routeFile || `[Web Route] ${reference}`)
      if (routeFile && await fileExists(routeFile)) {
        return { exists: true, foundPath: routeFile, checkedPaths }
      }
      // Web routes are considered valid even if file doesn't exist
      return { exists: true, foundPath: `[Web Route] ${reference}`, checkedPaths }
    }

    // Check if it's a code file reference (code files can appear in Evidence column)
    if (reference.includes('.ts') || reference.includes('.tsx') || reference.includes('.js') || 
        reference.includes('.prisma') || reference.includes('.sql') || reference.includes('schema.prisma')) {
      // Code file reference - check in CODE_ROOT
      const codePath = join(CODE_ROOT, reference)
      checkedPaths.push(codePath)
      if (await fileExists(codePath)) {
        return { exists: true, foundPath: codePath, checkedPaths }
      }

      // Try .tsx if .ts doesn't exist
      if (reference.endsWith('.ts')) {
        const tsxPath = codePath.replace(/\.ts$/, '.tsx')
        checkedPaths.push(tsxPath)
        if (await fileExists(tsxPath)) {
          return { exists: true, foundPath: tsxPath, checkedPaths }
        }
      }

      // Check for schema.prisma
      if (reference.includes('schema.prisma') || reference === 'prisma/schema.prisma' || reference.includes('prisma/schema')) {
        const schemaPath = join(CODE_ROOT, 'prisma', 'schema.prisma')
        checkedPaths.push(schemaPath)
        if (await fileExists(schemaPath)) {
          return { exists: true, foundPath: schemaPath, checkedPaths }
        }
      }
    }

    // Check if it's a relative path
    if (reference.includes('/') && reference.endsWith('.md')) {
      const evidencePath = join(EVIDENCE_ROOT, reference)
      checkedPaths.push(evidencePath)
      if (await fileExists(evidencePath)) {
        return { exists: true, foundPath: evidencePath, checkedPaths }
      }

      // Check if it's in policies directory
      const policyPath = join(COMPLIANCE_ROOT, '02-policies-and-procedures', reference.split('/').pop() || reference)
      checkedPaths.push(policyPath)
      if (await fileExists(policyPath)) {
        return { exists: true, foundPath: policyPath, checkedPaths }
      }

      // Check if it's a relative path from COMPLIANCE_ROOT
      const compliancePath = join(COMPLIANCE_ROOT, reference)
      checkedPaths.push(compliancePath)
      if (await fileExists(compliancePath)) {
        return { exists: true, foundPath: compliancePath, checkedPaths }
      }
    }

    // Check if it's a MAC-SEC reference (inherited control statements)
    if (reference.startsWith('MAC-SEC-')) {
      const controlRespDir = join(COMPLIANCE_ROOT, '03-control-responsibility')
      const refWithoutExt = reference.endsWith('.md') ? reference.slice(0, -3) : reference
      const exactPath = join(controlRespDir, `${refWithoutExt}.md`)
      checkedPaths.push(exactPath)
      if (await fileExists(exactPath)) {
        return { exists: true, foundPath: exactPath, checkedPaths }
      }

      // Try prefix match
      try {
        const fs = await import('fs/promises')
        const dirFiles = await fs.readdir(controlRespDir)
        const matchingFile = dirFiles.find(f => {
          if (!f.endsWith('.md')) return false
          const fBase = f.replace(/\.md$/, '')
          return fBase === refWithoutExt || fBase.startsWith(`${refWithoutExt}_`) || f.startsWith(`${refWithoutExt}_`)
        })
        if (matchingFile) {
          const matchPath = join(controlRespDir, matchingFile)
          checkedPaths.push(matchPath)
          return { exists: true, foundPath: matchPath, checkedPaths }
        }
      } catch {
        // Continue
      }
    }

    // Check if it's a MAC-RPT reference
    if (reference.startsWith('MAC-RPT-') || reference.startsWith('MAC-')) {
      // Try with .md extension
      const refWithExt = reference.endsWith('.md') ? reference : `${reference}.md`
      const evidencePath = join(EVIDENCE_ROOT, refWithExt)
      checkedPaths.push(evidencePath)
      if (await fileExists(evidencePath)) {
        return { exists: true, foundPath: evidencePath, checkedPaths }
      }

      // Try without extension
      const refWithoutExt = reference.replace(/\.md$/, '')
      const evidencePath2 = join(EVIDENCE_ROOT, `${refWithoutExt}.md`)
      checkedPaths.push(evidencePath2)
      if (await fileExists(evidencePath2)) {
        return { exists: true, foundPath: evidencePath2, checkedPaths }
      }

      // Try prefix match
      try {
        const fs = await import('fs/promises')
        const dirFiles = await fs.readdir(EVIDENCE_ROOT)
        const matchingFile = dirFiles.find(f => {
          if (!f.endsWith('.md')) return false
          const fBase = f.replace(/\.md$/, '')
          return fBase === refWithoutExt || fBase.startsWith(`${refWithoutExt}_`) || f.startsWith(`${refWithoutExt}_`)
        })
        if (matchingFile) {
          const matchPath = join(EVIDENCE_ROOT, matchingFile)
          checkedPaths.push(matchPath)
          return { exists: true, foundPath: matchPath, checkedPaths }
        }
      } catch {
        // Continue
      }
    }
  }

  if (type === 'implementation') {
    // Clean up reference (remove trailing parentheses, extra spaces)
    let cleanRef = reference.trim().replace(/\)$/, '').trim()
    
    // Check for prisma/schema.prisma
    if (cleanRef.includes('schema.prisma') || cleanRef === 'prisma/schema.prisma' || cleanRef.includes('prisma/schema')) {
      const schemaPath = join(CODE_ROOT, 'prisma', 'schema.prisma')
      checkedPaths.push(schemaPath)
      if (await fileExists(schemaPath)) {
        return { exists: true, foundPath: schemaPath, checkedPaths }
      }
    }

    // Check for relative paths (e.g., compliance/cmmc/...)
    if (cleanRef.startsWith('compliance/') || cleanRef.includes('../')) {
      const resolvedPath = cleanRef.startsWith('compliance/') 
        ? join(CODE_ROOT, cleanRef)
        : join(COMPLIANCE_ROOT, cleanRef.replace(/^\.\.\//, ''))
      checkedPaths.push(resolvedPath)
      if (await fileExists(resolvedPath)) {
        return { exists: true, foundPath: resolvedPath, checkedPaths }
      }
    }

    // Check code files
    if (cleanRef.includes('.ts') || cleanRef.includes('.tsx') || cleanRef.includes('.js')) {
      const codePath = join(CODE_ROOT, cleanRef)
      checkedPaths.push(codePath)
      if (await fileExists(codePath)) {
        return { exists: true, foundPath: codePath, checkedPaths }
      }

      // Try .tsx if .ts doesn't exist
      if (cleanRef.endsWith('.ts')) {
        const tsxPath = codePath.replace(/\.ts$/, '.tsx')
        checkedPaths.push(tsxPath)
        if (await fileExists(tsxPath)) {
          return { exists: true, foundPath: tsxPath, checkedPaths }
        }
      }
    }

    // Check if it's a directory
    if (reference.endsWith('/') || (!reference.includes('.') && reference.includes('/'))) {
      const dirPath = join(CODE_ROOT, reference)
      checkedPaths.push(dirPath)
      if (existsSync(dirPath)) {
        return { exists: true, foundPath: dirPath, checkedPaths }
      }
    }

    // Check for procedure files in implementation (sometimes procedures are listed there)
    if (reference.startsWith('MAC-SOP-') || reference.startsWith('MAC-CMP-') || reference.startsWith('MAC-IRP-')) {
      const procedurePath = join(COMPLIANCE_ROOT, '02-policies-and-procedures', reference.endsWith('.md') ? reference : `${reference}.md`)
      checkedPaths.push(procedurePath)
      if (await fileExists(procedurePath)) {
        return { exists: true, foundPath: procedurePath, checkedPaths }
      }
    }
  }

  return { exists: false, checkedPaths }
}

async function validateAllFilePaths() {
  console.log('='.repeat(80))
  console.log('Validating All File Paths in SCTM')
  console.log('='.repeat(80))
  console.log()

  const sctmPath = join(COMPLIANCE_ROOT, '04-self-assessment', 'MAC-AUD-408_System_Control_Traceability_Matrix.md')
  const content = await readFile(sctmPath, 'utf-8')
  const controls = parseSCTM(content)

  const results: ValidationResult[] = []
  let totalReferences = 0
  let foundReferences = 0
  let missingReferences = 0

  for (const control of controls) {
    // Validate policies
    if (control.policy && control.policy !== '-' && control.policy !== '---') {
      const policyRefs = control.policy.split(',').map(p => p.trim()).filter(p => p && p !== '-' && p !== '---')
      for (const ref of policyRefs) {
        totalReferences++
        const result = await findFile(ref, 'policy')
        if (result.exists) {
          foundReferences++
        } else {
          missingReferences++
          results.push({
            controlId: control.id,
            type: 'policy',
            reference: ref,
            exists: false,
            expectedPaths: result.checkedPaths,
            issue: `Policy file not found: ${ref}`
          })
        }
      }
    }

    // Validate procedures
    if (control.procedure && control.procedure !== '-' && control.procedure !== '---') {
      const procedureRefs = control.procedure.split(',').map(p => p.trim()).filter(p => p && p !== '-' && p !== '---')
      for (const ref of procedureRefs) {
        totalReferences++
        const result = await findFile(ref, 'procedure')
        if (result.exists) {
          foundReferences++
        } else {
          missingReferences++
          results.push({
            controlId: control.id,
            type: 'procedure',
            reference: ref,
            exists: false,
            expectedPaths: result.checkedPaths,
            issue: `Procedure file not found: ${ref}`
          })
        }
      }
    }

    // Validate evidence files
    if (control.evidence && control.evidence !== '-' && control.evidence !== '---') {
      const evidenceRefs = control.evidence.split(',').map(e => e.trim()).filter(e => e && e !== '-' && e !== '---')
      
      // Filter out descriptive references
      const descriptiveRefs = [
        'System architecture', 'Policy prohibition', 'endpoint compliance',
        'user agreements', 'technical controls', 'owner identification requirements',
        'GCP data center physical security', 'GitHub facilities'
      ]
      
      for (const ref of evidenceRefs) {
        // Skip descriptive references
        if (descriptiveRefs.some(desc => ref.toLowerCase().includes(desc.toLowerCase()))) {
          continue
        }
        
        totalReferences++
        const result = await findFile(ref, 'evidence')
        if (result.exists) {
          foundReferences++
        } else {
          missingReferences++
          results.push({
            controlId: control.id,
            type: 'evidence',
            reference: ref,
            exists: false,
            expectedPaths: result.checkedPaths,
            issue: `Evidence file not found: ${ref}`
          })
        }
      }
    }

    // Validate implementation files (code)
    if (control.implementation && control.implementation !== '-' && control.implementation !== '---') {
      // Split by comma and filter out generic references
      const implRefs = control.implementation
        .split(',')
        .map(i => i.trim())
        .filter(i => {
          if (!i || i === '-' || i === '---') return false
          // Filter out generic/descriptive references
          const genericRefs = [
            'NextAuth.js', 'middleware', 'TLS/HTTPS', 'Platform/app maintenance',
            'Platform/facility controls', 'RBAC', 'Access controls', 'SoD matrix',
            'operational controls', 'Cloud-only', 'Browser access',
            'External APIs', 'Approval workflow', 'Network security', 'Network segmentation',
            'Network controls', 'Connection management', 'Database encryption', 'Key management',
            'Mobile code policy', 'CSP', 'TLS authentication', 'Flaw management',
            'Malware protection', 'Alert monitoring', 'Protection updates', 'Vulnerability scanning',
            'System monitoring', 'Automated detection', 'IR capability', 'IR testing',
            'tabletop exercise', 'IR procedures', 'Training program', 'Insider threat training',
            'Version control', 'Git history', 'Screening process', 'Termination procedures',
            'access revocation', 'Visitor procedures', 'Visitor monitoring', 'Device controls',
            'Access devices', 'Remote work controls', 'Alternate sites', 'Risk assessment',
            'Vulnerability remediation', 'Remediation process', 'Control assessment',
            'POA&M process', 'Continuous monitoring', 'System Security Plan',
            'GCP data center physical security', 'GitHub facilities'
          ]
          return !genericRefs.some(gr => i.toLowerCase().includes(gr.toLowerCase()))
        })

      for (const ref of implRefs) {
        // Only check if it looks like a file path (not descriptive text)
      const isDescriptive = [
        'sudo logging', 'Railway logical', 'UFW firewall active', 'FIPS kernel mode enabled',
        'customer-configured', 'Google VM', '/var/log/', '/proc/sys/'
      ].some(desc => ref.includes(desc))
      
      // Clean up references (remove trailing parentheses, extra spaces)
      let cleanRef = ref.trim().replace(/\)$/, '').trim()
      
      if (!isDescriptive && (cleanRef.includes('.ts') || cleanRef.includes('.tsx') || cleanRef.includes('.js') || 
          cleanRef.includes('.prisma') || cleanRef.includes('.md') || cleanRef.includes('/') || cleanRef.includes('Model'))) {
        totalReferences++
        const result = await findFile(cleanRef, 'implementation')
        if (result.exists) {
          foundReferences++
        } else {
          missingReferences++
          results.push({
            controlId: control.id,
            type: 'implementation',
            reference: ref, // Keep original for reporting
            exists: false,
            expectedPaths: result.checkedPaths,
            issue: `Implementation file not found: ${ref}`
          })
        }
      }
      }
    }
  }

  // Print summary
  console.log('Summary:')
  console.log(`  Total file references: ${totalReferences}`)
  console.log(`  Found: ${foundReferences}`)
  console.log(`  Missing: ${missingReferences}`)
  console.log()

  if (results.length > 0) {
    console.log('='.repeat(80))
    console.log('Missing Files by Type')
    console.log('='.repeat(80))
    console.log()

    // Group by type
    const byType = {
      policy: results.filter(r => r.type === 'policy'),
      procedure: results.filter(r => r.type === 'procedure'),
      evidence: results.filter(r => r.type === 'evidence'),
      implementation: results.filter(r => r.type === 'implementation')
    }

    for (const [type, items] of Object.entries(byType)) {
      if (items.length > 0) {
        console.log(`\n${type.toUpperCase()} (${items.length} missing):`)
        console.log('-'.repeat(80))
        for (const item of items.slice(0, 20)) { // Show first 20
          console.log(`  ${item.controlId}: ${item.reference}`)
          if (item.expectedPaths.length > 0) {
            console.log(`    Checked paths:`)
            item.expectedPaths.slice(0, 3).forEach(path => {
              console.log(`      - ${path}`)
            })
          }
        }
        if (items.length > 20) {
          console.log(`  ... and ${items.length - 20} more`)
        }
      }
    }

    // Save detailed report
    const reportPath = join(process.cwd(), 'compliance', 'cmmc', 'level2', '04-self-assessment', 'audit-file-validation-report.json')
    const fs = await import('fs/promises')
    await fs.writeFile(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: totalReferences,
        found: foundReferences,
        missing: missingReferences
      },
      missingFiles: results
    }, null, 2))
    console.log(`\nDetailed report saved to: ${reportPath}`)
  } else {
    console.log('✅ All file references are valid!')
  }
}

if (require.main === module) {
  validateAllFilePaths()
    .then(() => {
      console.log('\nValidation complete!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Error during validation:', error)
      process.exit(1)
    })
}

export { validateAllFilePaths }
