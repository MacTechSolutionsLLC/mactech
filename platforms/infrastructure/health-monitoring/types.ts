import { z } from 'zod'

export const systemHealthSchema = z.object({
  systemId: z.string().uuid(),
  systemName: z.string(),
  systemType: z.enum(['storage-array', 'hyperconverged', 'network', 'compute']),
  status: z.enum(['healthy', 'degraded', 'critical', 'unknown']),
  metrics: z.object({
    cpu: z.number().min(0).max(100).optional(),
    memory: z.number().min(0).max(100).optional(),
    disk: z.object({
      usage: z.number().min(0).max(100),
      iops: z.number().optional(),
      latency: z.number().optional(),
    }).optional(),
    network: z.object({
      throughput: z.number().optional(),
      latency: z.number().optional(),
    }).optional(),
  }),
  lastUpdated: z.string().datetime(),
})

export type SystemHealth = z.infer<typeof systemHealthSchema> & {
  alerts?: HealthAlert[]
}

export interface HealthAlert {
  id: string
  systemId: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  timestamp: string
  acknowledged: boolean
  resolved: boolean
}

export interface FailurePrediction {
  systemId: string
  component: string
  predictedFailureDate: string
  confidence: number
  riskFactors: string[]
  recommendedActions: string[]
}

export interface HealthMetrics {
  timestamp: string
  systems: {
    total: number
    healthy: number
    degraded: number
    critical: number
  }
  alerts: {
    active: number
    critical: number
    resolved24h: number
  }
  predictions: {
    highRisk: number
    mediumRisk: number
  }
}

