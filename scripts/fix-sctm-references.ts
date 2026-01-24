/**
 * Fix SCTM references by removing "(to be created)" text and updating to correct file names
 */

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const SCTM_PATH = join(
  process.cwd(),
  'compliance',
  'cmmc',
  'level2',
  '04-self-assessment',
  'MAC-AUD-408_System_Control_Traceability_Matrix.md'
)

async function main() {
  console.log('Fixing SCTM references...\n')

  try {
    const content = await readFile(SCTM_PATH, 'utf-8')
    
    // Remove "(to be created)" from policy references
    let updated = content.replace(/MAC-POL-(\d+)\s*\(to be created\)/gi, 'MAC-POL-$1')
    updated = updated.replace(/MAC-SOP-(\d+)\s*\(to be created\)/gi, 'MAC-SOP-$1')
    
    // Also fix any other "(to be created)" references
    updated = updated.replace(/\s*\(to be created\)/gi, '')
    
    // Count changes
    const originalMatches = (content.match(/\(to be created\)/gi) || []).length
    const updatedMatches = (updated.match(/\(to be created\)/gi) || []).length
    
    if (originalMatches > updatedMatches) {
      await writeFile(SCTM_PATH, updated, 'utf-8')
      console.log(`✓ Removed ${originalMatches - updatedMatches} "(to be created)" references`)
      console.log(`✓ Updated SCTM file: ${SCTM_PATH}`)
    } else {
      console.log('✓ No changes needed - SCTM already clean')
    }

  } catch (error) {
    console.error('Error fixing SCTM:', error)
    process.exit(1)
  }
}

main().catch(console.error)
