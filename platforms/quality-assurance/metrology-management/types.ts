import { z } from 'zod'

export const metrologyProjectSchema = z.object({
  projectName: z.string().min(1).max(255),
  equipmentId: z.string().uuid().optional(),
  equipmentName: z.string().optional(),
  calibrationType: z.string(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  metadata: z.record(z.any()).optional(),
})

export type MetrologyProject = z.infer<typeof metrologyProjectSchema> & {
  id: string
  status: 'pending' | 'scheduled' | 'in-progress' | 'completed' | 'overdue'
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface CalibrationSchedule {
  equipmentId: string
  equipmentName: string
  lastCalibration: string
  nextCalibration: string
  interval: number // days
  status: 'current' | 'due-soon' | 'overdue'
}

export interface MeasurementUncertainty {
  measurementId: string
  value: number
  uncertainty: number
  confidence: number
  contributors: Array<{ source: string; contribution: number }>
}

export interface TraceabilityChain {
  equipmentId: string
  chain: Array<{
    level: number
    standard: string
    certificate: string
    date: string
  }>
}

export interface MetrologyMetrics {
  totalProjects: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
  averageCompletionTime: number
  byPriority: Record<string, number>
}



