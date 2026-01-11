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
  // Scraping fields
  scraped?: boolean
  scraped_at?: string
  sow_attachment_url?: string
  sow_attachment_type?: string
  sow_scraped?: boolean
  analysis_summary?: string
  analysis_confidence?: number
  analysis_keywords?: string[]
  dismissed?: boolean
  validation?: {
    valid: boolean
    score: number
    errors: string[]
    warnings: string[]
    completeness: number
  }
}

interface GoogleQuery {
  query: string
  description: string
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
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("data center" OR "datacenter" OR "data center architecture" OR "data center design" OR "data center deployment")',
    keywords: 'VetCert, SDVOSB, VOSB, data center, architecture, deployment',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Storage & Backup Solutions (VetCert)',
    description: 'VetCert-eligible storage systems, backup, and data management contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("storage" OR "backup" OR "data storage" OR "backup solutions" OR "storage systems" OR "SAN" OR "NAS")',
    keywords: 'VetCert, SDVOSB, VOSB, storage, backup, SAN, NAS',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Network Architecture & Configuration (VetCert)',
    description: 'VetCert-eligible network design, configuration, and security infrastructure',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("network architecture" OR "network design" OR "network configuration" OR "network infrastructure" OR "routing" OR "switching")',
    keywords: 'VetCert, SDVOSB, VOSB, network, architecture, configuration',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Virtualization & Cloud Platforms (VetCert)',
    description: 'VetCert-eligible virtualization, cloud migration, and platform services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("virtualization" OR "cloud migration" OR "cloud platform" OR "VMware" OR "Hyper-V" OR "virtual infrastructure")',
    keywords: 'VetCert, SDVOSB, VOSB, virtualization, cloud, VMware',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Infrastructure as Code (IaC) (VetCert)',
    description: 'VetCert-eligible infrastructure automation, IaC, and deployment optimization',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("Infrastructure as Code" OR "IaC" OR "infrastructure automation" OR "deployment automation" OR "Ansible" OR "Terraform")',
    keywords: 'VetCert, SDVOSB, VOSB, IaC, automation, Ansible, Terraform',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Performance Optimization & Capacity Planning (VetCert)',
    description: 'VetCert-eligible system performance, optimization, and capacity planning services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("performance optimization" OR "capacity planning" OR "system performance" OR "performance tuning" OR "resource optimization")',
    keywords: 'VetCert, SDVOSB, VOSB, performance, optimization, capacity planning',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  {
    name: 'Infrastructure: Health Monitoring & Observability (VetCert)',
    description: 'VetCert-eligible infrastructure monitoring, health checks, and observability platforms',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("infrastructure monitoring" OR "health monitoring" OR "system monitoring" OR "observability" OR "infrastructure health")',
    keywords: 'VetCert, SDVOSB, VOSB, monitoring, observability, health checks',
    category: 'vetcert',
    pillar: 'Infrastructure',
  },
  
  // Quality Pillar - Brian MacDonald
  {
    name: 'Quality: ISO Compliance & Certification (VetCert)',
    description: 'VetCert-eligible ISO 9001, ISO 17025, and quality management system opportunities',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("ISO 9001" OR "ISO 17025" OR "ISO compliance" OR "quality management system" OR "QMS" OR "ISO certification")',
    keywords: 'VetCert, SDVOSB, VOSB, ISO, QMS, compliance, certification',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Audit Readiness & Compliance (VetCert)',
    description: 'VetCert-eligible audit readiness, compliance assessment, and audit support services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("audit readiness" OR "audit support" OR "compliance assessment" OR "internal audit" OR "external audit" OR "audit preparation")',
    keywords: 'VetCert, SDVOSB, VOSB, audit, readiness, compliance',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Metrology & Calibration Services (VetCert)',
    description: 'VetCert-eligible metrology management, calibration, and measurement services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("metrology" OR "calibration" OR "measurement services" OR "calibration services" OR "metrology management")',
    keywords: 'VetCert, SDVOSB, VOSB, metrology, calibration, measurement',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Process Documentation & SOP Automation (VetCert)',
    description: 'VetCert-eligible standard operating procedures, process documentation, and automation',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("SOP" OR "standard operating procedure" OR "process documentation" OR "procedure automation" OR "process standardization")',
    keywords: 'VetCert, SDVOSB, VOSB, SOP, documentation, process automation',
    category: 'vetcert',
    pillar: 'Quality',
  },
  {
    name: 'Quality: Quality Assurance & Testing (VetCert)',
    description: 'VetCert-eligible QA services, testing, and quality control opportunities',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("quality assurance" OR "QA" OR "quality control" OR "testing services" OR "quality testing")',
    keywords: 'VetCert, SDVOSB, VOSB, QA, quality assurance, testing',
    category: 'vetcert',
    pillar: 'Quality',
  },
  
