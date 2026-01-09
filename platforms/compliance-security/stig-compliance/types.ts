import { z } from 'zod'

export const stigValidationSchema = z.object({
  systemId: z.string().uuid(),
  stigProfile: z.string(),
  systemType: z.enum(['rhel8', 'rhel9', 'windows11', 'windows2022', 'cisco-ios']),
  validateRemediation: z.boolean().default(true),
})

export type STIGValidation = z.infer<typeof stigValidationSchema> & {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  results?: STIGValidationResult
  createdAt: string
  completedAt?: string
}

export interface STIGValidationResult {
  totalControls: number
  passed: number
  failed: number
  notApplicable: number
  notReviewed: number
  controls: Array<{
    id: string
    title: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'pass' | 'fail' | 'not-applicable' | 'not-reviewed'
    finding?: string
    remediation?: string
  }>
  complianceScore: number
  gaps: Array<{
    controlId: string
    controlTitle: string
    severity: string
    remediation: string
  }>
}

export interface STIGRemediationPlaybook {
  systemId: string
  validationId: string
  playbook: {
    type: 'ansible' | 'powershell' | 'bash'
    content: string
    controls: string[]
  }
  generatedAt: string
}

export interface STIGComplianceMetrics {
  totalSystems: number
  compliant: number
  nonCompliant: number
  partiallyCompliant: number
  averageComplianceScore: number
  criticalFindings: number
  bySystemType: Record<string, number>
}

