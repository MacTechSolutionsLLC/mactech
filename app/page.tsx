'use client'

import Link from 'next/link'
import { useState } from 'react'
import Chatbot from '@/components/Chatbot'

export default function HomePage() {
  const [chatbotOpen, setChatbotOpen] = useState(false)

  return (
    <>
      {/* Hero Section - Editorial, confident, restrained */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Main content - asymmetric layout */}
            <div className="lg:col-span-7 fade-in">
              <h1 className="heading-hero mb-6 text-neutral-900">
                Cyber, Infrastructure, and Compliance — Built for Mission‑Critical Programs
              </h1>
              <p className="text-body-lg text-neutral-700 mb-10 max-w-2xl leading-relaxed">
                MacTech Solutions helps federal programs and defense contractors achieve authorization, 
                audit readiness, and operational confidence through integrated technical and risk-aware delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/readiness" className="btn-primary inline-flex items-center justify-center">
                  Understand Your Readiness
                </Link>
                <button 
                  onClick={() => setChatbotOpen(true)}
                  className="btn-secondary inline-flex items-center justify-center"
                >
                  Talk to MacTech
                </button>
              </div>
            </div>
            
            {/* Spacer for asymmetric feel */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="h-px bg-neutral-200"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Editorial framing */}
      <section className="section-container bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="heading-2 mb-4">Common Challenges We Solve</h2>
            <p className="text-body text-neutral-600 max-w-2xl mx-auto">
              Programs face predictable obstacles. We address them systematically.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="fade-in">
              <div className="h-px w-12 bg-accent-700 mb-6"></div>
              <h3 className="heading-3 mb-3">Approaching ATO with Uncertainty</h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Many programs begin the authorization process without clear understanding of requirements, 
                leading to delays, rework, and missed deadlines.
              </p>
            </div>
            
            <div className="fade-in-delay-1">
              <div className="h-px w-12 bg-accent-700 mb-6"></div>
              <h3 className="heading-3 mb-3">Cyber and Compliance Siloed</h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Security teams and infrastructure teams operate independently, creating gaps in documentation 
                and control implementation.
              </p>
            </div>
            
            <div className="fade-in-delay-2">
              <div className="h-px w-12 bg-accent-700 mb-6"></div>
              <h3 className="heading-3 mb-3">Audit Prep Driven by Panic</h3>
              <p className="text-body text-neutral-700 leading-relaxed">
                Last-minute audit preparation results in incomplete evidence, documentation gaps, 
                and increased risk of findings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Three pillars, clean separation */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center">
            <h2 className="heading-2 mb-4">What We Do</h2>
            <p className="text-body text-neutral-600 max-w-2xl mx-auto">
              Integrated capabilities across cybersecurity, infrastructure, compliance, and risk management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {/* Cybersecurity & RMF */}
            <div className="fade-in">
              <div className="mb-6">
                <div className="h-12 w-12 bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016-2.664.381-5.384 1.253-7.787 2.386z" />
                  </svg>
                </div>
              </div>
              <h3 className="heading-3 mb-4">Cybersecurity & RMF</h3>
              <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                Risk Management Framework (RMF) implementation, Authorization to Operate (ATO) support, 
                Continuous Monitoring (ConMon), and STIG compliance.
              </p>
              <Link 
                href="/services" 
                className="text-body-sm text-accent-700 font-medium hover:text-accent-800 transition-colors duration-gentle inline-flex items-center gap-1"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Infrastructure & Systems Engineering */}
            <div className="fade-in-delay-1">
              <div className="mb-6">
                <div className="h-12 w-12 bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-16.5 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5A2.25 2.25 0 006.75 19.5z" />
                  </svg>
                </div>
              </div>
              <h3 className="heading-3 mb-4">Infrastructure & Systems Engineering</h3>
              <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                Data center design, virtualization, storage solutions, and infrastructure built with 
                authorization requirements in mind from day one.
              </p>
              <Link 
                href="/services" 
                className="text-body-sm text-accent-700 font-medium hover:text-accent-800 transition-colors duration-gentle inline-flex items-center gap-1"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Quality & Audit Readiness */}
            <div className="fade-in-delay-2">
              <div className="mb-6">
                <div className="h-12 w-12 bg-accent-50 border border-accent-200 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="heading-3 mb-4">Quality & Audit Readiness</h3>
              <p className="text-body text-neutral-700 mb-6 leading-relaxed">
                ISO compliance, laboratory accreditation, regulated environment preparation, and 
                proactive audit readiness programs.
              </p>
              <Link 
                href="/services" 
                className="text-body-sm text-accent-700 font-medium hover:text-accent-800 transition-colors duration-gentle inline-flex items-center gap-1"
              >
                Learn more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* STIG Generator Capability - Teaser Feature */}
      <section className="section-container bg-white border-y border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="fade-in">
              <div className="h-px w-16 bg-accent-700 mb-6"></div>
              <h2 className="heading-2 mb-4">Automated STIG Compliance</h2>
              <p className="text-body-lg text-neutral-700 mb-6 leading-relaxed">
                Our STIG Generator transforms DISA Security Technical Implementation Guides into 
                production-ready automation artifacts—reducing manual effort and accelerating compliance.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="heading-3 mb-1">Ansible Hardening Playbooks</h3>
                    <p className="text-body text-neutral-700">
                      Automatically generate idempotent playbooks that apply STIG controls programmatically.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="heading-3 mb-1">Compliance Checker Playbooks</h3>
                    <p className="text-body text-neutral-700">
                      Validate STIG compliance with automated checker playbooks for continuous monitoring.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-5 h-5 text-accent-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="heading-3 mb-1">CTP Documentation</h3>
                    <p className="text-body text-neutral-700">
                      Generate Certification Test Procedure documents in standardized formats for manual controls.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/showcase" className="btn-primary inline-flex items-center justify-center">
                  View All Tools & Capabilities
                </Link>
                <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">
                  Discuss Your Requirements
                </Link>
              </div>
            </div>

            {/* Visual/Code Preview */}
            <div className="fade-in-delay-1">
              <div className="card p-6 lg:p-8 bg-neutral-50 border-neutral-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <span className="text-body-sm text-neutral-500 ml-2">STIG Generator</span>
                </div>
                <div className="space-y-3 font-mono text-sm text-neutral-700">
                  <div className="flex gap-2">
                    <span className="text-neutral-400">$</span>
                    <span>python -m app.main --stig-file RHEL_9_STIG.xml</span>
                  </div>
                  <div className="text-neutral-500 pl-4">→ Generating artifacts...</div>
                  <div className="flex gap-2 pl-4">
                    <span className="text-green-600">✓</span>
                    <span>stig_rhel9_hardening.yml</span>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <span className="text-green-600">✓</span>
                    <span>stig_rhel9_checker.yml</span>
                  </div>
                  <div className="flex gap-2 pl-4">
                    <span className="text-green-600">✓</span>
                    <span>stig_rhel9_ctp.csv</span>
                  </div>
                  <div className="text-neutral-500 pl-4 mt-4">Production-ready automation artifacts</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-accent-700 mb-1">RHEL 8/9</div>
                  <div className="text-body-sm text-neutral-600">Linux STIGs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-accent-700 mb-1">Windows</div>
                  <div className="text-body-sm text-neutral-600">Windows STIGs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-accent-700 mb-1">Cisco</div>
                  <div className="text-body-sm text-neutral-600">Network STIGs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why MacTech - Editorial list, confident */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16">
            <h2 className="heading-2 mb-4 text-center">Why MacTech</h2>
            <p className="text-body text-neutral-600 text-center max-w-2xl mx-auto">
              Differentiators that matter to program offices and primes.
            </p>
          </div>
          
          <div className="space-y-10">
            <div className="flex gap-6 fade-in">
              <div className="flex-shrink-0">
                <div className="h-1 w-12 bg-accent-700 mt-3"></div>
              </div>
              <div>
                <h3 className="heading-3 mb-2">Veteran-Owned</h3>
                <p className="text-body text-neutral-700 leading-relaxed">
                  SDVOSB (pending) status. We understand mission-critical operations and the unique 
                  requirements of federal contracting.
                </p>
              </div>
            </div>

            <div className="flex gap-6 fade-in-delay-1">
              <div className="flex-shrink-0">
                <div className="h-1 w-12 bg-accent-700 mt-3"></div>
              </div>
              <div>
                <h3 className="heading-3 mb-2">Senior Practitioners Only</h3>
                <p className="text-body text-neutral-700 leading-relaxed">
                  Our team brings decades of combined experience. No junior consultants learning on your project.
                </p>
              </div>
            </div>

            <div className="flex gap-6 fade-in-delay-2">
              <div className="flex-shrink-0">
                <div className="h-1 w-12 bg-accent-700 mt-3"></div>
              </div>
              <div>
                <h3 className="heading-3 mb-2">Named Key Personnel Available</h3>
                <p className="text-body text-neutral-700 leading-relaxed">
                  Our directors are available for proposals and can be named as key personnel. 
                  Proven track records in DoD and federal programs.
                </p>
              </div>
            </div>

            <div className="flex gap-6 fade-in-delay-3">
              <div className="flex-shrink-0">
                <div className="h-1 w-12 bg-accent-700 mt-3"></div>
              </div>
              <div>
                <h3 className="heading-3 mb-2">Integrated Approach</h3>
                <p className="text-body text-neutral-700 leading-relaxed">
                  We bridge the gap between cybersecurity, infrastructure, and compliance. 
                  No silos. No handoffs. Just results.
                </p>
              </div>
            </div>

            <div className="flex gap-6 fade-in-delay-3">
              <div className="flex-shrink-0">
                <div className="h-1 w-12 bg-accent-700 mt-3"></div>
              </div>
              <div>
                <h3 className="heading-3 mb-2">Risk-Aware Execution</h3>
                <p className="text-body text-neutral-700 leading-relaxed">
                  We integrate technical execution with contract and risk awareness — reducing surprises 
                  during audits, authorizations, and disputes. Our in-house legal expertise ensures 
                  contracts align with deliverables from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Restrained, confident */}
      <section className="section-container bg-accent-900 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 mb-6 text-white">
            Ready to Achieve Authorization and Audit Readiness?
          </h2>
          <p className="text-body-lg mb-10 text-accent-100 max-w-2xl mx-auto leading-relaxed">
            Start with our readiness assessment to understand where you stand.
          </p>
          <Link 
            href="/readiness" 
            className="btn-primary bg-white text-accent-900 hover:bg-accent-50 inline-flex items-center justify-center"
          >
            Take the Assessment
          </Link>
        </div>
      </section>

      {/* Chatbot Component */}
      <Chatbot isOpen={chatbotOpen} onClose={() => setChatbotOpen(false)} />
    </>
  )
}
