/**
 * Next.js API route for Network Configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { networkTopologySchema } from './types'
import { networkConfigurationService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('network-config-api')

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

    // Create topology
    const data = validateInput(networkTopologySchema, body)
    const topology = await networkConfigurationService.createTopology(data)
    return NextResponse.json({ success: true, data: topology }, { status: 201 })
  } catch (error) {
    logger.error('Error in network config API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await networkConfigurationService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    const id = searchParams.get('id')
    if (id) {
      const topology = await networkConfigurationService.getTopology(id)
      return NextResponse.json({ success: true, data: topology })
    }

    const topologies = await networkConfigurationService.listTopologies()
    return NextResponse.json({ success: true, data: topologies })
  } catch (error) {
    logger.error('Error in network config API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}


