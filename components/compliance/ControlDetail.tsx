'use client'

import { useState, useEffect } from 'react'
import DocumentViewerModal from './DocumentViewerModal'

interface EvidenceItem {
  reference: string
  exists: boolean
  path?: string
  lastModified?: Date
  issues?: string[]
}

interface CodeVerification {
  file: string
  exists: boolean
  containsRelevantCode: boolean
  codeSnippets?: string[]
  issues?: string[]
}

interface ControlDetailProps {
  control: {
    id: string
    requirement: string
    nistRequirement?: string
    nistDiscussion?: string
    status: 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'
    family: string
    policy: string
    procedure: string
    evidence: string
    implementation: string
    sspSection: string
  }
  auditResult?: {
    verifiedStatus: string
    verificationStatus: 'verified' | 'discrepancy' | 'needs_review'
    issues: string[]
    evidence: {
      policies: EvidenceItem[]
      procedures: EvidenceItem[]
      evidenceFiles: EvidenceItem[]
      implementationFiles: EvidenceItem[]
      codeVerification: CodeVerification[]
    }
    complianceScore: number
    lastVerified: Date
  }
}

const STATUS_COLORS: Record<string, string> = {
  implemented: 'bg-green-100 text-green-800 border-green-300',
  inherited: 'bg-blue-100 text-blue-800 border-blue-300',
  partially_satisfied: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  not_implemented: 'bg-red-100 text-red-800 border-red-300',
  not_applicable: 'bg-neutral-100 text-neutral-800 border-neutral-300',
}

const VERIFICATION_COLORS: Record<string, string> = {
  verified: 'bg-green-50 border-green-200',
  needs_review: 'bg-yellow-50 border-yellow-200',
  discrepancy: 'bg-red-50 border-red-200',
}

const FAMILY_NAMES: Record<string, string> = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CM: 'Configuration Management',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PS: 'Personnel Security',
  PE: 'Physical Protection',
  RA: 'Risk Assessment',
  SA: 'Security Assessment',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity',
}

