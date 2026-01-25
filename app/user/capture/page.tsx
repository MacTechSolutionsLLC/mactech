'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import UserNavigation from '@/components/user/UserNavigation'
import OpportunityFeed from './components/OpportunityFeed'
import IncumbentIntelligence from './components/IncumbentIntelligence'
import Analytics from './components/Analytics'

type Tab = 'opportunities' | 'incumbents' | 'analytics'

export default function CaptureDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('opportunities')
  const [stats, setStats] = useState<{
    total: number
    flagged: number
    highPriority: number
    ignored: number
  } | null>(null)
  const [intelligenceRunning, setIntelligenceRunning] = useState(false)
  const [intelligenceMessage, setIntelligenceMessage] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/capture/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleRunIntelligencePass = async () => {
    setIntelligenceRunning(true)
    setIntelligenceMessage(null)
    try {
      const response = await fetch('/api/admin/pipeline/intelligence-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force_recalculate: false }),
      })
      const data = await response.json()
      
      if (data.success) {
        const processed = data.results?.filter((r: any) => r.intelligence_calculated).length || 0
        const total = data.results?.length || 0
        setIntelligenceMessage(
          `Intelligence computed for ${processed} of ${total} opportunities. ${data.errors?.length || 0} errors.`
        )
        // Reload stats to show updated data
        await loadStats()
      } else {
        setIntelligenceMessage(`Error: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error running intelligence pass:', error)
      setIntelligenceMessage('Failed to run intelligence pass. Check console for details.')
    } finally {
      setIntelligenceRunning(false)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <UserNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Federal Capture Dashboard
            </h1>
            <p className="text-base text-neutral-600">
              Discover opportunities, analyze incumbents, and prepare to bid on federal contracts
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      {stats && (
        <section className="bg-white border-b border-neutral-200">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-sm text-neutral-600 mb-1">Total Opportunities</div>
                <div className="text-2xl font-bold text-neutral-900">{stats.total.toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Flagged</div>
                <div className="text-2xl font-bold text-blue-900">{stats.flagged.toLocaleString()}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 mb-1">High Priority</div>
                <div className="text-2xl font-bold text-green-900">{stats.highPriority.toLocaleString()}</div>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg">
                <div className="text-sm text-neutral-600 mb-1">Ignored</div>
                <div className="text-2xl font-bold text-neutral-900">{stats.ignored.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Intelligence Pass Trigger */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 mb-2">Intelligence Computation</h2>
              <p className="text-sm text-neutral-600">
                Compute intelligence signals (incumbent risk, agency behavior, award realism) for existing opportunities.
                Processes up to 100 opportunities at a time.
              </p>
            </div>
            <button
              onClick={handleRunIntelligencePass}
              disabled={intelligenceRunning}
              className="px-6 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {intelligenceRunning ? 'Computing...' : 'Run Intelligence Pass'}
            </button>
          </div>
          {intelligenceMessage && (
            <div className={`mt-4 p-4 rounded-lg border ${
              intelligenceMessage.includes('Error') || intelligenceMessage.includes('Failed')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              <p className="text-sm">{intelligenceMessage}</p>
            </div>
          )}
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('opportunities')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'opportunities'
                  ? 'border-accent-700 text-accent-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Opportunities
            </button>
            <button
              onClick={() => setActiveTab('incumbents')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'incumbents'
                  ? 'border-accent-700 text-accent-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Incumbent Intelligence
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-accent-700 text-accent-700'
                  : 'border-transparent text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {activeTab === 'opportunities' && (
          <div>
            <OpportunityFeed />
            {!stats || stats.total === 0 ? (
              <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Opportunities Yet</h3>
                <p className="text-neutral-600 mb-4">
                  Opportunities will appear here once they are ingested from SAM.gov. 
                  Check the ingestion status in the Admin Portal to ensure data is being collected.
                </p>
                <Link
                  href="/user/contract-discovery"
                  className="inline-flex items-center px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 transition-colors"
                >
                  Search SAM.gov Opportunities →
                </Link>
              </div>
            ) : null}
          </div>
        )}
        {activeTab === 'incumbents' && <IncumbentIntelligence />}
        {activeTab === 'analytics' && <Analytics />}
      </section>
    </div>
  )
}

