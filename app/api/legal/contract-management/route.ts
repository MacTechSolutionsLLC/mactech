import { NextRequest, NextResponse } from 'next/server'
import { contractManagementService } from '@/platforms/legal-contracts/contract-management/service'
import { contractSchema } from '@/platforms/legal-contracts/contract-management/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = validateInput(contractSchema, body)
    const contract = await contractManagementService.createContract(data)
    return NextResponse.json({ success: true, data: contract }, { status: 201 })
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
      const contract = await contractManagementService.getContract(id)
      return NextResponse.json({ success: true, data: contract })
    }

    const contracts = await contractManagementService.listContracts()
    return NextResponse.json({ success: true, data: contracts })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

