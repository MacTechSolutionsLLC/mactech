'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'
import SCTMSummary from '@/components/compliance/SCTMSummary'
import SCTMTable from '@/components/compliance/SCTMTable'
import { parseSCTM, calculateSummaryStats, Control } from '@/lib/compliance/sctm-parser'

export default function SCTMPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [controls, setControls] = useState<Control[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [familyFilter, setFamilyFilter] = useState<string>('all')

  // Read family filter from URL query parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const familyParam = params.get('family')
      if (familyParam) {
        setFamilyFilter(familyParam)
      }
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    if (status === 'authenticated') {
      fetchSCTMData()
    }
  }, [status, session, router])


  const fetchSCTMData = async () => {
    try {
      // Add timestamp to prevent caching
      const response = await fetch(`/api/admin/compliance/sctm?t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        // Debug: Log first control to verify NIST fields
        if (data.controls && data.controls.length > 0) {
          const firstControl = data.controls.find((c: any) => c.id === '3.1.1')
          if (firstControl) {
            console.log('SCTM Page received control 3.1.1:', {
              nistRequirement: firstControl.nistRequirement ? `EXISTS (${firstControl.nistRequirement.length} chars)` : 'UNDEFINED',
              nistDiscussion: firstControl.nistDiscussion ? 'EXISTS' : 'UNDEFINED',
            })
          }
        }
        setControls(data.controls || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching SCTM data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh data after edits
  useEffect(() => {
    const handleRefresh = () => {
      fetchSCTMData()
    }
    window.addEventListener('sctm-updated', handleRefresh)
    return () => window.removeEventListener('sctm-updated', handleRefresh)
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading SCTM data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/compliance"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Compliance Dashboard
          </Link>
          <Link
            href="/admin/compliance/audit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            Run Compliance Audit
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            System Control Traceability Matrix (SCTM)
          </h1>
          <p className="mt-2 text-neutral-600">
            CMMC Level 2 - All 110 NIST SP 800-171 Rev. 2 Controls
          </p>
        </div>

        {summary && (
          <div className="mb-8">
            <SCTMSummary 
              summary={summary} 
              onFamilyClick={(family) => {
                setFamilyFilter(family)
                // Scroll to table and trigger filter
                const tableElement = document.getElementById('sctm-table')
                if (tableElement) {
                  tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
                // Dispatch event to filter table
                window.dispatchEvent(new CustomEvent('sctm-family-filter', { detail: { family } }))
              }}
            />
          </div>
        )}

        <div id="sctm-table">
          <SCTMTable controls={controls} initialFamilyFilter={familyFilter} />
        </div>
      </div>
    </div>
  )
}
