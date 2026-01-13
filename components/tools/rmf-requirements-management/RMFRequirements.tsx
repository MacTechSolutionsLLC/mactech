'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function RMFRequirements() {
  const [requirements, setRequirements] = useState<any[]>([])
  const [boePlans, setBoePlans] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadRequirements()
  }, [])

  const loadRequirements = async () => {
    try {
      const response = await fetch('/api/tools/rmf-requirements-management')
      const data = await response.json()
      if (data.success) {
        setRequirements(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load requirements:', err)
    }
  }

  const handleCreateRequirement = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const requirementData = {
      systemId: formData.get('systemId') || crypto.randomUUID(),
      controlId: formData.get('controlId'),
      title: formData.get('title'),
      description: formData.get('description'),
      implementationStatus: formData.get('implementationStatus') || 'not-started',
    }
    try {
      const response = await fetch('/api/tools/rmf-requirements-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requirementData),
      })
      const data = await response.json()
      if (data.success) {
        await loadRequirements()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create requirement:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateBOE = async (requirementId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/tools/rmf-requirements-management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requirementId, pathname: '/boe' }),
      })
      const data = await response.json()
      if (data.success) {
        setBoePlans([...boePlans, ...(data.data || [])])
      }
    } catch (err) {
      console.error('Failed to generate BOE plan:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create RMF Requirement</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateRequirement} submitLabel="Create Requirement" isLoading={loading}>
            <FormField
              label="Control ID"
              name="controlId"
              type="text"
              placeholder="AC-1"
              required
            />
            <FormField
              label="Title"
              name="title"
              type="text"
              placeholder="Access Control Policy and Procedures"
              required
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Describe the requirement..."
              required
            />
            <FormField
              label="Implementation Status"
              name="implementationStatus"
              type="select"
              options={[
                { value: 'not-started', label: 'Not Started' },
                { value: 'in-progress', label: 'In Progress' },
                { value: 'implemented', label: 'Implemented' },
                { value: 'tested', label: 'Tested' },
                { value: 'authorized', label: 'Authorized' },
              ]}
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">RMF Requirements</h2>
        <DataTable
          data={requirements}
          columns={[
            { key: 'controlId', header: 'Control ID' },
            { key: 'title', header: 'Title' },
            {
              key: 'implementationStatus',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.implementationStatus === 'authorized' ? 'success' :
                    item.implementationStatus === 'tested' ? 'success' :
                    item.implementationStatus === 'implemented' ? 'warning' :
                    item.implementationStatus === 'in-progress' ? 'info' : 'pending'
                  }
                >
                  {item.implementationStatus}
                </StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item) => (
                <button
                  onClick={() => handleGenerateBOE(item.id)}
                  className="text-body-sm text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  Generate BOE Plan
                </button>
              ),
            },
          ]}
          emptyMessage="No requirements found. Create your first requirement above."
        />
      </div>

      {boePlans.length > 0 && (
        <div>
          <h2 className="heading-3 mb-4">BOE Plans</h2>
          <DataTable
            data={boePlans}
            columns={[
              { key: 'controlId', header: 'Control ID' },
              { key: 'evidenceType', header: 'Evidence Type' },
              { key: 'evidenceDescription', header: 'Description' },
              { key: 'responsibleParty', header: 'Responsible' },
              {
                key: 'status',
                header: 'Status',
                render: (item) => (
                  <StatusBadge
                    status={
                      item.status === 'approved' ? 'success' :
                      item.status === 'validated' ? 'success' :
                      item.status === 'collected' ? 'warning' : 'pending'
                    }
                  >
                    {item.status}
                  </StatusBadge>
                ),
              },
            ]}
          />
        </div>
      )}
    </div>
  )
}

