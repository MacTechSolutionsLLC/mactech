import { NextRequest, NextResponse } from 'next/server'
import { rmfManagementService } from '@/platforms/cybersecurity-rmf/rmf-management/service'
import { rmfRequirementSchema } from '@/platforms/cybersecurity-rmf/rmf-management/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/boe')) {
      const { requirementId } = body
      const boe = await rmfManagementService.generateBOEPlan(requirementId)
      return NextResponse.json({ success: true, data: boe })
    }

    if (pathname.includes('/adjudicate')) {
      const { requirementId, decision } = body
      const requirement = await rmfManagementService.adjudicateControl(requirementId, decision)
      return NextResponse.json({ success: true, data: requirement })
    }

    const data = validateInput(rmfRequirementSchema, body)
    const requirement = await rmfManagementService.createRequirement(data)
    return NextResponse.json({ success: true, data: requirement }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/traceability')) {
      const systemId = searchParams.get('systemId')
      if (!systemId) {
        return NextResponse.json({ success: false, error: 'systemId required' }, { status: 400 })
      }
      const traceability = await rmfManagementService.getTraceability(systemId)
      return NextResponse.json({ success: true, data: traceability })
    }

    const requirements = await rmfManagementService.listRequirements()
    return NextResponse.json({ success: true, data: requirements })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

