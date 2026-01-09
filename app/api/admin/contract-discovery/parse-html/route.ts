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

    const prompt = `You are parsing a SAM.gov contract opportunity page HTML. Extract structured information accurately from the HTML.

CRITICAL EXTRACTION RULES:

1. TITLE: Extract the exact contract title (usually in an h1 or title element). Do NOT include "Contract Opportunity" or "SAM.gov" in the title.

2. NOTICE ID: Look for "Notice ID" label followed by the ID value (e.g., "N6945026R0025"). Extract ONLY the ID value, not the label "Notice ID".

3. SOLICITATION NUMBER: Look for "Solicitation Number" or similar labels. Extract ONLY the number/value, not the label text.

4. DESCRIPTION: Extract the FULL description text from the "Description" section. Include amendment text if present. Stop extraction at "Contact Information", "Attachments", "Links", or footer sections. Include the complete description including amendment details.

5. SET-ASIDE: Extract the exact set-aside text (e.g., "Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source"). Normalize to abbreviations: SDVOSB, VOSB, 8(a), HUBZone, WOSB, Small Business Set-Aside.

6. POINTS OF CONTACT:
   - Extract name: Just the person's name (e.g., "Cyndi Cisneros"), NOT "Primary Point of Contact" or "Information"
   - Extract email: Full email address
   - Extract phone: Phone number with formatting
   - Extract role: "Primary Point of Contact" or "Alternative Point of Contact" or specific role

7. DEADLINE: Look for "Date Offers Due" or "Response Deadline" - extract the full date/time string.

8. POSTED DATE: Look for "Published Date" - extract the full date/time string.

9. AGENCY: Extract the full agency path (e.g., "DEPT OF DEFENSE > DEPT OF THE NAVY > NAVFAC")

10. NAICS CODE: Extract the 6-digit code (e.g., "237310")

11. PLACE OF PERFORMANCE: Extract the full address/location text.

Extract these fields:
- title: Contract opportunity title (exact text, no labels)
- description: Complete description including amendments (stop before Contact Information)
- noticeId: Notice ID value only (e.g., "N6945026R0025")
- solicitationNumber: Solicitation number value only
- agency: Full agency hierarchy
- naicsCodes: Array of 6-digit NAICS codes
- setAside: Array of normalized set-aside types (SDVOSB, VOSB, etc.)
- deadline: "Date Offers Due" value
- responseDeadline: Same as deadline
- postedDate: "Published Date" value
- estimatedValue: Contract value if present
- periodOfPerformance: Period of performance if present
- placeOfPerformance: Full place of performance address
- contractType: Contract type (Solicitation, RFP, RFQ, etc.)
- classificationCode: Product Service Code (PSC) if present
- pointsOfContact: Array of {name, email, phone, role} objects
- requirements: Array of key requirements
- keywords: Array of relevant keywords
- sowAttachmentUrl: URL to attachments if present
- sowAttachmentType: Attachment type

HTML Content:
${htmlContent.substring(0, 150000)}

URL: ${url || 'Unknown'}

Return ONLY valid JSON in this exact format (use null for missing fields, empty arrays [] for missing arrays):
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

    // Clean and validate the parsed data
    const cleanedData: ParsedContractData = {
      ...parsedData,
      // Clean notice ID - remove "Notice ID" label if present
      noticeId: parsedData.noticeId 
        ? parsedData.noticeId.replace(/^notice\s+id\s*:?\s*/i, '').trim() || null
        : null,
      
      // Clean solicitation number - remove label if present
      solicitationNumber: parsedData.solicitationNumber
        ? parsedData.solicitationNumber.replace(/^solicitation\s+(number\s*:?\s*)?/i, '').trim() || null
        : null,
      
      // Clean title - remove common suffixes
      title: parsedData.title
        ? parsedData.title.replace(/\s*-\s*SAM\.gov\s*$/i, '').replace(/\s*-\s*Contract Opportunity\s*$/i, '').trim() || null
        : null,
      
      // Clean description - ensure it's complete
      description: parsedData.description
        ? parsedData.description.trim() || null
        : null,
      
      // Clean POC names - remove "Primary Point of Contact", "Information", etc.
      pointsOfContact: parsedData.pointsOfContact?.map(poc => ({
        name: poc.name?.replace(/^(primary\s+point\s+of\s+contact|alternative\s+point\s+of\s+contact|information)\s*/i, '').trim() || poc.name,
        email: poc.email?.trim() || poc.email,
        phone: poc.phone?.trim() || poc.phone,
        role: poc.role?.trim() || poc.role,
      })) || null,
      
      // Normalize set-aside values
      setAside: parsedData.setAside?.map(sa => {
        const normalized = sa.toUpperCase().trim()
        if (normalized.includes('SDVOSB') || normalized.includes('SERVICE-DISABLED')) return 'SDVOSB'
        if (normalized.includes('VOSB') || normalized.includes('VETERAN-OWNED')) return 'VOSB'
        if (normalized.includes('8(A)') || normalized.includes('8A')) return '8(a)'
        if (normalized.includes('HUBZONE') || normalized.includes('HUBZONE')) return 'HUBZone'
        if (normalized.includes('WOSB') || normalized.includes('WOMAN-OWNED')) return 'WOSB'
        if (normalized.includes('SMALL BUSINESS')) return 'Small Business Set-Aside'
        return sa
      }) || null,
      
      // Ensure arrays are arrays
      naicsCodes: Array.isArray(parsedData.naicsCodes) ? parsedData.naicsCodes : null,
      requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : null,
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : null,
    }

    return NextResponse.json({
      success: true,
      data: cleanedData,
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

