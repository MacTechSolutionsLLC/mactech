import { NextRequest, NextResponse } from 'next/server'
import { riskAnalysisService } from '@/platforms/legal-contracts/risk-analysis/service'
import { riskAnalysisSchema } from '@/platforms/legal-contracts/risk-analysis/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateInput(riskAnalysisSchema, body)
    // Ensure analysisType has a default value
    const data = {
      ...validated,
      analysisType: validated.analysisType || 'full',
    }
    const analysis = await riskAnalysisService.analyzeRisk(data)
    return NextResponse.json({ success: true, data: analysis }, { status: 201 })
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
      const analysis = await riskAnalysisService.getAnalysis(id)
      return NextResponse.json({ success: true, data: analysis })
    }

    // No list method available, return empty array
    // In production, this would query a database
    return NextResponse.json({ success: true, data: [] })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

