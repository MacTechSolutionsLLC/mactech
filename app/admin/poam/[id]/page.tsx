'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import AdminNavigation from '@/components/admin/AdminNavigation'

interface POAMItem {
  id: string
  poamId: string
  controlId: string
  title: string
  description: string
  affectedControls: string
  status: string
  priority: string
  responsibleParty: string
  targetCompletionDate: string | null
  actualCompletionDate: string | null
  plannedRemediation: string
  milestones: string
  notes: string | null
  createdAt: string
  updatedAt: string
  verifiedBy: string | null
  verifiedAt: string | null
  evidence: string | null
}

export default function POAMDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [item, setItem] = useState<POAMItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [poamIdError, setPoamIdError] = useState<string | null>(null)
  const [checkingPoamId, setCheckingPoamId] = useState(false)
  const [formData, setFormData] = useState({
    poamId: '',
    controlId: '',
    title: '',
    description: '',
    status: '',
    priority: '',
    responsibleParty: '',
    targetCompletionDate: '',
    notes: '',
    evidence: '',
  })
  const [affectedControls, setAffectedControls] = useState<string[]>([])
  const [plannedRemediation, setPlannedRemediation] = useState<string[]>([])
  const [milestones, setMilestones] = useState<Array<{ text: string; completed: boolean }>>([])

  useEffect(() => {
    fetchItem()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchItem = async () => {
    try {
      const res = await fetch(`/api/admin/poam/${id}`)
      const data = await res.json()
      if (data.item) {
        setItem(data.item)
        setFormData({
          poamId: data.item.poamId || '',
          controlId: data.item.controlId || '',
          title: data.item.title || '',
          description: data.item.description || '',
          status: data.item.status,
          priority: data.item.priority,
          responsibleParty: data.item.responsibleParty,
          targetCompletionDate: data.item.targetCompletionDate
            ? new Date(data.item.targetCompletionDate).toISOString().split('T')[0]
            : '',
          notes: data.item.notes || '',
          evidence: data.item.evidence || '',
        })
        try {
          const parsedAffectedControls = JSON.parse(data.item.affectedControls || '[]')
          setAffectedControls(Array.isArray(parsedAffectedControls) ? parsedAffectedControls : [])
        } catch {
          setAffectedControls([])
        }
        try {
          const parsedPlannedRemediation = JSON.parse(data.item.plannedRemediation || '[]')
          setPlannedRemediation(Array.isArray(parsedPlannedRemediation) ? parsedPlannedRemediation : [])
        } catch {
          setPlannedRemediation([])
        }
        try {
          const parsedMilestones = JSON.parse(data.item.milestones || '[]')
          setMilestones(parsedMilestones)
        } catch {
          setMilestones([])
        }
      }
    } catch (error) {
      console.error('Error fetching POA&M item:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPoamIdUniqueness = async (poamId: string) => {
    if (!poamId || poamId === item?.poamId) {
      setPoamIdError(null)
      return true
    }

    setCheckingPoamId(true)
    try {
      const res = await fetch(`/api/admin/poam/check-id?poamId=${encodeURIComponent(poamId)}&excludeId=${id}`)
      const data = await res.json()
      if (data.available) {
        setPoamIdError(null)
        return true
      } else {
        setPoamIdError('POA&M ID already exists')
        return false
      }
    } catch (error) {
      console.error('Error checking POA&M ID:', error)
      setPoamIdError('Error checking POA&M ID availability')
      return false
    } finally {
      setCheckingPoamId(false)
    }
  }

  const handlePoamIdChange = async (value: string) => {
    setFormData({ ...formData, poamId: value })
    if (value) {
      await checkPoamIdUniqueness(value)
    } else {
      setPoamIdError(null)
    }
  }

  const handleSave = async () => {
    // Validate required fields
    if (!formData.poamId || !formData.controlId || !formData.title || !formData.description) {
      alert('Please fill in all required fields: POA&M ID, Control ID, Title, and Description')
      return
    }

    // Check POA&M ID uniqueness if it changed
    if (formData.poamId !== item?.poamId) {
      const isUnique = await checkPoamIdUniqueness(formData.poamId)
      if (!isUnique) {
        alert('POA&M ID is not available. Please choose a different ID.')
        return
      }
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/poam/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          affectedControls,
          plannedRemediation,
          milestones,
          targetCompletionDate: formData.targetCompletionDate || null,
          evidence: formData.evidence || null,
        }),
      })

      if (res.ok) {
        await fetchItem()
        setEditing(false)
        setPoamIdError(null)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update POA&M item')
      }
    } catch (error) {
      console.error('Error updating POA&M item:', error)
      alert('Failed to update POA&M item')
    } finally {
      setSaving(false)
    }
  }

  const handleVerify = async () => {
    if (!confirm('Mark this POA&M item as verified?')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/poam/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: true }),
      })

      if (res.ok) {
        await fetchItem()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to verify POA&M item')
      }
    } catch (error) {
      console.error('Error verifying POA&M item:', error)
      alert('Failed to verify POA&M item')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = async () => {
    if (!confirm('Close this POA&M item? This will mark it as completed and closed.')) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/poam/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'closed',
          actualCompletionDate: new Date().toISOString(),
        }),
      })

      if (res.ok) {
        await fetchItem()
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to close POA&M item')
      }
    } catch (error) {
      console.error('Error closing POA&M item:', error)
      alert('Failed to close POA&M item')
    } finally {
      setSaving(false)
    }
  }

  const calculateProgress = () => {
    if (milestones.length === 0) return 0
    const completed = milestones.filter(m => m.completed).length
    return Math.round((completed / milestones.length) * 100)
  }

  const progress = calculateProgress()

  const toggleMilestone = (index: number) => {
    const updated = [...milestones]
    updated[index].completed = !updated[index].completed
    setMilestones(updated)
    
    // Auto-save milestone changes
    handleSaveMilestones(updated)
  }

  const handleSaveMilestones = async (updatedMilestones: Array<{ text: string; completed: boolean }>) => {
    try {
      await fetch(`/api/admin/poam/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          milestones: updatedMilestones,
        }),
      })
    } catch (error) {
      console.error('Error saving milestone:', error)
    }
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-gray-100 text-gray-800',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-700 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading POA&M item...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <AdminNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-neutral-600">POA&M item not found</p>
            <Link href="/admin/poam" className="text-accent-600 hover:text-accent-900 mt-4 inline-block">
              ← Back to POA&M Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/admin/poam"
            className="text-accent-600 hover:text-accent-900 text-sm font-medium mb-4 inline-block"
          >
            ← Back to POA&M Dashboard
          </Link>
          <div className="flex items-center justify-between mt-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">{item.poamId}</h1>
              <p className="mt-2 text-neutral-600">{item.title}</p>
            </div>
            <div className="flex gap-3">
              {item.status !== 'closed' && (
                <>
                  {item.status === 'verified' && (
                    <button
                      onClick={handleClose}
                      disabled={saving}
                      className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 font-medium disabled:opacity-50"
                    >
                      Close POA&M
                    </button>
                  )}
                  {item.status !== 'verified' && item.status !== 'closed' && (
                    <button
                      onClick={handleVerify}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                    >
                      Mark as Verified
                    </button>
                  )}
                </>
              )}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 font-medium"
                >
                  Edit
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditing(false)
                      fetchItem()
                    }}
                    className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-accent-700 text-white rounded-lg hover:bg-accent-800 font-medium disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Details</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      POA&M ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.poamId}
                      onChange={(e) => handlePoamIdChange(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 ${
                        poamIdError ? 'border-red-300' : 'border-neutral-300'
                      }`}
                      placeholder="POAM-001"
                      disabled={checkingPoamId}
                    />
                    {checkingPoamId && (
                      <p className="mt-1 text-xs text-neutral-500">Checking availability...</p>
                    )}
                    {poamIdError && (
                      <p className="mt-1 text-xs text-red-600">{poamIdError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Control ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.controlId}
                      onChange={(e) => setFormData({ ...formData, controlId: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="3.1.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="POA&M item title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      placeholder="Detailed description of the POA&M item"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Affected Controls
                    </label>
                    <div className="space-y-2">
                      {affectedControls.map((control, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={control}
                            onChange={(e) => {
                              const updated = [...affectedControls]
                              updated[index] = e.target.value
                              setAffectedControls(updated)
                            }}
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                            placeholder="3.1.1"
                          />
                          <button
                            type="button"
                            onClick={() => setAffectedControls(affectedControls.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAffectedControls([...affectedControls, ''])}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
                      >
                        + Add Control
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <dl className="grid grid-cols-1 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">POA&M ID</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{item.poamId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Control ID</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{item.controlId}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Title</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{item.title}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Description</dt>
                    <dd className="mt-1 text-sm text-neutral-900 whitespace-pre-wrap">{item.description}</dd>
                  </div>
                  {affectedControls.length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">Affected Controls</dt>
                      <dd className="mt-1 text-sm text-neutral-900">
                        {affectedControls.join(', ')}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            {/* Planned Remediation */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Planned Remediation</h2>
              {editing ? (
                <div className="space-y-2">
                  {plannedRemediation.map((step, index) => (
                    <div key={index} className="flex gap-2">
                      <textarea
                        value={step}
                        onChange={(e) => {
                          const updated = [...plannedRemediation]
                          updated[index] = e.target.value
                          setPlannedRemediation(updated)
                        }}
                        rows={2}
                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                        placeholder="Remediation step"
                      />
                      <button
                        type="button"
                        onClick={() => setPlannedRemediation(plannedRemediation.filter((_, i) => i !== index))}
                        className="px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 self-start"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPlannedRemediation([...plannedRemediation, ''])}
                    className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 text-sm"
                  >
                    + Add Step
                  </button>
                </div>
              ) : (
                <div>
                  {plannedRemediation.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2 text-sm text-neutral-700">
                      {plannedRemediation.map((step: string, index: number) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-neutral-500">No planned remediation steps defined</p>
                  )}
                </div>
              )}
            </div>

            {/* Body of Evidence - Only show for closed/verified POA&Ms */}
            {(item.status === 'closed' || item.status === 'verified') && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Body of Evidence</h2>
                {editing ? (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Evidence Documentation
                    </label>
                    <textarea
                      value={formData.evidence}
                      onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
                      rows={12}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 font-mono text-sm"
                      placeholder="Document the evidence that demonstrates this POA&M has been remediated and verified. Include:
- Implementation details
- Testing results
- Verification methods
- Related documentation references
- Screenshots or artifacts (if applicable)"
                    />
                    <p className="mt-2 text-xs text-neutral-500">
                      This evidence will be used to demonstrate compliance and closure of this POA&M item.
                    </p>
                  </div>
                ) : (
                  <div>
                    {item.evidence ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-neutral-700 bg-neutral-50 p-4 rounded-lg border border-neutral-200 font-sans">
                          {item.evidence}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500 italic bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                        No evidence documented yet. Click Edit to add evidence documentation.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Milestones */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Milestones</h2>
                {milestones.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-600">
                      Progress: {progress}%
                    </span>
                    <div className="w-32 bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          progress === 100
                            ? 'bg-green-500'
                            : progress >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              {milestones.length === 0 ? (
                <p className="text-sm text-neutral-500">No milestones defined</p>
              ) : editing ? (
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => toggleMilestone(index)}
                        className="w-5 h-5 text-accent-600 border-neutral-300 rounded focus:ring-accent-500"
                      />
                      <span className={`text-sm ${milestone.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                        {milestone.text}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {milestones.map((milestone, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={milestone.completed}
                        onChange={() => toggleMilestone(index)}
                        disabled={item.status === 'closed'}
                        className="w-5 h-5 text-accent-600 border-neutral-300 rounded focus:ring-accent-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={`text-sm ${milestone.completed ? 'line-through text-neutral-500' : 'text-neutral-900'}`}>
                        {milestone.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Summary */}
            {milestones.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Progress Summary</h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">Overall Progress</span>
                      <span className="text-sm font-semibold text-neutral-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progress === 100
                            ? 'bg-green-500'
                            : progress >= 50
                            ? 'bg-blue-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600">
                    {milestones.filter(m => m.completed).length} of {milestones.length} milestones completed
                  </div>
                </div>
              </div>
            )}

            {/* Status & Priority */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Status & Priority</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-2">Status</div>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                        item.status
                      )}`}
                    >
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-neutral-500 mb-2">Priority</div>
                    <span
                      className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getPriorityBadgeColor(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Assignment & Dates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Assignment & Dates</h2>
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Responsible Party
                    </label>
                    <input
                      type="text"
                      value={formData.responsibleParty}
                      onChange={(e) => setFormData({ ...formData, responsibleParty: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.targetCompletionDate}
                      onChange={(e) => setFormData({ ...formData, targetCompletionDate: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                    />
                  </div>
                </div>
              ) : (
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Responsible Party</dt>
                    <dd className="mt-1 text-sm text-neutral-900">{item.responsibleParty}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-neutral-500">Target Completion Date</dt>
                    <dd className="mt-1 text-sm text-neutral-900">
                      {item.targetCompletionDate
                        ? new Date(item.targetCompletionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Not set'}
                    </dd>
                  </div>
                  {item.actualCompletionDate && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">Actual Completion Date</dt>
                      <dd className="mt-1 text-sm text-neutral-900">
                        {new Date(item.actualCompletionDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                  )}
                  {item.verifiedAt && (
                    <div>
                      <dt className="text-sm font-medium text-neutral-500">Verified At</dt>
                      <dd className="mt-1 text-sm text-neutral-900">
                        {new Date(item.verifiedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </dd>
                    </div>
                  )}
                </dl>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Notes</h2>
              {editing ? (
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                  placeholder="Add notes about this POA&M item..."
                />
              ) : (
                <p className="text-sm text-neutral-700 whitespace-pre-wrap">
                  {item.notes || 'No notes'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
