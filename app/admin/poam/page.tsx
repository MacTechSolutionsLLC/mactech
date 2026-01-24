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
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || 'all',
    priority: searchParams.get('priority') || 'all',
    controlId: searchParams.get('controlId') || '',
  })

  useEffect(() => {
    fetchPOAMData()
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

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">POA&M Dashboard</h1>
          <p className="mt-2 text-neutral-600">
            Plan of Action and Milestones for CMMC Level 2 controls
          </p>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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
              <div className="text-sm font-medium text-neutral-600">High Priority</div>
              <div className="text-2xl font-bold text-orange-600 mt-1">
                {(stats.priorityBreakdown.high || 0) + (stats.priorityBreakdown.critical || 0)}
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                            item.status
                          )}`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
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
                        {formatDate(item.targetCompletionDate)}
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
