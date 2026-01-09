import { STIGValidation, STIGValidationResult, STIGRemediationPlaybook, STIGComplianceMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('stig-compliance')

export class STIGComplianceService {
  private validations: Map<string, STIGValidation> = new Map()
  private systems: Map<string, any> = new Map()

  async createValidation(data: Omit<STIGValidation, 'id' | 'status' | 'createdAt'>): Promise<STIGValidation> {
    logger.info('Creating STIG validation', { systemId: data.systemId })

    const validation: STIGValidation = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }

    this.validations.set(validation.id, validation)
    return validation
  }

  async getValidation(id: string): Promise<STIGValidation> {
    const validation = this.validations.get(id)
    if (!validation) {
      throw new NotFoundError('STIG Validation', id)
    }
    return validation
  }

  async runValidation(id: string): Promise<STIGValidationResult> {
    const validation = await this.getValidation(id)
    
    logger.info('Running STIG validation', { id })

    validation.status = 'running'
    this.validations.set(id, validation)

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

    validation.status = 'completed'
    validation.results = result
    validation.completedAt = new Date().toISOString()
    this.validations.set(id, validation)

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
    const allValidations = Array.from(this.validations.values())
    const completed = allValidations.filter(v => v.status === 'completed' && v.results)
    
    const compliant = completed.filter(v => v.results!.complianceScore >= 95).length
    const nonCompliant = completed.filter(v => v.results!.complianceScore < 70).length
    const partiallyCompliant = completed.filter(v => 
      v.results!.complianceScore >= 70 && v.results!.complianceScore < 95
    ).length

    const averageScore = completed.length > 0
      ? completed.reduce((sum, v) => sum + (v.results?.complianceScore || 0), 0) / completed.length
      : 0

    const criticalFindings = completed.reduce((sum, v) => 
      sum + (v.results?.gaps.filter(g => g.severity === 'critical').length || 0), 0
    )

    return {
      totalSystems: allValidations.length,
      compliant,
      nonCompliant,
      partiallyCompliant,
      averageComplianceScore: averageScore,
      criticalFindings,
      bySystemType: this.groupBySystemType(allValidations),
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

