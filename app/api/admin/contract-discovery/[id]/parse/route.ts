import { NextRequest, NextResponse } from 'next/server'
import { parseContractText } from '@/lib/ai/contract-parser'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Parse contract using AI
 * POST /api/admin/contract-discovery/[id]/parse
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const contractId = typeof params === 'object' && 'then' in params ? (await params).id : params.id
    const contract = await prisma.governmentContractDiscovery.findUnique({
      where: { id: contractId }
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Get contract text (from SOW attachment or scraped content)
    const contractText = contract.sow_attachment_content || contract.scraped_text_content || ''
    
    if (!contractText) {
      return NextResponse.json(
        { error: 'No contract content available. Please scrape the contract and SOW first.' },
        { status: 400 }
      )
    }

    // Parse with AI
    const parsed = await parseContractText(contractText)

    if (!parsed) {
      return NextResponse.json(
        { error: 'Failed to parse contract. OpenAI may not be configured.' },
        { status: 500 }
      )
    }

    // Update contract with parsed data
    // Note: We'll store the parsed data in existing fields and new AI fields
    const updateData: any = {
      // Update basic fields if parsed
      agency: parsed.agency || contract.agency,
      solicitation_number: parsed.solicitationNumber || contract.solicitation_number,
      notice_id: parsed.noticeId || contract.notice_id,
      document_type: parsed.documentType || contract.document_type,
    }

    // Update NAICS codes if parsed
    if (parsed.naicsCodes.length > 0) {
      try {
        const existingNaics = contract.naics_codes ? JSON.parse(contract.naics_codes) : []
        const combined = [...new Set([...existingNaics, ...parsed.naicsCodes])]
        updateData.naics_codes = JSON.stringify(combined)
      } catch {
        updateData.naics_codes = JSON.stringify(parsed.naicsCodes)
      }
    }

    // Update set-aside if parsed
    if (parsed.setAside.length > 0) {
      try {
        const existingSetAside = contract.set_aside ? JSON.parse(contract.set_aside) : []
        const combined = [...new Set([...existingSetAside, ...parsed.setAside])]
        updateData.set_aside = JSON.stringify(combined)
      } catch {
        updateData.set_aside = JSON.stringify(parsed.setAside)
      }
    }

    // Update keywords if parsed
    if (parsed.keywords.length > 0) {
      try {
        const existingKeywords = contract.detected_keywords ? JSON.parse(contract.detected_keywords) : []
        const combined = [...new Set([...existingKeywords, ...parsed.keywords])]
        updateData.detected_keywords = JSON.stringify(combined)
      } catch {
        updateData.detected_keywords = JSON.stringify(parsed.keywords)
      }
    }

    // Store parsed contract data in AI fields (will be added to schema)
    updateData.aiParsedData = JSON.stringify(parsed)
    updateData.aiParsedAt = new Date()

    await prisma.governmentContractDiscovery.update({
      where: { id: contractId },
      data: updateData
    })

    return NextResponse.json({ 
      success: true, 
      parsed,
      message: 'Contract parsed successfully'
    })
  } catch (error: any) {
    console.error('Error parsing contract:', error)
    return NextResponse.json(
      { error: 'Failed to parse contract', details: error.message },
      { status: 500 }
    )
  }
}

