import { AuditReadiness, AuditGap, AuditEvidencePackage, AuditResponse, AuditReadinessMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('audit-readiness')

export class AuditReadinessService {
  private audits: Map<string, AuditReadiness> = new Map()
  private evidencePackages: Map<string, AuditEvidencePackage> = new Map()
  private responses: Map<string, AuditResponse> = new Map()

  async createAuditReadiness(data: Omit<AuditReadiness, 'id' | 'readinessScore' | 'readinessLevel' | 'gaps' | 'strengths' | 'recommendations' | 'createdAt' | 'updatedAt'>): Promise<AuditReadiness> {
    logger.info('Creating audit readiness assessment', { systemId: data.systemId, auditType: data.auditType })

    // Calculate initial readiness
    const gaps = await this.identifyGaps(data.systemId, data.auditType)
    const readinessScore = this.calculateReadinessScore(gaps)
    const readinessLevel = this.determineReadinessLevel(readinessScore)

    const audit: AuditReadiness = {
      ...data,
      id: crypto.randomUUID(),
      readinessScore,
      readinessLevel,
      gaps,
      strengths: [
        'Strong quality management system',
        'Experienced team',
        'Good documentation practices',
      ],
      recommendations: [
        'Address critical gaps before audit',
        'Complete evidence collection',
        'Schedule pre-audit review',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.audits.set(audit.id, audit)
    return audit
  }

  async getAuditReadiness(id: string): Promise<AuditReadiness> {
    const audit = this.audits.get(id)
    if (!audit) {
      throw new NotFoundError('Audit Readiness', id)
    }
    return audit
  }

  async identifyGaps(systemId: string, auditType: string): Promise<AuditGap[]> {
    // In production, analyze against audit requirements
    return [
      {
        id: crypto.randomUUID(),
        requirement: 'Management Review',
        currentStatus: 'partial',
        evidenceStatus: 'partial',
        priority: 'high',
        remediation: 'Complete management review documentation',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: crypto.randomUUID(),
        requirement: 'Corrective Action Process',
        currentStatus: 'compliant',
        evidenceStatus: 'complete',
        priority: 'low',
        remediation: 'Maintain current process',
      },
    ]
  }

  async generateEvidencePackage(auditId: string): Promise<AuditEvidencePackage> {
    const audit = await this.getAuditReadiness(auditId)
    
    logger.info('Generating evidence package', { auditId })

    const evidence = audit.gaps.map(gap => ({
      requirement: gap.requirement,
      evidenceType: 'Documentation',
      location: `/evidence/${gap.id}`,
      status: gap.evidenceStatus === 'complete' ? 'complete' as const : 
              gap.evidenceStatus === 'partial' ? 'partial' as const : 'missing' as const,
    }))

    const package_: AuditEvidencePackage = {
      id: crypto.randomUUID(),
      auditId,
      evidence,
      status: evidence.every(e => e.status === 'complete') ? 'complete' : 'draft',
      createdAt: new Date().toISOString(),
      completedAt: evidence.every(e => e.status === 'complete') ? new Date().toISOString() : undefined,
    }

    this.evidencePackages.set(package_.id, package_)
    return package_
  }

  async generateResponse(auditId: string, question: string): Promise<AuditResponse> {
    const audit = await this.getAuditReadiness(auditId)
    
    logger.info('Generating audit response', { auditId, question })

    // In production, use AI/NLP to generate response
    const response: AuditResponse = {
      id: crypto.randomUUID(),
      auditId,
      question,
      response: `Based on our analysis, ${question} is addressed through our quality management system. Evidence is available in the evidence package.`,
      evidence: audit.gaps.map(g => g.requirement),
      status: 'draft',
      createdAt: new Date().toISOString(),
    }

    this.responses.set(response.id, response)
    return response
  }

  async getMetrics(): Promise<AuditReadinessMetrics> {
    const allAudits = Array.from(this.audits.values())
    
    return {
      totalAudits: allAudits.length,
      ready: allAudits.filter(a => a.readinessLevel === 'ready').length,
      needsWork: allAudits.filter(a => a.readinessLevel === 'needs-work').length,
      notReady: allAudits.filter(a => a.readinessLevel === 'not-ready').length,
      averageReadinessScore: allAudits.length > 0
        ? allAudits.reduce((sum, a) => sum + a.readinessScore, 0) / allAudits.length
        : 0,
      criticalGaps: allAudits.reduce((sum, a) => 
        sum + a.gaps.filter(g => g.priority === 'critical').length, 0
      ),
      byAuditType: this.groupByAuditType(allAudits),
    }
  }

  private calculateReadinessScore(gaps: AuditGap[]): number {
    let score = 100
    gaps.forEach(gap => {
      if (gap.priority === 'critical') score -= 20
      else if (gap.priority === 'high') score -= 10
      else if (gap.priority === 'medium') score -= 5
      else score -= 2
    })
    return Math.max(0, score)
  }

  private determineReadinessLevel(score: number): AuditReadiness['readinessLevel'] {
    if (score >= 90) return 'ready'
    if (score >= 75) return 'mostly-ready'
    if (score >= 60) return 'needs-work'
    return 'not-ready'
  }

  private groupByAuditType(audits: AuditReadiness[]): Record<string, number> {
    return audits.reduce((acc, a) => {
      acc[a.auditType] = (acc[a.auditType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const auditReadinessService = new AuditReadinessService()

