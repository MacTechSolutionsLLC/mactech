import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

export const dynamic = 'force-dynamic'

/**
 * Test endpoint to verify SerpAPI connection
 */
export async function GET(request: NextRequest) {
  try {
    // Validate SerpAPI key
    const serpApiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY
    
    if (!serpApiKey) {
      return NextResponse.json({
        success: false,
        error: 'SerpAPI key not configured',
        hasKey: false,
        keyLength: 0,
      })
    }

    // Test with a simple query
    const testQuery = 'filetype:pdf site:sam.gov "Statement of Work"'
    
    console.log('Testing SerpAPI:', {
      hasKey: !!serpApiKey,
      keyLength: serpApiKey.length,
      keyPrefix: serpApiKey.substring(0, 10) + '...',
      query: testQuery,
    })

    const results = await getJson({
      engine: 'google',
      q: testQuery,
      api_key: serpApiKey,
      num: 5,
    })

    return NextResponse.json({
      success: true,
      hasKey: true,
      keyLength: serpApiKey.length,
      query: testQuery,
      resultsCount: results.organic_results?.length || 0,
      hasError: !!results.error,
      error: results.error,
      searchMetadata: results.search_metadata,
      sampleResults: results.organic_results?.slice(0, 2) || [],
    })
  } catch (error) {
    console.error('SerpAPI test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
    }, { status: 500 })
  }
}

