/**
 * Agency Behavior Section Component
 * Shell component for agency behavior intelligence
 */

'use client'

interface AgencyBehaviorSectionProps {
  data?: {
    newVendorAcceptanceRate: number | null
    typicalAwardSizeAvg: number | null
    setAsideEnforcementStrength: 'STRICT' | 'MODERATE' | 'WEAK' | null
  }
}

export default function AgencyBehaviorSection({ data }: AgencyBehaviorSectionProps) {
  if (!data) {
    return (
      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Agency Behavior</h3>
        <p className="text-neutral-500 text-sm">Agency behavior data not yet calculated</p>
      </div>
    )
  }

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'N/A'
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const getEnforcementColor = (strength: string | null) => {
    if (!strength) return 'text-neutral-500'
    if (strength === 'STRICT') return 'text-green-600'
    if (strength === 'MODERATE') return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Agency Behavior</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-neutral-600 mb-1">New Vendor Acceptance Rate</div>
          <div className="text-2xl font-bold text-neutral-900">
            {data.newVendorAcceptanceRate !== null
              ? `${Math.round(data.newVendorAcceptanceRate * 100)}%`
              : 'N/A'}
          </div>
          {data.newVendorAcceptanceRate !== null && (
            <div className="text-xs text-neutral-500 mt-1">
              {data.newVendorAcceptanceRate < 0.2
                ? 'Rarely awards to new vendors'
                : data.newVendorAcceptanceRate < 0.4
                ? 'Moderate new vendor acceptance'
                : 'Frequently awards to new vendors'}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm text-neutral-600 mb-1">Typical Award Size</div>
          <div className="text-2xl font-bold text-neutral-900">
            {formatCurrency(data.typicalAwardSizeAvg)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">Average historical award</div>
        </div>

        <div>
          <div className="text-sm text-neutral-600 mb-1">Set-Aside Enforcement</div>
          <div className={`text-2xl font-bold ${getEnforcementColor(data.setAsideEnforcementStrength)}`}>
            {data.setAsideEnforcementStrength || 'N/A'}
          </div>
          {data.setAsideEnforcementStrength && (
            <div className="text-xs text-neutral-500 mt-1">
              {data.setAsideEnforcementStrength === 'STRICT'
                ? 'Strictly enforced'
                : data.setAsideEnforcementStrength === 'MODERATE'
                ? 'Moderately enforced'
                : 'Weak enforcement'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
