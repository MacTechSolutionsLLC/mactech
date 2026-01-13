'use client'

import { useState } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import StatusBadge from '@/components/tools/StatusBadge'

export default function NetworkConfig() {
  const [topology, setTopology] = useState<any>(null)
  const [firewallRules, setFirewallRules] = useState<any[]>([])
  const [validation, setValidation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTopology = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const topologyData = {
      name: formData.get('name'),
      description: formData.get('description'),
      securityZones: (formData.get('securityZones') as string)?.split(',').map(z => z.trim()).filter(Boolean) || [],
    }

    try {
      const response = await fetch('/api/tools/network-config-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topologyData),
      })
      const data = await response.json()
      if (data.success) {
        setTopology(data.data)
      } else {
        setError(data.error || 'Failed to create topology')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create topology')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateFirewallRules = async () => {
    if (!topology?.id) return
    setLoading(true)
    try {
      const response = await fetch('/api/tools/network-config-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topologyId: topology.id }),
      })
      const data = await response.json()
      if (data.success) {
        setFirewallRules(data.data || [])
      }
    } catch (err) {
      console.error('Failed to generate firewall rules:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async () => {
    if (!topology?.id) return
    setLoading(true)
    try {
      const response = await fetch('/api/tools/network-config-automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topologyId: topology.id }),
      })
      const data = await response.json()
      if (data.success) {
        setValidation(data.data)
      }
    } catch (err) {
      console.error('Failed to validate:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Create Network Topology</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleCreateTopology} submitLabel="Create Topology" isLoading={loading}>
            <FormField
              label="Topology Name"
              name="name"
              type="text"
              placeholder="Production Network"
              required
            />
            <FormField
              label="Description"
              name="description"
              type="textarea"
              placeholder="Network topology for production environment"
            />
            <FormField
              label="Security Zones (comma-separated)"
              name="securityZones"
              type="text"
              placeholder="DMZ, Internal, Management"
              required
            />
          </FormBuilder>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      {topology && (
        <>
          <div>
            <h2 className="heading-3 mb-4">Topology Created</h2>
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="space-y-2">
                <div><strong>ID:</strong> {topology.id}</div>
                <div><strong>Name:</strong> {topology.name}</div>
                <div className="flex gap-4 mt-4">
                  <button onClick={handleGenerateFirewallRules} className="btn-primary" disabled={loading}>
                    Generate Firewall Rules
                  </button>
                  <button onClick={handleValidate} className="btn-secondary" disabled={loading}>
                    Validate Compliance
                  </button>
                </div>
              </div>
            </div>
          </div>

          {firewallRules.length > 0 && (
            <div>
              <h2 className="heading-3 mb-4">Generated Firewall Rules</h2>
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <pre className="text-body-sm overflow-x-auto">{JSON.stringify(firewallRules, null, 2)}</pre>
              </div>
            </div>
          )}

          {validation && (
            <div>
              <h2 className="heading-3 mb-4">Compliance Validation</h2>
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <StatusBadge status={validation.compliant ? 'success' : 'error'}>
                  {validation.compliant ? 'Compliant' : 'Non-Compliant'}
                </StatusBadge>
                {validation.issues && validation.issues.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {validation.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="text-body-sm text-neutral-700">• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

