'use client'

import { useEffect } from 'react'

export default function CapabilitiesPage() {
  useEffect(() => {
    // Add print-specific class to body when component mounts
    document.body.classList.add('print-page')
    return () => {
      document.body.classList.remove('print-page')
    }
  }, [])

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="no-print bg-white border-b border-neutral-200 py-4">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={handlePrint}
            className="btn-primary"
          >
            Download PDF / Print
          </button>
        </div>
      </div>

      {/* Capabilities Statement Content */}
      <div className="capabilities-statement bg-white">
        {/* Company Header */}
        <div className="max-w-4xl mx-auto px-6 py-8 print:py-6">
          <div className="text-center mb-8 print:mb-6">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2 print:text-2xl">
              MacTech Solutions LLC
            </h1>
            <p className="text-lg text-neutral-700 font-semibold mb-4 print:text-base">
              Service-Disabled Veteran-Owned Small Business (SDVOSB)
            </p>
            <div className="h-px w-24 bg-accent-700 mx-auto"></div>
          </div>

          {/* Company Overview */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Company Overview
            </h2>
            <p className="text-body text-neutral-700 leading-relaxed mb-4 print:text-sm">
              MacTech Solutions LLC is a veteran-owned small business specializing in cybersecurity, 
              infrastructure engineering, quality assurance, and compliance services for federal programs 
              and defense contractors. Our team brings deep expertise in Risk Management Framework (RMF) 
              implementation, authorization processes, ISO compliance, and audit readiness—all critical 
              capabilities for DoD and federal information systems.
            </p>
            <p className="text-body text-neutral-700 leading-relaxed print:text-sm">
              Our services are organized into four pillars of expertise—Security, Infrastructure, Quality, 
              and Governance—each led by senior practitioners with proven track records in federal programs. 
              This structure ensures that every service offering is backed by specialized knowledge and 
              hands-on experience.
            </p>
          </section>

          {/* Core Capabilities */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Core Capabilities
            </h2>
            
            <div className="space-y-6 print:space-y-4">
              {/* Security Pillar */}
              <div className="border-l-4 border-red-700 pl-4 print:pl-3">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 print:text-base">
                  Security Pillar
                </h3>
                <p className="text-body-sm text-neutral-600 mb-3 print:text-xs italic">
                  Led by Patrick Caruso • Cybersecurity & RMF expertise
                </p>
                <ul className="space-y-2 print:space-y-1">
                  <li className="text-body text-neutral-700 print:text-sm">• Risk Management Framework (RMF) implementation and management</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Authorization to Operate (ATO) package development</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Continuous Monitoring (ConMon) program design</li>
                  <li className="text-body text-neutral-700 print:text-sm">• STIG compliance assessment and remediation</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Security Control Assessment (SCA)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Cybersecurity architecture and documentation</li>
                  <li className="text-body text-neutral-700 print:text-sm">• DoD cybersecurity policy and requirements</li>
                </ul>
              </div>

              {/* Infrastructure Pillar */}
              <div className="border-l-4 border-blue-700 pl-4 print:pl-3">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 print:text-base">
                  Infrastructure Pillar
                </h3>
                <p className="text-body-sm text-neutral-600 mb-3 print:text-xs italic">
                  Led by James Adams • Data center, storage, networking, deployment
                </p>
                <ul className="space-y-2 print:space-y-1">
                  <li className="text-body text-neutral-700 print:text-sm">• Data center architecture and design</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Infrastructure deployment and operations</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Storage systems (Dell/EMC, VxRail, Unity, XtremIO)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Virtualization and cloud platforms (VMWare)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Network configuration and security</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Infrastructure as Code (IaC)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Performance optimization and capacity planning</li>
                </ul>
              </div>

              {/* Quality Pillar */}
              <div className="border-l-4 border-green-700 pl-4 print:pl-3">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 print:text-base">
                  Quality Pillar
                </h3>
                <p className="text-body-sm text-neutral-600 mb-3 print:text-xs italic">
                  Led by Brian MacDonald • ISO compliance, metrology, audit readiness
                </p>
                <ul className="space-y-2 print:space-y-1">
                  <li className="text-body text-neutral-700 print:text-sm">• Quality Management Systems (ISO 9001, 17025)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Audit readiness and compliance</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Process documentation and standardization</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Regulatory compliance (DLA, FDA, NIST)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Laboratory and metrology management</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Operations management for regulated environments</li>
                </ul>
              </div>

              {/* Governance Pillar */}
              <div className="border-l-4 border-purple-700 pl-4 print:pl-3">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2 print:text-base">
                  Governance Pillar
                </h3>
                <p className="text-body-sm text-neutral-600 mb-3 print:text-xs italic">
                  Led by John Milso • Legal, contracts, risk analysis, corporate governance
                </p>
                <ul className="space-y-2 print:space-y-1">
                  <li className="text-body text-neutral-700 print:text-sm">• Commercial contracts (software, services, vendors)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Corporate governance</li>
                  <li className="text-body text-neutral-700 print:text-sm">• M&A due diligence</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Risk identification and mitigation</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Vendor and subcontractor agreement alignment</li>
                  <li className="text-body text-neutral-700 print:text-sm">• Contractual readiness for cyber and compliance obligations</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Certifications & Qualifications */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Certifications & Qualifications
            </h2>
            <div className="space-y-4 print:space-y-3">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2 print:text-sm">
                  Business Certifications
                </h3>
                <ul className="space-y-1 print:space-y-0.5">
                  <li className="text-body text-neutral-700 print:text-sm">• Service-Disabled Veteran-Owned Small Business (SDVOSB)</li>
                  <li className="text-body text-neutral-700 print:text-sm">• GSA HACS (Highly Adaptive Cybersecurity Services) eligible</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2 print:text-sm">
                  Primary NAICS Codes
                </h3>
                <ul className="space-y-1 print:space-y-0.5">
                  <li className="text-body text-neutral-700 print:text-sm">• 541512 – Computer Systems Design Services</li>
                  <li className="text-body text-neutral-700 print:text-sm">• 541519 – Other Computer Related Services</li>
                  <li className="text-body text-neutral-700 print:text-sm">• 541511 – Custom Computer Programming Services</li>
                </ul>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-2 print:text-sm">
                  Primary PSC Codes
                </h3>
                <ul className="space-y-1 print:space-y-0.5">
                  <li className="text-body text-neutral-700 print:text-sm">• D310 – IT & Telecom: Cyber Security and Data Backup</li>
                  <li className="text-body text-neutral-700 print:text-sm">• D307 – IT & Telecom: IT Strategy and Architecture</li>
                  <li className="text-body text-neutral-700 print:text-sm">• D399 – IT & Telecom: Other IT and Telecommunications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Past Performance */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Past Performance
            </h2>
            <ul className="space-y-2 print:space-y-1">
              <li className="text-body text-neutral-700 print:text-sm">• DoD cybersecurity contracts</li>
              <li className="text-body text-neutral-700 print:text-sm">• RMF implementation projects</li>
              <li className="text-body text-neutral-700 print:text-sm">• Compliance and audit readiness initiatives</li>
              <li className="text-body text-neutral-700 print:text-sm">• Infrastructure deployment and data center operations</li>
              <li className="text-body text-neutral-700 print:text-sm">• STIG compliance and remediation projects</li>
              <li className="text-body text-neutral-700 print:text-sm">• ISO compliance programs</li>
            </ul>
          </section>

          {/* Key Personnel */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Key Personnel
            </h2>
            <div className="space-y-4 print:space-y-3">
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1 print:text-sm">
                  Patrick Caruso
                </h3>
                <p className="text-body-sm text-neutral-600 mb-2 print:text-xs italic">
                  Director of Cyber Assurance • Security Pillar Leader
                </p>
                <p className="text-body text-neutral-700 print:text-sm">
                  Recognized expert in DoD cybersecurity, Risk Management Framework (RMF), and authorization 
                  processes. Successfully led multiple ATO efforts for mission-critical systems with deep 
                  experience in STIG compliance, continuous monitoring, and security control implementation.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1 print:text-sm">
                  James Adams
                </h3>
                <p className="text-body-sm text-neutral-600 mb-2 print:text-xs italic">
                  Director of Infrastructure & Systems Engineering • Infrastructure Pillar Leader
                </p>
                <p className="text-body text-neutral-700 print:text-sm">
                  Specializes in infrastructure architecture, systems engineering, and platform design for 
                  mission-critical federal systems. Expertise includes data center design, virtualization, 
                  cloud migration, and building infrastructure that meets authorization requirements from the ground up.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1 print:text-sm">
                  Brian MacDonald
                </h3>
                <p className="text-body-sm text-neutral-600 mb-2 print:text-xs italic">
                  Managing Member, Compliance & Operations • Quality Pillar Leader
                </p>
                <p className="text-body text-neutral-700 print:text-sm">
                  Extensive experience in quality management, compliance, and operations for regulated 
                  environments. Background includes leading ISO implementation programs, laboratory accreditation 
                  efforts, and audit readiness initiatives for federal contractors.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1 print:text-sm">
                  John Milso
                </h3>
                <p className="text-body-sm text-neutral-600 mb-2 print:text-xs italic">
                  Director of Legal, Contracts & Risk Advisory • Governance Pillar Leader
                </p>
                <p className="text-body text-neutral-700 print:text-sm">
                  Former Senior Legal Counsel at a global, publicly traded software company. Background 
                  includes commercial contracts, corporate governance, M&A due diligence, and complex 
                  litigation across regulated industries. Licensed in Massachusetts and Rhode Island.
                </p>
              </div>
            </div>
          </section>

          {/* Differentiators */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Differentiators
            </h2>
            <ul className="space-y-2 print:space-y-1">
              <li className="text-body text-neutral-700 print:text-sm">• <strong>Veteran-Owned Business:</strong> SDVOSB status with deep understanding of mission-critical operations and federal contracting requirements</li>
              <li className="text-body text-neutral-700 print:text-sm">• <strong>Senior Practitioners Only:</strong> Decades of combined experience—no junior consultants learning on your project</li>
              <li className="text-body text-neutral-700 print:text-sm">• <strong>Automation-Enhanced Delivery:</strong> Proprietary automation tools that accelerate delivery, reduce manual effort, and ensure consistency</li>
              <li className="text-body text-neutral-700 print:text-sm">• <strong>Four Pillars of Expertise:</strong> Organized structure ensuring every service is backed by specialized leadership and proven track records</li>
              <li className="text-body text-neutral-700 print:text-sm">• <strong>Available as Key Personnel:</strong> Leadership team available for proposals and can be named as key personnel</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-8 print:mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4 print:text-lg print:mb-3">
              Contact Information
            </h2>
            <div className="space-y-2 print:space-y-1">
              <p className="text-body text-neutral-700 print:text-sm">
                <strong>MacTech Solutions LLC</strong>
              </p>
              <p className="text-body text-neutral-700 print:text-sm">
                Website: <a href="https://mactech-solutions.com" className="text-accent-700 print:text-neutral-900 print:no-underline">mactech-solutions.com</a>
              </p>
              <p className="text-body text-neutral-700 print:text-sm">
                Email: <a href="mailto:contact@mactech-solutions.com" className="text-accent-700 print:text-neutral-900 print:no-underline">contact@mactech-solutions.com</a>
              </p>
            </div>
          </section>

          {/* Footer Note */}
          <div className="mt-12 pt-6 border-t border-neutral-200 print:mt-8 print:pt-4">
            <p className="text-body-sm text-neutral-600 text-center italic print:text-xs">
              This capabilities statement is current as of {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. 
              For the most current information, please visit our website or contact us directly.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

