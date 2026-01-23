'use client'

import { useState, useEffect } from 'react'
import CaptureActions from './CaptureActions'

interface OpportunityDetailProps {
  opportunityId: string
  onBack: () => void
  onUpdate: () => void
}

interface PointOfContact {
  name: string
  email: string
  phone?: string
  role?: string
}

interface Opportunity {
  id: string
  notice_id?: string
  title: string
  agency?: string
  description?: string
  relevance_score: number
  deadline?: string
  aiSummary?: string
  aiAnalysis?: any
  flagged: boolean
  ignored: boolean
  naics_codes: string | string[]
  set_aside: string | string[]
  detected_keywords?: string[]
  aiKeyRequirements?: string[]
  // Explicit information fields
  points_of_contact?: string | PointOfContact[] | null
  url?: string
  solicitation_number?: string | null
  created_at?: string
  resource_links?: string | null
  // Enriched data
  scraped?: boolean
  scraped_at?: string
  scraped_text_content?: string | null
  scraped_html_content?: string | null
  aiParsedData?: string | null
  aiParsedAt?: string | null
  usaspending_enrichment?: any
  usaspending_enriched_at?: string | null
  usaspending_enrichment_status?: string | null
  incumbent_vendors?: string | null
  competitive_landscape_summary?: string | null
  requirements?: string | string[] | null
  estimated_value?: string | null
  period_of_performance?: string | null
  place_of_performance?: string | null
  sow_attachment_url?: string | null
  sow_attachment_type?: string | null
}

