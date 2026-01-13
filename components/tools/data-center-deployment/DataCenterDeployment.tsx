'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

interface Deployment {
  id: string
  name: string
  architecture: string
  status: string
  createdAt: string
}

export default function DataCenterDeployment() {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadDeployments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/tools/data-center-deployment')
      const data = await response.json()
      if (data.success) {
        setDeployments(data.data || [])
      } else {
        setError(data.error || 'Failed to load deployments')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deployments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const deploymentData = {
      name: formData.get('name'),
      architecture: formData.get('architecture'),
      storageType: formData.get('storageType'),
      vmwareConfig: {
        hosts: (formData.get('hosts') as string)?.split(',').map(h => h.trim()).filter(Boolean) || [],
      },
      networkConfig: {
        subnets: (formData.get('subnets') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
      },
      compliance: {
        stigProfile: formData.get('stigProfile'),
        validatePreDeploy: formData.get('validatePreDeploy') === 'on',
      },
    }

    try {
      const response = await fetch('/api/tools/data-center-deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deploymentData),
      })
      const data = await response.json()
      if (data.success) {
        await loadDeployments()
        e.currentTarget.reset()
      } else {
        setError(data.error || 'Failed to create deployment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deployment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeployments()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create New Deployment</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleSubmit} submitLabel="Create Deployment" isLoading={loading}>
            <FormField
              label="Deployment Name"
              name="name"
              type="text"
              placeholder="My Data Center Deployment"
              required
            />
            <FormField
              label="Architecture Type"
              name="architecture"
              type="select"
              required
              options={[
                { value: 'web-application', label: 'Web Application Stack' },
                { value: 'database', label: 'Database Infrastructure' },
                { value: 'cloud-environment', label: 'Cloud Environment' },
                { value: 'network-security', label: 'Network Security' },
              ]}
            />
            <FormField
              label="Storage Type"
              name="storageType"
              type="select"
              required
              options={[
                { value: 'VxRail', label: 'VxRail' },
                { value: 'Unity', label: 'Unity' },
                { value: 'XtremIO', label: 'XtremIO' },
                { value: 'VNX', label: 'VNX' },
              ]}
            />
            <FormField
              label="VMware Hosts (comma-separated)"
              name="hosts"
              type="text"
              placeholder="host1.example.com, host2.example.com"
              required
            />
            <FormField
              label="Network Subnets (comma-separated)"
              name="subnets"
              type="text"
              placeholder="192.168.1.0/24, 192.168.2.0/24"
              required
            />
            <FormField
              label="STIG Profile"
              name="stigProfile"
              type="text"
              placeholder="rhel9-web"
              required
            />
            <FormField
              label="Validate Pre-Deployment"
              name="validatePreDeploy"
              type="checkbox"
              value={true}
            />
          </FormBuilder>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-3">Deployments</h2>
          <button onClick={loadDeployments} className="btn-secondary" disabled={loading}>
            Refresh
          </button>
        </div>
        {loading && deployments.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">Loading deployments...</div>
        ) : (
          <DataTable
            data={deployments}
            columns={[
              { key: 'name', header: 'Name' },
              { key: 'architecture', header: 'Architecture' },
              {
                key: 'status',
                header: 'Status',
                render: (item) => (
                  <StatusBadge
                    status={
                      item.status === 'deployed' ? 'success' :
                      item.status === 'failed' ? 'error' :
                      item.status === 'deploying' ? 'warning' : 'pending'
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
            emptyMessage="No deployments found. Create your first deployment above."
          />
        )}
      </div>
    </div>
  )
}

