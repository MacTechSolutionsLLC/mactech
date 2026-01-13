'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function RMFArtifacts() {
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadArtifacts()
  }, [])

  const loadArtifacts = async () => {
    try {
      const response = await fetch('/api/tools/rmf-artifacts')
      const data = await response.json()
      if (data.success) {
        setArtifacts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load artifacts:', err)
    }
  }

  const handleGenerateArtifact = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const artifactData = {
      artifactType: formData.get('artifactType'),
      systemId: formData.get('systemId') || crypto.randomUUID(),
      systemName: formData.get('systemName'),
    }
    try {
      const response = await fetch('/api/tools/rmf-artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(artifactData),
      })
      const data = await response.json()
      if (data.success) {
        await loadArtifacts()
        setSelectedArtifact(data.data)
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to generate artifact:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (artifactId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/rmf-artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: artifactId, pathname: '/validate' }),
      })
      const data = await response.json()
      if (data.success) {
        setValidation(data.data)
      }
    } catch (err) {
      console.error('Failed to validate artifact:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Generate RMF Artifact</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleGenerateArtifact} submitLabel="Generate Artifact" isLoading={loading}>
            <FormField
              label="Artifact Type"
              name="artifactType"
              type="select"
              required
              options={[
                { value: 'ssp', label: 'SSP (System Security Plan)' },
                { value: 'rar', label: 'RAR (Risk Assessment Report)' },
                { value: 'poam', label: 'POA&M (Plan of Action and Milestones)' },
                { value: 'conmon', label: 'CONMON (Continuous Monitoring Strategy)' },
              ]}
            />
            <FormField
              label="System Name"
              name="systemName"
              type="text"
              placeholder="Production Web Application"
              required
            />
            <FormField
              label="System ID"
              name="systemId"
              type="text"
              placeholder="Leave blank to generate new"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Generated Artifacts</h2>
        <DataTable
          data={artifacts}
          columns={[
            { key: 'artifactType', header: 'Type' },
            { key: 'systemName', header: 'System' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'delivered' ? 'success' :
                    item.status === 'approved' ? 'success' :
                    item.status === 'review' ? 'warning' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'qualityScore',
              header: 'Quality Score',
              render: (item) => item.qualityScore ? `${item.qualityScore}%` : 'N/A',
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedArtifact(item)}
                    className="text-body-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleValidate(item.id)}
                    className="text-body-sm text-green-600 hover:text-green-800"
                    disabled={loading}
                  >
                    Validate
                  </button>
                </div>
              ),
            },
          ]}
          emptyMessage="No artifacts generated yet. Create your first artifact above."
        />
      </div>

      {validation && (
        <div>
          <h2 className="heading-3 mb-4">Validation Results</h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="space-y-4">
              <div>
                <StatusBadge status={validation.valid ? 'success' : 'error'}>
                  {validation.valid ? 'Valid' : 'Invalid'}
                </StatusBadge>
              </div>
              <div><strong>Quality Score:</strong> {validation.qualityScore}%</div>
              <div><strong>Completeness Score:</strong> {validation.completenessScore}%</div>
              {validation.errors && validation.errors.length > 0 && (
                <div>
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validation.errors.map((err: any, idx: number) => (
                      <li key={idx} className="text-body-sm text-red-700">{err.section}: {err.message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validation.recommendations && validation.recommendations.length > 0 && (
                <div>
                  <strong>Recommendations:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {validation.recommendations.map((rec: string, idx: number) => (
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

