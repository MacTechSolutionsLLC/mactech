'use client'

import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <section className="section-narrow bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="heading-hero mb-6">Admin Portal</h1>
          <p className="text-body-lg text-neutral-700 max-w-2xl leading-relaxed mb-6">
            Manage contract opportunities, generate proposals, and monitor SAM.gov data ingestion.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link href="/admin/contract-discovery" className="btn-secondary">
              Contract Discovery
            </Link>
            <Link href="/admin/contract-discovery/dashboard" className="btn-secondary">
              Contract Dashboard
            </Link>
            <Link href="/admin/sam-dashboard" className="btn-secondary">
              SAM.gov Dashboard
            </Link>
            <Link href="/admin/generate-proposal" className="btn-secondary">
              Generate Proposal & BOE
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="card p-8 lg:p-12 bg-neutral-50">
            <h3 className="heading-3 mb-6">How It Works</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Contract Discovery</h4>
                  <p className="text-body-sm text-neutral-700">
                    Search for VetCert-eligible contract opportunities on SAM.gov using keywords, NAICS codes, and filters. 
                    Automatically filters for SDVOSB/VOSB set-asides and provides relevance scoring.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Contract Dashboard</h4>
                  <p className="text-body-sm text-neutral-700">
                    View and manage discovered contract opportunities. Review validation results, analysis summaries, 
                    and track which opportunities have been verified or dismissed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">SAM.gov Dashboard</h4>
                  <p className="text-body-sm text-neutral-700">
                    Monitor automated SAM.gov opportunity ingestion pipeline. View scored and AI-analyzed opportunities, 
                    filter by relevance score, and manage flagged opportunities for review.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-body-sm font-semibold text-neutral-900 mb-2">Generate Proposal & BOE</h4>
                  <p className="text-body-sm text-neutral-700">
                    Upload a Statement of Work (SOW) document to automatically generate a Proposal and Basis of Estimate (BOE). 
                    AI extracts key information and creates professional documents ready for customization and submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

