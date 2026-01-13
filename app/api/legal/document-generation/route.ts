import { NextRequest, NextResponse } from 'next/server'
import { legalDocumentGenerationService } from '@/platforms/legal-contracts/document-generation/service'
import { documentGenerationSchema } from '@/platforms/legal-contracts/document-generation/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/review')) {
      const { documentId, reviewer } = body
      if (!documentId || !reviewer) {
        return NextResponse.json({ success: false, error: 'documentId and reviewer required' }, { status: 400 })
      }
      const review = await legalDocumentGenerationService.reviewDocument(documentId, reviewer)
      return NextResponse.json({ success: true, data: review })
    }

    const data = validateInput(documentGenerationSchema, body)
    const document = await legalDocumentGenerationService.generateDocument(data)
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
      const document = await legalDocumentGenerationService.getDocument(id)
      return NextResponse.json({ success: true, data: document })
    }

    const documents = await legalDocumentGenerationService.listDocuments()
    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

