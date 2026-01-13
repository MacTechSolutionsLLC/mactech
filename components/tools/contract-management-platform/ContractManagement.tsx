'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function ContractManagement() {
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadContracts()
  }, [])

  const loadContracts = async () => {
    try {
      const response = await fetch('/api/tools/contract-management-platform')
      const data = await response.json()
      if (data.success) {
        setContracts(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load contracts:', err)
    }
  }

  const handleCreateContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const contractData = {
      title: formData.get('title'),
      type: formData.get('type'),
      startDate: new Date(formData.get('startDate') as string).toISOString(),
      endDate: formData.get('endDate') ? new Date(formData.get('endDate') as string).toISOString() : undefined,
      value: formData.get('value') ? parseFloat(formData.get('value') as string) : undefined,
      parties: [
        { name: formData.get('party1Name'), role: 'client', contact: formData.get('party1Email') },
        { name: formData.get('party2Name'), role: 'vendor', contact: formData.get('party2Email') },
      ],
    }
    try {
      const response = await fetch('/api/tools/contract-management-platform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      })
      const data = await response.json()
      if (data.success) {
        await loadContracts()
        e.currentTarget.reset()
      }
    } catch (err) {
      console.error('Failed to create contract:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Contract</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateContract} submitLabel="Create Contract" isLoading={loading}>
            <FormField
              label="Contract Title"
              name="title"
              type="text"
              placeholder="Master Services Agreement"
              required
            />
            <FormField
              label="Contract Type"
              name="type"
              type="select"
              required
              options={[
                { value: 'msa', label: 'MSA' },
                { value: 'sow', label: 'SOW' },
                { value: 'nda', label: 'NDA' },
                { value: 'license', label: 'License' },
                { value: 'vendor', label: 'Vendor Agreement' },
                { value: 'subcontractor', label: 'Subcontractor Agreement' },
              ]}
            />
            <FormField
              label="Start Date"
              name="startDate"
              type="date"
              required
            />
            <FormField
              label="End Date"
              name="endDate"
              type="date"
            />
            <FormField
              label="Contract Value"
              name="value"
              type="number"
              placeholder="0.00"
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
                  label="Party 1 Email"
                  name="party1Email"
                  type="email"
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
                  label="Party 2 Email"
                  name="party2Email"
                  type="email"
                  required
                />
              </div>
            </div>
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Contracts</h2>
        <DataTable
          data={contracts}
          columns={[
            { key: 'title', header: 'Title' },
            { key: 'type', header: 'Type' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'active' ? 'success' :
                    item.status === 'expired' || item.status === 'terminated' ? 'error' :
                    item.status === 'negotiating' ? 'warning' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'riskScore',
              header: 'Risk Score',
              render: (item) => item.riskScore ? `${item.riskScore}%` : 'N/A',
            },
            {
              key: 'startDate',
              header: 'Start Date',
              render: (item) => new Date(item.startDate).toLocaleDateString(),
            },
          ]}
          emptyMessage="No contracts found. Create your first contract above."
        />
      </div>
    </div>
  )
}

