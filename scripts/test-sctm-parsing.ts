import { readFile } from 'fs/promises'
import { parseSCTM } from '../lib/compliance/sctm-parser'

async function test() {
  const content = await readFile('compliance/cmmc/level2/04-self-assessment/MAC-AUD-408_System_Control_Traceability_Matrix.md', 'utf-8')
  const controls = parseSCTM(content)
  const c = controls.find(ctrl => ctrl.id === '3.1.1')
  
  console.log('3.1.1 from SCTM parser:')
  console.log('  NIST Requirement:', c?.nistRequirement ? `EXISTS (${c.nistRequirement.length} chars)` : 'UNDEFINED')
  console.log('  NIST Discussion:', c?.nistDiscussion ? `EXISTS (${c.nistDiscussion.length} chars)` : 'UNDEFINED')
  
  if (c?.nistRequirement) {
    console.log('  NIST Requirement preview:', c.nistRequirement.substring(0, 80))
  }
}

test().catch(console.error)
