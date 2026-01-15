import { z } from 'zod'

export const ticketSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  requester: z.string().email(),
  metadata: z.record(z.any()).optional(),
})

export type Ticket = z.infer<typeof ticketSchema> & {
  id: string
  status: 'open' | 'assigned' | 'in-progress' | 'resolved' | 'closed'
  assignedTo?: string
  assignedAt?: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
  slaDeadline?: string
  tags: string[]
  relatedTickets: string[]
}

export interface TicketRouting {
  ticketId: string
  suggestedEngineer?: string
  confidence: number
  reasoning: string[]
  estimatedResolutionTime?: string
}

export interface TicketSolution {
  ticketId: string
  solution: string
  confidence: number
  source: 'knowledge-base' | 'historical' | 'ai-generated'
  steps: Array<{ step: number; description: string }>
}

export interface TicketMetrics {
  total: number
  open: number
  inProgress: number
  resolved: number
  averageResolutionTime: number
  slaBreaches: number
  byCategory: Record<string, number>
  byPriority: Record<string, number>
}


