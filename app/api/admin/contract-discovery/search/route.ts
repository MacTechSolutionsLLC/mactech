import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'
import { buildSearchQuery, processSearchResult, SearchRequest } from '@/lib/contract-discovery'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * Government Contract Discovery API
 * 
 * LEGAL NOTE: This endpoint uses Google search results via SerpAPI to discover
 * publicly available government contract documents. This is a discovery-only
 * tool. All results are marked as UNVERIFIED until manually validated.
 * We do not scrape SAM.gov directly or use any unauthorized access methods.
 */

interface SearchRequestBody {
  query?: string
  service_category?: 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
  location?: string
  agency?: string[]
  naics_codes?: string[]
  document_types?: ('SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other')[]
  num_results?: number
  filters?: {
    filetype?: string
    site?: string[]
    date_range?: 'past_week' | 'past_month' | 'past_year'
  }
  set_aside?: string[]
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession()
    // if (!session || !session.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body: SearchRequestBody = await request.json()
    
    // Validate SerpAPI key (support both SERPAPI_KEY and SERP_API_KEY)
    const serpApiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY
    if (!serpApiKey) {
      return NextResponse.json(
        { error: 'SerpAPI key not configured. Please set SERPAPI_KEY or SERP_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // Build search query
    const searchRequest: SearchRequest = {
      query: body.query,
      service_category: body.service_category,
      location: body.location,
      agency: body.agency,
      naics_codes: body.naics_codes,
      document_types: body.document_types,
      num_results: body.num_results || 20,
      filters: body.filters,
      set_aside: body.set_aside,
    }

    const googleQuery = body.query || buildSearchQuery(searchRequest)

    // Call SerpAPI
    const results = await getJson({
      engine: 'google',
      q: googleQuery,
      api_key: serpApiKey,
      num: body.num_results || 20,
    })

    // Process results
    const organicResults = (results.organic_results || []) as any[]
    const processedResults = organicResults.map((result: any) => 
      processSearchResult(result, searchRequest)
    )

    // Store results in database
    const storedResults = await Promise.all(
      processedResults.map(async (result) => {
        try {
          // Check if URL already exists
          const existing = await prisma.governmentContractDiscovery.findUnique({
            where: { url: result.url },
          })

          if (existing) {
            // Update existing record
            return await prisma.governmentContractDiscovery.update({
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
                google_query: googleQuery,
                service_category: result.detected_service_category || searchRequest.service_category || null,
                updated_at: new Date(),
              },
            })
          } else {
            // Create new record
            return await prisma.governmentContractDiscovery.create({
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
                google_query: googleQuery,
                service_category: result.detected_service_category || searchRequest.service_category || null,
                ingestion_status: 'discovered',
                verified: false,
              },
            })
          }
        } catch (error) {
          console.error('Error storing result:', error)
          return null
        }
      })
    )

    // Filter out null results
    const validResults = storedResults.filter(r => r !== null)

    return NextResponse.json({
      success: true,
      query: googleQuery,
      results_count: validResults.length,
      results: validResults.map(r => ({
        id: r.id,
        title: r.title,
        url: r.url,
        domain: r.domain,
        snippet: r.snippet,
        document_type: r.document_type,
        notice_id: r.notice_id,
        solicitation_number: r.solicitation_number,
        agency: r.agency,
        naics_codes: JSON.parse(r.naics_codes || '[]'),
        set_aside: JSON.parse(r.set_aside || '[]'),
        location_mentions: JSON.parse(r.location_mentions || '[]'),
        detected_keywords: JSON.parse(r.detected_keywords || '[]'),
        relevance_score: r.relevance_score,
        detected_service_category: r.service_category as any,
        ingestion_status: r.ingestion_status,
        verified: r.verified,
        created_at: r.created_at,
      })),
    })
  } catch (error) {
    console.error('Error in contract discovery search:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform search',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

