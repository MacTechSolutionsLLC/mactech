/**
 * Next.js API route for Ticket Routing & Resolution
 */

import { NextRequest, NextResponse } from 'next/server'
import { ticketSchema } from './types'
import { ticketRoutingService } from './service'
import { handleError } from '../../shared/errors'
import { validateInput } from '../../shared/validation'
import { createLogger } from '../../shared/logger'

const logger = createLogger('ticket-routing-api')

export async function POST(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url)
    const body = await request.json()

    if (pathname.includes('/route')) {
      const { ticketId } = body
      const routing = await ticketRoutingService.routeTicket(ticketId)
      return NextResponse.json({ success: true, data: routing })
    }

    if (pathname.includes('/resolve')) {
      const { ticketId, resolution } = body
      const ticket = await ticketRoutingService.resolveTicket(ticketId, resolution)
      return NextResponse.json({ success: true, data: ticket })
    }

    // Create ticket
    const parsed = ticketSchema.parse(body) // parse() applies defaults
    const ticket = await ticketRoutingService.createTicket(parsed)
    return NextResponse.json({ success: true, data: ticket }, { status: 201 })
  } catch (error) {
    logger.error('Error in ticket routing API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { pathname, searchParams } = new URL(request.url)

    if (pathname.includes('/metrics')) {
      const metrics = await ticketRoutingService.getMetrics()
      return NextResponse.json({ success: true, data: metrics })
    }

    if (pathname.includes('/solutions')) {
      const ticketId = searchParams.get('ticketId')
      if (!ticketId) {
        return NextResponse.json({ success: false, error: 'ticketId required' }, { status: 400 })
      }
      const solutions = await ticketRoutingService.getSolutions(ticketId)
      return NextResponse.json({ success: true, data: solutions })
    }

    const id = searchParams.get('id')
    if (id) {
      const ticket = await ticketRoutingService.getTicket(id)
      return NextResponse.json({ success: true, data: ticket })
    }

    const tickets = await ticketRoutingService.listTickets()
    return NextResponse.json({ success: true, data: tickets })
  } catch (error) {
    logger.error('Error in ticket routing API', error as Error)
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

