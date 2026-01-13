'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function SecurityDocumentation() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/tools/security-documentation')
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load documents:', err)
    }
  }

  const handleGenerateDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const documentData = {
      documentType: formData.get('documentType'),
      title: formData.get('title'),
      systemId: formData.get('systemId') || crypto.randomUUID(),
      template: formData.get('template'),
    }
    try {
      const response = await fetch('/api/tools/security-documentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documentData),
      })
      const data = await response.json()
      if (data.success) {
        await loadDocuments()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to generate document:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Generate Security Document</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleGenerateDocument} submitLabel="Generate Document" isLoading={loading}>
            <FormField
              label="Document Type"
              name="documentType"
              type="select"
              required
              options={[
                { value: 'cdrl', label: 'CDRL' },
                { value: 'non-cdrl', label: 'Non-CDRL' },
                { value: 'work-instruction', label: 'Work Instruction' },
                { value: 'integration-plan', label: 'Integration Plan' },
                { value: 'boe', label: 'BOE Document' },
              ]}
            />
            <FormField
              label="Document Title"
              name="title"
              type="text"
              placeholder="System Security Plan"
              required
            />
            <FormField
              label="System ID"
              name="systemId"
              type="text"
              placeholder="Leave blank to generate new"
            />
            <FormField
              label="Template"
              name="template"
              type="text"
              placeholder="Standard template"
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Generated Documents</h2>
        <DataTable
          data={documents}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'documentType', header: 'Type' },
            { key: 'version', header: 'Version' },
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
              key: 'createdAt',
              header: 'Created',
              render: (item) => new Date(item.createdAt).toLocaleDateString(),
            },
          ]}
          emptyMessage="No documents generated yet. Create your first document above."
        />
      </div>
    </div>
  )
}