export default function OpportunityDetail({
  opportunityId,
  onBack,
  onUpdate,
}: OpportunityDetailProps) {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false)

  useEffect(() => {
    loadOpportunity()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opportunityId])

  const loadOpportunity = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/capture/opportunities/${opportunityId}`)
      const data = await response.json()
      if (data.success) {
        setOpportunity(data.opportunity)
      }
    } catch (error) {
      console.error('Error loading opportunity:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAnalysis = async () => {
    setGeneratingAnalysis(true)
    try {
      const response = await fetch(
        `/api/admin/capture/opportunities/${opportunityId}/analyze`,
        { method: 'POST' }
      )
      const data = await response.json()
      if (data.success) {
        await loadOpportunity()
        onUpdate()
      }
    } catch (error) {
      console.error('Error generating analysis:', error)
    } finally {
      setGeneratingAnalysis(false)
    }
  }

  const parseJsonField = <T = any>(field: string | T[] | null | undefined, fallback: T[] = [] as T[]): T[] => {
    if (!field) return fallback
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : fallback
      } catch {
        return fallback
      }
    }
    return fallback
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

  if (!opportunity) {
    return (
      <div className="bg-white min-h-screen">
        <section className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <h1 className="heading-2 mb-4">Contract Not Found</h1>
              <p className="text-body text-neutral-700 mb-6">The requested contract could not be found.</p>
              <button onClick={onBack} className="btn-primary">
                Back to Capture Dashboard
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  const aiAnalysis = opportunity.aiAnalysis
    ? typeof opportunity.aiAnalysis === 'string'
      ? JSON.parse(opportunity.aiAnalysis)
      : opportunity.aiAnalysis
    : null

  const enrichment = opportunity.usaspending_enrichment
    ? typeof opportunity.usaspending_enrichment === 'string'
      ? JSON.parse(opportunity.usaspending_enrichment)
      : opportunity.usaspending_enrichment
    : null

  const parsedData = opportunity.aiParsedData
    ? typeof opportunity.aiParsedData === 'string'
      ? JSON.parse(opportunity.aiParsedData)
      : opportunity.aiParsedData
    : null

  const incumbentVendors = opportunity.incumbent_vendors
    ? typeof opportunity.incumbent_vendors === 'string'
      ? JSON.parse(opportunity.incumbent_vendors)
      : opportunity.incumbent_vendors
    : null

  const requirements: string[] = parseJsonField<string>(opportunity.requirements, [])
  const aiKeyRequirements: string[] = parseJsonField<string>(opportunity.aiKeyRequirements, [])
  const pointsOfContact: PointOfContact[] = parseJsonField<PointOfContact>(opportunity.points_of_contact, [])
  const naicsCodes: string[] = parseJsonField<string>(opportunity.naics_codes, [])
  const setAside: string[] = parseJsonField<string>(opportunity.set_aside, [])
  const detectedKeywords: string[] = parseJsonField<string>(opportunity.detected_keywords, [])

  // Format deadline for display
  const formattedDeadline = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-white min-h-screen">
      {/* Hero Header */}
      <section className="bg-white border-b-2 border-neutral-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <button
            onClick={onBack}
            className="text-body-sm text-accent-700 hover:text-accent-900 mb-6 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Capture Dashboard</span>
          </button>
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {opportunity.notice_id && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-medium bg-accent-100 text-accent-800">
                    Notice ID: {opportunity.notice_id}
                  </span>
                )}
                {opportunity.solicitation_number && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-body-xs font-medium bg-blue-100 text-blue-800">
                    {opportunity.solicitation_number}
                  </span>
                )}
              </div>
              <h1 className="heading-hero mb-3 text-neutral-900">{opportunity.title}</h1>
              {opportunity.agency && (
                <p className="text-body-lg text-neutral-700 font-medium">{opportunity.agency}</p>
              )}
            </div>
            <div className="flex gap-3">
              {opportunity.url && (
                <a
                  href={opportunity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary whitespace-nowrap"
                >
                  🔗 View Original
                </a>
              )}
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
              {formattedDeadline && (
                <div className="card p-5 bg-red-50 border-red-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-body-xs font-medium text-red-900 uppercase tracking-wide">Deadline</p>
                      <p className="text-body-sm font-semibold text-red-800">{formattedDeadline}</p>
                    </div>
                  </div>
                </div>
              )}
              {opportunity.estimated_value && (
                <div className="card p-5 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-body-xs font-medium text-green-900 uppercase tracking-wide">Estimated Value</p>
                      <p className="text-body-sm font-semibold text-green-800">{opportunity.estimated_value}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {opportunity.description ? (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">📋</span>
                  <h2 className="heading-3">Description</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-body text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </div>
            ) : opportunity.scraped_text_content ? (
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
                    {opportunity.scraped_text_content.substring(0, 3000)}
                    {opportunity.scraped_text_content.length > 3000 && '...'}
                  </pre>
                </div>
              </div>
            ) : null}

            {/* AI Summary */}
            {(opportunity.aiSummary || aiAnalysis?.relevanceSummary) && (
              <div className="card p-6 bg-gradient-to-br from-accent-50 to-accent-100 border-2 border-accent-200 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🤖</span>
                  <h2 className="heading-3 text-accent-900">AI Summary</h2>
                </div>
                <div className="prose prose-sm max-w-none">
                  <p className="text-body text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis?.relevanceSummary || opportunity.aiSummary}
                  </p>
                </div>
                {aiAnalysis?.whyThisMatters && (
                  <div className="mt-4 pt-4 border-t border-accent-200">
                    <h3 className="text-body-sm font-semibold text-accent-900 mb-2">Why This Matters</h3>
                    <p className="text-body-sm text-neutral-800 leading-relaxed">
                      {aiAnalysis.whyThisMatters}
                    </p>
                  </div>
                )}
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

            {/* Competitive Intelligence */}
            {(enrichment || aiAnalysis?.competitiveLandscape || incumbentVendors) && (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏢</span>
                  <h2 className="heading-3">Competitive Intelligence</h2>
                </div>
                {enrichment?.statistics && (
                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-body-sm text-neutral-600">Similar Awards Found</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {enrichment.statistics.count}
                        </div>
                      </div>
                      <div>
                        <div className="text-body-sm text-neutral-600">Average Award Value</div>
                        <div className="text-lg font-semibold text-neutral-900">
                          {enrichment.statistics.average_obligation
                            ? `$${enrichment.statistics.average_obligation.toLocaleString()}`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    {enrichment.similar_awards && enrichment.similar_awards.length > 0 && (
                      <div>
                        <div className="text-body-sm font-medium text-neutral-700 mb-2">Similar Awards (with Entity API data)</div>
                        <div className="space-y-2">
                          {enrichment.similar_awards.slice(0, 5).map((award: any, idx: number) => (
                            <div key={idx} className="border border-neutral-200 rounded p-3">
                              <div className="text-body-sm font-medium text-neutral-900">
                                {award.recipient?.name || award.recipient_name || 'Unknown'}
                              </div>
                              {award.total_obligation && (
                                <div className="text-body-xs text-neutral-600">
                                  ${award.total_obligation.toLocaleString()}
                                </div>
                              )}
                              {award.recipient_entity_data && (
                                <div className="mt-2 text-body-xs text-neutral-600">
                                  <div>Entity: {award.recipient_entity_data.entityName || 'N/A'}</div>
                                  {award.recipient_entity_data.socioEconomicStatus && award.recipient_entity_data.socioEconomicStatus.length > 0 && (
                                    <div>Certifications: {award.recipient_entity_data.socioEconomicStatus.join(', ')}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {enrichment.statistics.unique_recipients && (
                      <div>
                        <div className="text-body-sm text-neutral-600 mb-2">Previous Awardees</div>
                        <div className="text-body-sm text-neutral-900">
                          {enrichment.statistics.unique_recipients.slice(0, 5).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {incumbentVendors && Array.isArray(incumbentVendors) && incumbentVendors.length > 0 && (
                  <div className="mb-4">
                    <div className="text-body-sm font-medium text-neutral-700 mb-2">Likely Incumbents (from Entity API)</div>
                    <div className="text-body-sm text-neutral-600">
                      {incumbentVendors.join(', ')}
                    </div>
                  </div>
                )}
                {opportunity.competitive_landscape_summary && (
                  <div>
                    <div className="text-body-sm font-medium text-neutral-700 mb-2">Competitive Landscape</div>
                    <p className="text-body-sm text-neutral-600">{opportunity.competitive_landscape_summary}</p>
                  </div>
                )}
                {aiAnalysis?.competitiveLandscape && (
                  <div className="space-y-2">
                    {aiAnalysis.competitiveLandscape.likelyIncumbents && (
                      <div>
                        <div className="text-body-sm font-medium text-neutral-700 mb-1">
                          Likely Incumbents
                        </div>
                        <div className="text-body-sm text-neutral-600">
                          {aiAnalysis.competitiveLandscape.likelyIncumbents.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Relevance Score Card */}
            {aiAnalysis?.relevanceScore !== undefined && (
              <div className="card p-6 shadow-lg bg-gradient-to-br from-white to-neutral-50 border-2 border-neutral-200">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🎯</span>
                  <h2 className="heading-3">Relevance Score</h2>
                </div>
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-body-sm font-medium text-neutral-700">Score</span>
                      <span className="text-3xl font-bold text-accent-700">
                        {aiAnalysis.relevanceScore.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-4 shadow-inner">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          aiAnalysis.relevanceScore >= 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          aiAnalysis.relevanceScore >= 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${aiAnalysis.relevanceScore}%` }}
                      ></div>
                    </div>
                  </div>
                  {aiAnalysis.relevanceReasoning && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <p className="text-body-xs font-medium text-neutral-700 mb-2">Analysis</p>
                      <p className="text-body-sm text-neutral-700 leading-relaxed">
                        {aiAnalysis.relevanceReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contract Details Card */}
            <div className="card p-6 shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📄</span>
                <h2 className="heading-3">Contract Details</h2>
              </div>
              <dl className="space-y-4">
                {opportunity.notice_id && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Notice ID
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-mono">{opportunity.notice_id}</dd>
                  </div>
                )}
                {opportunity.solicitation_number && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Solicitation Number
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-mono">{opportunity.solicitation_number}</dd>
                  </div>
                )}
                {formattedDeadline && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Response Deadline
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-semibold text-red-700">{formattedDeadline}</dd>
                  </div>
                )}
                {opportunity.estimated_value && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Estimated Value
                    </dt>
                    <dd className="text-body-sm text-neutral-900 font-semibold text-green-700">{opportunity.estimated_value}</dd>
                  </div>
                )}
                {opportunity.period_of_performance && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Period of Performance
                    </dt>
                    <dd className="text-body-sm text-neutral-900">{opportunity.period_of_performance}</dd>
                  </div>
                )}
                {opportunity.place_of_performance && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Place of Performance
                    </dt>
                    <dd className="text-body-sm text-neutral-900">{opportunity.place_of_performance}</dd>
                  </div>
                )}
                {naicsCodes.length > 0 && (
                  <div className="pb-3 border-b border-neutral-200">
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      NAICS Codes
                    </dt>
                    <dd className="text-body-sm text-neutral-900">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {naicsCodes.map((code, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-body-xs font-mono">
                            {code}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
                {setAside.length > 0 && (
                  <div>
                    <dt className="text-body-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">
                      Set-Aside
                    </dt>
                    <dd className="text-body-sm text-neutral-900">
                      <div className="flex flex-wrap gap-2 mt-1">
                        {setAside.map((sa, idx) => (
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
            {detectedKeywords.length > 0 && (
              <div className="card p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">🏷️</span>
                  <h2 className="heading-3">Keywords</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedKeywords.map((keyword, idx) => (
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
                {!opportunity.aiSummary && !aiAnalysis && (
                  <button
                    onClick={handleGenerateAnalysis}
                    disabled={generatingAnalysis}
                    className="btn-primary w-full"
                  >
                    {generatingAnalysis ? '⏳ Analyzing...' : '🤖 Generate AI Analysis'}
                  </button>
                )}
                {opportunity.sow_attachment_url && (
                  <a
                    href={opportunity.sow_attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full block text-center"
                  >
                    📎 View SOW ({opportunity.sow_attachment_type || 'Document'})
                  </a>
                )}
              </div>
            </div>

            {/* Capture Actions */}
            <CaptureActions opportunityId={opportunityId} opportunity={opportunity} onUpdate={onUpdate} />
          </div>
        </div>
      </section>
    </div>
  )
}
