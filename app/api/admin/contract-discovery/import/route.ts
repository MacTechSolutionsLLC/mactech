import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// CORS headers for browser extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

/**
 * Import contract from extension scraping
 * POST /api/admin/contract-discovery/import
 * 
 * This endpoint accepts contract data scraped by the browser extension
 * when SAM.gov API limits are reached or when manually scraping from Google results
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      url,
      title,
      htmlContent,
      textContent,
      snippet,
      domain,
      documentType,
      noticeId,
      solicitationNumber,
      agency,
      naicsCodes,
      setAside,
      keywords,
      sowAttachmentUrl,
      sowAttachmentType,
      pointsOfContact,
      description,
      requirements,
      deadline,
      estimatedValue,
      periodOfPerformance,
      placeOfPerformance,
    } = body

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    // Check if contract already exists
    const existing = await prisma.governmentContractDiscovery.findUnique({
      where: { url },
    })

    const contractData: any = {
      title,
      url,
      domain: domain || new URL(url).hostname,
      snippet: snippet || textContent?.substring(0, 500) || null,
      document_type: documentType || null,
      notice_id: noticeId || null,
      solicitation_number: solicitationNumber || null,
      agency: agency || null,
      naics_codes: JSON.stringify(Array.isArray(naicsCodes) ? naicsCodes : []),
      set_aside: JSON.stringify(Array.isArray(setAside) ? setAside : []),
      detected_keywords: JSON.stringify(Array.isArray(keywords) ? keywords : []),
      location_mentions: JSON.stringify([]),
      relevance_score: 50, // Default score for manually imported
      google_query: 'Extension import',
      service_category: null,
      ingestion_status: 'discovered',
      verified: false,
      scraped: true,
      scraped_at: new Date(),
      scraped_html_content: htmlContent?.substring(0, 100000) || null,
      scraped_text_content: textContent?.substring(0, 50000) || null,
      sow_attachment_url: sowAttachmentUrl || null,
      sow_attachment_type: sowAttachmentType || null,
      points_of_contact: pointsOfContact ? JSON.stringify(Array.isArray(pointsOfContact) ? pointsOfContact : []) : null,
      description: description || null,
      requirements: requirements ? JSON.stringify(Array.isArray(requirements) ? requirements : []) : null,
      deadline: deadline || null,
      estimated_value: estimatedValue || null,
      period_of_performance: periodOfPerformance || null,
      place_of_performance: placeOfPerformance || null,
      updated_at: new Date(),
    }

    let contract
    if (existing) {
      // Update existing contract
      contract = await prisma.governmentContractDiscovery.update({
        where: { url },
        data: contractData,
      })
    } else {
      // Create new contract
      contract = await prisma.governmentContractDiscovery.create({
        data: contractData,
      })
    }

    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        url: contract.url,
        scraped: contract.scraped,
      },
      message: existing ? 'Contract updated successfully' : 'Contract imported successfully',
    }, {
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error('Error importing contract:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      {
        error: 'Failed to import contract',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { 
        status: 500,
        headers: corsHeaders,
      }
    )
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

