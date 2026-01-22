/**
 * Export events to CSV with optional filters
 * Usage: 
 *   tsx compliance/scripts/export-events.ts > events-export.csv
 *   tsx compliance/scripts/export-events.ts --start=2026-01-01 --end=2026-01-31 > events-export.csv
 *   tsx compliance/scripts/export-events.ts --actionType=login > login-events.csv
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface Filters {
  startDate?: Date
  endDate?: Date
  actionType?: string
  actorUserId?: string
  success?: boolean
}

async function exportEvents(filters: Filters = {}) {
  try {
    const where: any = {}

    if (filters.startDate || filters.endDate) {
      where.timestamp = {}
      if (filters.startDate) where.timestamp.gte = filters.startDate
      if (filters.endDate) where.timestamp.lte = filters.endDate
    }

    if (filters.actionType) where.actionType = filters.actionType
    if (filters.actorUserId) where.actorUserId = filters.actorUserId
    if (filters.success !== undefined) where.success = filters.success

    const events = await prisma.appEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10000, // Limit to 10k events
      include: {
        actor: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
    })

    // CSV header
    const headers = [
      'Timestamp',
      'Action Type',
      'Actor Email',
      'Actor Name',
      'Actor Role',
      'Target Type',
      'Target ID',
      'IP Address',
      'User Agent',
      'Success',
      'Details',
    ]

    // CSV rows
    const rows = events.map((event) => [
      event.timestamp.toISOString(),
      event.actionType,
      event.actorEmail || event.actor?.email || '',
      event.actor?.name || '',
      event.actor?.role || '',
      event.targetType || '',
      event.targetId || '',
      event.ip || '',
      event.userAgent || '',
      event.success ? 'true' : 'false',
      event.details || '',
    ])

    // Generate CSV
    const csv = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n')

    // Output to stdout
    console.log(csv)
  } catch (error) {
    console.error('Error exporting events:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const filters: Filters = {}

for (const arg of args) {
  if (arg.startsWith('--start=')) {
    filters.startDate = new Date(arg.split('=')[1])
  } else if (arg.startsWith('--end=')) {
    filters.endDate = new Date(arg.split('=')[1])
  } else if (arg.startsWith('--actionType=')) {
    filters.actionType = arg.split('=')[1]
  } else if (arg.startsWith('--actorUserId=')) {
    filters.actorUserId = arg.split('=')[1]
  } else if (arg.startsWith('--success=')) {
    filters.success = arg.split('=')[1] === 'true'
  }
}

exportEvents(filters)
