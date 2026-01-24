/**
 * Reorganize Compliance Structure
 * Separates FCI-specific documentation from general system security documentation
 */

import { readdirSync, statSync, renameSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

const COMPLIANCE_ROOT = join(process.cwd(), 'compliance', 'cmmc')
const LEVEL1_DIR = join(COMPLIANCE_ROOT, 'level1')
const SYSTEM_DIR = join(COMPLIANCE_ROOT, 'system')
const FCI_DIR = join(COMPLIANCE_ROOT, 'fci')

// FCI-specific file patterns
const FCI_PATTERNS = [
  'FCI',
  'fci',
  'Federal Contract Information',
  'MAC-SEC-302', // FCI Scope
  'MAC-SEC-303', // FCI Data Handling
  'MAC-IT-105', // System Boundary (FCI-focused)
]

// FCI-specific directories to move
const FCI_DIRECTORIES = [
  '01-system-scope/MAC-SEC-302_FCI_Scope_and_Data_Boundary_Statement.md',
  '01-system-scope/MAC-SEC-303_FCI_Data_Handling_and_Flow_Summary.md',
]

// System-level directories (keep in system/)
const SYSTEM_DIRECTORIES = [
  '01-system-scope/MAC-IT-304_System_Security_Plan.md',
  '01-system-scope/MAC-IT-301_System_Description_and_Architecture.md',
]

async function main() {
  console.log('Reorganizing compliance structure...\n')
  console.log('Creating new directory structure...\n')
  
  // Create new directories
  if (!existsSync(SYSTEM_DIR)) {
    mkdirSync(SYSTEM_DIR, { recursive: true })
    console.log(`Created: ${SYSTEM_DIR}`)
  }
  
  if (!existsSync(FCI_DIR)) {
    mkdirSync(FCI_DIR, { recursive: true })
    console.log(`Created: ${FCI_DIR}`)
  }
  
  // Create subdirectories matching level1 structure
  const subdirs = [
    '00-cover-memo',
    '01-system-scope',
    '02-policies-and-procedures',
    '03-control-responsibility',
    '04-self-assessment',
    '05-evidence',
    '06-supporting-documents',
  ]
  
  for (const subdir of subdirs) {
    const systemSubdir = join(SYSTEM_DIR, subdir)
    const fciSubdir = join(FCI_DIR, subdir)
    
    if (!existsSync(systemSubdir)) {
      mkdirSync(systemSubdir, { recursive: true })
    }
    if (!existsSync(fciSubdir)) {
      mkdirSync(fciSubdir, { recursive: true })
    }
  }
  
  console.log('\nDirectory structure created.')
  console.log('\nNote: This script creates the structure.')
  console.log('Manual file movement recommended to ensure proper categorization.')
  console.log('\nSuggested structure:')
  console.log('- compliance/cmmc/system/ - General system security documentation')
  console.log('- compliance/cmmc/fci/ - FCI-specific compliance documentation')
  console.log('- compliance/cmmc/level1/ - Keep as reference or archive')
}

main().catch(console.error)
