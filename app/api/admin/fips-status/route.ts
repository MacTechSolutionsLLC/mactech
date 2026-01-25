import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authz'
import { verifyFIPSStatus, getFIPSVerificationReport } from '@/lib/fips-verification'

/**
 * GET /api/admin/fips-status
 * Get FIPS validation status for compliance reporting
 * Requires ADMIN role
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const result = verifyFIPSStatus()
    const report = getFIPSVerificationReport()

    return NextResponse.json({
      success: true,
      verification: result,
      report,
      timestamp: new Date().toISOString(),
      compliance: {
        control: '3.13.11',
        requirement: 'FIPS-validated cryptography',
        status: result.validationStatus === 'validated' ? 'compliant' : 'non-compliant',
        actionRequired: result.validationStatus === 'not-validated',
      },
    })
  } catch (error: any) {
    console.error('Error getting FIPS status:', error)
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to get FIPS status' },
      { status: 500 }
    )
  }
}
