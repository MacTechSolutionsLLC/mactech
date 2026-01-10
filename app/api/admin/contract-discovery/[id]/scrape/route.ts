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

    // Check if we have API data stored (from SAM.gov API)
    // If the contract was discovered via API, we should have better data
    let apiData: {
      description?: string
      links?: Array<{ rel?: string; href?: string; type?: string }>
      additionalInfoLink?: string
      title?: string
      pointOfContact?: Array<{
        type?: string
        email?: string
        phone?: string
        fax?: string
        fullName?: string
        title?: string
      }>
      placeOfPerformance?: {
        streetAddress?: string
        city?: string
        state?: string
        zip?: string
        country?: string
      }
      responseDeadLine?: string
      postedDate?: string
    } | undefined

    // Try to reconstruct API data from stored fields
    // If we have scraped_text_content, that's likely from API description
    if (contract.scraped_text_content && contract.domain === 'sam.gov') {
      // Parse points of contact if available
      let pointOfContact: Array<{
        type?: string
        email?: string
        phone?: string
        fullName?: string
        title?: string
      }> | undefined
      
      if (contract.points_of_contact) {
        try {
          const parsed = JSON.parse(contract.points_of_contact)
          pointOfContact = parsed.map((poc: any) => ({
            fullName: poc.name,
            email: poc.email,
            phone: poc.phone,
            type: poc.role,
          }))
        } catch {
          // Ignore parse errors
        }
      }

      apiData = {
        description: contract.description || contract.scraped_text_content,
        title: contract.title,
        pointOfContact,
        responseDeadLine: contract.deadline || undefined,
      }
    }

    // If we already have SOW attachment URL from API, use it
    if (contract.sow_attachment_url && !contract.scraped) {
      // We already have the attachment URL, just analyze the existing data
      apiData = {
        description: contract.description || contract.snippet || contract.scraped_text_content || undefined,
        title: contract.title,
      }
    }

    // Scrape the contract page (will use API data if available)
    const scrapeResult = await scrapeContractPage(contract.url, apiData)

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
    
    // Also update contact info and description if we have API data
    if (apiData) {
      await prisma.governmentContractDiscovery.update({
        where: { id: contractId },
        data: {
          description: apiData.description || contract.description || null,
          points_of_contact: apiData.pointOfContact && apiData.pointOfContact.length > 0
            ? JSON.stringify(apiData.pointOfContact.map(poc => ({
                name: poc.fullName || '',
                email: poc.email || '',
                phone: poc.phone || '',
                role: poc.type || poc.title || '',
              })))
            : contract.points_of_contact,
          deadline: apiData.responseDeadLine || contract.deadline || null,
          place_of_performance: apiData.placeOfPerformance
            ? `${apiData.placeOfPerformance.streetAddress || ''} ${apiData.placeOfPerformance.city || ''} ${apiData.placeOfPerformance.state || ''} ${apiData.placeOfPerformance.zip || ''}`.trim()
            : contract.place_of_performance,
          updated_at: new Date(),
        },
      })
    }

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

