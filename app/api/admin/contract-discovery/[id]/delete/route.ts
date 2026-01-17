import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Delete a contract permanently
 * DELETE /api/admin/contract-discovery/[id]/delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id

    // Check if contract exists
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Delete the contract
    await prisma.governmentContractDiscovery.delete({
      where: { id: contractId },
    })

    return NextResponse.json({
      success: true,
      message: 'Contract deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting contract:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}



