import { SystemHealth, HealthAlert, FailurePrediction, HealthMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('health-monitoring')

export class HealthMonitoringService {
  async getSystemHealth(systemId: string): Promise<SystemHealth> {
    const system = await prisma.systemHealth.findUnique({
      where: { systemId },
    })

    if (!system) {
      throw new NotFoundError('System', systemId)
    }

    return {
      systemId: system.systemId,
      systemName: system.systemName,
      systemType: system.systemType as any,
      status: system.status as any,
      metrics: system.metrics ? JSON.parse(system.metrics) : undefined,
      alerts: system.alerts ? JSON.parse(system.alerts) : undefined,
      lastUpdated: system.lastUpdated.toISOString(),
    }
  }

  async getAllSystems(): Promise<SystemHealth[]> {
    const systems = await prisma.systemHealth.findMany({
      orderBy: { lastUpdated: 'desc' },
    })

    return systems.map(s => ({
      systemId: s.systemId,
      systemName: s.systemName,
      systemType: s.systemType as any,
      status: s.status as any,
      metrics: s.metrics ? JSON.parse(s.metrics) : undefined,
      alerts: s.alerts ? JSON.parse(s.alerts) : undefined,
      lastUpdated: s.lastUpdated.toISOString(),
    }))
  }

  async getHealthMetrics(): Promise<HealthMetrics> {
    const systems = await this.getAllSystems()
    const alerts = await this.getActiveAlerts()

    const systemCounts = {
      total: systems.length,
      healthy: systems.filter(s => s.status === 'healthy').length,
      degraded: systems.filter(s => s.status === 'degraded').length,
      critical: systems.filter(s => s.status === 'critical').length,
    }

    const alertCounts = {
      active: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      resolved24h: 0, // Would calculate from historical data
    }

    const predictions = await this.getPredictions()
    const predictionCounts = {
      highRisk: predictions.filter(p => p.confidence > 0.8).length,
      mediumRisk: predictions.filter(p => p.confidence > 0.5 && p.confidence <= 0.8).length,
    }

    return {
      timestamp: new Date().toISOString(),
      systems: systemCounts,
      alerts: alertCounts,
      predictions: predictionCounts,
    }
  }

  async getActiveAlerts(): Promise<HealthAlert[]> {
    // Alerts would be stored separately or in system health records
    // For now, return empty array - would need separate Alert model
    return []
  }

  async getPredictions(systemId?: string): Promise<FailurePrediction[]> {
    // Predictions would be stored separately
    // For now, return empty array - would need separate Prediction model
    return []
  }

  // Mock data initialization for demo
  async initializeMockData() {
    // Check if mock data already exists
    const existing = await prisma.systemHealth.findFirst()
    if (existing) return

    // Add some mock systems
    const mockSystems = [
      {
        systemId: 'sys-001',
        systemName: 'Production VxRail Cluster',
        systemType: 'hyperconverged',
        status: 'healthy',
        metrics: JSON.stringify({
          cpu: 45,
          memory: 62,
          disk: {
            usage: 78,
            iops: 1500,
            latency: 2.5,
          },
        }),
        alerts: null,
      },
      {
        systemId: 'sys-002',
        systemName: 'Unity Storage Array',
        systemType: 'storage-array',
        status: 'degraded',
        metrics: JSON.stringify({
          disk: {
            usage: 92,
            iops: 2100,
            latency: 5.2,
          },
        }),
        alerts: JSON.stringify([{
          id: 'alert-001',
          systemId: 'sys-002',
          severity: 'warning',
          title: 'High Disk Usage',
          message: 'Disk usage is at 92%, approaching capacity threshold',
          timestamp: new Date().toISOString(),
          acknowledged: false,
          resolved: false,
        }]),
      },
    ]

    for (const system of mockSystems) {
      await prisma.systemHealth.create({
        data: system,
      })
    }
  }
}

export const healthMonitoringService = new HealthMonitoringService()
// Initialize mock data for demo (async)
healthMonitoringService.initializeMockData().catch(err => {
  logger.error('Failed to initialize mock data', err)
})

