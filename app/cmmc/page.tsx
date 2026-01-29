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
      {/* Hero — sleek */}
      <section className="section-container bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="fade-in">
            <h1 className="heading-hero mb-6 text-neutral-900">
              CMMC & CUI Compliance — Built for Federal and Defense
            </h1>
            <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-4">
              We deliver a clear CUI boundary and audit-ready evidence — as a full platform, a pluggable vault, or a compliance package.
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
                Readiness Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings — hierarchy of capabilities */}
      <section className="section-container bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading-2 mb-2">Our CMMC & CUI Offerings</h2>
          <p className="text-body-lg text-neutral-700 max-w-2xl mb-12">
            Choose the level of capability that fits your program.
          </p>

          {/* Tier 1 — Primary (featured) */}
          <div className="card-interactive p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-l-4 border-accent-700 bg-white mb-8 fade-in">
            <div>
              <h3 className="heading-2 mb-3">Federal Capture Platform</h3>
              <p className="text-body text-neutral-700 max-w-xl">
                Capture, CUI boundary, and compliance in one place.
              </p>
            </div>
            <Link
              href="/readiness"
              className="btn-primary inline-flex items-center justify-center shrink-0"
            >
              Readiness Assessment
            </Link>
          </div>

          {/* Tier 2 — Supporting (two cards) */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-interactive p-6 flex flex-col fade-in-delay-1">
              <h3 className="heading-3 mb-3">Deployable CUI Vault</h3>
              <p className="text-body text-neutral-700 mb-6 flex-grow">
                FIPS boundary you plug into any app or enclave.
              </p>
              <Link
                href="/contact"
                className="btn-secondary inline-flex items-center justify-center text-center mt-auto"
              >
                Contact us
              </Link>
            </div>
            <div className="card-interactive p-6 flex flex-col fade-in-delay-2">
              <h3 className="heading-3 mb-3">CMMC Compliance Package</h3>
              <p className="text-body text-neutral-700 mb-6 flex-grow">
                Policies, procedures, and evidence tooling for your own system.
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

      {/* Compliance badges — compact */}
      <section className="section-container bg-white py-12 lg:py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="heading-3 mb-6 text-neutral-700">Frameworks we align with</h2>
          <ComplianceBadges size="small" showLabels />
        </div>
      </section>

      {/* Closing CTA — minimal */}
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
