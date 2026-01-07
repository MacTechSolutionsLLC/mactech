import { NextRequest, NextResponse } from 'next/server'
import { getJson } from 'serpapi'

interface QueryTest {
  name: string
  query: string
  description: string
}

const queryTemplates: QueryTest[] = [
  {
    name: 'RMF & ATO Services',
    description: 'Focus on Risk Management Framework and Authorization to Operate contracts',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "Performance Work Statement") ("RMF" OR "Risk Management Framework" OR "ATO" OR "Authorization to Operate" OR "STIG" OR "Security Technical Implementation Guide")'
  },
  {
    name: 'Cybersecurity & STIG Compliance',
    description: 'STIG compliance and cybersecurity assessment contracts',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("STIG" OR "Security Technical Implementation Guide" OR "cybersecurity assessment" OR "security control assessment")'
  },
  {
    name: 'Infrastructure Engineering',
    description: 'Infrastructure, cloud migration, and systems engineering',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("infrastructure engineering" OR "cloud migration" OR "systems engineering" OR "platform engineering" OR "IaC" OR "infrastructure as code")'
  },
  {
    name: 'ISO Compliance & Quality',
    description: 'ISO certification, quality management, and audit readiness',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("ISO 9001" OR "ISO 17025" OR "ISO 27001" OR "quality management system" OR "audit readiness" OR "QMS")'
  },
  {
    name: 'Veteran-Owned Set-Asides',
    description: 'SDVOSB and veteran-owned set-aside opportunities',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("SDVOSB" OR "Service-Disabled Veteran" OR "veteran-owned" OR "VOSB") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance")'
  },
  {
    name: 'DoD Cybersecurity',
    description: 'Department of Defense cybersecurity and RMF contracts',
    query: 'filetype:pdf site:sam.gov ("Statement of Work" OR "PWS") ("Department of Defense" OR "DoD" OR "Air Force" OR "Navy" OR "Army") ("RMF" OR "ATO" OR "cybersecurity" OR "STIG" OR "security assessment")'
  },
  {
    name: 'Continuous Monitoring',
    description: 'ConMon and continuous monitoring services',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Continuous Monitoring" OR "ConMon" OR "continuous assessment" OR "security monitoring")'
  },
  {
    name: 'NIST 800-53 Compliance',
    description: 'NIST 800-53 security control implementation and assessment',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NIST 800-53" OR "security controls" OR "control assessment" OR "SCA")'
  },
  {
    name: 'CMMC & Defense Contractors',
    description: 'CMMC compliance for defense contractors',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("CMMC" OR "Cybersecurity Maturity Model Certification" OR "defense contractor" OR "DFARS")'
  },
  {
    name: 'Boston Area Government Contracts',
    description: 'Government contracts in Boston/New England area',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Boston" OR "Massachusetts" OR "New England" OR "Rhode Island") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance")'
  },
  {
    name: 'Small Business Set-Asides',
    description: 'Small business, 8(a), and HUBZone opportunities',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("small business" OR "8(a)" OR "HUBZone" OR "WOSB") ("cybersecurity" OR "RMF" OR "infrastructure" OR "compliance")'
  },
  {
    name: 'NAICS 541330 & 541511',
    description: 'Engineering and cybersecurity services by NAICS codes',
    query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NAICS 541330" OR "NAICS 541511" OR "NAICS 541512")'
  }
]

export async function GET(request: NextRequest) {
  try {
    const serpApiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY
    if (!serpApiKey) {
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      )
    }

    const testIndex = parseInt(request.nextUrl.searchParams.get('index') || '0')
    const template = queryTemplates[testIndex]

    if (!template) {
      return NextResponse.json(
        { error: 'Invalid template index' },
        { status: 400 }
      )
    }

    console.log(`Testing query ${testIndex + 1}/${queryTemplates.length}: ${template.name}`)
    console.log(`Query: ${template.query}`)

    const results = await getJson({
      engine: 'google',
      q: template.query,
      api_key: serpApiKey,
      num: 10,
      tbs: 'qdr:y', // Past year
    })

    const organicResults = results.organic_results || []
    
    // Analyze relevance
    const relevantResults = organicResults.filter((r: any) => {
      const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase()
      return text.includes('statement of work') || 
             text.includes('pws') || 
             text.includes('performance work statement') ||
             text.includes('sow') ||
             (r.link && r.link.includes('.pdf'))
    })

    return NextResponse.json({
      success: true,
      template: {
        name: template.name,
        description: template.description,
        query: template.query,
      },
      results: {
        total: organicResults.length,
        relevant: relevantResults.length,
        topResults: organicResults.slice(0, 5).map((r: any) => ({
          title: r.title,
          url: r.link,
          domain: r.displayed_link,
          snippet: r.snippet?.substring(0, 200),
        })),
      },
      totalTemplates: queryTemplates.length,
      currentIndex: testIndex,
    })
  } catch (error) {
    console.error('Error testing query:', error)
    return NextResponse.json(
      {
        error: 'Failed to test query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const serpApiKey = process.env.SERPAPI_KEY || process.env.SERP_API_KEY
    if (!serpApiKey) {
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { query, name } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    console.log(`Testing custom query: ${name || 'Custom'}`)
    console.log(`Query: ${query}`)

    const results = await getJson({
      engine: 'google',
      q: query,
      api_key: serpApiKey,
      num: 10,
      tbs: 'qdr:y',
    })

    const organicResults = results.organic_results || []
    
    const relevantResults = organicResults.filter((r: any) => {
      const text = `${r.title || ''} ${r.snippet || ''}`.toLowerCase()
      return text.includes('statement of work') || 
             text.includes('pws') || 
             text.includes('performance work statement') ||
             text.includes('sow') ||
             (r.link && r.link.includes('.pdf'))
    })

    return NextResponse.json({
      success: true,
      query,
      results: {
        total: organicResults.length,
        relevant: relevantResults.length,
        topResults: organicResults.slice(0, 5).map((r: any) => ({
          title: r.title,
          url: r.link,
          domain: r.displayed_link,
          snippet: r.snippet?.substring(0, 200),
        })),
      },
    })
  } catch (error) {
    console.error('Error testing custom query:', error)
    return NextResponse.json(
      {
        error: 'Failed to test query',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

