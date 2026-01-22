/**
 * Export users to CSV for quarterly access review
 * Usage: tsx compliance/scripts/export-users.ts > users-export-YYYYMMDD.csv
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function exportUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        lastLoginAt: true,
        disabled: true,
        createdAt: true,
        securityAcknowledgmentAcceptedAt: true,
      },
      orderBy: { email: 'asc' },
    })

    // CSV header
    const headers = [
      'Email',
      'Name',
      'Role',
      'Last Login',
      'Disabled',
      'Created At',
      'Security Acknowledgment Accepted',
    ]

    // CSV rows
    const rows = users.map((user) => [
      user.email,
      user.name || '',
      user.role,
      user.lastLoginAt?.toISOString() || 'Never',
      user.disabled ? 'Yes' : 'No',
      user.createdAt.toISOString(),
      user.securityAcknowledgmentAcceptedAt?.toISOString() || 'Not Accepted',
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
    console.error('Error exporting users:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

exportUsers()
