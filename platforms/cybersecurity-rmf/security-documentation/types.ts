import { z } from 'zod'

export const documentGenerationSchema = z.object({
  documentType: z.enum(['cdrl', 'non-cdrl', 'work-instruction', 'integration-plan', 'boe']),
  title: z.string().min(1).max(500),
  systemId: z.string().uuid().optional(),
  template: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type SecurityDocument = z.infer<typeof documentGenerationSchema> & {
  id: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'delivered'
  format: 'word' | 'pdf' | 'html'
  content: string
  systemName?: string
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
  deliveredAt?: string
}

export interface WorkInstruction {
  id: string
  process: string
  title: string
  steps: Array<{ step: number; description: string; responsible: string }>
  version: string
  status: 'draft' | 'active' | 'archived'
}

export interface DocumentMetrics {
  total: number
  draft: number
  approved: number
  delivered: number
  byType: Record<string, number>
  averageReviewTime: number
}

