/**
 * Next.js API route for Audit Readiness
 */

import { NextRequest, NextResponse } from 'next/server'
import { auditReadinessSchema } from './types'
import { auditReadinessService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('audit-readiness-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/evidence-package')) {
      const { auditId } = body
      const package_ = await auditReadinessService.generateEvidencePackage(auditId)
      return NextResponse.json({ success: true, data: package_ }, { status: 201 })
    }

    if (pathname.includes('/response')) {
      const { auditId, question } = body
      const response = await auditReadinessService.generateResponse(auditId, question)
      return NextResponse.json({ success: true, data: response }, { status: 201 })
    }

    // Create audit readiness
    const data = validateInput(auditReadinessSchema, body)
    const audit = await auditReadinessService.createAuditReadiness(data)
    return NextResponse.json({ success: true, data: audit }, { status: 201 })
  } catch (error) {
    logger.error('Error in audit readiness API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await auditReadinessService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const audit = await auditReadinessService.getAuditReadiness(id)
      return NextResponse.json({ success: true, data: audit })
    }

    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
  } catch (error) {
    logger.error('Error in audit readiness API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


