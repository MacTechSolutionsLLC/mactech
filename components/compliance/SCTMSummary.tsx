'use client'

interface SummaryStats {
  total: number
  implemented: number
  inherited: number
  partiallySatisfied: number
  notImplemented: number
  notApplicable: number
  readinessPercentage: number
  familyCounts: Record<string, number>
}

interface SCTMSummaryProps {
  summary: SummaryStats
}

const FAMILY_NAMES: Record<string, string> = {
  AC: 'Access Control',
  AT: 'Awareness and Training',
  AU: 'Audit and Accountability',
  CM: 'Configuration Management',
  IA: 'Identification and Authentication',
  IR: 'Incident Response',
  MA: 'Maintenance',
  MP: 'Media Protection',
  PS: 'Personnel Security',
  PE: 'Physical Protection',
  RA: 'Risk Assessment',
  SA: 'Security Assessment',
  SC: 'System and Communications Protection',
  SI: 'System and Information Integrity',
}

export default function SCTMSummary({ summary }: SCTMSummaryProps) {
  const applicableTotal = summary.total - summary.notApplicable

  return (
    <div className="space-y-6">
      {/* Readiness Score */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 mb-1">
              CMMC Level 2 Readiness
            </h2>
            <p className="text-sm text-neutral-600">
              {summary.implemented + summary.inherited} of {applicableTotal} applicable controls satisfied
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-primary-600">
              {summary.readinessPercentage}%
            </div>
            <div className="text-sm text-neutral-600 mt-1">Readiness</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-neutral-200 rounded-full h-3">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${summary.readinessPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="text-sm font-medium text-neutral-600 mb-1">Implemented</div>
          <div className="text-2xl font-bold text-green-600">{summary.implemented}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {Math.round((summary.implemented / summary.total) * 100)}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-neutral-600 mb-1">Inherited</div>
          <div className="text-2xl font-bold text-blue-600">{summary.inherited}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {Math.round((summary.inherited / summary.total) * 100)}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="text-sm font-medium text-neutral-600 mb-1">Not Implemented</div>
          <div className="text-2xl font-bold text-red-600">{summary.notImplemented}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {Math.round((summary.notImplemented / summary.total) * 100)}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-neutral-600 mb-1">Partially Satisfied</div>
          <div className="text-2xl font-bold text-yellow-600">{summary.partiallySatisfied}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {Math.round((summary.partiallySatisfied / summary.total) * 100)}% of total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-neutral-400">
          <div className="text-sm font-medium text-neutral-600 mb-1">Not Applicable</div>
          <div className="text-2xl font-bold text-neutral-600">{summary.notApplicable}</div>
          <div className="text-xs text-neutral-500 mt-1">
            {Math.round((summary.notApplicable / summary.total) * 100)}% of total
          </div>
        </div>
      </div>

      {/* Control Family Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Control Family Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(summary.familyCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([family, count]) => (
              <div
                key={family}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-neutral-900">{family}</div>
                  <div className="text-xs text-neutral-600">
                    {FAMILY_NAMES[family] || family}
                  </div>
                </div>
                <div className="text-xl font-bold text-primary-600">{count}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
