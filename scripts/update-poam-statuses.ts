/**
 * Update POA&M statuses based on SCTM implementation status
 * This script reads the SCTM and updates POA&M items to reflect actual implementation status
 */

import { PrismaClient } from '@prisma/client'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { parseSCTM } from '../lib/compliance/sctm-parser'

const prisma = new PrismaClient()

// Map control IDs to POA&M IDs based on the tracking log
const controlToPOAM: Record<string, string> = {
  '3.5.3': 'POAM-001', // MFA Implementation
  '3.1.8': 'POAM-002', // Account Lockout
  '3.3.1': 'POAM-003', // Enhanced Audit Logging (covers 3.3.1-3.3.9)
  '3.3.2': 'POAM-003',
  '3.3.3': 'POAM-003',
  '3.3.4': 'POAM-003',
  '3.3.5': 'POAM-003',
  '3.3.6': 'POAM-003',
  '3.3.7': 'POAM-003',
  '3.3.8': 'POAM-003',
  '3.3.9': 'POAM-003',
  '3.4.1': 'POAM-004', // Configuration Management (covers 3.4.1-3.4.9)
  '3.4.2': 'POAM-004',
  '3.4.3': 'POAM-004',
  '3.4.4': 'POAM-004',
  '3.4.5': 'POAM-004',
  '3.4.6': 'POAM-004',
  '3.4.7': 'POAM-004',
  '3.4.8': 'POAM-004',
  '3.4.9': 'POAM-004',
  '3.2.1': 'POAM-005', // Security Awareness Training (covers 3.2.1-3.2.3)
  '3.2.2': 'POAM-005',
  '3.2.3': 'POAM-005',
  '3.9.1': 'POAM-006', // Personnel Security (covers 3.9.1-3.9.2)
  '3.9.2': 'POAM-006',
  '3.10.1': 'POAM-007', // Physical Protection (covers 3.10.1-3.10.6)
  '3.10.2': 'POAM-007',
  '3.10.3': 'POAM-007',
  '3.10.4': 'POAM-007',
  '3.10.5': 'POAM-007',
  '3.10.6': 'POAM-007',
  '3.11.1': 'POAM-008', // Risk Assessment (covers 3.11.1-3.11.3)
  '3.11.2': 'POAM-008',
  '3.11.3': 'POAM-008',
  '3.12.1': 'POAM-009', // Security Assessment (covers 3.12.1-3.12.4)
  '3.12.2': 'POAM-009',
  '3.12.3': 'POAM-009',
  '3.12.4': 'POAM-009',
  '3.13.11': 'POAM-010', // FIPS Cryptography Assessment
  '3.5.6': 'POAM-011', // Disable identifiers after inactivity
  '3.5.8': 'POAM-012', // Prohibit password reuse
  '3.7.2': 'POAM-013', // Controls on maintenance tools
}

async function main() {
  console.log('Updating POA&M statuses based on SCTM implementation status...\n')

  try {
    // Read and parse SCTM
    const sctmPath = join(
      process.cwd(),
      'compliance',
      'cmmc',
      'level1',
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

    console.log(`Found ${poamItems.length} POA&M items\n`)

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
        if (poam.status === 'verified') {
          newStatus = 'closed'
          shouldUpdate = true
          console.log(`✓ ${poam.poamId}: All controls implemented - closing`)
        } else if (poam.status !== 'closed') {
          // Mark as verified first if not already
          newStatus = 'verified'
          shouldUpdate = true
          console.log(`✓ ${poam.poamId}: All controls implemented - marking as verified`)
        }
      } else if (anyImplemented && poam.status === 'open') {
        // Some controls implemented - mark as in progress
        newStatus = 'in_progress'
        shouldUpdate = true
        console.log(`→ ${poam.poamId}: Some controls implemented - marking as in progress`)
      } else if (anyNotImplemented && poam.status === 'closed') {
        // Controls not implemented but POA&M is closed - reopen
        newStatus = 'open'
        shouldUpdate = true
        console.log(`⚠ ${poam.poamId}: Controls not implemented - reopening`)
      }

      // Update milestones based on status
      let milestones = JSON.parse(poam.milestones || '[]')
      if (newStatus === 'closed' || newStatus === 'verified') {
        // Mark all milestones as completed
        milestones = milestones.map((m: any) => ({ ...m, completed: true }))
        shouldUpdate = true
      }

      if (shouldUpdate) {
        const updateData: any = {
          status: newStatus,
          milestones: JSON.stringify(milestones),
        }

        // Set completion dates
        if (newStatus === 'verified' && !poam.verifiedAt) {
          updateData.verifiedAt = now
          updateData.verifiedBy = null // System update
        }

        if (newStatus === 'closed' && !poam.actualCompletionDate) {
          updateData.actualCompletionDate = now
        }

        await prisma.pOAMItem.update({
          where: { id: poam.id },
          data: updateData,
        })
      } else {
        console.log(`- ${poam.poamId}: No update needed (status: ${poam.status})`)
      }
    }

    // Special handling for specific POA&Ms based on SCTM
    console.log('\n--- Special Status Updates ---\n')

    // POAM-001: MFA (3.5.3) - Implemented
    const poam001 = poamItems.find(p => p.poamId === 'POAM-001')
    if (poam001 && controlStatusMap['3.5.3'] === 'implemented') {
      if (poam001.status !== 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam001.id },
          data: {
            status: poam001.status === 'verified' ? 'closed' : 'verified',
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
        console.log('✓ POAM-001: Updated to reflect MFA implementation')
      }
    }

    // POAM-002: Account Lockout (3.1.8) - Implemented
    const poam002 = poamItems.find(p => p.poamId === 'POAM-002')
    if (poam002 && controlStatusMap['3.1.8'] === 'implemented') {
      if (poam002.status !== 'closed') {
        await prisma.pOAMItem.update({
          where: { id: poam002.id },
          data: {
            status: poam002.status === 'verified' ? 'closed' : 'verified',
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
        console.log('✓ POAM-002: Updated to reflect account lockout implementation')
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
        console.log('✓ POAM-012: Updated to reflect password reuse prevention implementation')
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
        console.log('⚠ POAM-011: Reopened - control not implemented')
      } else if (poam011.status !== 'open' && poam011.status !== 'in_progress') {
        await prisma.pOAMItem.update({
          where: { id: poam011.id },
          data: { status: 'open' },
        })
        console.log('→ POAM-011: Set to open - control not implemented')
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
        console.log('⚠ POAM-013: Reopened - control not implemented')
      } else if (poam013.status !== 'open' && poam013.status !== 'in_progress') {
        await prisma.pOAMItem.update({
          where: { id: poam013.id },
          data: { status: 'open' },
        })
        console.log('→ POAM-013: Set to open - control not implemented')
      }
    }

    console.log('\n✓ POA&M status update complete!')
    console.log('\nSummary:')
    const updatedStats = await prisma.pOAMItem.groupBy({
      by: ['status'],
      _count: { id: true },
    })
    for (const stat of updatedStats) {
      console.log(`  ${stat.status}: ${stat._count.id}`)
    }

  } catch (error) {
    console.error('Error updating POA&M statuses:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)
