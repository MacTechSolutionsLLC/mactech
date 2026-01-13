'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function EvidenceCollection() {
  const [evidence, setEvidence] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEvidence()
    loadPackages()
  }, [])

  const loadEvidence = async () => {
    try {
      const response = await fetch('/api/tools/evidence-collection')
      const data = await response.json()
      if (data.success) {
        setEvidence(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load evidence:', err)
    }
  }

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/tools/evidence-collection?pathname=/packages')
      const data = await response.json()
      if (data.success) {
        setPackages(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load packages:', err)
    }
  }

  const handleCollectEvidence = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const evidenceData = {
      controlId: formData.get('controlId'),
      systemId: formData.get('systemId') || crypto.randomUUID(),
      evidenceType: formData.get('evidenceType'),
      description: formData.get('description'),
    }
    try {
      const response = await fetch('/api/tools/evidence-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evidenceData),
      })
      const data = await response.json()
      if (data.success) {
        await loadEvidence()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to collect evidence:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Collect Evidence</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCollectEvidence} submitLabel="Collect Evidence" isLoading={loading}>
            <FormField
              label="Control ID"
              name="controlId"
              type="text"
              placeholder="AC-1"
              required
            />
            <FormField
              label="System ID"
              name="systemId"
              type="text"
              placeholder="Leave blank to generate new"
            />
            <FormField
              label="Evidence Type"
              name="evidenceType"
              type="select"
              required
              options={[
                { value: 'configuration', label: 'Configuration' },
                { value: 'log', label: 'Log' },
                { value: 'documentation', label: 'Documentation' },
                { value: 'screenshot', label: 'Screenshot' },
                { value: 'test-result', label: 'Test Result' },
              ]}
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Describe the evidence..."
              required
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Collected Evidence</h2>
        <DataTable
          data={evidence}
          columns={[
            { key: 'controlId', header: 'Control ID' },
            { key: 'evidenceType', header: 'Type' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'validated' ? 'success' :
                    item.status === 'collected' ? 'warning' :
                    item.status === 'rejected' ? 'error' : 'pending'
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
          ]}
          emptyMessage="No evidence collected yet. Collect your first evidence above."
        />
      </div>

      <div>
        <h2 className="heading-3 mb-4">Evidence Packages</h2>
        <DataTable
          data={packages}
          columns={[
            { key: 'auditType', header: 'Audit Type' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'delivered' ? 'success' :
                    item.status === 'complete' ? 'success' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'evidence',
              header: 'Evidence Count',
              render: (item) => item.evidence?.length || 0,
            },
          ]}
          emptyMessage="No evidence packages found"
        />
      </div>
    </div>
  )
}

