'use client'

import { useState, useMemo } from 'react'

interface Control {
  id: string
  requirement: string
  status: 'implemented' | 'inherited' | 'partially_satisfied' | 'not_implemented' | 'not_applicable'
  family: string
  policy: string
  procedure: string
  evidence: string
  implementation: string
  sspSection: string
}

interface SCTMTableProps {
  controls: Control[]
}

const STATUS_LABELS: Record<string, string> = {
  implemented: 'Implemented',
  inherited: 'Inherited',
  partially_satisfied: 'Partially Satisfied',
  not_implemented: 'Not Implemented',
  not_applicable: 'Not Applicable',
}

const STATUS_COLORS: Record<string, string> = {
  implemented: 'bg-green-100 text-green-800',
  inherited: 'bg-blue-100 text-blue-800',
  partially_satisfied: 'bg-yellow-100 text-yellow-800',
  not_implemented: 'bg-red-100 text-red-800',
  not_applicable: 'bg-neutral-100 text-neutral-800',
}

const FAMILY_NAMES: Record<string, string> = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CM: 'Configuration Management',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PS: 'Personnel Security',
  PE: 'Physical Protection',
  RA: 'Risk Assessment',
  SA: 'Security Assessment',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity',
}

type SortField = 'id' | 'requirement' | 'status' | 'family'
type SortDirection = 'asc' | 'desc'

export default function SCTMTable({ controls }: SCTMTableProps) {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [familyFilter, setFamilyFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<SortField>('id')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  // Get unique statuses and families for filters
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(controls.map(c => c.status))
    return Array.from(statuses).sort()
  }, [controls])

  const uniqueFamilies = useMemo(() => {
    const families = new Set(controls.map(c => c.family))
    return Array.from(families).sort()
  }, [controls])

  // Filter and sort controls
  const filteredAndSortedControls = useMemo(() => {
    let filtered = controls.filter(control => {
      // Search filter
      const searchLower = searchText.toLowerCase()
      const matchesSearch =
        control.id.toLowerCase().includes(searchLower) ||
        control.requirement.toLowerCase().includes(searchLower) ||
        control.policy.toLowerCase().includes(searchLower) ||
        control.evidence.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = statusFilter === 'all' || control.status === statusFilter

      // Family filter
      const matchesFamily = familyFilter === 'all' || control.family === familyFilter

      return matchesSearch && matchesStatus && matchesFamily
    })

    // Sort
    filtered.sort((a, b) => {
      if (sortField === 'id') {
        // Parse control ID (e.g., "3.1.1") for numeric sorting
        const aParts = a.id.split('.').map(Number)
        const bParts = b.id.split('.').map(Number)
        for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
          const aNum = aParts[i] || 0
          const bNum = bParts[i] || 0
          if (aNum !== bNum) {
            return sortDirection === 'asc' ? aNum - bNum : bNum - aNum
          }
        }
        return 0
      }

      // For other fields, use string comparison
      let aValue: string
      let bValue: string

      switch (sortField) {
        case 'requirement':
          aValue = a.requirement
          bValue = b.requirement
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'family':
          aValue = a.family
          bValue = b.family
          break
        default:
          return 0
      }

      const comparison = aValue.localeCompare(bValue)
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [controls, searchText, statusFilter, familyFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const exportToCSV = () => {
    const headers = ['Control ID', 'Requirement', 'Status', 'Family', 'Policy', 'Procedure', 'Evidence', 'Implementation', 'SSP Section']
    const rows = filteredAndSortedControls.map(control => [
      control.id,
      control.requirement,
      STATUS_LABELS[control.status],
      control.family,
      control.policy,
      control.procedure,
      control.evidence,
      control.implementation,
      control.sspSection,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sctm-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-neutral-400">↕</span>
    }
    return sortDirection === 'asc' ? <span>↑</span> : <span>↓</span>
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search by ID, requirement, policy, or evidence..."
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Control Family
            </label>
            <select
              value={familyFilter}
              onChange={(e) => setFamilyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Families</option>
              {uniqueFamilies.map(family => (
                <option key={family} value={family}>
                  {family} - {FAMILY_NAMES[family] || family}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-neutral-600">
            Showing {filteredAndSortedControls.length} of {controls.length} controls
          </div>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1">
                    Control ID
                    <SortIcon field="id" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('requirement')}
                >
                  <div className="flex items-center gap-1">
                    Requirement
                    <SortIcon field="requirement" />
                  </div>
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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                  onClick={() => handleSort('family')}
                >
                  <div className="flex items-center gap-1">
                    Family
                    <SortIcon field="family" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Policy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Procedure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Evidence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Implementation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  SSP Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredAndSortedControls.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-neutral-500">
                    No controls found matching your filters
                  </td>
                </tr>
              ) : (
                filteredAndSortedControls.map((control) => (
                  <>
                    <tr
                      key={control.id}
                      className="hover:bg-neutral-50 cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === control.id ? null : control.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                        {control.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 max-w-md">
                        <div className="truncate" title={control.requirement}>
                          {control.requirement}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[control.status]}`}
                        >
                          {STATUS_LABELS[control.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {control.family}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                        <div className="truncate" title={control.policy}>
                          {control.policy}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                        <div className="truncate" title={control.procedure}>
                          {control.procedure}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                        <div className="truncate" title={control.evidence}>
                          {control.evidence}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                        <div className="truncate" title={control.implementation}>
                          {control.implementation}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-600">
                        {control.sspSection}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-600">
                        {expandedRow === control.id ? '▼' : '▶'}
                      </td>
                    </tr>
                    {expandedRow === control.id && (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 bg-neutral-50">
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium text-neutral-700">Full Requirement:</span>
                              <p className="text-sm text-neutral-600 mt-1">{control.requirement}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="font-medium text-neutral-700">Policy:</span>
                                <p className="text-sm text-neutral-600">{control.policy}</p>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-700">Procedure:</span>
                                <p className="text-sm text-neutral-600">{control.procedure}</p>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-700">Evidence:</span>
                                <p className="text-sm text-neutral-600">{control.evidence}</p>
                              </div>
                              <div>
                                <span className="font-medium text-neutral-700">Implementation:</span>
                                <p className="text-sm text-neutral-600">{control.implementation}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
