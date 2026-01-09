import { z } from 'zod'

export const networkTopologySchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  zones: z.array(z.object({
    name: z.string(),
    securityLevel: z.enum(['public', 'dmz', 'internal', 'restricted']),
    subnets: z.array(z.string()),
  })),
  requirements: z.record(z.any()).optional(),
})

export type NetworkTopology = z.infer<typeof networkTopologySchema> & {
  id: string
  status: 'draft' | 'validating' | 'approved' | 'deployed'
  createdAt: string
  updatedAt: string
}

export interface FirewallRule {
  id: string
  topologyId: string
  source: string
  destination: string
  port: string
  protocol: 'tcp' | 'udp' | 'icmp' | 'all'
  action: 'allow' | 'deny'
  description: string
}

export interface NetworkComplianceResult {
  valid: boolean
  errors: Array<{ rule: string; message: string }>
  warnings: Array<{ rule: string; message: string }>
  stigCompliance: Array<{ control: string; status: 'pass' | 'fail' | 'not-applicable' }>
}

export interface NetworkMetrics {
  totalTopologies: number
  deployed: number
  compliant: number
  nonCompliant: number
  averageComplianceScore: number
}

