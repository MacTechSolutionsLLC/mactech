import { NextRequest, NextResponse } from 'next/server'
import { searchSamGov, transformSamGovResult } from '@/lib/sam-gov-api'
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
  document_types?: ('SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other')[]
  keywords?: string
  num_results?: number
  filters?: {
    filetype?: string
    site?: string[]
    date_range?: 'past_week' | 'past_month' | 'past_year'
  }
  set_aside?: string[]
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

    // Call SAM.gov API
    let samGovResults
    try {
      const samApiStartTime = Date.now()
      console.log(`[${requestId}] Calling SAM.gov API at ${new Date().toISOString()}`)
      
      samGovResults = await searchSamGov({
        keywords: body.keywords || body.query,
        serviceCategory: body.service_category,
        dateRange: body.filters?.date_range || 'past_month',
        setAside: body.set_aside,
        naicsCodes: body.naics_codes,
        limit: body.num_results || 25,
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

    // Transform SAM.gov results to DiscoveryResult format
    const processedResults = samGovResults.opportunitiesData
      .map((opportunity) => {
        try {
          return transformSamGovResult(opportunity)
        } catch (transformError) {
          console.error(`[${requestId}] Error transforming result:`, {
            error: transformError,
            noticeId: opportunity.noticeId,
          })
          return null
        }
      })
      .filter((result): result is DiscoveryResult => result !== null)
    
    console.log(`[${requestId}] Processed ${processedResults.length} results from SAM.gov`)

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
                    updated_at: new Date(),
                  },
                })
                return { ...result, id: updated.id }
              } else {
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
