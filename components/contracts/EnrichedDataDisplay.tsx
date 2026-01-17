'use client'

interface EnrichmentData {
  enriched_at?: string
  similar_awards_count?: number
  statistics?: {
    count: number
    average_obligation?: number | null
    min_obligation?: number | null
    max_obligation?: number | null
    unique_recipients?: string[]
    unique_agencies?: string[]
  }
  trends?: {
    typical_duration?: string
    spending_over_time?: any[]
  }
  ai_analysis?: {
    analyzed_at?: string
    strategic_insights?: {
      competitive_positioning?: string
      win_probability?: number
      pricing_recommendation?: string
      key_differentiators?: string[]
    }
    competitive_intelligence?: {
      past_winners_analysis?: string
      competitor_patterns?: string[]
    }
  }
}

interface EnrichedDataDisplayProps {
  contractId: string
  enrichmentData?: EnrichmentData | null
}

export default function EnrichedDataDisplay({ contractId, enrichmentData }: EnrichedDataDisplayProps) {
  if (!enrichmentData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">USAspending Enrichment</h3>
        <p className="text-gray-500 text-sm">No enrichment data available. Use the enrichment button to enrich this contract.</p>
      </div>
    )
  }

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = enrichmentData.statistics
  const aiAnalysis = enrichmentData.ai_analysis

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">USAspending Enrichment</h3>
        {enrichmentData.enriched_at && (
          <span className="text-xs text-gray-500">
            Enriched: {new Date(enrichmentData.enriched_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Statistics */}
      {stats && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Historical Award Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Similar Awards</p>
              <p className="text-sm font-semibold">{enrichmentData.similar_awards_count || stats.count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Average Award</p>
              <p className="text-sm font-semibold text-green-600">{formatCurrency(stats.average_obligation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Min Award</p>
              <p className="text-sm font-semibold">{formatCurrency(stats.min_obligation)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Max Award</p>
              <p className="text-sm font-semibold">{formatCurrency(stats.max_obligation)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Past Winners */}
      {stats?.unique_recipients && stats.unique_recipients.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Past Winners</h4>
          <div className="flex flex-wrap gap-2">
            {stats.unique_recipients.slice(0, 10).map((recipient, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {recipient}
              </span>
            ))}
            {stats.unique_recipients.length > 10 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{stats.unique_recipients.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Trends */}
      {enrichmentData.trends?.typical_duration && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Typical Duration</h4>
          <p className="text-sm text-gray-600">{enrichmentData.trends.typical_duration}</p>
        </div>
      )}

      {/* AI Insights Preview */}
      {aiAnalysis?.strategic_insights && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">AI Analysis Preview</h4>
          
          {aiAnalysis.strategic_insights.win_probability !== undefined && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-gray-600">Win Probability</p>
                <p className="text-sm font-semibold">{aiAnalysis.strategic_insights.win_probability}%</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    aiAnalysis.strategic_insights.win_probability >= 70
                      ? 'bg-green-600'
                      : aiAnalysis.strategic_insights.win_probability >= 50
                      ? 'bg-yellow-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${aiAnalysis.strategic_insights.win_probability}%` }}
                />
              </div>
            </div>
          )}

          {aiAnalysis.strategic_insights.pricing_recommendation && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Pricing Recommendation</p>
              <p className="text-sm text-gray-800">{aiAnalysis.strategic_insights.pricing_recommendation}</p>
            </div>
          )}

          {aiAnalysis.strategic_insights.key_differentiators && aiAnalysis.strategic_insights.key_differentiators.length > 0 && (
            <div>
              <p className="text-xs text-gray-600 mb-2">Key Differentiators</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                {aiAnalysis.strategic_insights.key_differentiators.slice(0, 3).map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {aiAnalysis && (
        <div className="pt-2">
          <p className="text-xs text-gray-500">
            Full AI analysis available in contract details view
          </p>
        </div>
      )}
    </div>
  )
}


