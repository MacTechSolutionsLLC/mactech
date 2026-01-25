'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import IngestionStatus from '@/app/user/capture/components/IngestionStatus'
import UsaSpendingIngest from '@/app/user/capture/components/UsaSpendingIngest'

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

  const adminCategories = [
    {
      title: 'Contract Management',
      description: 'Discover, analyze, and manage federal contract opportunities',
      tools: [
        {
          href: '/user/capture',
          title: 'Federal Capture Dashboard',
          description: 'Discover opportunities, analyze incumbents, and prepare to bid on federal contracts',
          icon: '📊',
          color: 'bg-blue-50 border-blue-200 hover:border-blue-300',
          iconBg: 'bg-blue-100',
        },
        {
          href: '/user/contract-discovery',
          title: 'Contract Discovery',
          description: 'Search for VetCert-eligible contract opportunities on SAM.gov using keywords and filters',
          icon: '🔍',
          color: 'bg-green-50 border-green-200 hover:border-green-300',
          iconBg: 'bg-green-100',
        },
      ],
    },
    {
      title: 'User Management',
      description: 'Manage user accounts, roles, access controls, and feedback',
      tools: [
        {
          href: '/admin/users',
          title: 'User Management',
          description: 'Manage user accounts, roles, and access controls',
          icon: '👥',
          color: 'bg-teal-50 border-teal-200 hover:border-teal-300',
          iconBg: 'bg-teal-100',
        },
        {
          href: '/feedback',
          title: 'Feedback Forum',
          description: 'View and manage user feedback submissions',
          icon: '💬',
          color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
          iconBg: 'bg-cyan-100',
        },
      ],
    },
    {
      title: 'Compliance & Auditing',
      description: 'CMMC compliance tools, evidence management, and audit trails',
      tools: [
        {
          href: '/admin/compliance',
          title: 'Compliance Dashboard',
          description: 'CMMC Level 1 compliance overview and evidence mapping',
          icon: '🛡️',
          color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-300',
          iconBg: 'bg-indigo-100',
        },
        {
          href: '/admin/poam',
          title: 'POA&M Dashboard',
          description: 'Track and manage Plans of Action and Milestones for CMMC Level 2 controls',
          icon: '📋',
          color: 'bg-purple-50 border-purple-200 hover:border-purple-300',
          iconBg: 'bg-purple-100',
        },
        {
          href: '/admin/events',
          title: 'Audit Log',
          description: 'View application event logs and export audit trail for compliance',
          icon: '📝',
          color: 'bg-cyan-50 border-cyan-200 hover:border-cyan-300',
          iconBg: 'bg-cyan-100',
        },
      ],
    },
    {
      title: 'Security & Infrastructure',
      description: 'Physical access, endpoint inventory, and file management',
      tools: [
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
      ],
    },
    {
      title: 'Tools & Automation',
      description: 'Document generation, data ingestion, and system administration',
      tools: [
        {
          href: '/admin/generate-proposal',
          title: 'Generate Proposal & BOE',
          description: 'Upload a Statement of Work (SOW) to automatically generate Proposal and BOE documents',
          icon: '📄',
          color: 'bg-orange-50 border-orange-200 hover:border-orange-300',
          iconBg: 'bg-orange-100',
        },
      ],
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

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        {/* Render all categories as card grids */}
        {adminCategories.map((category) => (
          <div key={category.title}>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">{category.title}</h2>
              <p className="text-neutral-600">{category.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.tools.map((tool) => (
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
          </div>
        ))}

        {/* System Administration Actions */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">System Administration</h2>
            <p className="text-neutral-600">Database migrations, evidence generation, and data ingestion controls</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Database Migrations Card */}
            <div className="bg-white rounded-xl border-2 border-yellow-200 hover:border-yellow-300 shadow-sm p-6 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-yellow-100 p-3 rounded-lg text-2xl flex-shrink-0">
                  🗄️
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Database Migrations</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Sync database schema and create missing tables for CMMC compliance
                  </p>
                </div>
              </div>
              <button
                onClick={handleMigrate}
                disabled={isMigrating}
                className="w-full px-4 py-2.5 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMigrating ? 'Running Migrations...' : 'Sync Database Schema'}
              </button>
              {migrationResult && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  migrationResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="font-semibold mb-1">
                    {migrationResult.success ? '✅ Success' : '❌ Failed'}
                  </p>
                  <p>{migrationResult.message}</p>
                </div>
              )}
            </div>

            {/* Evidence Generation Card */}
            <div className="bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-300 shadow-sm p-6 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-100 p-3 rounded-lg text-2xl flex-shrink-0">
                  📋
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">CMMC Evidence Generation</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Generate all CMMC Level 1 evidence exports for assessor review
                  </p>
                </div>
              </div>
              <button
                onClick={handleGenerateEvidence}
                disabled={isGeneratingEvidence}
                className="w-full px-4 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-medium hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingEvidence ? 'Generating...' : 'Generate All Evidence'}
              </button>
              {evidenceResult && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  evidenceResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="font-semibold mb-1">
                    {evidenceResult.success ? '✅ Success' : '❌ Failed'}
                  </p>
                  <p>{evidenceResult.message}</p>
                </div>
              )}
            </div>

            {/* Ingestion Controls Card */}
            <div className="bg-white rounded-xl border-2 border-blue-200 hover:border-blue-300 shadow-sm p-6 transition-all">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg text-2xl flex-shrink-0">
                  📥
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Data Ingestion</h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    Control SAM.gov and USAspending.gov data ingestion
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">SAM.gov Ingestion</h4>
                  <IngestionStatus />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">USAspending Awards</h4>
                  <UsaSpendingIngest />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
