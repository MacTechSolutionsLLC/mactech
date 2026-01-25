'use client'

import { useState } from 'react'
import Link from 'next/link'

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

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const getEvidencePath = (item: EvidenceItem): string | null => {
    if (!item.path) return null
    // Convert absolute path to relative path for linking
    let relativePath: string
    if (item.path.includes('compliance/cmmc')) {
      // Remove any absolute path prefix (works in both Node and browser)
      relativePath = item.path.replace(/^.*?compliance\/cmmc\//, 'compliance/cmmc/')
      // If it's already a relative path starting with compliance/cmmc, use it as-is
      if (!relativePath.startsWith('compliance/cmmc/')) {
        relativePath = item.path
      }
    } else {
      relativePath = item.path
    }
    // Return the path formatted for the document viewer
    return `/admin/compliance/document?path=${encodeURIComponent(relativePath)}`
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
                            <Link
                              href={path}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                              target="_blank"
                            >
                              View →
                            </Link>
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
                            <Link
                              href={path}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                              target="_blank"
                            >
                              View →
                            </Link>
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
                            <Link
                              href={path}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                              target="_blank"
                            >
                              View →
                            </Link>
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
                            <Link
                              href={`/${codePath}`}
                              className="text-xs text-primary-600 hover:text-primary-700 ml-2"
                              target="_blank"
                            >
                              View Code →
                            </Link>
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
    </div>
  )
}
