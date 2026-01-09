import { z } from 'zod'

export const rmfRequirementSchema = z.object({
  systemId: z.string().uuid(),
  controlId: z.string(),
  title: z.string(),
  description: z.string(),
  implementationStatus: z.enum(['not-started', 'in-progress', 'implemented', 'tested', 'authorized']),
  evidenceRequired: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type RMFRequirement = z.infer<typeof rmfRequirementSchema> & {
  id: string
  systemId: string
  createdAt: string
  updatedAt: string
  traceabilityId?: string
}

export interface BOEPlan {
  id: string
  systemId: string
  controlId: string
  evidenceType: string
  evidenceDescription: string
  collectionMethod: string
  responsibleParty: string
  dueDate: string
  status: 'pending' | 'collected' | 'validated' | 'approved'
  evidenceLocation?: string
}

export interface RMFTraceability {
  requirementId: string
  controlId: string
  systemComponent: string
  implementation: string
  evidence: string[]
  testResults: string[]
  status: 'complete' | 'partial' | 'missing'
}

export interface RMFMetrics {
  totalRequirements: number
  implemented: number
  inProgress: number
  notStarted: number
  authorized: number
  averageImplementationProgress: number
  byStatus: Record<string, number>
}

