'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'

interface POAMItem {
  id: string
  poamId: string
  controlId: string
  title: string
  description: string
  status: string
  priority: string
  responsibleParty: string
  targetCompletionDate: string | null
  actualCompletionDate: string | null
  milestones: string
  createdAt: string
  updatedAt: string
}

interface POAMStats {
  totalItems: number
  statusBreakdown: Record<string, number>
  priorityBreakdown: Record<string, number>
  controlFamilyCounts: Record<string, number>
  overdueItems: number
  itemsDueSoon: number
}

function POAMContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [items, setItems] = useState<POAMItem[]>([])
  const [stats, setStats] = useState<POAMStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [updatingAllStatuses, setUpdatingAllStatuses] = useState(false)
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    controlId: searchParams.get('controlId') || '',
  })

  useEffect(() => {
    fetchPOAMData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const fetchPOAMData = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.priority !== 'all') params.append('priority', filters.priority)
      if (filters.controlId) params.append('controlId', filters.controlId)

      const [itemsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/poam?${params.toString()}`),
        fetch('/api/admin/poam/stats'),
      ])

      const itemsData = await itemsRes.json()
      const statsData = await statsRes.json()

      setItems(itemsData.items || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error fetching POA&M data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.append(k, v)
    })
    router.push(`/admin/poam?${params.toString()}`)
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      remediated: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      closed: 'bg-neutral-100 text-neutral-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const calculateProgress = (milestones: string) => {
    try {
      const parsed = JSON.parse(milestones || '[]')
      if (parsed.length === 0) return null
      const completed = parsed.filter((m: any) => m.completed).length
      return Math.round((completed / parsed.length) * 100)
    } catch {
      return null
    }
  }

  const handleQuickStatusUpdate = async (itemId: string, newStatus: string) => {
    setUpdatingStatus(itemId)
    try {
      const res = await fetch(`/api/admin/poam/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          ...(newStatus === 'closed' && { actualCompletionDate: new Date().toISOString() }),
        }),
      })

      if (res.ok) {
        await fetchPOAMData()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleUpdateAllStatuses = async () => {
    if (!confirm('Update all POA&M statuses based on current SCTM implementation status? This will sync POA&M items with the actual control implementation status.')) {
      return
    }

    setUpdatingAllStatuses(true)
    try {
      const res = await fetch('/api/admin/poam/update-statuses', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        alert(`Successfully updated ${data.updates.length} POA&M items. ${data.specialUpdates.length > 0 ? `\n\nSpecial updates:\n${data.specialUpdates.join('\n')}` : ''}`)
        await fetchPOAMData()
      } else {
        alert(data.error || 'Failed to update POA&M statuses')
      }
    } catch (error) {
      console.error('Error updating all statuses:', error)
      alert('Failed to update POA&M statuses')
    } finally {
      setUpdatingAllStatuses(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">POA&M Dashboard</h1>
              <p className="mt-2 text-neutral-600">
                Plan of Action and Milestones for CMMC Level 2 controls
              </p>
            </div>
            <button
              onClick={handleUpdateAllStatuses}
              disabled={updatingAllStatuses}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {updatingAllStatuses ? 'Updating...' : 'Sync with SCTM'}
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">Total Items</div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">{stats.totalItems}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">Open Items</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {stats.statusBreakdown.open || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">In Progress</div>
              <div className="text-2xl font-bold text-indigo-600 mt-1">
                {stats.statusBreakdown.in_progress || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">Closed</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {stats.statusBreakdown.closed || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">Overdue</div>
              <div className="text-2xl font-bold text-red-600 mt-1">{stats.overdueItems}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-neutral-600">Due Soon</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.itemsDueSoon}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="remediated">Remediated</option>
                <option value="verified">Verified</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Control ID
              </label>
              <input
                type="text"
                value={filters.controlId}
                onChange={(e) => handleFilterChange('controlId', e.target.value)}
                placeholder="e.g., 3.2.2"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>
        </div>

        {/* POA&M Items Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-700 mx-auto"></div>
              <p className="mt-2 text-neutral-600">Loading POA&M items...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-neutral-600">
              No POA&M items found matching the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      POA&M ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Control
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Responsible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Target Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {item.poamId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {item.controlId}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900">
                        <div className="max-w-md truncate" title={item.title}>
                          {item.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {updatingStatus === item.id ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-700"></div>
                            <span className="text-xs text-neutral-500">Updating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                item.status
                              )}`}
                            >
                              {item.status.replace('_', ' ')}
                            </span>
                            {item.status !== 'closed' && (
                              <select
                                value={item.status}
                                onChange={(e) => handleQuickStatusUpdate(item.id, e.target.value)}
                                className="text-xs border border-neutral-300 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-accent-500 focus:border-accent-500 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="remediated">Remediated</option>
                                <option value="verified">Verified</option>
                                <option value="closed">Close</option>
                              </select>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {item.responsibleParty}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {(() => {
                          const date = item.targetCompletionDate
                          if (!date) return 'Not set'
                          const targetDate = new Date(date)
                          const today = new Date()
                          const isOverdue = targetDate < today && !['closed', 'verified'].includes(item.status)
                          return (
                            <div className="flex items-center gap-2">
                              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                {formatDate(date)}
                              </span>
                              {isOverdue && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                                  Overdue
                                </span>
                              )}
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const progress = calculateProgress(item.milestones)
                          if (progress === null) {
                            return <span className="text-xs text-neutral-400">N/A</span>
                          }
                          return (
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-neutral-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    progress === 100
                                      ? 'bg-green-500'
                                      : progress >= 50
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-neutral-600 w-10">
                                {progress}%
                              </span>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/admin/poam/${item.id}`}
                          className="text-accent-600 hover:text-accent-900"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function POAMPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading POA&M dashboard...</p>
          </div>
        </div>
      </div>
    }>
      <POAMContent />
    </Suspense>
  )
}
