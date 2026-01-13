'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function AuditReadiness() {
  const [readiness, setReadiness] = useState<any[]>([])
  const [selectedReadiness, setSelectedReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadReadiness()
  }, [])

  const loadReadiness = async () => {
    try {
      const response = await fetch('/api/tools/audit-readiness-platform')
      const data = await response.json()
      if (data.success) {
        setReadiness(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load readiness:', err)
    }
  }

  const handleCreateReadiness = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const readinessData = {
      systemId: crypto.randomUUID(),
      auditType: formData.get('auditType'),
      auditDate: formData.get('auditDate'),
    }
    try {
      const response = await fetch('/api/tools/audit-readiness-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readinessData),
      })
      const data = await response.json()
      if (data.success) {
        await loadReadiness()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create readiness assessment:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Audit Readiness Assessment</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateReadiness} submitLabel="Create Assessment" isLoading={loading}>
            <FormField
              label="Audit Type"
              name="auditType"
              type="select"
              required
              options={[
                { value: 'dla', label: 'DLA' },
                { value: 'iso', label: 'ISO' },
                { value: 'fda', label: 'FDA' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
            <FormField
              label="Audit Date"
              name="auditDate"
              type="date"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Audit Readiness Assessments</h2>
        <DataTable
          data={readiness}
          columns={[
            { key: 'auditType', header: 'Audit Type' },
            {
              key: 'readinessScore',
              header: 'Readiness Score',
              render: (item) => `${item.readinessScore}%`,
            },
            {
              key: 'readinessLevel',
              header: 'Level',
              render: (item) => (
                <StatusBadge
                  status={
                    item.readinessLevel === 'ready' ? 'success' :
                    item.readinessLevel === 'mostly-ready' ? 'warning' :
                    item.readinessLevel === 'needs-work' ? 'error' : 'error'
                  }
                >
                  {item.readinessLevel}
                </StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item) => (
                <button
                  onClick={() => setSelectedReadiness(item)}
                  className="text-body-sm text-blue-600 hover:text-blue-800"
                >
                  View Details
                </button>
              ),
            },
          ]}
          emptyMessage="No readiness assessments found. Create your first assessment above."
        />
      </div>

      {selectedReadiness && (
        <div>
          <h2 className="heading-3 mb-4">Assessment Details</h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="space-y-4">
              <div><strong>Readiness Score:</strong> {selectedReadiness.readinessScore}%</div>
              <div><strong>Level:</strong> {selectedReadiness.readinessLevel}</div>
              {selectedReadiness.gaps && selectedReadiness.gaps.length > 0 && (
                <div>
                  <strong>Gaps:</strong>
                  <DataTable
                    data={selectedReadiness.gaps}
                    columns={[
                      { key: 'requirement', header: 'Requirement' },
                      {
                        key: 'currentStatus',
                        header: 'Status',
                        render: (item) => (
                          <StatusBadge
                            status={
                              item.currentStatus === 'compliant' ? 'success' :
                              item.currentStatus === 'non-compliant' ? 'error' : 'warning'
                            }
                          >
                            {item.currentStatus}
                          </StatusBadge>
                        ),
                      },
                      { key: 'priority', header: 'Priority' },
                      { key: 'remediation', header: 'Remediation' },
                    ]}
                  />
                </div>
              )}
              {selectedReadiness.recommendations && selectedReadiness.recommendations.length > 0 && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {selectedReadiness.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="text-body-sm text-neutral-700">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

