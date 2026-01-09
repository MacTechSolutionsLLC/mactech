import { NextRequest, NextResponse } from 'next/server'
import { scrapeContractPage, saveScrapedContract } from '@/lib/contract-scraper'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * Scrape contract opportunity page
 * POST /api/admin/contract-discovery/[id]/scrape
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const contractId = resolvedParams.id

    // Get contract from database
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Scrape the contract page
    const scrapeResult = await scrapeContractPage(contract.url)

    if (!scrapeResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to scrape contract page',
          details: scrapeResult.error,
        },
        { status: 500 }
      )
    }

    // Save scraped data to database
    await saveScrapedContract(contractId, scrapeResult)

    return NextResponse.json({
      success: true,
      scraped: true,
      sowAttachmentUrl: scrapeResult.sowAttachmentUrl,
      sowAttachmentType: scrapeResult.sowAttachmentType,
      analysis: scrapeResult.analysis,
    })
  } catch (error) {
    console.error('Error scraping contract:', error)
    return NextResponse.json(
      {
        error: 'Failed to scrape contract',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

