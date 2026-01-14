import { NextRequest, NextResponse } from 'next/server'
import { searchSamGovV2, transformSamGovResultV2 } from '@/lib/sam-gov-api-v2'
import { DiscoveryResult } from '@/lib/contract-discovery'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Government Contract Discovery API
 * 
 * Uses the official SAM.gov API to discover contract opportunities.
 * This is the recommended approach as it's free, legal, and provides structured data.
 */

interface SearchRequestBody {
  query?: string
  service_category?: 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
  location?: string
  agency?: string[]
  naics_codes?: string[]
  psc_codes?: string[]
  document_types?: ('SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other')[]
  keywords?: string
  num_results?: number
  filters?: {
    filetype?: string
    site?: string[]
    date_range?: 'past_week' | 'past_month' | 'past_year'
  }
  set_aside?: string[]
  use_target_codes?: boolean // If true, use target NAICS and PSC codes as defaults
}

export async function POST(request: NextRequest) {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  console.log(`[${requestId}] Contract Discovery API Request Started (SAM.gov)`)
  
  try {
    let body: SearchRequestBody
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body parsed:`, {
        hasQuery: !!body.query,
        serviceCategory: body.service_category,
        numResults: body.num_results,
        dateRange: body.filters?.date_range,
        hasKeywords: !!body.keywords,
      })
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError)
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          message: parseError instanceof Error ? parseError.message : 'Failed to parse JSON',
          requestId,
        },
        { status: 400 }
      )
    }

    // Use keywords from body (either direct keywords or from query)
    const keywords = body.keywords || body.query || ''
    if (!keywords.trim()) {
      return NextResponse.json(
        { 
          error: 'Keywords or query required',
          message: 'Please provide keywords or a query string',
          requestId,
        },
        { status: 400 }
      )
    }
    
    // Default set-asides for VetCert
    const setAside = body.set_aside && body.set_aside.length > 0
      ? body.set_aside
      : ['SDVOSB', 'VOSB']
    
    // Call SAM.gov API v2
    let samGovResults
    try {
      const samApiStartTime = Date.now()
      console.log(`[${requestId}] Calling SAM.gov API v2 at ${new Date().toISOString()}`, {
        keywords,
        setAside,
        naicsCodes: body.naics_codes,
        dateRange: body.filters?.date_range || 'past_month',
      })
      
      samGovResults = await searchSamGovV2({
        keywords: keywords.trim(),
        naicsCodes: body.naics_codes,
        setAside,
        dateRange: body.filters?.date_range || 'past_month',
        limit: body.num_results || 30,
        offset: 0,
      })
      
      const samApiDuration = Date.now() - samApiStartTime
      console.log(`[${requestId}] SAM.gov API response received (${samApiDuration}ms):`, {
        totalRecords: samGovResults.totalRecords,
        returnedRecords: samGovResults.opportunitiesData.length,
      })
    } catch (samError) {
      console.error(`[${requestId}] SAM.gov API request exception:`, {
        error: samError,
        message: samError instanceof Error ? samError.message : 'Unknown SAM.gov API error',
      })
      
      const errorMessage = samError instanceof Error ? samError.message : 'Unknown SAM.gov API error'
      
      // Check if it's an API key error
      if (errorMessage.includes('API key') || errorMessage.includes('401')) {
        return NextResponse.json(
          { 
            error: 'SAM.gov API key required',
            message: errorMessage,
            details: 'Please register for a free API key at https://api.sam.gov/ and set the SAM_GOV_API_KEY environment variable.',
            requestId,
          },
          { status: 500 }
        )
      }
      
      // Check if it's a rate limit error
      if (errorMessage.includes('rate limit') || errorMessage.includes('429') || errorMessage.includes('quota')) {
        return NextResponse.json(
          { 
            error: 'SAM.gov API rate limit exceeded',
            message: errorMessage,
            details: 'The SAM.gov API free tier has daily request limits. You can try again later or upgrade your API key for higher limits.',
            requestId,
          },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'SAM.gov API request failed',
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? String(samError) : undefined,
          requestId,
        },
        { status: 500 }
      )
    }

    // Parse original search keywords for filtering
    const originalKeywords = keywords
      ? keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
      : []
    
    // Transform SAM.gov results to DiscoveryResult format
    let processedResults = samGovResults.opportunitiesData
      .map((opportunity) => {
        try {
          return transformSamGovResultV2(opportunity, originalKeywords)
        } catch (transformError) {
          console.error(`[${requestId}] Error transforming result:`, {
            error: transformError,
            noticeId: opportunity.noticeId,
          })
          return null
        }
      })
      .filter((result): result is DiscoveryResult => result !== null)
    
    // Post-processing: Filter results to ensure they contain search keywords
    if (originalKeywords.length > 0) {
      const beforeFilter = processedResults.length
      processedResults = processedResults.filter(result => {
        const titleText = (result.title || '').toUpperCase()
        const descText = (result.description || result.snippet || '').toUpperCase()
        const combinedText = `${titleText} ${descText}`
        
        // Check if at least one keyword appears in title or description
        return originalKeywords.some(keyword => {
          const keywordUpper = keyword.toUpperCase()
          return combinedText.includes(keywordUpper)
        })
      })
      
      if (beforeFilter !== processedResults.length) {
        console.log(`[${requestId}] Filtered ${beforeFilter - processedResults.length} results that didn't contain keywords`)
      }
    }
    
    // Filter results based on VetCert set-aside (if specified)
    const isVetCertSearch = setAside && setAside.length > 0
    if (isVetCertSearch) {
      processedResults = processedResults.filter(result => {
        // For VetCert searches, require set-aside match
        const hasSetAside = result.set_aside && result.set_aside.length > 0
        return hasSetAside
      })
    }
    
    // Sort by relevance score (highest first)
    processedResults.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0))
    
    console.log(`[${requestId}] Processed ${processedResults.length} results from SAM.gov (filtered from ${samGovResults.opportunitiesData.length})`)

    // Store results in database
    let dbAvailable = false
    let dbWarnings: string[] = []
    
    try {
      await prisma.$connect()
      dbAvailable = true
    } catch (dbError) {
      console.warn('Database not available, returning results without storage:', dbError)
      dbWarnings.push(`Database unavailable: ${dbError instanceof Error ? dbError.message : 'Unknown error'}. Results will not be saved.`)
    }

    let storedResults = processedResults

    if (dbAvailable) {
      try {
        storedResults = await Promise.all(
          processedResults.map(async (result) => {
            try {
              const existing = await prisma.governmentContractDiscovery.findUnique({
                where: { url: result.url },
              })

              if (existing) {
                const updated = await prisma.governmentContractDiscovery.update({
                  where: { url: result.url },
                  data: {
                    title: result.title,
                    snippet: result.snippet || null,
                    domain: result.domain,
                    document_type: result.document_type || null,
                    notice_id: result.notice_id || null,
                    solicitation_number: result.solicitation_number || null,
                    agency: result.agency || null,
                    naics_codes: JSON.stringify(result.naics_codes || []),
                    set_aside: JSON.stringify(result.set_aside || []),
                    location_mentions: JSON.stringify(result.location_mentions || []),
                    detected_keywords: JSON.stringify(result.detected_keywords || []),
                    relevance_score: result.relevance_score || 0,
                    google_query: `SAM.gov API search: ${body.keywords || body.query || 'general'}`,
                    service_category: result.detected_service_category || body.service_category || null,
                    // Update description and contact info if available
                    description: result.description || result.snippet || existing.description,
                    scraped_text_content: result.api_data?.description || result.description || existing.scraped_text_content,
                    points_of_contact: result.points_of_contact && result.points_of_contact.length > 0
                      ? JSON.stringify(result.points_of_contact)
                      : existing.points_of_contact,
                    deadline: result.deadline || existing.deadline,
                    place_of_performance: result.place_of_performance || existing.place_of_performance,
                    // Update SOW attachment info if available
                    sow_attachment_url: result.sow_attachment_url || existing.sow_attachment_url,
                    sow_attachment_type: result.sow_attachment_type || existing.sow_attachment_type,
                    updated_at: new Date(),
                  },
                })
                return { ...result, id: updated.id }
              } else {
                // Store API data if available (for SAM.gov API results)
                const apiDataJson = result.api_data ? JSON.stringify(result.api_data) : null
                
                const created = await prisma.governmentContractDiscovery.create({
                  data: {
                    title: result.title,
                    url: result.url,
                    domain: result.domain,
                    snippet: result.snippet || null,
                    document_type: result.document_type || null,
                    notice_id: result.notice_id || null,
                    solicitation_number: result.solicitation_number || null,
                    agency: result.agency || null,
                    naics_codes: JSON.stringify(result.naics_codes || []),
                    set_aside: JSON.stringify(result.set_aside || []),
                    location_mentions: JSON.stringify(result.location_mentions || []),
                    detected_keywords: JSON.stringify(result.detected_keywords || []),
                    relevance_score: result.relevance_score || 0,
                    google_query: `SAM.gov API search: ${body.keywords || body.query || 'general'}`,
                    service_category: result.detected_service_category || body.service_category || null,
                    ingestion_status: 'discovered',
                    verified: false,
                    // Store SOW attachment info from API if available
                    sow_attachment_url: result.sow_attachment_url || null,
                    sow_attachment_type: result.sow_attachment_type || null,
                    // Store full description from API
                    description: result.description || result.snippet || null,
                    scraped_text_content: result.api_data?.description || result.description || null,
                    // Store contact information
                    points_of_contact: result.points_of_contact && result.points_of_contact.length > 0
                      ? JSON.stringify(result.points_of_contact)
                      : null,
                    // Store deadline and other details
                    deadline: result.deadline || null,
                    place_of_performance: result.place_of_performance || null,
                  },
                })
                return { ...result, id: created.id }
              }
            } catch (error) {
              console.error('Error storing individual result:', error)
              dbWarnings.push(`Failed to store result for ${result.url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              return { ...result, id: `temp-${Date.now()}-${Math.random()}` }
            }
          })
        )
      } catch (bulkError) {
        console.error('Error in bulk database operation:', bulkError)
        dbWarnings.push(`Database operation failed: ${bulkError instanceof Error ? bulkError.message : 'Unknown error'}`)
        storedResults = processedResults.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
      }
    } else {
      storedResults = processedResults.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
    }

    console.log(`[${requestId}] Returning ${storedResults.length} results to client`)
    
    return NextResponse.json({
      success: true,
      query: `SAM.gov API: ${body.keywords || body.query || 'general search'}`,
      results_count: storedResults.length,
      total_records: samGovResults.totalRecords,
      requestId,
      results: storedResults.map((r: any) => ({
        id: r.id || `temp-${Date.now()}-${Math.random()}`,
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
        document_type: r.document_type,
        notice_id: r.notice_id,
        solicitation_number: r.solicitation_number,
        agency: r.agency,
        naics_codes: Array.isArray(r.naics_codes) ? r.naics_codes : (r.naics_codes || []),
        set_aside: Array.isArray(r.set_aside) ? r.set_aside : (r.set_aside || []),
        location_mentions: Array.isArray(r.location_mentions) ? r.location_mentions : (r.location_mentions || []),
        detected_keywords: Array.isArray(r.detected_keywords) ? r.detected_keywords : (r.detected_keywords || []),
        relevance_score: r.relevance_score || 0,
        detected_service_category: r.detected_service_category,
        ingestion_status: r.ingestion_status || 'discovered',
        verified: r.verified || false,
      })),
      warnings: dbWarnings.length > 0 ? dbWarnings : undefined,
    })
  } catch (error) {
    console.error(`[${requestId}] Unhandled error in contract discovery search:`, {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
        requestId,
      },
      { status: 500 }
    )
  } finally {
    console.log(`[${requestId}] Contract Discovery API Request Completed`)
  }
}
