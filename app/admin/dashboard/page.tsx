'use client'

import { useState, useEffect } from 'react'
import AdminNavigation from '@/components/admin/AdminNavigation'
import PipelineBoard from '@/components/admin/dashboard/PipelineBoard'
import PipelineStats from '@/components/admin/dashboard/PipelineStats'

interface Contract {
  id: string
  title: string
  agency?: string | null
  relevance_score: number
  pipeline_status: string
  pipeline_stage?: string | null
  scraped: boolean
  usaspending_enrichment_status?: string | null
  aiAnalysis?: string | null
  flagged: boolean
  ignored: boolean
  created_at: string
  url: string
}

export default function DashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [autoProcessing, setAutoProcessing] = useState(false)

  useEffect(() => {
    loadContracts()
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadContracts, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/admin/contract-discovery/unified-list?limit=500')
      const data = await response.json()
      
      if (data.success) {
        setContracts(data.opportunities || data.contracts || [])
      }
    } catch (error) {
      console.error('Error loading contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlag = async (id: string, flagged: boolean) => {
    try {
      const response = await fetch('/api/admin/sam/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId: id, flagged }),
      })
      
      if (response.ok) {
        await loadContracts()
      }
    } catch (error) {
      console.error('Error flagging contract:', error)
    }
  }

  const handleIgnore = async (id: string) => {
    try {
      const response = await fetch('/api/admin/sam/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticeId: id }),
      })
      
      if (response.ok) {
        await loadContracts()
      }
    } catch (error) {
      console.error('Error ignoring contract:', error)
    }
  }

  const handleProcess = async (id: string) => {
    try {
      const response = await fetch('/api/admin/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract_ids: [id],
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh after a short delay to allow processing to start
        setTimeout(loadContracts, 2000)
      } else {
        alert(data.error || 'Failed to process contract')
      }
    } catch (error) {
      console.error('Error processing contract:', error)
      alert('Failed to process contract')
    }
  }

  const handleAutoProcess = async () => {
    if (!confirm('This will auto-process all contracts with score >= 50. Continue?')) {
      return
    }

    setAutoProcessing(true)
    try {
      const response = await fetch('/api/admin/pipeline/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auto_process: true,
          min_score: 50,
          limit: 100,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert(`Started auto-processing ${data.stats?.total || 0} contracts. Check back in a few minutes.`)
        setTimeout(loadContracts, 5000)
      } else {
        alert(data.error || 'Failed to start auto-processing')
      }
    } catch (error) {
      console.error('Error starting auto-processing:', error)
      alert('Failed to start auto-processing')
    } finally {
      setAutoProcessing(false)
    }
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      <AdminNavigation />
      
      {/* Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Contract Pipeline Dashboard
              </h1>
              <p className="text-base text-neutral-600">
                Workflow view of contracts flowing through discovery, scraping, enrichment, and analysis stages
              </p>
            </div>
            <button
              onClick={handleAutoProcess}
              disabled={autoProcessing}
              className="px-6 py-3 bg-accent-700 text-white rounded-lg text-sm font-medium hover:bg-accent-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-700/20"
            >
              {autoProcessing ? 'Processing...' : 'Auto-Process (≥50)'}
            </button>
          </div>
        </div>
      </section>

      {/* Pipeline Statistics */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-6">
        <PipelineStats />
      </section>

      {/* Pipeline Board */}
      <section className="max-w-full mx-auto px-6 lg:px-12 py-6">
        {loading ? (
          <div className="bg-white rounded-lg border border-neutral-200 p-16 text-center">
            <div className="animate-spin h-10 w-10 border-3 border-accent-700 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-neutral-600 mt-6 font-medium">Loading contracts...</p>
          </div>
        ) : (
          <PipelineBoard
            contracts={contracts}
            onFlag={handleFlag}
            onIgnore={handleIgnore}
            onProcess={handleProcess}
            onRefresh={loadContracts}
          />
        )}
      </section>
    </div>
  )
}

