import { NextRequest, NextResponse } from 'next/server'
import { ticketRoutingService } from '@/platforms/support-automation/ticket-routing/service'
import { ticketSchema } from '@/platforms/support-automation/ticket-routing/types'
import { handleError } from '@/platforms/shared/errors'
import { validateInput } from '@/platforms/shared/validation'

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

    const parsed = ticketSchema.parse(body)
    const ticket = await ticketRoutingService.createTicket(parsed)
    return NextResponse.json({ success: true, data: ticket }, { status: 201 })
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
      const ticket = await ticketRoutingService.getTicket(id)
      return NextResponse.json({ success: true, data: ticket })
    }

    const tickets = await ticketRoutingService.listTickets()
    return NextResponse.json({ success: true, data: tickets })
  } catch (error) {
    const { statusCode, message } = handleError(error)
    return NextResponse.json({ success: false, error: message }, { status: statusCode })
  }
}

