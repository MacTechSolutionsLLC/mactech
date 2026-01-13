import { NextRequest, NextResponse } from 'next/server'
import { auditReadinessService } from '@/platforms/quality-assurance/audit-readiness/service'
import { auditReadinessSchema } from '@/platforms/quality-assurance/audit-readiness/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(auditReadinessSchema, body)
    const readiness = await auditReadinessService.createAuditReadiness(data)
    return NextResponse.json({ success: true, data: readiness }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const readiness = await auditReadinessService.getAuditReadiness(id)
      return NextResponse.json({ success: true, data: readiness })
    }

    // No list method available, return empty array
    // In production, this would query a database
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

