import { NextRequest, NextResponse } from 'next/server'
import { documentGenerationService } from '@/platforms/legal-contracts/document-generation/service'
import { documentGenerationSchema } from '@/platforms/legal-contracts/document-generation/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { documentId } = body
      const review = await documentGenerationService.reviewDocument(documentId)
      return NextResponse.json({ success: true, data: review })
    }

    const data = validateInput(documentGenerationSchema, body)
    const document = await documentGenerationService.generateDocument(data)
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
      const document = await documentGenerationService.getDocument(id)
      return NextResponse.json({ success: true, data: document })
    }

    const documents = await documentGenerationService.listDocuments()
    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

