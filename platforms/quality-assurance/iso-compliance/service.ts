import { ISOCompliance, ComplianceGap, AuditReadinessScore, ISOComplianceMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('iso-compliance')

export class ISOComplianceService {
  private programs: Map<string, ISOCompliance> = new Map()
  private gaps: Map<string, ComplianceGap[]> = new Map()

  async createProgram(data: Omit<ISOCompliance, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<ISOCompliance> {
    logger.info('Creating ISO compliance program', { standard: data.standard })

    const program: ISOCompliance = {
      ...data,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.programs.set(program.id, program)
    return program
  }

  async getProgram(id: string): Promise<ISOCompliance> {
    const program = this.programs.get(id)
    if (!program) {
      throw new NotFoundError('ISO Compliance Program', id)
    }
    return program
  }

  async listPrograms(): Promise<ISOCompliance[]> {
    return Array.from(this.programs.values())
  }

  async identifyGaps(programId: string): Promise<ComplianceGap[]> {
    const program = await this.getProgram(programId)
    
    logger.info('Identifying compliance gaps', { programId })

    // In production, this would analyze against ISO requirements
    const identifiedGaps: ComplianceGap[] = [
      {
        id: crypto.randomUUID(),
        requirement: 'Document Control',
        clause: 'ISO 17025:2017 8.3',
        currentStatus: 'partial',
        remediation: 'Implement document control system with version management',
        priority: 'high',
      },
      {
        id: crypto.randomUUID(),
        requirement: 'Management Review',
        clause: 'ISO 17025:2017 8.9',
        currentStatus: 'non-compliant',
        remediation: 'Schedule and conduct management review meetings',
        priority: 'critical',
      },
    ]

    this.gaps.set(programId, identifiedGaps)
    return identifiedGaps
  }

  async getAuditReadiness(programId: string): Promise<AuditReadinessScore> {
    const program = await this.getProgram(programId)
    const gaps = this.gaps.get(programId) || []
    
    logger.info('Calculating audit readiness', { programId })

    const criticalGaps = gaps.filter(g => g.priority === 'critical').length
    const highGaps = gaps.filter(g => g.priority === 'high').length
    const totalGaps = gaps.length

    // Calculate score (0-100)
    let score = 100
    score -= criticalGaps * 15
    score -= highGaps * 5
    score -= (totalGaps - criticalGaps - highGaps) * 2
    score = Math.max(0, score)

    let readinessLevel: 'ready' | 'mostly-ready' | 'needs-work' | 'not-ready'
    if (score >= 90) readinessLevel = 'ready'
    else if (score >= 75) readinessLevel = 'mostly-ready'
    else if (score >= 60) readinessLevel = 'needs-work'
    else readinessLevel = 'not-ready'

    const strengths = [
      'Strong quality management system foundation',
      'Experienced team with ISO knowledge',
      'Good documentation practices',
    ]

    const recommendations = [
      'Address critical gaps before audit',
      'Complete management review process',
      'Update quality manual',
    ]

    const estimatedDays = criticalGaps * 5 + highGaps * 2

    return {
      complianceId: programId,
      overallScore: score,
      readinessLevel,
      gaps,
      strengths,
      recommendations,
      estimatedDaysToReady: estimatedDays,
    }
  }

  async generateSOP(programId: string, requirement: string): Promise<string> {
    const program = await this.getProgram(programId)
    
    logger.info('Generating SOP', { programId, requirement })

    // In production, use AI/NLP to generate SOP from requirements
    return `# Standard Operating Procedure: ${requirement}

## Purpose
This procedure describes the process for ${requirement} in accordance with ${program.standard.toUpperCase()} requirements.

## Scope
${program.scope}

## Responsibilities
- Quality Manager: Overall responsibility
- Technical Staff: Implementation

## Procedure
1. Step one
2. Step two
3. Step three

## Records
- Document control records
- Training records

## References
- ${program.standard.toUpperCase()} Standard
- Quality Manual
`
  }

  async getMetrics(): Promise<ISOComplianceMetrics> {
    const allPrograms = Array.from(this.programs.values())
    const allGaps = Array.from(this.gaps.values()).flat()
    
    return {
      totalPrograms: allPrograms.length,
      compliant: allPrograms.filter(p => p.status === 'active').length,
      nonCompliant: allPrograms.filter(p => p.status === 'non-compliant').length,
      auditPending: allPrograms.filter(p => p.status === 'audit-pending').length,
      averageReadinessScore: 75, // Would calculate from readiness scores
      criticalGaps: allGaps.filter(g => g.priority === 'critical').length,
      byStandard: this.groupByStandard(allPrograms),
    }
  }

  private groupByStandard(programs: ISOCompliance[]): Record<string, number> {
    return programs.reduce((acc, p) => {
      acc[p.standard] = (acc[p.standard] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const isoComplianceService = new ISOComplianceService()