  // Governance Pillar - John Milso
  {
    name: 'Governance: Contract Management & Administration (VetCert)',
    description: 'VetCert-eligible contract management, administration, and contract lifecycle services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("contract management" OR "contract administration" OR "contract lifecycle" OR "contract support")',
    keywords: 'VetCert, SDVOSB, VOSB, contract management, administration, lifecycle',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Legal Document Generation (VetCert)',
    description: 'VetCert-eligible legal document generation, contract drafting, and document automation',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("legal document" OR "contract drafting" OR "document generation" OR "legal document automation" OR "contract templates")',
    keywords: 'VetCert, SDVOSB, VOSB, legal documents, contract drafting, automation',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Risk Analysis & Assessment (VetCert)',
    description: 'VetCert-eligible risk analysis, risk assessment, and risk management services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("risk analysis" OR "risk assessment" OR "risk management" OR "risk identification" OR "risk mitigation")',
    keywords: 'VetCert, SDVOSB, VOSB, risk analysis, assessment, management',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Corporate Governance & Compliance (VetCert)',
    description: 'VetCert-eligible corporate governance, compliance, and regulatory advisory services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("corporate governance" OR "governance advisory" OR "regulatory compliance" OR "compliance advisory")',
    keywords: 'VetCert, SDVOSB, VOSB, corporate governance, compliance, advisory',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Due Diligence & M&A Support (VetCert)',
    description: 'VetCert-eligible due diligence, M&A support, and transactional legal services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("due diligence" OR "M&A" OR "mergers and acquisitions" OR "transactional support" OR "acquisition support")',
    keywords: 'VetCert, SDVOSB, VOSB, due diligence, M&A, transactional',
    category: 'vetcert',
    pillar: 'Governance',
  },
  {
    name: 'Governance: Litigation Support (VetCert)',
    description: 'VetCert-eligible litigation support, legal research, and case management services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB" OR "VOSB Set Aside, Department of Veterans Affairs") ("litigation support" OR "legal research" OR "case management" OR "legal support services")',
    keywords: 'VetCert, SDVOSB, VOSB, litigation, legal research, case management',
    category: 'vetcert',
    pillar: 'Governance',
  },
]

