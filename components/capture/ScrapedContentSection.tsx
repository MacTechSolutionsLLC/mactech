/**
 * Scraped Content Section Component
 * Parses and displays scraped HTML/text content in organized, beautiful sections
 */

'use client'

import { useState } from 'react'

interface ScrapedContentSectionProps {
  opportunity: {
    scraped_html_content?: string | null
    scraped_text_content?: string | null
    scraped_at?: string | Date | null
    aiParsedData?: string | null
    requirements?: string | null
    points_of_contact?: string | null
    deadline?: string | null
    estimated_value?: string | null
    period_of_performance?: string | null
    place_of_performance?: string | null
    resource_links?: string | null
  }
}

export default function ScrapedContentSection({ opportunity }: ScrapedContentSectionProps) {
  const [showRawContent, setShowRawContent] = useState(false)

  // Parse JSON fields
  let parsedData: any = null
  if (opportunity.aiParsedData) {
    try {
      parsedData = typeof opportunity.aiParsedData === 'string'
        ? JSON.parse(opportunity.aiParsedData)
        : opportunity.aiParsedData
    } catch {
      // Invalid JSON
    }
  }

  let requirements: string[] = []
  if (parsedData?.requirements && Array.isArray(parsedData.requirements)) {
    requirements = parsedData.requirements
  } else if (opportunity.requirements) {
    try {
      requirements = typeof opportunity.requirements === 'string'
        ? JSON.parse(opportunity.requirements)
        : opportunity.requirements
    } catch {
      // Invalid JSON
    }
  }

  let pointsOfContact: Array<{
    name?: string
    email?: string
    phone?: string
    role?: string
  }> = []
  if (parsedData?.pointsOfContact && Array.isArray(parsedData.pointsOfContact)) {
    pointsOfContact = parsedData.pointsOfContact
  } else if (opportunity.points_of_contact) {
    try {
      pointsOfContact = typeof opportunity.points_of_contact === 'string'
        ? JSON.parse(opportunity.points_of_contact)
        : opportunity.points_of_contact
    } catch {
      // Invalid JSON
    }
  }

  let deliverables: string[] = []
  if (parsedData?.deliverables && Array.isArray(parsedData.deliverables)) {
    deliverables = parsedData.deliverables
  }

  let links: Array<{
    url: string
    type?: string
    name?: string
    description?: string
  }> = []
  if (parsedData?.links && Array.isArray(parsedData.links)) {
    links = parsedData.links
  } else if (opportunity.resource_links) {
    try {
      links = typeof opportunity.resource_links === 'string'
        ? JSON.parse(opportunity.resource_links)
        : opportunity.resource_links
    } catch {
      // Invalid JSON
    }
  }

  const hasStructuredData = parsedData || requirements.length > 0 || pointsOfContact.length > 0 || deliverables.length > 0 || links.length > 0

  if (!opportunity.scraped_html_content && !opportunity.scraped_text_content && !hasStructuredData) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-8 space-y-6">
      {/* Summary Section */}
      {parsedData?.summary && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Opportunity Summary</h2>
          <p className="text-neutral-700 leading-relaxed">{parsedData.summary}</p>
        </div>
      )}

      {/* Key Information Grid */}
      {(parsedData?.deadline || opportunity.deadline || parsedData?.estimatedValue || opportunity.estimated_value || 
        parsedData?.performancePeriod || opportunity.period_of_performance || parsedData?.location || opportunity.place_of_performance) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Key Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(parsedData?.deadline || opportunity.deadline) && (
              <div>
                <div className="text-sm text-neutral-600 mb-1">Response Deadline</div>
                <div className="text-base font-semibold text-neutral-900">
                  {parsedData?.deadline || opportunity.deadline}
                </div>
              </div>
            )}
            {(parsedData?.estimatedValue || opportunity.estimated_value) && (
              <div>
                <div className="text-sm text-neutral-600 mb-1">Estimated Value</div>
                <div className="text-base font-semibold text-neutral-900">
                  {parsedData?.estimatedValue || opportunity.estimated_value}
                </div>
              </div>
            )}
            {(parsedData?.performancePeriod || opportunity.period_of_performance) && (
              <div>
                <div className="text-sm text-neutral-600 mb-1">Period of Performance</div>
                <div className="text-base font-semibold text-neutral-900">
                  {parsedData?.performancePeriod || opportunity.period_of_performance}
                </div>
              </div>
            )}
            {(parsedData?.location || opportunity.place_of_performance) && (
              <div>
                <div className="text-sm text-neutral-600 mb-1">Place of Performance</div>
                <div className="text-base font-semibold text-neutral-900">
                  {parsedData?.location || opportunity.place_of_performance}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Requirements Section */}
      {requirements.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Requirements</h2>
          <ul className="space-y-3">
            {requirements.map((req, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-700 mt-1">•</span>
                <span className="text-neutral-700 flex-1">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deliverables Section */}
      {deliverables.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Deliverables</h2>
          <ul className="space-y-3">
            {deliverables.map((deliverable, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-green-700 mt-1">✓</span>
                <span className="text-neutral-700 flex-1">{deliverable}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Points of Contact Section */}
      {pointsOfContact.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Points of Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pointsOfContact.map((contact, idx) => (
              <div key={idx} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                {contact.name && (
                  <div className="font-semibold text-neutral-900 mb-2">{contact.name}</div>
                )}
                {contact.role && (
                  <div className="text-sm text-neutral-600 mb-2">{contact.role}</div>
                )}
                <div className="space-y-1 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Email:</span>
                      <a href={`mailto:${contact.email}`} className="text-accent-700 hover:text-accent-800">
                        {contact.email}
                      </a>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Phone:</span>
                      <a href={`tel:${contact.phone}`} className="text-accent-700 hover:text-accent-800">
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Links/Attachments Section */}
      {links.length > 0 && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Related Links & Attachments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-accent-300 hover:bg-accent-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {link.type === 'SOW' ? (
                    <span className="text-lg">📄</span>
                  ) : link.type === 'Attachment' ? (
                    <span className="text-lg">📎</span>
                  ) : (
                    <span className="text-lg">🔗</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900 truncate">
                    {link.name || link.description || 'Link'}
                  </div>
                  {link.type && (
                    <div className="text-xs text-neutral-500 mt-1">{link.type}</div>
                  )}
                  <div className="text-xs text-neutral-400 truncate mt-1">{link.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Background/Scope Section */}
      {(parsedData?.background || parsedData?.scope || parsedData?.objectives) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Background & Scope</h2>
          <div className="space-y-4">
            {parsedData.background && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2">Background</h3>
                <p className="text-neutral-700 leading-relaxed">{parsedData.background}</p>
              </div>
            )}
            {parsedData.objectives && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2">Objectives</h3>
                <p className="text-neutral-700 leading-relaxed">{parsedData.objectives}</p>
              </div>
            )}
            {parsedData.scope && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-700 mb-2">Scope of Work</h3>
                <p className="text-neutral-700 leading-relaxed">{parsedData.scope}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Keywords/Skills Section */}
      {(parsedData?.keywords?.length > 0 || parsedData?.skills?.length > 0) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">Keywords & Skills</h2>
          <div className="flex flex-wrap gap-2">
            {parsedData.keywords?.map((keyword: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
            {parsedData.skills?.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Raw Content Toggle */}
      {(opportunity.scraped_html_content || opportunity.scraped_text_content) && (
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Full Scraped Content</h2>
            <button
              onClick={() => setShowRawContent(!showRawContent)}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              {showRawContent ? 'Hide' : 'Show'} Raw Content
            </button>
          </div>
          {opportunity.scraped_at && (
            <p className="text-sm text-neutral-600 mb-4">
              Scraped on {new Date(opportunity.scraped_at).toLocaleString()}
            </p>
          )}
          
          {showRawContent && (
            <div className="space-y-4">
              {opportunity.scraped_text_content && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Text Content</h3>
                  <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-neutral-700 whitespace-pre-wrap font-sans">
                      {opportunity.scraped_text_content.substring(0, 50000)}
                      {opportunity.scraped_text_content.length > 50000 && (
                        <span className="text-neutral-500 italic">
                          {'\n\n... (content truncated for display, full content stored in database)'}
                        </span>
                      )}
                    </pre>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {opportunity.scraped_text_content.length.toLocaleString()} characters total
                  </p>
                </div>
              )}
              
              {opportunity.scraped_html_content && (
                <div>
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">HTML Content</h3>
                  <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-neutral-600 whitespace-pre-wrap font-mono">
                      {opportunity.scraped_html_content.substring(0, 100000)}
                      {opportunity.scraped_html_content.length > 100000 && (
                        <span className="text-neutral-500 italic">
                          {'\n\n... (HTML truncated for display, full content stored in database)'}
                        </span>
                      )}
                    </pre>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">
                    {opportunity.scraped_html_content.length.toLocaleString()} characters total
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
