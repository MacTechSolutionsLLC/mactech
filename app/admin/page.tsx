'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
    results: string[]
    timestamp?: string
  } | null>(null)

  const handleMigrate = async () => {
    if (!confirm('Are you sure you want to run database migrations? This may take a moment.')) {
      return
    }

    setIsMigrating(true)
    setMigrationResult(null)

    try {
      const response = await fetch('/api/admin/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()
      setMigrationResult(data)
    } catch (error) {
      setMigrationResult({
        success: false,
        message: 'Failed to run migration',
        results: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setIsMigrating(false)
    }
  }
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
            <Link href="/admin/capture" className="btn-primary">
              Federal Capture Dashboard
            </Link>
            <Link href="/admin/contract-discovery" className="btn-secondary">
              Contract Discovery
            </Link>
            <Link href="/admin/contract-discovery/dashboard" className="btn-secondary">
              Contract Dashboard
            </Link>
            <Link href="/admin/generate-proposal" className="btn-secondary">
              Generate Proposal & BOE
            </Link>
            <Link href="/admin/usaspending" className="btn-secondary">
              USAspending Awards
            </Link>
          </div>
          
          {/* Database Migration Section */}
          <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Database Migrations</h3>
            <p className="text-sm text-neutral-700 mb-4">
              Run database migrations manually. Use this after deploying new schema changes.
            </p>
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMigrating ? 'Running Migrations...' : 'Run Migrations'}
            </button>
            
            {migrationResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                migrationResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-semibold ${
                    migrationResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {migrationResult.success ? '✅ Success' : '❌ Failed'}
                  </h4>
                  {migrationResult.timestamp && (
                    <span className="text-xs text-neutral-500">
                      {new Date(migrationResult.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-2 ${
                  migrationResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {migrationResult.message}
                </p>
                {migrationResult.results && migrationResult.results.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {migrationResult.results.map((result, index) => (
                      <p key={index} className="text-xs font-mono text-neutral-600">
                        {result}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
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
                    Unified dashboard for all contract opportunities from SAM.gov ingestion pipeline and contract discovery. 
                    View scored and AI-analyzed opportunities, filter by relevance score, NAICS codes, and set-asides, 
                    and manage flagged, verified, or dismissed opportunities. Includes ingestion pipeline controls and query management.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-accent-700 text-white rounded-full flex items-center justify-center text-body-sm font-semibold">
                  3
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

