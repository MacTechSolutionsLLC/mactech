/**
 * Next.js API route for Data Center Deployment
 */

import { NextRequest, NextResponse } from 'next/server'
import { deploymentSchema } from './types'
import { deploymentService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput, safeValidateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('data-center-deployment-api')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(deploymentSchema, body)
    const deployment = await deploymentService.createDeployment(data)
    return NextResponse.json({ success: true, data: deployment }, { status: 201 })
  } catch (error) {
    logger.error('Error creating deployment', error as Error)
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
    logger.error('Error fetching deployments', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

