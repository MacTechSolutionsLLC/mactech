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

interface SearchTemplate {
  name: string
  description: string
  query: string
  keywords: string
  category: 'vetcert' | 'rmf' | 'general'
}

const SEARCH_TEMPLATES: SearchTemplate[] = [
  {
    name: 'VetCert SDVOSB Set-Asides (Cyber/RMF)',
    description: 'SBA-certified SDVOSB set-aside opportunities for cybersecurity and RMF',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside" OR "SDVOSB Set-Aside" OR "SBA certified SDVOSB") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53" OR "ISSO" OR "ISSM")',
    keywords: 'VetCert, SDVOSB, RMF, cybersecurity',
    category: 'vetcert',
  },
  {
    name: 'VetCert SDVOSB Sole Source (Cyber/RMF)',
    description: 'SBA-certified SDVOSB sole source opportunities for cybersecurity and RMF',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source" OR "SDVOSB Sole Source") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53" OR "ISSO" OR "ISSM")',
    keywords: 'VetCert, SDVOSB, sole source, RMF',
    category: 'vetcert',
  },
  {
    name: 'VA Veterans First VOSB (Cyber/RMF)',
    description: 'VA-specific veteran-owned set-aside opportunities for cybersecurity',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Veteran-Owned Small Business Set Aside, Department of Veterans Affairs" OR "VOSB Set Aside, Department of Veterans Affairs") ("RMF" OR "cybersecurity" OR "ATO" OR "NIST 800-53")',
    keywords: 'VA, VOSB, Veterans First, RMF',
    category: 'vetcert',
  },
  {
    name: 'VetCert RMF Roles (ISSO/ISSM/ISSE)',
    description: 'VetCert-eligible opportunities requiring ISSO, ISSM, or ISSE roles',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("ISSO" OR "ISSM" OR "ISSE" OR "Information System Security Officer" OR "Information System Security Manager")',
    keywords: 'ISSO, ISSM, ISSE, VetCert, RMF roles',
    category: 'vetcert',
  },
  {
    name: 'VetCert eMASS & ATO Support',
    description: 'VetCert-eligible opportunities for eMASS and ATO support services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("eMASS" OR "ATO" OR "Authorization to Operate" OR "SSP" OR "System Security Plan")',
    keywords: 'eMASS, ATO, SSP, VetCert',
    category: 'vetcert',
  },
  {
    name: 'VetCert NIST 800-53 & Control Assessment',
    description: 'VetCert-eligible opportunities for NIST 800-53 compliance and control assessment',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("NIST 800-53" OR "security control assessment" OR "SCA" OR "control assessment" OR "continuous monitoring")',
    keywords: 'NIST 800-53, SCA, control assessment, VetCert',
    category: 'vetcert',
  },
  {
    name: 'VetCert Cyber NAICS (541512/541519/541511)',
    description: 'VetCert-eligible opportunities with cyber/RMF NAICS codes',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran") ("NAICS 541512" OR "NAICS 541519" OR "NAICS 541511") ("RMF" OR "cybersecurity" OR "ATO")',
    keywords: 'NAICS 541512, NAICS 541519, NAICS 541511, VetCert',
    category: 'vetcert',
  },
  {
    name: 'GSA HACS VetCert Opportunities',
    description: 'GSA MAS HACS SIN opportunities for VetCert-eligible businesses',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("54151HACS" OR "HACS" OR "Highly Adaptive Cybersecurity Services") ("SDVOSB" OR "VOSB" OR "Service-Disabled Veteran" OR "veteran-owned") ("RMF" OR "ATO" OR "cybersecurity")',
    keywords: 'GSA HACS, 54151HACS, VetCert, RMF',
    category: 'vetcert',
  },
  {
    name: 'RMF & ATO Services',
    description: 'Risk Management Framework and Authorization to Operate contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("RMF" OR "Risk Management Framework" OR "ATO" OR "Authorization to Operate" OR "STIG")',
    keywords: 'RMF, ATO, STIG',
    category: 'rmf',
  },
  {
    name: 'Cybersecurity & STIG Compliance',
    description: 'STIG compliance and cybersecurity assessment contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("STIG" OR "Security Technical Implementation Guide" OR "cybersecurity assessment" OR "security control assessment")',
    keywords: 'STIG, cybersecurity, assessment',
    category: 'rmf',
  },
  {
    name: 'NIST 800-53 Compliance',
    description: 'NIST 800-53 security control implementation and assessment',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("NIST 800-53" OR "security controls" OR "control assessment" OR "SCA")',
    keywords: 'NIST, security controls, SCA',
    category: 'rmf',
  },
  {
    name: 'DoD Cybersecurity',
    description: 'Department of Defense cybersecurity and RMF contracts',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Department of Defense" OR "DoD" OR "Air Force" OR "Navy" OR "Army") ("RMF" OR "ATO" OR "cybersecurity" OR "STIG")',
    keywords: 'DoD, military, cybersecurity',
    category: 'rmf',
  },
  {
    name: 'Continuous Monitoring',
    description: 'ConMon and continuous monitoring services',
    query: 'site:sam.gov -filetype:pdf (contract opportunity OR solicitation OR notice) ("Continuous Monitoring" OR "ConMon" OR "continuous assessment" OR "security monitoring")',
    keywords: 'ConMon, monitoring, assessment',
    category: 'rmf',
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

  const handleSearch = async (template: SearchTemplate) => {
    setIsSearching(true)
    setError(null)
    setResults([])
    setSelectedTemplate(template)
    setSearchQuery(template.query)

    try {
      const response = await fetch('/api/admin/contract-discovery/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: template.query,
          num_results: 30,
          filters: {
            site: ['sam.gov'],
            date_range: dateRange,
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Search failed'
        const fullMessage = data.details ? `${errorMessage}. ${data.details}` : errorMessage
        throw new Error(fullMessage)
      }

      if (data.warnings && data.warnings.length > 0) {
        setError(`Note: ${data.warnings[0]}. Results are still available.`)
      }

      setResults(data.results || [])
      setSearchQuery(data.query || template.query)
      
      if (data.results && data.results.length === 0) {
        setError('No results found. Try a different search template or adjust the date range.')
      } else {
        setError(null)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      
      // Check if it's a SerpAPI key error
      if (errorMessage.includes('SerpAPI key') || errorMessage.includes('SERPAPI_KEY')) {
        setError('SerpAPI key not configured. Please set the SERPAPI_KEY environment variable. Get your key from https://serpapi.com/manage-api-key')
      } else {
        setError(errorMessage)
      }
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

  const filteredTemplates = templateFilter === 'all' 
    ? SEARCH_TEMPLATES 
    : SEARCH_TEMPLATES.filter(t => t.category === templateFilter)

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

              {/* Template Filter */}
              <div className="mb-6">
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
                      {filter === 'all' ? 'All Templates' : filter === 'vetcert' ? 'VetCert' : 'RMF'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Templates Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template, idx) => (
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-body-sm font-semibold text-neutral-900 pr-2">
                      {template.name}
                    </h3>
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
              ))}
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
              <div className="mt-6 bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                <p className="text-body-sm font-medium text-neutral-900 mb-1">Search Query:</p>
                <p className="text-body-sm text-neutral-700 font-mono break-all">{searchQuery}</p>
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
