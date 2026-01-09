'use client'

import { useState } from 'react'
import Link from 'next/link'

type ServiceCategory = 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
type IngestionStatus = 'discovered' | 'verified' | 'in_review' | 'ignored'

interface DiscoveryResult {
  id: string
  title: string
  url: string
  domain: string
  snippet?: string
  document_type?: string
  notice_id?: string
  solicitation_number?: string
  agency?: string
  naics_codes?: string[]
  set_aside?: string[]
  location_mentions?: string[]
  detected_keywords?: string[]
  relevance_score: number
  detected_service_category?: ServiceCategory
  ingestion_status: IngestionStatus
  verified: boolean
  created_at: string
}

type Pillar = 'Security' | 'Infrastructure' | 'Quality' | 'Governance'

interface SearchTemplate {
  name: string
  description: string
  query: string
  keywords: string
  category: 'vetcert' | 'rmf' | 'general'
  pillar?: Pillar
}

const SEARCH_TEMPLATES: SearchTemplate[] = [
  // Security Pillar - Patrick Caruso
  {
    name: 'Security: VetCert SDVOSB Set-Asides (Cyber/RMF)',
    description: 'SBA-certified SDVOSB set-aside opportunities for cybersecurity and RMF',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53" OR "ISSO" OR "ISSM")',
    keywords: 'VetCert, SDVOSB, RMF, cybersecurity',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VetCert SDVOSB Sole Source (Cyber/RMF)',
    description: 'SBA-certified SDVOSB sole source opportunities for cybersecurity and RMF',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source" OR "SDVOSB Sole Source") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53" OR "ISSO" OR "ISSM")',
    keywords: 'VetCert, SDVOSB, sole source, RMF',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VA Veterans First VOSB (Cyber/RMF)',
    description: 'VA-specific veteran-owned set-aside opportunities for cybersecurity',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Veteran-Owned Small Business Set Aside, Department of Veterans Affairs" OR "VOSB Set Aside, Department of Veterans Affairs") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53")',
    keywords: 'VA, VOSB, Veterans First, RMF',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VetCert RMF Roles (ISSO/ISSM/ISSE)',
    description: 'VetCert-eligible opportunities requiring ISSO, ISSM, or ISSE roles',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("ISSO" OR "ISSM" OR "ISSE" OR "Information System Security Officer" OR "Information System Security Manager")',
    keywords: 'ISSO, ISSM, ISSE, VetCert, RMF roles',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VetCert eMASS & ATO Support',
    description: 'VetCert-eligible opportunities for eMASS and ATO support services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("eMASS" OR "ATO" OR "Authorization to Operate" OR "SSP" OR "System Security Plan")',
    keywords: 'eMASS, ATO, SSP, VetCert',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VetCert NIST 800-53 & Control Assessment',
    description: 'VetCert-eligible opportunities for NIST 800-53 compliance and control assessment',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("NIST 800-53" OR "security control assessment" OR "SCA" OR "control assessment" OR "continuous monitoring")',
    keywords: 'NIST 800-53, SCA, control assessment, VetCert',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: RMF & ATO Services',
    description: 'Risk Management Framework and Authorization to Operate contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("RMF" OR "Risk Management Framework" OR "ATO" OR "Authorization to Operate" OR "STIG")',
    keywords: 'RMF, ATO, STIG',
    category: 'rmf',
    pillar: 'Security',
  },
  {
    name: 'Security: Cybersecurity & STIG Compliance',
    description: 'STIG compliance and cybersecurity assessment contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("STIG" OR "Security Technical Implementation Guide" OR "cybersecurity assessment" OR "security control assessment")',
    keywords: 'STIG, cybersecurity, assessment',
    category: 'rmf',
    pillar: 'Security',
  },
  {
    name: 'Security: NIST 800-53 Compliance',
    description: 'NIST 800-53 security control implementation and assessment',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("NIST 800-53" OR "security controls" OR "control assessment" OR "SCA")',
    keywords: 'NIST, security controls, SCA',
    category: 'rmf',
    pillar: 'Security',
  },
  {
    name: 'Security: DoD Cybersecurity',
    description: 'Department of Defense cybersecurity and RMF contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Department of Defense" OR "DoD" OR "Air Force" OR "Navy" OR "Army") ("RMF" OR "ATO" OR "cybersecurity" OR "STIG")',
    keywords: 'DoD, military, cybersecurity',
    category: 'rmf',
    pillar: 'Security',
  },
  {
    name: 'Security: Continuous Monitoring',
    description: 'ConMon and continuous monitoring services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Continuous Monitoring" OR "ConMon" OR "continuous assessment" OR "security monitoring")',
    keywords: 'ConMon, monitoring, assessment',
    category: 'rmf',
    pillar: 'Security',
  },
  {
    name: 'Security: GSA HACS VetCert Opportunities',
    description: 'GSA MAS HACS SIN opportunities for VetCert-eligible businesses',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("54151HACS" OR "HACS" OR "Highly Adaptive Cybersecurity Services") ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("RMF" OR "ATO" OR "cybersecurity")',
    keywords: 'GSA HACS, 54151HACS, VetCert, RMF',
    category: 'vetcert',
    pillar: 'Security',
  },
  {
    name: 'Security: VetCert Cyber NAICS (541512/541519/541511)',
    description: 'VetCert-eligible opportunities with cyber/RMF NAICS codes',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("NAICS 541512" OR "NAICS 541519" OR "NAICS 541511") ("RMF" OR "cybersecurity" OR "ATO")',
    keywords: 'NAICS 541512, NAICS 541519, NAICS 541511, VetCert',
    category: 'vetcert',
    pillar: 'Security',
  },
  
  // Infrastructure Pillar - James Adams
  {
    name: 'Infrastructure: Data Center Services (VetCert)',
    description: 'VetCert-eligible data center architecture, design, and deployment opportunities',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("data center" OR "datacenter" OR "data center architecture" OR "data center design" OR "data center deployment")',
    keywords: 'VetCert, data center, architecture, deployment',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Storage & Backup Solutions (VetCert)',
    description: 'VetCert-eligible storage systems, backup, and data management contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("storage" OR "backup" OR "data storage" OR "backup solutions" OR "storage systems" OR "SAN" OR "NAS")',
    keywords: 'VetCert, storage, backup, SAN, NAS',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Network Architecture & Configuration (VetCert)',
    description: 'VetCert-eligible network design, configuration, and security infrastructure',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("network architecture" OR "network design" OR "network configuration" OR "network infrastructure" OR "routing" OR "switching")',
    keywords: 'VetCert, network, architecture, configuration',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Virtualization & Cloud Platforms (VetCert)',
    description: 'VetCert-eligible virtualization, cloud migration, and platform services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("virtualization" OR "cloud migration" OR "cloud platform" OR "VMware" OR "Hyper-V" OR "virtual infrastructure")',
    keywords: 'VetCert, virtualization, cloud, VMware',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Infrastructure as Code (IaC) (VetCert)',
    description: 'VetCert-eligible infrastructure automation, IaC, and deployment optimization',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("Infrastructure as Code" OR "IaC" OR "infrastructure automation" OR "deployment automation" OR "Ansible" OR "Terraform")',
    keywords: 'VetCert, IaC, automation, Ansible, Terraform',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Performance Optimization & Capacity Planning (VetCert)',
    description: 'VetCert-eligible system performance, optimization, and capacity planning services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("performance optimization" OR "capacity planning" OR "system performance" OR "performance tuning" OR "resource optimization")',
    keywords: 'VetCert, performance, optimization, capacity planning',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Health Monitoring & Observability (VetCert)',
    description: 'VetCert-eligible infrastructure monitoring, health checks, and observability platforms',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("infrastructure monitoring" OR "health monitoring" OR "system monitoring" OR "observability" OR "infrastructure health")',
    keywords: 'VetCert, monitoring, observability, health checks',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  
  // Quality Pillar - Brian MacDonald
  {
    name: 'Quality: ISO Compliance & Certification (VetCert)',
    description: 'VetCert-eligible ISO 9001, ISO 17025, and quality management system opportunities',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("ISO 9001" OR "ISO 17025" OR "ISO compliance" OR "quality management system" OR "QMS" OR "ISO certification")',
    keywords: 'VetCert, ISO, QMS, compliance, certification',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Audit Readiness & Compliance (VetCert)',
    description: 'VetCert-eligible audit readiness, compliance assessment, and audit support services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("audit readiness" OR "audit support" OR "compliance assessment" OR "internal audit" OR "external audit" OR "audit preparation")',
    keywords: 'VetCert, audit, readiness, compliance',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Metrology & Calibration Services (VetCert)',
    description: 'VetCert-eligible metrology management, calibration, and measurement services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("metrology" OR "calibration" OR "measurement services" OR "calibration services" OR "metrology management")',
    keywords: 'VetCert, metrology, calibration, measurement',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Process Documentation & SOP Automation (VetCert)',
    description: 'VetCert-eligible standard operating procedures, process documentation, and automation',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("SOP" OR "standard operating procedure" OR "process documentation" OR "procedure automation" OR "process standardization")',
    keywords: 'VetCert, SOP, documentation, process automation',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Quality Assurance & Testing (VetCert)',
    description: 'VetCert-eligible QA services, testing, and quality control opportunities',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("quality assurance" OR "QA" OR "quality control" OR "testing services" OR "quality testing")',
    keywords: 'VetCert, QA, quality assurance, testing',
    category: 'vetcert',
    pillar: 'Quality',
  },
  
  // Governance Pillar - John Milso
  {
    name: 'Governance: Contract Management & Administration (VetCert)',
    description: 'VetCert-eligible contract management, administration, and contract lifecycle services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("contract management" OR "contract administration" OR "contract lifecycle" OR "contract support")',
    keywords: 'VetCert, contract management, administration, lifecycle',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Legal Document Generation (VetCert)',
    description: 'VetCert-eligible legal document generation, contract drafting, and document automation',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("legal document" OR "contract drafting" OR "document generation" OR "legal document automation" OR "contract templates")',
    keywords: 'VetCert, legal documents, contract drafting, automation',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Risk Analysis & Assessment (VetCert)',
    description: 'VetCert-eligible risk analysis, risk assessment, and risk management services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("risk analysis" OR "risk assessment" OR "risk management" OR "risk identification" OR "risk mitigation")',
    keywords: 'VetCert, risk analysis, assessment, management',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Corporate Governance & Compliance (VetCert)',
    description: 'VetCert-eligible corporate governance, compliance, and regulatory advisory services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("corporate governance" OR "governance advisory" OR "regulatory compliance" OR "compliance advisory")',
    keywords: 'VetCert, corporate governance, compliance, advisory',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Due Diligence & M&A Support (VetCert)',
    description: 'VetCert-eligible due diligence, M&A support, and transactional legal services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("due diligence" OR "M&A" OR "mergers and acquisitions" OR "transactional support" OR "acquisition support")',
    keywords: 'VetCert, due diligence, M&A, transactional',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Litigation Support (VetCert)',
    description: 'VetCert-eligible litigation support, legal research, and case management services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("litigation support" OR "legal research" OR "case management" OR "legal support services")',
    keywords: 'VetCert, litigation, legal research, case management',
    category: 'vetcert',
    pillar: 'Governance',
  },
]

