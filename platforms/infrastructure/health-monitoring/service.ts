import { SystemHealth, HealthAlert, FailurePrediction, HealthMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('health-monitoring')

export class HealthMonitoringService {
  private systems: Map<string, SystemHealth> = new Map()
  private alerts: Map<string, HealthAlert> = new Map()
  private predictions: Map<string, FailurePrediction> = new Map()

  async getSystemHealth(systemId: string): Promise<SystemHealth> {
    const system = this.systems.get(systemId)
    if (!system) {
      throw new NotFoundError('System', systemId)
    }
    return system
  }

  async getAllSystems(): Promise<SystemHealth[]> {
    return Array.from(this.systems.values())
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
    return Array.from(this.alerts.values()).filter(a => !a.resolved)
  }

  async getPredictions(systemId?: string): Promise<FailurePrediction[]> {
    const allPredictions = Array.from(this.predictions.values())
    if (systemId) {
      return allPredictions.filter(p => p.systemId === systemId)
    }
    return allPredictions
  }

  // Mock data initialization for demo
  initializeMockData() {
    // Add some mock systems
    const mockSystems: SystemHealth[] = [
      {
        systemId: 'sys-001',
        systemName: 'Production VxRail Cluster',
        systemType: 'hyperconverged',
        status: 'healthy',
        metrics: {
          cpu: 45,
          memory: 62,
          disk: {
            usage: 78,
            iops: 1500,
            latency: 2.5,
          },
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        systemId: 'sys-002',
        systemName: 'Unity Storage Array',
        systemType: 'storage-array',
        status: 'degraded',
        metrics: {
          disk: {
            usage: 92,
            iops: 2100,
            latency: 5.2,
          },
        },
        lastUpdated: new Date().toISOString(),
      },
    ]

    mockSystems.forEach(system => {
      this.systems.set(system.systemId, system)
    })

    // Add mock alerts
    const mockAlert: HealthAlert = {
      id: 'alert-001',
      systemId: 'sys-002',
      severity: 'warning',
      title: 'High Disk Usage',
      message: 'Disk usage is at 92%, approaching capacity threshold',
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
    }
    this.alerts.set(mockAlert.id, mockAlert)

    // Add mock predictions
    const mockPrediction: FailurePrediction = {
      systemId: 'sys-002',
      component: 'Storage Controller',
      predictedFailureDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.75,
      riskFactors: ['High disk usage', 'Elevated latency', 'Age: 4.5 years'],
      recommendedActions: ['Schedule maintenance', 'Review capacity planning', 'Consider upgrade'],
    }
    this.predictions.set('pred-001', mockPrediction)
  }
}

export const healthMonitoringService = new HealthMonitoringService()
// Initialize mock data for demo
healthMonitoringService.initializeMockData()

