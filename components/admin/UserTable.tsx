'use client'

import { useState, useMemo } from 'react'
import UserActions from './UserActions'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  disabled: boolean
  lastLoginAt: Date | null
  createdAt: Date
  securityAcknowledgmentAcceptedAt: Date | null
}

interface UserTableProps {
  users: User[]
}

type SortField = 'email' | 'name' | 'role' | 'lastLoginAt' | 'createdAt' | 'status'
type SortDirection = 'asc' | 'desc'

export default function UserTable({ users }: UserTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const formatDate = (date: Date | null) => {
    if (!date) return "Never"
    return new Date(date).toLocaleString()
  }

  const formatRelativeTime = (date: Date | null) => {
    if (!date) return "Never"
    const now = new Date()
    const then = new Date(date)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-neutral-400">↕</span>
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'active' && !user.disabled) ||
        (statusFilter === 'disabled' && user.disabled)

      return matchesSearch && matchesRole && matchesStatus
    })

    // Sort users
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortField === 'status') {
        aValue = a.disabled ? 1 : 0
        bValue = b.disabled ? 1 : 0
      } else if (sortField === 'lastLoginAt') {
        aValue = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0
        bValue = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0
      } else if (sortField === 'createdAt') {
        aValue = new Date(a.createdAt).getTime()
        bValue = new Date(b.createdAt).getTime()
      } else if (sortField === 'email') {
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
      } else if (sortField === 'name') {
        aValue = (a.name || '').toLowerCase()
        bValue = (b.name || '').toLowerCase()
      } else {
        aValue = a.role
        bValue = b.role
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-neutral-50 rounded-lg">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
        >
          <option value="all">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="disabled">Disabled</option>
        </select>
        <div className="text-sm text-neutral-600">
          Showing {filteredAndSortedUsers.length} of {users.length} users
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center gap-1">
                  Email
                  <SortIcon field="email" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center gap-1">
                  Role
                  <SortIcon field="role" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('lastLoginAt')}
              >
                <div className="flex items-center gap-1">
                  Last Login
                  <SortIcon field="lastLoginAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Security Ack
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon field="status" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            {filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-neutral-500">
                  No users found matching your filters
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`transition-colors ${
                    user.disabled 
                      ? "bg-red-50 hover:bg-red-100" 
                      : "hover:bg-neutral-50"
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                    {user.name || <span className="text-neutral-400">-</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                    <div className="flex flex-col">
                      <span>{formatRelativeTime(user.lastLoginAt)}</span>
                      {user.lastLoginAt && (
                        <span className="text-xs text-neutral-400">
                          {formatDate(user.lastLoginAt)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.securityAcknowledgmentAcceptedAt ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        ✓ Accepted
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        ⚠ Required
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.disabled ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Disabled
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <UserActions 
                      user={{
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        disabled: user.disabled,
                        name: user.name,
                        lastLoginAt: user.lastLoginAt,
                        createdAt: user.createdAt,
                        securityAcknowledgmentAcceptedAt: user.securityAcknowledgmentAcceptedAt,
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
