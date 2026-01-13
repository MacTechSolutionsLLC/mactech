import { NextRequest, NextResponse } from 'next/server'
import { riskAnalysisService } from '@/platforms/legal-contracts/risk-analysis/service'
import { riskAnalysisSchema } from '@/platforms/legal-contracts/risk-analysis/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(riskAnalysisSchema, body)
    const analysis = await riskAnalysisService.analyzeContract(data)
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

    const analyses = await riskAnalysisService.listAnalyses()
    return NextResponse.json({ success: true, data: analyses })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

