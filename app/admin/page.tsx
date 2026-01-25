'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import IngestionStatus from '@/app/user/capture/components/IngestionStatus'
import UsaSpendingIngest from '@/app/user/capture/components/UsaSpendingIngest'

interface AdminCard {
  href: string
  title: string
  description: string
  icon: string
  category: string
  gradient: string
  borderColor: string
  iconBg: string
}

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
  const [searchQuery, setSearchQuery] = useState('')

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

  // All admin cards organized by category
  const allCards: AdminCard[] = [
    // Contract Management
    {
      href: '/user/capture',
      title: 'Federal Capture Dashboard',
      description: 'Discover opportunities, analyze incumbents, and prepare to bid on federal contracts',
      icon: '📊',
      category: 'Contract Management',
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/user/contract-discovery',
      title: 'Contract Discovery',
      description: 'Search for VetCert-eligible contract opportunities on SAM.gov using keywords and filters',
      icon: '🔍',
      category: 'Contract Management',
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/admin/sam-capture',
      title: 'SAM Capture',
      description: 'View and manage captured SAM.gov opportunities with scoring and filtering',
      icon: '🎯',
      category: 'Contract Management',
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/admin/usaspending',
      title: 'USAspending Historical Awards',
      description: 'Search historical award data from USAspending.gov to analyze past contracts and winners',
      icon: '💰',
      category: 'Contract Management',
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    {
      href: '/admin/contract-discovery',
      title: 'Contract Discovery Admin',
      description: 'Advanced contract discovery and management tools for administrators',
      icon: '🔎',
      category: 'Contract Management',
      gradient: 'from-blue-50 to-blue-100/50',
      borderColor: 'border-blue-200 hover:border-blue-400',
      iconBg: 'bg-blue-100',
    },
    // Compliance & Security
    {
      href: '/admin/compliance',
      title: 'Compliance Dashboard',
      description: 'CMMC Level 1 compliance overview and evidence mapping',
      icon: '🛡️',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/poam',
      title: 'POA&M Dashboard',
      description: 'Track and manage Plans of Action and Milestones for CMMC Level 2 controls',
      icon: '📋',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/sctm',
      title: 'SCTM Management',
      description: 'System Control Traceability Matrix for CMMC compliance tracking. Controls documented in SCTM support alignment with NIST CSF 2.0, FedRAMP Moderate, SOC 2, and NIST RMF.',
      icon: '📊',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/audit',
      title: 'Compliance Audit',
      description: 'Internal compliance audit tools and procedures',
      icon: '🔍',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/system-security-plan',
      title: 'System Security Plan',
      description: 'Generate and manage the System Security Plan (SSP) document',
      icon: '📄',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/internal-audit-checklist',
      title: 'Internal Audit Checklist',
      description: 'Step-by-step "show me" procedures for assessors',
      icon: '✅',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/evidence-index',
      title: 'Evidence Index',
      description: 'Mapping of 17 FAR practices to controls and evidence',
      icon: '📑',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/admin/compliance/document',
      title: 'Compliance Documents',
      description: 'View and manage compliance documentation',
      icon: '📚',
      category: 'Compliance & Security',
      gradient: 'from-indigo-50 to-purple-100/50',
      borderColor: 'border-indigo-200 hover:border-indigo-400',
      iconBg: 'bg-indigo-100',
    },
    // User & Access Management
    {
      href: '/admin/users',
      title: 'User Management',
      description: 'Manage user accounts, roles, and access controls',
      icon: '👥',
      category: 'User & Access Management',
      gradient: 'from-teal-50 to-cyan-100/50',
      borderColor: 'border-teal-200 hover:border-teal-400',
      iconBg: 'bg-teal-100',
    },
    {
      href: '/admin/physical-access-logs',
      title: 'Physical Access Logs',
      description: 'Record and manage physical access entries for CMMC PE.L1-3.10.4',
      icon: '🚪',
      category: 'User & Access Management',
      gradient: 'from-teal-50 to-cyan-100/50',
      borderColor: 'border-teal-200 hover:border-teal-400',
      iconBg: 'bg-teal-100',
    },
    {
      href: '/admin/endpoint-inventory',
      title: 'Endpoint Inventory',
      description: 'Track authorized endpoints with antivirus status for CMMC SI.L1-3.14.2',
      icon: '💻',
      category: 'User & Access Management',
      gradient: 'from-teal-50 to-cyan-100/50',
      borderColor: 'border-teal-200 hover:border-teal-400',
      iconBg: 'bg-teal-100',
    },
    {
      href: '/admin/events',
      title: 'Audit Log & Events',
      description: 'View application event logs and export audit trail for compliance',
      icon: '📝',
      category: 'User & Access Management',
      gradient: 'from-teal-50 to-cyan-100/50',
      borderColor: 'border-teal-200 hover:border-teal-400',
      iconBg: 'bg-teal-100',
    },
    // System Administration
    {
      href: '/admin/files',
      title: 'File Management',
      description: 'Manage stored files and access controls',
      icon: '📁',
      category: 'System Administration',
      gradient: 'from-slate-50 to-neutral-100/50',
      borderColor: 'border-slate-200 hover:border-slate-400',
      iconBg: 'bg-slate-100',
    },
    // Content & Proposals
    {
      href: '/admin/generate-proposal',
      title: 'Generate Proposal & BOE',
      description: 'Upload a Statement of Work (SOW) to automatically generate Proposal and BOE documents',
      icon: '📄',
      category: 'Content & Proposals',
      gradient: 'from-orange-50 to-amber-100/50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      iconBg: 'bg-orange-100',
    },
    {
      href: '/user/security-obligations',
      title: 'Security Obligations',
      description: 'Complete and acknowledge your required security responsibilities and attestations',
      icon: '🔒',
      category: 'Content & Proposals',
      gradient: 'from-orange-50 to-amber-100/50',
      borderColor: 'border-orange-200 hover:border-orange-400',
      iconBg: 'bg-orange-100',
    },
    // Feedback & Communication
    {
      href: '/feedback',
      title: 'Feedback Forum',
      description: 'View and manage user feedback and suggestions',
      icon: '💬',
      category: 'Feedback & Communication',
      gradient: 'from-cyan-50 to-blue-100/50',
      borderColor: 'border-cyan-200 hover:border-cyan-400',
      iconBg: 'bg-cyan-100',
    },
  ]

  // Filter cards by search query
  const filteredCards = searchQuery
    ? allCards.filter(card =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allCards

  // Group cards by category
  const cardsByCategory = filteredCards.reduce((acc, card) => {
    if (!acc[card.category]) {
      acc[card.category] = []
    }
    acc[card.category].push(card)
    return acc
  }, {} as Record<string, AdminCard[]>)

  const categories = [
    'Contract Management',
    'Compliance & Security',
    'User & Access Management',
    'System Administration',
    'Content & Proposals',
    'Feedback & Communication',
  ]

  const categoryIcons: Record<string, string> = {
    'Contract Management': '📊',
    'Compliance & Security': '🛡️',
    'User & Access Management': '👥',
    'System Administration': '⚙️',
    'Content & Proposals': '📝',
    'Feedback & Communication': '💬',
  }

  return (
    <div className="bg-gradient-to-br from-neutral-50 via-neutral-50 to-neutral-100 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white/80 backdrop-blur-sm border-b border-neutral-200/50 sticky top-12 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold text-neutral-900 mb-3 bg-gradient-to-r from-neutral-900 to-neutral-700 bg-clip-text text-transparent">
              Admin Portal
            </h1>
            <p className="text-lg text-neutral-600 leading-relaxed mb-6">
              System administration, compliance management, and data ingestion controls. All admin features accessible from this dashboard.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search admin features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 transition-all text-sm"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-lg">🔍</span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-12 space-y-12">
        {/* Render cards by category */}
        {categories.map((category) => {
          const categoryCards = cardsByCategory[category] || []
          if (categoryCards.length === 0) return null

          return (
            <div key={category} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{categoryIcons[category]}</div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900">{category}</h2>
                  <p className="text-sm text-neutral-600 mt-1">
                    {categoryCards.length} {categoryCards.length === 1 ? 'feature' : 'features'} available
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryCards.map((card) => (
                  <Link
                    key={card.href}
                    href={card.href}
                    className="group relative block bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    style={{
                      borderColor: card.borderColor.includes('border-') 
                        ? undefined 
                        : 'var(--border-color)',
                    }}
                  >
                    {/* Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative p-6 h-full flex flex-col">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`${card.iconBg} p-3 rounded-xl text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                          {card.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-accent-700 transition-colors line-clamp-2">
                            {card.title}
                          </h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-neutral-600 leading-relaxed mb-4 flex-1 line-clamp-3">
                        {card.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 group-hover:border-accent-200 transition-colors">
                        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                          {card.category.split(' & ')[0]}
                        </span>
                        <div className="flex items-center text-sm font-medium text-accent-700 group-hover:text-accent-800 group-hover:translate-x-1 transition-all">
                          <span>Open</span>
                          <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Border Effect */}
                    <div className={`absolute inset-0 rounded-xl border-2 ${card.borderColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {/* System Actions Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚡</div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">System Actions</h2>
              <p className="text-sm text-neutral-600 mt-1">Quick actions for system administration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Migrations */}
            <div className="bg-white rounded-xl border-2 border-yellow-200 hover:border-yellow-400 transition-all duration-300 hover:shadow-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-yellow-100 p-3 rounded-xl text-2xl flex-shrink-0">
                  🔄
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Database Migrations</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Sync database schema and create missing tables (PhysicalAccessLog, EndpointInventory, etc.). 
                    This will ensure all CMMC compliance tables exist in the database.
                  </p>
                  <button
                    onClick={handleMigrate}
                    disabled={isMigrating}
                    className="w-full px-4 py-2.5 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
                        <h4 className={`font-semibold text-sm ${
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
            </div>

            {/* Evidence Generation */}
            <div className="bg-white rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-indigo-100 p-3 rounded-xl text-2xl flex-shrink-0">
                  📦
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">CMMC Evidence Generation</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    Generate all CMMC Level 1 evidence exports (users, audit logs, physical access logs, endpoint inventory). 
                    All exports include metadata headers and are ready for assessor review.
                  </p>
                  <button
                    onClick={handleGenerateEvidence}
                    disabled={isGeneratingEvidence}
                    className="w-full px-4 py-2.5 bg-indigo-700 text-white rounded-lg text-sm font-medium hover:bg-indigo-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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
                        <h4 className={`font-semibold text-sm ${
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
                          <p className="text-sm font-medium text-green-800">Generated Files (uploaded to /admin/files):</p>
                          <ul className="list-disc list-inside space-y-1">
                            {evidenceResult.files.map((file, index) => (
                              <li key={index} className="text-sm text-green-700">
                                📄 {file.filename}
                              </li>
                            ))}
                          </ul>
                          <Link
                            href="/admin/files"
                            className="inline-block mt-3 px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 transition-colors"
                          >
                            View Files in /admin/files →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ingestion Controls Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔄</div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Data Ingestion Controls</h2>
              <p className="text-sm text-neutral-600 mt-1">Control data ingestion from SAM.gov and USAspending.gov</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm p-6">
            {/* SAM.gov Ingestion */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <span>📡</span>
                <span>SAM.gov Ingestion</span>
              </h3>
              <IngestionStatus />
            </div>

            {/* USAspending Ingestion */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <span>💰</span>
                <span>USAspending Awards Ingestion</span>
              </h3>
              <UsaSpendingIngest />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
