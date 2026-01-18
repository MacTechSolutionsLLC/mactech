'use client'

import { useState } from 'react'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'

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

  const adminTools = [
    {
      href: '/admin/dashboard',
      title: 'Pipeline Dashboard',
      description: 'Workflow view of contracts flowing through discovery, scraping, enrichment, and analysis stages',
      icon: '📊',
      color: 'bg-blue-50 border-blue-200 hover:border-blue-300',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/admin/discovery',
      title: 'Contract Discovery',
      description: 'Search for VetCert-eligible contract opportunities on SAM.gov using keywords and filters',
      icon: '🔍',
      color: 'bg-green-50 border-green-200 hover:border-green-300',
      iconBg: 'bg-green-100',
    },
    {
      href: '/admin/pipeline',
      title: 'Pipeline Monitoring',
      description: 'Monitor ingestion status, pipeline processing, and system health',
      icon: '⚙️',
      color: 'bg-purple-50 border-purple-200 hover:border-purple-300',
      iconBg: 'bg-purple-100',
    },
    {
      href: '/admin/opportunities',
      title: 'Opportunities',
      description: 'Unified view of all contract opportunities with scoring, filtering, and management',
      icon: '📋',
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/generate-proposal',
      title: 'Generate Proposal & BOE',
      description: 'Upload a Statement of Work (SOW) to automatically generate Proposal and BOE documents',
      icon: '📄',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-300',
      iconBg: 'bg-orange-100',
    },
    {
      href: '/admin/usaspending',
      title: 'USAspending Awards',
      description: 'View historical award data and analyze past contract awards',
      icon: '🏆',
      color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300',
      iconBg: 'bg-yellow-100',
    },
  ]

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">Admin Portal</h1>
            <p className="text-lg text-neutral-700 leading-relaxed">
            Manage contract opportunities, generate proposals, and monitor SAM.gov data ingestion.
          </p>
          </div>
        </div>
      </section>

      {/* Admin Tools Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {adminTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group block p-6 rounded-xl border-2 transition-all duration-200 ${tool.color}`}
            >
              <div className="flex items-start gap-4">
                <div className={`${tool.iconBg} p-3 rounded-lg text-2xl flex-shrink-0`}>
                  {tool.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-accent-700 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-accent-700 group-hover:text-accent-800">
                    Open →
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
          
          {/* Database Migration Section */}
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Database Migrations</h3>
            <p className="text-sm text-neutral-700 mb-4">
              Run database migrations manually. Use this after deploying new schema changes.
            </p>
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
            className="px-6 py-2.5 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      </section>
    </div>
  )
}

