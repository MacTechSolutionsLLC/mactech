/**
 * Migration script to simplify POA&M statuses from multiple statuses to just "open" and "closed"
 * 
 * Migration rules:
 * - "verified" → "closed" (verified means complete)
 * - "remediated" → "closed" (remediated means complete)
 * - "in_progress" → "open" (still in progress)
 * - "open" → "open" (no change)
 * - "closed" → "closed" (no change)
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting POA&M status migration...\n')

  // Get all POA&M items
  const allItems = await prisma.pOAMItem.findMany({
    select: {
      id: true,
      poamId: true,
      status: true,
    },
  })

  console.log(`Found ${allItems.length} POA&M items\n`)

  let migrated = 0
  const statusMap: Record<string, number> = {}

  for (const item of allItems) {
    const oldStatus = item.status
    let newStatus = oldStatus

    // Map old statuses to new statuses
    if (oldStatus === 'verified' || oldStatus === 'remediated') {
      newStatus = 'closed'
    } else if (oldStatus === 'in_progress') {
      newStatus = 'open'
    }
    // "open" and "closed" stay the same

    if (newStatus !== oldStatus) {
      await prisma.pOAMItem.update({
        where: { id: item.id },
        data: { status: newStatus },
      })
      console.log(`✓ ${item.poamId}: ${oldStatus} → ${newStatus}`)
      migrated++
    }

    // Track status counts
    statusMap[newStatus] = (statusMap[newStatus] || 0) + 1
  }

  console.log(`\n✓ Migration complete!`)
  console.log(`  Migrated: ${migrated} items`)
  console.log(`  Unchanged: ${allItems.length - migrated} items\n`)
  console.log('Final status breakdown:')
  for (const [status, count] of Object.entries(statusMap)) {
    console.log(`  ${status}: ${count}`)
  }
}

main()
  .catch((error) => {
    console.error('Error during migration:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
