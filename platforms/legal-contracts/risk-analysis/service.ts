import { RiskAnalysis, RiskFactor, DisputePrediction, LiabilityAssessment, RiskMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('risk-analysis')

export class RiskAnalysisService {
  private analyses: Map<string, RiskAnalysis> = new Map()
  private predictions: Map<string, DisputePrediction> = new Map()

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

    this.analyses.set(analysis.id, analysis)
    return analysis
  }

  async getAnalysis(id: string): Promise<RiskAnalysis> {
    const analysis = this.analyses.get(id)
    if (!analysis) {
      throw new NotFoundError('Risk Analysis', id)
    }
    return analysis
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

    this.predictions.set(contractId, prediction)
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
    const allAnalyses = Array.from(this.analyses.values())
    const allPredictions = Array.from(this.predictions.values())
    
    return {
      totalAnalyses: allAnalyses.length,
      criticalRisk: allAnalyses.filter(a => a.overallRisk === 'critical').length,
      highRisk: allAnalyses.filter(a => a.overallRisk === 'high').length,
      mediumRisk: allAnalyses.filter(a => a.overallRisk === 'medium').length,
      lowRisk: allAnalyses.filter(a => a.overallRisk === 'low').length,
      averageRiskScore: allAnalyses.length > 0
        ? allAnalyses.reduce((sum, a) => sum + a.riskScore, 0) / allAnalyses.length
        : 0,
      predictedDisputes: allPredictions.filter(p => p.probability > 0.5).length,
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

