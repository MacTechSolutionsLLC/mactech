'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Contract {
  id: string
  title: string
  url: string
  notice_id?: string
  solicitation_number?: string
  agency?: string
  naics_codes: string[]
  set_aside: string[]
  detected_keywords: string[]
  relevance_score: number
  detected_service_category?: string
  ingestion_status: string
  verified: boolean
  verified_at?: string
  scraped: boolean
  scraped_at?: string
  sow_attachment_url?: string
  sow_attachment_type?: string
  sow_scraped: boolean
  sow_scraped_at?: string
  analysis_summary?: string
  analysis_confidence?: number
  dismissed: boolean
  dismissed_at?: string
  created_at: string
}

export default function ContractDashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'verified' | 'scraped' | 'dismissed'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadContracts()
  }, [filter])

  const loadContracts = async () => {
    try {
      setLoading(true)
      const status = filter === 'all' ? undefined : 
                    filter === 'verified' ? 'verified' :
                    filter === 'dismissed' ? 'ignored' : 'discovered'
      
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (filter === 'scraped') params.append('scraped', 'true')
      
      const response = await fetch(`/api/admin/contract-discovery/list?${params.toString()}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setContracts(data.contracts || [])
        setError(null)
      } else {
        setError(data.error || data.message || 'Failed to load contracts')
      }
    } catch (err) {
      console.error('Error loading contracts:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load contracts'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleScrape = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/scrape`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to scrape contract')
      }
    } catch (err) {
      console.error('Error scraping contract:', err)
      alert('Failed to scrape contract')
    }
  }

  const handleScrapeSOW = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/scrape-sow`, {
        method: 'POST',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to scrape SOW')
      }
    } catch (err) {
      console.error('Error scraping SOW:', err)
      alert('Failed to scrape SOW')
    }
  }

  const handleAdd = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'admin' }),
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to add contract')
      }
    } catch (err) {
      console.error('Error adding contract:', err)
      alert('Failed to add contract')
    }
  }

  const handleDismiss = async (contractId: string) => {
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/dismiss`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissedBy: 'admin', reason: 'Not relevant' }),
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to dismiss contract')
      }
    } catch (err) {
      console.error('Error dismissing contract:', err)
      alert('Failed to dismiss contract')
    }
  }

  const handleDelete = async (contractId: string) => {
    if (!confirm('Are you sure you want to permanently delete this contract?')) {
      return
    }
    
    try {
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/delete`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (data.success) {
        await loadContracts()
      } else {
        alert(data.error || 'Failed to delete contract')
      }
    } catch (err) {
      console.error('Error deleting contract:', err)
      alert('Failed to delete contract')
    }
  }

  const filteredContracts = contracts.filter(contract => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      contract.title.toLowerCase().includes(search) ||
      contract.agency?.toLowerCase().includes(search) ||
      contract.notice_id?.toLowerCase().includes(search) ||
      contract.detected_keywords.some(kw => kw.toLowerCase().includes(search))
    )
  })

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="heading-hero mb-2">Contract Dashboard</h1>
              <p className="text-body text-neutral-600">
                View and manage discovered, scraped, and verified contracts
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/admin/contract-discovery" className="btn-secondary">
                Search Contracts
              </Link>
              <Link href="/admin" className="btn-secondary">
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="section-container bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="card p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {(['all', 'verified', 'scraped', 'dismissed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-sm text-body-sm font-medium transition-colors ${
                      filter === f
                        ? 'bg-accent-700 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-sm focus:ring-2 focus:ring-accent-500 focus:border-accent-500 w-full md:w-64"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-body-sm text-neutral-600 mt-4">Loading contracts...</p>
            </div>
          ) : error ? (
            <div className="card p-6 bg-red-50 border border-red-200">
              <p className="text-body-sm text-red-800">{error}</p>
            </div>
          ) : filteredContracts.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-body-lg text-neutral-600">No contracts found</p>
              <Link href="/admin/contract-discovery" className="btn-primary mt-4 inline-block">
                Search for Contracts
              </Link>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Contract</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Status</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">SOW</th>
                      <th className="px-4 py-3 text-left text-body-sm font-semibold text-neutral-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredContracts.map((contract) => (
                      <tr 
                        key={contract.id} 
                        className={`hover:bg-neutral-50 ${
                          contract.dismissed ? 'opacity-50' : ''} ${
                          contract.verified ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="max-w-md">
                            <p className="text-body-sm font-medium text-neutral-900 mb-1">
                              {contract.title}
                            </p>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {contract.set_aside.slice(0, 2).map((sa, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-body-xs rounded"
                                >
                                  {sa}
                                </span>
                              ))}
                              {contract.detected_keywords.slice(0, 3).map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block px-2 py-0.5 bg-accent-50 text-accent-700 text-body-xs rounded"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                            <div className="text-body-xs text-neutral-500 space-y-1">
                              {contract.agency && <p>Agency: {contract.agency}</p>}
                              {contract.notice_id && <p>Notice: {contract.notice_id}</p>}
                              {contract.naics_codes.length > 0 && (
                                <p>NAICS: {contract.naics_codes.join(', ')}</p>
                              )}
                            </div>
                            <a
                              href={contract.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-body-xs text-accent-700 hover:text-accent-800 mt-1 inline-block break-all"
                            >
                              View on SAM.gov →
                            </a>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 text-body-xs rounded ${
                              contract.verified 
                                ? 'bg-green-100 text-green-800' 
                                : contract.dismissed
                                ? 'bg-red-100 text-red-800'
                                : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {contract.verified ? '✓ Verified' : 
                               contract.dismissed ? '✗ Dismissed' : 
                               contract.scraped ? 'Scraped' : 'Discovered'}
                            </span>
                            {contract.scraped && contract.analysis_summary && (
                              <p className="text-body-xs text-neutral-600 mt-2 max-w-xs">
                                {contract.analysis_summary.substring(0, 100)}...
                              </p>
                            )}
                            {contract.scraped_at && (
                              <p className="text-body-xs text-neutral-500">
                                Scraped: {new Date(contract.scraped_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {contract.sow_attachment_url ? (
                            <div className="space-y-2">
                              <a
                                href={contract.sow_attachment_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-body-sm text-accent-700 hover:text-accent-800 underline"
                              >
                                <span>📄</span>
                                <span>Download SOW</span>
                                {contract.sow_attachment_type && (
                                  <span className="text-body-xs text-neutral-500">
                                    ({contract.sow_attachment_type})
                                  </span>
                                )}
                              </a>
                              {!contract.sow_scraped && (
                                <button
                                  onClick={() => handleScrapeSOW(contract.id)}
                                  className="block text-body-xs text-accent-700 hover:text-accent-800 underline"
                                >
                                  Scrape SOW Content
                                </button>
                              )}
                              {contract.sow_scraped && (
                                <span className="text-body-xs text-green-600">✓ Content Scraped</span>
                              )}
                            </div>
                          ) : contract.scraped ? (
                            <span className="text-body-xs text-neutral-500">No SOW found</span>
                          ) : (
                            <span className="text-body-xs text-neutral-400">Not scraped yet</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            {!contract.scraped && (
                              <button
                                onClick={() => handleScrape(contract.id)}
                                className="btn-primary text-body-sm px-3 py-1.5"
                              >
                                Scrape
                              </button>
                            )}
                            {!contract.verified && !contract.dismissed && (
                              <button
                                onClick={() => handleAdd(contract.id)}
                                className="text-body-sm px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700"
                              >
                                Add
                              </button>
                            )}
                            {!contract.dismissed && (
                              <button
                                onClick={() => handleDismiss(contract.id)}
                                className="text-body-sm px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Dismiss
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(contract.id)}
                              className="text-body-sm px-3 py-1.5 bg-neutral-600 text-white rounded hover:bg-neutral-700"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

