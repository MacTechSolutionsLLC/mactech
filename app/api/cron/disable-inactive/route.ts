import { NextRequest, NextResponse } from 'next/server'
import { disableInactiveAccounts } from '@/lib/inactivity-disable'

/**
 * POST /api/cron/disable-inactive
 * Scheduled cron job endpoint for inactivity account disablement
 * Authenticated via CRON_SECRET environment variable
 * 
 * This endpoint is designed to be called by Railway cron jobs or external cron services.
 * It does not require user authentication but uses a shared secret for security.
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret for authentication
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret) {
      console.error('CRON_SECRET environment variable not configured')
      return NextResponse.json(
        { error: 'Cron authentication not configured' },
        { status: 500 }
      )
    }

    // Check for Bearer token or X-Cron-Secret header
    const providedSecret = 
      authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7)
        : req.headers.get('x-cron-secret')

    if (!providedSecret || providedSecret !== cronSecret) {
      console.warn('Unauthorized cron job attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Execute inactivity disablement
    const result = await disableInactiveAccounts()

    return NextResponse.json({
      success: true,
      message: `Inactivity check completed. ${result.disabled} account(s) disabled, ${result.checked} account(s) checked.`,
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (error: any) {
    console.error('Error in cron job disabling inactive accounts:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to disable inactive accounts',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/disable-inactive
 * Health check endpoint for cron job monitoring
 */
export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/disable-inactive',
    method: 'POST',
    description: 'Cron endpoint for inactivity account disablement',
    authentication: 'Bearer token or X-Cron-Secret header required',
  })
}
