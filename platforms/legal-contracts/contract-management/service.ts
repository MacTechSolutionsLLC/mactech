import { Contract, ContractObligation, ContractRiskAnalysis, ContractMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'

const logger = createLogger('contract-management')

export class ContractManagementService {
  private contracts: Map<string, Contract> = new Map()
  private obligations: Map<string, ContractObligation[]> = new Map()

  async createContract(data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    logger.info('Creating contract', { title: data.title, type: data.type })

    const contract: Contract = {
      ...data,
      id: crypto.randomUUID(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: data.endDate,
    }

    this.contracts.set(contract.id, contract)
    return contract
  }

  async getContract(id: string): Promise<Contract> {
    const contract = this.contracts.get(id)
    if (!contract) {
      throw new NotFoundError('Contract', id)
    }
    return contract
  }

  async listContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values())
  }

  async analyzeRisk(contractId: string): Promise<ContractRiskAnalysis> {
    const contract = await this.getContract(contractId)
    
    logger.info('Analyzing contract risk', { contractId })

    // In production, use AI/NLP to analyze contract terms
    const riskFactors = [
      {
        factor: 'Payment Terms',
        severity: 'medium' as const,
        description: 'Net 60 payment terms may impact cash flow',
        mitigation: 'Negotiate Net 30 terms or add early payment discount',
      },
      {
        factor: 'Termination Clause',
        severity: 'high' as const,
        description: 'Limited termination rights for vendor',
        mitigation: 'Add termination for convenience clause',
      },
    ]

    const riskScore = this.calculateRiskScore(riskFactors)
    const overallRisk = riskScore >= 75 ? 'critical' : riskScore >= 50 ? 'high' : riskScore >= 25 ? 'medium' : 'low'

    const recommendations = [
      'Review payment terms with finance team',
      'Add termination for convenience clause',
      'Include performance metrics in contract',
    ]

    // Update contract with risk score
    contract.riskScore = riskScore
    this.contracts.set(contractId, contract)

    return {
      contractId,
      overallRisk,
      riskScore,
      riskFactors,
      recommendations,
    }
  }

  async getObligations(contractId: string): Promise<ContractObligation[]> {
    return this.obligations.get(contractId) || []
  }

  async addObligation(contractId: string, obligation: Omit<ContractObligation, 'id' | 'contractId'>): Promise<ContractObligation> {
    await this.getContract(contractId) // Verify contract exists
    
    const newObligation: ContractObligation = {
      ...obligation,
      id: crypto.randomUUID(),
      contractId,
    }

    const obligations = this.obligations.get(contractId) || []
    obligations.push(newObligation)
    this.obligations.set(contractId, obligations)

    logger.info('Added obligation', { contractId, obligationId: newObligation.id })
    return newObligation
  }

  async getMetrics(): Promise<ContractMetrics> {
    const allContracts = Array.from(this.contracts.values())
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const allObligations = Array.from(this.obligations.values()).flat()
    
    return {
      total: allContracts.length,
      active: allContracts.filter(c => c.status === 'active').length,
      expiring: allContracts.filter(c => {
        if (!c.expiresAt) return false
        const expires = new Date(c.expiresAt)
        return expires > now && expires <= thirtyDaysFromNow
      }).length,
      highRisk: allContracts.filter(c => (c.riskScore || 0) >= 50).length,
      overdueObligations: allObligations.filter(o => {
        if (o.status === 'completed') return false
        return new Date(o.dueDate) < now
      }).length,
      byType: this.groupByType(allContracts),
    }
  }

  private calculateRiskScore(factors: ContractRiskAnalysis['riskFactors']): number {
    let score = 0
    factors.forEach(f => {
      if (f.severity === 'critical') score += 30
      else if (f.severity === 'high') score += 20
      else if (f.severity === 'medium') score += 10
      else score += 5
    })
    return Math.min(100, score)
  }

  private groupByType(contracts: Contract[]): Record<string, number> {
    return contracts.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const contractManagementService = new ContractManagementService()

