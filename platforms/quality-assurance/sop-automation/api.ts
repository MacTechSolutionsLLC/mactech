/**
 * Next.js API route for SOP Automation
 */

import { NextRequest, NextResponse } from 'next/server'
import { sopGenerationSchema } from './types'
import { sopAutomationService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('sop-automation-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { id } = body
      const validation = await sopAutomationService.validateSOP(id)
      return NextResponse.json({ success: true, data: validation })
    }

    if (pathname.includes('/approve')) {
      const { id, approvedBy } = body
      const sop = await sopAutomationService.approveSOP(id, approvedBy)
      return NextResponse.json({ success: true, data: sop })
    }

    // Generate SOP
    const data = validateInput(sopGenerationSchema, body)
    const sop = await sopAutomationService.generateSOP(data)
    return NextResponse.json({ success: true, data: sop }, { status: 201 })
  } catch (error) {
    logger.error('Error in SOP automation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await sopAutomationService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const sop = await sopAutomationService.getSOP(id)
      return NextResponse.json({ success: true, data: sop })
    }

    const sops = await sopAutomationService.listSOPs()
    return NextResponse.json({ success: true, data: sops })
  } catch (error) {
    logger.error('Error in SOP automation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



