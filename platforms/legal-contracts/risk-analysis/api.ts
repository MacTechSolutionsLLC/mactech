/**
 * Next.js API route for Contract Risk Analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import { riskAnalysisSchema } from './types'
import { riskAnalysisService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('risk-analysis-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/predict')) {
      const { contractId } = body
      const prediction = await riskAnalysisService.predictDispute(contractId)
      return NextResponse.json({ success: true, data: prediction })
    }

    if (pathname.includes('/liability')) {
      const { contractId } = body
      const assessment = await riskAnalysisService.assessLiability(contractId)
      return NextResponse.json({ success: true, data: assessment })
    }

    // Analyze risk
    const parsed = riskAnalysisSchema.parse(body) // parse() applies defaults
    const analysis = await riskAnalysisService.analyzeRisk(parsed)
    return NextResponse.json({ success: true, data: analysis }, { status: 201 })
  } catch (error) {
    logger.error('Error in risk analysis API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await riskAnalysisService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const analysis = await riskAnalysisService.getAnalysis(id)
      return NextResponse.json({ success: true, data: analysis })
    }

    return NextResponse.json({ success: false, error: 'id required' }, { status: 400 })
  } catch (error) {
    logger.error('Error in risk analysis API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

