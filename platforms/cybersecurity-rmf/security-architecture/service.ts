import { SecurityBaseline, ArchitectureReview, SecurityArchitectureMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('security-architecture')

export class SecurityArchitectureService {
  private baselines: Map<string, SecurityBaseline> = new Map()
  private reviews: Map<string, ArchitectureReview> = new Map()

  async createBaseline(data: Omit<SecurityBaseline, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<SecurityBaseline> {
    logger.info('Creating security baseline', { name: data.name })

    const baseline: SecurityBaseline = {
      ...data,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.baselines.set(baseline.id, baseline)
    return baseline
  }

  async getBaseline(id: string): Promise<SecurityBaseline> {
    const baseline = this.baselines.get(id)
    if (!baseline) {
      throw new NotFoundError('Security Baseline', id)
    }
    return baseline
  }

  async listBaselines(): Promise<SecurityBaseline[]> {
    return Array.from(this.baselines.values())
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

    this.reviews.set(review.id, review)
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
    const allBaselines = Array.from(this.baselines.values())
    
    return {
      totalBaselines: allBaselines.length,
      active: allBaselines.filter(b => b.status === 'active').length,
      underReview: allBaselines.filter(b => b.status === 'draft').length,
      averageControlsPerBaseline: allBaselines.length > 0
        ? allBaselines.reduce((sum, b) => sum + b.controls.length, 0) / allBaselines.length
        : 0,
      bySystemType: this.groupBySystemType(allBaselines),
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

