/**
 * Update POA&M statuses based on SCTM implementation status
 * This endpoint reads the SCTM and updates POA&M items to reflect actual implementation status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM } from '@/lib/compliance/sctm-parser'
import { logAdminAction } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Updating POA&M statuses based on SCTM implementation status...')

    // Read and parse SCTM
    const sctmPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level2',
      '04-self-assessment',
      'MAC-AUD-408_System_Control_Traceability_Matrix.md'
    )
    const content = await readFile(sctmPath, 'utf-8')
    const controls = parseSCTM(content)

    // Create a map of control ID to status
    const controlStatusMap: Record<string, string> = {}
    for (const control of controls) {
      controlStatusMap[control.id] = control.status
    }

    // Get all POA&M items
    const poamItems = await prisma.pOAMItem.findMany({
      orderBy: { poamId: 'asc' },
    })

    const updates: Array<{ poamId: string; oldStatus: string; newStatus: string }> = []

    // Update each POA&M based on control status
    for (const poam of poamItems) {
      const affectedControls = JSON.parse(poam.affectedControls || '[]')
      let allImplemented = true
      let anyImplemented = false
      let anyNotImplemented = false

      // Check status of all affected controls
      for (const controlId of affectedControls) {
        const status = controlStatusMap[controlId]
        if (status === 'implemented' || status === 'inherited') {
          anyImplemented = true
        } else if (status === 'not_implemented') {
          allImplemented = false
          anyNotImplemented = true
        } else if (status === 'not_applicable') {
          // N/A controls don't affect implementation status
        } else {
          allImplemented = false
        }
      }

      // Determine new status
      let newStatus = poam.status
      let shouldUpdate = false
      const now = new Date()

      if (allImplemented && poam.status !== 'closed') {
        // All controls implemented - should be closed
        newStatus = 'closed'
        shouldUpdate = true
      } else if (anyNotImplemented && poam.status === 'closed') {
        // Controls not implemented but POA&M is closed - reopen
        newStatus = 'open'
        shouldUpdate = true
      }

      // Update milestones based on status
      let milestones = JSON.parse(poam.milestones || '[]')
      if (newStatus === 'closed') {
        // Mark all milestones as completed
        milestones = milestones.map((m: any) => ({ ...m, completed: true }))
        shouldUpdate = true
      }

      if (shouldUpdate) {
        const updateData: any = {
          status: newStatus,
          milestones: JSON.stringify(milestones),
        }

        // Set completion date
        if (newStatus === 'closed' && !poam.actualCompletionDate) {
          updateData.actualCompletionDate = now
        }

        await prisma.pOAMItem.update({
          where: { id: poam.id },
          data: updateData,
        })

        updates.push({
          poamId: poam.poamId,
          oldStatus: poam.status,
          newStatus,
        })
      }
    }

    // Special handling for specific POA&Ms based on SCTM
    const specialUpdates: string[] = []

    // POAM-001: MFA (3.5.3) - Implemented
    const poam001 = poamItems.find(p => p.poamId === 'POAM-001')
    if (poam001 && controlStatusMap['3.5.3'] === 'implemented') {
      if (poam001.status !== 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam001.id },
          data: {
            status: 'closed',
            actualCompletionDate: poam001.actualCompletionDate || new Date('2026-01-23'),
            verifiedAt: poam001.verifiedAt || new Date('2026-01-23'),
            milestones: JSON.stringify([
              { text: 'MFA solution selected (Week 3) - NextAuth.js with TOTP Provider', completed: true },
              { text: 'MFA implemented (Week 4)', completed: true },
              { text: 'MFA tested and verified (Week 4)', completed: true },
              { text: 'MFA evidence created (Week 4) - MAC-RPT-104_MFA_Implementation_Evidence.md', completed: true },
            ]),
          },
        })
        specialUpdates.push('POAM-001: Updated to reflect MFA implementation')
      }
    }

    // POAM-002: Account Lockout (3.1.8) - Implemented
    const poam002 = poamItems.find(p => p.poamId === 'POAM-002')
    if (poam002 && controlStatusMap['3.1.8'] === 'implemented') {
      if (poam002.status !== 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam002.id },
          data: {
            status: 'closed',
            actualCompletionDate: poam002.actualCompletionDate || new Date('2026-01-23'),
            verifiedAt: poam002.verifiedAt || new Date('2026-01-23'),
            milestones: JSON.stringify([
              { text: 'Account lockout design completed (Week 17)', completed: true },
              { text: 'Account lockout implemented (Week 18)', completed: true },
              { text: 'Account lockout tested (Week 18)', completed: true },
              { text: 'Procedure updated (Week 18)', completed: true },
            ]),
          },
        })
        specialUpdates.push('POAM-002: Updated to reflect account lockout implementation')
      }
    }

    // POAM-012: Password Reuse (3.5.8) - Implemented
    const poam012 = poamItems.find(p => p.poamId === 'POAM-012')
    if (poam012 && controlStatusMap['3.5.8'] === 'implemented') {
      if (poam012.status !== 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam012.id },
          data: {
            status: 'closed',
            actualCompletionDate: new Date('2026-01-24'),
            verifiedAt: new Date('2026-01-24'),
            milestones: JSON.stringify([
              { text: 'Password history model created', completed: true },
              { text: 'Password history implementation completed', completed: true },
              { text: 'Password history tested and verified', completed: true },
              { text: 'Evidence documented', completed: true },
            ]),
          },
        })
        specialUpdates.push('POAM-012: Updated to reflect password reuse prevention implementation')
      }
    }

    // POAM-011: Disable identifiers after inactivity (3.5.6) - Not Implemented
    const poam011 = poamItems.find(p => p.poamId === 'POAM-011')
    if (poam011 && controlStatusMap['3.5.6'] === 'not_implemented') {
      if (poam011.status === 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam011.id },
          data: {
            status: 'open',
            actualCompletionDate: null,
            verifiedAt: null,
          },
        })
        specialUpdates.push('POAM-011: Reopened - control not implemented')
      } else if (poam011.status !== 'open') {
        await prisma.pOAMItem.update({
          where: { id: poam011.id },
          data: { status: 'open' },
        })
        specialUpdates.push('POAM-011: Set to open - control not implemented')
      }
    }

    // POAM-013: Controls on maintenance tools (3.7.2) - Not Implemented
    const poam013 = poamItems.find(p => p.poamId === 'POAM-013')
    if (poam013 && controlStatusMap['3.7.2'] === 'not_implemented') {
      if (poam013.status === 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam013.id },
          data: {
            status: 'open',
            actualCompletionDate: null,
            verifiedAt: null,
          },
        })
        specialUpdates.push('POAM-013: Reopened - control not implemented')
      } else if (poam013.status !== 'open') {
        await prisma.pOAMItem.update({
          where: { id: poam013.id },
          data: { status: 'open' },
        })
        specialUpdates.push('POAM-013: Set to open - control not implemented')
      }
    }

    // Log the admin action
    await logAdminAction(
      session.user.id,
      session.user.email || '',
      'poam_status_update',
      { type: 'poam', id: 'bulk' },
      {
        updatesCount: updates.length,
        specialUpdatesCount: specialUpdates.length,
        updates,
        specialUpdates,
      }
    )

    // Get updated statistics
    const stats = await prisma.pOAMItem.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    const statusBreakdown: Record<string, number> = {}
    for (const stat of stats) {
      statusBreakdown[stat.status] = stat._count.id
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${updates.length} POA&M items`,
      updates,
      specialUpdates,
      statusBreakdown,
    })
  } catch (error: any) {
    console.error('Error updating POA&M statuses:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update POA&M statuses',
      },
      { status: 500 }
    )
  }
}
