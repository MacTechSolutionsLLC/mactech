import { NextRequest, NextResponse } from 'next/server'
import { scrapeSOWAttachment, saveScrapedSOW } from '@/lib/contract-scraper'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * Scrape SOW attachment document
 * POST /api/admin/contract-discovery/[id]/scrape-sow
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id

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

    if (!contract.sow_attachment_url) {
      return NextResponse.json(
        { error: 'No SOW attachment URL found. Please scrape the contract page first.' },
        { status: 400 }
      )
    }

    // Scrape the SOW attachment
    const sowResult = await scrapeSOWAttachment(
      contract.sow_attachment_url,
      contract.sow_attachment_type || 'unknown'
    )

    if (!sowResult.success) {
      return NextResponse.json(
        {
          error: 'Failed to scrape SOW attachment',
          details: sowResult.error,
        },
        { status: 500 }
      )
    }

    // Save scraped SOW content to database
    await saveScrapedSOW(contractId, sowResult.content || '')

    return NextResponse.json({
      success: true,
      sowScraped: true,
      contentLength: sowResult.content?.length || 0,
    })
  } catch (error) {
    console.error('Error scraping SOW attachment:', error)
    return NextResponse.json(
      {
        error: 'Failed to scrape SOW attachment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

