import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authz'
import { disableInactiveAccounts } from '@/lib/inactivity-disable'

/**
 * POST /api/admin/users/disable-inactive
 * Manually trigger inactivity account disablement check
 * Requires ADMIN role
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin()

    const result = await disableInactiveAccounts()

    return NextResponse.json({
      success: true,
      message: `Inactivity check completed. ${result.disabled} account(s) disabled, ${result.checked} account(s) checked.`,
      ...result,
    })
  } catch (error: any) {
    console.error('Error disabling inactive accounts:', error)
    
    if (error.status === 401) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to disable inactive accounts' },
      { status: 500 }
    )
  }
}
