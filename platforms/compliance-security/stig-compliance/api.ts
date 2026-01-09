/**
 * Next.js API route for STIG Compliance Validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { stigValidationSchema } from './types'
import { stigComplianceService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('stig-compliance-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { id } = body
      const result = await stigComplianceService.runValidation(id)
      return NextResponse.json({ success: true, data: result })
    }

    if (pathname.includes('/remediate')) {
      const { validationId } = body
      const playbook = await stigComplianceService.generateRemediationPlaybook(validationId)
      return NextResponse.json({ success: true, data: playbook })
    }

    // Create validation
    const data = validateInput(stigValidationSchema, body)
    const validation = await stigComplianceService.createValidation(data)
    return NextResponse.json({ success: true, data: validation }, { status: 201 })
  } catch (error) {
    logger.error('Error in STIG compliance API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await stigComplianceService.getComplianceMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const validation = await stigComplianceService.getValidation(id)
      return NextResponse.json({ success: true, data: validation })
    }

    return NextResponse.json({ success: false, error: 'id or metrics required' }, { status: 400 })
  } catch (error) {
    logger.error('Error in STIG compliance API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

