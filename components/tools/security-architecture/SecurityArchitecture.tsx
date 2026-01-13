'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function SecurityArchitecture() {
  const [baselines, setBaselines] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBaselines()
  }, [])

  const loadBaselines = async () => {
    try {
      const response = await fetch('/api/tools/security-architecture')
      const data = await response.json()
      if (data.success) {
        setBaselines(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load baselines:', err)
    }
  }

  const handleCreateBaseline = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const baselineData = {
      name: formData.get('name'),
      systemType: formData.get('systemType'),
      controls: [
        {
          controlId: formData.get('controlId'),
          title: formData.get('controlTitle'),
          implementation: formData.get('implementation'),
        },
      ],
    }
    try {
      const response = await fetch('/api/tools/security-architecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baselineData),
      })
      const data = await response.json()
      if (data.success) {
        await loadBaselines()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create baseline:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Security Baseline</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateBaseline} submitLabel="Create Baseline" isLoading={loading}>
            <FormField
              label="Baseline Name"
              name="name"
              type="text"
              placeholder="Production Web Server Baseline"
              required
            />
            <FormField
              label="System Type"
              name="systemType"
              type="text"
              placeholder="Web Server"
              required
            />
            <FormField
              label="Control ID"
              name="controlId"
              type="text"
              placeholder="AC-1"
              required
            />
            <FormField
              label="Control Title"
              name="controlTitle"
              type="text"
              placeholder="Access Control Policy"
              required
            />
            <FormField
              label="Implementation"
              name="implementation"
              type="textarea"
              placeholder="Describe the control implementation..."
              required
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Security Baselines</h2>
        <DataTable
          data={baselines}
          columns={[
            { key: 'name', header: 'Name' },
            { key: 'systemType', header: 'System Type' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'active' ? 'success' :
                    item.status === 'archived' ? 'info' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'createdAt',
              header: 'Created',
              render: (item) => new Date(item.createdAt).toLocaleDateString(),
            },
          ]}
          emptyMessage="No baselines found. Create your first baseline above."
        />
      </div>
    </div>
  )
}

