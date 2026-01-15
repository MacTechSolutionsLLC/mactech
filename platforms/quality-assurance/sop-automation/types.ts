import { z } from 'zod'

export const sopGenerationSchema = z.object({
  title: z.string().min(1).max(255),
  requirement: z.string().min(1),
  standard: z.enum(['iso17025', 'iso9001', 'custom']).optional(),
  scope: z.string().optional(),
  responsibilities: z.array(z.string()).optional(),
  procedure: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type SOP = z.infer<typeof sopGenerationSchema> & {
  id: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'archived'
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  content: string
  format: 'word' | 'pdf' | 'html'
}

export interface SOPValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
  warnings: Array<{ field: string; message: string }>
  complianceChecks: Array<{ requirement: string; status: 'pass' | 'fail' | 'warning' }>
  suggestions: string[]
}

export interface SOPMetrics {
  total: number
  draft: number
  approved: number
  inReview: number
  averageReviewTime: number
  byStandard: Record<string, number>
}


