import { NextRequest, NextResponse } from 'next/server'
import { buildGoogleQuery } from '@/lib/services/vetcert-query-builder'
import { ServiceCategory } from '@/lib/contract-discovery'

export const dynamic = 'force-dynamic'

interface GenerateGoogleQueryRequestBody {
  keywords: string
  service_category?: ServiceCategory
  location?: string
  agency?: string[]
  date_range?: 'past_week' | 'past_month' | 'past_year'
  naics_codes?: string[]
  psc_codes?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateGoogleQueryRequestBody = await request.json()
    
    if (!body.keywords || body.keywords.trim().length === 0) {
      return NextResponse.json(
        {
          error: 'Keywords are required',
          message: 'Please provide keywords for the Google query',
        },
        { status: 400 }
      )
    }
    
    // Parse comma-separated keywords
    const parsedKeywords = body.keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
    
    // Build Google query
    const googleQuery = buildGoogleQuery({
      keywords: parsedKeywords,
      serviceCategory: body.service_category || 'cybersecurity',
      location: body.location,
      agency: body.agency,
      dateRange: body.date_range || 'past_month',
      naicsCodes: body.naics_codes,
      pscCodes: body.psc_codes,
    })
    
    return NextResponse.json({
      success: true,
      googleQuery,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to generate Google query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

