'use client'

import { useState } from 'react'
import { FormBuilder, FormField } from '@/components/tools/FormBuilder'
import StatusBadge from '@/components/tools/StatusBadge'

export default function ContractRiskAnalysis() {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const analysisData = {
      contractId: formData.get('contractId') || crypto.randomUUID(),
      analysisType: formData.get('analysisType') || 'full',
    }
    try {
      const response = await fetch('/api/tools/contract-risk-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      })
      const data = await response.json()
      if (data.success) {
        setAnalysis(data.data)
      } else {
        setError(data.error || 'Failed to analyze contract')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze contract')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="heading-3 mb-4">Analyze Contract Risk</h2>
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <FormBuilder onSubmit={handleAnalyze} submitLabel="Analyze Risk" isLoading={loading}>
            <FormField
              label="Contract ID"
              name="contractId"
              type="text"
              placeholder="Enter contract ID or leave blank for new analysis"
            />
            <FormField
              label="Analysis Type"
              name="analysisType"
              type="select"
              options={[
                { value: 'full', label: 'Full Analysis' },
                { value: 'quick', label: 'Quick Analysis' },
                { value: 'custom', label: 'Custom Analysis' },
              ]}
            />
          </FormBuilder>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}
        </div>
      </div>

      {analysis && (
        <div>
          <h2 className="heading-3 mb-4">Risk Analysis Results</h2>
          <div className="bg-white rounded-lg border border-neutral-200 p-6 space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <div className="text-body-sm text-neutral-600 mb-1">Overall Risk</div>
                  <StatusBadge
                    status={
                      analysis.overallRisk === 'low' ? 'success' :
                      analysis.overallRisk === 'medium' ? 'warning' :
                      analysis.overallRisk === 'high' ? 'error' : 'error'
                    }
                  >
                    {analysis.overallRisk}
                  </StatusBadge>
                </div>
                <div>
                  <div className="text-body-sm text-neutral-600 mb-1">Risk Score</div>
                  <div className="text-2xl font-bold">{analysis.riskScore}%</div>
                </div>
              </div>
            </div>

            {analysis.riskFactors && analysis.riskFactors.length > 0 && (
              <div>
                <h3 className="heading-4 mb-3">Risk Factors</h3>
                <div className="space-y-3">
                  {analysis.riskFactors.map((factor: any, idx: number) => (
                    <div key={idx} className="border border-neutral-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{factor.factor}</div>
                        <StatusBadge
                          status={
                            factor.severity === 'low' ? 'success' :
                            factor.severity === 'medium' ? 'warning' :
                            factor.severity === 'high' ? 'error' : 'error'
                          }
                        >
                          {factor.severity}
                        </StatusBadge>
                      </div>
                      <p className="text-body-sm text-neutral-700 mb-2">{factor.description}</p>
                      <p className="text-body-sm text-neutral-600"><strong>Mitigation:</strong> {factor.mitigation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div>
                <h3 className="heading-4 mb-3">Recommendations</h3>
                <ul className="list-disc list-inside space-y-2">
                  {analysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-body-sm text-neutral-700">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

