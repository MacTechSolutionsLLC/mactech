'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function LegalDocumentGeneration() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/tools/legal-document-generation')
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
      parties: [
        { name: formData.get('party1Name'), role: formData.get('party1Role') },
        { name: formData.get('party2Name'), role: formData.get('party2Role') },
      ],
    }
    try {
      const response = await fetch('/api/tools/legal-document-generation', {
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
        <h2 className="heading-3 mb-4">Generate Legal Document</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleGenerateDocument} submitLabel="Generate Document" isLoading={loading}>
            <FormField
              label="Document Type"
              name="documentType"
              type="select"
              required
              options={[
                { value: 'nda', label: 'NDA' },
                { value: 'msa', label: 'MSA' },
                { value: 'sow', label: 'SOW' },
                { value: 'license', label: 'License' },
                { value: 'vendor-agreement', label: 'Vendor Agreement' },
                { value: 'corporate-governance', label: 'Corporate Governance' },
              ]}
            />
            <FormField
              label="Document Title"
              name="title"
              type="text"
              placeholder="Non-Disclosure Agreement"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormField
                  label="Party 1 Name"
                  name="party1Name"
                  type="text"
                  required
                />
                <FormField
                  label="Party 1 Role"
                  name="party1Role"
                  type="text"
                  placeholder="Disclosing Party"
                  required
                />
              </div>
              <div>
                <FormField
                  label="Party 2 Name"
                  name="party2Name"
                  type="text"
                  required
                />
                <FormField
                  label="Party 2 Role"
                  name="party2Role"
                  type="text"
                  placeholder="Receiving Party"
                  required
                />
              </div>
            </div>
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
                    item.status === 'signed' ? 'success' :
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

