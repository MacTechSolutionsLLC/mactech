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
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  let googleQuery = '' // Declare at function level for error handling
  
  console.log(`[${requestId}] Contract Discovery API Request Started`)
  
  try {
    // TODO: Add admin authentication check
    // const session = await getServerSession()
    // if (!session || !session.user?.isAdmin) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    let body: SearchRequestBody
    try {
      body = await request.json()
      console.log(`[${requestId}] Request body parsed:`, {
        hasQuery: !!body.query,
        queryLength: body.query?.length || 0,
        serviceCategory: body.service_category,
        numResults: body.num_results,
        filters: body.filters,
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
    
    // Validate SerpAPI key (support both SERPAPI_KEY and SERP_API_KEY)
    const serpApiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY
    if (!serpApiKey) {
      console.error(`[${requestId}] SerpAPI key missing. Check environment variables SERPAPI_KEY or SERP_API_KEY`)
      console.error(`[${requestId}] Environment check:`, {
        hasSERPAPI_KEY: !!process.env.SERPAPI_KEY,
        hasSERP_API_KEY: !!process.env.SERP_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      })
      return NextResponse.json(
        { 
          error: 'SerpAPI key not configured',
          message: 'Please set SERPAPI_KEY or SERP_API_KEY environment variable. Get your key from https://serpapi.com/manage-api-key',
          details: 'The Contract Discovery feature requires a SerpAPI key to search for government contract opportunities.',
          requestId,
        },
        { status: 500 }
      )
    }
    
    console.log(`[${requestId}] SerpAPI key validated:`, {
      keyLength: serpApiKey.length,
      keyPrefix: serpApiKey.substring(0, 8) + '...',
    })

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
      console.log(`[${requestId}] Query built successfully:`, {
        query: googleQuery,
        queryLength: googleQuery.length,
        wasProvided: !!body.query,
        wasBuilt: !body.query,
      })
    } catch (queryError) {
      console.error(`[${requestId}] Error building query:`, {
        error: queryError,
        message: queryError instanceof Error ? queryError.message : 'Unknown error',
        stack: queryError instanceof Error ? queryError.stack : undefined,
        searchRequest,
      })
      return NextResponse.json(
        { 
          error: 'Failed to build search query',
          message: queryError instanceof Error ? queryError.message : 'Unknown error',
          requestId,
        },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] Contract Discovery Search Configuration:`, {
      query: googleQuery,
      hasApiKey: !!serpApiKey,
      apiKeyLength: serpApiKey?.length || 0,
      numResults: body.num_results || 20,
      dateRange: body.filters?.date_range,
      filters: body.filters,
    })

    // Call SerpAPI
    let results: any
    // Determine date filter (tbs parameter) before try block for use in fallback
    let dateFilter: string | undefined
    if (body.filters?.date_range) {
      switch (body.filters.date_range) {
        case 'past_week':
          dateFilter = 'qdr:w' // Past week
          break
        case 'past_month':
          dateFilter = 'qdr:m' // Past month
          break
        case 'past_year':
          dateFilter = 'qdr:y' // Past year
          break
      }
      console.log('Added date filter:', dateFilter)
    }
    
    try {
      const serpApiParams: any = {
        engine: 'google',
        q: googleQuery,
        api_key: serpApiKey,
        num: body.num_results || 20,
      }

      // Add date filter if specified
      if (dateFilter) {
        serpApiParams.tbs = dateFilter
      }

      console.log(`[${requestId}] SerpAPI request params:`, {
        engine: serpApiParams.engine,
        q: serpApiParams.q,
        qLength: serpApiParams.q?.length || 0,
        num: serpApiParams.num,
        tbs: serpApiParams.tbs,
        hasApiKey: !!serpApiParams.api_key,
        apiKeyPrefix: serpApiParams.api_key?.substring(0, 8) + '...',
      })

      const serpApiStartTime = Date.now()
      console.log(`[${requestId}] Calling SerpAPI at ${new Date().toISOString()}`)
      
      results = await getJson(serpApiParams)
      
      const serpApiDuration = Date.now() - serpApiStartTime
      console.log(`[${requestId}] SerpAPI response received (${serpApiDuration}ms):`, {
        hasResults: !!results,
        organicResultsCount: results?.organic_results?.length || 0,
        error: results?.error,
        errorMessage: results?.error,
        searchMetadata: results?.search_metadata,
        responseKeys: results ? Object.keys(results) : [],
        fullResponse: JSON.stringify(results).substring(0, 500), // First 500 chars for debugging
      })
      
      if (results?.error) {
        console.error(`[${requestId}] SerpAPI returned error in response:`, {
          error: results.error,
          errorType: typeof results.error,
          fullError: results,
        })
      }
      
      if (!results?.organic_results || results.organic_results.length === 0) {
        console.warn(`[${requestId}] No organic results in SerpAPI response:`, {
          hasResults: !!results,
          responseStructure: results ? Object.keys(results) : [],
          answerBox: results?.answer_box,
          knowledgeGraph: results?.knowledge_graph,
          relatedQuestions: results?.related_questions?.length || 0,
        })
      }
    } catch (serpError) {
      console.error(`[${requestId}] SerpAPI request exception:`, {
        error: serpError,
        message: serpError instanceof Error ? serpError.message : 'Unknown SerpAPI error',
        stack: serpError instanceof Error ? serpError.stack : undefined,
        name: serpError instanceof Error ? serpError.name : undefined,
        query: googleQuery,
      })
      return NextResponse.json(
        { 
          error: 'SerpAPI request failed',
          message: serpError instanceof Error ? serpError.message : 'Unknown SerpAPI error',
          details: process.env.NODE_ENV === 'development' ? String(serpError) : undefined,
          requestId,
          query: googleQuery,
        },
        { status: 500 }
      )
    }

    // Check for SerpAPI errors in response
    if (results.error) {
      console.error(`[${requestId}] SerpAPI returned error in response:`, {
        error: results.error,
        errorType: typeof results.error,
        query: googleQuery,
        fullResponse: results,
      })
      return NextResponse.json(
        { 
          error: 'SerpAPI error',
          message: results.error,
          query: googleQuery,
          details: process.env.NODE_ENV === 'development' ? results : undefined,
          requestId,
        },
        { status: 500 }
      )
    }

    // Process results
    const organicResults = (results.organic_results || []) as any[]
    console.log(`[${requestId}] Processing ${organicResults.length} organic results`)
    
    if (organicResults.length === 0) {
      console.warn(`[${requestId}] No organic results found in SerpAPI response:`, {
        query: googleQuery,
        responseStructure: results ? Object.keys(results) : [],
        hasAnswerBox: !!results?.answer_box,
        hasKnowledgeGraph: !!results?.knowledge_graph,
        hasRelatedQuestions: !!results?.related_questions,
        fullResponseSample: results ? JSON.stringify(results).substring(0, 1000) : 'No response',
      })
      return NextResponse.json({
        success: true,
        query: googleQuery,
        results_count: 0,
        results: [],
        warning: 'No results found. Try adjusting your search criteria.',
        requestId,
        debug: process.env.NODE_ENV === 'development' ? {
          responseKeys: results ? Object.keys(results) : [],
          hasOrganicResults: !!results?.organic_results,
        } : undefined,
      })
    }
    
    console.log(`[${requestId}] Sample of first organic result:`, {
      firstResult: organicResults[0] ? {
        title: organicResults[0].title,
        link: organicResults[0].link,
        snippet: organicResults[0].snippet?.substring(0, 100),
      } : null,
    })

    // Process and filter results - only keep actual SOW documents
    console.log(`[${requestId}] Processing ${organicResults.length} results through processSearchResult`)
    const processedResults = organicResults
      .map((result: any, index: number) => {
        try {
          const processed = processSearchResult(result, searchRequest)
          if (!processed) {
            console.log(`[${requestId}] Result ${index + 1} filtered out (null returned)`)
          }
          return processed
        } catch (processError) {
          console.error(`[${requestId}] Error processing result ${index + 1}:`, {
            error: processError,
            result: {
              title: result.title,
              link: result.link,
            },
          })
          return null
        }
      })
      .filter((result): result is DiscoveryResult => result !== null) // Remove null results (non-SOW documents)
    
    console.log(`[${requestId}] After processing: ${processedResults.length} valid results (${organicResults.length - processedResults.length} filtered out)`)

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

    console.log(`[${requestId}] Returning ${validResults.length} results to client`)
    
    return NextResponse.json({
      success: true,
      query: googleQuery,
      results_count: validResults.length,
      requestId,
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
      console.error(`[${requestId}] Unhandled error in contract discovery search:`, {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        query: googleQuery,
        timestamp: new Date().toISOString(),
      })
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const errorDetails = error instanceof Error ? error.stack : String(error)
      
      return NextResponse.json(
        { 
          error: 'Failed to perform search',
          message: errorMessage,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
          query: googleQuery,
          requestId,
        },
        { status: 500 }
      )
    } finally {
      console.log(`[${requestId}] Contract Discovery API Request Completed`)
    }
}

