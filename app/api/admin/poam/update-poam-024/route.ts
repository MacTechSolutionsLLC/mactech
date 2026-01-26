/**
 * API endpoint to update POAM-024 (FIPS-Validated Cryptography) with current implementation status
 * Updates the database record to reflect Partially Satisfied status and completed milestones
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

    console.log('Updating POA&M item for FIPS-validated cryptography (3.13.11)...')

    // Find the POA&M item for FIPS (3.13.11)
    const poamItem = await prisma.pOAMItem.findFirst({
      where: {
        OR: [
          { poamId: 'POAM-024' },
          { controlId: '3.13.11', title: { contains: 'FIPS' } },
        ],
      },
    })

    if (!poamItem) {
      return NextResponse.json(
        { error: 'POA&M item for FIPS (3.13.11) not found' },
        { status: 404 }
      )
    }

    // Updated planned remediation with completed items marked
    const plannedRemediation = [
      '✅ Assess FIPS validation status of cryptography used',
      '✅ Document cryptography implementation',
      '✅ Identify FIPS-validated vs non-FIPS-validated cryptography',
      '✅ Create FIPS assessment evidence',
      '✅ Plan migration to FIPS-validated cryptography',
      '✅ Implement FIPS-validated cryptographic library (Option 2)',
      '⚠️ Activate FIPS mode (requires OpenSSL 3.0.8 FIPS Provider)',
      '⚠️ Verify FIPS mode is active and operational',
      '⚠️ Update control status to "Implemented" after verification',
    ]

    // Updated milestones reflecting completed work
    const milestones = [
      { text: 'FIPS assessment conducted', completed: true },
      { text: 'Assessment documented', completed: true },
      { text: 'Evidence created', completed: true },
      { text: 'Migration plan created', completed: true },
      { text: 'Code implementation complete', completed: true },
      { text: 'FIPS verification tools created', completed: true },
      { text: 'Test suite created', completed: true },
      { text: 'FIPS mode activation', completed: false },
      { text: 'FIPS verification and testing', completed: false },
      { text: 'Control closure and status update', completed: false },
    ]

    const updated = await prisma.pOAMItem.update({
      where: { id: poamItem.id },
      data: {
        status: 'in_progress', // Use 'in_progress' for Partially Satisfied
        plannedRemediation: JSON.stringify(plannedRemediation),
        milestones: JSON.stringify(milestones),
        targetCompletionDate: new Date('2026-07-22'), // Exactly 180 days
        notes: `FIPS-validated cryptography implementation status:

✅ COMPLETED:
- FIPS assessment and verification complete (OpenSSL 3.3.2/3.6.0 identified, CMVP #4282 confirmed)
- FIPS-validated JWT code implementation complete (lib/fips-crypto.ts, lib/fips-jwt.ts, lib/fips-nextauth-config.ts)
- NextAuth.js integration complete
- FIPS verification tools operational (lib/fips-verification.ts, scripts/verify-fips-status.ts, app/api/admin/fips-status/route.ts)
- Documentation and evidence complete (MAC-RPT-110, MAC-RPT-124)
- Test suite created (scripts/test-fips-jwt.ts)

⚠️ PENDING (External Dependency):
- FIPS mode activation (requires OpenSSL 3.0.8 FIPS Provider - CMVP Certificate #4282)
- Runtime FIPS verification (cannot verify until FIPS mode is active)
- Control status update to "Implemented" (pending FIPS activation)

STATUS: ⚠️ Partially Satisfied
- Code implementation: ✅ Complete
- FIPS mode activation: ⚠️ Pending (external dependency)
- Assessment acceptability: Partially Satisfied status is acceptable for CMMC Level 2 assessment when tracked in POA&M

NEXT STEPS:
1. Contact Railway support about OpenSSL 3.0.8 FIPS Provider availability
2. OR: Implement custom Docker image with FIPS-validated OpenSSL
3. Once FIPS mode is active, run verification tests and update documentation
4. Close POA&M item and update control status to "Implemented"

Target completion: 2026-07-22 (180 days from 2026-01-24)`,
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
        changes: ['status', 'plannedRemediation', 'milestones', 'targetCompletionDate', 'notes'],
      }
    )

    return NextResponse.json({
      success: true,
      message: `POA&M item ${updated.poamId} (FIPS-Validated Cryptography) updated successfully`,
      item: updated,
    })
  } catch (error: any) {
    console.error('Error updating POA&M item for FIPS:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'POA&M item for FIPS (3.13.11) not found in database' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update POA&M item for FIPS', details: error.message },
      { status: 500 }
    )
  }
}
