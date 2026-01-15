import { z } from 'zod'

export const contractSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(['msa', 'sow', 'nda', 'license', 'vendor', 'subcontractor']),
  parties: z.array(z.object({
    name: z.string(),
    role: z.enum(['client', 'vendor', 'subcontractor']),
    contact: z.string().email(),
  })).min(2),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  value: z.number().optional(),
  metadata: z.record(z.any()).optional(),
})

export type Contract = z.infer<typeof contractSchema> & {
  id: string
  status: 'draft' | 'negotiating' | 'active' | 'expired' | 'terminated'
  riskScore?: number
  createdAt: string
  updatedAt: string
  signedAt?: string
  expiresAt?: string
}

export interface ContractObligation {
  id: string
  contractId: string
  description: string
  type: 'deliverable' | 'milestone' | 'payment' | 'report' | 'other'
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  assignedTo?: string
  completedAt?: string
}

export interface ContractRiskAnalysis {
  contractId: string
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  riskFactors: Array<{
    factor: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    mitigation: string
  }>
  recommendations: string[]
}

export interface ContractMetrics {
  total: number
  active: number
  expiring: number
  highRisk: number
  overdueObligations: number
  byType: Record<string, number>
}


