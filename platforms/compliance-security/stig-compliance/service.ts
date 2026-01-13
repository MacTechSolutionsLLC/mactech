import { STIGValidation, STIGValidationResult, STIGRemediationPlaybook, STIGComplianceMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('stig-compliance')

export class STIGComplianceService {
  async createValidation(data: Omit<STIGValidation, 'id' | 'status' | 'createdAt'>): Promise<STIGValidation> {
    logger.info('Creating STIG validation', { systemId: data.systemId })

    const validation = await prisma.sTIGValidation.create({
      data: {
        systemId: data.systemId,
        stigProfile: data.stigProfile,
        systemType: data.systemType,
        status: 'pending',
      },
    })

    return {
      id: validation.id,
      systemId: validation.systemId,
      stigProfile: validation.stigProfile,
      systemType: validation.systemType as any,
      validateRemediation: true, // Default value
      status: validation.status as any,
      results: validation.results ? JSON.parse(validation.results) : undefined,
      createdAt: validation.createdAt.toISOString(),
      completedAt: validation.completedAt?.toISOString(),
    }
  }

  async getValidation(id: string): Promise<STIGValidation> {
    const validation = await prisma.sTIGValidation.findUnique({
      where: { id },
    })

    if (!validation) {
      throw new NotFoundError('STIG Validation', id)
    }

    return {
      id: validation.id,
      systemId: validation.systemId,
      stigProfile: validation.stigProfile,
      systemType: validation.systemType as any,
      validateRemediation: true, // Default value
      status: validation.status as any,
      results: validation.results ? JSON.parse(validation.results) : undefined,
      createdAt: validation.createdAt.toISOString(),
      completedAt: validation.completedAt?.toISOString(),
    }
  }

  async runValidation(id: string): Promise<STIGValidationResult> {
    const validation = await this.getValidation(id)
    
    logger.info('Running STIG validation', { id })

    await prisma.sTIGValidation.update({
      where: { id },
      data: { status: 'running' },
    })

    // In production, this would integrate with actual STIG scanning tools
    // For now, simulate validation results
    const result: STIGValidationResult = {
      totalControls: 150,
      passed: 120,
      failed: 25,
      notApplicable: 3,
      notReviewed: 2,
      controls: [
        {
          id: 'SV-12345',
          title: 'System must disable automatic login',
          severity: 'high',
          status: 'pass',
        },
        {
          id: 'SV-12346',
          title: 'System must enforce password complexity',
          severity: 'critical',
          status: 'fail',
          finding: 'Password complexity not enforced',
          remediation: 'Configure password policy to enforce complexity',
        },
      ],
      complianceScore: 80,
      gaps: [
        {
          controlId: 'SV-12346',
          controlTitle: 'System must enforce password complexity',
          severity: 'critical',
          remediation: 'Configure password policy to enforce complexity',
        },
      ],
    }

    await prisma.sTIGValidation.update({
      where: { id },
      data: {
        status: 'completed',
        results: JSON.stringify(result),
        completedAt: new Date(),
      },
    })

    return result
  }

  async generateRemediationPlaybook(validationId: string): Promise<STIGRemediationPlaybook> {
    const validation = await this.getValidation(validationId)
    if (!validation.results) {
      throw new Error('Validation must be completed before generating playbook')
    }

    logger.info('Generating remediation playbook', { validationId })

    // In production, integrate with STIG Generator tool
    const playbook: STIGRemediationPlaybook = {
      systemId: validation.systemId,
      validationId,
      playbook: {
        type: validation.systemType.includes('windows') ? 'powershell' : 'ansible',
        content: `# STIG Remediation Playbook\n# Generated for ${validation.systemId}\n# Controls: ${validation.results.gaps.map(g => g.controlId).join(', ')}`,
        controls: validation.results.gaps.map(g => g.controlId),
      },
      generatedAt: new Date().toISOString(),
    }

    return playbook
  }

  async getComplianceMetrics(): Promise<STIGComplianceMetrics> {
    const allValidations = await prisma.sTIGValidation.findMany()
    const completed = allValidations
      .filter(v => v.status === 'completed' && v.results)
      .map(v => ({
        id: v.id,
        systemId: v.systemId,
        stigProfile: v.stigProfile,
        systemType: v.systemType as any,
        validateRemediation: true,
        status: v.status as any,
        results: v.results ? JSON.parse(v.results) : undefined,
        createdAt: v.createdAt.toISOString(),
        completedAt: v.completedAt?.toISOString(),
      }))
      .filter(v => v.status === 'completed' && v.results)
    
    const compliant = completed.filter(v => v.results!.complianceScore >= 95).length
    const nonCompliant = completed.filter(v => v.results!.complianceScore < 70).length
    const partiallyCompliant = completed.filter(v => 
      v.results!.complianceScore >= 70 && v.results!.complianceScore < 95
    ).length

    const averageScore = completed.length > 0
      ? completed.reduce((sum, v) => sum + (v.results?.complianceScore || 0), 0) / completed.length
      : 0

    const criticalFindings = completed.reduce((sum, v) => 
      sum + (v.results?.gaps.filter((g: any) => g.severity === 'critical').length || 0), 0
    )

    const mappedValidations = allValidations.map(v => ({
      id: v.id,
      systemId: v.systemId,
      stigProfile: v.stigProfile,
      systemType: v.systemType as any,
      validateRemediation: true,
      status: v.status as any,
      results: v.results ? JSON.parse(v.results) : undefined,
      createdAt: v.createdAt.toISOString(),
      completedAt: v.completedAt?.toISOString(),
    }))

    return {
      totalSystems: allValidations.length,
      compliant,
      nonCompliant,
      partiallyCompliant,
      averageComplianceScore: averageScore,
      criticalFindings,
      bySystemType: this.groupBySystemType(mappedValidations),
    }
  }

  private groupBySystemType(validations: STIGValidation[]): Record<string, number> {
    return validations.reduce((acc, v) => {
      acc[v.systemType] = (acc[v.systemType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const stigComplianceService = new STIGComplianceService()

