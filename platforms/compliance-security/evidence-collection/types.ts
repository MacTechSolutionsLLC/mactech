import { z } from 'zod'

export const evidenceCollectionSchema = z.object({
  controlId: z.string(),
  systemId: z.string().uuid(),
  evidenceType: z.enum(['configuration', 'log', 'documentation', 'screenshot', 'test-result']),
  description: z.string(),
  metadata: z.record(z.any()).optional(),
})

export type Evidence = z.infer<typeof evidenceCollectionSchema> & {
  id: string
  status: 'pending' | 'collected' | 'validated' | 'rejected'
  qualityScore?: number
  collectedAt?: string
  validatedAt?: string
  validatedBy?: string
  location?: string
  createdAt: string
  updatedAt: string
}

export interface EvidencePackage {
  id: string
  systemId: string
  auditType: string
  evidence: Evidence[]
  status: 'draft' | 'complete' | 'delivered'
  createdAt: string
  completedAt?: string
}

export interface EvidenceGap {
  controlId: string
  controlTitle: string
  requiredEvidence: string
  currentStatus: 'missing' | 'partial' | 'low-quality'
  priority: 'low' | 'medium' | 'high' | 'critical'
}

export interface EvidenceMetrics {
  totalEvidence: number
  validated: number
  pending: number
  rejected: number
  averageQualityScore: number
  gaps: number
  byType: Record<string, number>
}


