import { parseNISTSP800171 } from '../lib/compliance/nist-sp-800-171-parser'

async function test() {
  const data = await parseNISTSP800171()
  const testIds = ['3.1.1', '3.1.2', '3.1.3', '3.8.3']
  let withDiscussion = 0
  for (const id of testIds) {
    const control = data.get(id)
    if (control) {
      const hasDiscussion = control.discussion && control.discussion.length > 0
      console.log(`${id}: requirement=${control.requirement.length} chars, discussion=${control.discussion.length} chars ${hasDiscussion ? 'OK' : 'MISSING'}`)
      if (hasDiscussion) {
        console.log(`  discussion preview: ${control.discussion.substring(0, 80)}...`)
        withDiscussion++
      }
    }
  }
  let totalWithDiscussion = 0
  for (const [, control] of data.entries()) {
    if (control.discussion && control.discussion.trim().length > 0) totalWithDiscussion++
  }
  console.log(`\nControls with discussion: ${totalWithDiscussion}/${data.size}`)
}

test().catch(console.error)
