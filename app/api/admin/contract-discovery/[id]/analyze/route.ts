import { NextRequest, NextResponse } from 'next/server'
import { analyzeContract } from '@/lib/ai/contract-analysis'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Analyze contract using AI
 * POST /api/admin/contract-discovery/[id]/analyze
 */
export async function POST(
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

    // Analyze contract
    const analysis = await analyzeContract(contractId)

    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to analyze contract. OpenAI may not be configured.' },
        { status: 500 }
      )
    }

    // Save analysis to database
    await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: {
        aiSummary: analysis.summary,
        aiKeyRequirements: JSON.stringify(analysis.keyRequirements),
        aiKeywords: JSON.stringify(analysis.keywords),
        aiStrengths: JSON.stringify(analysis.strengths),
        aiConcerns: JSON.stringify(analysis.concerns),
        aiFitScore: analysis.fitScore,
        aiServiceCategory: analysis.serviceCategory,
        aiRecommendedActions: JSON.stringify(analysis.recommendedActions),
        aiAnalysisGeneratedAt: new Date(),
      }
    })

    return NextResponse.json({ 
      success: true, 
      analysis,
      message: 'Contract analyzed successfully'
    })
  } catch (error: any) {
    console.error('Error analyzing contract:', error)
    return NextResponse.json(
      { error: 'Failed to analyze contract', details: error.message },
      { status: 500 }
    )
  }
}

