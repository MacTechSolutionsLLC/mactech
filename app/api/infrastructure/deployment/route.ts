import { NextRequest, NextResponse } from 'next/server'
import { deploymentService } from '@/platforms/infrastructure/data-center-deployment/service'
import { deploymentSchema } from '@/platforms/infrastructure/data-center-deployment/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = deploymentSchema.parse(body)
    const deployment = await deploymentService.createDeployment(data)
    return NextResponse.json({ success: true, data: deployment }, { status: 201 })
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
      const deployment = await deploymentService.getDeployment(id)
      return NextResponse.json({ success: true, data: deployment })
    }

    const deployments = await deploymentService.listDeployments()
    return NextResponse.json({ success: true, data: deployments })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

