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
              <Link href="/admin/contract-discovery/dashboard" className="btn-primary">
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
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/admin/contract-discovery/dashboard" className="text-body-sm text-accent-700 hover:text-accent-900 mb-4 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="heading-hero mb-2">{contract.title}</h1>
              {contract.agency && (
                <p className="text-body-lg text-neutral-700">{contract.agency}</p>
              )}
            </div>
            <div className="flex gap-3">
              <a
                href={contract.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                View Original
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {contract.description && (
                <div className="card p-6">
                  <h2 className="heading-3 mb-4">Description</h2>
                  <p className="text-body text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {contract.description}
                  </p>
                </div>
              )}

              {/* AI Summary */}
              {contract.aiSummary && (
                <div className="card p-6 bg-accent-50 border-accent-200">
                  <h2 className="heading-3 mb-4 text-accent-900">AI Summary</h2>
                  <p className="text-body text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {contract.aiSummary}
                  </p>
                </div>
              )}

              {/* Requirements */}
              {(requirements.length > 0 || aiKeyRequirements.length > 0) && (
                <div className="card p-6">
                  <h2 className="heading-3 mb-4">Requirements</h2>
                  {aiKeyRequirements.length > 0 ? (
                    <ul className="space-y-3">
                      {aiKeyRequirements.map((req, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 mt-1.5">
                            <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                          </div>
                          <span className="text-body-sm text-neutral-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul className="space-y-3">
                      {requirements.map((req, idx) => (
                        <li key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 mt-1.5">
                            <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                          </div>
                          <span className="text-body-sm text-neutral-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Scraped Content */}
              {contract.scraped && (
                <div className="card p-6">
                  <h2 className="heading-3 mb-4">Scraped Content</h2>
                  <p className="text-body-sm text-neutral-600 mb-4">
                    Full text content extracted from the opportunity page
                  </p>
                  <div className="bg-neutral-50 border border-neutral-200 rounded p-4 max-h-96 overflow-y-auto">
                    <pre className="text-body-xs text-neutral-700 whitespace-pre-wrap font-sans">
                      {contract.scraped_text_content || 'No content available'}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Award Likelihood */}
              <div className="card p-6">
                <h2 className="heading-3 mb-4">Award Likelihood</h2>
                {contract.aiAwardLikelihood !== null && contract.aiAwardLikelihood !== undefined ? (
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-body-sm font-medium text-neutral-900">Score</span>
                        <span className="text-body-lg font-bold text-accent-700">
                          {contract.aiAwardLikelihood.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${
                            contract.aiAwardLikelihood >= 70 ? 'bg-green-600' :
                            contract.aiAwardLikelihood >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${contract.aiAwardLikelihood}%` }}
                        ></div>
                      </div>
                    </div>
                    {contract.aiAwardConfidence && (
                      <p className="text-body-sm text-neutral-600 mb-2">
                        Confidence: <span className="font-medium">{contract.aiAwardConfidence}</span>
                      </p>
                    )}
                    {contract.aiAwardReasoning && (
                      <div className="mt-4 pt-4 border-t border-neutral-200">
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
                      {calculatingLikelihood ? 'Calculating...' : 'Recalculate'}
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
                      {calculatingLikelihood ? 'Calculating...' : 'Calculate Likelihood'}
                    </button>
                  </div>
                )}
              </div>

              {/* Contract Details */}
              <div className="card p-6">
                <h2 className="heading-3 mb-4">Contract Details</h2>
                <dl className="space-y-3">
                  {contract.notice_id && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Notice ID
                      </dt>
                      <dd className="text-body-sm text-neutral-900">{contract.notice_id}</dd>
                    </div>
                  )}
                  {contract.solicitation_number && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Solicitation Number
                      </dt>
                      <dd className="text-body-sm text-neutral-900">{contract.solicitation_number}</dd>
                    </div>
                  )}
                  {contract.deadline && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Deadline
                      </dt>
                      <dd className="text-body-sm text-neutral-900">{contract.deadline}</dd>
                    </div>
                  )}
                  {contract.estimated_value && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Estimated Value
                      </dt>
                      <dd className="text-body-sm text-neutral-900 font-medium">{contract.estimated_value}</dd>
                    </div>
                  )}
                  {contract.period_of_performance && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Period of Performance
                      </dt>
                      <dd className="text-body-sm text-neutral-900">{contract.period_of_performance}</dd>
                    </div>
                  )}
                  {contract.place_of_performance && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Place of Performance
                      </dt>
                      <dd className="text-body-sm text-neutral-900">{contract.place_of_performance}</dd>
                    </div>
                  )}
                  {contract.naics_codes && contract.naics_codes.length > 0 && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        NAICS Codes
                      </dt>
                      <dd className="text-body-sm text-neutral-900">
                        {contract.naics_codes.join(', ')}
                      </dd>
                    </div>
                  )}
                  {contract.set_aside && contract.set_aside.length > 0 && (
                    <div>
                      <dt className="text-body-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">
                        Set-Aside
                      </dt>
                      <dd className="text-body-sm text-neutral-900">
                        {contract.set_aside.map((sa, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded mr-2 mb-1">
                            {sa}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Points of Contact */}
              {pointsOfContact.length > 0 && (
                <div className="card p-6">
                  <h2 className="heading-3 mb-4">Points of Contact</h2>
                  <div className="space-y-4">
                    {pointsOfContact.map((poc, idx) => (
                      <div key={idx} className="border-b border-neutral-200 pb-4 last:border-0 last:pb-0">
                        {poc.name && (
                          <p className="text-body-sm font-semibold text-neutral-900 mb-1">{poc.name}</p>
                        )}
                        {poc.role && (
                          <p className="text-body-xs text-neutral-600 mb-2">{poc.role}</p>
                        )}
                        {poc.email && (
                          <a
                            href={`mailto:${poc.email}`}
                            className="text-body-sm text-accent-700 hover:text-accent-900 block mb-1"
                          >
                            {poc.email}
                          </a>
                        )}
                        {poc.phone && (
                          <a
                            href={`tel:${poc.phone}`}
                            className="text-body-sm text-neutral-700 block"
                          >
                            {poc.phone}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {contract.detected_keywords && contract.detected_keywords.length > 0 && (
                <div className="card p-6">
                  <h2 className="heading-3 mb-4">Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {contract.detected_keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-accent-50 text-accent-700 rounded text-body-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="card p-6">
                <h2 className="heading-3 mb-4">Actions</h2>
                <div className="space-y-3">
                  {!contract.aiSummary && (
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="btn-primary w-full"
                    >
                      {analyzing ? 'Analyzing...' : 'Generate AI Analysis'}
                    </button>
                  )}
                  {contract.sow_attachment_url && (
                    <a
                      href={contract.sow_attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full block text-center"
                    >
                      View SOW Attachment ({contract.sow_attachment_type || 'Document'})
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

