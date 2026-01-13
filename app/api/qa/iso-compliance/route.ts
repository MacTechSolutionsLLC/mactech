import { NextRequest, NextResponse } from 'next/server'
import { isoComplianceService } from '@/platforms/quality-assurance/iso-compliance/service'
import { isoComplianceSchema } from '@/platforms/quality-assurance/iso-compliance/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

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

    const data = validateInput(isoComplianceSchema, body)
    const program = await isoComplianceService.createProgram(data)
    return NextResponse.json({ success: true, data: program }, { status: 201 })
  } catch (error) {
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
      const readiness = await isoComplianceService.getReadinessScore(programId)
      return NextResponse.json({ success: true, data: readiness })
    }

    const programs = await isoComplianceService.listPrograms()
    return NextResponse.json({ success: true, data: programs })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

