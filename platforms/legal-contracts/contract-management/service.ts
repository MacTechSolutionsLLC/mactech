import { Contract, ContractObligation, ContractRiskAnalysis, ContractMetrics } from './types'
import { createLogger } from '../../shared/logger'
import { NotFoundError } from '../../shared/errors'
import { prisma } from '../../shared/db'

const logger = createLogger('contract-management')

export class ContractManagementService {
  async createContract(data: Omit<Contract, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Contract> {
    logger.info('Creating contract', { title: data.title, type: data.type })

    const metadataToStore = {
      ...data.metadata,
      parties: data.parties,
      value: data.value,
    }
    
    const contract = await prisma.contract.create({
      data: {
        title: data.title,
        type: data.type,
        status: 'draft',
        riskScore: data.riskScore || null,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        expiresAt: data.endDate ? new Date(data.endDate) : null,
        signedAt: data.signedAt ? new Date(data.signedAt) : null,
        metadata: JSON.stringify(metadataToStore),
      },
    })

    return this.mapToContract(contract)
  }

  async getContract(id: string): Promise<Contract> {
    const contract = await prisma.contract.findUnique({
      where: { id },
    })

    if (!contract) {
      throw new NotFoundError('Contract', id)
    }

    return this.mapToContract(contract)
  }

  async listContracts(): Promise<Contract[]> {
    const contracts = await prisma.contract.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return contracts.map(c => this.mapToContract(c))
  }

  private mapToContract(dbContract: any): Contract {
    const metadata = dbContract.metadata ? JSON.parse(dbContract.metadata) : {}
    const parties = metadata.parties || [
      { name: 'MacTech Solutions', role: 'vendor' as const, contact: 'contact@mactech-solutions.com' },
      { name: 'Client', role: 'client' as const, contact: 'client@example.com' },
    ]
    
    return {
      id: dbContract.id,
      title: dbContract.title,
      type: dbContract.type as any,
      parties,
      status: dbContract.status as any,
      riskScore: dbContract.riskScore || undefined,
      startDate: dbContract.startDate.toISOString(),
      endDate: dbContract.endDate?.toISOString(),
      expiresAt: dbContract.expiresAt?.toISOString(),
      signedAt: dbContract.signedAt?.toISOString(),
      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
      createdAt: dbContract.createdAt.toISOString(),
      updatedAt: dbContract.updatedAt.toISOString(),
    }
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
    await prisma.contract.update({
      where: { id: contractId },
      data: { riskScore },
    })

    return {
      contractId,
      overallRisk,
      riskScore,
      riskFactors,
      recommendations,
    }
  }

  async getObligations(contractId: string): Promise<ContractObligation[]> {
    const obligations = await prisma.contractObligation.findMany({
      where: { contractId },
      orderBy: { dueDate: 'asc' },
    })

    return obligations.map(o => ({
      id: o.id,
      contractId: o.contractId,
      description: o.description,
      type: o.type as any,
      dueDate: o.dueDate.toISOString(),
      status: o.status as any,
      completedAt: o.completedAt?.toISOString(),
    }))
  }

  async addObligation(contractId: string, obligation: Omit<ContractObligation, 'id' | 'contractId'>): Promise<ContractObligation> {
    await this.getContract(contractId) // Verify contract exists
    
    const newObligation = await prisma.contractObligation.create({
      data: {
        contractId,
        description: obligation.description,
        type: obligation.type,
        dueDate: new Date(obligation.dueDate),
        status: obligation.status,
        completedAt: obligation.completedAt ? new Date(obligation.completedAt) : null,
      },
    })

    logger.info('Added obligation', { contractId, obligationId: newObligation.id })
    
    return {
      id: newObligation.id,
      contractId: newObligation.contractId,
      description: newObligation.description,
      type: newObligation.type as any,
      dueDate: newObligation.dueDate.toISOString(),
      status: newObligation.status as any,
      completedAt: newObligation.completedAt?.toISOString(),
    }
  }

  async getMetrics(): Promise<ContractMetrics> {
    const allContracts = await prisma.contract.findMany()
    const now = new Date()
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    const allObligations = await prisma.contractObligation.findMany()
    
    return {
      total: allContracts.length,
      active: allContracts.filter(c => c.status === 'active').length,
      expiring: allContracts.filter(c => {
        if (!c.expiresAt) return false
        return c.expiresAt > now && c.expiresAt <= thirtyDaysFromNow
      }).length,
      highRisk: allContracts.filter(c => (c.riskScore || 0) >= 50).length,
      overdueObligations: allObligations.filter(o => {
        if (o.status === 'completed') return false
        return o.dueDate < now
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

  private groupByType(contracts: any[]): Record<string, number> {
    return contracts.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

export const contractManagementService = new ContractManagementService()

