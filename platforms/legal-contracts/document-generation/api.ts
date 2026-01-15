/**
 * Next.js API route for Legal Document Generation
 */

import { NextRequest, NextResponse } from 'next/server'
import { documentGenerationSchema } from './types'
import { legalDocumentGenerationService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('document-generation-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { documentId, reviewer } = body
      const review = await legalDocumentGenerationService.reviewDocument(documentId, reviewer)
      return NextResponse.json({ success: true, data: review }, { status: 201 })
    }

    if (pathname.includes('/compare')) {
      const { document1Id, document2Id } = body
      const comparison = await legalDocumentGenerationService.compareDocuments(document1Id, document2Id)
      return NextResponse.json({ success: true, data: comparison })
    }

    // Generate document
    const data = validateInput(documentGenerationSchema, body)
    const document = await legalDocumentGenerationService.generateDocument(data)
    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error) {
    logger.error('Error in document generation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await legalDocumentGenerationService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const document = await legalDocumentGenerationService.getDocument(id)
      return NextResponse.json({ success: true, data: document })
    }

    const documents = await legalDocumentGenerationService.listDocuments()
    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    logger.error('Error in document generation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


