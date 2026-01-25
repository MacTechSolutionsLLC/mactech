'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AuditSummary {
  total: number
  verified: number
  needsReview: number
  discrepancies: number
  averageComplianceScore: number
  byStatus: Record<string, { claimed: number; verified: number }>
  byFamily: Record<string, { total: number; averageScore: number }>
  criticalIssues: Array<{ controlId: string; issue: string }>
}

interface ControlAuditResult {
  controlId: string
  requirement: string
  family: string
  claimedStatus: string
  verifiedStatus: string
  verificationStatus: string
  issues: string[]
  complianceScore: number
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

export default function AuditSummary() {
  const [summary, setSummary] = useState<AuditSummary | null>(null)
  const [results, setResults] = useState<ControlAuditResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRun, setLastRun] = useState<Date | null>(null)
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set())

  const runAudit = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/compliance/audit')
      if (!response.ok) {
        throw new Error('Failed to run audit')
      }
      const data = await response.json()
      if (data.success) {
        setSummary(data.summary)
        setResults(data.results || [])
        setLastRun(new Date())
      } else {
        throw new Error(data.error || 'Audit failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run audit')
    } finally {
      setLoading(false)
    }
  }

  const toggleFamily = (family: string) => {
    const newExpanded = new Set(expandedFamilies)
    if (newExpanded.has(family)) {
      newExpanded.delete(family)
    } else {
      newExpanded.add(family)
    }
    setExpandedFamilies(newExpanded)
  }

  useEffect(() => {
    runAudit()
  }, [])

  if (loading && !summary) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="text-neutral-500">Running compliance audit...</div>
        </div>
      </div>
    )
  }

  if (error && !summary) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={runAudit}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Retry Audit
        </button>
      </div>
    )
  }

  if (!summary) {
    return null
  }

  const verificationRate = summary.total > 0 
    ? Math.round((summary.verified / summary.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Audit Results</h2>
          {lastRun && (
            <p className="text-sm text-neutral-500 mt-1">
              Last run: {lastRun.toLocaleString()}
            </p>
          )}
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running...' : 'Run Full Audit'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-neutral-600">Total Controls</div>
          <div className="text-3xl font-bold text-neutral-900 mt-2">{summary.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-neutral-600">Verified</div>
          <div className="text-3xl font-bold text-green-600 mt-2">{summary.verified}</div>
          <div className="text-xs text-neutral-500 mt-1">{verificationRate}% verification rate</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-neutral-600">Needs Review</div>
          <div className="text-3xl font-bold text-yellow-600 mt-2">{summary.needsReview}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-neutral-600">Average Score</div>
          <div className="text-3xl font-bold text-neutral-900 mt-2">
            {summary.averageComplianceScore}%
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Status Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(summary.byStatus).map(([status, counts]) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="capitalize font-medium text-neutral-700">
                  {status.replace('_', ' ')}
                </span>
                <span className="text-sm text-neutral-500">
                  ({counts.verified}/{counts.claimed} verified)
                </span>
              </div>
              <div className="flex-1 mx-4 bg-neutral-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full"
                  style={{
                    width: `${counts.claimed > 0 ? (counts.verified / counts.claimed) * 100 : 0}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compliance by Control Family</h3>
        <div className="space-y-2">
          {Object.entries(summary.byFamily)
            .sort((a, b) => b[1].averageScore - a[1].averageScore)
            .map(([family, data]) => {
              const isExpanded = expandedFamilies.has(family)
              const familyControls = results.filter(r => r.family === family)
                .sort((a, b) => a.complianceScore - b.complianceScore) // Sort by score (lowest first)
              
              return (
                <div key={family} className="border border-neutral-200 rounded-lg">
                  <div className="flex items-center justify-between p-3 hover:bg-neutral-50 transition-colors">
                    <button
                      onClick={() => toggleFamily(family)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span className={`text-sm ${isExpanded ? 'rotate-90' : ''} transition-transform`}>
                        ▶
                      </span>
                      <div className="flex items-center gap-3 flex-1">
                        <span className="font-medium text-neutral-700">
                          {family} - {FAMILY_NAMES[family] || family}
                        </span>
                        <span className="text-sm text-neutral-500">
                          ({data.total} controls)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 w-32 bg-neutral-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              data.averageScore >= 80
                                ? 'bg-green-500'
                                : data.averageScore >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${data.averageScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 w-12 text-right">
                          {data.averageScore}%
                        </span>
                      </div>
                    </button>
                    <Link
                      href={`/admin/compliance/sctm?family=${family}`}
                      className="ml-4 text-xs text-primary-600 hover:text-primary-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View in SCTM →
                    </Link>
                  </div>
                  
                  {isExpanded && (
                    <div className="border-t border-neutral-200 bg-neutral-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-neutral-700">
                        Controls in {family} Family (sorted by compliance score)
                      </div>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {familyControls.map((control) => (
                          <div
                            key={control.controlId}
                            className="bg-white rounded border border-neutral-200 p-3"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <Link
                                  href={`/admin/compliance/sctm#control-${control.controlId}`}
                                  className="font-medium text-neutral-900 hover:text-primary-600"
                                >
                                  {control.controlId} - {control.requirement}
                                </Link>
                                <div className="text-xs text-neutral-500 mt-1">
                                  Status: {control.claimedStatus} | Verified: {control.verificationStatus}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <div className="w-24 bg-neutral-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      control.complianceScore >= 80
                                        ? 'bg-green-500'
                                        : control.complianceScore >= 50
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${control.complianceScore}%` }}
                                  />
                                </div>
                                <span className={`text-sm font-medium w-12 text-right ${
                                  control.complianceScore >= 80
                                    ? 'text-green-600'
                                    : control.complianceScore >= 50
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}>
                                  {control.complianceScore}%
                                </span>
                              </div>
                            </div>
                            {control.issues.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-200">
                                <div className="text-xs font-semibold text-red-700 mb-1">
                                  Issues ({control.issues.length}):
                                </div>
                                <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
                                  {control.issues.slice(0, 5).map((issue, idx) => (
                                    <li key={idx}>{issue}</li>
                                  ))}
                                  {control.issues.length > 5 && (
                                    <li className="text-neutral-500">
                                      ...and {control.issues.length - 5} more issues
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* Critical Issues */}
      {summary.criticalIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4">
            Critical Issues ({summary.criticalIssues.length})
          </h3>
          <div className="space-y-2">
            {summary.criticalIssues.slice(0, 10).map((issue, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Link
                  href={`/admin/compliance/sctm#control-${issue.controlId}`}
                  className="text-sm font-medium text-red-800 hover:text-red-900"
                >
                  Control {issue.controlId}
                </Link>
                <span className="text-sm text-red-700">{issue.issue}</span>
              </div>
            ))}
            {summary.criticalIssues.length > 10 && (
              <p className="text-sm text-red-600 mt-2">
                ...and {summary.criticalIssues.length - 10} more issues
              </p>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow p-4">
        <Link
          href="/admin/compliance/sctm"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          View Detailed Control Matrix →
        </Link>
      </div>
    </div>
  )
}
