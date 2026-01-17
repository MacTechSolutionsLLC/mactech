import { z } from 'zod'

export const documentGenerationSchema = z.object({
  documentType: z.enum(['nda', 'msa', 'sow', 'license', 'vendor-agreement', 'corporate-governance']),
  title: z.string().min(1).max(500),
  parties: z.array(z.object({
    name: z.string(),
    role: z.string(),
  })).min(2),
  terms: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
})

export type LegalDocument = z.infer<typeof documentGenerationSchema> & {
  id: string
  version: string
  status: 'draft' | 'review' | 'approved' | 'signed'
  content: string
  format: 'word' | 'pdf' | 'html'
  createdAt: string
  updatedAt: string
  approvedAt?: string
  signedAt?: string
}

export interface DocumentReview {
  id: string
  documentId: string
  reviewer: string
  reviewDate: string
  risks: Array<{
    risk: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    recommendation: string
  }>
  status: 'pending' | 'completed'
}

export interface DocumentComparison {
  document1Id: string
  document2Id: string
  differences: Array<{
    section: string
    change: 'added' | 'removed' | 'modified'
    description: string
  }>
  similarity: number
}

export interface LegalDocumentMetrics {
  total: number
  draft: number
  approved: number
  signed: number
  byType: Record<string, number>
  averageReviewTime: number
}



