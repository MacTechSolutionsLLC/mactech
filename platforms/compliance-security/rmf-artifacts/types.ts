import { z } from 'zod'

export const rmfArtifactSchema = z.object({
  artifactType: z.enum(['ssp', 'rar', 'poam', 'conmon']),
  systemId: z.string().uuid(),
  systemName: z.string(),
  metadata: z.record(z.any()).optional(),
})

export type RMFArtifact = z.infer<typeof rmfArtifactSchema> & {
  id: string
  status: 'draft' | 'review' | 'approved' | 'delivered'
  content: string
  qualityScore?: number
  createdAt: string
  updatedAt: string
  approvedAt?: string
  deliveredAt?: string
}

export interface ArtifactValidationResult {
  valid: boolean
  errors: Array<{ section: string; message: string }>
  warnings: Array<{ section: string; message: string }>
  qualityScore: number
  completenessScore: number
  recommendations: string[]
}

export interface RMFArtifactMetrics {
  total: number
  draft: number
  approved: number
  delivered: number
  averageQualityScore: number
  byType: Record<string, number>
}



