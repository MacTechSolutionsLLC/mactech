'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import IngestionStatus from './components/IngestionStatus'
import OpportunityFeed from './components/OpportunityFeed'
import IncumbentIntelligence from './components/IncumbentIntelligence'
import UsaSpendingIngest from './components/UsaSpendingIngest'
import Analytics from '../user/capture/components/Analytics'

type Tab = 'opportunities' | 'incumbents' | 'analytics'

export default function CaptureDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('opportunities')
  const [stats, setStats] = useState<{
    total: number
    flagged: number
    highPriority: number
    ignored: number
  } | null>(null)

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

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
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

      {/* Ingestion Status Banner */}
      <IngestionStatus onStatusChange={loadStats} />

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

      {/* USAspending Ingestion */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <UsaSpendingIngest onIngestComplete={loadStats} />
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
        {activeTab === 'opportunities' && <OpportunityFeed />}
        {activeTab === 'incumbents' && <IncumbentIntelligence />}
        {activeTab === 'analytics' && <Analytics />}
      </section>
    </div>
  )
}

