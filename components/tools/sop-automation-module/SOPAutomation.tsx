'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function SOPAutomation() {
  const [sops, setSops] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSOPs()
  }, [])

  const loadSOPs = async () => {
    try {
      const response = await fetch('/api/tools/sop-automation-module')
      const data = await response.json()
      if (data.success) {
        setSops(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load SOPs:', err)
    }
  }

  const handleGenerateSOP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const sopData = {
      title: formData.get('title'),
      requirement: formData.get('requirement'),
      standard: formData.get('standard') || 'iso9001',
      scope: formData.get('scope'),
    }
    try {
      const response = await fetch('/api/tools/sop-automation-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sopData),
      })
      const data = await response.json()
      if (data.success) {
        await loadSOPs()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to generate SOP:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Generate SOP</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleGenerateSOP} submitLabel="Generate SOP" isLoading={loading}>
            <FormField
              label="SOP Title"
              name="title"
              type="text"
              placeholder="Document Control Procedure"
              required
            />
            <FormField
              label="Standard"
              name="standard"
              type="select"
              options={[
                { value: 'iso17025', label: 'ISO 17025' },
                { value: 'iso9001', label: 'ISO 9001' },
                { value: 'custom', label: 'Custom' },
              ]}
            />
            <FormField
              label="Requirement"
              name="requirement"
              type="textarea"
              placeholder="Describe the requirement this SOP addresses"
              required
            />
            <FormField
              label="Scope"
              name="scope"
              type="textarea"
              placeholder="Describe the scope of this SOP"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Generated SOPs</h2>
        <DataTable
          data={sops}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'version', header: 'Version' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'approved' ? 'success' :
                    item.status === 'review' ? 'warning' :
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
          emptyMessage="No SOPs generated yet. Create your first SOP above."
        />
      </div>
    </div>
  )
}

