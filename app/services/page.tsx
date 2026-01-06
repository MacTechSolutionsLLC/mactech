import Link from 'next/link'

export default function ServicesPage() {
  return (
    <div className="bg-white">
      {/* Header - Editorial */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Our Services</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed">
            Procurement-ready service offerings designed for federal programs and defense contractors.
          </p>
        </div>
      </section>

      {/* Cybersecurity & RMF Services */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="h-px w-16 bg-accent-700 mb-6"></div>
            <h2 className="heading-2 mb-4">Cybersecurity & RMF Services</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed">
              Comprehensive Risk Management Framework implementation and authorization support 
              for DoD and federal information systems.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">RMF Step 1-6 implementation and documentation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Authorization to Operate (ATO) package development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Continuous Monitoring (ConMon) program design</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">STIG compliance assessment and remediation with automated playbook generation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Security Control Assessment (SCA) support</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Plan of Action & Milestones (POA&M) development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">System Security Plan (SSP) authoring</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
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
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">New system requiring initial authorization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">ATO renewal approaching</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Failed security assessment or audit</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Major system changes requiring re-authorization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration or infrastructure modernization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Compliance gaps identified</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for continuous monitoring program</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-8 lg:p-12 bg-neutral-50">
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
          </div>
        </div>
      </section>

      {/* Infrastructure & Platform Engineering */}
      <section className="section-container bg-neutral-50 border-y border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="h-px w-16 bg-accent-700 mb-6"></div>
            <h2 className="heading-2 mb-4">Infrastructure & Platform Engineering</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed">
              Infrastructure design and implementation with authorization requirements built in from the start.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Data center architecture and design</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Virtualization platform implementation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Storage and backup solutions</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Network architecture and security</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration planning and execution</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure as Code (IaC) development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Performance optimization and capacity planning</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
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
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">New system deployment</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure modernization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Cloud migration initiative</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Performance or capacity issues</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for better documentation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Infrastructure not aligned with security requirements</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Preparing for authorization</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-8 lg:p-12 bg-white border border-neutral-200">
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
          </div>
        </div>
      </section>

      {/* Quality & Compliance Consulting */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <div className="h-px w-16 bg-accent-700 mb-6"></div>
            <h2 className="heading-2 mb-4">Quality & Compliance Consulting</h2>
            <p className="text-body-lg text-neutral-700 max-w-3xl leading-relaxed">
              Proactive audit readiness and compliance programs for regulated environments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 mb-16">
            <div>
              <h3 className="heading-3 mb-6">What We Do</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">ISO 9001, 27001, and other standard implementation</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Laboratory accreditation support (ISO 17025)</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Audit readiness assessments</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Quality management system development</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Process documentation and standardization</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Internal audit programs</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Corrective action management</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
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
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Upcoming external audit or assessment</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Seeking ISO or other certifications</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Laboratory accreditation required</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Previous audit findings to address</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Need for quality management system</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Process inconsistencies identified</span>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-1.5 w-1.5 bg-accent-700 rounded-full"></div>
                  </div>
                  <span className="text-body text-neutral-700">Regulatory compliance requirements</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="card p-8 lg:p-12 bg-neutral-50">
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
          </div>
        </div>
      </section>

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
