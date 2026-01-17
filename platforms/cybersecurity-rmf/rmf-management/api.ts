/**
 * Next.js API route for RMF Requirements Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { rmfRequirementSchema } from './types'
import { rmfManagementService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('rmf-management-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/boe')) {
      const { requirementId } = body
      const boePlan = await rmfManagementService.generateBOEPlan(requirementId)
      return NextResponse.json({ success: true, data: boePlan }, { status: 201 })
    }

    if (pathname.includes('/adjudicate')) {
      const { requirementId, status } = body
      const requirement = await rmfManagementService.adjudicateControl(requirementId, status)
      return NextResponse.json({ success: true, data: requirement })
    }

    // Create requirement
    const data = validateInput(rmfRequirementSchema, body)
    const requirement = await rmfManagementService.createRequirement(data)
    return NextResponse.json({ success: true, data: requirement }, { status: 201 })
  } catch (error) {
    logger.error('Error in RMF management API', error as Error)
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

    if (pathname.includes('/metrics')) {
      const systemId = searchParams.get('systemId')
      const metrics = await rmfManagementService.getMetrics(systemId || undefined)
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    const systemId = searchParams.get('systemId')

    if (id) {
      const requirement = await rmfManagementService.getRequirement(id)
      return NextResponse.json({ success: true, data: requirement })
    }

    const requirements = await rmfManagementService.listRequirements(systemId || undefined)
    return NextResponse.json({ success: true, data: requirements })
  } catch (error) {
    logger.error('Error in RMF management API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



