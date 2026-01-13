'use client'

import { useState, useEffect } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import DataTable from '@/components/tools/DataTable'
import StatusBadge from '@/components/tools/StatusBadge'

export default function STIGCompliance() {
  const [validations, setValidations] = useState<any[]>([])
  const [selectedValidation, setSelectedValidation] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadValidations()
  }, [])

  const loadValidations = async () => {
    try {
      const response = await fetch('/api/tools/stig-compliance-validation')
      const data = await response.json()
      if (data.success) {
        setValidations(data.data || [])
      }
    } catch (err) {
      console.error('Failed to load validations:', err)
    }
  }

  const handleValidate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const validationData = {
      systemId: formData.get('systemId') || crypto.randomUUID(),
      stigProfile: formData.get('stigProfile'),
      systemType: formData.get('systemType'),
      validateRemediation: formData.get('validateRemediation') === 'on',
    }
    try {
      const response = await fetch('/api/tools/stig-compliance-validation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validationData),
      })
      const data = await response.json()
      if (data.success) {
        await loadValidations()
        setSelectedValidation(data.data)
        e.currentTarget.reset()
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
        <h2 className="heading-3 mb-4">Validate STIG Compliance</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleValidate} submitLabel="Validate" isLoading={loading}>
            <FormField
              label="STIG Profile"
              name="stigProfile"
              type="text"
              placeholder="rhel9-web"
              required
            />
            <FormField
              label="System Type"
              name="systemType"
              type="select"
              required
              options={[
                { value: 'rhel8', label: 'RHEL 8' },
                { value: 'rhel9', label: 'RHEL 9' },
                { value: 'windows11', label: 'Windows 11' },
                { value: 'windows2022', label: 'Windows Server 2022' },
                { value: 'cisco-ios', label: 'Cisco IOS' },
              ]}
            />
            <FormField
              label="System ID"
              name="systemId"
              type="text"
              placeholder="Leave blank to generate new"
            />
            <FormField
              label="Validate Remediation"
              name="validateRemediation"
              type="checkbox"
              value={true}
            />
          </FormBuilder>
        </div>
      </div>

      <div>
        <h2 className="heading-3 mb-4">Validation Results</h2>
        <DataTable
          data={validations}
          columns={[
            { key: 'stigProfile', header: 'STIG Profile' },
            {
              key: 'status',
              header: 'Status',
              render: (item) => (
                <StatusBadge
                  status={
                    item.status === 'completed' ? 'success' :
                    item.status === 'running' ? 'warning' :
                    item.status === 'failed' ? 'error' : 'pending'
                  }
                >
                  {item.status}
                </StatusBadge>
              ),
            },
            {
              key: 'actions',
              header: 'Actions',
              render: (item) => (
                <button
                  onClick={() => setSelectedValidation(item)}
                  className="text-body-sm text-blue-600 hover:text-blue-800"
                >
                  View Results
                </button>
              ),
            },
          ]}
          emptyMessage="No validations found. Run your first validation above."
        />
      </div>

      {selectedValidation && selectedValidation.results && (
        <div>
          <h2 className="heading-3 mb-4">Validation Details</h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-body-sm text-neutral-600 mb-1">Total Controls</div>
                <div className="text-2xl font-bold">{selectedValidation.results.totalControls}</div>
              </div>
              <div>
                <div className="text-body-sm text-neutral-600 mb-1">Passed</div>
                <div className="text-2xl font-bold text-green-600">{selectedValidation.results.passed}</div>
              </div>
              <div>
                <div className="text-body-sm text-neutral-600 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-600">{selectedValidation.results.failed}</div>
              </div>
              <div>
                <div className="text-body-sm text-neutral-600 mb-1">Compliance</div>
                <div className="text-2xl font-bold">
                  {selectedValidation.results.totalControls > 0
                    ? Math.round((selectedValidation.results.passed / selectedValidation.results.totalControls) * 100)
                    : 0}%
                </div>
              </div>
            </div>
            {selectedValidation.results.controls && selectedValidation.results.controls.length > 0 && (
              <DataTable
                data={selectedValidation.results.controls}
                columns={[
                  { key: 'id', header: 'Control ID' },
                  { key: 'title', header: 'Title' },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (item) => (
                      <StatusBadge
                        status={
                          item.status === 'pass' ? 'success' :
                          item.status === 'fail' ? 'error' :
                          item.status === 'not-applicable' ? 'info' : 'pending'
                        }
                      >
                        {item.status}
                      </StatusBadge>
                    ),
                  },
                  {
                    key: 'severity',
                    header: 'Severity',
                    render: (item) => (
                      <StatusBadge
                        status={
                          item.severity === 'critical' ? 'error' :
                          item.severity === 'high' ? 'error' :
                          item.severity === 'medium' ? 'warning' : 'info'
                        }
                      >
                        {item.severity}
                      </StatusBadge>
                    ),
                  },
                  { key: 'remediation', header: 'Remediation' },
                ]}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

