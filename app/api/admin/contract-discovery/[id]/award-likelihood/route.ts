import { NextRequest, NextResponse } from 'next/server'
import { calculateAwardLikelihood } from '@/lib/ai/contract-scoring'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Calculate award likelihood for a contract
 * GET /api/admin/contract-discovery/[id]/award-likelihood
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const contractId = typeof params === 'object' && 'then' in params ? (await params).id : params.id
    
    // Check if contract exists
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Calculate award likelihood
    const result = await calculateAwardLikelihood(contractId)

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to calculate award likelihood. OpenAI may not be configured.' },
        { status: 500 }
      )
    }

    // Save to database
    await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        aiAwardLikelihood: result.score,
        aiAwardConfidence: result.confidence,
        aiAwardReasoning: result.reasoning,
        aiAwardStrengths: JSON.stringify(result.strengths),
        aiAwardConcerns: JSON.stringify(result.concerns),
        aiAwardRiskFactors: JSON.stringify(result.riskFactors),
        aiAwardRecommendations: JSON.stringify(result.recommendations),
        aiAwardLikelihoodGeneratedAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true, 
      result,
      message: 'Award likelihood calculated successfully'
    })
  } catch (error: any) {
    console.error('Error calculating award likelihood:', error)
    return NextResponse.json(
      { error: 'Failed to calculate award likelihood', details: error.message },
      { status: 500 }
    )
  }
}

