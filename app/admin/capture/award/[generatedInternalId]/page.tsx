'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'

interface AwardDetail {
  id: string
  humanAwardId: string | null
  generatedInternalId: string
  title: string
  description: string | null
  agency: string | null
  subAgency: string | null
  amount: number | null
  popStart: string | null
  popEnd: string | null
  naics: string | null
  psc: string | null
  recipient: string | null
  subawardCount: number | null
  transactionCount: number | null
}

interface EntityData {
  legalBusinessName?: string | null
  registrationStatus?: string | null
  ueiSAM?: string | null
  cageCode?: string | null
  entityStructureDesc?: string | null
  profitStructureDesc?: string | null
  organizationStructureDesc?: string | null
  countryOfIncorporation?: string | null
  businessTypeList?: string[]
  primaryNaics?: string | null
  naicsList?: Array<{ naicsCode?: string; naicsName?: string }>
  pscList?: Array<{ pscCode?: string; pscName?: string }>
  samRegistered?: string | null
  registrationDate?: string | null
  registrationExpirationDate?: string | null
  pointsOfContact?: any
}

interface AwardDetailResponse {
  success: boolean
  award: AwardDetail
  signals: string[]
  relevanceScore: number | null
  transactionSummary: {
    total: number
    recent: number
    totalAmount: number
    lastActivity: string | null
  }
  incumbent: {
    name: string
    uei: string | null
    duns: string | null
  } | null
  recompeteIndicator: boolean
  entityData?: EntityData | null // SAM.gov Entity API data (contextual, non-authoritative)
  error?: string
}

