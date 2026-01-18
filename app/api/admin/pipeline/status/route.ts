/**
 * Pipeline Status API
 * 
 * GET /api/admin/pipeline/status?contract_id=xxx
 * GET /api/admin/pipeline/status (returns stats for all contracts)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPipelineStatus } from '@/lib/services/unified-pipeline'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contractId = searchParams.get('contract_id')

    if (contractId) {
      // Get status for specific contract
      const status = await getPipelineStatus(contractId)
      
      if (!status) {
        return NextResponse.json(
          { success: false, error: 'Contract not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        contract_id: contractId,
        status,
      })
    } else {
      // Get pipeline statistics for all contracts
      const [
        totalContracts,
        byStatus,
        autoProcessed,
        withErrors,
      ] = await Promise.all([
        prisma.governmentContractDiscovery.count(),
        prisma.governmentContractDiscovery.groupBy({
          by: ['pipeline_status'],
          _count: true,
        }),
        prisma.governmentContractDiscovery.count({
          where: { auto_processed: true },
        }),
        prisma.governmentContractDiscovery.count({
          where: {
            pipeline_errors: {
              not: '[]',
            },
          },
        }),
      ])

      const statusMap: Record<string, number> = {}
      byStatus.forEach(item => {
        statusMap[item.pipeline_status || 'discovered'] = item._count
      })

      return NextResponse.json({
        success: true,
        stats: {
          total: totalContracts,
          by_status: statusMap,
          auto_processed: autoProcessed,
          with_errors: withErrors,
        },
      })
    }
  } catch (error) {
    console.error('[Pipeline Status API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

