import { MetrologyProject, CalibrationSchedule, MeasurementUncertainty, TraceabilityChain, MetrologyMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('metrology-management')

export class MetrologyManagementService {
  async createProject(data: Omit<MetrologyProject, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<MetrologyProject> {
    logger.info('Creating metrology project', { projectName: data.projectName })

    const metadataToStore = {
      ...data.metadata,
      calibrationType: data.calibrationType,
      priority: data.priority,
      equipmentName: data.equipmentName,
    }
    
    const project = await prisma.metrologyProject.create({
      data: {
        projectName: data.projectName,
        equipmentId: data.equipmentId || null,
        status: 'pending',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        metadata: JSON.stringify(metadataToStore),
      },
    })

    const metadata = JSON.parse(project.metadata || '{}')
    return {
      id: project.id,
      projectName: project.projectName,
      equipmentId: project.equipmentId || undefined,
      calibrationType: metadata.calibrationType || 'General',
      priority: metadata.priority || 'medium' as const,
      equipmentName: metadata.equipmentName,
      status: project.status as any,
      dueDate: project.dueDate?.toISOString(),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }

  async getProject(id: string): Promise<MetrologyProject> {
    const project = await prisma.metrologyProject.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundError('Metrology Project', id)
    }

    const metadata = project.metadata ? JSON.parse(project.metadata) : {}
    return {
      id: project.id,
      projectName: project.projectName,
      equipmentId: project.equipmentId || undefined,
      calibrationType: metadata.calibrationType || 'General',
      priority: metadata.priority || 'medium' as const,
      equipmentName: metadata.equipmentName,
      status: project.status as any,
      dueDate: project.dueDate?.toISOString(),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }
  }

  async listProjects(): Promise<MetrologyProject[]> {
    const projects = await prisma.metrologyProject.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return projects.map(p => {
      const metadata = p.metadata ? JSON.parse(p.metadata) : {}
      return {
        id: p.id,
        projectName: p.projectName,
        equipmentId: p.equipmentId || undefined,
        calibrationType: metadata.calibrationType || 'General',
        priority: metadata.priority || 'medium' as const,
        equipmentName: metadata.equipmentName,
        status: p.status as any,
        dueDate: p.dueDate?.toISOString(),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }
    })
  }

  async getCalibrationSchedule(equipmentId?: string): Promise<CalibrationSchedule[]> {
    // Note: CalibrationSchedule is not persisted in database - return mock data for now
    // In production, this would query a dedicated CalibrationSchedule model
    if (equipmentId) {
      return [{
        equipmentId,
        equipmentName: 'Equipment ' + equipmentId,
        lastCalibration: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextCalibration: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(),
        interval: 365,
        status: 'current' as const,
      }]
    }
    return []
  }

  async calculateUncertainty(measurementId: string, value: number): Promise<MeasurementUncertainty> {
    logger.info('Calculating measurement uncertainty', { measurementId })

    // In production, use proper uncertainty calculation methods (GUM)
    const uncertainty = value * 0.01 // 1% uncertainty for example
    const confidence = 95

    return {
      measurementId,
      value,
      uncertainty,
      confidence,
      contributors: [
        { source: 'Instrument accuracy', contribution: 0.6 },
        { source: 'Environmental factors', contribution: 0.3 },
        { source: 'Operator variability', contribution: 0.1 },
      ],
    }
  }

  async getTraceability(equipmentId: string): Promise<TraceabilityChain> {
    logger.info('Getting traceability chain', { equipmentId })

    // In production, query traceability database
    return {
      equipmentId,
      chain: [
        {
          level: 1,
          standard: 'NIST Standard',
          certificate: 'CERT-001',
          date: '2024-01-01',
        },
        {
          level: 2,
          standard: 'Calibration Lab Standard',
          certificate: 'CERT-002',
          date: '2024-06-01',
        },
        {
          level: 3,
          standard: 'Equipment Calibration',
          certificate: 'CERT-003',
          date: '2024-12-01',
        },
      ],
    }
  }

  async getMetrics(): Promise<MetrologyMetrics> {
    const allProjects = await prisma.metrologyProject.findMany()
    const mappedProjects = allProjects.map(p => {
      const metadata = p.metadata ? JSON.parse(p.metadata) : {}
      return {
        id: p.id,
        projectName: p.projectName,
        equipmentId: p.equipmentId || undefined,
        calibrationType: metadata.calibrationType || 'General',
        priority: metadata.priority || 'medium' as const,
        equipmentName: metadata.equipmentName,
        status: p.status as any,
        dueDate: p.dueDate?.toISOString(),
        metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }
    })
    
    return {
      totalProjects: mappedProjects.length,
      pending: mappedProjects.filter(p => p.status === 'pending').length,
      inProgress: mappedProjects.filter(p => p.status === 'in-progress').length,
      completed: mappedProjects.filter(p => p.status === 'completed').length,
      overdue: mappedProjects.filter(p => p.status === 'overdue').length,
      averageCompletionTime: 7.5, // days
      byPriority: this.groupByPriority(mappedProjects),
    }
  }

  private groupByPriority(projects: MetrologyProject[]): Record<string, number> {
    return projects.reduce((acc, p) => {
      acc[p.priority] = (acc[p.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const metrologyManagementService = new MetrologyManagementService()

