'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function ISOCompliance() {
  const [programs, setPrograms] = useState<any[]>([])
  const [gaps, setGaps] = useState<any[]>([])
  const [readiness, setReadiness] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadPrograms()
  }, [])

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/tools/iso-compliance-platform')
      const data = await response.json()
      if (data.success) {
        setPrograms(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load programs:', err)
    }
  }

  const handleCreateProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const programData = {
      organizationId: crypto.randomUUID(),
      standard: formData.get('standard'),
      scope: formData.get('scope'),
    }
    try {
      const response = await fetch('/api/tools/iso-compliance-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(programData),
      })
      const data = await response.json()
      if (data.success) {
        await loadPrograms()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create program:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleIdentifyGaps = async (programId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/iso-compliance-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, pathname: '/gaps' }),
      })
      const data = await response.json()
      if (data.success) {
        setGaps(data.data || [])
      }
    } catch (err) {
      console.error('Failed to identify gaps:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckReadiness = async (programId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/tools/iso-compliance-platform?pathname=/readiness&programId=${programId}`)
      const data = await response.json()
      if (data.success) {
        setReadiness(data.data)
      }
    } catch (err) {
      console.error('Failed to check readiness:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create ISO Compliance Program</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateProgram} submitLabel="Create Program" isLoading={loading}>
            <FormField
              label="Standard"
              name="standard"
              type="select"
              required
              options={[
                { value: 'iso17025', label: 'ISO 17025' },
                { value: 'iso9001', label: 'ISO 9001' },
              ]}
            />
            <FormField
              label="Scope"
              name="scope"
              type="textarea"
              placeholder="Describe the scope of the compliance program"
              required
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Compliance Programs</h2>
        <DataTable
          data={programs}
          columns={[
            { key: 'standard', header: 'Standard' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'active' ? 'success' :
                    item.status === 'non-compliant' ? 'error' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleIdentifyGaps(item.id)}
                    className="text-body-sm text-blue-600 hover:text-blue-800"
                  >
                    Identify Gaps
                  </button>
                  <button
                    onClick={() => handleCheckReadiness(item.id)}
                    className="text-body-sm text-green-600 hover:text-green-800"
                  >
                    Check Readiness
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No compliance programs found. Create your first program above."
        />
      </div>

      {gaps.length > 0 && (
        <div>
          <h2 className="heading-3 mb-4">Compliance Gaps</h2>
          <DataTable
            data={gaps}
            columns={[
              { key: 'requirement', header: 'Requirement' },
              { key: 'clause', header: 'Clause' },
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

      {readiness && (
        <div>
          <h2 className="heading-3 mb-4">Audit Readiness</h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="space-y-2">
              <div><strong>Readiness Score:</strong> {readiness.score}%</div>
              <div><strong>Level:</strong> {readiness.level}</div>
              {readiness.recommendations && readiness.recommendations.length > 0 && (
                <div className="mt-4">
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {readiness.recommendations.map((rec: string, idx: number) => (
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

