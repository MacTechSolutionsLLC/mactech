/**
 * Next.js API route for ISO Compliance
 */

import { NextRequest, NextResponse } from 'next/server'
import { isoComplianceSchema } from './types'
import { isoComplianceService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('iso-compliance-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/gaps')) {
      const { programId } = body
      const gaps = await isoComplianceService.identifyGaps(programId)
      return NextResponse.json({ success: true, data: gaps })
    }

    if (pathname.includes('/sops')) {
      const { programId, requirement } = body
      const sop = await isoComplianceService.generateSOP(programId, requirement)
      return NextResponse.json({ success: true, data: { sop } })
    }

    // Create program
    const data = validateInput(isoComplianceSchema, body)
    const program = await isoComplianceService.createProgram(data)
    return NextResponse.json({ success: true, data: program }, { status: 201 })
  } catch (error) {
    logger.error('Error in ISO compliance API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/readiness')) {
      const programId = searchParams.get('programId')
      if (!programId) {
        return NextResponse.json({ success: false, error: 'programId required' }, { status: 400 })
      }
      const readiness = await isoComplianceService.getAuditReadiness(programId)
      return NextResponse.json({ success: true, data: readiness })
    }

    if (pathname.includes('/metrics')) {
      const metrics = await isoComplianceService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const program = await isoComplianceService.getProgram(id)
      return NextResponse.json({ success: true, data: program })
    }

    const programs = await isoComplianceService.listPrograms()
    return NextResponse.json({ success: true, data: programs })
  } catch (error) {
    logger.error('Error in ISO compliance API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



