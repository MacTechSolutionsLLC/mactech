import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables - .env.local takes precedence over .env
const envResult = config({ path: resolve(process.cwd(), '.env') })
const envLocalResult = config({ path: resolve(process.cwd(), '.env.local'), override: true }) // Override .env values

// Ensure DATABASE_URL is set and properly formatted
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL is not set in environment variables')
  console.error('Please set DATABASE_URL in .env.local or .env file')
  process.exit(1)
}

// Remove quotes if present
if (process.env.DATABASE_URL.startsWith('"') && process.env.DATABASE_URL.endsWith('"')) {
  process.env.DATABASE_URL = process.env.DATABASE_URL.slice(1, -1)
}

// Verify DATABASE_URL format
if (!process.env.DATABASE_URL.startsWith('postgresql://') && !process.env.DATABASE_URL.startsWith('postgres://')) {
  console.error(`Error: DATABASE_URL must start with postgresql:// or postgres://`)
  console.error(`Current value starts with: ${process.env.DATABASE_URL.substring(0, 20)}...`)
  process.exit(1)
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

/**
 * Process feedback script
 * Reads feedback entries from the database and outputs them in a structured format
 * 
 * Usage:
 *   tsx scripts/process-feedback.ts [status]
 * 
 * Examples:
 *   tsx scripts/process-feedback.ts                    # Process all pending and reviewed feedback
 *   tsx scripts/process-feedback.ts pending           # Process only pending feedback
 *   tsx scripts/process-feedback.ts reviewed          # Process only reviewed feedback
 *   tsx scripts/process-feedback.ts all               # Process all feedback regardless of status
 */

interface FeedbackItem {
  id: string
  content: string
  status: string
  pageUrl: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string
  }
}

async function processFeedback() {
  const statusFilter = process.argv[2] || 'pending,reviewed'

  try {
    // Build where clause
    const where: any = {}
    
    if (statusFilter !== 'all') {
      const statuses = statusFilter.split(',').map(s => s.trim())
      where.status = {
        in: statuses
      }
    }

    // Fetch feedback with user information
    const feedback = await prisma.feedback.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (feedback.length === 0) {
      console.log('No feedback found matching the criteria.')
      return
    }

    // Output structured data
    console.log('='.repeat(80))
    console.log(`Feedback Processing Report`)
    console.log(`Generated: ${new Date().toISOString()}`)
    console.log(`Total feedback entries: ${feedback.length}`)
    console.log(`Status filter: ${statusFilter}`)
    console.log('='.repeat(80))
    console.log()

    // Group by status
    const byStatus = feedback.reduce((acc, item) => {
      if (!acc[item.status]) {
        acc[item.status] = []
      }
      acc[item.status].push(item)
      return acc
    }, {} as Record<string, FeedbackItem[]>)

    // Output by status
    for (const [status, items] of Object.entries(byStatus)) {
      console.log(`\n## Status: ${status.toUpperCase()} (${items.length} entries)`)
      console.log('-'.repeat(80))

      items.forEach((item, index) => {
        console.log(`\n### Entry ${index + 1} (ID: ${item.id})`)
        console.log(`User: ${item.user.name || item.user.email} (${item.user.email})`)
        console.log(`Submitted: ${item.createdAt.toISOString()}`)
        if (item.pageUrl) {
          console.log(`Page URL: ${item.pageUrl}`)
        }
        console.log(`Content:`)
        console.log(item.content)
        console.log()
      })
    }

    // Output JSON format (for programmatic processing)
    console.log('\n' + '='.repeat(80))
    console.log('JSON Output (for programmatic processing):')
    console.log('='.repeat(80))
    console.log(JSON.stringify(
      feedback.map(item => ({
        id: item.id,
        content: item.content,
        status: item.status,
        pageUrl: item.pageUrl,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        user: {
          id: item.user.id,
          name: item.user.name,
          email: item.user.email,
        },
      })),
      null,
      2
    ))

    // Summary statistics
    console.log('\n' + '='.repeat(80))
    console.log('Summary Statistics:')
    console.log('='.repeat(80))
    console.log(`Total entries processed: ${feedback.length}`)
    Object.entries(byStatus).forEach(([status, items]) => {
      console.log(`  ${status}: ${items.length}`)
    })
    console.log()

    // Log processed feedback IDs (for tracking)
    console.log('Processed feedback IDs:')
    feedback.forEach(item => {
      console.log(`  - ${item.id}`)
    })

  } catch (error) {
    console.error('Error processing feedback:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

processFeedback()
