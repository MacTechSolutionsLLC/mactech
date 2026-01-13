import { NextRequest, NextResponse } from 'next/server'
import { sopAutomationService } from '@/platforms/quality-assurance/sop-automation/service'
import { sopGenerationSchema } from '@/platforms/quality-assurance/sop-automation/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(sopGenerationSchema, body)
    const sop = await sopAutomationService.generateSOP(data)
    return NextResponse.json({ success: true, data: sop }, { status: 201 })
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
      const sop = await sopAutomationService.getSOP(id)
      return NextResponse.json({ success: true, data: sop })
    }

    const sops = await sopAutomationService.listSOPs()
    return NextResponse.json({ success: true, data: sops })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

