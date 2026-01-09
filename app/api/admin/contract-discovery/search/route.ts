import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'
import { buildSearchQuery, processSearchResult, SearchRequest, DiscoveryResult } from '@/lib/contract-discovery'
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
  let googleQuery = '' // Declare at function level for error handling
  
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
      console.error('SerpAPI key missing. Check environment variables SERPAPI_KEY or SERP_API_KEY')
      return NextResponse.json(
        { 
          error: 'SerpAPI key not configured',
          message: 'Please set SERPAPI_KEY or SERP_API_KEY environment variable. Get your key from https://serpapi.com/manage-api-key',
          details: 'The Contract Discovery feature requires a SerpAPI key to search for government contract opportunities.'
        },
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
      document_types: body.document_types, // Optional - not required for SAM.gov opportunity searches
      keywords: body.keywords,
      num_results: body.num_results || 30,
      filters: body.filters || { site: ['sam.gov'] }, // Default to SAM.gov only
      set_aside: body.set_aside,
    }

    try {
      googleQuery = body.query || buildSearchQuery(searchRequest)
    } catch (queryError) {
      console.error('Error building query:', queryError)
      return NextResponse.json(
        { 
          error: 'Failed to build search query',
          message: queryError instanceof Error ? queryError.message : 'Unknown error'
        },
        { status: 400 }
      )
    }

    console.log('Contract Discovery Search:', {
      query: googleQuery,
      hasApiKey: !!serpApiKey,
      apiKeyLength: serpApiKey?.length || 0,
      numResults: body.num_results || 20,
      dateRange: body.filters?.date_range,
    })

    // Call SerpAPI
    let results: any
    try {
      const serpApiParams: any = {
        engine: 'google',
        q: googleQuery,
        api_key: serpApiKey,
        num: body.num_results || 20,
      }

      // Add date filter if specified (SerpAPI supports tbs parameter)
      // Note: tbs parameter works better than after: in query for SerpAPI
      if (body.filters?.date_range) {
        switch (body.filters.date_range) {
          case 'past_week':
            serpApiParams.tbs = 'qdr:w' // Past week
            break
          case 'past_month':
            serpApiParams.tbs = 'qdr:m' // Past month
            break
          case 'past_year':
            serpApiParams.tbs = 'qdr:y' // Past year
            break
        }
        console.log('Added date filter:', serpApiParams.tbs)
      }

      console.log('SerpAPI params:', {
        engine: serpApiParams.engine,
        q: serpApiParams.q,
        num: serpApiParams.num,
        tbs: serpApiParams.tbs,
        hasApiKey: !!serpApiParams.api_key,
      })

      results = await getJson(serpApiParams)
      
      console.log('SerpAPI Response:', {
        hasResults: !!results,
        organicResultsCount: results?.organic_results?.length || 0,
        error: results?.error,
        searchMetadata: results?.search_metadata,
      })
    } catch (serpError) {
      console.error('SerpAPI Error:', serpError)
      return NextResponse.json(
        { 
          error: 'SerpAPI request failed',
          message: serpError instanceof Error ? serpError.message : 'Unknown SerpAPI error',
          details: serpError
        },
        { status: 500 }
      )
    }

    // Check for SerpAPI errors in response
    if (results.error) {
      console.error('SerpAPI returned error:', results.error)
      return NextResponse.json(
        { 
          error: 'SerpAPI error',
          message: results.error,
          details: results
        },
        { status: 500 }
      )
    }

    // Process results
    const organicResults = (results.organic_results || []) as any[]
    console.log('Processing results:', organicResults.length)
    
    if (organicResults.length === 0) {
      console.warn('No organic results found in SerpAPI response')
      return NextResponse.json({
        success: true,
        query: googleQuery,
        results_count: 0,
        results: [],
        warning: 'No results found. Try adjusting your search criteria.',
      })
    }

    // Process and filter results - only keep actual SOW documents
    const processedResults = organicResults
      .map((result: any) => processSearchResult(result, searchRequest))
      .filter((result): result is DiscoveryResult => result !== null) // Remove null results (non-SOW documents)

    // Try to store results in database, but don't fail if DB is unavailable
    let dbAvailable = false
    let dbWarnings: string[] = []
    
    try {
      // Test database connection
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
              // Check if URL already exists
              const existing = await prisma.governmentContractDiscovery.findUnique({
                where: { url: result.url },
              })

              if (existing) {
                // Update existing record
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
                    google_query: googleQuery,
                    service_category: result.detected_service_category || searchRequest.service_category || null,
                    updated_at: new Date(),
                  },
                })
                // Return processed result with DB id
                return { ...result, id: updated.id }
              } else {
                // Create new record
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
                    google_query: googleQuery,
                    service_category: result.detected_service_category || searchRequest.service_category || null,
                    ingestion_status: 'discovered',
                    verified: false,
                  },
                })
                // Return processed result with DB id
                return { ...result, id: created.id }
              }
            } catch (error) {
              console.error('Error storing individual result:', error)
              dbWarnings.push(`Failed to store result for ${result.url}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              // Return processed result without DB id
              return { ...result, id: `temp-${Date.now()}-${Math.random()}` }
            }
          })
        )
      } catch (bulkError) {
        console.error('Error in bulk database operation:', bulkError)
        dbWarnings.push(`Database operation failed: ${bulkError instanceof Error ? bulkError.message : 'Unknown error'}`)
        // Use processed results with temp IDs
        storedResults = processedResults.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
      }
    } else {
      // Database not available, use processed results with temp IDs
      storedResults = processedResults.map(r => ({ ...r, id: `temp-${Date.now()}-${Math.random()}` }))
    }

    // All results should be valid now (no nulls)
    const validResults = storedResults

    return NextResponse.json({
      success: true,
      query: googleQuery,
      results_count: validResults.length,
      results: validResults.map((r: any) => ({
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
      console.error('Error in contract discovery search:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = error instanceof Error ? error.stack : String(error)
      
      return NextResponse.json(
        { 
          error: 'Failed to perform search',
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          query: googleQuery,
        },
        { status: 500 }
      )
    }
}

