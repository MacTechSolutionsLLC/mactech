import { NextRequest, NextResponse } from 'next/server'
import { getNISTControlText } from '@/lib/compliance/nist-sp-800-171-parser'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ controlId: string }> }
) {
  try {
    const { controlId } = await context.params

    if (!controlId || !controlId.match(/^3\.\d+\.\d+$/)) {
      return NextResponse.json(
        { error: 'Invalid control ID format' },
        { status: 400 }
      )
    }

    const nistData = await getNISTControlText(controlId)

    if (!nistData) {
      return NextResponse.json(
        { error: 'Control not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      controlId: nistData.controlId,
      requirement: nistData.requirement,
      discussion: nistData.discussion,
    })
  } catch (error) {
    console.error('Error fetching NIST text:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
