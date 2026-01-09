import { NextRequest, NextResponse } from 'next/server'
import { getOpenAIClient, isOpenAIConfigured } from '@/lib/openai'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// CORS headers for browser extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}

interface ParsedContractData {
  title?: string
  description?: string
  noticeId?: string
  solicitationNumber?: string
  agency?: string
  naicsCodes?: string[]
  setAside?: string[]
  deadline?: string
  responseDeadline?: string
  postedDate?: string
  estimatedValue?: string
  periodOfPerformance?: string
  placeOfPerformance?: string
  contractType?: string
  classificationCode?: string
  pointsOfContact?: Array<{
    name?: string
    email?: string
    phone?: string
    role?: string
  }>
  requirements?: string[]
  keywords?: string[]
  sowAttachmentUrl?: string
  sowAttachmentType?: string
}

/**
 * Parse contract HTML using AI
 * POST /api/admin/contract-discovery/parse-html
 */
export async function POST(request: NextRequest) {
  try {
    if (!isOpenAIConfigured()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { 
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    const body = await request.json()
    const { htmlContent, url } = body

    if (!htmlContent) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { 
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const openai = getOpenAIClient()

    // Extract text content from HTML for context (limit to avoid token limits)
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 30000) // Limit to ~30k chars

    const prompt = `You are parsing a SAM.gov contract opportunity page HTML. Extract structured information from the HTML and return ONLY valid JSON.

Extract the following fields:
- title: The contract opportunity title
- description: The main description/scope of work (exclude contact info, footers, navigation, attachments sections)
- noticeId: The notice ID if present
- solicitationNumber: The solicitation number if present
- agency: The contracting agency/department name
- naicsCodes: Array of NAICS codes (6-digit numbers)
- setAside: Array of set-aside types (e.g., SDVOSB, VOSB, 8(a), HUBZone, WOSB, Small Business)
- deadline: Response deadline/date
- responseDeadline: Same as deadline
- postedDate: When the opportunity was posted
- estimatedValue: Contract value estimate (e.g., "$1M", "$500K")
- periodOfPerformance: Period of performance dates/duration
- placeOfPerformance: Location/place of performance
- contractType: Type of contract (RFP, RFQ, SOW, PWS, etc.)
- classificationCode: PSC or classification code if present
- pointsOfContact: Array of contact objects with name, email, phone, role
- requirements: Array of key requirements/qualifications
- keywords: Array of relevant keywords
- sowAttachmentUrl: URL to SOW/PWS attachment if present
- sowAttachmentType: Type of attachment (PDF, DOCX, etc.)

IMPORTANT RULES:
1. For description: Extract ONLY the actual contract description. Stop at "Contact Information", "Attachments", "Links", "Feedback", or footer sections. Do NOT include contact details, addresses, phone numbers, or navigation elements.
2. For pointsOfContact: Extract name, email, phone, and role. Skip generic/non-POC emails (noreply, automated, system, etc.)
3. For requirements: Extract key requirements, qualifications, or must-have items
4. Return null for fields that are not found
5. Return ONLY valid JSON, no markdown, no explanations

HTML Content:
${htmlContent.substring(0, 100000)} // Limit HTML to ~100k chars

URL: ${url || 'Unknown'}

Return JSON in this exact format:
{
  "title": "string or null",
  "description": "string or null",
  "noticeId": "string or null",
  "solicitationNumber": "string or null",
  "agency": "string or null",
  "naicsCodes": ["string"] or null,
  "setAside": ["string"] or null,
  "deadline": "string or null",
  "responseDeadline": "string or null",
  "postedDate": "string or null",
  "estimatedValue": "string or null",
  "periodOfPerformance": "string or null",
  "placeOfPerformance": "string or null",
  "contractType": "string or null",
  "classificationCode": "string or null",
  "pointsOfContact": [{"name": "string", "email": "string", "phone": "string", "role": "string"}] or null,
  "requirements": ["string"] or null,
  "keywords": ["string"] or null,
  "sowAttachmentUrl": "string or null",
  "sowAttachmentType": "string or null"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a contract parsing assistant. Extract structured data from SAM.gov HTML pages and return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent extraction
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedData: ParsedContractData
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[1])
      } else {
        throw parseError
      }
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
    }, {
      headers: corsHeaders,
    })
  } catch (error: any) {
    console.error('Error parsing HTML with AI:', error)
    return NextResponse.json(
      {
        error: 'Failed to parse HTML',
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

