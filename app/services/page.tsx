"use client"

import Link from 'next/link'
import { useState } from 'react'

type Pillar = 'Security' | 'Infrastructure' | 'Quality' | 'Governance'

const pillarInfo = {
  'Security': {
    name: 'Security',
    leader: 'Patrick Caruso',
    description: 'Cybersecurity & RMF expertise',
    color: 'bg-red-50 border-red-200 text-red-900',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    accentColor: 'bg-red-700'
  },
  'Infrastructure': {
    name: 'Infrastructure',
    leader: 'James Adams',
    description: 'Data center, storage, networking, deployment',
    color: 'bg-blue-50 border-blue-200 text-blue-900',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    accentColor: 'bg-blue-700'
  },
  'Quality': {
    name: 'Quality',
    leader: 'Brian MacDonald',
    description: 'ISO compliance, metrology, audit readiness',
    color: 'bg-green-50 border-green-200 text-green-900',
    badgeColor: 'bg-green-100 text-green-800 border-green-300',
    accentColor: 'bg-green-700'
  },
  'Governance': {
    name: 'Governance',
    leader: 'John Milso',
    description: 'Legal, contracts, risk analysis, corporate governance',
    color: 'bg-purple-50 border-purple-200 text-purple-900',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    accentColor: 'bg-purple-700'
  }
}

