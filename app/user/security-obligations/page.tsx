'use client'

import { useState, useEffect } from 'react'
import RoleBasedNavigation from '@/components/RoleBasedNavigation'
import SecurityTrainingModal from '@/components/security-obligations/SecurityTrainingModal'
import TrainingEnforcementBanner from '@/components/security-obligations/TrainingEnforcementBanner'
import PolicyViewerModal from '@/components/security-obligations/PolicyViewerModal'
import { REQUIRED_ATTESTATIONS, type AttestationType } from '@/lib/utils/attestation-status'

interface AttestationData {
  currentYear: string
  overallStatus: 'green' | 'yellow' | 'red'
  types: Record<
    AttestationType,
    {
      status: 'completed' | 'pending' | 'expiring' | 'expired'
      currentYearAttestedAt: string | null
      lastAttestedAt: string | null
    }
  >
  attestations: Array<{
    id: string
    attestationType: AttestationType
    version: string
    acknowledgedAt: string
    ipAddress: string | null
    userAgent: string | null
    createdAt: string
  }>
}

const ATTESTATION_LABELS: Record<AttestationType, { title: string; description: string; statement: string }> = {
  security_training: {
    title: 'Annual Security Awareness Training',
    description: 'Complete required security awareness training within the last 12 months.',
    statement: 'I have completed required security awareness training within the last 12 months.',
  },
  policy_acknowledgement: {
    title: 'Policy Review & Acknowledgement',
    description: 'Review and acknowledge the following policies:',
    statement: 'I have reviewed and agree to follow these policies.',
  },
  cui_handling: {
    title: 'CUI Handling Confirmation',
    description:
      'I understand that I must only access CUI required for my role, store and transmit CUI only in approved systems, and never copy CUI to personal devices or accounts.',
    statement:
      'I understand and agree to handle CUI only in approved systems and never copy it to personal devices or accounts.',
  },
  incident_reporting: {
    title: 'Incident Reporting Awareness',
    description:
      'I understand that I must immediately report suspected security incidents and must not attempt to self-remediate.',
    statement: 'I understand and agree to immediately report suspected security incidents and not self-remediate.',
  },
  acceptable_use: {
    title: 'Acceptable Use Confirmation',
    description:
      'I understand that I must not share credentials, install unauthorized software, or use systems for non-business purposes.',
    statement:
      'I understand and agree to not share credentials, install unauthorized software, or use systems for non-business purposes.',
  },
}

const POLICY_LIST = [
  { name: 'Acceptable Use Policy', path: 'acceptable-use-policy' },
  { name: 'CUI Handling Policy', path: 'cui-handling-policy' },
  { name: 'Incident Reporting Policy', path: 'incident-reporting-policy' },
]

