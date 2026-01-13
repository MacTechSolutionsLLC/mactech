import { NextRequest, NextResponse } from 'next/server'
import { stigComplianceService } from '@/platforms/compliance-security/stig-compliance/service'
import { stigValidationSchema } from '@/platforms/compliance-security/stig-compliance/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/playbook')) {
      const { validationId } = body
      const playbook = await stigComplianceService.generateRemediationPlaybook(validationId)
      return NextResponse.json({ success: true, data: playbook })
    }

    const data = validateInput(stigValidationSchema, body)
    const validationData = {
      ...data,
      validateRemediation: data.validateRemediation ?? false,
    }
    const validation = await stigComplianceService.createValidation(validationData)
    // Optionally run validation immediately
    if (validationData.validateRemediation) {
      const result = await stigComplianceService.runValidation(validation.id)
      validation.results = result
      validation.status = 'completed'
    }
    return NextResponse.json({ success: true, data: validation }, { status: 201 })
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
      const validation = await stigComplianceService.getValidation(id)
      return NextResponse.json({ success: true, data: validation })
    }

    // No list method available, return empty array
    // In production, this would query a database
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

