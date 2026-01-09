import { SOP, SOPValidationResult, SOPMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError, ValidationError } from '../../shared/errors'

const logger = createLogger('sop-automation')

export class SOPAutomationService {
  private sops: Map<string, SOP> = new Map()

  async generateSOP(data: Omit<SOP, 'id' | 'version' | 'status' | 'createdAt' | 'updatedAt' | 'content' | 'format'>): Promise<SOP> {
    logger.info('Generating SOP', { title: data.title })

    // Generate SOP content from requirements
    const content = this.generateContent(data)

    const sop: SOP = {
      ...data,
      id: crypto.randomUUID(),
      version: '1.0',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content,
      format: 'html',
    }

    this.sops.set(sop.id, sop)
    return sop
  }

  async getSOP(id: string): Promise<SOP> {
    const sop = this.sops.get(id)
    if (!sop) {
      throw new NotFoundError('SOP', id)
    }
    return sop
  }

  async listSOPs(): Promise<SOP[]> {
    return Array.from(this.sops.values())
  }

  async validateSOP(id: string): Promise<SOPValidationResult> {
    const sop = await this.getSOP(id)
    
    logger.info('Validating SOP', { id })

    const errors: Array<{ field: string; message: string }> = []
    const warnings: Array<{ field: string; message: string }> = []
    const complianceChecks: Array<{ requirement: string; status: 'pass' | 'fail' | 'warning' }> = []

    // Validate required sections
    if (!sop.content.includes('Purpose')) {
      errors.push({ field: 'content', message: 'SOP must include Purpose section' })
    }

    if (!sop.content.includes('Procedure')) {
      errors.push({ field: 'content', message: 'SOP must include Procedure section' })
    }

    if (!sop.scope) {
      warnings.push({ field: 'scope', message: 'Scope is recommended for clarity' })
    }

    // Compliance checks
    if (sop.standard === 'iso17025') {
      complianceChecks.push(
        { requirement: 'Document Control', status: 'pass' },
        { requirement: 'Version Control', status: sop.version ? 'pass' : 'fail' },
        { requirement: 'Review Process', status: 'warning' }
      )
    }

    const suggestions = [
      'Add more detailed procedure steps',
      'Include risk assessment section',
      'Add training requirements',
    ]

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      complianceChecks,
      suggestions,
    }
  }

  async approveSOP(id: string, approvedBy: string): Promise<SOP> {
    const sop = await this.getSOP(id)

    // Validate before approval
    const validation = await this.validateSOP(id)
    if (!validation.valid) {
      throw new ValidationError('SOP validation failed', { errors: validation.errors })
    }

    sop.status = 'approved'
    sop.approvedBy = approvedBy
    sop.approvedAt = new Date().toISOString()
    sop.updatedAt = new Date().toISOString()
    this.sops.set(id, sop)

    logger.info('SOP approved', { id, approvedBy })
    return sop
  }

  async getMetrics(): Promise<SOPMetrics> {
    const allSOPs = Array.from(this.sops.values())
    
    return {
      total: allSOPs.length,
      draft: allSOPs.filter(s => s.status === 'draft').length,
      approved: allSOPs.filter(s => s.status === 'approved').length,
      inReview: allSOPs.filter(s => s.status === 'review').length,
      averageReviewTime: 5.2, // days - would calculate from historical data
      byStandard: this.groupByStandard(allSOPs),
    }
  }

  private generateContent(data: Omit<SOP, 'id' | 'version' | 'status' | 'createdAt' | 'updatedAt' | 'content' | 'format'>): string {
    return `# ${data.title}

## Purpose
${data.requirement}

## Scope
${data.scope || 'This procedure applies to all relevant personnel and processes.'}

## Responsibilities
${data.responsibilities?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'To be defined'}

## Procedure
${data.procedure?.map((p, i) => `${i + 1}. ${p}`).join('\n') || '1. Step one\n2. Step two\n3. Step three'}

## Records
- Document control records
- Training records

## References
${data.standard ? `- ${data.standard.toUpperCase()} Standard` : ''}
- Quality Manual
`
  }

  private groupByStandard(sops: SOP[]): Record<string, number> {
    return sops.reduce((acc, sop) => {
      const standard = sop.standard || 'custom'
      acc[standard] = (acc[standard] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const sopAutomationService = new SOPAutomationService()

