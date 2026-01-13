import { NextRequest, NextResponse } from 'next/server'
import { networkConfigurationService } from '@/platforms/infrastructure/network-config/service'
import { networkTopologySchema } from '@/platforms/infrastructure/network-config/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/firewall-rules')) {
      const { topologyId } = body
      const rules = await networkConfigurationService.generateFirewallRules(topologyId)
      return NextResponse.json({ success: true, data: rules })
    }

    if (pathname.includes('/validate')) {
      const { topologyId } = body
      const validation = await networkConfigurationService.validateCompliance(topologyId)
      return NextResponse.json({ success: true, data: validation })
    }

    const data = validateInput(networkTopologySchema, body)
    const topology = await networkConfigurationService.createTopology(data)
    return NextResponse.json({ success: true, data: topology }, { status: 201 })
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
      const topology = await networkConfigurationService.getTopology(id)
      return NextResponse.json({ success: true, data: topology })
    }

    const topologies = await networkConfigurationService.listTopologies()
    return NextResponse.json({ success: true, data: topologies })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

