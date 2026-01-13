import { NextRequest, NextResponse } from 'next/server'
import { securityArchitectureService } from '@/platforms/cybersecurity-rmf/security-architecture/service'
import { securityBaselineSchema } from '@/platforms/cybersecurity-rmf/security-architecture/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { systemId } = body
      const review = await securityArchitectureService.reviewArchitecture(systemId)
      return NextResponse.json({ success: true, data: review })
    }

    const data = validateInput(securityBaselineSchema, body)
    const baseline = await securityArchitectureService.createBaseline(data)
    return NextResponse.json({ success: true, data: baseline }, { status: 201 })
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
      const baseline = await securityArchitectureService.getBaseline(id)
      return NextResponse.json({ success: true, data: baseline })
    }

    const baselines = await securityArchitectureService.listBaselines()
    return NextResponse.json({ success: true, data: baselines })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

