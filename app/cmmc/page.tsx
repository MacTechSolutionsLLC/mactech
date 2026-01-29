import type { Metadata } from 'next'
import Link from 'next/link'
import ComplianceBadges from '@/components/ComplianceBadges'

export const metadata: Metadata = {
  title: 'CMMC & CUI Compliance | MacTech Solutions',
  description:
    'Achieve CMMC readiness, C3PAO confidence, and a defensible CUI boundary—platform, vault, or compliance package for federal programs and defense contractors.',
}

export default function CMMCPage() {
  return (
    <div className="bg-white">
      {/* Hero — editorial, confident */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="fade-in">
            <h1 className="heading-hero mb-6 text-neutral-900">
              CMMC & CUI Compliance — Built for Mission‑Critical Programs
            </h1>
            <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-4">
              MacTech Solutions helps federal programs and defense contractors achieve CMMC readiness, 
              C3PAO confidence, and a defensible CUI boundary through integrated platform, vault, or compliance-package delivery.
            </p>
            <p className="text-body-sm text-neutral-500 max-w-2xl mb-10">
              FIPS 140-3 · CMMC Level 2 · C3PAO-ready evidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
                Contact Us
              </Link>
              <Link
                href="/readiness"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Understand Your Readiness
              </Link>
            </div>
            <details className="disclosure-section mt-10 max-w-2xl">
              <summary className="disclosure-summary">
                <span>Why a clear CUI boundary matters</span>
                <span className="disclosure-chevron" aria-hidden>▼</span>
              </summary>
              <div className="disclosure-content">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Pass C3PAO assessments with a defined, defensible boundary that reduces scope and audit risk.</li>
                  <li>Reduce cost and complexity by isolating CUI in a FIPS-controlled enclave—not sprawl across your enterprise.</li>
                  <li>Meet DFARS 252.204-7012 and flow-downs with audit-ready evidence and operational confidence.</li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Offerings — hierarchy of capabilities */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-2">Three Paths to CMMC Compliance and CUI Protection</h2>
          <p className="text-body-lg text-neutral-700 max-w-2xl mb-12">
            From full platform to pluggable vault to compliance package—choose the level of capability that fits your program and your timeline.
          </p>

          {/* Tier 1 — Primary (featured) */}
          <div className="card-interactive p-8 flex flex-col gap-6 border-l-4 border-accent-700 bg-white mb-8 fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="heading-2 mb-3">Federal Capture Platform</h3>
                <p className="text-body text-neutral-700 max-w-xl leading-relaxed">
                  Capture, CUI boundary, and compliance in one integrated place—achieving authorization readiness and operational confidence without silos or handoffs.
                </p>
              </div>
              <Link
                href="/readiness"
                className="btn-primary inline-flex items-center justify-center shrink-0"
              >
                Understand Your Readiness
              </Link>
            </div>
            <details className="disclosure-section">
              <summary className="disclosure-summary">
                <span>What&apos;s included</span>
                <span className="disclosure-chevron" aria-hidden>▼</span>
              </summary>
              <div className="disclosure-content">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Capture pipeline for opportunities and contracts—accelerate bid and proposal workflows.</li>
                  <li>CUI vault integration with a FIPS-controlled boundary; no CUI outside the enclave.</li>
                  <li>Readiness evidence and compliance dashboards for C3PAO and internal audits.</li>
                </ul>
              </div>
            </details>
          </div>

          {/* Tier 2 — Supporting (two cards) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-interactive p-6 flex flex-col fade-in-delay-1">
              <h3 className="heading-3 mb-3">Deployable CUI Vault</h3>
              <p className="text-body text-neutral-700 mb-4 flex-grow leading-relaxed">
                A FIPS 140-3–controlled boundary and API-first vault you deploy into any app or enclave—reducing scope and cost while meeting DFARS and flow-downs.
              </p>
              <details className="disclosure-section mb-4">
                <summary className="disclosure-summary">
                  <span>What&apos;s in the box</span>
                  <span className="disclosure-chevron" aria-hidden>▼</span>
                </summary>
                <div className="disclosure-content">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>FIPS-controlled boundary with REST API for upload, list, and delete—no CUI leaves the enclave.</li>
                    <li>Policy bundle and C3PAO-ready evidence package for your boundary documentation.</li>
                  </ul>
                </div>
              </details>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center text-center mt-auto"
              >
                Contact us
              </Link>
            </div>
            <div className="card-interactive p-6 flex flex-col fade-in-delay-2">
              <h3 className="heading-3 mb-3">CMMC Compliance Package</h3>
              <p className="text-body text-neutral-700 mb-4 flex-grow leading-relaxed">
                Policies, procedures, and evidence tooling aligned to NIST SP 800-171—so you build C3PAO readiness into your own system without starting from scratch.
              </p>
              <details className="disclosure-section mb-4">
                <summary className="disclosure-summary">
                  <span>What you get</span>
                  <span className="disclosure-chevron" aria-hidden>▼</span>
                </summary>
                <div className="disclosure-content">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Policies and procedures aligned to NIST SP 800-171 and CMMC Level 2.</li>
                    <li>Evidence tooling; optional STIG hardening and validation scripts for automation-enhanced delivery.</li>
                  </ul>
                </div>
              </details>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center text-center mt-auto"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Frameworks & Alignments — editorial */}
      <section className="section-container bg-white py-12 lg:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="heading-2 mb-4 text-neutral-900">Compliance Frameworks & Alignments</h2>
          <p className="text-body text-neutral-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            MacTech Solutions maintains CMMC 2.0 Level 2 compliance and aligns with NIST CSF 2.0, NIST RMF, FedRAMP Moderate, and SOC 2 Type I readiness.
          </p>
          <ComplianceBadges size="small" showLabels />
          <details className="disclosure-section mt-10 max-w-2xl mx-auto text-left">
            <summary className="disclosure-summary">
              <span>How we align with these frameworks</span>
              <span className="disclosure-chevron" aria-hidden>▼</span>
            </summary>
            <div className="disclosure-content">
              <ul className="space-y-3 text-body text-neutral-700">
                <li><strong>CMMC 2.0 Level 2:</strong> Independently certified implementation of NIST SP 800-171 controls for protecting CUI—C3PAO-ready evidence and defensible boundary.</li>
                <li><strong>FedRAMP Moderate:</strong> Security architecture and control design aligned with the FedRAMP Moderate baseline.</li>
                <li><strong>NIST RMF:</strong> Risk governance structured around NIST Risk Management Framework principles.</li>
                <li><strong>SOC 2 Type I:</strong> Internal SOC 2 Type I readiness for security control design.</li>
              </ul>
            </div>
          </details>
        </div>
      </section>

      {/* Closing CTA — editorial, confident */}
      <section className="section-narrow bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-body-lg text-neutral-700 mb-8 leading-relaxed">
            Ready to achieve CMMC readiness and a defensible CUI boundary?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
              Contact Us
            </Link>
            <Link
              href="/readiness"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Understand Your Readiness
            </Link>
          </div>
          <details className="disclosure-section text-left">
            <summary className="disclosure-summary">
              <span>What happens when you reach out</span>
              <span className="disclosure-chevron" aria-hidden>▼</span>
            </summary>
            <div className="disclosure-content">
              <ol className="list-decimal pl-5 space-y-2 text-body text-neutral-700">
                <li>Discovery call to understand your program, scope, and timeline.</li>
                <li>Scope and fit: we recommend platform, vault, or package—tailored to your needs.</li>
                <li>Proposal and timeline with clear deliverables and C3PAO-ready evidence.</li>
                <li>Onboarding and delivery with operational confidence—no surprises at audit.</li>
              </ol>
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
