/**
 * API endpoint to update POAM-012 (Prohibit Password Reuse) to closed status
 * This endpoint updates the database record to reflect the completed implementation
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Updating POA&M item for password reuse (3.5.8)...')

    // Find the POA&M item for password reuse (3.5.8)
    const poamItem = await prisma.pOAMItem.findFirst({
      where: {
        controlId: '3.5.8',
        title: { contains: 'Password Reuse' },
      },
    })

    if (!poamItem) {
      return NextResponse.json(
        { error: 'POA&M item for password reuse (3.5.8) not found' },
        { status: 404 }
      )
    }

    const updated = await prisma.pOAMItem.update({
      where: { id: poamItem.id },
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

    await logAdminAction(
      session.user.id,
      session.user.email || '',
      'admin_action',
      { type: 'poam', id: updated.id },
      {
        poamId: updated.poamId,
        action: 'poam_item_updated',
        changes: ['status', 'priority', 'actualCompletionDate', 'milestones', 'notes'],
      }
    )

    return NextResponse.json({
      success: true,
      message: `POA&M item ${updated.poamId} (Password Reuse) updated successfully`,
      item: updated,
    })
  } catch (error: any) {
    console.error('Error updating POA&M item for password reuse:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'POA&M item for password reuse (3.5.8) not found in database' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update POA&M item for password reuse', details: error.message },
      { status: 500 }
    )
  }
}
