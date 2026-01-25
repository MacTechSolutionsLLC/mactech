import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '.env.local'), override: true })

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set in environment variables')
  process.exit(1)
}

// Remove quotes if present
if (process.env.DATABASE_URL.startsWith('"') && process.env.DATABASE_URL.endsWith('"')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.slice(1, -1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

/**
 * Mark feedback items as implemented
 * Usage: tsx scripts/mark-feedback-implemented.ts [feedback-ids...]
 * If no IDs provided, marks all pending feedback as implemented
 */

async function markFeedbackImplemented() {
  const feedbackIds = process.argv.slice(2)

  try {
    let updated

    if (feedbackIds.length > 0) {
      // Update specific feedback items
      updated = await prisma.feedback.updateMany({
        where: {
          id: {
            in: feedbackIds,
          },
        },
        data: {
          status: 'implemented',
        },
      })
      console.log(`✅ Marked ${updated.count} feedback item(s) as implemented`)
    } else {
      // Mark all pending feedback as implemented
      updated = await prisma.feedback.updateMany({
        where: {
          status: 'pending',
        },
        data: {
          status: 'implemented',
        },
      })
      console.log(`✅ Marked ${updated.count} pending feedback item(s) as implemented`)
    }

    // List the updated items
    const updatedItems = await prisma.feedback.findMany({
      where: {
        status: 'implemented',
        updatedAt: {
          gte: new Date(Date.now() - 1000), // Items updated in the last second
        },
      },
      select: {
        id: true,
        content: true,
        pageUrl: true,
        status: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    console.log('\nUpdated feedback items:')
    updatedItems.forEach((item, index) => {
      console.log(`\n${index + 1}. [${item.id}]`)
      console.log(`   Content: ${item.content.substring(0, 80)}...`)
      console.log(`   Page: ${item.pageUrl || 'N/A'}`)
      console.log(`   Created: ${item.createdAt.toISOString()}`)
    })

  } catch (error) {
    console.error('Error marking feedback as implemented:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

markFeedbackImplemented()