export default function SecurityObligationsPage() {
  const [data, setData] = useState<AttestationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState<Record<AttestationType, boolean>>({
    security_training: false,
    policy_acknowledgement: false,
    cui_handling: false,
    incident_reporting: false,
    acceptable_use: false,
  })
  const [checked, setChecked] = useState<Record<AttestationType, boolean>>({
    security_training: false,
    policy_acknowledgement: false,
    cui_handling: false,
    incident_reporting: false,
    acceptable_use: false,
  })
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false)
  const [policyModal, setPolicyModal] = useState<{ name: string; path: string } | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/user/security-obligations')
      if (!response.ok) {
        throw new Error('Failed to fetch attestations')
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (type: AttestationType) => {
    if (!checked[type]) {
      return
    }

    setSubmitting((prev) => ({ ...prev, [type]: true }))

    try {
      const response = await fetch('/api/user/security-obligations/attest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attestationType: type }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit attestation')
      }

      // Reset checkbox and refresh data
      setChecked((prev) => ({ ...prev, [type]: false }))
      await fetchData()
      
      // Close training modal if it was open
      if (type === 'security_training') {
        setIsTrainingModalOpen(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting((prev) => ({ ...prev, [type]: false }))
    }
  }

  const getStatusBadgeColor = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300'
    }
  }

  const getStatusLabel = (status: 'green' | 'yellow' | 'red') => {
    switch (status) {
      case 'green':
        return 'All obligations met'
      case 'yellow':
        return 'Some obligations expiring soon'
      case 'red':
        return 'Action required'
    }
  }

  const getSectionStatusLabel = (status: 'completed' | 'pending' | 'expiring' | 'expired') => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'pending':
        return 'Due'
      case 'expiring':
        return 'Expiring soon'
      case 'expired':
        return 'Overdue'
    }
  }

  const getSectionStatusColor = (status: 'completed' | 'pending' | 'expiring' | 'expired') => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return 'Invalid date'
    }
  }

  const completedCount = data
    ? REQUIRED_ATTESTATIONS.filter((type) => data.types[type].status === 'completed').length
    : 0

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <RoleBasedNavigation />
        <div className="section-container bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <p className="text-body text-neutral-600">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-white min-h-screen">
        <RoleBasedNavigation />
        <div className="section-container bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="card p-8">
              <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
                <p className="text-body-sm text-red-800 font-semibold mb-2">Error</p>
                <p className="text-body-sm text-red-700">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 btn-secondary text-body-sm px-4 py-2"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <RoleBasedNavigation />

      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="heading-hero mb-2">Security Obligations</h1>
            <p className="text-body text-neutral-600">
              Complete and acknowledge your required security responsibilities
            </p>
          </div>

          {/* Compliance Status Badge */}
          {data && (
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-sm border ${getStatusBadgeColor(
                  data.overallStatus
                )}`}
              >
                <span className="text-body-sm font-semibold">{getStatusLabel(data.overallStatus)}</span>
              </div>
              <p className="text-body-xs text-neutral-600 mt-2">
                {completedCount} of {REQUIRED_ATTESTATIONS.length} obligations completed for {data.currentYear}
              </p>
            </div>
          )}

          {/* Training Enforcement Banner */}
          {data && (
            <TrainingEnforcementBanner
              trainingStatus={data.types.security_training.status}
              lastAttestedAt={data.types.security_training.lastAttestedAt}
              currentYear={data.currentYear}
              onStartTraining={() => setIsTrainingModalOpen(true)}
            />
          )}
        </div>
      </section>

      {/* Introduction */}
      <section className="section-container bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 lg:p-12 mb-8">
            <h2 className="heading-2 mb-4">Your Security Responsibilities</h2>
            <div className="space-y-4 text-body text-neutral-700">
              <p>
                As a user of this system, you have important security responsibilities. These obligations help
                protect sensitive information and maintain the security of our systems.
              </p>
              <p>
                Please review and complete each section below. You must acknowledge your understanding of
                each responsibility. Some obligations require annual renewal to remain current.
              </p>
              <p className="text-body-sm text-neutral-600">
                All acknowledgements are recorded with a timestamp and are retained for audit purposes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Sections */}
      <section className="section-container bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {REQUIRED_ATTESTATIONS.map((type, index) => {
              const label = ATTESTATION_LABELS[type]
              const typeData = data?.types[type]
              const isCompleted = typeData?.status === 'completed' || typeData?.status === 'expiring'
              const isDisabled = isCompleted || submitting[type]

              return (
                <div key={type} className="card p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-body-sm font-semibold text-neutral-500">
                          Section {String.fromCharCode(65 + index)}
                        </span>
                        {typeData && (
                          <span
                            className={`inline-block px-2 py-1 rounded text-body-xs font-medium ${getSectionStatusColor(
                              typeData.status
                            )}`}
                          >
                            {getSectionStatusLabel(typeData.status)}
                          </span>
                        )}
                      </div>
                      <h3 className="heading-3 mb-3">{label.title}</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-body text-neutral-700">{label.description}</p>

                    {type === 'policy_acknowledgement' && (
                      <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm">
                        <p className="text-body-sm font-semibold text-neutral-900 mb-2">Policies to review:</p>
                        <ul className="list-disc list-inside space-y-2 text-body-sm text-neutral-700">
                          {POLICY_LIST.map((policy) => (
                            <li key={policy.path}>
                              <button
                                onClick={() => setPolicyModal({ name: policy.name, path: policy.path })}
                                className="text-accent-700 hover:text-accent-800 hover:underline text-left"
                              >
                                {policy.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                        <p className="text-body-xs text-neutral-600 mt-3">
                          Click on a policy name to view the full policy document.
                        </p>
                      </div>
                    )}

                    {type === 'security_training' ? (
                      // Special handling for security training - use Start Training button
                      <div className="border-t border-neutral-200 pt-4">
                        <div className="mb-4">
                          <p className="text-body-sm text-neutral-700 mb-4">
                            Complete the interactive security awareness training to fulfill this requirement. The training covers security risks, policies, procedures, and your responsibilities.
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-body-xs text-neutral-500">
                            {typeData?.lastAttestedAt ? (
                              <span>Last completed: {formatDate(typeData.lastAttestedAt)}</span>
                            ) : (
                              <span>Not yet completed</span>
                            )}
                            {typeData?.currentYearAttestedAt && (
                              <span className="ml-3">
                                Current year ({data?.currentYear}): {formatDate(typeData.currentYearAttestedAt)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => setIsTrainingModalOpen(true)}
                            disabled={isDisabled}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-body-sm px-6 py-2"
                          >
                            {isCompleted ? 'View Training' : 'Start Training'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Standard checkbox flow for other attestations
                      <div className="border-t border-neutral-200 pt-4">
                        <div className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            id={`checkbox-${type}`}
                            checked={checked[type]}
                            onChange={(e) => setChecked((prev) => ({ ...prev, [type]: e.target.checked }))}
                            disabled={isDisabled}
                            className="mt-1 w-4 h-4 text-accent-600 border-neutral-300 rounded focus:ring-accent-500 disabled:opacity-50"
                          />
                          <label
                            htmlFor={`checkbox-${type}`}
                            className={`text-body-sm text-neutral-700 ${isDisabled ? 'opacity-60' : ''}`}
                          >
                            {label.statement}
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-body-xs text-neutral-500">
                            {typeData?.lastAttestedAt ? (
                              <span>Last completed: {formatDate(typeData.lastAttestedAt)}</span>
                            ) : (
                              <span>Not yet completed</span>
                            )}
                            {typeData?.currentYearAttestedAt && (
                              <span className="ml-3">
                                Current year ({data?.currentYear}): {formatDate(typeData.currentYearAttestedAt)}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handleSubmit(type)}
                            disabled={!checked[type] || isDisabled}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-body-sm px-6 py-2"
                          >
                            {submitting[type] ? (
                              <>
                                <span className="inline-block animate-spin mr-2">⏳</span>
                                Submitting...
                              </>
                            ) : isCompleted ? (
                              'Already Completed'
                            ) : (
                              'Submit Acknowledgement'
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Error Display */}
      {error && data && (
        <section className="section-container bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 p-4 rounded-sm">
              <p className="text-body-sm text-red-800 font-semibold mb-2">Error</p>
              <p className="text-body-sm text-red-700">{error}</p>
            </div>
          </div>
        </section>
      )}

      {/* Security Training Modal */}
      <SecurityTrainingModal
        isOpen={isTrainingModalOpen}
        onClose={() => setIsTrainingModalOpen(false)}
        onComplete={async () => {
          await fetchData()
        }}
      />

      {/* Policy Viewer Modal */}
      {policyModal && (
        <PolicyViewerModal
          isOpen={!!policyModal}
          onClose={() => setPolicyModal(null)}
          policyName={policyModal.name}
          policyPath={policyModal.path}
        />
      )}
    </div>
  )
}
