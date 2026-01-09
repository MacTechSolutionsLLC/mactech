/**
 * Next.js API route for Evidence Collection
 */

import { NextRequest, NextResponse } from 'next/server'
import { evidenceCollectionSchema } from './types'
import { evidenceCollectionService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('evidence-collection-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { id, validatedBy } = body
      const evidence = await evidenceCollectionService.validateEvidence(id, validatedBy)
      return NextResponse.json({ success: true, data: evidence })
    }

    if (pathname.includes('/gaps')) {
      const { systemId, requiredControls } = body
      const gaps = await evidenceCollectionService.identifyGaps(systemId, requiredControls)
      return NextResponse.json({ success: true, data: gaps })
    }

    if (pathname.includes('/package')) {
      const { systemId, auditType } = body
      const package_ = await evidenceCollectionService.generatePackage(systemId, auditType)
      return NextResponse.json({ success: true, data: package_ }, { status: 201 })
    }

    // Collect evidence
    const data = validateInput(evidenceCollectionSchema, body)
    const evidence = await evidenceCollectionService.collectEvidence(data)
    return NextResponse.json({ success: true, data: evidence }, { status: 201 })
  } catch (error) {
    logger.error('Error in evidence collection API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const systemId = searchParams.get('systemId')
      const metrics = await evidenceCollectionService.getMetrics(systemId || undefined)
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    const systemId = searchParams.get('systemId')

    if (id) {
      const evidence = await evidenceCollectionService.getEvidence(id)
      return NextResponse.json({ success: true, data: evidence })
    }

    const evidence = await evidenceCollectionService.listEvidence(systemId || undefined)
    return NextResponse.json({ success: true, data: evidence })
  } catch (error) {
    logger.error('Error in evidence collection API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

