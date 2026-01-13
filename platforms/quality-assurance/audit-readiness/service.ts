import { AuditReadiness, AuditGap, AuditEvidencePackage, AuditResponse, AuditReadinessMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('audit-readiness')

export class AuditReadinessService {
  async createAuditReadiness(data: Omit<AuditReadiness, 'id' | 'readinessScore' | 'readinessLevel' | 'gaps' | 'strengths' | 'recommendations' | 'createdAt' | 'updatedAt'>): Promise<AuditReadiness> {
    logger.info('Creating audit readiness assessment', { systemId: data.systemId, auditType: data.auditType })

    // Calculate initial readiness
    const gaps = await this.identifyGaps(data.systemId, data.auditType)
    const readinessScore = this.calculateReadinessScore(gaps)
    const readinessLevel = this.determineReadinessLevel(readinessScore)

    const strengths = [
      'Strong quality management system',
      'Experienced team',
      'Good documentation practices',
    ]
    const recommendations = [
      'Address critical gaps before audit',
      'Complete evidence collection',
      'Schedule pre-audit review',
    ]

    const audit = await prisma.auditReadiness.create({
      data: {
        systemId: data.systemId,
        auditType: data.auditType,
        auditDate: data.auditDate ? new Date(data.auditDate) : null,
        readinessScore,
        readinessLevel,
        gaps: JSON.stringify(gaps),
        strengths: JSON.stringify(strengths),
        recommendations: JSON.stringify(recommendations),
        status: 'draft',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return this.mapToAuditReadiness(audit)
  }

  private mapToAuditReadiness(audit: any): AuditReadiness {
    return {
      id: audit.id,
      systemId: audit.systemId,
      auditType: audit.auditType as any,
      auditDate: audit.auditDate?.toISOString(),
      readinessScore: audit.readinessScore,
      readinessLevel: audit.readinessLevel as any,
      gaps: JSON.parse(audit.gaps),
      strengths: JSON.parse(audit.strengths),
      recommendations: JSON.parse(audit.recommendations),
      metadata: audit.metadata ? JSON.parse(audit.metadata) : undefined,
      createdAt: audit.createdAt.toISOString(),
      updatedAt: audit.updatedAt.toISOString(),
    }
  }

  async getAuditReadiness(id: string): Promise<AuditReadiness> {
    const audit = await prisma.auditReadiness.findUnique({
      where: { id },
    })

    if (!audit) {
      throw new NotFoundError('Audit Readiness', id)
    }

    return this.mapToAuditReadiness(audit)
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

    const status = evidence.every(e => e.status === 'complete') ? 'complete' : 'draft'
    
    const package_ = await prisma.auditEvidencePackage.create({
      data: {
        auditId,
        evidence: JSON.stringify(evidence),
        status,
        completedAt: status === 'complete' ? new Date() : null,
      },
    })

    return {
      id: package_.id,
      auditId: package_.auditId,
      evidence: JSON.parse(package_.evidence),
      status: package_.status as any,
      createdAt: package_.createdAt.toISOString(),
      completedAt: package_.completedAt?.toISOString(),
    }
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

    // Note: AuditResponse is not persisted in database - it's generated on-demand
    return response
  }

  async getMetrics(): Promise<AuditReadinessMetrics> {
    const allAudits = await prisma.auditReadiness.findMany()
    const mappedAudits = allAudits.map(a => this.mapToAuditReadiness(a))
    
    return {
      totalAudits: mappedAudits.length,
      ready: mappedAudits.filter(a => a.readinessLevel === 'ready').length,
      needsWork: mappedAudits.filter(a => a.readinessLevel === 'needs-work').length,
      notReady: mappedAudits.filter(a => a.readinessLevel === 'not-ready').length,
      averageReadinessScore: mappedAudits.length > 0
        ? mappedAudits.reduce((sum, a) => sum + a.readinessScore, 0) / mappedAudits.length
        : 0,
      criticalGaps: mappedAudits.reduce((sum, a) => 
        sum + a.gaps.filter(g => g.priority === 'critical').length, 0
      ),
      byAuditType: this.groupByAuditType(mappedAudits),
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

