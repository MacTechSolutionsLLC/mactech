import { z } from 'zod'

export const deploymentSchema = z.object({
  name: z.string().min(1).max(255),
  architecture: z.enum(['web-application', 'database', 'cloud-environment', 'network-security']),
  storageType: z.enum(['VxRail', 'Unity', 'XtremIO', 'VNX', 'Custom']),
  vmwareConfig: z.object({
    hosts: z.array(z.string()).min(1),
    datastores: z.array(z.string()).optional(),
    networks: z.array(z.string()).optional(),
  }),
  networkConfig: z.object({
    subnets: z.array(z.string()),
    firewallRules: z.array(z.any()).optional(),
  }),
  compliance: z.object({
    stigProfile: z.string(),
    validatePreDeploy: z.boolean().default(true),
  }),
  metadata: z.record(z.any()).optional(),
})

export type Deployment = z.infer<typeof deploymentSchema> & {
  id: string
  status: 'draft' | 'validating' | 'deploying' | 'deployed' | 'failed'
  systemId?: string
  createdAt: string
  updatedAt: string
  deployedAt?: string
}

export interface DeploymentTemplate {
  id: string
  name: string
  description: string
  architecture: string
  defaultConfig: Partial<Deployment>
}

export interface DeploymentValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
  warnings: Array<{ field: string; message: string }>
  complianceChecks: Array<{ control: string; status: 'pass' | 'fail' | 'warning' }>
}