export default function AwardDetailPage({
  params,
}: {
  params: Promise<{ generatedInternalId: string }> | { generatedInternalId: string }
}) {
  const [resolvedParams, setResolvedParams] = useState<{ generatedInternalId: string } | null>(null)
  const [awardData, setAwardData] = useState<AwardDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const resolveParams = async () => {
      const p = await Promise.resolve(params)
      setResolvedParams(p)
    }
    resolveParams()
  }, [params])

  useEffect(() => {
    if (!resolvedParams) return

    const loadAward = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          `/api/admin/capture/usaspending/award/${resolvedParams.generatedInternalId}`
        )
        const data: AwardDetailResponse = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to load award')
        }

        setAwardData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load award')
      } finally {
        setLoading(false)
      }
    }

    loadAward()
  }, [resolvedParams])

  if (!resolvedParams) {
    return <div>Loading...</div>
  }

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="text-center text-neutral-600">Loading award details...</div>
        </div>
      </div>
    )
  }

  if (error || !awardData) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error || 'Failed to load award'}</p>
            <Link
              href="/admin/capture"
              className="mt-4 inline-block text-sm text-red-700 hover:text-red-900 underline"
            >
              ← Back to Capture Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { award, signals, relevanceScore, transactionSummary, incumbent, recompeteIndicator, entityData } = awardData

  const getSignalBadgeColor = (signal: string) => {
    switch (signal) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'STABLE':
        return 'bg-blue-100 text-blue-800'
      case 'DECLINING':
        return 'bg-yellow-100 text-yellow-800'
      case 'RECOMPETE_WINDOW':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-neutral-100 text-neutral-800'
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />

      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <Link
            href="/admin/capture"
            className="text-sm text-neutral-600 hover:text-neutral-900 mb-4 inline-block"
          >
            ← Back to Capture Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Award Details
          </h1>
          {award.humanAwardId && (
            <p className="text-base text-neutral-600">Award ID: {award.humanAwardId}</p>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Score */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-2xl font-semibold text-neutral-900">{award.title}</h2>
                {relevanceScore !== null && (
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      relevanceScore >= 70
                        ? 'bg-green-100 text-green-800'
                        : relevanceScore >= 50
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-neutral-100 text-neutral-800'
                    }`}
                  >
                    Relevance: {relevanceScore}
                  </span>
                )}
              </div>

              {/* Signals */}
              {signals.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {signals.map((signal) => (
                    <span
                      key={signal}
                      className={`px-2 py-1 rounded text-xs font-medium ${getSignalBadgeColor(signal)}`}
                    >
                      {signal}
                    </span>
                  ))}
                  {recompeteIndicator && (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      RECOMPETE SOON
                    </span>
                  )}
                </div>
              )}

              {/* Description */}
              {award.description && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-neutral-700 mb-2">Description</h3>
                  <p className="text-sm text-neutral-600 whitespace-pre-wrap">
                    {award.description}
                  </p>
                </div>
              )}
            </div>

            {/* Transaction Summary */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Activity Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-neutral-600">Total Transactions</div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {transactionSummary.total}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Recent (180 days)</div>
                  <div className="text-2xl font-bold text-neutral-900">
                    {transactionSummary.recent}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Total Amount</div>
                  <div className="text-2xl font-bold text-neutral-900">
                    ${(transactionSummary.totalAmount / 1_000_000).toFixed(2)}M
                  </div>
                </div>
                <div>
                  <div className="text-sm text-neutral-600">Last Activity</div>
                  <div className="text-sm font-medium text-neutral-900">
                    {transactionSummary.lastActivity
                      ? new Date(transactionSummary.lastActivity).toLocaleDateString()
                      : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Information */}
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Key Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-neutral-700">Agency</dt>
                  <dd className="text-sm text-neutral-900">{award.agency || 'N/A'}</dd>
                  {award.subAgency && (
                    <dd className="text-xs text-neutral-600 mt-1">{award.subAgency}</dd>
                  )}
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-700">Award Amount</dt>
                  <dd className="text-sm text-neutral-900">
                    {award.amount ? `$${(award.amount / 1_000_000).toFixed(2)}M` : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-700">Period of Performance</dt>
                  <dd className="text-sm text-neutral-900">
                    {award.popStart && award.popEnd
                      ? `${new Date(award.popStart).toLocaleDateString()} - ${new Date(award.popEnd).toLocaleDateString()}`
                      : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-700">NAICS Code</dt>
                  <dd className="text-sm text-neutral-900">{award.naics || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-700">PSC Code</dt>
                  <dd className="text-sm text-neutral-900">{award.psc || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-neutral-700">Subawards</dt>
                  <dd className="text-sm text-neutral-900">{award.subawardCount || 0}</dd>
                </div>
              </dl>
            </div>

            {/* Incumbent / Vendor Snapshot */}
            {incumbent && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Incumbent Vendor</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-neutral-700">Name</dt>
                    <dd className="text-sm text-neutral-900">{incumbent.name}</dd>
                  </div>
                  {incumbent.uei && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">UEI</dt>
                      <dd className="text-sm text-neutral-900 font-mono">{incumbent.uei}</dd>
                    </div>
                  )}
                  {incumbent.duns && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">DUNS</dt>
                      <dd className="text-sm text-neutral-900 font-mono">{incumbent.duns}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* SAM.gov Entity API Data (Contextual, Non-Authoritative) */}
            {entityData && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">Vendor Snapshot</h3>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    SAM.gov Entity API
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mb-4 italic">
                  SAM.gov Entity data is contextual and non-authoritative. USAspending.gov is the primary source of truth.
                </p>
                <dl className="space-y-2">
                  {entityData.legalBusinessName && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Legal Business Name</dt>
                      <dd className="text-sm text-neutral-900">{entityData.legalBusinessName}</dd>
                    </div>
                  )}
                  {entityData.registrationStatus && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">SAM Registration Status</dt>
                      <dd className="text-sm text-neutral-900">{entityData.registrationStatus}</dd>
                    </div>
                  )}
                  {entityData.ueiSAM && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">UEI SAM</dt>
                      <dd className="text-sm text-neutral-900 font-mono">{entityData.ueiSAM}</dd>
                    </div>
                  )}
                  {entityData.cageCode && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">CAGE Code</dt>
                      <dd className="text-sm text-neutral-900 font-mono">{entityData.cageCode}</dd>
                    </div>
                  )}
                  {entityData.entityStructureDesc && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Entity Structure</dt>
                      <dd className="text-sm text-neutral-900">{entityData.entityStructureDesc}</dd>
                    </div>
                  )}
                  {entityData.countryOfIncorporation && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Country of Incorporation</dt>
                      <dd className="text-sm text-neutral-900">{entityData.countryOfIncorporation}</dd>
                    </div>
                  )}
                  {entityData.registrationDate && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Registration Date</dt>
                      <dd className="text-sm text-neutral-900">
                        {new Date(entityData.registrationDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {entityData.registrationExpirationDate && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Registration Expires</dt>
                      <dd className="text-sm text-neutral-900">
                        {new Date(entityData.registrationExpirationDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {entityData.businessTypeList && entityData.businessTypeList.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Business Types</dt>
                      <dd className="text-sm text-neutral-900">
                        {entityData.businessTypeList.join(', ')}
                      </dd>
                    </div>
                  )}
                  {entityData.primaryNaics && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-700">Primary NAICS</dt>
                      <dd className="text-sm text-neutral-900">{entityData.primaryNaics}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Competitive Intelligence */}
            {incumbent && (
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Competitive Intelligence</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-900 mb-1">Likely Incumbent</div>
                    <div className="text-blue-700">
                      Based on historical award data: <strong>{incumbent.name}</strong>
                    </div>
                  </div>
                  {transactionSummary.total > 0 && (
                    <div>
                      <div className="font-medium text-neutral-700 mb-1">Award Activity</div>
                      <div className="text-neutral-600">
                        {transactionSummary.total} total transactions, {transactionSummary.recent} in last 180 days
                      </div>
                    </div>
                  )}
                  {award.amount && (
                    <div>
                      <div className="font-medium text-neutral-700 mb-1">Award Value</div>
                      <div className="text-neutral-600">
                        ${(award.amount / 1_000_000).toFixed(2)}M total obligation
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
