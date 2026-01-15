/**
 * Next.js API route for Contract Management
 */

import { NextRequest, NextResponse } from 'next/server'
import { contractSchema } from './types'
import { contractManagementService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('contract-management-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/analyze')) {
      const { contractId } = body
      const analysis = await contractManagementService.analyzeRisk(contractId)
      return NextResponse.json({ success: true, data: analysis })
    }

    if (pathname.includes('/obligations')) {
      const { contractId, ...obligation } = body
      const newObligation = await contractManagementService.addObligation(contractId, obligation)
      return NextResponse.json({ success: true, data: newObligation }, { status: 201 })
    }

    // Create contract
    const data = validateInput(contractSchema, body)
    const contract = await contractManagementService.createContract(data)
    return NextResponse.json({ success: true, data: contract }, { status: 201 })
  } catch (error) {
    logger.error('Error in contract management API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await contractManagementService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    if (pathname.includes('/obligations')) {
      const contractId = searchParams.get('contractId')
      if (!contractId) {
        return NextResponse.json({ success: false, error: 'contractId required' }, { status: 400 })
      }
      const obligations = await contractManagementService.getObligations(contractId)
      return NextResponse.json({ success: true, data: obligations })
    }

    const id = searchParams.get('id')
    if (id) {
      const contract = await contractManagementService.getContract(id)
      return NextResponse.json({ success: true, data: contract })
    }

    const contracts = await contractManagementService.listContracts()
    return NextResponse.json({ success: true, data: contracts })
  } catch (error) {
    logger.error('Error in contract management API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


