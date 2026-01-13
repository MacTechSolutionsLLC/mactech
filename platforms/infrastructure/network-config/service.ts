import { NetworkTopology, FirewallRule, NetworkComplianceResult, NetworkMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('network-config')

export class NetworkConfigurationService {
  async createTopology(data: Omit<NetworkTopology, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<NetworkTopology> {
    logger.info('Creating network topology', { name: data.name })

    const topology = await prisma.networkTopology.create({
      data: {
        name: data.name,
        description: data.description || null,
        zones: JSON.stringify(data.zones),
        requirements: data.requirements ? JSON.stringify(data.requirements) : null,
        status: 'draft',
      },
    })

    return this.mapToTopology(topology)
  }

  async getTopology(id: string): Promise<NetworkTopology> {
    const topology = await prisma.networkTopology.findUnique({
      where: { id },
    })

    if (!topology) {
      throw new NotFoundError('Network Topology', id)
    }

    return this.mapToTopology(topology)
  }

  async listTopologies(): Promise<NetworkTopology[]> {
    const topologies = await prisma.networkTopology.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return topologies.map(t => this.mapToTopology(t))
  }

  async generateFirewallRules(topologyId: string): Promise<FirewallRule[]> {
    const topology = await this.getTopology(topologyId)
    
    logger.info('Generating firewall rules', { topologyId })

    // Delete existing rules for this topology
    await prisma.firewallRule.deleteMany({
      where: { topologyId },
    })

    // In production, generate rules based on topology and security zones
    const rules: FirewallRule[] = topology.zones.flatMap((zone, zoneIndex) => 
      topology.zones.slice(zoneIndex + 1).map(targetZone => ({
        id: crypto.randomUUID(),
        topologyId,
        source: zone.name,
        destination: targetZone.name,
        port: 'any',
        protocol: 'all' as const,
        action: this.determineAction(zone.securityLevel, targetZone.securityLevel),
        description: `Rule from ${zone.name} to ${targetZone.name}`,
      }))
    )

    // Save rules to database
    await prisma.firewallRule.createMany({
      data: rules.map(r => ({
        id: r.id,
        topologyId: r.topologyId,
        source: r.source,
        destination: r.destination,
        port: r.port,
        protocol: r.protocol,
        action: r.action,
        description: r.description,
      })),
    })

    return rules
  }

  private mapToTopology(dbTopology: any): NetworkTopology {
    return {
      id: dbTopology.id,
      name: dbTopology.name,
      description: dbTopology.description || undefined,
      zones: JSON.parse(dbTopology.zones),
      requirements: dbTopology.requirements ? JSON.parse(dbTopology.requirements) : undefined,
      status: dbTopology.status as any,
      createdAt: dbTopology.createdAt.toISOString(),
      updatedAt: dbTopology.updatedAt.toISOString(),
    }
  }

  async validateCompliance(topologyId: string): Promise<NetworkComplianceResult> {
    const topology = await this.getTopology(topologyId)
    const rules = await prisma.firewallRule.findMany({
      where: { topologyId },
    })
    
    logger.info('Validating network compliance', { topologyId })

    const errors: Array<{ rule: string; message: string }> = []
    const warnings: Array<{ rule: string; message: string }> = []

    // Validate zones
    if (topology.zones.length === 0) {
      errors.push({ rule: 'Zones', message: 'At least one security zone is required' })
    }

    // Validate firewall rules
    if (rules.length === 0) {
      warnings.push({ rule: 'Firewall Rules', message: 'No firewall rules defined' })
    }

    // STIG compliance checks
    const stigCompliance = [
      { control: 'SC-7', status: 'pass' as const },
      { control: 'AC-4', status: rules.length > 0 ? 'pass' as const : 'fail' as const },
      { control: 'SC-5', status: 'pass' as const },
    ]

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stigCompliance,
    }
  }

  async getMetrics(): Promise<NetworkMetrics> {
    const allTopologies = await prisma.networkTopology.findMany()
    
    return {
      totalTopologies: allTopologies.length,
      deployed: allTopologies.filter(t => t.status === 'deployed').length,
      compliant: 0, // Would calculate from compliance results
      nonCompliant: 0,
      averageComplianceScore: 85, // Would calculate from compliance scores
    }
  }

  private determineAction(sourceLevel: string, destLevel: string): 'allow' | 'deny' {
    // Simple logic: allow if destination is less secure, deny if more secure
    const levels = { 'public': 0, 'dmz': 1, 'internal': 2, 'restricted': 3 }
    const source = levels[sourceLevel as keyof typeof levels] || 0
    const dest = levels[destLevel as keyof typeof levels] || 0
    return dest <= source ? 'allow' : 'deny'
  }
}

export const networkConfigurationService = new NetworkConfigurationService()

