import { z } from 'zod'

export const securityBaselineSchema = z.object({
  name: z.string().min(1).max(255),
  systemType: z.string(),
  controls: z.array(z.object({
    controlId: z.string(),
    title: z.string(),
    implementation: z.string(),
  })),
  metadata: z.record(z.any()).optional(),
})

export type SecurityBaseline = z.infer<typeof securityBaselineSchema> & {
  id: string
  status: 'draft' | 'active' | 'archived'
  createdAt: string
  updatedAt: string
  approvedBy?: string
  approvedAt?: string
}

export interface ArchitectureReview {
  id: string
  systemId: string
  reviewDate: string
  reviewer: string
  findings: Array<{
    finding: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    recommendation: string
  }>
  status: 'pending' | 'in-review' | 'approved' | 'requires-changes'
  approvedAt?: string
}

export interface SecurityArchitectureMetrics {
  totalBaselines: number
  active: number
  underReview: number
  averageControlsPerBaseline: number
  bySystemType: Record<string, number>
}


