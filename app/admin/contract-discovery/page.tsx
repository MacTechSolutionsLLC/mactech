'use client'

import { useState } from 'react'
import Link from 'next/link'

type ServiceCategory = 'cybersecurity' | 'infrastructure' | 'compliance' | 'contracts' | 'general'
type DocumentType = 'SOW' | 'PWS' | 'RFQ' | 'RFP' | 'Sources Sought' | 'Other'
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

export default function ContractDiscoveryPage() {
  const [serviceCategory, setServiceCategory] = useState<ServiceCategory>('cybersecurity')
  const [location, setLocation] = useState('')
  const [agency, setAgency] = useState<string[]>([])
  const [naicsCodes, setNaicsCodes] = useState<string[]>([])
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>(['SOW', 'PWS'])
  const [customQuery, setCustomQuery] = useState('')
  const [useCustomQuery, setUseCustomQuery] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<DiscoveryResult[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [keywords, setKeywords] = useState('')
  const [dateRange, setDateRange] = useState<'past_week' | 'past_month' | 'past_year'>('past_year')
  const [previewResult, setPreviewResult] = useState<DiscoveryResult | null>(null)
  const [showTemplates, setShowTemplates] = useState(false)
  const [testingTemplate, setTestingTemplate] = useState<string | null>(null)
  const [templateResults, setTemplateResults] = useState<any>(null)

  const agencyOptions = [
    'Department of Defense',
    'Air Force',
    'Navy',
    'Army',
    'DHS',
    'GSA',
    'DOE',
    'NASA',
  ]

  const handleTestConnection = async () => {
    try {
      const response = await fetch('/api/admin/contract-discovery/test')
      const data = await response.json()
      setTestResult(data)
      console.log('Test result:', data)
    } catch (err) {
      console.error('Test error:', err)
      setTestResult({ success: false, error: err instanceof Error ? err.message : 'Test failed' })
    }
  }

  const handleSearch = async () => {
    setIsSearching(true)
    setError(null)
    setResults([])

    try {
      const response = await fetch('/api/admin/contract-discovery/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: useCustomQuery ? customQuery : undefined,
          service_category: useCustomQuery ? undefined : serviceCategory,
          location: location || undefined,
          agency: agency.length > 0 ? agency : undefined,
          naics_codes: naicsCodes.length > 0 ? naicsCodes : undefined,
          document_types: documentTypes,
          keywords: keywords || undefined,
          num_results: 20,
          filters: {
            filetype: 'pdf',
            site: ['sam.gov', '.gov', '.mil'],
            date_range: dateRange, // Only get recent results
          },
        }),
      })

      const data = await response.json()

      console.log('Search response:', {
        ok: response.ok,
        status: response.status,
        data: data,
      })

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Search failed'
        console.error('Search error:', errorMessage, data)
        throw new Error(errorMessage)
      }

      if (data.warning) {
        console.warn('Search warning:', data.warning)
      }

      if (data.warnings && data.warnings.length > 0) {
        console.warn('Database warnings:', data.warnings)
        // Show non-blocking warning to user
        setError(`Note: ${data.warnings[0]}. Results are still available.`)
      }

      setResults(data.results || [])
      setSearchQuery(data.query || '')
      
      if (data.results && data.results.length === 0) {
        setError('No results found. Try adjusting your search criteria.')
      } else {
        setError(null) // Clear any previous errors if we have results
      }
      
      if (data.results_count === 0) {
        setError(data.warning || 'No results found. Try adjusting your search criteria.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSearching(false)
    }
  }

  const handlePreview = (result: DiscoveryResult) => {
    setPreviewResult(result)
  }

  const handleOpenPDF = (url: string, id: string) => {
    // Open PDF in new tab
    window.open(url, '_blank')
    
    // Update database to mark as downloaded
    fetch(`/api/admin/contract-discovery/${id}/download`, {
      method: 'POST',
    }).catch(err => console.error('Error marking as downloaded:', err))
  }

  const handleDownloadPDF = async (url: string, id: string) => {
    try {
      // Open in new tab for download
      window.open(url, '_blank')
      
      // Update database to mark as downloaded
      await fetch(`/api/admin/contract-discovery/${id}/download`, {
        method: 'POST',
      })
    } catch (err) {
      console.error('Error downloading PDF:', err)
    }
  }

  const handleGenerateProposal = (url: string) => {
    // Redirect to admin page with SOW URL
    window.location.href = `/admin?sow_url=${encodeURIComponent(url)}`
  }

  const getStatusBadgeColor = (status: IngestionStatus) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'ignored':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }


  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-hero mb-2">Government Contract Discovery</h1>
              <p className="text-body text-neutral-600">
                Discover government contract opportunities using Google search
              </p>
            </div>
            <Link href="/admin" className="btn-secondary">
              Back to Admin
            </Link>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 lg:p-12">
            <div className="space-y-6">
              {/* Custom Query Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="use-custom"
                  checked={useCustomQuery}
                  onChange={(e) => setUseCustomQuery(e.target.checked)}
                  className="h-4 w-4 text-accent-700"
                />
                <label htmlFor="use-custom" className="text-body-sm font-medium text-neutral-900">
                  Use custom Google query
                </label>
              </div>

              {useCustomQuery ? (
                <div>
                  <label htmlFor="custom-query" className="block text-body-sm font-medium text-neutral-900 mb-2">
                    Google Search Query
                  </label>
                  <textarea
                    id="custom-query"
                    value={customQuery}
                    onChange={(e) => setCustomQuery(e.target.value)}
                    placeholder='filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "Performance Work Statement") "RMF" "Boston"'
                    className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    rows={3}
                  />
                  <p className="mt-2 text-body-sm text-neutral-500">
                    Enter a Google search query using advanced operators. Supports filetype, site, quotes, etc.
                  </p>
                </div>
              ) : (
                <>
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
                      <option value="cybersecurity">Cybersecurity & RMF</option>
                      <option value="infrastructure">Infrastructure & Engineering</option>
                      <option value="compliance">Compliance & Quality</option>
                      <option value="contracts">Contracts & Risk</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label htmlFor="keywords" className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Keywords (Optional)
                    </label>
                    <input
                      type="text"
                      id="keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="metrology, calibration, testing, etc."
                      className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                    <p className="mt-1 text-body-xs text-neutral-500">
                      Enter specific keywords to search for. Separate multiple keywords with commas.
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Boston, Massachusetts, New England, etc."
                      className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>

                  {/* Date Range */}
                  <div>
                    <label htmlFor="date-range" className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Date Range (Only Recent Results)
                    </label>
                    <select
                      id="date-range"
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value as 'past_week' | 'past_month' | 'past_year')}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    >
                      <option value="past_week">Past Week</option>
                      <option value="past_month">Past Month</option>
                      <option value="past_year">Past Year (Default)</option>
                    </select>
                    <p className="mt-1 text-body-xs text-neutral-500">
                      Only show results from the selected time period to avoid outdated contracts.
                    </p>
                  </div>

                  {/* Agency */}
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Agency (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {agencyOptions.map((opt) => (
                        <label key={opt} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={agency.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAgency([...agency, opt])
                              } else {
                                setAgency(agency.filter(a => a !== opt))
                              }
                            }}
                            className="h-4 w-4 text-accent-700"
                          />
                          <span className="text-body-sm text-neutral-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Document Types */}
                  <div>
                    <label className="block text-body-sm font-medium text-neutral-900 mb-2">
                      Document Types
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(['SOW', 'PWS', 'RFQ', 'RFP', 'Sources Sought'] as DocumentType[]).map((type) => (
                        <label key={type} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={documentTypes.includes(type)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDocumentTypes([...documentTypes, type])
                              } else {
                                setDocumentTypes(documentTypes.filter(d => d !== type))
                              }
                            }}
                            className="h-4 w-4 text-accent-700"
                          />
                          <span className="text-body-sm text-neutral-700">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* NAICS Codes */}
                  <div>
                    <label htmlFor="naics" className="block text-body-sm font-medium text-neutral-900 mb-2">
                      NAICS Codes (Optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      id="naics"
                      value={naicsCodes.join(', ')}
                      onChange={(e) => {
                        const codes = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                        setNaicsCodes(codes)
                      }}
                      placeholder="541330, 541511, 541512"
                      className="w-full px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>
                </>
              )}

              {/* Search Button */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Run Discovery'}
                </button>
                <button
                  onClick={handleTestConnection}
                  type="button"
                  className="btn-secondary"
                >
                  Test SerpAPI Connection
                </button>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  type="button"
                  className="btn-secondary"
                >
                  {showTemplates ? 'Hide' : 'Show'} Search Templates
                </button>
              </div>

              {/* Search Templates */}
              {showTemplates && (
                <div className="border border-neutral-200 rounded-sm p-6 bg-neutral-50">
                  <h3 className="heading-3 mb-4">Optimized Search Templates</h3>
                  <p className="text-body-sm text-neutral-600 mb-6">
                    Pre-configured queries optimized for MacTech&apos;s service offerings. Click to test or use as starting point.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      {
                        name: 'RMF & ATO Services',
                        description: 'Risk Management Framework and Authorization to Operate contracts',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "Performance Work Statement") ("RMF" OR "Risk Management Framework" OR "ATO" OR "Authorization to Operate" OR "STIG")',
                        keywords: 'RMF, ATO, STIG',
                      },
                      {
                        name: 'Cybersecurity & STIG Compliance',
                        description: 'STIG compliance and cybersecurity assessment contracts',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("STIG" OR "Security Technical Implementation Guide" OR "cybersecurity assessment" OR "security control assessment")',
                        keywords: 'STIG, cybersecurity, assessment',
                      },
                      {
                        name: 'Infrastructure Engineering',
                        description: 'Infrastructure, cloud migration, and systems engineering',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("infrastructure engineering" OR "cloud migration" OR "systems engineering" OR "platform engineering" OR "IaC")',
                        keywords: 'infrastructure, cloud, engineering',
                      },
                      {
                        name: 'ISO Compliance & Quality',
                        description: 'ISO certification, quality management, and audit readiness',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("ISO 9001" OR "ISO 17025" OR "ISO 27001" OR "quality management system" OR "audit readiness")',
                        keywords: 'ISO, quality, audit',
                      },
                      {
                        name: 'Veteran-Owned Set-Asides',
                        description: 'SDVOSB and veteran-owned set-aside opportunities',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("SDVOSB" OR "Service-Disabled Veteran" OR "veteran-owned" OR "VOSB") ("cybersecurity" OR "RMF" OR "infrastructure")',
                        keywords: 'SDVOSB, veteran-owned, set-aside',
                      },
                      {
                        name: 'DoD Cybersecurity',
                        description: 'Department of Defense cybersecurity and RMF contracts',
                        query: 'filetype:pdf site:sam.gov ("Statement of Work" OR "PWS") ("Department of Defense" OR "DoD" OR "Air Force" OR "Navy" OR "Army") ("RMF" OR "ATO" OR "cybersecurity" OR "STIG")',
                        keywords: 'DoD, military, cybersecurity',
                      },
                      {
                        name: 'Continuous Monitoring',
                        description: 'ConMon and continuous monitoring services',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Continuous Monitoring" OR "ConMon" OR "continuous assessment" OR "security monitoring")',
                        keywords: 'ConMon, monitoring, assessment',
                      },
                      {
                        name: 'NIST 800-53 Compliance',
                        description: 'NIST 800-53 security control implementation and assessment',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NIST 800-53" OR "security controls" OR "control assessment" OR "SCA")',
                        keywords: 'NIST, security controls, SCA',
                      },
                      {
                        name: 'CMMC & Defense Contractors',
                        description: 'CMMC compliance for defense contractors',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("CMMC" OR "Cybersecurity Maturity Model Certification" OR "defense contractor" OR "DFARS")',
                        keywords: 'CMMC, DFARS, defense',
                      },
                      {
                        name: 'Boston Area Contracts',
                        description: 'Government contracts in Boston/New England area',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("Boston" OR "Massachusetts" OR "New England" OR "Rhode Island") ("cybersecurity" OR "RMF" OR "infrastructure")',
                        keywords: 'Boston, Massachusetts, local',
                      },
                      {
                        name: 'Small Business Set-Asides',
                        description: 'Small business, 8(a), and HUBZone opportunities',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS" OR "Sources Sought") ("small business" OR "8(a)" OR "HUBZone" OR "WOSB") ("cybersecurity" OR "RMF" OR "infrastructure")',
                        keywords: 'small business, 8(a), HUBZone',
                      },
                      {
                        name: 'NAICS Engineering Services',
                        description: 'Engineering and cybersecurity services by NAICS codes',
                        query: 'filetype:pdf (site:sam.gov OR site:.gov OR site:.mil) ("Statement of Work" OR "PWS") ("NAICS 541330" OR "NAICS 541511" OR "NAICS 541512")',
                        keywords: 'NAICS, engineering, services',
                      },
                    ].map((template, idx) => (
                      <div key={idx} className="border border-neutral-200 rounded-sm p-4 bg-white">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-body-sm font-semibold text-neutral-900">{template.name}</h4>
                          <button
                            onClick={async () => {
                              setTestingTemplate(template.name)
                              setTemplateResults(null)
                              try {
                                const response = await fetch('/api/admin/contract-discovery/test-queries', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ query: template.query, name: template.name }),
                                })
                                const data = await response.json()
                                setTemplateResults(data)
                              } catch (err) {
                                console.error('Error testing template:', err)
                              } finally {
                                setTestingTemplate(null)
                              }
                            }}
                            disabled={testingTemplate === template.name}
                            className="text-body-xs text-accent-700 hover:text-accent-800 font-medium disabled:opacity-50"
                          >
                            {testingTemplate === template.name ? 'Testing...' : 'Test Query'}
                          </button>
                        </div>
                        <p className="text-body-xs text-neutral-600 mb-2">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.keywords.split(', ').map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 bg-accent-50 text-accent-700 text-body-xs rounded">
                              {kw}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            setCustomQuery(template.query)
                            setUseCustomQuery(true)
                            setShowTemplates(false)
                          }}
                          className="text-body-xs text-neutral-600 hover:text-neutral-900 font-medium"
                        >
                          Use This Query →
                        </button>
                        {templateResults && templateResults.query === template.query && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <p className="text-body-xs text-neutral-600 mb-1">
                              Test Results: {templateResults.results?.total || 0} total, {templateResults.results?.relevant || 0} relevant
                            </p>
                            {templateResults.results?.topResults && templateResults.results.topResults.length > 0 && (
                              <div className="text-body-xs text-neutral-500">
                                Top result: {templateResults.results.topResults[0].title?.substring(0, 60)}...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Test Result Display */}
              {testResult && (
                <div className={`border p-4 rounded-sm ${
                  testResult.success 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <h4 className="text-body-sm font-semibold mb-2">
                    SerpAPI Test Result
                  </h4>
                  <pre className="text-body-xs overflow-auto max-h-60">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}

              {/* Search Query Display */}
              {searchQuery && (
                <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                  <p className="text-body-sm font-medium text-neutral-900 mb-1">Generated Query:</p>
                  <p className="text-body-sm text-neutral-700 font-mono break-all">{searchQuery}</p>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
                  <p className="text-body-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Table */}
      {results.length > 0 && (
        <section className="section-container bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="heading-2">Discovery Results ({results.length})</h2>
              <div className="text-body-sm text-neutral-600">
                Sorted by relevance score
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Title</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Domain</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Agency</th>
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
                              {result.detected_keywords && result.detected_keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
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
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-body-sm text-neutral-700">{result.domain}</span>
                            {result.document_type && (
                              <span className="ml-2 inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 text-body-xs rounded">
                                {result.document_type.toUpperCase()}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              {result.agency && (
                                <p className="text-body-sm text-neutral-700">{result.agency}</p>
                              )}
                              {result.notice_id && (
                                <p className="text-body-xs text-neutral-500 mt-1">
                                  Notice: {result.notice_id}
                                </p>
                              )}
                              {result.location_mentions && result.location_mentions.length > 0 && (
                                <p className="text-body-xs text-neutral-500 mt-1">
                                  {result.location_mentions.join(', ')}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleOpenPDF(result.url, result.id)}
                              className="btn-primary text-body-sm px-4 py-2"
                            >
                              Open PDF
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

      {/* Preview Modal */}
      {previewResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
              <h3 className="heading-3">Preview</h3>
              <button
                onClick={() => setPreviewResult(null)}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Title</h4>
                <p className="text-body text-neutral-700">{previewResult.title}</p>
              </div>

              {previewResult.snippet && (
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Description</h4>
                  <p className="text-body text-neutral-700">{previewResult.snippet}</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">URL</h4>
                  <a
                    href={previewResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-body-sm text-accent-700 hover:text-accent-800 break-all"
                  >
                    {previewResult.url}
                  </a>
                </div>

                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Domain</h4>
                  <p className="text-body-sm text-neutral-700">{previewResult.domain}</p>
                </div>

                {previewResult.agency && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Agency</h4>
                    <p className="text-body-sm text-neutral-700">{previewResult.agency}</p>
                  </div>
                )}

                {previewResult.notice_id && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Notice ID</h4>
                    <p className="text-body-sm text-neutral-700">{previewResult.notice_id}</p>
                  </div>
                )}

                {previewResult.solicitation_number && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Solicitation Number</h4>
                    <p className="text-body-sm text-neutral-700">{previewResult.solicitation_number}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Relevance Score</h4>
                  <p className={`text-body-sm font-medium ${getRelevanceColor(previewResult.relevance_score)}`}>
                    {previewResult.relevance_score}
                  </p>
                </div>

                {previewResult.detected_service_category && (
                  <div>
                    <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Service Category</h4>
                    <p className="text-body-sm text-neutral-700 capitalize">
                      {previewResult.detected_service_category}
                    </p>
                  </div>
                )}
              </div>

              {previewResult.detected_keywords && previewResult.detected_keywords.length > 0 && (
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Detected Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {previewResult.detected_keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-accent-50 text-accent-700 text-body-xs rounded"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewResult.location_mentions && previewResult.location_mentions.length > 0 && (
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Location Mentions</h4>
                  <p className="text-body-sm text-neutral-700">
                    {previewResult.location_mentions.join(', ')}
                  </p>
                </div>
              )}

              {previewResult.naics_codes && previewResult.naics_codes.length > 0 && (
                <div>
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">NAICS Codes</h4>
                  <p className="text-body-sm text-neutral-700">
                    {previewResult.naics_codes.join(', ')}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-neutral-200">
                {previewResult.document_type === 'pdf' && (
                  <button
                    onClick={() => {
                      handleOpenPDF(previewResult.url, previewResult.id)
                      setPreviewResult(null)
                    }}
                    className="btn-primary"
                  >
                    Open PDF in New Tab
                  </button>
                )}
                <button
                  onClick={() => {
                    handleGenerateProposal(previewResult.url)
                    setPreviewResult(null)
                  }}
                  className="btn-secondary"
                >
                  Generate Proposal
                </button>
                <a
                  href={previewResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  View Source
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