export default function ContractDiscoveryPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<SearchTemplate | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<'past_week' | 'past_month' | 'past_year'>('past_month')
  const [templateFilter, setTemplateFilter] = useState<'all' | 'vetcert' | 'rmf' | 'general'>('all')
  const [pillarFilter, setPillarFilter] = useState<'all' | Pillar>('all')
  const [copiedQuery, setCopiedQuery] = useState(false)

  const handleSearch = async (template: SearchTemplate) => {
    const searchId = `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    console.log(`[${searchId}] Frontend: Search started`, {
      template: template.name,
      query: template.query,
      dateRange,
      timestamp: new Date().toISOString(),
    })
    
    setIsSearching(true)
    setError(null)
    setResults([])
    setSelectedTemplate(template)
    setSearchQuery(template.query)

    try {
      const requestBody = {
        query: template.query,
        num_results: 30,
        filters: {
          site: ['sam.gov'],
          date_range: dateRange,
        },
      }
      
      console.log(`[${searchId}] Frontend: Sending API request`, {
        url: '/api/admin/contract-discovery/search',
        method: 'POST',
        body: requestBody,
      })
      
      const requestStartTime = Date.now()
      const response = await fetch('/api/admin/contract-discovery/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const requestDuration = Date.now() - requestStartTime
      console.log(`[${searchId}] Frontend: API response received (${requestDuration}ms)`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      })

      let data: any
      try {
        data = await response.json()
        console.log(`[${searchId}] Frontend: Response data parsed`, {
          success: data.success,
          resultsCount: data.results_count || 0,
          hasResults: !!data.results && data.results.length > 0,
          resultsLength: data.results?.length || 0,
          hasError: !!data.error,
          error: data.error,
          hasWarnings: !!data.warnings && data.warnings.length > 0,
          warnings: data.warnings,
          requestId: data.requestId,
          query: data.query,
        })
      } catch (parseError) {
        console.error(`[${searchId}] Frontend: Failed to parse response JSON`, {
          error: parseError,
          status: response.status,
          statusText: response.statusText,
        })
        const text = await response.text()
        console.error(`[${searchId}] Frontend: Response text (first 500 chars):`, text.substring(0, 500))
        throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
      }

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Search failed'
        const fullMessage = data.details ? `${errorMessage}. ${data.details}` : errorMessage
        console.error(`[${searchId}] Frontend: API returned error`, {
          status: response.status,
          error: data.error,
          message: data.message,
          details: data.details,
          requestId: data.requestId,
        })
        throw new Error(fullMessage)
      }

      if (data.warnings && data.warnings.length > 0) {
        console.warn(`[${searchId}] Frontend: API warnings`, data.warnings)
        setError(`Note: ${data.warnings[0]}. Results are still available.`)
      }

      console.log(`[${searchId}] Frontend: Setting results`, {
        resultsCount: data.results?.length || 0,
        sampleResult: data.results?.[0] ? {
          title: data.results[0].title,
          url: data.results[0].url,
          relevanceScore: data.results[0].relevance_score,
        } : null,
      })
      
      setResults(data.results || [])
      setSearchQuery(data.query || template.query)
      
      if (data.results && data.results.length === 0) {
        console.warn(`[${searchId}] Frontend: No results returned`, {
          query: data.query,
          requestId: data.requestId,
        })
        setError('No results found. Try a different search template or adjust the date range.')
      } else {
        setError(null)
        console.log(`[${searchId}] Frontend: Search completed successfully`, {
          resultsCount: data.results?.length || 0,
        })
      }
    } catch (err) {
      console.error(`[${searchId}] Frontend: Search error`, {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined,
      })
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      
      // Check if it's a SerpAPI key error
      if (errorMessage.includes('SerpAPI key') || errorMessage.includes('SERPAPI_KEY')) {
        setError('SerpAPI key not configured. Please set the SERPAPI_KEY environment variable. Get your key from https://serpapi.com/manage-api-key')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsSearching(false)
      console.log(`[${searchId}] Frontend: Search finished`)
    }
  }

  const handleOpenOpportunity = (url: string, id: string) => {
    window.open(url, '_blank')
    
    fetch(`/api/admin/contract-discovery/${id}/download`, {
      method: 'POST',
    }).catch(err => console.error('Error marking as viewed:', err))
  }

  const filteredTemplates = SEARCH_TEMPLATES.filter(t => {
    const matchesCategory = templateFilter === 'all' || t.category === templateFilter
    const matchesPillar = pillarFilter === 'all' || t.pillar === pillarFilter
    return matchesCategory && matchesPillar
  })

  const copyQueryToClipboard = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query)
      setCopiedQuery(true)
      setTimeout(() => setCopiedQuery(false), 2000)
    } catch (err) {
      console.error('Failed to copy query:', err)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-hero mb-2">Contract Opportunity Discovery</h1>
              <p className="text-body text-neutral-600">
                Find VetCert-eligible and RMF opportunities on SAM.gov
              </p>
            </div>
            <Link href="/admin" className="btn-secondary">
              Back to Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Search Section */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 lg:p-12">
            <div className="mb-6">
              <h2 className="heading-2 mb-4">Quick Search</h2>
              
              {/* Important Notice */}
              <div className="bg-yellow-50 border-2 border-yellow-400 p-4 rounded-sm mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-yellow-600 text-xl flex-shrink-0 mt-0.5">⚠️</div>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-yellow-900 mb-2">
                      Temporary Workaround: Copy Query to Google
                    </p>
                    <p className="text-body-sm text-yellow-800 mb-3">
                      Due to current SerpAPI limitations, we recommend copying the generated query and pasting it directly into Google Search for best results. Click the &quot;Copy Query&quot; button below after selecting a template.
                    </p>
                    <a
                      href="https://www.google.com/search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-body-sm font-medium text-yellow-900 hover:text-yellow-950 underline"
                    >
                      Open Google Search →
                    </a>
                  </div>
                </div>
              </div>
              
              <p className="text-body-sm text-neutral-600 mb-6">
                Select a pre-configured search template to find contract opportunities on SAM.gov. 
                All searches target opportunity listing pages (not PDF attachments).
              </p>
              
              {/* Date Range */}
              <div className="mb-6">
                <label htmlFor="date-range" className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Date Range
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'past_week' | 'past_month' | 'past_year')}
                  className="px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                >
                  <option value="past_week">Past Week</option>
                  <option value="past_month">Past Month (Recommended)</option>
                  <option value="past_year">Past Year</option>
                </select>
              </div>

              {/* Pillar Filter */}
              <div className="mb-4">
                <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Filter by Pillar
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'Security', 'Infrastructure', 'Quality', 'Governance'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPillarFilter(filter)}
                      className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors ${
                        pillarFilter === filter
                          ? 'bg-accent-700 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {filter === 'all' ? 'All Pillars' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Filter */}
              <div className="mb-6">
                <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                  Filter by Category
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'vetcert', 'rmf'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTemplateFilter(filter)}
                      className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors ${
                        templateFilter === filter
                          ? 'bg-accent-700 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {filter === 'all' ? 'All Categories' : filter === 'vetcert' ? 'VetCert' : 'RMF'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, idx) => {
                const pillarColors = {
                  Security: 'bg-red-100 text-red-800 border-red-300',
                  Infrastructure: 'bg-blue-100 text-blue-800 border-blue-300',
                  Quality: 'bg-green-100 text-green-800 border-green-300',
                  Governance: 'bg-purple-100 text-purple-800 border-purple-300',
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSearch(template)}
                    disabled={isSearching}
                    className={`text-left p-4 border-2 rounded-sm transition-all ${
                      selectedTemplate?.name === template.name
                        ? 'border-accent-700 bg-accent-50'
                        : 'border-neutral-200 bg-white hover:border-accent-500 hover:bg-accent-50'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="flex items-start justify-between mb-2 gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-body-sm font-semibold text-neutral-900 mb-1">
                          {template.name}
                        </h3>
                        {template.pillar && (
                          <span className={`inline-block px-2 py-0.5 text-body-xs font-medium rounded border ${pillarColors[template.pillar]}`}>
                            {template.pillar}
                          </span>
                        )}
                      </div>
                      {isSearching && selectedTemplate?.name === template.name && (
                        <div className="animate-spin h-4 w-4 border-2 border-accent-700 border-t-transparent rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-body-xs text-neutral-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.keywords.split(', ').slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-body-xs rounded"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-sm">
                <p className="text-body-sm text-red-800 font-semibold mb-2">Error</p>
                <p className="text-body-sm text-red-700 mb-2">{error}</p>
                {error.includes('SerpAPI key') && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-body-xs text-red-600 mb-2">
                      <strong>Setup Instructions:</strong>
                    </p>
                    <ol className="text-body-xs text-red-600 list-decimal list-inside space-y-1">
                      <li>Get your SerpAPI key from <a href="https://serpapi.com/manage-api-key" target="_blank" rel="noopener noreferrer" className="underline">serpapi.com/manage-api-key</a></li>
                      <li>Add <code className="bg-red-100 px-1 rounded">SERPAPI_KEY=your-key-here</code> to your environment variables</li>
                      <li>For Railway: Add it in the Variables section of your project settings</li>
                      <li>Restart your application after adding the key</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Search Query Display */}
            {searchQuery && (
              <div className="mt-6 bg-neutral-50 border-2 border-accent-500 p-4 rounded-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="text-body-sm font-semibold text-neutral-900">Google Search Query:</p>
                  <button
                    onClick={() => copyQueryToClipboard(searchQuery)}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-700 text-white text-body-sm font-medium rounded-sm hover:bg-accent-800 transition-colors flex-shrink-0"
                  >
                    {copiedQuery ? (
                      <>
                        <span>✓</span>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <span>📋</span>
                        <span>Copy Query</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white border border-neutral-300 p-3 rounded-sm mb-3">
                  <p className="text-body-sm text-neutral-700 font-mono break-all">{searchQuery}</p>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-accent-700 hover:text-accent-800 underline"
                  >
                    🔍 Search on Google →
                  </a>
                  <p className="text-body-xs text-neutral-600">
                    Copy the query above and paste it into Google Search, or click the link to search directly.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {results.length > 0 && (
        <section className="section-container bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="heading-2">Opportunities Found ({results.length})</h2>
              <div className="text-body-sm text-neutral-600">
                Sorted by relevance
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Opportunity</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Agency</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Details</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {results
                      .sort((a, b) => b.relevance_score - a.relevance_score)
                      .map((result) => (
                        <tr key={result.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <div className="max-w-md">
                              <p className="text-body-sm font-medium text-neutral-900 mb-1 line-clamp-2">
                                {result.title}
                              </p>
                              {result.snippet && (
                                <p className="text-body-sm text-neutral-600 line-clamp-2">
                                  {result.snippet}
                                </p>
                              )}
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-body-xs text-accent-700 hover:text-accent-800 mt-1 inline-block break-all"
                              >
                                {result.url}
                              </a>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {result.agency && (
                              <p className="text-body-sm text-neutral-700">{result.agency}</p>
                            )}
                            {result.notice_id && (
                              <p className="text-body-xs text-neutral-500 mt-1">
                                Notice: {result.notice_id}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {result.set_aside && result.set_aside.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {result.set_aside.slice(0, 2).map((sa, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-body-xs rounded"
                                    >
                                      {sa}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {result.detected_keywords && result.detected_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {result.detected_keywords.slice(0, 3).map((kw, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-block px-2 py-0.5 bg-accent-50 text-accent-700 text-body-xs rounded"
                                    >
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {result.naics_codes && result.naics_codes.length > 0 && (
                                <p className="text-body-xs text-neutral-500">
                                  NAICS: {result.naics_codes.join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleOpenOpportunity(result.url, result.id)}
                              className="btn-primary text-body-sm px-4 py-2"
                            >
                              View on SAM.gov
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
