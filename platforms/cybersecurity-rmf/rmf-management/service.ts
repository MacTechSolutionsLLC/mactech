import { RMFRequirement, BOEPlan, RMFTraceability, RMFMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('rmf-management')

export class RMFManagementService {
  private requirements: Map<string, RMFRequirement> = new Map()
  private boePlans: Map<string, BOEPlan[]> = new Map()
  private traceability: Map<string, RMFTraceability[]> = new Map()

  async createRequirement(data: Omit<RMFRequirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<RMFRequirement> {
    logger.info('Creating RMF requirement', { controlId: data.controlId, systemId: data.systemId })

    const requirement: RMFRequirement = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.requirements.set(requirement.id, requirement)
    return requirement
  }

  async getRequirement(id: string): Promise<RMFRequirement> {
    const requirement = this.requirements.get(id)
    if (!requirement) {
      throw new NotFoundError('RMF Requirement', id)
    }
    return requirement
  }

  async listRequirements(systemId?: string): Promise<RMFRequirement[]> {
    const all = Array.from(this.requirements.values())
    return systemId ? all.filter(r => r.systemId === systemId) : all
  }

  async generateBOEPlan(requirementId: string): Promise<BOEPlan> {
    const requirement = await this.getRequirement(requirementId)
    
    logger.info('Generating BOE plan', { requirementId })

    const boePlan: BOEPlan = {
      id: crypto.randomUUID(),
      systemId: requirement.systemId,
      controlId: requirement.controlId,
      evidenceType: 'Configuration Documentation',
      evidenceDescription: `Evidence for ${requirement.title}`,
      collectionMethod: 'Automated collection from system',
      responsibleParty: 'System Administrator',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
    }

    const plans = this.boePlans.get(requirement.systemId) || []
    plans.push(boePlan)
    this.boePlans.set(requirement.systemId, plans)

    return boePlan
  }

  async getTraceability(systemId: string): Promise<RMFTraceability[]> {
    const requirements = await this.listRequirements(systemId)
    
    return requirements.map(req => {
      const trace: RMFTraceability = {
        requirementId: req.id,
        controlId: req.controlId,
        systemComponent: 'System Component',
        implementation: req.implementationStatus,
        evidence: req.evidenceRequired || [],
        testResults: [],
        status: req.implementationStatus === 'authorized' ? 'complete' : 
                req.implementationStatus === 'implemented' ? 'partial' : 'missing',
      }
      return trace
    })
  }

  async adjudicateControl(requirementId: string, status: RMFRequirement['implementationStatus']): Promise<RMFRequirement> {
    const requirement = await this.getRequirement(requirementId)
    
    requirement.implementationStatus = status
    requirement.updatedAt = new Date().toISOString()
    this.requirements.set(requirementId, requirement)

    logger.info('Control adjudicated', { requirementId, status })
    return requirement
  }

  async getMetrics(systemId?: string): Promise<RMFMetrics> {
    const requirements = systemId 
      ? await this.listRequirements(systemId)
      : Array.from(this.requirements.values())

    return {
      totalRequirements: requirements.length,
      implemented: requirements.filter(r => r.implementationStatus === 'implemented').length,
      inProgress: requirements.filter(r => r.implementationStatus === 'in-progress').length,
      notStarted: requirements.filter(r => r.implementationStatus === 'not-started').length,
      authorized: requirements.filter(r => r.implementationStatus === 'authorized').length,
      averageImplementationProgress: this.calculateProgress(requirements),
      byStatus: this.groupByStatus(requirements),
    }
  }

  private calculateProgress(requirements: RMFRequirement[]): number {
    if (requirements.length === 0) return 0
    
    const weights = {
      'not-started': 0,
      'in-progress': 25,
      'implemented': 50,
      'tested': 75,
      'authorized': 100,
    }

    const total = requirements.reduce((sum, r) => sum + (weights[r.implementationStatus] || 0), 0)
    return total / requirements.length
  }

  private groupByStatus(requirements: RMFRequirement[]): Record<string, number> {
    return requirements.reduce((acc, r) => {
      acc[r.implementationStatus] = (acc[r.implementationStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const rmfManagementService = new RMFManagementService()

