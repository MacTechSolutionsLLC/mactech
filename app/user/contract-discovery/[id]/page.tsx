'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface PointOfContact {
  name: string
  email: string
  phone?: string
  role?: string
}

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
  description?: string
  points_of_contact?: string
  requirements?: string
  deadline?: string
  estimated_value?: string
  period_of_performance?: string
  place_of_performance?: string
  scraped: boolean
  scraped_at?: string
  scraped_text_content?: string
  scraped_html_content?: string
  sow_attachment_url?: string
  sow_attachment_type?: string
  aiSummary?: string
  aiKeyRequirements?: string
  aiAwardLikelihood?: number
  aiAwardConfidence?: string
  aiAwardReasoning?: string
  created_at: string
  updated_at: string
}

export default function ContractDetailPage() {
  const params = useParams()
  const contractId = params.id as string
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [calculatingLikelihood, setCalculatingLikelihood] = useState(false)

  useEffect(() => {
    if (contractId) {
      loadContract()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractId])

  const loadContract = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/contract-discovery/${contractId}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.contract) {
        setContract(data.contract)
        setError(null)
      } else {
        setError(data.error || 'Contract not found')
      }
    } catch (err) {
      console.error('Error loading contract:', err)
      setError(err instanceof Error ? err.message : 'Failed to load contract')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true)
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/analyze`, {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Analysis failed')
      }
      
      const data = await response.json()
      if (data.success) {
        await loadContract() // Reload to get updated analysis
      }
    } catch (err) {
      console.error('Error analyzing contract:', err)
      alert(err instanceof Error ? err.message : 'Failed to analyze contract')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCalculateLikelihood = async () => {
    try {
      setCalculatingLikelihood(true)
      const response = await fetch(`/api/admin/contract-discovery/${contractId}/award-likelihood`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Likelihood calculation failed')
      }
      
      const data = await response.json()
      if (data.success) {
        await loadContract() // Reload to get updated likelihood
      }
    } catch (err) {
      console.error('Error calculating likelihood:', err)
      alert(err instanceof Error ? err.message : 'Failed to calculate likelihood')
    } finally {
      setCalculatingLikelihood(false)
    }
  }

  const parseJsonField = (field: string | null | undefined, fallback: any = []) => {
    if (!field) return fallback
    try {
      return JSON.parse(field)
    } catch {
      return fallback
    }
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
          <p className="text-body text-neutral-600">Loading contract details...</p>
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="bg-white min-h-screen">
        <section className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <h1 className="heading-2 mb-4">Contract Not Found</h1>
              <p className="text-body text-neutral-700 mb-6">{error || 'The requested contract could not be found.'}</p>
              <Link href="/user/contract-discovery/dashboard" className="btn-primary">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const pointsOfContact: PointOfContact[] = parseJsonField(contract.points_of_contact, [])
  const requirements: string[] = parseJsonField(contract.requirements, [])
  const aiKeyRequirements: string[] = parseJsonField(contract.aiKeyRequirements, [])

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-white border-b-2 border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/user/contract-discovery/dashboard" className="text-body-sm text-accent-700 hover:text-accent-900 mb-6 inline-flex items-center gap-2">
            <span>←</span>
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {contract.notice_id && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-medium bg-accent-100 text-accent-800">
                    Notice ID: {contract.notice_id}
                  </span>
                )}
                {contract.solicitation_number && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-medium bg-blue-100 text-blue-800">
                    {contract.solicitation_number}
                  </span>
                )}
              </div>
              <h1 className="heading-hero mb-3 text-neutral-900">{contract.title}</h1>
              {contract.agency && (
                <p className="text-body-lg text-neutral-700 font-medium">{contract.agency}</p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={contract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary whitespace-nowrap"
              >
                🔗 View Original
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {contract.deadline && (
                <div className="card p-5 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-body-xs font-medium text-red-900 uppercase tracking-wide">Deadline</p>
                      <p className="text-body-sm font-semibold text-red-800">{contract.deadline}</p>
                    </div>
                  </div>
                </div>
              )}
              {contract.estimated_value && (
                <div className="card p-5 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-body-xs font-medium text-green-900 uppercase tracking-wide">Estimated Value</p>
                      <p className="text-body-sm font-semibold text-green-800">{contract.estimated_value}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {contract.description ? (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <h2 className="heading-3">Description</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-body text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {contract.description}
                  </p>
                </div>
              </div>
            ) : contract.scraped_text_content ? (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <h2 className="heading-3">Description</h2>
                </div>
                <p className="text-body-sm text-neutral-600 mb-4">
                  Extracted from scraped content:
                </p>
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-body-xs text-neutral-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {contract.scraped_text_content.substring(0, 3000)}
                    {contract.scraped_text_content.length > 3000 && '...'}
                  </pre>
                </div>
              </div>
            ) : null}

            {/* AI Summary */}
            {contract.aiSummary && (
              <div className="card p-6 bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="heading-3 text-accent-900">AI Summary</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-body text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {contract.aiSummary}
                  </p>
                </div>
              </div>
            )}

            {/* Requirements */}
            {(requirements.length > 0 || aiKeyRequirements.length > 0) && (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">✅</span>
                  <h2 className="heading-3">Requirements</h2>
                </div>
                {aiKeyRequirements.length > 0 ? (
                  <ul className="space-y-3">
                    {aiKeyRequirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body-sm text-neutral-700 flex-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="space-y-3">
                    {requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-2 w-2 bg-accent-700 rounded-full"></div>
                        </div>
                        <span className="text-body-sm text-neutral-700 flex-1">{req}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Award Likelihood Card */}
            <div className="card p-6 shadow-lg bg-gradient-to-br from-white to-neutral-50 border-2 border-neutral-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <h2 className="heading-3">Award Likelihood</h2>
              </div>
              {contract.aiAwardLikelihood !== null && contract.aiAwardLikelihood !== undefined ? (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-body-sm font-medium text-neutral-700">Score</span>
                      <span className="text-3xl font-bold text-accent-700">
                        {contract.aiAwardLikelihood.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-4 shadow-inner">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          contract.aiAwardLikelihood >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          contract.aiAwardLikelihood >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${contract.aiAwardLikelihood}%` }}
                      ></div>
                    </div>
                  </div>
                  {contract.aiAwardConfidence && (
                    <div className="mb-4 p-3 bg-neutral-100 rounded-lg">
                      <p className="text-body-xs text-neutral-600 mb-1">Confidence Level</p>
                      <p className="text-body-sm font-semibold text-neutral-900">{contract.aiAwardConfidence}</p>
                    </div>
                  )}
                  {contract.aiAwardReasoning && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-body-xs font-medium text-neutral-700 mb-2">Analysis</p>
                      <p className="text-body-sm text-neutral-700 leading-relaxed">
                        {contract.aiAwardReasoning}
                      </p>
                    </div>
                  )}
                  <button
                    onClick={handleCalculateLikelihood}
                    disabled={calculatingLikelihood}
                    className="btn-secondary w-full mt-4"
                  >
                    {calculatingLikelihood ? '⏳ Calculating...' : '🔄 Recalculate'}
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-body-sm text-neutral-600 mb-4">
                    Calculate the likelihood of winning this contract based on MacTech capabilities and requirements.
                  </p>
                  <button
                    onClick={handleCalculateLikelihood}
                    disabled={calculatingLikelihood}
                    className="btn-primary w-full"
                  >
                    {calculatingLikelihood ? '⏳ Calculating...' : '🎯 Calculate Likelihood'}
                  </button>
                </div>
              )}
            </div>

            {/* Contract Details Card */}
            <div className="card p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <h2 className="heading-3">Contract Details</h2>
              </div>
              <dl className="space-y-4">
                {contract.notice_id && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Notice ID
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-mono">{contract.notice_id}</dd>
                  </div>
                )}
                {contract.solicitation_number && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Solicitation Number
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-mono">{contract.solicitation_number}</dd>
                  </div>
                )}
                {contract.deadline && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Response Deadline
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-semibold text-red-700">{contract.deadline}</dd>
                  </div>
                )}
                {contract.estimated_value && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Estimated Value
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-semibold text-green-700">{contract.estimated_value}</dd>
                  </div>
                )}
                {contract.period_of_performance && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Period of Performance
                    </dt>
                    <dd className="text-body-sm text-neutral-900">{contract.period_of_performance}</dd>
                  </div>
                )}
                {contract.place_of_performance && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Place of Performance
                    </dt>
                    <dd className="text-body-sm text-neutral-900">{contract.place_of_performance}</dd>
                  </div>
                )}
                {contract.naics_codes && contract.naics_codes.length > 0 && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      NAICS Codes
                    </dt>
                    <dd className="text-body-sm text-neutral-900">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contract.naics_codes.map((code, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-body-xs font-mono">
                            {code}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
                {contract.set_aside && contract.set_aside.length > 0 && (
                  <div>
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Set-Aside
                    </dt>
                    <dd className="text-body-sm text-neutral-900">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {contract.set_aside.map((sa, idx) => (
                          <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-body-xs font-medium">
                            {sa}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Points of Contact Card */}
            {pointsOfContact.length > 0 ? (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">👤</span>
                  <h2 className="heading-3">Points of Contact</h2>
                </div>
                <div className="space-y-4">
                  {pointsOfContact.map((poc, idx) => (
                    <div key={idx} className="p-4 bg-gradient-to-br from-neutral-50 to-white border border-neutral-200 rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          {poc.name && (
                            <p className="text-body-sm font-semibold text-neutral-900 mb-1">{poc.name}</p>
                          )}
                          {poc.role && (
                            <p className="text-body-xs text-neutral-600 mb-2">{poc.role}</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {poc.email && (
                          <a
                            href={`mailto:${poc.email}`}
                            className="flex items-center gap-2 text-body-sm text-accent-700 hover:text-accent-900 transition-colors"
                          >
                            <span className="text-lg">✉️</span>
                            <span className="break-all">{poc.email}</span>
                          </a>
                        )}
                        {poc.phone && (
                          <a
                            href={`tel:${poc.phone.replace(/\D/g, '')}`}
                            className="flex items-center gap-2 text-body-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                          >
                            <span className="text-lg">📞</span>
                            <span>{poc.phone}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card p-6 shadow-md border-dashed">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">👤</span>
                  <h2 className="heading-3">Points of Contact</h2>
                </div>
                <p className="text-body-sm text-neutral-600">No contact information found. Try scraping the page again or check the original page.</p>
              </div>
            )}

            {/* Keywords Card */}
            {contract.detected_keywords && contract.detected_keywords.length > 0 && (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏷️</span>
                  <h2 className="heading-3">Keywords</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {contract.detected_keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 bg-accent-50 text-accent-700 rounded-full text-body-xs font-medium border border-accent-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Card */}
            <div className="card p-6 shadow-md bg-gradient-to-br from-white to-accent-50 border-2 border-accent-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚡</span>
                <h2 className="heading-3">Actions</h2>
              </div>
              <div className="space-y-3">
                {!contract.aiSummary && (
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="btn-primary w-full"
                  >
                    {analyzing ? '⏳ Analyzing...' : '🤖 Generate AI Analysis'}
                  </button>
                )}
                {contract.sow_attachment_url && (
                  <a
                    href={contract.sow_attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full block text-center"
                  >
                    📎 View SOW ({contract.sow_attachment_type || 'Document'})
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
