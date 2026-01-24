'use client'

import React, { useState, useMemo, useEffect } from 'react'
import ControlDetail from './ControlDetail'

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

interface AuditResult {
  controlId: string
  verifiedStatus: string
  verificationStatus: 'verified' | 'discrepancy' | 'needs_review'
  issues: string[]
  evidence: {
    policies: any[]
    procedures: any[]
    evidenceFiles: any[]
    implementationFiles: any[]
    codeVerification: any[]
  }
  complianceScore: number
  lastVerified: Date
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
  const [auditResults, setAuditResults] = useState<Record<string, AuditResult>>({})
  const [loadingAudits, setLoadingAudits] = useState<Set<string>>(new Set())
  const [editingControl, setEditingControl] = useState<string | null>(null)
  const [savingControl, setSavingControl] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Record<string, Partial<Control>>>({})

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

  const loadAuditResult = async (controlId: string) => {
    if (auditResults[controlId] || loadingAudits.has(controlId)) {
      return
    }

    setLoadingAudits(prev => new Set(prev).add(controlId))
    try {
      const response = await fetch(`/api/compliance/audit/${encodeURIComponent(controlId)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.auditResult) {
          setAuditResults(prev => ({
            ...prev,
            [controlId]: data.auditResult
          }))
        }
      }
    } catch (error) {
      console.error(`Failed to load audit for control ${controlId}:`, error)
    } finally {
      setLoadingAudits(prev => {
        const next = new Set(prev)
        next.delete(controlId)
        return next
      })
    }
  }

  const handleRowClick = (controlId: string, event?: React.MouseEvent) => {
    // Don't expand if clicking on edit button or in edit mode
    if (event && (event.target as HTMLElement).closest('button, input, select, textarea')) {
      return
    }
    if (editingControl === controlId) {
      return
    }
    if (expandedRow === controlId) {
      setExpandedRow(null)
    } else {
      setExpandedRow(controlId)
      loadAuditResult(controlId)
    }
  }

  const handleEditClick = (control: Control, event: React.MouseEvent) => {
    event.stopPropagation()
    setEditingControl(control.id)
    setEditFormData({
      [control.id]: {
        status: control.status,
        policy: control.policy,
        procedure: control.procedure,
        evidence: control.evidence,
        implementation: control.implementation,
        sspSection: control.sspSection,
      },
    })
  }

  const handleCancelEdit = (controlId: string) => {
    setEditingControl(null)
    setEditFormData(prev => {
      const updated = { ...prev }
      delete updated[controlId]
      return updated
    })
  }

  const handleSaveEdit = async (control: Control) => {
    setSavingControl(control.id)
    try {
      const formData = editFormData[control.id]
      if (!formData) {
        return
      }

      const response = await fetch(`/api/admin/compliance/sctm/${encodeURIComponent(control.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        // Trigger refresh event for parent component
        window.dispatchEvent(new Event('sctm-updated'))
        setEditingControl(null)
        setEditFormData(prev => {
          const updated = { ...prev }
          delete updated[control.id]
          return updated
        })
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update control')
      }
    } catch (error) {
      console.error('Error updating control:', error)
      alert('Failed to update control')
    } finally {
      setSavingControl(null)
    }
  }

  const updateEditField = (controlId: string, field: keyof Control, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [controlId]: {
        ...prev[controlId],
        [field]: value,
      },
    }))
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
                  Actions
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
                filteredAndSortedControls.map((control) => {
                  const isEditing = editingControl === control.id
                  const formData = editFormData[control.id] || {}
                  
                  return (
                    <React.Fragment key={control.id}>
                      <tr
                        key={control.id}
                        className={`hover:bg-neutral-50 ${isEditing ? 'bg-blue-50' : ''} ${!isEditing ? 'cursor-pointer' : ''}`}
                        onClick={(e) => !isEditing && handleRowClick(control.id, e)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                          {control.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-900 max-w-md">
                          <div className="truncate" title={control.requirement}>
                            {control.requirement}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <select
                              value={formData.status || control.status}
                              onChange={(e) => updateEditField(control.id, 'status', e.target.value)}
                              className="px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            >
                              <option value="implemented">✅ Implemented</option>
                              <option value="inherited">🔄 Inherited</option>
                              <option value="partially_satisfied">⚠️ Partially Satisfied</option>
                              <option value="not_implemented">❌ Not Implemented</option>
                              <option value="not_applicable">🚫 Not Applicable</option>
                            </select>
                          ) : (
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[control.status]}`}
                            >
                              {STATUS_LABELS[control.status]}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                          {control.family}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.policy || control.policy}
                              onChange={(e) => updateEditField(control.id, 'policy', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            />
                          ) : (
                            <div className="truncate" title={control.policy}>
                              {control.policy}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.procedure || control.procedure}
                              onChange={(e) => updateEditField(control.id, 'procedure', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            />
                          ) : (
                            <div className="truncate" title={control.procedure}>
                              {control.procedure}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <textarea
                              value={formData.evidence || control.evidence}
                              onChange={(e) => updateEditField(control.id, 'evidence', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            />
                          ) : (
                            <div className="truncate" title={control.evidence}>
                              {control.evidence}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <textarea
                              value={formData.implementation || control.implementation}
                              onChange={(e) => updateEditField(control.id, 'implementation', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            />
                          ) : (
                            <div className="truncate" title={control.implementation}>
                              {control.implementation}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-600" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <input
                              type="text"
                              value={formData.sspSection || control.sspSection}
                              onChange={(e) => updateEditField(control.id, 'sspSection', e.target.value)}
                              className="w-full px-2 py-1 text-xs border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
                              disabled={savingControl === control.id}
                            />
                          ) : (
                            control.sspSection
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveEdit(control)}
                                disabled={savingControl === control.id}
                                className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                              >
                                {savingControl === control.id ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => handleCancelEdit(control.id)}
                                disabled={savingControl === control.id}
                                className="px-2 py-1 bg-neutral-600 text-white text-xs rounded hover:bg-neutral-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => handleEditClick(control, e)}
                                className="px-2 py-1 bg-primary-600 text-white text-xs rounded hover:bg-primary-700"
                              >
                                Edit
                              </button>
                              <span className="text-primary-600">
                                {expandedRow === control.id ? '▼' : '▶'}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    {expandedRow === control.id && !isEditing && (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 bg-neutral-50">
                          {loadingAudits.has(control.id) ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="text-sm text-neutral-500">Loading audit results...</div>
                            </div>
                          ) : (
                            <ControlDetail
                              control={control}
                              auditResult={auditResults[control.id]}
                            />
                          )}
                        </td>
                      </tr>
                    )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
