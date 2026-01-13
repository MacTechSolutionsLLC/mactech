import { NextRequest, NextResponse } from 'next/server'
import { evidenceCollectionService } from '@/platforms/compliance-security/evidence-collection/service'
import { evidenceCollectionSchema } from '@/platforms/compliance-security/evidence-collection/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/validate')) {
      const { evidenceId } = body
      const validation = await evidenceCollectionService.validateEvidence(evidenceId)
      return NextResponse.json({ success: true, data: validation })
    }

    if (pathname.includes('/package')) {
      const { systemId, auditType } = body
      const package_ = await evidenceCollectionService.generatePackage(systemId, auditType)
      return NextResponse.json({ success: true, data: package_ })
    }

    const data = validateInput(evidenceCollectionSchema, body)
    const evidence = await evidenceCollectionService.collectEvidence(data)
    return NextResponse.json({ success: true, data: evidence }, { status: 201 })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/packages')) {
      const packages = await evidenceCollectionService.listPackages()
      return NextResponse.json({ success: true, data: packages })
    }

    const id = searchParams.get('id')
    if (id) {
      const evidence = await evidenceCollectionService.getEvidence(id)
      return NextResponse.json({ success: true, data: evidence })
    }

    const evidence = await evidenceCollectionService.listEvidence()
    return NextResponse.json({ success: true, data: evidence })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

