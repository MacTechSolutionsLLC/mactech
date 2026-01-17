/**
 * Next.js API route for Security Documentation
 */

import { NextRequest, NextResponse } from 'next/server'
import { documentGenerationSchema } from './types'
import { securityDocumentationService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('security-documentation-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/work-instructions')) {
      const { process, title } = body
      const instruction = await securityDocumentationService.generateWorkInstruction(process, title)
      return NextResponse.json({ success: true, data: instruction }, { status: 201 })
    }

    if (pathname.includes('/approve')) {
      const { id, approvedBy } = body
      const document = await securityDocumentationService.approveDocument(id, approvedBy)
      return NextResponse.json({ success: true, data: document })
    }

    // Generate document
    const data = validateInput(documentGenerationSchema, body)
    const document = await securityDocumentationService.generateDocument(data)
    return NextResponse.json({ success: true, data: document }, { status: 201 })
  } catch (error) {
    logger.error('Error in security documentation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await securityDocumentationService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const document = await securityDocumentationService.getDocument(id)
      return NextResponse.json({ success: true, data: document })
    }

    const documents = await securityDocumentationService.listDocuments()
    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    logger.error('Error in security documentation API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}



