import { z } from 'zod'

export const auditReadinessSchema = z.object({
  systemId: z.string().uuid(),
  auditType: z.enum(['dla', 'iso', 'fda', 'custom']),
  auditDate: z.string().datetime().optional(),
  metadata: z.record(z.any()).optional(),
})

export type AuditReadiness = z.infer<typeof auditReadinessSchema> & {
  id: string
  readinessScore: number
  readinessLevel: 'ready' | 'mostly-ready' | 'needs-work' | 'not-ready'
  gaps: AuditGap[]
  strengths: string[]
  recommendations: string[]
  createdAt: string
  updatedAt: string
}

export interface AuditGap {
  id: string
  requirement: string
  currentStatus: 'compliant' | 'non-compliant' | 'partial'
  evidenceStatus: 'complete' | 'partial' | 'missing'
  priority: 'low' | 'medium' | 'high' | 'critical'
  remediation: string
  dueDate?: string
}

export interface AuditEvidencePackage {
  id: string
  auditId: string
  evidence: Array<{
    requirement: string
    evidenceType: string
    location: string
    status: 'complete' | 'partial' | 'missing'
  }>
  status: 'draft' | 'complete' | 'delivered'
  createdAt: string
  completedAt?: string
}

export interface AuditResponse {
  id: string
  auditId: string
  question: string
  response: string
  evidence: string[]
  status: 'draft' | 'reviewed' | 'approved'
  createdAt: string
}

export interface AuditReadinessMetrics {
  totalAudits: number
  ready: number
  needsWork: number
  notReady: number
  averageReadinessScore: number
  criticalGaps: number
  byAuditType: Record<string, number>
}


