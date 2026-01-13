import { Evidence, EvidencePackage, EvidenceGap, EvidenceMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('evidence-collection')

export class EvidenceCollectionService {
  async collectEvidence(data: Omit<Evidence, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    logger.info('Collecting evidence', { controlId: data.controlId, systemId: data.systemId })

    const evidence = await prisma.evidence.create({
      data: {
        controlId: data.controlId,
        systemId: data.systemId,
        evidenceType: data.evidenceType,
        status: 'collected',
        qualityScore: data.qualityScore || null,
        collectedAt: new Date(),
      },
    })

    return {
      id: evidence.id,
      controlId: evidence.controlId,
      systemId: evidence.systemId,
      evidenceType: evidence.evidenceType as any,
      description: data.description,
      status: evidence.status as any,
      qualityScore: evidence.qualityScore || undefined,
      collectedAt: evidence.collectedAt?.toISOString(),
      validatedAt: evidence.validatedAt?.toISOString(),
      createdAt: evidence.createdAt.toISOString(),
      updatedAt: evidence.updatedAt.toISOString(),
    }
  }

  async getEvidence(id: string): Promise<Evidence> {
    const evidence = await prisma.evidence.findUnique({
      where: { id },
    })

    if (!evidence) {
      throw new NotFoundError('Evidence', id)
    }

    return {
      id: evidence.id,
      controlId: evidence.controlId,
      systemId: evidence.systemId,
      evidenceType: evidence.evidenceType as any,
      description: '', // Would come from metadata
      status: evidence.status as any,
      qualityScore: evidence.qualityScore || undefined,
      collectedAt: evidence.collectedAt?.toISOString(),
      validatedAt: evidence.validatedAt?.toISOString(),
      createdAt: evidence.createdAt.toISOString(),
      updatedAt: evidence.updatedAt.toISOString(),
    }
  }

  async listEvidence(systemId?: string): Promise<Evidence[]> {
    const where = systemId ? { systemId } : {}
    const evidence = await prisma.evidence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return evidence.map(e => ({
      id: e.id,
      controlId: e.controlId,
      systemId: e.systemId,
      evidenceType: e.evidenceType as any,
      description: '', // Would come from metadata
      status: e.status as any,
      qualityScore: e.qualityScore || undefined,
      collectedAt: e.collectedAt?.toISOString(),
      validatedAt: e.validatedAt?.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    }))
  }

  async validateEvidence(id: string, validatedBy: string): Promise<Evidence> {
    const evidence = await this.getEvidence(id)
    
    // In production, use ML to validate evidence quality
    const qualityScore = this.calculateQualityScore(evidence)
    
    const updated = await prisma.evidence.update({
      where: { id },
      data: {
        status: qualityScore >= 70 ? 'validated' : 'rejected',
        qualityScore,
        validatedAt: new Date(),
      },
    })

    logger.info('Evidence validated', { id, qualityScore })
    
    return {
      id: updated.id,
      controlId: updated.controlId,
      systemId: updated.systemId,
      evidenceType: updated.evidenceType as any,
      description: '', // Would come from metadata
      status: updated.status as any,
      qualityScore: updated.qualityScore || undefined,
      collectedAt: updated.collectedAt?.toISOString(),
      validatedAt: updated.validatedAt?.toISOString(),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async identifyGaps(systemId: string, requiredControls: string[]): Promise<EvidenceGap[]> {
    const collectedEvidence = await this.listEvidence(systemId)
    const collectedControlIds = new Set(collectedEvidence.map(e => e.controlId))
    
    const gaps: EvidenceGap[] = requiredControls
      .filter(controlId => !collectedControlIds.has(controlId))
      .map(controlId => ({
        controlId,
        controlTitle: `Control ${controlId}`,
        requiredEvidence: 'Configuration documentation and test results',
        currentStatus: 'missing' as const,
        priority: 'high' as const,
      }))

    // Check for low-quality evidence
    collectedEvidence
      .filter(e => (e.qualityScore || 0) < 70)
      .forEach(e => {
        gaps.push({
          controlId: e.controlId,
          controlTitle: `Control ${e.controlId}`,
          requiredEvidence: 'Higher quality evidence required',
          currentStatus: 'low-quality' as const,
          priority: 'medium' as const,
        })
      })

    return gaps
  }

  async generatePackage(systemId: string, auditType: string): Promise<EvidencePackage> {
    const evidence = await this.listEvidence(systemId)
    const validatedEvidence = evidence.filter(e => e.status === 'validated')
    
    logger.info('Generating evidence package', { systemId, auditType, evidenceCount: validatedEvidence.length })

    const package_: EvidencePackage = {
      id: crypto.randomUUID(),
      systemId,
      auditType,
      evidence: validatedEvidence,
      status: validatedEvidence.length > 0 ? 'complete' : 'draft',
      createdAt: new Date().toISOString(),
      completedAt: validatedEvidence.length > 0 ? new Date().toISOString() : undefined,
    }

    // Store package in database (would need AuditEvidencePackage model)
    return package_
  }

  async getMetrics(systemId?: string): Promise<EvidenceMetrics> {
    const allEvidence = systemId 
      ? await this.listEvidence(systemId)
      : await this.listEvidence()
    
    const qualityScores = allEvidence.filter(e => e.qualityScore).map(e => e.qualityScore!)
    const averageScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
      : 0

    return {
      totalEvidence: allEvidence.length,
      validated: allEvidence.filter(e => e.status === 'validated').length,
      pending: allEvidence.filter(e => e.status === 'pending' || e.status === 'collected').length,
      rejected: allEvidence.filter(e => e.status === 'rejected').length,
      averageQualityScore: averageScore,
      gaps: 0, // Would calculate from gaps
      byType: this.groupByType(allEvidence),
    }
  }

  private calculateQualityScore(evidence: Evidence): number {
    // In production, use ML model
    let score = 70 // Base score
    
    if (evidence.description && evidence.description.length > 50) score += 10
    if (evidence.location) score += 10
    if (evidence.metadata && Object.keys(evidence.metadata).length > 0) score += 10
    
    return Math.min(100, score)
  }

  private groupByType(evidence: Evidence[]): Record<string, number> {
    return evidence.reduce((acc, e) => {
      acc[e.evidenceType] = (acc[e.evidenceType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const evidenceCollectionService = new EvidenceCollectionService()

