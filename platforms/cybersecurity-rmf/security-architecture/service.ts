import { SecurityBaseline, ArchitectureReview, SecurityArchitectureMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('security-architecture')

export class SecurityArchitectureService {
  async createBaseline(data: Omit<SecurityBaseline, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<SecurityBaseline> {
    logger.info('Creating security baseline', { name: data.name })

    const baseline = await prisma.securityBaseline.create({
      data: {
        name: data.name,
        systemType: data.systemType,
        controls: JSON.stringify(data.controls || []),
        status: 'draft',
      },
    })

    return {
      id: baseline.id,
      name: baseline.name,
      systemType: baseline.systemType,
      controls: baseline.controls ? JSON.parse(baseline.controls) : [],
      status: baseline.status as any,
      createdAt: baseline.createdAt.toISOString(),
      updatedAt: baseline.updatedAt.toISOString(),
      approvedAt: baseline.approvedAt?.toISOString(),
    }
  }

  async getBaseline(id: string): Promise<SecurityBaseline> {
    const baseline = await prisma.securityBaseline.findUnique({
      where: { id },
    })

    if (!baseline) {
      throw new NotFoundError('Security Baseline', id)
    }

    return {
      id: baseline.id,
      name: baseline.name,
      systemType: baseline.systemType,
      controls: baseline.controls ? JSON.parse(baseline.controls) : [],
      status: baseline.status as any,
      createdAt: baseline.createdAt.toISOString(),
      updatedAt: baseline.updatedAt.toISOString(),
      approvedAt: baseline.approvedAt?.toISOString(),
    }
  }

  async listBaselines(): Promise<SecurityBaseline[]> {
    const baselines = await prisma.securityBaseline.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return baselines.map(b => ({
      id: b.id,
      name: b.name,
      systemType: b.systemType,
      controls: b.controls ? JSON.parse(b.controls) : [],
      status: b.status as any,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      approvedAt: b.approvedAt?.toISOString(),
    }))
  }

  async reviewArchitecture(systemId: string, reviewer: string): Promise<ArchitectureReview> {
    logger.info('Reviewing security architecture', { systemId, reviewer })

    const review: ArchitectureReview = {
      id: crypto.randomUUID(),
      systemId,
      reviewDate: new Date().toISOString(),
      reviewer,
      findings: [
        {
          finding: 'Missing network segmentation controls',
          severity: 'high',
          recommendation: 'Implement network segmentation per security zones',
        },
        {
          finding: 'Encryption at rest not configured',
          severity: 'medium',
          recommendation: 'Enable encryption at rest for all data stores',
        },
      ],
      status: 'in-review',
    }

    // Store review (would need ArchitectureReview model in Prisma)
    return review
  }

  async validateBaseline(id: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const baseline = await this.getBaseline(id)
    
    const errors: string[] = []
    const warnings: string[] = []

    if (baseline.controls.length === 0) {
      errors.push('Baseline must include at least one control')
    }

    if (!baseline.systemType) {
      warnings.push('System type should be specified')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    }
  }

  async getMetrics(): Promise<SecurityArchitectureMetrics> {
    const allBaselines = await prisma.securityBaseline.findMany()
    
    const mappedBaselines = allBaselines.map(b => ({
      id: b.id,
      name: b.name,
      systemType: b.systemType,
      controls: b.controls ? JSON.parse(b.controls) : [],
      status: b.status as any,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
      approvedAt: b.approvedAt?.toISOString(),
    }))
    
    return {
      totalBaselines: mappedBaselines.length,
      active: mappedBaselines.filter(b => b.status === 'active').length,
      underReview: mappedBaselines.filter(b => b.status === 'draft').length,
      averageControlsPerBaseline: mappedBaselines.length > 0
        ? mappedBaselines.reduce((sum, b) => sum + b.controls.length, 0) / mappedBaselines.length
        : 0,
      bySystemType: this.groupBySystemType(mappedBaselines),
    }
  }

  private groupBySystemType(baselines: SecurityBaseline[]): Record<string, number> {
    return baselines.reduce((acc, b) => {
      acc[b.systemType] = (acc[b.systemType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const securityArchitectureService = new SecurityArchitectureService()

