/**
 * Next.js API route for RMF Artifacts
 */

import { NextRequest, NextResponse } from 'next/server'
import { rmfArtifactSchema } from './types'
import { rmfArtifactService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('rmf-artifacts-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { id } = body
      const validation = await rmfArtifactService.validateArtifact(id)
      return NextResponse.json({ success: true, data: validation })
    }

    // Generate artifact
    const data = validateInput(rmfArtifactSchema, body)
    const artifact = await rmfArtifactService.generateArtifact(data)
    return NextResponse.json({ success: true, data: artifact }, { status: 201 })
  } catch (error) {
    logger.error('Error in RMF artifacts API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await rmfArtifactService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    const systemId = searchParams.get('systemId')

    if (id) {
      const artifact = await rmfArtifactService.getArtifact(id)
      return NextResponse.json({ success: true, data: artifact })
    }

    const artifacts = await rmfArtifactService.listArtifacts(systemId || undefined)
    return NextResponse.json({ success: true, data: artifacts })
  } catch (error) {
    logger.error('Error in RMF artifacts API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


