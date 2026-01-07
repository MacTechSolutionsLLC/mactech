'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FormData {
  email: string
  name: string
  organization: string
  systemType: string
  authStatus: string
  auditHistory: string
  infraMaturity: string
  timelinePressure: string
  honeypot: string
}

export default function ReadinessPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    organization: '',
    systemType: '',
    authStatus: '',
    auditHistory: '',
    infraMaturity: '',
    timelinePressure: '',
    honeypot: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{
    score: string
    scoreValue: number
    gapsSummary: string[]
  } | null>(null)

  const totalSteps = 6

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleNext = () => {
    if (currentStep < totalSteps && canProceed()) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSubmit = async () => {
    if (formData.honeypot) return

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/readiness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit assessment')
      }

      setResult(data.result)
      setCurrentStep(totalSteps + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Submission error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.email.length > 0
      case 2: return formData.systemType.length > 0
      case 3: return formData.authStatus.length > 0
      case 4: return formData.auditHistory.length > 0
      case 5: return formData.infraMaturity.length > 0
      case 6: return formData.timelinePressure.length > 0
      default: return false
    }
  }

  const stepLabels = [
    'Contact Information',
    'System Context',
    'Authorization Status',
    'Audit History',
    'Infrastructure Maturity',
    'Timeline',
  ]

  return (
    <div className="bg-white min-h-screen">
      {/* Header - Editorial, calm */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="heading-hero mb-4">Readiness Assessment</h1>
            <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed">
              Understand your current authorization and compliance readiness. 
              This assessment helps us understand your program context.
            </p>
          </div>
        </div>
      </section>

      {/* Assessment Form - Premium, consulting-intake feel */}
      <section className="section-narrow bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="card p-0 overflow-hidden">
            {/* Progress indicator - minimal, elegant */}
            {currentStep <= totalSteps && (
              <div className="border-b border-neutral-200 bg-neutral-50 px-8 py-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-body-sm text-neutral-600 font-medium">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-body-sm text-neutral-500">
                    {stepLabels[currentStep - 1]}
                  </span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1">
                  <div
                    className="bg-accent-700 h-1 rounded-full transition-all duration-slow ease-smooth"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="p-8 lg:p-12">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">Contact Information</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    We&apos;ll send your assessment results to this address.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="email" className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Email Address <span className="text-neutral-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                        placeholder="your.email@organization.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="name" className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Name <span className="text-neutral-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="organization" className="block text-body-sm font-medium text-neutral-900 mb-2">
                        Organization <span className="text-neutral-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleChange('organization', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-sm text-body focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-gentle"
                        placeholder="Your organization"
                      />
                    </div>
                    <input
                      type="text"
                      name="honeypot"
                      value={formData.honeypot}
                      onChange={(e) => handleChange('honeypot', e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: System Type - Program context framing */}
              {currentStep === 2 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">System Context</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    What type of system are you working with?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'new-system', label: 'New System', desc: 'System currently in development or planning phase' },
                      { value: 'existing-system', label: 'Existing System', desc: 'System already in operation' },
                      { value: 'legacy-system', label: 'Legacy System', desc: 'Older system requiring modernization' },
                      { value: 'cloud-migration', label: 'Cloud Migration', desc: 'Migrating to cloud or hybrid environment' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-5 border-2 rounded-sm cursor-pointer transition-all duration-gentle ${
                          formData.systemType === option.value
                            ? 'border-accent-700 bg-accent-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="systemType"
                          value={option.value}
                          checked={formData.systemType === option.value}
                          onChange={(e) => handleChange('systemType', e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold text-neutral-900 mb-1">{option.label}</div>
                        <div className="text-body-sm text-neutral-600">{option.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Authorization Status */}
              {currentStep === 3 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">Authorization Status</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    What is your current authorization status?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'not-started', label: 'Not Started', desc: 'Authorization process has not begun' },
                      { value: 'in-progress', label: 'In Progress', desc: 'Currently working through RMF steps' },
                      { value: 'renewal', label: 'Renewal', desc: 'ATO renewal or re-authorization needed' },
                      { value: 'troubled', label: 'Troubled', desc: 'Experiencing challenges or delays' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-5 border-2 rounded-sm cursor-pointer transition-all duration-gentle ${
                          formData.authStatus === option.value
                            ? 'border-accent-700 bg-accent-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="authStatus"
                          value={option.value}
                          checked={formData.authStatus === option.value}
                          onChange={(e) => handleChange('authStatus', e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold text-neutral-900 mb-1">{option.label}</div>
                        <div className="text-body-sm text-neutral-600">{option.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Audit History */}
              {currentStep === 4 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">Audit History</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    What is your recent audit or assessment history?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'no-audits', label: 'No Audits', desc: 'No recent audits or assessments conducted' },
                      { value: 'passed-recently', label: 'Passed Recently', desc: 'Recent successful audit or assessment' },
                      { value: 'failed-recently', label: 'Failed Recently', desc: 'Recent audit with findings or failures' },
                      { value: 'mixed', label: 'Mixed Results', desc: 'Some passed, some with findings' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-5 border-2 rounded-sm cursor-pointer transition-all duration-gentle ${
                          formData.auditHistory === option.value
                            ? 'border-accent-700 bg-accent-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="auditHistory"
                          value={option.value}
                          checked={formData.auditHistory === option.value}
                          onChange={(e) => handleChange('auditHistory', e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold text-neutral-900 mb-1">{option.label}</div>
                        <div className="text-body-sm text-neutral-600">{option.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Infrastructure Maturity */}
              {currentStep === 5 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">Infrastructure Maturity</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    How would you describe your infrastructure maturity?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'ad-hoc', label: 'Ad-Hoc', desc: 'Informal processes, minimal documentation' },
                      { value: 'documented', label: 'Documented', desc: 'Processes documented but not standardized' },
                      { value: 'standardized', label: 'Standardized', desc: 'Consistent processes and procedures' },
                      { value: 'optimized', label: 'Optimized', desc: 'Mature, continuously improved processes' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-5 border-2 rounded-sm cursor-pointer transition-all duration-gentle ${
                          formData.infraMaturity === option.value
                            ? 'border-accent-700 bg-accent-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="infraMaturity"
                          value={option.value}
                          checked={formData.infraMaturity === option.value}
                          onChange={(e) => handleChange('infraMaturity', e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold text-neutral-900 mb-1">{option.label}</div>
                        <div className="text-body-sm text-neutral-600">{option.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 6: Timeline Pressure */}
              {currentStep === 6 && (
                <div className="fade-in">
                  <h2 className="heading-2 mb-2">Timeline</h2>
                  <p className="text-body text-neutral-600 mb-8">
                    What is your timeline for authorization or compliance?
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'no-rush', label: 'No Rush', desc: 'Plenty of time to plan and execute' },
                      { value: 'months', label: 'Months', desc: 'Several months to complete' },
                      { value: 'weeks', label: 'Weeks', desc: 'Weeks to complete — some urgency' },
                      { value: 'urgent', label: 'Urgent', desc: 'Immediate need or tight deadline' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`block p-5 border-2 rounded-sm cursor-pointer transition-all duration-gentle ${
                          formData.timelinePressure === option.value
                            ? 'border-accent-700 bg-accent-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="timelinePressure"
                          value={option.value}
                          checked={formData.timelinePressure === option.value}
                          onChange={(e) => handleChange('timelinePressure', e.target.value)}
                          className="sr-only"
                        />
                        <div className="font-semibold text-neutral-900 mb-1">{option.label}</div>
                        <div className="text-body-sm text-neutral-600">{option.desc}</div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Results - Premium presentation */}
              {currentStep > totalSteps && result && (
                <div className="fade-in">
                  <div className="mb-8">
                    <h2 className="heading-2 mb-2">Your Readiness Assessment</h2>
                    <p className="text-body text-neutral-600">
                      Based on your responses, here&apos;s your readiness profile.
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Score Display - Elegant */}
                    <div className="bg-neutral-50 border border-neutral-200 p-8 rounded-sm">
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-body-sm font-medium text-neutral-700 uppercase tracking-wide">
                          Readiness Score
                        </span>
                        <span className={`text-4xl font-semibold ${
                          result.score === 'high' ? 'text-green-700' :
                          result.score === 'medium' ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {result.scoreValue}
                          <span className="text-2xl text-neutral-500 font-normal">/100</span>
                        </span>
                      </div>
                      <div className="w-full bg-neutral-200 rounded-full h-2 mb-3">
                        <div
                          className={`h-2 rounded-full transition-all duration-slow ${
                            result.score === 'high' ? 'bg-green-600' :
                            result.score === 'medium' ? 'bg-yellow-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${result.scoreValue}%` }}
                        />
                      </div>
                      <p className={`text-body-sm font-medium ${
                        result.score === 'high' ? 'text-green-700' :
                        result.score === 'medium' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {result.score === 'high' ? 'High Readiness' :
                         result.score === 'medium' ? 'Medium Readiness' :
                         'Low Readiness'}
                      </p>
                    </div>

                    {/* Gaps Summary - Editorial */}
                    <div>
                      <h3 className="heading-3 mb-4">Identified Gaps & Recommendations</h3>
                      <p className="text-body-sm text-neutral-600 mb-4">
                        These recommendations address both technical readiness and contractual risk considerations.
                      </p>
                      <div className="space-y-4">
                        {result.gapsSummary.map((gap, index) => (
                          <div key={index} className="flex gap-4 pb-4 border-b border-neutral-200 last:border-0">
                            <div className="flex-shrink-0 mt-1">
                              <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                            </div>
                            <p className="text-body text-neutral-700 leading-relaxed">{gap}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Steps - Calm, confident */}
                    <div className="bg-accent-50 border border-accent-200 p-8 rounded-sm">
                      <h3 className="heading-3 mb-3">Next Steps</h3>
                      <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                        We&apos;ve sent your assessment results to your email. A MacTech Solutions team member 
                        will reach out to discuss how we can help address these gaps and improve your readiness.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Link href="/contact" className="btn-primary">
                          Contact Us
                        </Link>
                        <Link href="/services" className="btn-secondary">
                          View Services
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons - Premium, minimal */}
              {currentStep <= totalSteps && (
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-neutral-200">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    className="btn-ghost disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ← Back
                  </button>
                  {currentStep < totalSteps ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!canProceed() || isSubmitting}
                      className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Complete Assessment'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
