import { RMFRequirement, BOEPlan, RMFTraceability, RMFMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('rmf-management')

export class RMFManagementService {
  async createRequirement(data: Omit<RMFRequirement, 'id' | 'createdAt' | 'updatedAt'>): Promise<RMFRequirement> {
    logger.info('Creating RMF requirement', { controlId: data.controlId, systemId: data.systemId })

    const requirement = await prisma.rMFRequirement.create({
      data: {
        systemId: data.systemId,
        controlId: data.controlId,
        title: data.title,
        implementationStatus: data.implementationStatus,
        traceabilityId: data.traceabilityId || null,
      },
    })

    return {
      id: requirement.id,
      systemId: requirement.systemId,
      controlId: requirement.controlId,
      title: requirement.title,
      description: '', // Would come from metadata or control library
      implementationStatus: requirement.implementationStatus as any,
      traceabilityId: requirement.traceabilityId || undefined,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    }
  }

  async getRequirement(id: string): Promise<RMFRequirement> {
    const requirement = await prisma.rMFRequirement.findUnique({
      where: { id },
    })

    if (!requirement) {
      throw new NotFoundError('RMF Requirement', id)
    }

    return {
      id: requirement.id,
      systemId: requirement.systemId,
      controlId: requirement.controlId,
      title: requirement.title,
      description: '', // Would come from metadata or control library
      implementationStatus: requirement.implementationStatus as any,
      traceabilityId: requirement.traceabilityId || undefined,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    }
  }

  async listRequirements(systemId?: string): Promise<RMFRequirement[]> {
    const where = systemId ? { systemId } : {}
    const requirements = await prisma.rMFRequirement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return requirements.map(r => ({
      id: r.id,
      systemId: r.systemId,
      controlId: r.controlId,
      title: r.title,
      description: '', // Would come from metadata or control library
      implementationStatus: r.implementationStatus as any,
      traceabilityId: r.traceabilityId || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  }

  async generateBOEPlan(requirementId: string): Promise<BOEPlan> {
    const requirement = await this.getRequirement(requirementId)
    
    logger.info('Generating BOE plan', { requirementId })

    const boePlan = await prisma.bOEPlan.create({
      data: {
        systemId: requirement.systemId,
        controlId: requirement.controlId,
        evidenceType: 'Configuration Documentation',
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    return {
      id: boePlan.id,
      systemId: boePlan.systemId,
      controlId: boePlan.controlId,
      evidenceType: boePlan.evidenceType,
      evidenceDescription: `Evidence for ${requirement.title}`,
      collectionMethod: 'Automated collection from system',
      responsibleParty: 'System Administrator',
      dueDate: boePlan.dueDate.toISOString(),
      status: boePlan.status as any,
    }
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
    
    const updated = await prisma.rMFRequirement.update({
      where: { id: requirementId },
      data: {
        implementationStatus: status,
      },
    })

    logger.info('Control adjudicated', { requirementId, status })
    
    return {
      id: updated.id,
      systemId: updated.systemId,
      controlId: updated.controlId,
      title: updated.title,
      description: '', // Would come from metadata
      implementationStatus: updated.implementationStatus as any,
      traceabilityId: updated.traceabilityId || undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }
  }

  async getMetrics(systemId?: string): Promise<RMFMetrics> {
    const requirements = systemId 
      ? await this.listRequirements(systemId)
      : await this.listRequirements()

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

