import { RiskAnalysis, RiskFactor, DisputePrediction, LiabilityAssessment, RiskMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('risk-analysis')

export class RiskAnalysisService {
  async analyzeRisk(data: Omit<RiskAnalysis, 'id' | 'overallRisk' | 'riskScore' | 'riskFactors' | 'recommendations' | 'createdAt'>): Promise<RiskAnalysis> {
    logger.info('Analyzing contract risk', { contractId: data.contractId })

    // In production, use AI/NLP to analyze contract
    const riskFactors: RiskFactor[] = [
      {
        factor: 'Payment Terms',
        severity: 'medium',
        description: 'Net 60 payment terms may impact cash flow',
        mitigation: 'Negotiate Net 30 terms or add early payment discount',
        likelihood: 0.6,
        impact: 0.5,
      },
      {
        factor: 'Termination Clause',
        severity: 'high',
        description: 'Limited termination rights for vendor',
        mitigation: 'Add termination for convenience clause',
        likelihood: 0.4,
        impact: 0.8,
      },
      {
        factor: 'Liability Cap',
        severity: 'critical',
        description: 'Unlimited liability exposure',
        mitigation: 'Add liability cap equal to contract value',
        likelihood: 0.2,
        impact: 1.0,
      },
    ]

    const riskScore = this.calculateRiskScore(riskFactors)
    const overallRisk = this.determineOverallRisk(riskScore)

    const recommendations = [
      'Review payment terms with finance team',
      'Add termination for convenience clause',
      'Include liability cap in contract',
      'Add performance metrics and SLAs',
    ]

    // Store analysis - Note: RiskAnalysis model doesn't exist in schema yet
    // For now, store in contract metadata or create separate storage
    // In production, would create a RiskAnalysis model in Prisma schema

    const analysis: RiskAnalysis = {
      ...data,
      id: crypto.randomUUID(),
      overallRisk,
      riskScore,
      riskFactors,
      recommendations,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }

    // Store risk score in contract metadata
    if (data.contractId) {
      try {
        await prisma.contract.update({
          where: { id: data.contractId },
          data: {
            riskScore,
            metadata: JSON.stringify({ riskAnalysis: analysis }),
          },
        })
      } catch (error) {
        logger.warn('Could not update contract with risk analysis', { contractId: data.contractId, error })
      }
    }

    return analysis
  }

  async getAnalysis(id: string): Promise<RiskAnalysis> {
    // Try to find in contract metadata
    const contracts = await prisma.contract.findMany({
      where: {
        metadata: {
          contains: id,
        },
      },
    })

    for (const contract of contracts) {
      if (contract.metadata) {
        const metadata = JSON.parse(contract.metadata)
        if (metadata.riskAnalysis && metadata.riskAnalysis.id === id) {
          return metadata.riskAnalysis
        }
      }
    }

    throw new NotFoundError('Risk Analysis', id)
  }

  async predictDispute(contractId: string): Promise<DisputePrediction> {
    logger.info('Predicting contract dispute', { contractId })

    // In production, use ML model trained on historical disputes
    const probability = 0.35 // 35% probability of dispute
    const riskFactors = [
      'Vague performance metrics',
      'Unclear payment terms',
      'Limited termination rights',
    ]

    const predictedIssues = [
      'Payment delays',
      'Scope creep disputes',
      'Quality issues',
    ]

    const recommendedActions = [
      'Clarify performance metrics in contract',
      'Add dispute resolution process',
      'Include regular review meetings',
    ]

    const prediction: DisputePrediction = {
      contractId,
      probability,
      riskFactors,
      predictedIssues,
      recommendedActions,
    }

    return prediction
  }

  async assessLiability(contractId: string): Promise<LiabilityAssessment> {
    logger.info('Assessing liability', { contractId })

    // In production, analyze contract terms for liability exposure
    return {
      contractId,
      potentialLiability: 500000, // dollars
      liabilityType: ['Breach of contract', 'Negligence', 'Data breach'],
      riskFactors: [
        'Unlimited liability clause',
        'No liability cap',
        'Broad indemnification',
      ],
      insuranceCoverage: true,
      coverageGaps: [
        'Cyber liability coverage may be insufficient',
        'Professional liability limits may be too low',
      ],
    }
  }

  async getMetrics(): Promise<RiskMetrics> {
    // Get risk scores from contracts
    const contracts = await prisma.contract.findMany({
      where: { riskScore: { not: null } },
    })

    const riskScores = contracts.map(c => c.riskScore!).filter(Boolean)
    const criticalRisk = contracts.filter(c => (c.riskScore || 0) >= 75).length
    const highRisk = contracts.filter(c => (c.riskScore || 0) >= 50 && (c.riskScore || 0) < 75).length
    const mediumRisk = contracts.filter(c => (c.riskScore || 0) >= 25 && (c.riskScore || 0) < 50).length
    const lowRisk = contracts.filter(c => (c.riskScore || 0) < 25).length
    
    return {
      totalAnalyses: contracts.length,
      criticalRisk,
      highRisk,
      mediumRisk,
      lowRisk,
      averageRiskScore: riskScores.length > 0
        ? riskScores.reduce((sum, s) => sum + s, 0) / riskScores.length
        : 0,
      predictedDisputes: 0, // Would calculate from predictions
    }
  }

  private calculateRiskScore(factors: RiskFactor[]): number {
    let score = 0
    factors.forEach(f => {
      const factorScore = f.likelihood * f.impact * 100
      if (f.severity === 'critical') score += factorScore * 1.5
      else if (f.severity === 'high') score += factorScore * 1.2
      else if (f.severity === 'medium') score += factorScore
      else score += factorScore * 0.5
    })
    return Math.min(100, score)
  }

  private determineOverallRisk(score: number): RiskAnalysis['overallRisk'] {
    if (score >= 75) return 'critical'
    if (score >= 50) return 'high'
    if (score >= 25) return 'medium'
    return 'low'
  }
}

export const riskAnalysisService = new RiskAnalysisService()

