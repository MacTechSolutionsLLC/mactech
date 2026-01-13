import { NextRequest, NextResponse } from 'next/server'
import { auditReadinessService } from '@/platforms/quality-assurance/audit-readiness/service'
import { auditReadinessSchema } from '@/platforms/quality-assurance/audit-readiness/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(auditReadinessSchema, body)
    const readiness = await auditReadinessService.createAssessment(data)
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
      const readiness = await auditReadinessService.getAssessment(id)
      return NextResponse.json({ success: true, data: readiness })
    }

    const assessments = await auditReadinessService.listAssessments()
    return NextResponse.json({ success: true, data: assessments })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

