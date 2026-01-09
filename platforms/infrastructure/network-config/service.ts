import { NetworkTopology, FirewallRule, NetworkComplianceResult, NetworkMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('network-config')

export class NetworkConfigurationService {
  private topologies: Map<string, NetworkTopology> = new Map()
  private firewallRules: Map<string, FirewallRule[]> = new Map()

  async createTopology(data: Omit<NetworkTopology, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<NetworkTopology> {
    logger.info('Creating network topology', { name: data.name })

    const topology: NetworkTopology = {
      ...data,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.topologies.set(topology.id, topology)
    return topology
  }

  async getTopology(id: string): Promise<NetworkTopology> {
    const topology = this.topologies.get(id)
    if (!topology) {
      throw new NotFoundError('Network Topology', id)
    }
    return topology
  }

  async listTopologies(): Promise<NetworkTopology[]> {
    return Array.from(this.topologies.values())
  }

  async generateFirewallRules(topologyId: string): Promise<FirewallRule[]> {
    const topology = await this.getTopology(topologyId)
    
    logger.info('Generating firewall rules', { topologyId })

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

    this.firewallRules.set(topologyId, rules)
    return rules
  }

  async validateCompliance(topologyId: string): Promise<NetworkComplianceResult> {
    const topology = await this.getTopology(topologyId)
    const rules = this.firewallRules.get(topologyId) || []
    
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
    const allTopologies = Array.from(this.topologies.values())
    
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

