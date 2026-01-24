/**
 * Script to update POAM-012 (Prohibit Password Reuse) to closed status
 * Run with: npx tsx scripts/update-poam-012.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updatePOAM012() {
  try {
    console.log('Updating POAM-012...')

    const updated = await prisma.pOAMItem.update({
      where: { poamId: 'POAM-012' },
      data: {
        status: 'closed',
        priority: 'medium',
        actualCompletionDate: new Date('2026-01-24'),
        milestones: JSON.stringify([
          { text: 'Password history requirement defined', completed: true },
          { text: 'Password history storage implemented', completed: true },
          { text: 'Password reuse check implemented', completed: true },
          { text: 'Password reuse prevention tested and documented', completed: true },
        ]),
        notes: 'Control fully implemented. Password history prevents reuse of last 5 passwords. Implementation completed ahead of schedule on 2026-01-24. PasswordHistory model added to Prisma schema. Password reuse prevention enforced in password change and admin reset routes.',
      },
    })

    console.log('✅ POAM-012 updated successfully:', {
      poamId: updated.poamId,
      status: updated.status,
      actualCompletionDate: updated.actualCompletionDate,
    })
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('❌ POAM-012 not found in database. Make sure it exists.')
    } else {
      console.error('❌ Error updating POAM-012:', error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updatePOAM012()
