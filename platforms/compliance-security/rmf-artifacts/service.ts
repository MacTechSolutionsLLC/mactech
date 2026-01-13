import { RMFArtifact, ArtifactValidationResult, RMFArtifactMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('rmf-artifacts')

export class RMFArtifactService {
  async generateArtifact(data: Omit<RMFArtifact, 'id' | 'status' | 'content' | 'createdAt' | 'updatedAt'>): Promise<RMFArtifact> {
    logger.info('Generating RMF artifact', { artifactType: data.artifactType, systemId: data.systemId })

    const content = this.generateContent(data)

    const artifact = await prisma.rMFArtifact.create({
      data: {
        artifactType: data.artifactType,
        systemId: data.systemId,
        systemName: data.systemName,
        status: 'draft',
        content,
        qualityScore: data.qualityScore || null,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    return {
      id: artifact.id,
      artifactType: artifact.artifactType as any,
      systemId: artifact.systemId,
      systemName: artifact.systemName,
      status: artifact.status as any,
      content: artifact.content,
      qualityScore: artifact.qualityScore || undefined,
      metadata: artifact.metadata ? JSON.parse(artifact.metadata) : undefined,
      createdAt: artifact.createdAt.toISOString(),
      updatedAt: artifact.updatedAt.toISOString(),
      approvedAt: artifact.approvedAt?.toISOString(),
    }
  }

  async getArtifact(id: string): Promise<RMFArtifact> {
    const artifact = await prisma.rMFArtifact.findUnique({
      where: { id },
    })

    if (!artifact) {
      throw new NotFoundError('RMF Artifact', id)
    }

    return {
      id: artifact.id,
      artifactType: artifact.artifactType as any,
      systemId: artifact.systemId,
      systemName: artifact.systemName,
      status: artifact.status as any,
      content: artifact.content,
      qualityScore: artifact.qualityScore || undefined,
      metadata: artifact.metadata ? JSON.parse(artifact.metadata) : undefined,
      createdAt: artifact.createdAt.toISOString(),
      updatedAt: artifact.updatedAt.toISOString(),
      approvedAt: artifact.approvedAt?.toISOString(),
    }
  }

  async listArtifacts(systemId?: string): Promise<RMFArtifact[]> {
    const where = systemId ? { systemId } : {}
    const artifacts = await prisma.rMFArtifact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return artifacts.map(a => ({
      id: a.id,
      artifactType: a.artifactType as any,
      systemId: a.systemId,
      systemName: a.systemName,
      status: a.status as any,
      content: a.content,
      qualityScore: a.qualityScore || undefined,
      metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
      approvedAt: a.approvedAt?.toISOString(),
    }))
  }

  async validateArtifact(id: string): Promise<ArtifactValidationResult> {
    const artifact = await this.getArtifact(id)
    
    logger.info('Validating artifact', { id, type: artifact.artifactType })

    const errors: Array<{ section: string; message: string }> = []
    const warnings: Array<{ section: string; message: string }> = []

    // Validate required sections based on artifact type
    if (artifact.artifactType === 'ssp') {
      if (!artifact.content.includes('System Description')) {
        errors.push({ section: 'System Description', message: 'SSP must include system description' })
      }
      if (!artifact.content.includes('Security Controls')) {
        errors.push({ section: 'Security Controls', message: 'SSP must include security controls section' })
      }
    }

    if (artifact.artifactType === 'poam') {
      if (!artifact.content.includes('Finding')) {
        warnings.push({ section: 'Finding', message: 'POA&M should include finding details' })
      }
    }

    const qualityScore = this.calculateQualityScore(artifact)
    const completenessScore = this.calculateCompleteness(artifact)

    // Update artifact quality score in database
    await prisma.rMFArtifact.update({
      where: { id },
      data: { qualityScore },
    })

    const recommendations = [
      'Add more detail to security control implementations',
      'Include risk assessment findings',
      'Update system boundary description',
    ]

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      qualityScore,
      completenessScore,
      recommendations,
    }
  }

  async getMetrics(): Promise<RMFArtifactMetrics> {
    const allArtifacts = await prisma.rMFArtifact.findMany()
    const qualityScores = allArtifacts.filter(a => a.qualityScore).map(a => a.qualityScore!)
    const averageScore = qualityScores.length > 0
      ? qualityScores.reduce((sum, s) => sum + s, 0) / qualityScores.length
      : 0

    return {
      total: allArtifacts.length,
      draft: allArtifacts.filter(a => a.status === 'draft').length,
      approved: allArtifacts.filter(a => a.status === 'approved').length,
      delivered: allArtifacts.filter(a => a.status === 'delivered').length,
      averageQualityScore: averageScore,
      byType: this.groupByType(allArtifacts.map(a => ({
        id: a.id,
        artifactType: a.artifactType as any,
        systemId: a.systemId,
        systemName: a.systemName,
        status: a.status as any,
        content: a.content,
        qualityScore: a.qualityScore || undefined,
        metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        approvedAt: a.approvedAt?.toISOString(),
      }))),
    }
  }

  private generateContent(data: Omit<RMFArtifact, 'id' | 'status' | 'content' | 'createdAt' | 'updatedAt'>): string {
    const templates = {
      ssp: `# System Security Plan: ${data.systemName}\n\n## System Description\n\n[System description here]\n\n## Security Controls\n\n[Security controls implementation]`,
      rar: `# Risk Assessment Report: ${data.systemName}\n\n## Risk Analysis\n\n[Risk analysis here]`,
      poam: `# Plan of Action and Milestones: ${data.systemName}\n\n## Findings\n\n[Findings and remediation plans]`,
      conmon: `# Continuous Monitoring Strategy: ${data.systemName}\n\n## Monitoring Approach\n\n[Monitoring strategy]`,
    }

    return templates[data.artifactType] || `# ${data.artifactType.toUpperCase()}: ${data.systemName}\n\n[Content]`
  }

  private calculateQualityScore(artifact: RMFArtifact): number {
    let score = 60 // Base score
    
    if (artifact.content.length > 1000) score += 20
    if (artifact.content.includes('NIST')) score += 10
    if (artifact.content.includes('Control')) score += 10
    
    return Math.min(100, score)
  }

  private calculateCompleteness(artifact: RMFArtifact): number {
    // Simple completeness check
    const requiredSections = artifact.artifactType === 'ssp' ? 5 : 3
    const sections = artifact.content.split('##').length - 1
    return Math.min(100, (sections / requiredSections) * 100)
  }

  private groupByType(artifacts: RMFArtifact[]): Record<string, number> {
    return artifacts.reduce((acc, a) => {
      acc[a.artifactType] = (acc[a.artifactType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const rmfArtifactService = new RMFArtifactService()