export default function ControlDetail({ control, auditResult }: ControlDetailProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [documentModal, setDocumentModal] = useState<{ path: string; name: string } | null>(null)
  const [nistFullText, setNistFullText] = useState<{ requirement?: string; discussion?: string }>({})
  const [nistLoading, setNistLoading] = useState<{ requirement?: boolean; discussion?: boolean }>({})
  const [nistExpanded, setNistExpanded] = useState<{ requirement?: boolean; discussion?: boolean }>({})

  // Debug: Log control data to console
  useEffect(() => {
    if (control.id === '3.1.1' || control.id === '3.1.2') {
      console.log(`ControlDetail received control ${control.id}:`, {
        nistRequirement: control.nistRequirement ? `EXISTS (${control.nistRequirement.length} chars)` : 'UNDEFINED',
        nistDiscussion: control.nistDiscussion ? `EXISTS (${control.nistDiscussion.length} chars)` : 'UNDEFINED',
        allKeys: Object.keys(control),
      })
    }
  }, [control])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const isTruncated = (text: string): boolean => {
    return text.endsWith('...') || text.includes('[See full')
  }

  const fetchFullNISTText = async (type: 'requirement' | 'discussion') => {
    if (nistFullText[type]) {
      // Already fetched, just toggle
      setNistExpanded(prev => ({ ...prev, [type]: !prev[type] }))
      return
    }

    setNistLoading(prev => ({ ...prev, [type]: true }))
    try {
      const response = await fetch(`/api/admin/compliance/nist-text/${control.id}`)
      if (response.ok) {
        const data = await response.json()
        setNistFullText(prev => ({
          ...prev,
          requirement: data.requirement,
          discussion: data.discussion,
        }))
        setNistExpanded(prev => ({ ...prev, [type]: true }))
      }
    } catch (error) {
      console.error(`Error fetching full NIST ${type}:`, error)
    } finally {
      setNistLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  const getEvidencePath = (item: EvidenceItem): string | null => {
    if (!item.path) return null
    
    // Convert absolute path to relative path for modal
    let relativePath: string = item.path
    
    // If it's an absolute path, extract the relative portion
    if (item.path.includes('compliance/cmmc')) {
      // Extract path after compliance/cmmc/
      const match = item.path.match(/compliance\/cmmc\/(.+)$/)
      if (match) {
        relativePath = `compliance/cmmc/${match[1]}`
      } else {
        // Fallback: try to extract from any position
        relativePath = item.path.replace(/^.*?compliance\/cmmc\//, 'compliance/cmmc/')
      }
    } else if (item.path.startsWith('/') || item.path.includes(process.cwd?.() || '')) {
      // Absolute path - try to extract relative portion
      // Check if it's in the compliance directory structure
      const complianceMatch = item.path.match(/(compliance\/cmmc\/.+)$/)
      if (complianceMatch) {
        relativePath = complianceMatch[1]
      } else {
        // For code files, try to extract relative to project root
        const codeMatch = item.path.match(/(lib\/.+|app\/.+|components\/.+|middleware\.ts)$/)
        if (codeMatch) {
          relativePath = codeMatch[1]
        } else {
          // Can't convert, return as-is (might fail, but better than nothing)
          relativePath = item.path
        }
      }
    }
    
    // Return the relative path for the modal
    return relativePath
  }

  const getCodePath = (file: string): string | null => {
    if (file.includes('/')) {
      return file
    }
    // Try common locations
    if (file.includes('.ts') || file.includes('.tsx')) {
      return `lib/${file}`
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-neutral-900">
                Control {control.id}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded border ${STATUS_COLORS[control.status]}`}>
                {control.status.replace('_', ' ').toUpperCase()}
              </span>
              {auditResult && (
                <span className={`px-2 py-1 text-xs font-medium rounded border ${
                  VERIFICATION_COLORS[auditResult.verificationStatus] || 'bg-neutral-50 border-neutral-200'
                }`}>
                  {auditResult.verificationStatus.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-700">{control.requirement}</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-neutral-500">
              <span>Family: {control.family} - {FAMILY_NAMES[control.family] || control.family}</span>
              {auditResult && (
                <span>Compliance Score: {auditResult.complianceScore}%</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="divide-y divide-neutral-200">
        {/* Overview */}
        <div className="px-6 py-4">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="font-medium text-neutral-900">Overview</h4>
            <span className="text-neutral-400">{expandedSections.has('overview') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.has('overview') && (
            <div className="mt-3 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-neutral-700">Policy:</span>
                  <p className="text-neutral-600 mt-1">{control.policy || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Procedure:</span>
                  <p className="text-neutral-600 mt-1">{control.procedure || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">SSP Section:</span>
                  <p className="text-neutral-600 mt-1">{control.sspSection || '-'}</p>
                </div>
                <div>
                  <span className="font-medium text-neutral-700">Implementation:</span>
                  <p className="text-neutral-600 mt-1">{control.implementation || '-'}</p>
                </div>
              </div>
              {auditResult && auditResult.issues.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="font-medium text-yellow-800 mb-2">Issues Found:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    {auditResult.issues.slice(0, 5).map((issue, idx) => (
                      <li key={idx} className="text-xs">{issue}</li>
                    ))}
                    {auditResult.issues.length > 5 && (
                      <li className="text-xs">...and {auditResult.issues.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NIST SP 800-171 Reference */}
        <div className="px-6 py-4">
          <button
            onClick={() => toggleSection('nist')}
            className="w-full flex items-center justify-between text-left"
          >
            <h4 className="font-medium text-neutral-900">NIST SP 800-171 Reference</h4>
            <span className="text-neutral-400">{expandedSections.has('nist') ? '▼' : '▶'}</span>
          </button>
          {expandedSections.has('nist') && (
            <div className="mt-3 space-y-4 text-sm">
              {control.nistRequirement ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-blue-900">NIST Requirement (Exact Text)</h5>
                    {isTruncated(control.nistRequirement) && (
                      <button
                        onClick={() => fetchFullNISTText('requirement')}
                        disabled={nistLoading.requirement}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50"
                      >
                        {nistLoading.requirement ? 'Loading...' : nistExpanded.requirement ? 'Show Less' : 'See Full'}
                      </button>
                    )}
                  </div>
                  <div className="text-blue-800 whitespace-pre-wrap font-serif leading-relaxed">
                    {nistExpanded.requirement && nistFullText.requirement
                      ? nistFullText.requirement
                      : control.nistRequirement}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h5 className="font-semibold text-neutral-700 mb-2">NIST Requirement (Exact Text)</h5>
                  <p className="text-neutral-500 italic">No NIST requirement text available. Run the enrichment script to populate this field.</p>
                </div>
              )}
              {control.nistDiscussion ? (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-semibold text-indigo-900">NIST Discussion / Guidance</h5>
                    {isTruncated(control.nistDiscussion) && (
                      <button
                        onClick={() => fetchFullNISTText('discussion')}
                        disabled={nistLoading.discussion}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                      >
                        {nistLoading.discussion ? 'Loading...' : nistExpanded.discussion ? 'Show Less' : 'See Full'}
                      </button>
                    )}
                  </div>
                  <div className="text-indigo-800 whitespace-pre-wrap font-serif leading-relaxed max-h-96 overflow-y-auto">
                    {nistExpanded.discussion && nistFullText.discussion
                      ? nistFullText.discussion
                      : control.nistDiscussion}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h5 className="font-semibold text-neutral-700 mb-2">NIST Discussion / Guidance</h5>
                  <p className="text-neutral-500 italic">No NIST discussion text available. Run the enrichment script to populate this field.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Policies */}
        {auditResult && auditResult.evidence.policies.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('policies')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-medium text-neutral-900">
                Policies ({auditResult.evidence.policies.filter(p => p.exists).length}/{auditResult.evidence.policies.length})
              </h4>
              <span className="text-neutral-400">{expandedSections.has('policies') ? '▼' : '▶'}</span>
            </button>
            {expandedSections.has('policies') && (
              <div className="mt-3 space-y-2">
                {auditResult.evidence.policies.map((policy, idx) => {
                  const path = getEvidencePath(policy)
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        policy.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{policy.reference}</span>
                          {path && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDocumentModal({ path: path, name: policy.reference })
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2 underline"
                            >
                              View →
                            </button>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          policy.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {policy.exists ? '✓ Found' : '✗ Missing'}
                        </span>
                      </div>
                      {policy.issues && policy.issues.length > 0 && (
                        <p className="text-xs text-red-700 mt-1">{policy.issues[0]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Procedures */}
        {auditResult && auditResult.evidence.procedures.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('procedures')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-medium text-neutral-900">
                Procedures ({auditResult.evidence.procedures.filter(p => p.exists).length}/{auditResult.evidence.procedures.length})
              </h4>
              <span className="text-neutral-400">{expandedSections.has('procedures') ? '▼' : '▶'}</span>
            </button>
            {expandedSections.has('procedures') && (
              <div className="mt-3 space-y-2">
                {auditResult.evidence.procedures.map((procedure, idx) => {
                  const path = getEvidencePath(procedure)
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        procedure.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{procedure.reference}</span>
                          {path && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDocumentModal({ path: path, name: procedure.reference })
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2 underline"
                            >
                              View →
                            </button>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          procedure.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {procedure.exists ? '✓ Found' : '✗ Missing'}
                        </span>
                      </div>
                      {procedure.issues && procedure.issues.length > 0 && (
                        <p className="text-xs text-red-700 mt-1">{procedure.issues[0]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Evidence Files */}
        {auditResult && auditResult.evidence.evidenceFiles.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('evidence')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-medium text-neutral-900">
                Evidence Files ({auditResult.evidence.evidenceFiles.filter(e => e.exists).length}/{auditResult.evidence.evidenceFiles.length})
              </h4>
              <span className="text-neutral-400">{expandedSections.has('evidence') ? '▼' : '▶'}</span>
            </button>
            {expandedSections.has('evidence') && (
              <div className="mt-3 space-y-2">
                {auditResult.evidence.evidenceFiles.map((evidence, idx) => {
                  const path = getEvidencePath(evidence)
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        evidence.exists ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{evidence.reference}</span>
                          {path && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDocumentModal({ path: path, name: evidence.reference })
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2 underline"
                            >
                              View →
                            </button>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          evidence.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {evidence.exists ? '✓ Found' : '✗ Missing'}
                        </span>
                      </div>
                      {evidence.issues && evidence.issues.length > 0 && (
                        <p className="text-xs text-red-700 mt-1">{evidence.issues[0]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Code Implementation */}
        {auditResult && auditResult.evidence.codeVerification.length > 0 && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('code')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-medium text-neutral-900">
                Code Implementation ({auditResult.evidence.codeVerification.filter(c => c.exists && c.containsRelevantCode).length}/{auditResult.evidence.codeVerification.length})
              </h4>
              <span className="text-neutral-400">{expandedSections.has('code') ? '▼' : '▶'}</span>
            </button>
            {expandedSections.has('code') && (
              <div className="mt-3 space-y-3">
                {auditResult.evidence.codeVerification.map((code, idx) => {
                  const codePath = getCodePath(code.file)
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded border ${
                        code.exists && code.containsRelevantCode
                          ? 'bg-green-50 border-green-200'
                          : code.exists
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-medium text-sm">{code.file}</span>
                          {codePath && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setDocumentModal({ path: codePath, name: code.file })
                              }}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2 underline"
                            >
                              View Code →
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {code.exists && (
                            <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                              File Exists
                            </span>
                          )}
                          {code.containsRelevantCode && (
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                              Code Verified
                            </span>
                          )}
                        </div>
                      </div>
                      {code.codeSnippets && code.codeSnippets.length > 0 && (
                        <div className="mt-2 p-2 bg-neutral-50 rounded text-xs font-mono text-neutral-700">
                          <p className="text-xs text-neutral-500 mb-1">Relevant code found:</p>
                          {code.codeSnippets.map((snippet, snippetIdx) => (
                            <div key={snippetIdx} className="truncate">
                              {snippet.substring(0, 100)}...
                            </div>
                          ))}
                        </div>
                      )}
                      {code.issues && code.issues.length > 0 && (
                        <p className="text-xs text-red-700 mt-2">{code.issues[0]}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Verification Details */}
        {auditResult && (
          <div className="px-6 py-4">
            <button
              onClick={() => toggleSection('verification')}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-medium text-neutral-900">Verification Details</h4>
              <span className="text-neutral-400">{expandedSections.has('verification') ? '▼' : '▶'}</span>
            </button>
            {expandedSections.has('verification') && (
              <div className="mt-3 space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium text-neutral-700">Claimed Status:</span>
                    <p className="text-neutral-600 mt-1 capitalize">{control.status.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Verified Status:</span>
                    <p className="text-neutral-600 mt-1 capitalize">{auditResult.verifiedStatus.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Compliance Score:</span>
                    <div className="mt-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              auditResult.complianceScore >= 80
                                ? 'bg-green-500'
                                : auditResult.complianceScore >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${auditResult.complianceScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{auditResult.complianceScore}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-neutral-700">Last Verified:</span>
                    <p className="text-neutral-600 mt-1">
                      {new Date(auditResult.lastVerified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {documentModal && (
        <DocumentViewerModal
          isOpen={!!documentModal}
          onClose={() => setDocumentModal(null)}
          documentPath={documentModal.path}
          documentName={documentModal.name}
        />
      )}
    </div>
  )
}
