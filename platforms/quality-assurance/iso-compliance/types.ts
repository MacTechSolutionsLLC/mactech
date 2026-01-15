import { z } from 'zod'

export const isoComplianceSchema = z.object({
  organizationId: z.string().uuid(),
  standard: z.enum(['iso17025', 'iso9001']),
  scope: z.string(),
  metadata: z.record(z.any()).optional(),
})

export type ISOCompliance = z.infer<typeof isoComplianceSchema> & {
  id: string
  status: 'draft' | 'active' | 'audit-pending' | 'non-compliant'
  createdAt: string
  updatedAt: string
  lastAuditDate?: string
  nextAuditDate?: string
}

export interface ComplianceGap {
  id: string
  requirement: string
  clause: string
  currentStatus: 'compliant' | 'non-compliant' | 'partial'
  evidence?: string
  remediation: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  dueDate?: string
}

export interface AuditReadinessScore {
  complianceId: string
  overallScore: number
  readinessLevel: 'ready' | 'mostly-ready' | 'needs-work' | 'not-ready'
  gaps: ComplianceGap[]
  strengths: string[]
  recommendations: string[]
  estimatedDaysToReady: number
}

export interface ISOComplianceMetrics {
  totalPrograms: number
  compliant: number
  nonCompliant: number
  auditPending: number
  averageReadinessScore: number
  criticalGaps: number
  byStandard: Record<string, number>
}