export default function ContractDiscoveryPage() {
  // Unified search state
  const [keywords, setKeywords] = useState('')
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('cybersecurity')
  const [dateRange, setDateRange] = useState<'past_week' | 'past_month' | 'past_year'>('past_month')
  const [location, setLocation] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [naicsCodes, setNaicsCodes] = useState('')
  const [pscCodes, setPscCodes] = useState('')
  
  // Results state
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const [googleQuery, setGoogleQuery] = useState<GoogleQuery | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchStats, setSearchStats] = useState<{
    total: number
    valid: number
    invalid: number
    duplicates: number
    unique: number
    cached: boolean
    duration: number
  } | null>(null)
  
  // UI state
  const [copiedQuery, setCopiedQuery] = useState(false)
  const [scrapingIds, setScrapingIds] = useState<Set<string>>(new Set())
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const handleUnifiedSearch = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords for the search')
      return
    }
    
    setIsSearching(true)
    setError(null)
    setResults([])
    setGoogleQuery(null)
    setSearchStats(null)
    
    try {
      const requestBody = {
        keywords: keywords.trim(),
        service_category: serviceCategory,
        date_range: dateRange,
        location: location.trim() || undefined,
        naics_codes: naicsCodes.trim() ? naicsCodes.split(',').map(c => c.trim()).filter(c => c) : undefined,
        psc_codes: pscCodes.trim() ? pscCodes.split(',').map(c => c.trim()).filter(c => c) : undefined,
        limit: 30,
      }
      
      const response = await fetch('/api/admin/contract-discovery/search-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Search failed'
        if (response.status === 429 || errorMessage.includes('rate limit')) {
          throw new Error(`Rate limit exceeded: ${errorMessage}. Please try again later.`)
        }
        throw new Error(errorMessage)
      }
      
      if (data.success) {
        setResults(data.results || [])
        setGoogleQuery(data.googleQuery || null)
        setSearchStats(data.stats || null)
        
        if (data.results && data.results.length === 0) {
          setError('No results found. Try different keywords or adjust the date range.')
        }
      } else {
        throw new Error(data.error || 'Search failed')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }


  const handleOpenOpportunity = (url: string, id: string) => {
    window.open(url, '_blank')
    
    fetch(`/api/admin/contract-discovery/${id}/download`, {
      method: 'POST',
    }).catch(err => console.error('Error marking as viewed:', err))
  }

  const handleScrape = async (result: DiscoveryResult) => {
    setScrapingIds(prev => new Set(prev).add(result.id))
    try {
      const response = await fetch(`/api/admin/contract-discovery/${result.id}/scrape`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        // Update the result in state
        setResults(prev => prev.map(r => 
          r.id === result.id 
            ? { 
                ...r, 
                scraped: true, 
                scraped_at: new Date().toISOString(),
                sow_attachment_url: data.sowAttachmentUrl,
                sow_attachment_type: data.sowAttachmentType,
                analysis_summary: data.analysis?.summary,
                analysis_confidence: data.analysis?.confidence,
                analysis_keywords: data.analysis?.keywords || [],
              }
            : r
        ))
      } else {
        setError(data.error || 'Failed to scrape contract')
      }
    } catch (err) {
      console.error('Error scraping contract:', err)
      setError('Failed to scrape contract')
    } finally {
      setScrapingIds(prev => {
        const next = new Set(prev)
        next.delete(result.id)
        return next
      })
    }
  }

  const handleScrapeSOW = async (result: DiscoveryResult) => {
    if (!result.sow_attachment_url) return
    
    setScrapingIds(prev => new Set(prev).add(`${result.id}-sow`))
    try {
      const response = await fetch(`/api/admin/contract-discovery/${result.id}/scrape-sow`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => prev.map(r => 
          r.id === result.id 
            ? { ...r, sow_scraped: true }
            : r
        ))
      } else {
        setError(data.error || 'Failed to scrape SOW')
      }
    } catch (err) {
      console.error('Error scraping SOW:', err)
      setError('Failed to scrape SOW')
    } finally {
      setScrapingIds(prev => {
        const next = new Set(prev)
        next.delete(`${result.id}-sow`)
        return next
      })
    }
  }

  const handleAdd = async (result: DiscoveryResult) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${result.id}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'admin' }),
      })
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => prev.map(r => 
          r.id === result.id 
            ? { ...r, verified: true, ingestion_status: 'verified', dismissed: false }
            : r
        ))
      } else {
        setError(data.error || 'Failed to add contract')
      }
    } catch (err) {
      console.error('Error adding contract:', err)
      setError('Failed to add contract')
    }
  }

  const handleDismiss = async (result: DiscoveryResult) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${result.id}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissedBy: 'admin', reason: 'Not relevant' }),
      })
      const data = await response.json()
      
      if (data.success) {
        setResults(prev => prev.map(r => 
          r.id === result.id 
            ? { ...r, dismissed: true, ingestion_status: 'ignored' }
            : r
        ))
      } else {
        setError(data.error || 'Failed to dismiss contract')
      }
    } catch (err) {
      console.error('Error dismissing contract:', err)
      setError('Failed to dismiss contract')
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }


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
                Find VetCert-eligible opportunities on SAM.gov (All searches automatically filter for SDVOSB/VOSB)
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/contract-discovery/dashboard" className="btn-secondary">
                Dashboard
              </Link>
              <Link href="/admin" className="btn-secondary">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Unified Search Section */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 lg:p-12">
            <div className="mb-6">
              <h2 className="heading-2 mb-4">VetCert Contract Discovery</h2>
              
              <p className="text-body-sm text-neutral-600 mb-6">
                Enter comma-separated keywords to search for VetCert-eligible contract opportunities. 
                All searches automatically include SDVOSB and VOSB set-asides.
              </p>
              
              {/* VetCert Notice */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-sm mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-green-600 text-xl flex-shrink-0 mt-0.5">✓</div>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-green-900 mb-1">
                      VetCert-Focused Search
                    </p>
                    <p className="text-body-sm text-green-800">
                      All searches automatically filter for Service-Disabled Veteran-Owned Small Business (SDVOSB) 
                      and Veteran-Owned Small Business (VOSB) opportunities. NAICS and PSC codes are optimized for 
                      cyber/RMF opportunities by default.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Unified Search Form */}
              <div className="space-y-6">
                {/* Keywords Input */}
                <div>
                  <label htmlFor="keywords" className="block text-body-sm font-medium text-neutral-900 mb-2">
                    Keywords <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="keywords"
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., RMF, ATO, ISSO, cybersecurity, NIST 800-53"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSearching) {
                        handleUnifiedSearch()
                      }
                    }}
                  />
                  <p className="text-body-xs text-neutral-500 mt-1">
                    Enter comma-separated keywords. All searches automatically include VetCert set-asides (SDVOSB/VOSB).
                  </p>
                </div>
                    
                {/* Service Category */}
                <div>
                  <label htmlFor="service-category" className="block text-body-sm font-medium text-neutral-900 mb-2">
                    Service Category
                  </label>
                  <select
                    id="service-category"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value as ServiceCategory)}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  >
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="compliance">Compliance</option>
                    <option value="contracts">Contracts</option>
                    <option value="general">General</option>
                  </select>
                </div>
                
                {/* Date Range */}
                <div>
                  <label htmlFor="date-range" className="block text-body-sm font-medium text-neutral-900 mb-2">
                    Date Range
                  </label>
                  <select
                    id="date-range"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as 'past_week' | 'past_month' | 'past_year')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  >
                    <option value="past_week">Past Week</option>
                    <option value="past_month">Past Month (Recommended)</option>
                    <option value="past_year">Past Year</option>
                  </select>
                </div>
                
                {/* Advanced Filters */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-body-sm font-medium text-accent-700 hover:text-accent-800"
                  >
                    {showAdvanced ? '▼' : '▶'} Advanced Filters
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-200">
                      <div>
                        <label htmlFor="location" className="block text-body-sm font-medium text-neutral-900 mb-2">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g., Virginia, Washington DC"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="naics-codes" className="block text-body-sm font-medium text-neutral-900 mb-2">
                          NAICS Codes (comma-separated, optional)
                        </label>
                        <input
                          id="naics-codes"
                          type="text"
                          value={naicsCodes}
                          onChange={(e) => setNaicsCodes(e.target.value)}
                          placeholder="e.g., 541512, 541519, 541511"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                        <p className="text-body-xs text-neutral-500 mt-1">
                          Leave empty to use default cyber/RMF codes (541512, 541519, 541511)
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="psc-codes" className="block text-body-sm font-medium text-neutral-900 mb-2">
                          PSC Codes (comma-separated, optional)
                        </label>
                        <input
                          id="psc-codes"
                          type="text"
                          value={pscCodes}
                          onChange={(e) => setPscCodes(e.target.value)}
                          placeholder="e.g., D310, D307, D399"
                          className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        />
                        <p className="text-body-xs text-neutral-500 mt-1">
                          Leave empty to use default IT/cyber codes (D310, D307, D399)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Search Button */}
                <button
                  onClick={handleUnifiedSearch}
                  disabled={isSearching || !keywords.trim()}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Searching...
                    </>
                  ) : (
                    'Search Contracts'
                  )}
                </button>
              </div>
              
              {/* Rate Limit Notice */}
              <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-sm">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-xl flex-shrink-0 mt-0.5">ℹ️</div>
                  <div className="flex-1">
                    <p className="text-body-sm font-semibold text-blue-900 mb-1">
                      API Rate Limits
                    </p>
                    <p className="text-body-sm text-blue-800">
                      The SAM.gov API free tier has daily request limits. If you see a rate limit error, 
                      please wait and try again later. Searches are cached for 5 minutes to reduce API calls.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 p-4 rounded-sm">
                <p className="text-body-sm text-red-800 font-semibold mb-2">Error</p>
                <p className="text-body-sm text-red-700 mb-2">{error}</p>
                {error.includes('SAM.gov API key') && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-body-xs text-red-600 mb-2">
                      <strong>Setup Instructions:</strong>
                    </p>
                    <ol className="text-body-xs text-red-600 list-decimal list-inside space-y-1">
                      <li>Get your SAM.gov API key from <a href="https://api.sam.gov/" target="_blank" rel="noopener noreferrer" className="underline">api.sam.gov</a></li>
                      <li>Add <code className="bg-red-100 px-1 rounded">SAM_GOV_API_KEY=your-key-here</code> to your environment variables</li>
                      <li>For Railway: Add it in the Variables section of your project settings</li>
                      <li>Restart your application after adding the key</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Google Query Display */}
            {googleQuery && (
              <div className="mt-6 bg-neutral-50 border-2 border-accent-500 p-4 rounded-sm">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-body-sm font-semibold text-neutral-900 mb-1">Google Search Query</p>
                    <p className="text-body-xs text-neutral-600">{googleQuery.description}</p>
                  </div>
                  <button
                    onClick={() => copyQueryToClipboard(googleQuery.query)}
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
                  <p className="text-body-sm text-neutral-700 font-mono break-all">{googleQuery.query}</p>
                </div>
                <div className="flex items-center gap-4">
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(googleQuery.query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-body-sm font-medium text-accent-700 hover:text-accent-800 underline"
                  >
                    🔍 Search on Google →
                  </a>
                  <p className="text-body-xs text-neutral-600">
                    Use this query to search manually on Google if needed.
                  </p>
                </div>
              </div>
            )}
            
            {/* Search Stats */}
            {searchStats && (
              <div className="mt-4 text-body-xs text-neutral-600">
                Found {searchStats.unique} unique results ({searchStats.valid} valid, {searchStats.duplicates} duplicates filtered)
                {searchStats.cached && <span className="ml-2 text-green-600">(cached)</span>}
                {searchStats.duration > 0 && <span className="ml-2">in {searchStats.duration}ms</span>}
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
                        <>
                          <tr key={result.id} className={`hover:bg-neutral-50 ${result.dismissed ? 'opacity-50' : ''} ${result.verified ? 'bg-green-50' : ''}`}>
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
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleOpenOpportunity(result.url, result.id)}
                                className="btn-secondary text-body-sm px-3 py-1.5"
                              >
                                View
                              </button>
                              {!result.scraped ? (
                                <button
                                  onClick={() => handleScrape(result)}
                                  disabled={scrapingIds.has(result.id)}
                                  className="btn-primary text-body-sm px-3 py-1.5 disabled:opacity-50"
                                >
                                  {scrapingIds.has(result.id) ? 'Scraping...' : 'Scrape'}
                                </button>
                              ) : (
                                <>
                                  {result.sow_attachment_url && !result.sow_scraped && (
                                    <button
                                      onClick={() => handleScrapeSOW(result)}
                                      disabled={scrapingIds.has(`${result.id}-sow`)}
                                      className="btn-primary text-body-sm px-3 py-1.5 disabled:opacity-50"
                                    >
                                      {scrapingIds.has(`${result.id}-sow`) ? 'Scraping SOW...' : 'Scrape SOW'}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => toggleExpand(result.id)}
                                    className="btn-secondary text-body-sm px-3 py-1.5"
                                  >
                                    {expandedIds.has(result.id) ? 'Hide Analysis' : 'Show Analysis'}
                                  </button>
                                </>
                              )}
                              <div className="flex gap-1">
                                {!result.dismissed && (
                                  <button
                                    onClick={() => handleAdd(result)}
                                    disabled={result.verified}
                                    className="text-body-xs px-2 py-1 bg-green-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {result.verified ? '✓ Added' : 'Add'}
                                  </button>
                                )}
                                {!result.verified && (
                                  <button
                                    onClick={() => handleDismiss(result)}
                                    disabled={result.dismissed}
                                    className="text-body-xs px-2 py-1 bg-red-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {result.dismissed ? 'Dismissed' : 'Dismiss'}
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                        {expandedIds.has(result.id) && result.scraped && (
                          <tr key={`${result.id}-expanded`}>
                            <td colSpan={4} className="px-4 py-4 bg-neutral-50">
                              <div className="space-y-4">
                                {result.analysis_summary && (
                                  <div>
                                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Analysis Summary</h4>
                                    <p className="text-body-sm text-neutral-700">{result.analysis_summary}</p>
                                    {result.analysis_confidence && (
                                      <p className="text-body-xs text-neutral-500 mt-1">
                                        Confidence: {(result.analysis_confidence * 100).toFixed(0)}%
                                      </p>
                                    )}
                                  </div>
                                )}
                                {result.analysis_keywords && result.analysis_keywords.length > 0 && (
                                  <div>
                                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Analysis Keywords</h4>
                                    <div className="flex flex-wrap gap-1">
                                      {result.analysis_keywords.map((kw, idx) => (
                                        <span
                                          key={idx}
                                          className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-body-xs rounded"
                                        >
                                          {kw}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {result.sow_attachment_url && (
                                  <div>
                                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">SOW Attachment</h4>
                                    <a
                                      href={result.sow_attachment_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-body-sm text-accent-700 hover:text-accent-800 underline"
                                    >
                                      {result.sow_attachment_url}
                                    </a>
                                    {result.sow_attachment_type && (
                                      <span className="text-body-xs text-neutral-500 ml-2">
                                        ({result.sow_attachment_type})
                                      </span>
                                    )}
                                    {result.sow_scraped && (
                                      <span className="text-body-xs text-green-600 ml-2">✓ Scraped</span>
                                    )}
                                  </div>
                                )}
                                {result.scraped_at && (
                                  <p className="text-body-xs text-neutral-500">
                                    Scraped: {new Date(result.scraped_at).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
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
