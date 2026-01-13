import { NextRequest, NextResponse } from 'next/server'
import { securityDocumentationService } from '@/platforms/cybersecurity-rmf/security-documentation/service'
import { documentGenerationSchema } from '@/platforms/cybersecurity-rmf/security-documentation/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(documentGenerationSchema, body)
    const document = await securityDocumentationService.generateDocument(data)
    return NextResponse.json({ success: true, data: document }, { status: 201 })
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
      const document = await securityDocumentationService.getDocument(id)
      return NextResponse.json({ success: true, data: document })
    }

    const documents = await securityDocumentationService.listDocuments()
    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

