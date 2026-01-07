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
          num_results: 20,
          filters: {
            filetype: 'pdf',
            site: ['sam.gov', '.gov', '.mil'],
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      setResults(data.results || [])
      setSearchQuery(data.query || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSearching(false)
    }
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

  const getRelevanceColor = (score: number) => {
    if (score >= 20) return 'text-green-600 font-semibold'
    if (score >= 15) return 'text-yellow-600'
    return 'text-gray-600'
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
              <div className="flex gap-4">
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Searching...' : 'Run Discovery'}
                </button>
              </div>

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
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Score</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Title</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Domain</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Agency</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Status</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {results
                      .sort((a, b) => b.relevance_score - a.relevance_score)
                      .map((result) => (
                        <tr key={result.id} className="hover:bg-neutral-50">
                          <td className="px-4 py-3">
                            <span className={`text-body-sm font-medium ${getRelevanceColor(result.relevance_score)}`}>
                              {result.relevance_score}
                            </span>
                          </td>
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
                            <span
                              className={`inline-block px-2 py-1 text-body-xs font-medium rounded ${getStatusBadgeColor(result.ingestion_status)}`}
                            >
                              {result.ingestion_status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-2">
                              {result.document_type === 'pdf' && (
                                <button
                                  onClick={() => handleDownloadPDF(result.url, result.id)}
                                  className="text-body-xs text-accent-700 hover:text-accent-800 font-medium"
                                >
                                  Download PDF
                                </button>
                              )}
                              <button
                                onClick={() => handleGenerateProposal(result.url)}
                                className="text-body-xs text-accent-700 hover:text-accent-800 font-medium"
                              >
                                Generate Proposal
                              </button>
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-body-xs text-neutral-600 hover:text-neutral-900"
                              >
                                View Source
                              </a>
                            </div>
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

