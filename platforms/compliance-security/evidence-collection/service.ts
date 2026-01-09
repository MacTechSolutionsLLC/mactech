import { Evidence, EvidencePackage, EvidenceGap, EvidenceMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('evidence-collection')

export class EvidenceCollectionService {
  private evidence: Map<string, Evidence> = new Map()
  private packages: Map<string, EvidencePackage> = new Map()

  async collectEvidence(data: Omit<Evidence, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Evidence> {
    logger.info('Collecting evidence', { controlId: data.controlId, systemId: data.systemId })

    const evidence: Evidence = {
      ...data,
      id: crypto.randomUUID(),
      status: 'collected',
      collectedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.evidence.set(evidence.id, evidence)
    return evidence
  }

  async getEvidence(id: string): Promise<Evidence> {
    const evidence = this.evidence.get(id)
    if (!evidence) {
      throw new NotFoundError('Evidence', id)
    }
    return evidence
  }

  async listEvidence(systemId?: string): Promise<Evidence[]> {
    const all = Array.from(this.evidence.values())
    return systemId ? all.filter(e => e.systemId === systemId) : all
  }

  async validateEvidence(id: string, validatedBy: string): Promise<Evidence> {
    const evidence = await this.getEvidence(id)
    
    // In production, use ML to validate evidence quality
    const qualityScore = this.calculateQualityScore(evidence)
    
    evidence.status = qualityScore >= 70 ? 'validated' : 'rejected'
    evidence.qualityScore = qualityScore
    evidence.validatedBy = validatedBy
    evidence.validatedAt = new Date().toISOString()
    evidence.updatedAt = new Date().toISOString()
    this.evidence.set(id, evidence)

    logger.info('Evidence validated', { id, qualityScore })
    return evidence
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

    this.packages.set(package_.id, package_)
    return package_
  }

  async getMetrics(systemId?: string): Promise<EvidenceMetrics> {
    const allEvidence = systemId 
      ? await this.listEvidence(systemId)
      : Array.from(this.evidence.values())
    
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

