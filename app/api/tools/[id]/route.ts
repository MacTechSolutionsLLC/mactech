import { NextRequest, NextResponse } from 'next/server'

// Map tool IDs to their platform API paths
const toolApiMap: Record<string, string> = {
  // Infrastructure
  'data-center-deployment': '/api/infrastructure/deployment',
  'infrastructure-health-monitoring': '/api/infrastructure/health',
  'network-config-automation': '/api/infrastructure/network',
  
  // Quality Assurance
  'iso-compliance-platform': '/api/qa/iso-compliance',
  'sop-automation-module': '/api/qa/sop-automation',
  'metrology-management': '/api/qa/metrology',
  'audit-readiness-platform': '/api/qa/audit-readiness',
  
  // Legal & Contracts
  'contract-management-platform': '/api/legal/contract-management',
  'legal-document-generation': '/api/legal/document-generation',
  'contract-risk-analysis': '/api/legal/risk-analysis',
  
  // Cybersecurity & RMF
  'rmf-requirements-management': '/api/cybersecurity/rmf/requirements',
  'security-architecture': '/api/cybersecurity/security-architecture',
  'vulnerability-compliance': '/api/cybersecurity/vulnerability',
  'security-documentation': '/api/cybersecurity/security-documentation',
  'cybersecurity-team-leadership': '/api/cybersecurity/team-leadership',
  
  // Compliance & Security
  'stig-compliance-validation': '/api/compliance/stig-compliance',
  'evidence-collection': '/api/compliance/evidence-collection',
  'rmf-artifacts': '/api/compliance/rmf-artifacts',
  
  // Support Automation
  'ticket-routing-platform': '/api/support/ticket-routing',
  'knowledge-base-automation': '/api/support/knowledge-base',
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiPath = toolApiMap[id]

  if (!apiPath) {
    return NextResponse.json(
      { success: false, error: `Tool ${id} not found` },
      { status: 404 }
    )
  }

  try {
    // Forward the request to the platform API
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const platformUrl = new URL(`${url.origin}${apiPath}`)
    searchParams.forEach((value, key) => {
      platformUrl.searchParams.append(key, value)
    })

    const response = await fetch(platformUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`Error proxying request for tool ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiPath = toolApiMap[id]

  if (!apiPath) {
    return NextResponse.json(
      { success: false, error: `Tool ${id} not found` },
      { status: 404 }
    )
  }

  try {
    const body = await request.json()
    const url = new URL(request.url)
    const platformUrl = new URL(`${url.origin}${apiPath}`)
    
    // Preserve pathname segments if present
    const pathname = new URL(request.url).pathname
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 3) {
      // Additional path segments after /api/tools/[id]
      const extraPath = '/' + segments.slice(3).join('/')
      platformUrl.pathname = apiPath + extraPath
    }

    const response = await fetch(platformUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error(`Error proxying request for tool ${id}:`, error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

