import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/authz'
import { auditAllControls, generateAuditSummary } from '@/lib/compliance/control-audit'

export async function GET() {
  try {
    await requireAdmin()
    
    const results = await auditAllControls()
    const summary = generateAuditSummary(results)
    
    return NextResponse.json({
      success: true,
      summary,
      results,
      generatedAt: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Error running compliance audit:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to run compliance audit'
      },
      { status: error.status || 500 }
    )
  }
}
