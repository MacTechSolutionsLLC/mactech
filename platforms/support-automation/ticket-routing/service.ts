import { Ticket, TicketRouting, TicketSolution, TicketMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('ticket-routing')

export class TicketRoutingService {
  private tickets: Map<string, Ticket> = new Map()
  private knowledgeBase: Map<string, string> = new Map()

  async createTicket(data: Omit<Ticket, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'tags' | 'relatedTickets'>): Promise<Ticket> {
    logger.info('Creating new ticket', { title: data.title })

    const ticket: Ticket = {
      ...data,
      id: crypto.randomUUID(),
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      relatedTickets: [],
    }

    this.tickets.set(ticket.id, ticket)
    return ticket
  }

  async getTicket(id: string): Promise<Ticket> {
    const ticket = this.tickets.get(id)
    if (!ticket) {
      throw new NotFoundError('Ticket', id)
    }
    return ticket
  }

  async listTickets(): Promise<Ticket[]> {
    return Array.from(this.tickets.values())
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
    ticket.status = 'assigned'
    ticket.assignedTo = suggestedEngineer
    ticket.assignedAt = new Date().toISOString()
    ticket.updatedAt = new Date().toISOString()
    this.tickets.set(ticketId, ticket)

    return {
      ticketId,
      suggestedEngineer,
      confidence,
      reasoning,
      estimatedResolutionTime: this.estimateResolutionTime(ticket),
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
    
    ticket.status = 'resolved'
    ticket.resolvedAt = new Date().toISOString()
    ticket.updatedAt = new Date().toISOString()
    this.tickets.set(ticketId, ticket)

    // Add to knowledge base
    this.knowledgeBase.set(ticketId, resolution)
    
    logger.info('Ticket resolved', { ticketId })
    return ticket
  }

  async getMetrics(): Promise<TicketMetrics> {
    const allTickets = Array.from(this.tickets.values())
    
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

