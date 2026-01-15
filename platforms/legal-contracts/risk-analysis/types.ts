import { z } from 'zod'

export const riskAnalysisSchema = z.object({
  contractId: z.string().uuid(),
  analysisType: z.enum(['full', 'quick', 'custom']).default('full'),
  metadata: z.record(z.any()).optional(),
})

export type RiskAnalysis = z.infer<typeof riskAnalysisSchema> & {
  id: string
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  riskFactors: RiskFactor[]
  recommendations: string[]
  createdAt: string
  completedAt?: string
}

export interface RiskFactor {
  factor: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  mitigation: string
  likelihood: number
  impact: number
}

export interface DisputePrediction {
  contractId: string
  probability: number
  riskFactors: string[]
  predictedIssues: string[]
  recommendedActions: string[]
}

export interface LiabilityAssessment {
  contractId: string
  potentialLiability: number
  liabilityType: string[]
  riskFactors: string[]
  insuranceCoverage: boolean
  coverageGaps: string[]
}

export interface RiskMetrics {
  totalAnalyses: number
  criticalRisk: number
  highRisk: number
  mediumRisk: number
  lowRisk: number
  averageRiskScore: number
  predictedDisputes: number
}


