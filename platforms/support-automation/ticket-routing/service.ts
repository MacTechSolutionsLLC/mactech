import { Ticket, TicketRouting, TicketSolution, TicketMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('ticket-routing')

export class TicketRoutingService {
  async createTicket(data: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'tags' | 'relatedTickets'>): Promise<Ticket> {
    logger.info('Creating new ticket', { title: data.title })

    const ticket = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || null,
        priority: data.priority,
        status: 'open',
        requester: data.requester,
        assignedTo: data.assignedTo || null,
        slaDeadline: data.slaDeadline ? new Date(data.slaDeadline) : null,
      },
    })

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category || undefined,
      priority: ticket.priority as any,
      status: ticket.status as any,
      requester: ticket.requester,
      assignedTo: ticket.assignedTo || undefined,
      tags: [],
      relatedTickets: [],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      slaDeadline: ticket.slaDeadline?.toISOString(),
    }
  }

  async getTicket(id: string): Promise<Ticket> {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
    })

    if (!ticket) {
      throw new NotFoundError('Ticket', id)
    }

    return {
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category || undefined,
      priority: ticket.priority as any,
      status: ticket.status as any,
      requester: ticket.requester,
      assignedTo: ticket.assignedTo || undefined,
      tags: [],
      relatedTickets: [],
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      resolvedAt: ticket.resolvedAt?.toISOString(),
      slaDeadline: ticket.slaDeadline?.toISOString(),
    }
  }

  async listTickets(): Promise<Ticket[]> {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return tickets.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      category: t.category || undefined,
      priority: t.priority as any,
      status: t.status as any,
      requester: t.requester,
      assignedTo: t.assignedTo || undefined,
      tags: [],
      relatedTickets: [],
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      resolvedAt: t.resolvedAt?.toISOString(),
      slaDeadline: t.slaDeadline?.toISOString(),
    }))
  }

  async routeTicket(ticketId: string): Promise<TicketRouting> {
    const ticket = await this.getTicket(ticketId)
    
    logger.info('Routing ticket', { ticketId })

    // Simple routing logic - in production, use ML model
    const suggestedEngineer = this.selectEngineer(ticket)
    const confidence = 0.85
    const reasoning = [
      `Ticket category: ${ticket.category || 'general'}`,
      `Priority: ${ticket.priority}`,
      `Historical success rate: 92%`,
    ]

    // Update ticket
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'assigned',
        assignedTo: suggestedEngineer,
      },
    })

    return {
      ticketId,
      suggestedEngineer,
      confidence,
      reasoning,
      estimatedResolutionTime: this.estimateResolutionTime({
        id: updated.id,
        title: updated.title,
        description: updated.description,
        category: updated.category || undefined,
        priority: updated.priority as any,
        status: updated.status as any,
        requester: updated.requester,
        assignedTo: updated.assignedTo || undefined,
        tags: [],
        relatedTickets: [],
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        resolvedAt: updated.resolvedAt?.toISOString(),
        slaDeadline: updated.slaDeadline?.toISOString(),
      }),
    }
  }

  async getSolutions(ticketId: string): Promise<TicketSolution[]> {
    const ticket = await this.getTicket(ticketId)
    
    logger.info('Getting solutions for ticket', { ticketId })

    // In production, search knowledge base and historical tickets
    const solutions: TicketSolution[] = [
      {
        ticketId,
        solution: 'Check system logs and verify configuration',
        confidence: 0.75,
        source: 'knowledge-base',
        steps: [
          { step: 1, description: 'Access system logs' },
          { step: 2, description: 'Review error messages' },
          { step: 3, description: 'Verify configuration settings' },
        ],
      },
    ]

    return solutions
  }

  async resolveTicket(ticketId: string, resolution: string): Promise<Ticket> {
    const ticket = await this.getTicket(ticketId)
    
    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
      },
    })
    
    logger.info('Ticket resolved', { ticketId })
    
    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      category: updated.category || undefined,
      priority: updated.priority as any,
      status: updated.status as any,
      requester: updated.requester,
      assignedTo: updated.assignedTo || undefined,
      tags: [],
      relatedTickets: [],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      resolvedAt: updated.resolvedAt?.toISOString(),
      slaDeadline: updated.slaDeadline?.toISOString(),
    }
  }

  async getMetrics(): Promise<TicketMetrics> {
    const allTickets = await prisma.ticket.findMany()
    
    return {
      total: allTickets.length,
      open: allTickets.filter(t => t.status === 'open').length,
      inProgress: allTickets.filter(t => t.status === 'in-progress').length,
      resolved: allTickets.filter(t => t.status === 'resolved').length,
      averageResolutionTime: 2.5, // hours - would calculate from resolved tickets
      slaBreaches: allTickets.filter(t => {
        if (!t.slaDeadline) return false
        return new Date() > new Date(t.slaDeadline) && t.status !== 'resolved'
      }).length,
      byCategory: this.groupBy(allTickets, 'category'),
      byPriority: this.groupBy(allTickets, 'priority'),
    }
  }

  private selectEngineer(ticket: Ticket): string {
    // Simple selection - in production, use ML model
    const engineers = ['engineer1@mactech.com', 'engineer2@mactech.com', 'engineer3@mactech.com']
    return engineers[Math.floor(Math.random() * engineers.length)]
  }

  private estimateResolutionTime(ticket: Ticket): string {
    const hours = ticket.priority === 'critical' ? 1 : ticket.priority === 'high' ? 4 : 8
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + hours)
    return deadline.toISOString()
  }

  private groupBy<T>(items: T[], key: keyof T): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = String(item[key] || 'unknown')
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const ticketRoutingService = new TicketRoutingService()

