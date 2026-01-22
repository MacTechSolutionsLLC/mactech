'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface EventFiltersProps {
  initialFilters?: {
    startDate?: string
    endDate?: string
    actionType?: string
    actorUserId?: string
    success?: string
  }
}

export default function EventFilters({ initialFilters = {} }: EventFiltersProps) {
  const router = useRouter()
  const [filters, setFilters] = useState({
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    actionType: initialFilters.actionType || '',
    actorUserId: initialFilters.actorUserId || '',
    success: initialFilters.success || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (filters.startDate) params.set('startDate', filters.startDate)
    if (filters.endDate) params.set('endDate', filters.endDate)
    if (filters.actionType) params.set('actionType', filters.actionType)
    if (filters.actorUserId) params.set('actorUserId', filters.actorUserId)
    if (filters.success) params.set('success', filters.success)
    
    router.push(`/admin/events?${params.toString()}`)
  }

  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      actionType: '',
      actorUserId: '',
      success: '',
    })
    router.push('/admin/events')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Action Type
          </label>
          <select
            value={filters.actionType}
            onChange={(e) => setFilters({ ...filters, actionType: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="login_failed">Login Failed</option>
            <option value="logout">Logout</option>
            <option value="user_create">User Create</option>
            <option value="user_disable">User Disable</option>
            <option value="user_enable">User Enable</option>
            <option value="role_change">Role Change</option>
            <option value="password_change">Password Change</option>
            <option value="file_upload">File Upload</option>
            <option value="file_download">File Download</option>
            <option value="admin_action">Admin Action</option>
            <option value="permission_denied">Permission Denied</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Success
          </label>
          <select
            value={filters.success}
            onChange={(e) => setFilters({ ...filters, success: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            User ID
          </label>
          <input
            type="text"
            value={filters.actorUserId}
            onChange={(e) => setFilters({ ...filters, actorUserId: e.target.value })}
            placeholder="Filter by user ID"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 font-medium"
        >
          Reset
        </button>
      </div>
    </form>
  )
}