export default function ServicesPage() {
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null)

  return (
    <div className="bg-white">
      {/* Header - Editorial */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Our Services</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
            Procurement-ready service offerings designed for federal programs and defense contractors.
          </p>
          <div className="card p-6 bg-accent-50 border border-accent-200">
            <p className="text-body text-neutral-700 mb-4">
              <strong className="font-semibold text-neutral-900">Automation-Enhanced Delivery:</strong> Many of our services are supported by proprietary automation tools that accelerate delivery, reduce manual effort, and ensure consistency. 
            </p>
            <Link href="/showcase" className="text-body-sm text-accent-700 font-medium hover:text-accent-800 transition-colors duration-gentle inline-flex items-center gap-1">
              View our tools and capabilities
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pillar Introduction */}
      <section className="section-container bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="heading-2 mb-4">Organized by Our Four Pillars of Expertise</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed mb-8">
              Our services are organized into four pillars, each led by a senior practitioner with deep expertise in that domain. 
              This structure ensures that every service offering is backed by proven leadership and specialized knowledge.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <button
                onClick={() => setSelectedPillar(selectedPillar === 'Security' ? null : 'Security')}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left hover:shadow-md ${
                  selectedPillar === 'Security' 
                    ? `${pillarInfo.Security.color} border-red-400 shadow-lg ring-2 ring-red-300` 
                    : `${pillarInfo.Security.color} hover:border-red-300`
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-body-xs font-semibold mb-2 ${pillarInfo.Security.badgeColor}`}>
                  {pillarInfo.Security.name} Pillar
                </div>
                <h3 className="text-body-sm font-semibold mb-1">Cybersecurity & RMF Services</h3>
                <p className="text-body-xs text-neutral-700 mb-2">{pillarInfo.Security.description}</p>
              </button>
              <button
                onClick={() => setSelectedPillar(selectedPillar === 'Infrastructure' ? null : 'Infrastructure')}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left hover:shadow-md ${
                  selectedPillar === 'Infrastructure' 
                    ? `${pillarInfo.Infrastructure.color} border-blue-400 shadow-lg ring-2 ring-blue-300` 
                    : `${pillarInfo.Infrastructure.color} hover:border-blue-300`
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-body-xs font-semibold mb-2 ${pillarInfo.Infrastructure.badgeColor}`}>
                  {pillarInfo.Infrastructure.name} Pillar
                </div>
                <h3 className="text-body-sm font-semibold mb-1">Infrastructure & Platform Engineering</h3>
                <p className="text-body-xs text-neutral-700 mb-2">{pillarInfo.Infrastructure.description}</p>
              </button>
              <button
                onClick={() => setSelectedPillar(selectedPillar === 'Quality' ? null : 'Quality')}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left hover:shadow-md ${
                  selectedPillar === 'Quality' 
                    ? `${pillarInfo.Quality.color} border-green-400 shadow-lg ring-2 ring-green-300` 
                    : `${pillarInfo.Quality.color} hover:border-green-300`
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-body-xs font-semibold mb-2 ${pillarInfo.Quality.badgeColor}`}>
                  {pillarInfo.Quality.name} Pillar
                </div>
                <h3 className="text-body-sm font-semibold mb-1">Quality & Compliance Consulting</h3>
                <p className="text-body-xs text-neutral-700 mb-2">{pillarInfo.Quality.description}</p>
              </button>
              <button
                onClick={() => setSelectedPillar(selectedPillar === 'Governance' ? null : 'Governance')}
                className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left hover:shadow-md ${
                  selectedPillar === 'Governance' 
                    ? `${pillarInfo.Governance.color} border-purple-400 shadow-lg ring-2 ring-purple-300` 
                    : `${pillarInfo.Governance.color} hover:border-purple-300`
                }`}
              >
                <div className={`inline-block px-3 py-1 rounded-full text-body-xs font-semibold mb-2 ${pillarInfo.Governance.badgeColor}`}>
                  {pillarInfo.Governance.name} Pillar
                </div>
                <h3 className="text-body-sm font-semibold mb-1">Contracts & Risk Alignment</h3>
                <p className="text-body-xs text-neutral-700 mb-2">{pillarInfo.Governance.description}</p>
              </button>
            </div>
            <div className="text-center">
              <Link href="/leadership" className="text-body-sm text-accent-700 font-medium hover:text-accent-800 transition-colors duration-gentle inline-flex items-center gap-1">
                Learn more about our leadership
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Cybersecurity & RMF Services */}
      {(selectedPillar === null || selectedPillar === 'Security') && (
      <section className={`section-container ${pillarInfo.Security.color} border-b border-red-200`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-px w-16 ${pillarInfo.Security.accentColor}`}></div>
              <div className={`px-3 py-1 rounded-full text-body-xs font-semibold ${pillarInfo.Security.badgeColor}`}>
                {pillarInfo.Security.name}
              </div>
            </div>
            <h2 className="heading-2 mb-4">Cybersecurity & RMF Services</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed mb-2">
              Comprehensive Risk Management Framework implementation and authorization support 
              for DoD and federal information systems.
            </p>
            <p className="text-body-sm text-neutral-600 italic">
              Led by {pillarInfo.Security.leader} • {pillarInfo.Security.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">RMF Step 1-6 implementation and documentation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Authorization to Operate (ATO) package development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Continuous Monitoring (ConMon) program design</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">STIG compliance assessment and remediation with automated playbook generation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Security Control Assessment (SCA) support</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Plan of Action & Milestones (POA&M) development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">System Security Plan (SSP) authoring</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Risk Assessment Report (RAR) development</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-6">When You Need It</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">New system requiring initial authorization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">ATO renewal approaching</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Failed security assessment or audit</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Major system changes requiring re-authorization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration or infrastructure modernization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Compliance gaps identified</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Security.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for continuous monitoring program</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`card p-8 lg:p-12 bg-white border border-red-200`}>
            <h3 className="heading-3 mb-8">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Artifacts</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Complete System Security Plan (SSP)</li>
                  <li className="text-body text-neutral-700">Risk Assessment Report (RAR)</li>
                  <li className="text-body text-neutral-700">Security Control Assessment (SCA) documentation</li>
                  <li className="text-body text-neutral-700">POA&M with remediation plans</li>
                  <li className="text-body text-neutral-700">Continuous Monitoring Strategy</li>
                  <li className="text-body text-neutral-700">STIG compliance reports</li>
                  <li className="text-body text-neutral-700">Automated Ansible hardening and checker playbooks</li>
                  <li className="text-body text-neutral-700">Certification Test Procedure (CTP) documents</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Outcomes</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Authorization to Operate (ATO)</li>
                  <li className="text-body text-neutral-700">Clear understanding of security posture</li>
                  <li className="text-body text-neutral-700">Actionable remediation roadmap</li>
                  <li className="text-body text-neutral-700">Ongoing monitoring capability</li>
                  <li className="text-body text-neutral-700">Compliance with DoD requirements</li>
                  <li className="text-body text-neutral-700">Reduced risk of security findings</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Supporting Tools & Capabilities</h4>
              <p className="text-body-sm text-neutral-700 mb-4">
                Our RMF and cybersecurity services are enhanced by automation tools including:
              </p>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>STIG Generator for automated playbook generation</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>RMF Artifact Generator for documentation automation</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Control Implementation Validator for SCA preparation</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>ATO Readiness Dashboard for progress tracking</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Continuous Monitoring Automation Platform</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>SCA Preparation Toolkit</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/showcase" className="text-body-sm text-red-700 font-medium hover:text-red-800 transition-colors duration-gentle inline-flex items-center gap-1">
                  Explore all tools and capabilities
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Infrastructure & Platform Engineering */}
      {(selectedPillar === null || selectedPillar === 'Infrastructure') && (
      <section className={`section-container ${pillarInfo.Infrastructure.color} border-y border-blue-200`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-px w-16 ${pillarInfo.Infrastructure.accentColor}`}></div>
              <div className={`px-3 py-1 rounded-full text-body-xs font-semibold ${pillarInfo.Infrastructure.badgeColor}`}>
                {pillarInfo.Infrastructure.name}
              </div>
            </div>
            <h2 className="heading-2 mb-4">Infrastructure & Platform Engineering</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed mb-2">
              Infrastructure design and implementation with authorization requirements built in from the start.
            </p>
            <p className="text-body-sm text-neutral-600 italic">
              Led by {pillarInfo.Infrastructure.leader} • {pillarInfo.Infrastructure.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Data center architecture and design</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Virtualization platform implementation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Storage and backup solutions</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Network architecture and security</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration planning and execution</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure as Code (IaC) development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Performance optimization and capacity planning</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Disaster recovery and business continuity</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-6">When You Need It</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">New system deployment</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure modernization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration initiative</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Performance or capacity issues</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for better documentation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure not aligned with security requirements</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Infrastructure.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Preparing for authorization</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`card p-8 lg:p-12 bg-white border border-blue-200`}>
            <h3 className="heading-3 mb-8">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Artifacts</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Architecture diagrams and documentation</li>
                  <li className="text-body text-neutral-700">Infrastructure design documents</li>
                  <li className="text-body text-neutral-700">Configuration management documentation</li>
                  <li className="text-body text-neutral-700">Network diagrams and security zones</li>
                  <li className="text-body text-neutral-700">Disaster recovery plans</li>
                  <li className="text-body text-neutral-700">Implementation guides and runbooks</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Outcomes</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Infrastructure ready for authorization</li>
                  <li className="text-body text-neutral-700">Improved performance and reliability</li>
                  <li className="text-body text-neutral-700">Scalable and maintainable architecture</li>
                  <li className="text-body text-neutral-700">Clear documentation for audits</li>
                  <li className="text-body text-neutral-700">Reduced operational risk</li>
                  <li className="text-body text-neutral-700">Cost-optimized infrastructure</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Supporting Tools & Capabilities</h4>
              <p className="text-body-sm text-neutral-700 mb-4">
                Our infrastructure services leverage automation tools including:
              </p>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Infrastructure Compliance Scanner for pre-deployment validation</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Compliant Infrastructure Templates for rapid deployment</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Network Security Configuration Generator</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/showcase" className="text-body-sm text-blue-700 font-medium hover:text-blue-800 transition-colors duration-gentle inline-flex items-center gap-1">
                  Explore all tools and capabilities
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Quality & Compliance Consulting */}
      {(selectedPillar === null || selectedPillar === 'Quality') && (
      <section className={`section-container ${pillarInfo.Quality.color} border-b border-green-200`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-px w-16 ${pillarInfo.Quality.accentColor}`}></div>
              <div className={`px-3 py-1 rounded-full text-body-xs font-semibold ${pillarInfo.Quality.badgeColor}`}>
                {pillarInfo.Quality.name}
              </div>
            </div>
            <h2 className="heading-2 mb-4">Quality & Compliance Consulting</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed mb-2">
              Proactive audit readiness and compliance programs for regulated environments.
            </p>
            <p className="text-body-sm text-neutral-600 italic">
              Led by {pillarInfo.Quality.leader} • {pillarInfo.Quality.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">ISO 9001, 27001, and other standard implementation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Laboratory accreditation support (ISO 17025)</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Audit readiness assessments</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Quality management system development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Process documentation and standardization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Internal audit programs</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Corrective action management</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Compliance gap analysis</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-6">When You Need It</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Upcoming external audit or assessment</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Seeking ISO or other certifications</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Laboratory accreditation required</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Previous audit findings to address</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for quality management system</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Process inconsistencies identified</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Quality.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Regulatory compliance requirements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`card p-8 lg:p-12 bg-white border border-green-200`}>
            <h3 className="heading-3 mb-8">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Artifacts</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Quality management system documentation</li>
                  <li className="text-body text-neutral-700">Process procedures and work instructions</li>
                  <li className="text-body text-neutral-700">Audit readiness checklists</li>
                  <li className="text-body text-neutral-700">Gap analysis reports</li>
                  <li className="text-body text-neutral-700">Corrective action plans</li>
                  <li className="text-body text-neutral-700">Compliance evidence packages</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Outcomes</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Successful audit or assessment</li>
                  <li className="text-body text-neutral-700">ISO or accreditation certification</li>
                  <li className="text-body text-neutral-700">Improved process consistency</li>
                  <li className="text-body text-neutral-700">Reduced audit findings</li>
                  <li className="text-body text-neutral-700">Proactive compliance posture</li>
                  <li className="text-body text-neutral-700">Confidence in audit readiness</li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-neutral-200">
              <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Supporting Tools & Capabilities</h4>
              <p className="text-body-sm text-neutral-700 mb-4">
                Our quality and compliance services are enhanced by automation tools including:
              </p>
              <ul className="grid md:grid-cols-2 gap-3">
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Process Documentation Generator for ISO-compliant documentation</span>
                </li>
                <li className="text-body-sm text-neutral-700 flex items-start gap-2">
                  <svg className="w-4 h-4 text-green-700 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Audit Evidence Collector for automated evidence organization</span>
                </li>
              </ul>
              <div className="mt-6">
                <Link href="/showcase" className="text-body-sm text-green-700 font-medium hover:text-green-800 transition-colors duration-gentle inline-flex items-center gap-1">
                  Explore all tools and capabilities
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Contracts & Risk Alignment */}
      {(selectedPillar === null || selectedPillar === 'Governance') && (
      <section className={`section-container ${pillarInfo.Governance.color} border-y border-purple-200`}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="flex items-center gap-4 mb-4">
              <div className={`h-px w-16 ${pillarInfo.Governance.accentColor}`}></div>
              <div className={`px-3 py-1 rounded-full text-body-xs font-semibold ${pillarInfo.Governance.badgeColor}`}>
                {pillarInfo.Governance.name}
              </div>
            </div>
            <h2 className="heading-2 mb-4">Contracts & Risk Alignment</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed mb-2">
              Reducing downstream legal and contractual risk through better upfront alignment. 
              We integrate technical execution with contract and risk awareness — reducing surprises 
              during audits, authorizations, and disputes.
            </p>
            <p className="text-body-sm text-neutral-600 italic">
              Led by {pillarInfo.Governance.leader} • {pillarInfo.Governance.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Contractual readiness for cyber and compliance obligations</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Risk identification in scopes of work and delivery models</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Vendor and subcontractor agreement alignment</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Governance and signature authority clarity</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Risk-aware delivery planning for regulated programs</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Contract review and alignment with technical deliverables</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="heading-3 mb-6">When You Need It</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Drafting or negotiating contracts for cyber/compliance services</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Managing vendor and subcontractor relationships</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Preparing for program reviews or disputes</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for risk-aware project planning</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Ensuring contract terms align with technical capabilities</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className={`h-1.5 w-1.5 ${pillarInfo.Governance.accentColor} rounded-full`}></div>
                  </div>
                  <span className="text-body text-neutral-700">Complex program structures requiring governance clarity</span>
                </li>
              </ul>
            </div>
          </div>

          <div className={`card p-8 lg:p-12 bg-white border border-purple-200`}>
            <h3 className="heading-3 mb-8">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Artifacts</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Contract alignment assessments</li>
                  <li className="text-body text-neutral-700">Risk identification and mitigation plans</li>
                  <li className="text-body text-neutral-700">Vendor agreement review and recommendations</li>
                  <li className="text-body text-neutral-700">Governance structure documentation</li>
                  <li className="text-body text-neutral-700">Delivery model risk analysis</li>
                  <li className="text-body text-neutral-700">Contractual obligation mapping</li>
                </ul>
              </div>
              <div>
                <h4 className="text-body-sm font-semibold text-neutral-900 mb-4 uppercase tracking-wide">Outcomes</h4>
                <ul className="space-y-3">
                  <li className="text-body text-neutral-700">Reduced contractual and legal risk</li>
                  <li className="text-body text-neutral-700">Clear alignment between contracts and deliverables</li>
                  <li className="text-body text-neutral-700">Better vendor and subcontractor management</li>
                  <li className="text-body text-neutral-700">Reduced surprises during audits and authorizations</li>
                  <li className="text-body text-neutral-700">Improved governance and decision-making clarity</li>
                  <li className="text-body text-neutral-700">Risk-aware program execution</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {/* CTA - Restrained */}
      <section className="section-container bg-accent-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 mb-6 text-white">
            Ready to Discuss Your Requirements?
          </h2>
          <p className="text-body-lg mb-10 text-accent-100 max-w-2xl mx-auto leading-relaxed">
            Contact us to discuss how we can support your program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary bg-white text-accent-900 hover:bg-accent-50">
              Contact Us
            </Link>
            <Link href="/readiness" className="btn-secondary border-white text-white hover:bg-white hover:text-accent-900">
              Take Readiness Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
