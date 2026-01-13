import { NextRequest, NextResponse } from 'next/server'
import { rmfArtifactService } from '@/platforms/compliance-security/rmf-artifacts/service'
import { rmfArtifactSchema } from '@/platforms/compliance-security/rmf-artifacts/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { id } = body
      const validation = await rmfArtifactService.validateArtifact(id)
      return NextResponse.json({ success: true, data: validation })
    }

    const data = validateInput(rmfArtifactSchema, body)
    const artifact = await rmfArtifactService.generateArtifact(data)
    return NextResponse.json({ success: true, data: artifact }, { status: 201 })
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
      const artifact = await rmfArtifactService.getArtifact(id)
      return NextResponse.json({ success: true, data: artifact })
    }

    const artifacts = await rmfArtifactService.listArtifacts()
    return NextResponse.json({ success: true, data: artifacts })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

