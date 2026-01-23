'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import IngestionStatus from '@/app/admin/capture/components/IngestionStatus'
import UsaSpendingIngest from '@/app/admin/capture/components/UsaSpendingIngest'

export default function AdminPage() {
  // All hooks must be called unconditionally at the top
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    message: string
    results: string[]
    timestamp?: string
  } | null>(null)
  const [isGeneratingEvidence, setIsGeneratingEvidence] = useState(false)
  const [evidenceResult, setEvidenceResult] = useState<{
    success: boolean
    message: string
    files?: Array<{ filename: string; url: string }>
    timestamp?: string
  } | null>(null)

  // Redirect non-admin users immediately
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/user/contract-discovery')
        return
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/admin')
      return
    }
  }, [session, status, router])

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render admin content if not admin (redirect will happen)
  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    return null
  }

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

  const handleGenerateEvidence = async () => {
    if (!confirm('Generate all CMMC evidence exports? This will create CSV files for users, audit logs, physical access logs, and endpoint inventory.')) {
      return
    }

    setIsGeneratingEvidence(true)
    setEvidenceResult(null)

    try {
      const response = await fetch('/api/admin/evidence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exportedBy: 'admin@mactechsolutions.com',
        }),
      })

      const data = await response.json()
      setEvidenceResult(data)
    } catch (error) {
      setEvidenceResult({
        success: false,
        message: 'Failed to generate evidence',
      })
    } finally {
      setIsGeneratingEvidence(false)
    }
  }

  const complianceTools = [
    {
      href: '/admin/compliance',
      title: 'Compliance Dashboard',
      description: 'CMMC Level 1 compliance overview and evidence mapping',
      icon: '🛡️',
      color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage user accounts, roles, and access controls',
      icon: '👥',
      color: 'bg-teal-50 border-teal-200 hover:border-teal-300',
      iconBg: 'bg-teal-100',
    },
    {
      href: '/admin/events',
      title: 'Audit Log',
      description: 'View application event logs and export audit trail for compliance',
      icon: '📝',
      color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
      iconBg: 'bg-cyan-100',
    },
    {
      href: '/admin/physical-access-logs',
      title: 'Physical Access Logs',
      description: 'Record and manage physical access entries for CMMC PE.L1-3.10.4',
      icon: '🚪',
      color: 'bg-amber-50 border-amber-200 hover:border-amber-300',
      iconBg: 'bg-amber-100',
    },
    {
      href: '/admin/endpoint-inventory',
      title: 'Endpoint Inventory',
      description: 'Track authorized endpoints with antivirus status for CMMC SI.L1-3.14.2',
      icon: '💻',
      color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
    },
    {
      href: '/admin/files',
      title: 'File Management',
      description: 'Manage stored files and access controls',
      icon: '📁',
      color: 'bg-slate-50 border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100',
    },
    {
      href: '/admin/generate-proposal',
      title: 'Generate Proposal & BOE',
      description: 'Upload a Statement of Work (SOW) to automatically generate Proposal and BOE documents (Admin only - CMMC compliance)',
      icon: '📄',
      color: 'bg-orange-50 border-orange-200 hover:border-orange-300',
      iconBg: 'bg-orange-100',
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
              System administration, compliance management, and data ingestion controls.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-8">
        {/* Database Migrations Section */}
        <div className="bg-white rounded-xl border border-yellow-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Database Migrations</h2>
          <p className="text-sm text-neutral-700 mb-4">
            Sync database schema and create missing tables (PhysicalAccessLog, EndpointInventory, etc.). 
            This will ensure all CMMC compliance tables exist in the database.
          </p>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className="px-6 py-2.5 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMigrating ? 'Running Migrations...' : 'Sync Database Schema'}
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

        {/* Compliance & Security Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Compliance & Security</h2>
            <p className="text-neutral-600">CMMC Level 1 compliance tools and evidence management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {complianceTools.map((tool) => (
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

          {/* Evidence Generation */}
          <div className="bg-white rounded-xl border border-indigo-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">CMMC Evidence Generation</h3>
            <p className="text-sm text-neutral-700 mb-4">
              Generate all CMMC Level 1 evidence exports (users, audit logs, physical access logs, endpoint inventory). 
              All exports include metadata headers and are ready for assessor review.
            </p>
            <button
              onClick={handleGenerateEvidence}
              disabled={isGeneratingEvidence}
              className="px-6 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-medium hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingEvidence ? 'Generating Evidence...' : 'Generate All Evidence Exports'}
            </button>
            
            {evidenceResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                evidenceResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-semibold ${
                    evidenceResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {evidenceResult.success ? '✅ Success' : '❌ Failed'}
                  </h4>
                  {evidenceResult.timestamp && (
                    <span className="text-xs text-neutral-500">
                      {new Date(evidenceResult.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-2 ${
                  evidenceResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {evidenceResult.message}
                </p>
                {evidenceResult.files && evidenceResult.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-green-800">Generated Files:</p>
                    {evidenceResult.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        download
                        className="block text-sm text-green-700 hover:text-green-800 underline"
                      >
                        📄 {file.filename}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">User Management</h2>
          <p className="text-sm text-neutral-700 mb-4">
            Create, manage, and monitor user accounts. Control access roles and reset passwords.
          </p>
          <div className="flex gap-3">
            <Link
              href="/admin/users"
              className="px-6 py-2.5 bg-teal-700 text-white rounded-lg text-sm font-medium hover:bg-teal-800 transition-colors"
            >
              Manage Users →
            </Link>
          </div>
        </div>

        {/* Ingestion Controls Section */}
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Ingestion Controls</h2>
          <p className="text-sm text-neutral-700 mb-6">
            Control data ingestion from SAM.gov and USAspending.gov. Monitor ingestion status and trigger manual runs.
          </p>
          
          {/* SAM.gov Ingestion */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">SAM.gov Ingestion</h3>
            <IngestionStatus />
          </div>

          {/* USAspending Ingestion */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-3">USAspending Awards Ingestion</h3>
            <UsaSpendingIngest />
          </div>
        </div>
      </section>
    </div>
  )
}
