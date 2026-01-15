/**
 * Next.js API route for Security Architecture
 */

import { NextRequest, NextResponse } from 'next/server'
import { securityBaselineSchema } from './types'
import { securityArchitectureService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('security-architecture-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { systemId, reviewer } = body
      const review = await securityArchitectureService.reviewArchitecture(systemId, reviewer)
      return NextResponse.json({ success: true, data: review }, { status: 201 })
    }

    if (pathname.includes('/validate')) {
      const { id } = body
      const validation = await securityArchitectureService.validateBaseline(id)
      return NextResponse.json({ success: true, data: validation })
    }

    // Create baseline
    const data = validateInput(securityBaselineSchema, body)
    const baseline = await securityArchitectureService.createBaseline(data)
    return NextResponse.json({ success: true, data: baseline }, { status: 201 })
  } catch (error) {
    logger.error('Error in security architecture API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await securityArchitectureService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const baseline = await securityArchitectureService.getBaseline(id)
      return NextResponse.json({ success: true, data: baseline })
    }

    const baselines = await securityArchitectureService.listBaselines()
    return NextResponse.json({ success: true, data: baselines })
  } catch (error) {
    logger.error('Error in security architecture API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


