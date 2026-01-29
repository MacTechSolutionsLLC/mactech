import type { Metadata } from 'next'
import Link from 'next/link'
import ComplianceBadges from '@/components/ComplianceBadges'

export const metadata: Metadata = {
  title: 'CMMC & CUI Compliance | MacTech Solutions',
  description:
    'FIPS-controlled CUI boundary, CMMC-ready evidence, and options from deployable vault to full federal capture platform for federal programs and defense contractors.',
}

export default function CMMCPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="section-container bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto">
          <div className="fade-in">
            <h1 className="heading-hero mb-6 text-neutral-900">
              CMMC & CUI Compliance — Built for Federal and Defense
            </h1>
            <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
              A FIPS-controlled CUI boundary, CMMC-ready evidence, and options from vault-only to full platform.
              For federal programs and defense contractors who need a clear boundary and audit-ready deliverables.
            </p>
            <p className="text-body-sm text-neutral-500 max-w-2xl mb-10">
              FIPS 140-3 (CMVP) · CMMC Level 2 · C3PAO-ready evidence
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
                Contact Us
              </Link>
              <Link
                href="/readiness"
                className="btn-secondary inline-flex items-center justify-center"
              >
                Readiness Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Context */}
      <section className="section-narrow bg-neutral-50 border-b border-neutral-200">
        <p className="text-body text-neutral-700 text-center max-w-2xl mx-auto">
          Programs need a clear CUI boundary and audit-ready evidence. We deliver both — as a standalone vault,
          as part of our federal capture platform, or as a compliance package for your own system.
        </p>
      </section>

      {/* Offerings */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-4">Our CMMC & CUI Offerings</h2>
          <p className="text-body text-neutral-700 max-w-2xl mb-12">
            Choose the option that fits your program: plug our FIPS vault into your app, adopt the full platform,
            or use our compliance artifacts and tooling.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 — Deployable CUI Vault */}
            <div className="card-interactive p-6 flex flex-col fade-in">
              <div className="h-px w-12 bg-accent-700 mb-4" />
              <h3 className="heading-3 mb-3">Deployable CUI Vault</h3>
              <p className="text-body text-neutral-700 mb-4 flex-grow">
                FIPS boundary only. Plug our vault into your app or enclave over HTTPS. CMVP-certified Ubuntu,
                hardening and validation playbooks, and C3PAO-ready evidence export.
              </p>
              <p className="text-body-sm text-neutral-500 mb-6">
                FIPS 140-3 · Hardening & validation playbooks · C3PAO evidence export · HTTPS API
              </p>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center text-center mt-auto"
              >
                Contact us
              </Link>
            </div>

            {/* Card 2 — Federal Capture Platform */}
            <div className="card-interactive p-6 flex flex-col fade-in-delay-1">
              <div className="h-px w-12 bg-accent-700 mb-4" />
              <h3 className="heading-3 mb-3">Federal Capture Platform</h3>
              <p className="text-body text-neutral-700 mb-4 flex-grow">
                Full platform: federal capture (SAM.gov, USAspending), contract discovery, CUI handling with
                FIPS boundary, and a CMMC Level 2 compliance dashboard.
              </p>
              <p className="text-body-sm text-neutral-500 mb-6">
                Capture & contract discovery · CUI FIPS boundary · CMMC L2 dashboard · SCTM, POA&M, evidence
              </p>
              <Link
                href="/readiness"
                className="btn-primary inline-flex items-center justify-center text-center mt-auto"
              >
                Readiness Assessment
              </Link>
            </div>

            {/* Card 3 — CMMC Compliance Package */}
            <div className="card-interactive p-6 flex flex-col fade-in-delay-2">
              <div className="h-px w-12 bg-accent-700 mb-4" />
              <h3 className="heading-3 mb-3">CMMC Compliance Package</h3>
              <p className="text-body text-neutral-700 mb-4 flex-grow">
                Policies, procedures, and evidence tooling — no app. For organizations building their own
                system who need CMMC-ready artifacts and a clean handoff to C3PAO.
              </p>
              <p className="text-body-sm text-neutral-500 mb-6">
                Policies & procedures · Hardening & validation scripts · Evidence export · SCTM/POA&M structure
              </p>
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

      {/* Compliance badges */}
      <section className="section-container bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="heading-2 mb-6">Frameworks & Alignments</h2>
          <ComplianceBadges size="medium" showLabels />
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section-narrow bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-body-lg text-neutral-700 mb-8">
            Ready to discuss your CMMC or CUI requirements?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-primary inline-flex items-center justify-center">
              Contact Us
            </Link>
            <Link
              href="/readiness"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Readiness Assessment
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
